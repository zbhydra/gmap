"""单 Job 单 Run 导出的生命周期与固定预算。"""

from enum import IntEnum

EXPORT_SHARD_COUNT = 10
EXPORT_ITEM_LIMIT = 200
EXPORT_TIMEOUT_SECONDS = 3600


class ExportRunStatus(IntEnum):
    QUEUED = 10
    COLLECTING = 20
    PUBLISHING = 30
    COMPLETED = 40
    PARTIAL = 50
    FAILED = 60


EXPORT_ACTIVE_STATUSES = (
    ExportRunStatus.QUEUED,
    ExportRunStatus.COLLECTING,
    ExportRunStatus.PUBLISHING,
)
EXPORT_PUBLIC_STATUSES = {
    status.value: status.name.lower() for status in ExportRunStatus
}
