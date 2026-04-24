import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.analysis import Analysis


async def create_analysis(
    db: AsyncSession,
    upload_id: uuid.UUID,
    row_count: int,
    column_count: int,
    column_meta: list,
    chart_configs: list,
    insights: list,
    quality_report: dict,
    llm_raw_response: str | None = None,
) -> Analysis:
    analysis = Analysis(
        upload_id=upload_id,
        row_count=row_count,
        column_count=column_count,
        column_meta=column_meta,
        chart_configs=chart_configs,
        insights=insights,
        quality_report=quality_report,
        llm_raw_response=llm_raw_response,
    )
    db.add(analysis)
    await db.commit()
    await db.refresh(analysis)
    return analysis


async def get_analysis_by_upload(db: AsyncSession, upload_id: uuid.UUID) -> Analysis | None:
    result = await db.execute(
        select(Analysis).where(Analysis.upload_id == upload_id)
    )
    return result.scalar_one_or_none()
