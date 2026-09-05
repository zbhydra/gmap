"""对象存储系统配置读写服务。"""

from pydantic import ValidationError

from app.constants.object_storage import OBJECT_STORAGE_DATA_KEY
from app.exceptions.common_exception import AppCommonException
from app.i18n.common_code import CommonCode
from app.schemas.admin_schema import ObjectStorageConfig, ObjectStorageItem
from app.services.system_data_service import system_data_service


class ObjectStorageConfigService:
    """通过 system_data 读写 R2 与阿里云 OSS 配置。"""

    async def get_config(self) -> ObjectStorageConfig:
        """直接读取单行，启用切换与凭据轮换不等待进程缓存过期。"""
        row = await system_data_service.system_data_info(OBJECT_STORAGE_DATA_KEY)
        if row is None:
            return ObjectStorageConfig(active_id=None, items=[])
        try:
            return ObjectStorageConfig.model_validate(row.data_value)
        except ValidationError:
            raise AppCommonException(
                CommonCode.INTERNAL_SERVER_ERROR,
                ext_msg=(
                    "object_storage_config_service.get_config: "
                    "object_storage 已存配置结构无效"
                ),
            ) from None

    async def save_config(
        self,
        config: ObjectStorageConfig,
    ) -> ObjectStorageConfig:
        """整对象覆盖保存对象存储配置。"""
        await system_data_service.set(
            OBJECT_STORAGE_DATA_KEY,
            config.model_dump(),
        )
        return config

    async def get_item(self, storage_id: str) -> ObjectStorageItem | None:
        config = await self.get_config()
        return next((item for item in config.items if item.id == storage_id), None)

    async def get_active(self) -> ObjectStorageItem | None:
        config = await self.get_config()
        return next(
            (item for item in config.items if item.id == config.active_id), None
        )


object_storage_config_service = ObjectStorageConfigService()
