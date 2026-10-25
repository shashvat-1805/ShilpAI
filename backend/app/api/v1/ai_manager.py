from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.schemas import BusinessAssistantQuery, BusinessAssistantResponse
from app.services.ai_manager_service import ai_manager_service
from app.api.deps import require_artisan
from app.models.models import User

router = APIRouter(prefix="/ai-manager", tags=["AI Virtual Business Manager"])

@router.post("/chat", response_model=BusinessAssistantResponse)
def ask_business_manager(
    query_in: BusinessAssistantQuery,
    current_user: User = Depends(require_artisan),
    db: Session = Depends(get_db)
):
    """
    Module E: AI Virtual Business Manager grounded in artisan's actual stored data.
    """
    artisan = current_user.artisan_profile
    if not artisan:
        raise HTTPException(status_code=400, detail="Artisan profile not found")

    result = ai_manager_service.answer_artisan_query(
        db=db,
        artisan_id=artisan.id,
        query_text=query_in.question,
        language=query_in.language
    )
    return result

@router.get("/daily-brief")
def get_daily_brief(
    current_user: User = Depends(require_artisan),
    db: Session = Depends(get_db)
):
    artisan = current_user.artisan_profile
    if not artisan:
        raise HTTPException(status_code=400, detail="Artisan profile not found")

    result = ai_manager_service.answer_artisan_query(
        db=db,
        artisan_id=artisan.id,
        query_text="daily business summary and priorities",
        language=current_user.language_pref or "en"
    )
    return result
