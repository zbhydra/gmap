"""对象存储系统配置读写服务。"""

from pydantic import ValidationError

from app.constants.object_storage import OBJECT_STORAGE_DATA_KEY
from app.exceptions.common_exception import AppCommonException
from app.i18n.common_code import CommonCode
from app.schemas.admin_schema import ObjectStorageConfig, ObjectStorageConfigRequest
from app.services.system_data_service import system_data_service


class ObjectStorageConfigService:
    """通过 system_data 读写 R2 与阿里云 OSS 配置。"""

    async def get_config(self) -> ObjectStorageConfig:
        """读取对象存储配置；未配置时返回 R2 默认空双块。"""
        value = await system_data_service.get(OBJECT_STORAGE_DATA_KEY)
        if value is None:
            row = await system_data_service.system_data_info(OBJECT_STORAGE_DATA_KEY)
            if row is None:
                return ObjectStorageConfig()
            value = row.data_value
        try:
            stored = ObjectStorageConfigRequest.model_validate(value)
            return ObjectStorageConfig.model_validate(stored.model_dump(by_alias=True))
        except ValidationError:
            raise AppCommonException(
                CommonCode.INTERNAL_SERVER_ERROR,
                ext_msg=(
                    "object_storage_config_service.get_config: stored "
                    "object_storage is invalid"
                ),
            ) from None

    async def save_config(
        self,
        config: ObjectStorageConfigRequest,
    ) -> ObjectStorageConfig:
        """整对象覆盖保存对象存储配置。"""
        value = ObjectStorageConfig.model_validate(config.model_dump(by_alias=True))
        await system_data_service.set(
            OBJECT_STORAGE_DATA_KEY,
            value.model_dump(by_alias=True),
        )
        return value


object_storage_config_service = ObjectStorageConfigService()
