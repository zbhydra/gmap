"""打点类型常量定义"""

import enum
from typing import Final


# 与 mark_logs.mark_msg 的 VARCHAR(1024) 存储契约保持一致，避免截断 JSON。
MAX_MARK_MSG_LENGTH: Final = 1024


class MarkType(str, enum.Enum):
    """打点类型枚举"""

    # 网页行为
    WEB_FIRST_OPENED = "web_first_opened"  # 网页首次访问
    WEB_EXTENSION_INSTALL_CLICK = "web_extension_install_click"  # 网页点击插件安装
