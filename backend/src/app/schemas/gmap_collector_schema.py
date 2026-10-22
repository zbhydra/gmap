"""后台配置入口；连接凭据按管理员运维合同明文保存与回显。"""

from urllib.parse import urlsplit

from pydantic import (
    AnyHttpUrl,
    BaseModel,
    ConfigDict,
    Field,
    TypeAdapter,
    field_validator,
    model_validator,
)

from app.constants.gmap_collector import GMAP_COLLECTOR_MAX_INSTANCES
from app.schemas.admin_schema import GmapProxyList


class GmapCollectorInstance(BaseModel):
    model_config = ConfigDict(
        frozen=True, str_strip_whitespace=True, hide_input_in_errors=True
    )

    url: str
    api_key: str = Field(min_length=1, pattern=r"^[\x21-\x7e]+$", repr=False)

    @field_validator("url")
    @classmethod
    def normalize_url(cls, value: str) -> str:
        normalized = str(TypeAdapter(AnyHttpUrl).validate_python(value))
        parsed = urlsplit(normalized)
        if (
            parsed.username is not None
            or parsed.password is not None
            or parsed.path not in {"", "/"}
            or "?" in normalized
            or "#" in normalized
            or "\\" in value
            or any(char.isspace() for char in value)
            or parsed.port == 0
        ):
            raise ValueError("Collector URL 必须是无凭据、查询或片段的 HTTP(S) 根地址")
        return normalized.rstrip("/")


class GmapCollectorConfig(GmapProxyList):
    """空节点列表停用新采集，不回退其他引擎。"""

    model_config = ConfigDict(frozen=True, hide_input_in_errors=True)

    collectors: list[GmapCollectorInstance] = Field(
        default_factory=list, max_length=GMAP_COLLECTOR_MAX_INSTANCES
    )
    proxies: list[str] = Field(default_factory=list, repr=False)

    @model_validator(mode="after")
    def reject_duplicate_urls(self) -> "GmapCollectorConfig":
        urls = [collector.url for collector in self.collectors]
        if len(set(urls)) != len(urls):
            raise ValueError("Collector URL 不能重复")
        return self
