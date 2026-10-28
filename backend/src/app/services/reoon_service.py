"""system_data.reoon 的唯一配置 owner，并负责 Reoon 余额查询与单邮箱验证调用。"""

import asyncio
import random
from typing import Literal

from httpx import AsyncClient, HTTPError, TimeoutException
from pydantic import BaseModel, TypeAdapter, ValidationError

from app.constants.reoon import (
    REOON_BALANCE_TIMEOUT_SECONDS,
    REOON_BALANCE_URL,
    REOON_DATA_KEY,
    REOON_VERIFY_TIMEOUT_SECONDS,
    REOON_VERIFY_URL,
)
from app.exceptions.common_exception import AppCommonException
from app.i18n.common_code import CommonCode
from app.schemas.reoon_schema import (
    EmailVerifyResult,
    ReoonAccount,
    ReoonBalance,
    ReoonConfig,
)
from app.services.system_data_service import system_data_service
from app.utils.logger import logger


class _ReoonError(BaseModel):
    """Reoon 账号级失败（无效 key、额度耗尽等）的统一响应形态。"""

    status: Literal["error"]
    reason: str = ""


class _ReoonAccountBalance(BaseModel):
    status: Literal["success"]
    api_status: str
    remaining_daily_credits: int
    remaining_instant_credits: int


_VERIFY_RESPONSE: TypeAdapter[_ReoonError | EmailVerifyResult] = TypeAdapter(
    _ReoonError | EmailVerifyResult
)
_BALANCE_RESPONSE: TypeAdapter[_ReoonError | _ReoonAccountBalance] = TypeAdapter(
    _ReoonError | _ReoonAccountBalance
)


class ReoonService:
    async def get_config(self) -> ReoonConfig:
        row = await system_data_service.system_data_info(REOON_DATA_KEY)
        if row is None:
            return ReoonConfig()
        try:
            return ReoonConfig.model_validate(row.data_value)
        except ValidationError:
            raise AppCommonException(
                CommonCode.INTERNAL_SERVER_ERROR,
                ext_msg="reoon_service.get_config: stored reoon config is invalid",
            ) from None

    async def save_config(self, config: ReoonConfig) -> ReoonConfig:
        await system_data_service.set(REOON_DATA_KEY, config.model_dump())
        return config

    async def check_balances(self) -> list[ReoonBalance]:
        """按已保存顺序并发查询；单账号失败只体现在该行 reason。"""
        config = await self.get_config()
        async with AsyncClient(timeout=REOON_BALANCE_TIMEOUT_SECONDS) as client:
            return list(
                await asyncio.gather(
                    *(self._check_balance(client, item) for item in config.accounts)
                )
            )

    async def _check_balance(
        self, client: AsyncClient, account: ReoonAccount
    ) -> ReoonBalance:
        try:
            response = await client.get(
                REOON_BALANCE_URL, params={"key": account.api_key}
            )
            body = _BALANCE_RESPONSE.validate_json(response.content)
        except TimeoutException:
            return ReoonBalance(name=account.name, ok=False, reason="timeout")
        except (HTTPError, ValidationError):
            # 只返回稳定分类，不回显可能含 key 的请求信息或上游正文。
            return ReoonBalance(name=account.name, ok=False, reason="upstream_error")
        if isinstance(body, _ReoonError):
            reason: Literal["unauthorized", "upstream_error"] = (
                "unauthorized" if response.status_code == 401 else "upstream_error"
            )
            return ReoonBalance(name=account.name, ok=False, reason=reason)
        return ReoonBalance(
            name=account.name,
            ok=True,
            api_status=body.api_status,
            daily_credits=body.remaining_daily_credits,
            instant_credits=body.remaining_instant_credits,
        )

    async def verify_email(self, email: str) -> EmailVerifyResult:
        """随机顺序逐个账号做 power 验证。

        只有 Reoon 明确返回 status:"error" 才换账号；超时、网络错误或无法解析时
        上游可能已执行并扣额度，直接失败，避免同一次查询重复扣费。
        """
        config = await self.get_config()
        accounts = random.sample(config.accounts, len(config.accounts))
        async with AsyncClient(timeout=REOON_VERIFY_TIMEOUT_SECONDS) as client:
            for account in accounts:
                try:
                    response = await client.get(
                        REOON_VERIFY_URL,
                        params={
                            "email": email,
                            "key": account.api_key,
                            "mode": "power",
                        },
                    )
                except HTTPError as exc:
                    raise AppCommonException(
                        CommonCode.TOOL_SERVICE_BUSY,
                        ext_msg=(
                            "reoon_service.verify_email: request failed: "
                            f"account={account.name}, error={type(exc).__name__}"
                        ),
                    ) from exc
                try:
                    body = _VERIFY_RESPONSE.validate_json(response.content)
                except ValidationError:
                    raise AppCommonException(
                        CommonCode.TOOL_SERVICE_BUSY,
                        ext_msg=(
                            "reoon_service.verify_email: unparsable response: "
                            f"account={account.name}, http_status={response.status_code}"
                        ),
                    ) from None
                if isinstance(body, EmailVerifyResult):
                    return body
                logger.warning(
                    "reoon_service.verify_email: account returned error, switching: "
                    f"account={account.name}, http_status={response.status_code}, "
                    f"reason={body.reason}"
                )
        raise AppCommonException(
            CommonCode.TOOL_SERVICE_BUSY,
            ext_msg=(
                "reoon_service.verify_email: no usable account: "
                f"account_count={len(accounts)}"
            ),
        )


reoon_service = ReoonService()
