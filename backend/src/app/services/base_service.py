"""
数据库操作基类
提供通用的 CRUD 操作模板
"""

from abc import ABC
from typing import Generic, Optional, Type, TypeVar

from sqlalchemy import select

from app.core.database import get_async_session
from app.models.base import BaseDBModel

ModelType = TypeVar("ModelType", bound=BaseDBModel)


class BaseService(ABC, Generic[ModelType]):
    """数据库操作基类"""

    primary_key_field: str = ""  # 子类必须重写此字段

    def __init__(self, model_class: Type[ModelType]) -> None:
        self.model_class = model_class

    async def get_by_id(self, id: int) -> Optional[ModelType]:
        """根据ID获取记录"""
        if not self.primary_key_field:
            raise ValueError(f"{self.__class__.__name__} must define primary_key_field")

        async with get_async_session() as db:
            pk_attr = getattr(self.model_class, self.primary_key_field)
            stmt = select(self.model_class).where(pk_attr == id)
            result = await db.execute(stmt)
            return result.scalar_one_or_none()

    async def get_all(self, offset: int = 0, limit: int = 20) -> list[ModelType]:
        """获取所有记录"""
        async with get_async_session() as db:
            stmt = select(self.model_class).offset(offset).limit(limit)
            result = await db.execute(stmt)
            return list(result.scalars().all())

    async def create(self, instance: ModelType) -> ModelType:
        """保存实例到数据库"""
        async with get_async_session() as db:
            try:
                db.add(instance)
                await db.commit()
                await db.refresh(instance)
                return instance
            except Exception:
                await db.rollback()
                raise

    async def update(self, id: int, **kwargs) -> bool:
        """更新记录"""
        if not self.primary_key_field:
            raise ValueError(f"{self.__class__.__name__} must define primary_key_field")

        async with get_async_session() as db:
            try:
                pk_attr = getattr(self.model_class, self.primary_key_field)
                stmt = select(self.model_class).where(pk_attr == id)
                result = await db.execute(stmt)
                instance = result.scalar_one_or_none()

                if instance:
                    for key, value in kwargs.items():
                        setattr(instance, key, value)
                    await db.commit()
                    return True
                return False
            except Exception:
                await db.rollback()
                raise

    async def delete(self, id: int) -> bool:
        """删除记录"""
        if not self.primary_key_field:
            raise ValueError(f"{self.__class__.__name__} must define primary_key_field")

        async with get_async_session() as db:
            try:
                pk_attr = getattr(self.model_class, self.primary_key_field)
                stmt = select(self.model_class).where(pk_attr == id)
                result = await db.execute(stmt)
                instance = result.scalar_one_or_none()

                if instance:
                    await db.delete(instance)
                    await db.commit()
                    return True
                return False
            except Exception:
                await db.rollback()
                raise

    async def delete_by_id(self, id: int) -> bool:
        """删除记录（别名方法）"""
        return await self.delete(id)
