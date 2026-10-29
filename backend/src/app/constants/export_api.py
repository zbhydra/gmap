"""API/MCP 调用记录的来源与操作取值；状态沿用 Online `ExportRunStatus`。"""

from enum import IntEnum


class ExportApiSource(IntEnum):
    API = 2
    MCP = 3


class ExportApiOperation(IntEnum):
    SEARCH = 1
    REVIEWS = 2
    PHOTOS = 3
