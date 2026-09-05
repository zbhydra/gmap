"""Online 创建输入与公开任务摘要；内部执行状态不进入响应。"""

from typing import Literal

from pydantic import BaseModel, Field, field_validator

from app.models.maps_online_task_model import MapsOnlineTaskModel


class MapsOnlineCreateRequest(BaseModel):
    keywords: list[str]

    @field_validator("keywords")
    @classmethod
    def normalize_keywords(cls, keywords: list[str]) -> list[str]:
        keywords = list(
            dict.fromkeys(word.strip() for word in keywords if word.strip())
        )
        if not keywords or any(len(word) > 500 for word in keywords):
            raise ValueError("关键词不能为空，且每项不能超过 500 字符")
        return keywords


class MapsOnlineTaskSummary(BaseModel):
    task_no: str
    status: Literal["processing", "completed"]
    total_count: int
    processed_count: int
    record_count: int
    created_at: int

    @classmethod
    def from_task(cls, task: MapsOnlineTaskModel) -> "MapsOnlineTaskSummary":
        return cls(
            task_no=task.task_no,
            status="completed" if task.completed_at else "processing",
            total_count=task.total_count,
            processed_count=task.processed_count,
            record_count=task.record_count,
            created_at=task.created_at,
        )


class MapsOnlineItemSummary(BaseModel):
    item_id: int = Field(validation_alias="id")
    sequence: int
    keyword: str
    record_count: int
