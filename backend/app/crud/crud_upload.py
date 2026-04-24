import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.upload import Upload


async def create_upload(
    db: AsyncSession,
    user_id: uuid.UUID,
    original_filename: str,
    stored_filename: str,
    file_size_bytes: int,
    mime_type: str,
) -> Upload:
    upload = Upload(
        user_id=user_id,
        original_filename=original_filename,
        stored_filename=stored_filename,
        file_size_bytes=file_size_bytes,
        mime_type=mime_type,
        status="pending",
    )
    db.add(upload)
    await db.commit()
    await db.refresh(upload)
    return upload


async def get_upload(db: AsyncSession, upload_id: uuid.UUID) -> Upload | None:
    result = await db.execute(select(Upload).where(Upload.id == upload_id))
    return result.scalar_one_or_none()


async def get_user_uploads(db: AsyncSession, user_id: uuid.UUID) -> list[Upload]:
    result = await db.execute(
        select(Upload)
        .where(Upload.user_id == user_id)
        .order_by(Upload.created_at.desc())
    )
    return list(result.scalars().all())


async def update_upload_status(
    db: AsyncSession,
    upload_id: uuid.UUID,
    status: str,
    error_message: str | None = None,
) -> Upload | None:
    upload = await get_upload(db, upload_id)
    if upload:
        upload.status = status
        if error_message is not None:
            upload.error_message = error_message
        await db.commit()
        await db.refresh(upload)
    return upload


async def delete_upload(db: AsyncSession, upload_id: uuid.UUID) -> bool:
    upload = await get_upload(db, upload_id)
    if upload:
        await db.delete(upload)
        await db.commit()
        return True
    return False
