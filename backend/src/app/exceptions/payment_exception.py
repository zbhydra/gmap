"""支付失败的恢复分类，供回调应答与履约补偿使用。"""

from enum import Enum

import httpx
from sqlalchemy.exc import DataError, IntegrityError, OperationalError, ProgrammingError
from sqlalchemy.exc import TimeoutError as DatabaseTimeoutError

from app.exceptions.common_exception import AppCommonException
from app.i18n.common_code import CommonCode


class PaymentFailureCategory(str, Enum):
    """一次支付处理的恢复边界。"""

    RETRYABLE = "retryable"
    NON_RETRYABLE = "non_retryable"
    NO_RETRY = "no_retry"
    UNKNOWN = "unknown"


class PaymentProcessingError(AppCommonException):
    """携带恢复分类的既有支付业务异常，默认用于明确的业务拒绝。"""

    def __init__(
        self,
        message: str,
        *,
        category: PaymentFailureCategory = PaymentFailureCategory.NON_RETRYABLE,
        code: CommonCode = CommonCode.INTERNAL_SERVER_ERROR,
    ) -> None:
        super().__init__(code, ext_msg=f"{message}; category={category.value}")
        self.category = category


def payment_failure_category(exc: BaseException) -> PaymentFailureCategory:
    """未知异常必须核对，不能从 RuntimeError、ValueError 或业务码推断可重试。"""
    if isinstance(exc, PaymentProcessingError):
        return exc.category
    return PaymentFailureCategory.UNKNOWN


def database_failure_category(exc: BaseException) -> PaymentFailureCategory:
    """仅供只读操作或已确认回滚的事务使用；commit 不明不进入此函数。"""
    if isinstance(exc, DatabaseTimeoutError):
        return PaymentFailureCategory.RETRYABLE
    if isinstance(exc, OperationalError) and exc.orig is not None:
        if exc.orig.args and exc.orig.args[0] in {1205, 1213, 2002, 2003, 2006, 2013}:
            return PaymentFailureCategory.RETRYABLE
        if exc.orig.args and exc.orig.args[0] in {1045, 1049}:
            return PaymentFailureCategory.NON_RETRYABLE
    if isinstance(exc, (DataError, IntegrityError, ProgrammingError)):
        return PaymentFailureCategory.NON_RETRYABLE
    return payment_failure_category(exc)


def payment_http_failure_category(
    *,
    status: int | None = None,
    error: httpx.HTTPError | None = None,
    is_write: bool = False,
) -> PaymentFailureCategory:
    """渠道写操作除明确拒绝外均需核对事实，只有只读故障允许直接重试。"""
    if is_write:
        return (
            PaymentFailureCategory.NON_RETRYABLE
            if status in {400, 401, 403}
            else PaymentFailureCategory.UNKNOWN
        )
    if isinstance(
        error, (httpx.TimeoutException, httpx.NetworkError, httpx.RemoteProtocolError)
    ):
        return PaymentFailureCategory.RETRYABLE
    if status in {429, 502, 503, 504}:
        return PaymentFailureCategory.RETRYABLE
    if status in {400, 401, 403, 422}:
        return PaymentFailureCategory.NON_RETRYABLE
    return PaymentFailureCategory.UNKNOWN
