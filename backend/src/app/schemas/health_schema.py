"""健康检查接口响应 Pydantic 模型。"""

from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    """验证码响应"""

    msg: str = Field(..., description="消息")
