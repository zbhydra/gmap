"""打点类型常量定义"""

import enum
from typing import Final


# 与 mark_logs.mark_msg 的 VARCHAR(1024) 存储契约保持一致，避免截断 JSON。
MAX_MARK_MSG_LENGTH: Final = 1024


class MarkType(str, enum.Enum):
    """打点类型枚举"""

    # 网页行为
    WEB_FIRST_OPENED = "web_first_opened"  # 网页首次访问
    WEB_EXTENSION_STORE_REVIEW_CLICK = (
        "web_extension_store_review_click"  # 网页点击前往插件商店评价
    )
    WEB_EXTENSION_INSTALL_CLICK = "web_extension_install_click"  # 网页点击插件安装
    WEB_CREDIT_PURCHASE_MODAL_OPEN = (
        "web_credit_purchase_modal_open"  # 网页打开积分购买弹窗
    )
    WEB_CREDIT_PURCHASE_BUY_CLICK = (
        "web_credit_purchase_buy_click"  # 网页点击积分购买按钮
    )
