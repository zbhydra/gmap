#!/usr/bin/env python3
"""
website 真实回归 / Bing 插件真实 e2e 的用户种子脚本。

用途
----
按显式场景准备 e2e 账号业务状态：

- ``pricing-review-reward``：幂等创建独立 Pricing 账号，删除其订阅记录与
  ``SUBSCRIPTION_REVIEW_REWARD_CLAIMED`` lifetime Counter，并从真实 MySQL 回读
  确认账号无有效订阅且永久领取次数为零。
- ``bing-extension-pro``：幂等创建 Bing 插件（016 域）e2e 账号，重置并造
  maps_extension 产品线 Pro 订阅（30 天，回读验证 period=month），再用
  ``user_auth_service.issue_registered_tokens_for_user`` 签发与
  ``/auth/extension-login/exchange`` 完全同构的 access+refresh token 对并注册
  Redis 白名单。插件 e2e 不测登录流程（2026-09-02 hydra 拍板），登录态经本
  脚本签发 token 后由 Playwright 直接注入 ``chrome.storage.local`` 三键。
- ``seed``：按所选场景准备业务状态并签 token，把结果单行 JSON 打到 stdout
  供 Playwright globalSetup 读取。
- ``cleanup``：按场景固定 email 软删用户、删订阅、撤销该用户全部 token、
  删除 Credits 流水与账户，让回归账号不残留脏数据。

设计取舍
--------
- 复用现有 service（``user_service`` / ``subscription_service`` /
  ``user_token_service``）与 ``JwtUnit``，不手插表、不引入依赖注入（遵守项目规范）。
- token 用后端 ``settings.auth.jwt_secret_key`` 签名。**仅签名不够**：
  登录态接口走 ``get_current_user`` → ``check_strict`` →
  ``user_token_service.verify_token``，后者校验 token 的
  md5 是否在 Redis ``access_token:{user_id}`` ZSet 中；故 seed 必须额外
  ``store_token`` 把 token 注册进 Redis，否则登录态接口会 401。
- stdout 只输出最终结果 JSON；日志与诊断走 stderr，避免污染 globalSetup 解析。

流程
----
seed:    确保场景用户存在 → 准备并验证场景状态 → 签 token → store 进 Redis → 打印 JSON
cleanup: 查用户 → 撤销 token → 删订阅 → 删 Credits 状态 → 软删用户
"""

from __future__ import annotations

import argparse
import asyncio
import json
import sys
from dataclasses import dataclass
from enum import Enum
from pathlib import Path

from sqlalchemy import delete

PROJECT_ROOT = Path(__file__).resolve().parents[1]
SRC_DIR = PROJECT_ROOT / "src"
if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))

from app.constants.auth import TokenType  # noqa: E402
from app.constants.client_product import ClientProductEnum  # noqa: E402
from app.constants.counter import CounterId  # noqa: E402
from app.constants.subscription import (  # noqa: E402
    MAPS_EXTENSION_PRO_PRODUCT_ID,
    MAPS_EXTENSION_PRODUCT_LINE,
    SubscriptionPeriodEnum,
)
from app.core.database import (  # noqa: E402
    check_db_connection,
    close_engine,
    get_async_session,
)
from app.models.counter_user_lifetime_model import (  # noqa: E402
    CounterUserLifetimeModel,
)
from app.models.subscription_model import UserSubscriptionModel  # noqa: E402
from app.models.user_credit_account_model import UserCreditAccountModel  # noqa: E402
from app.models.user_credit_log_model import UserCreditLogModel  # noqa: E402
from app.services.counter_service import counter_service  # noqa: E402
from app.services.subscription_service import subscription_service  # noqa: E402
from app.services.user_auth_service import user_auth_service  # noqa: E402
from app.services.user_service import user_service  # noqa: E402
from app.services.user_token_service import user_token_service  # noqa: E402
from app.utils.jwt import JwtData, JwtUnit  # noqa: E402


class SeedScenario(str, Enum):
    """可由真实 smoke 显式选择的用户业务状态。"""

    PRICING_REVIEW_REWARD = "pricing-review-reward"
    BING_EXTENSION_PRO = "bing-extension-pro"


@dataclass(frozen=True, slots=True)
class SeedScenarioConfig:
    """一个 seed 场景的独立账号身份。"""

    email: str
    password: str
    full_name: str


# 每个真实 smoke 使用独立固定账号，既保证单场景幂等，也避免不同 smoke 互相改状态。
# .test 顶级域不会真实存在，避免误发邮件或撞上真实用户。
SEED_SCENARIO_CONFIGS: dict[SeedScenario, SeedScenarioConfig] = {
    SeedScenario.PRICING_REVIEW_REWARD: SeedScenarioConfig(
        email="e2e-pricing-review-reward-smoke@telegramdownloadmedia.test",
        password="E2ePricingReviewRewardSmoke!2026",
        full_name="E2E Pricing Review Reward Smoke",
    ),
    SeedScenario.BING_EXTENSION_PRO: SeedScenarioConfig(
        email="e2e-bing-extension-pro@mapsgrab.test",
        password="E2eBingExtensionProSmoke!2026",
        full_name="E2E Bing Extension Pro",
    ),
}
# 注入前端 localStorage 的 device_id；需同时满足前端当前 UUID 校验与后端请求校验。
E2E_DEVICE_ID = "123e4567-e89b-42d3-a456-426614174000"


