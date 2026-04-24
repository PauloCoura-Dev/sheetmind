import uuid

from app.database import AsyncSessionLocal
from app.crud.crud_upload import get_upload, update_upload_status
from app.crud.crud_analysis import create_analysis
from app.services.file_service import get_file_path
from app.services.parser_service import parse_file
from app.services.quality_service import analyze_quality
from app.services.chart_service import generate_charts
from app.services.insight_service import generate_insights


async def process_file(upload_id: str, user_id: str) -> None:
    """Full processing pipeline: parse → quality → charts → insights → save."""
    async with AsyncSessionLocal() as db:
        upload_uuid = uuid.UUID(upload_id)

        try:
            await update_upload_status(db, upload_uuid, "processing")

            upload = await get_upload(db, upload_uuid)
            if not upload:
                return

            file_path = get_file_path(user_id, upload.stored_filename)

            # Step 1: Parse
            df, column_meta = parse_file(file_path)

            # Step 2: Quality
            quality_report = analyze_quality(df, column_meta)

            # Step 3: Charts
            chart_configs = generate_charts(df, column_meta)

            # Step 4: AI Insights
            insights, llm_raw = await generate_insights(column_meta, quality_report, chart_configs)

            # Step 5: Persist
            await create_analysis(
                db,
                upload_id=upload_uuid,
                row_count=len(df),
                column_count=len(df.columns),
                column_meta=column_meta,
                chart_configs=chart_configs,
                insights=insights,
                quality_report=quality_report,
                llm_raw_response=llm_raw,
            )

            await update_upload_status(db, upload_uuid, "completed")

        except Exception as exc:
            await update_upload_status(db, upload_uuid, "failed", error_message=str(exc))
