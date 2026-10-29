"""API/MCP 调用记录短事务；有效结果的终态与原用量账本同事务提交。"""

from sqlalchemy import update

from app.constants.export import ExportRunStatus
from app.constants.export_api import ExportApiOperation, ExportApiSource
from app.core.database import get_async_session
from app.models.export_api_job_model import ExportApiJobModel
from app.schemas.export_api_job_schema import ExportApiJobSummary
from app.schemas.maps_api_schema import (
    MapsPhotosRequest,
    MapsReviewsRequest,
    MapsSearchRequest,
)
from app.services.usage_service import api_usage_service
from app.utils.time import timestamp_now


class ExportApiJobService:
    async def create_job(
        self,
        *,
        user_id: int,
        source: ExportApiSource,
        operation: ExportApiOperation,
        params: MapsSearchRequest | MapsReviewsRequest | MapsPhotosRequest,
    ) -> ExportApiJobModel:
        model = ExportApiJobModel.model_for_user(user_id)
        job = model(  # type: ignore[call-arg]
            request_id=ExportApiJobModel.generate_no(user_id),
            user_id=user_id,
            source=source.value,
            operation=operation.value,
            status=ExportRunStatus.COLLECTING.value,
            # 请求模型只含校验后的业务字段，凭证与原始报文不会进入记录。
            params_json=params.model_dump(mode="json"),
        )
        async with get_async_session() as db:
            db.add(job)
            await db.commit()
        return job

    async def complete_job(
        self,
        job: ExportApiJobModel,
        *,
        status: ExportRunStatus,
        summary: ExportApiJobSummary,
    ) -> None:
        """终态、摘要与一次请求用量同事务提交；回滚时记录留在处理中。"""
        model = ExportApiJobModel.model_for_user(job.user_id)
        async with get_async_session() as db:
            await db.execute(
                update(model)
                .where(model.id == job.id)
                .values(
                    status=status.value,
                    summary_json=summary.model_dump(mode="json"),
                    finished_at=timestamp_now(),
                )
            )
            await api_usage_service.consume_in_session(
                db, user_id=job.user_id, records=1, request_id=job.request_id
            )
            await db.commit()

    async def fail_job(self, job: ExportApiJobModel, *, error_code: int) -> None:
        model = ExportApiJobModel.model_for_user(job.user_id)
        async with get_async_session() as db:
            await db.execute(
                update(model)
                .where(model.id == job.id)
                .values(
                    status=ExportRunStatus.FAILED.value,
                    error_code=error_code,
                    finished_at=timestamp_now(),
                )
            )
            await db.commit()


export_api_job_service = ExportApiJobService()
