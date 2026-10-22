"""真实 MySQL 配置与 Redis；仅替换 Collector HTTP 出口和自然日边界。"""

import asyncio
from dataclasses import dataclass, field
from datetime import datetime, timedelta

import httpx
import pytest

from app.core.redis import redis_client
from app.i18n.common_code import CommonCode
from app.provider.gmap.collector_client import gmap_collector_client
from app.services.gmap_collector_config_service import gmap_collector_config_service
from app.utils import time as business_time
from app.utils.redis_key import build_redis_key

pytestmark = [pytest.mark.real, pytest.mark.asyncio]


@dataclass
class _CleanupState:
    cache_keys: set[str] = field(default_factory=set)


async def test_real_preview_daily_device_ip_admission_and_redis_fail_open(
    real_mysql_ready: None,
    real_redis_ready: None,
    real_async_client: httpx.AsyncClient,
    test_run_id: str,
    monkeypatch: pytest.MonkeyPatch,
    caplog: pytest.LogCaptureFixture,
) -> None:
    config = await gmap_collector_config_service.get_config()
    if not config.collectors:
        pytest.skip(
            "REAL_COLLECTOR_UNAVAILABLE: 需要已有 Collector 配置以覆盖 HTTP 出口"
        )
    current = datetime(2030, 3, 10, 23, 59, tzinfo=business_time.system_timezone())
    monkeypatch.setattr(business_time, "timestamp_now_datetime", lambda: current)
    redis = await redis_client.get_client()
    state = _CleanupState()
    ip = f"2001:db8:{test_run_id[:4]}:{test_run_id[4:8]}:{test_run_id[8:]}::1"
    other_ip = ip[:-1] + "2"
    device_id = f"preview-{test_run_id}"
    collector_calls = 0

    def key(dimension: str, identifier: str) -> str:
        result = build_redis_key(
            f"maps_online_preview:{dimension}:{identifier}:"
            f"{business_time.get_tomorrow_start_timestamp()}"
        )
        state.cache_keys.add(result)
        return result

    async def preview(device: str, address: str = ip) -> int:
        key("device", device)
        key("ip", address)
        response = await real_async_client.post(
            "/api/client/maps-online/preview",
            headers={"X-Device-Id": device, "X-Forwarded-For": address},
            json={"keyword": "coffee"},
        )
        assert response.status_code == 200, response.text
        return int(response.json()["code"])

    def respond(request: httpx.Request) -> httpx.Response:
        nonlocal collector_calls
        collector_calls += 1
        return httpx.Response(
            200,
            json={"status": "failed" if collector_calls == 1 else "ok", "entries": []},
        )

    try:
        async with httpx.AsyncClient(transport=httpx.MockTransport(respond)) as http:
            monkeypatch.setattr(gmap_collector_client, "_client", http)
            assert await preview(device_id) == CommonCode.INTERNAL_SERVER_ERROR
            assert await preview(device_id) == CommonCode.SUCCESS
            assert await preview(device_id) == CommonCode.SUCCESS
            assert await preview(device_id, other_ip) == CommonCode.RATE_LIMIT_EXCEEDED
            assert collector_calls == 3
            assert await redis.get(key("device", device_id)) == "3"
            assert await redis.get(key("ip", ip)) == "3"
            assert await redis.get(key("ip", other_ip)) is None
            assert await redis.execute_command(
                "PEXPIRETIME", key("device", device_id)
            ) == (business_time.get_tomorrow_start_timestamp())
            assert await redis.execute_command("PEXPIRETIME", key("ip", ip)) == (
                business_time.get_tomorrow_start_timestamp()
            )

            devices = [f"preview-{test_run_id}-{index}" for index in range(35)]
            codes = await asyncio.gather(*(preview(device) for device in devices))
            assert codes.count(CommonCode.SUCCESS) == 27
            assert codes.count(CommonCode.RATE_LIMIT_EXCEEDED) == 8
            assert collector_calls == 30
            assert await redis.get(key("ip", ip)) == "30"
            for device, code in zip(devices, codes):
                assert await redis.get(key("device", device)) == (
                    "1" if code == CommonCode.SUCCESS else None
                )

            current += timedelta(minutes=1)
            assert await preview(device_id) == CommonCode.SUCCESS
            assert collector_calls == 31
            assert await redis.get(key("device", device_id)) == "1"
            assert await redis.get(key("ip", ip)) == "1"

            # 只破坏本轮独占 key，触发真实 Redis 脚本错误，不停用共享服务。
            fault_device = f"preview-fault-{test_run_id}"
            async with redis.pipeline(transaction=True) as pipeline:
                pipeline.lpush(key("device", fault_device), "fault")
                pipeline.pexpireat(
                    key("device", fault_device),
                    business_time.get_tomorrow_start_timestamp(),
                )
                await pipeline.execute()
            assert await preview(fault_device) == CommonCode.SUCCESS
            assert collector_calls == 32
            assert await redis.get(key("ip", ip)) == "1"
            assert any(
                record.message == "maps_online.preview: 每日限流 Redis 执行失败"
                and record.exc_info
                for record in caplog.records
            )
    finally:
        if state.cache_keys:
            await redis.delete(*state.cache_keys)