async def _ensure_user_id(config: SeedScenarioConfig) -> int:
    """确保 e2e 用户存在且处于激活态并返回 user_id。

    幂等要点：cleanup 是软删（is_del=True），故复用已存在用户时若其处于软删态
    必须重新激活，否则 seed 出的账号会带 is_del=True，登录态校验/查询会异常。
    """

    existing = await user_service.get_user_by_email(config.email)
    if existing is not None:
        if existing.is_del:
            await user_service.update(existing.user_id, is_del=False)
        return existing.user_id

    created = await user_service.create_user(
        email=config.email,
        password=config.password,
        full_name=config.full_name,
        register_source=ClientProductEnum.WEB,
    )
    return created.user_id


async def _seed(scenario: SeedScenario) -> dict[str, object]:
    """按场景准备账号状态并签 token，返回供前端注入的上下文。"""

    config = SEED_SCENARIO_CONFIGS[scenario]
    user_id = await _ensure_user_id(config)

    if scenario == SeedScenario.BING_EXTENSION_PRO:
        return await _seed_bing_extension_pro(config, user_id)

    if scenario == SeedScenario.PRICING_REVIEW_REWARD:
        await _seed_pricing_review_reward_state(user_id)

    token, expire = JwtUnit.create_access_token(
        JwtData(user_id=user_id, email=config.email),
    )

    # 关键：仅签名不够。登录态接口走 get_current_user，check_strict() 会校验
    # token md5 是否在 Redis access_token:{user_id} ZSet 中；
    # 不 store 则登录态接口 401。expire 为 Unix 秒级过期戳，作为 ZSet score。
    await user_token_service.store_token(
        token,
        user_id,
        TokenType.USER_ACCESS,
        expire,
    )

    return {
        "token": token,
        "user_id": user_id,
        "email": config.email,
        "device_id": E2E_DEVICE_ID,
        "scenario": scenario.value,
    }


async def _seed_bing_extension_pro(
    config: SeedScenarioConfig,
    user_id: int,
) -> dict[str, object]:
    """造 maps_extension Pro 订阅并签发与插件 exchange 同构的 token 对。"""

    await _delete_maps_extension_subscription(user_id)
    await subscription_service.extend_subscription_days(
        user_id=user_id,
        duration_days=30,
        product_line=MAPS_EXTENSION_PRODUCT_LINE,
        product_id=MAPS_EXTENSION_PRO_PRODUCT_ID,
    )

    # 回读验证：商品配置缺失（未跑 seed_subscription_products.py）会让
    # subscription_status 返回 unavailable、插件 PRO 判定失效，必须在此快速失败。
    _, product_config = await subscription_service.get_user_subscription_config(
        user_id, MAPS_EXTENSION_PRODUCT_LINE
    )
    if product_config.period != SubscriptionPeriodEnum.MONTH.value:
        raise RuntimeError(
            "e2e_seed_user bing-extension-pro verification failed: "
            f"user_id={user_id}, product_id={product_config.product_id}, "
            f"period={product_config.period} (expect month)"
        )

    user = await user_service.get_user_by_email(config.email)
    if user is None:
        raise RuntimeError(
            f"e2e_seed_user bing-extension-pro: user missing after ensure: {config.email}"
        )

    # 与 /auth/extension-login/exchange 同一条签发链（access+refresh 均注册
    # Redis 白名单），插件端 auth/me 与 subscription/status 走真实校验。
    bundle = await user_auth_service.issue_registered_tokens_for_user(
        user,
        operation="e2e_seed_bing_extension_pro",
    )
    user_info = await user_service.build_client_user_info(user)

    return {
        "token": bundle.access_token,
        "refresh_token": bundle.refresh_token,
        "expires_in": bundle.expires_in,
        "user_id": user_id,
        "email": config.email,
        "user": user_info.model_dump(),
        "scenario": SeedScenario.BING_EXTENSION_PRO.value,
    }


async def _delete_maps_extension_subscription(user_id: int) -> None:
    """删除 e2e 账号的 maps_extension 订阅行。

    extend 是按天累加的 upsert，先删行保证重复 seed 状态确定；订阅表为
    (user_id, product_line) 复合主键，不能走 BaseService 按单主键删除。
    """

    async with get_async_session() as db:
        await db.execute(
            delete(UserSubscriptionModel).where(
                UserSubscriptionModel.user_id == user_id,  # type: ignore[arg-type]
                UserSubscriptionModel.product_line == MAPS_EXTENSION_PRODUCT_LINE,
            )
        )
        await db.commit()


