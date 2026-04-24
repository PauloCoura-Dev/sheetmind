import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user
from app.crud.crud_analysis import get_analysis_by_upload
from app.crud.crud_upload import get_upload
from app.database import get_db
from app.models.user import User
from app.schemas.analysis import AnalysisRead

router = APIRouter()


@router.get("/{upload_id}", response_model=AnalysisRead)
async def get_analysis(
    upload_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    upload = await get_upload(db, upload_id)
    if not upload or upload.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Upload não encontrado")

    analysis = await get_analysis_by_upload(db, upload_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Análise ainda não disponível")

    return analysis
