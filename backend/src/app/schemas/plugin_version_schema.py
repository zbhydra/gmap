"""插件版本的输入校验与匿名检查响应。"""

from typing import Annotated

from pydantic import AnyHttpUrl, BaseModel, Field, StringConstraints

from app.constants.plugin_version import Plugin, PluginVersionStatus

PluginVersion = Annotated[
    str,
    StringConstraints(
        strip_whitespace=True,
        max_length=32,
        pattern=r"^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$",
    ),
]
PluginUpdateUrl = Annotated[AnyHttpUrl, Field(max_length=1000)]


class PluginVersionCreate(BaseModel):
    plugin: Plugin
    version: PluginVersion
    is_enabled: bool = True
    update_url: PluginUpdateUrl


class PluginVersionUpdate(BaseModel):
    update_url: PluginUpdateUrl | None = None
    is_enabled: bool | None = None


class PluginVersionCheckQuery(BaseModel):
    plugin: Plugin
    version: PluginVersion


class PluginVersionUpdateTarget(BaseModel):
    version: str
    url: str


class PluginVersionCheckResult(BaseModel):
    status: PluginVersionStatus
    update: PluginVersionUpdateTarget | None = None