async def _seed_pricing_review_reward_state(user_id: int) -> None:
    """清空 Pricing 好评领取前置状态，并从真实 MySQL 回读验证。"""

    review_reward_counter_id = int(CounterId.SUBSCRIPTION_REVIEW_REWARD_CLAIMED)
    async with get_async_session() as db:
        await db.execute(
            delete(UserSubscriptionModel).where(
                UserSubscriptionModel.user_id == user_id  # type: ignore[arg-type]
            )
        )
        await db.execute(
            delete(CounterUserLifetimeModel).where(
                CounterUserLifetimeModel.user_id == user_id,
                CounterUserLifetimeModel.counter_id == review_reward_counter_id,
            )
        )
        await db.commit()

    subscription = await subscription_service.get_user_subscription(user_id)
    claimed_count = await counter_service.get(user_id, review_reward_counter_id)
    if subscription.expires_at is not None or claimed_count != 0:
        raise RuntimeError(
            "e2e_seed_user pricing-review-reward verification failed: "
            f"user_id={user_id}, expires_at={subscription.expires_at}, "
            f"review_reward_claimed_count={claimed_count}"
        )


async def _reset_credit_data(user_id: int) -> None:
    """删除固定 e2e 用户的 Credits 状态，保证每轮真实 smoke 独立。"""

    async with get_async_session() as db:
        await db.execute(
            delete(UserCreditLogModel).where(UserCreditLogModel.user_id == user_id)
        )
        await db.execute(
            delete(UserCreditAccountModel).where(
                UserCreditAccountModel.user_id == user_id
            )
        )
        await db.commit()


async def _delete_review_reward_counter(user_id: int) -> None:
    """删除 Pricing 场景账号的好评赠送永久 Counter。"""

    async with get_async_session() as db:
        await db.execute(
            delete(CounterUserLifetimeModel).where(
                CounterUserLifetimeModel.user_id == user_id,
                CounterUserLifetimeModel.counter_id
                == int(CounterId.SUBSCRIPTION_REVIEW_REWARD_CLAIMED),
            )
        )
        await db.commit()


async def _cleanup(scenario: SeedScenario) -> dict[str, object]:
    """软删 e2e 用户 + 删订阅 + 删 Credits 状态；不存在则视为已干净。"""

    config = SEED_SCENARIO_CONFIGS[scenario]
    existing = await user_service.get_user_by_email(config.email)
    if existing is None:
        return {
            "cleaned": False,
            "reason": "user_not_found",
            "email": config.email,
            "scenario": scenario.value,
        }

    user_id = existing.user_id

    # 先撤销 token，删订阅，删 Credits 状态，最后软删用户。
    await user_token_service.revoke_all_user_tokens(user_id)
    await subscription_service.delete(user_id)
    if scenario == SeedScenario.PRICING_REVIEW_REWARD:
        await _delete_review_reward_counter(user_id)
    if scenario == SeedScenario.BING_EXTENSION_PRO:
        await _delete_maps_extension_subscription(user_id)
    await _reset_credit_data(user_id)
    await user_service.update(user_id, is_del=True)

    return {
        "cleaned": True,
        "user_id": user_id,
        "email": config.email,
        "scenario": scenario.value,
    }


def _parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Website 真实回归用户种子脚本（seed / cleanup）",
    )
    parser.add_argument(
        "--action",
        choices=["seed", "cleanup"],
        default="seed",
        help="seed：按场景准备账号并签 token（默认）；cleanup：清理场景账号状态",
    )
    parser.add_argument(
        "--scenario",
        choices=[scenario.value for scenario in SeedScenario],
        default=SeedScenario.PRICING_REVIEW_REWARD.value,
        help="账号场景；默认 pricing-review-reward",
    )
    return parser.parse_args()


async def _run(action: str, scenario: SeedScenario) -> dict[str, object]:
    if not await check_db_connection():
        raise RuntimeError(
            "e2e_seed_user: 数据库不可用，无法 seed/cleanup。"
            "请确认本地 MySQL 已启动且 backend/config.yaml 配置正确。"
        )

    try:
        if action == "seed":
            return await _seed(scenario)
        return await _cleanup(scenario)
    finally:
        await close_engine()


def main() -> None:
    args = _parse_args()
    try:
        result = asyncio.run(_run(args.action, SeedScenario(args.scenario)))
    except Exception as exc:  # noqa: BLE001
        # 失败详情走 stderr，stdout 只承载成功 JSON，便于上游精确解析。
        print(f"e2e_seed_user failed: {exc}", file=sys.stderr)
        sys.exit(1)

    # 单行 JSON：Playwright globalSetup 取最后一行 parse。
    print(json.dumps(result, ensure_ascii=False))


if __name__ == "__main__":
    main()
