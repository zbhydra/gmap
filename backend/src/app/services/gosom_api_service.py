"""gosom 引擎 API 配置读写服务。

后台系统设置维护多条 gosom API(地址 / Key / 权重),整表存 system_data 单行;
抓取调用方通过 pick() 按权重加权随机取一条使用。
2026-09-01 前的旧存储格式是单对象 {"base_url", "api_key"},读取时迁移为权重 1 的单行。
"""

from __future__ import annotations

import random

from app.constants.gosom import GOSOM_API_DATA_KEY
from app.schemas.admin_schema import GosomApiItem
from app.services.system_data_service import system_data_service


class GosomApiService:
    """gosom 引擎 API 配置读写与加权随机选取。"""

    async def get_items(self) -> list[GosomApiItem]:
        """读取全部 gosom API 配置行；未配置时返回空列表。"""
        value = await system_data_service.get(GOSOM_API_DATA_KEY)
        if isinstance(value, list):
            return [GosomApiItem.model_validate(row) for row in value]
        if isinstance(value, dict):
            # 旧格式单对象读取时迁移为权重 1 的单行;下次保存即写回数组格式
            return [GosomApiItem.model_validate({**value, "weight": 1})]
        return []

    async def save_items(self, items: list[GosomApiItem]) -> list[GosomApiItem]:
        """整表覆盖保存 gosom API 配置；items 为空即清空配置。"""
        await system_data_service.set(
            GOSOM_API_DATA_KEY,
            [item.model_dump() for item in items],
        )
        return items

    async def pick(self) -> GosomApiItem | None:
        """按权重加权随机取一条 gosom API；未配置时返回 None。"""
        items = await self.get_items()
        if not items:
            return None
        return random.choices(items, weights=[item.weight for item in items])[0]

    async def get_by_base_url(self, base_url: str) -> GosomApiItem | None:
        """按已规范化 base_url 定向读取当前 gosom API 配置。"""
        return next(
            (item for item in await self.get_items() if item.base_url == base_url),
            None,
        )


gosom_api_service = GosomApiService()
