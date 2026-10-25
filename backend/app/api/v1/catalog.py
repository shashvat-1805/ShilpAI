from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.schemas import (
    VoiceCatalogRequest, CatalogGenerateRequest, CatalogGenerateResponse
)
from app.services.catalog_service import catalog_service
from app.api.deps import require_artisan
from app.models.models import User

router = APIRouter(prefix="/catalog", tags=["Zero-Form Cataloging & Voice"])

@router.post("/from-voice", response_model=CatalogGenerateResponse)
def catalog_from_voice(
    voice_req: VoiceCatalogRequest,
    current_user: User = Depends(require_artisan),
    db: Session = Depends(get_db)
):
    """
    Module B / C: Transforms natural language or spoken voice note into
    a complete, structured, bilingual e-commerce catalog draft.
    """
    if not voice_req.transcript or len(voice_req.transcript.strip()) < 3:
        raise HTTPException(status_code=400, detail="Voice transcript cannot be empty.")

    catalog_data = catalog_service.generate_catalog_from_voice(
        transcript=voice_req.transcript,
        language=voice_req.language,
        category_hint=voice_req.category_hint
    )
    return catalog_data

@router.post("/generate", response_model=CatalogGenerateResponse)
def generate_catalog_copy(
    cat_req: CatalogGenerateRequest,
    current_user: User = Depends(require_artisan)
):
    """
    Module B: Refines and generates rich bilingual titles, descriptions, and tags.
    """
    dummy_voice = f"{cat_req.category} {cat_req.craft_type} made of {cat_req.materials}. {cat_req.artisan_notes or ''}"
    catalog_data = catalog_service.generate_catalog_from_voice(
        transcript=dummy_voice,
        language="en",
        category_hint=cat_req.category
    )
    return catalog_data
