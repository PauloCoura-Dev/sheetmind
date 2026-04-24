import os
import uuid

from fastapi import APIRouter, BackgroundTasks, Depends, File, HTTPException, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.core.dependencies import get_current_user
from app.crud.crud_upload import create_upload, delete_upload, get_upload, get_user_uploads
from app.database import get_db
from app.models.user import User
from app.schemas.upload import UploadRead
from app.services.file_service import delete_upload_file, save_upload_file
from app.services.pipeline import process_file

router = APIRouter()

ALLOWED_EXTENSIONS = {".csv", ".xlsx", ".xls"}


@router.post("/", response_model=UploadRead, status_code=201)
async def upload_file(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Formato não suportado. Envie um arquivo .xlsx ou .csv",
        )

    contents = await file.read()
    max_bytes = settings.MAX_FILE_SIZE_MB * 1024 * 1024
    if len(contents) > max_bytes:
        raise HTTPException(
            status_code=400,
            detail=f"Arquivo muito grande. Limite: {settings.MAX_FILE_SIZE_MB}MB",
        )

    stored_filename = save_upload_file(contents, str(current_user.id), ext)

    upload = await create_upload(
        db,
        user_id=current_user.id,
        original_filename=os.path.basename(file.filename or "planilha"),
        stored_filename=stored_filename,
        file_size_bytes=len(contents),
        mime_type=file.content_type or "application/octet-stream",
    )

    background_tasks.add_task(process_file, str(upload.id), str(current_user.id))

    return upload


@router.get("/", response_model=list[UploadRead])
async def list_uploads(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await get_user_uploads(db, current_user.id)


@router.get("/{upload_id}", response_model=UploadRead)
async def get_upload_status(
    upload_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    upload = await get_upload(db, upload_id)
    if not upload or upload.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Upload não encontrado")
    return upload


@router.delete("/{upload_id}", status_code=204)
async def delete_upload_endpoint(
    upload_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    upload = await get_upload(db, upload_id)
    if not upload or upload.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Upload não encontrado")

    delete_upload_file(str(current_user.id), upload.stored_filename)
    await delete_upload(db, upload_id)
