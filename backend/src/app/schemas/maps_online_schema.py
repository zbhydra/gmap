"""公开预览关键词入口。"""

from pydantic import BaseModel, field_validator


class MapsOnlinePreviewRequest(BaseModel):
    keyword: str

    @field_validator("keyword")
    @classmethod
    def normalize_keyword(cls, keyword: str) -> str:
        keyword = keyword.strip()
        if not 1 <= len(keyword) <= 500 or len(keyword.splitlines()) != 1:
            raise ValueError("关键词须为 1–500 字符的单行文本")
        return keyword
