import uuid
from datetime import datetime

from pydantic import BaseModel


class UploadRead(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    original_filename: str
    file_size_bytes: int | None
    mime_type: str | None
    status: str
    error_message: str | None
    created_at: datetime

    model_config = {"from_attributes": True}
