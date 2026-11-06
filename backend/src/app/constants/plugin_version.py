"""插件发布记录的归属与客户端检查状态。"""

from enum import StrEnum


class Plugin(StrEnum):
    MAPS = "maps"
    BING = "bing"


class PluginVersionStatus(StrEnum):
    CURRENT = "current"
    UPDATE_AVAILABLE = "update_available"
    DISABLED = "disabled"
