"""按 job_id 分批为十张 Export Job 分表回填关键词检索文本。"""

import asyncio

from sqlalchemy import bindparam, select, update

from app.core.database import close_engine, get_async_session
from app.models.export_job_model import EXPORT_JOB_MODELS
from app.schemas.export_item_schema import GmapSearchOptions


async def backfill_export_keywords() -> dict[str, int]:
    counts: dict[str, int] = {}
    for model in EXPORT_JOB_MODELS:
        after_id = 0
        counts[model.__tablename__] = 0
        while True:
            async with get_async_session() as db:
                rows = (
                    await db.execute(
                        select(model.job_id, model.options_json)
                        .where(model.job_id > after_id)
                        .order_by(model.job_id)
                        .limit(500)
                    )
                ).all()
                if not rows:
                    break
                await db.execute(
                    update(model.__table__)
                    .where(model.job_id == bindparam("backfill_job_id"))
                    .values(keywords_text=bindparam("backfill_keywords_text")),
                    [
                        {
                            "backfill_job_id": job_id,
                            "backfill_keywords_text": "\n".join(
                                GmapSearchOptions.model_validate(options_json).keywords
                            ),
                        }
                        for job_id, options_json in rows
                    ],
                )
                await db.commit()
            counts[model.__tablename__] += len(rows)
            after_id = rows[-1].job_id
    return counts


async def main() -> None:
    try:
        for table, count in (await backfill_export_keywords()).items():
            print(f"{table}: 已回填 {count} 条")
    finally:
        await close_engine()


if __name__ == "__main__":
    asyncio.run(main())
