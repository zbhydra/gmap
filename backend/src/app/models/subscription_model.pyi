"""类型存根 - UserSubscriptionModel"""

from app.models.base import BaseDBModel

class UserSubscriptionModel(BaseDBModel):
    """用户订阅表类型存根"""

    user_id: int
    product_line: str
    product_id: str
    expires_at: int | None
    created_at: int
    updated_at: int

    def __init__(
        self,
        user_id: int,
        product_line: str = ...,
        product_id: str = ...,
        expires_at: int | None = None,
        created_at: int | None = None,
        updated_at: int | None = None,
    ) -> None: ...
