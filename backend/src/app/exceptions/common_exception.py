"""业务异常定义：携带错误码、响应数据与 HTTP 状态供中间件统一响应。"""

from app.i18n.common_code import CommonCode


class AppCommonException(Exception):
    """通用业务异常。

    Attributes:
        code: 错误码枚举
        ext_msg: 附加描述信息
        data: 结构化附加数据，用于携带 wait_seconds、active_request_count 等信息。
              None 表示无附加数据（响应体中 data 字段为空对象）。
    """

    code: CommonCode
    ext_msg: str
    data: dict | None
    status_code: int | None

    def __init__(
        self,
        code: CommonCode,
        ext_msg: str = "",
        *,
        data: dict | None = None,
        status_code: int | None = None,
    ) -> None:
        """
        Args:
            code: 错误码枚举
            ext_msg: 附加描述信息（默认空字符串）
            data: keyword-only 参数，结构化附加数据（默认 None）
            status_code: 可选 HTTP 状态码；业务码不等于 HTTP 状态时显式指定。
        """
        self.code = code
        self.ext_msg = ext_msg
        self.data = data
        self.status_code = status_code
        super().__init__(ext_msg)
