import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel


class AnalysisRead(BaseModel):
    id: uuid.UUID
    upload_id: uuid.UUID
    row_count: int | None
    column_count: int | None
    column_meta: Any | None
    chart_configs: Any | None
    insights: Any | None
    quality_report: Any | None
    created_at: datetime

    model_config = {"from_attributes": True}
