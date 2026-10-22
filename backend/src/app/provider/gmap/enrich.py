"""CAS 官网补全的完整 URL 缓存与 Collector 合并；插件直连链路独立。"""

import hashlib
import random
from dataclasses import replace
from urllib.parse import urlsplit

from pydantic import BaseModel, Field
from contact_scraper import classify_social_url

from app.constants.gmap_collector import GMAP_COLLECTOR_RESPONSE_GRACE_SECONDS
from app.core.redis import redis_client
from app.provider.gmap.collector_client import (
    GmapCollectorError,
    gmap_collector_client,
    parse_contacts_response,
)
from app.provider.gmap.types import GmapSearchResult, CollectorSiteContacts
from app.schemas.gmap_collector_schema import GmapCollectorConfig
from app.utils.logger import logger
from app.utils.redis_key import build_redis_key

_CACHE_TTL_SECONDS = 7 * 24 * 60 * 60


class _SiteContacts(BaseModel):
    emails: list[str] = Field(default_factory=list)
    medias: dict[str, str] = Field(default_factory=dict)


async def _read_cache(key: str) -> _SiteContacts | None:
    # 缓存仅节省采集，Redis 故障按未命中处理。
    try:
        redis = await redis_client.get_client()
        raw = await redis.get(key)
        return _SiteContacts.model_validate_json(raw) if raw else None
    except Exception:
        logger.error("gmap.enrich: 缓存读取失败 key=%s", key, exc_info=True)
        return None


async def _write_cache(key: str, contacts: _SiteContacts) -> None:
    try:
        redis = await redis_client.get_client()
        await redis.set(key, contacts.model_dump_json(), ex=_CACHE_TTL_SECONDS)
    except Exception:
        logger.error("gmap.enrich: 缓存写入失败 key=%s", key, exc_info=True)


def _collector_site_url(raw: str) -> tuple[str, str]:
    """生成 Collector 要求的完整规范 URL 与小写主机名。"""

    value = raw.strip()
    if "\\" in value:
        raise ValueError("gmap 官网 URL 非法")
    if value.endswith("↗"):
        value = value[:-1].rstrip()
    elif value.lower().endswith("%e2%86%97"):
        value = value[:-9]
    if "://" not in value:
        value = f"https://{value}"
    parts = urlsplit(value)
    raw_host = parts.hostname
    host = (raw_host or "").lower().rstrip(".")
    if (
        parts.scheme.lower() not in {"http", "https"}
        or not host
        or parts.username is not None
        or parts.password is not None
    ):
        raise ValueError("gmap 官网 URL 非法")
    try:
        port = parts.port
    except ValueError:
        raise ValueError("gmap 官网 URL 非法") from None
    if ":" in host and not host.startswith("["):
        host = f"[{host}]"
    default_port = 443 if parts.scheme.lower() == "https" else 80
    netloc = host if port in (None, default_port) else f"{host}:{port}"
    assert raw_host is not None
    return f"{parts.scheme.lower()}://{netloc}{parts.path}", raw_host.lower().rstrip(
        "."
    )


def _collector_cache_key(cache_key: str) -> str:
    """Collector 使用完整 URL 作为逻辑 key，Redis 仍只保存脱敏 hash。"""

    return build_redis_key(
        f"gmap:contacts:{hashlib.sha256(cache_key.encode()).hexdigest()}"
    )


async def enrich_places(
    result: GmapSearchResult,
    *,
    config: GmapCollectorConfig,
    job_no: str,
    item_index: int,
    deadline: float,
    run_no: str | None = None,
) -> GmapSearchResult:
    entries = list(result.entries)
    groups: dict[str, list[int]] = {}
    contacts: dict[str, CollectorSiteContacts] | None = None
    try:
        # 恢复先查询旧调用；缓存变化不能更换已提交补全的输入和任务 ID。
        if run_no is not None:
            restored = await gmap_collector_client.resume_run_task(
                config,
                job_no=job_no,
                run_no=run_no,
                item_index=item_index,
                operation="enrich_sites",
                deadline=deadline + GMAP_COLLECTOR_RESPONSE_GRACE_SECONDS,
            )
            if restored is not None:
                contacts = parse_contacts_response(restored)
        for index, entry in enumerate(entries):
            if not entry.website:
                continue
            try:
                cache_key, _ = _collector_site_url(entry.website)
            except ValueError:
                logger.error(
                    "gmap.enrich: 官网 URL 无效 job_no=%s item=%s fid=%s",
                    job_no,
                    item_index,
                    entry.fid,
                    exc_info=True,
                )
                continue
            social = classify_social_url(cache_key)
            if social:
                entries[index] = replace(entry, medias={**social, **entry.medias})
                continue
            if contacts is None:
                cached = await _read_cache(_collector_cache_key(cache_key))
                if cached is not None:
                    entries[index] = replace(
                        entry,
                        emails=list(dict.fromkeys([*entry.emails, *cached.emails])),
                        medias={**cached.medias, **entry.medias},
                    )
                    continue
            groups.setdefault(cache_key, []).append(index)
        if contacts is None and groups:
            if not config.proxies:
                raise GmapCollectorError("no_proxy")
            contacts = await gmap_collector_client.enrich_sites(
                config,
                job_no=job_no,
                run_no=run_no,
                item_index=item_index,
                deadline=deadline,
                sites=list(groups),
                proxy=random.choice(config.proxies),
            )
        for key, indexes in groups.items():
            site = (contacts or {}).get(key)
            if site is None:
                continue
            await _write_cache(
                _collector_cache_key(key),
                _SiteContacts(emails=site.emails, medias=site.medias),
            )
            for index in indexes:
                entry = entries[index]
                entries[index] = replace(
                    entry,
                    emails=list(dict.fromkeys([*entry.emails, *site.emails])),
                    medias={**site.medias, **entry.medias},
                )
    except Exception:
        # 补全失败只丢可选字段，已经取得的基础行仍交付；取消继续向上传播。
        logger.error(
            "gmap.enrich: 补全失败 job_no=%s item=%s", job_no, item_index, exc_info=True
        )
        return GmapSearchResult(
            entries, True, [*result.warnings, "contacts_unavailable"]
        )
    return GmapSearchResult(entries, result.partial, result.warnings)
