from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import GovernmentScheme, SchemeChecklist, User
from app.schemas.schemas import GovernmentSchemeOut, SchemeChecklistToggle
from app.api.deps import get_current_user, get_optional_user

router = APIRouter(prefix="/schemes", tags=["Government Scheme Navigator"])

@router.get("", response_model=List[GovernmentSchemeOut])
def get_schemes(
    q: Optional[str] = None,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    """
    Module R: Government Scheme discovery with official portals and eligibility screening.
    """
    query = db.query(GovernmentScheme)
    if q:
        query = query.filter(
            (GovernmentScheme.scheme_name_en.ilike(f"%{q}%")) |
            (GovernmentScheme.description_en.ilike(f"%{q}%")) |
            (GovernmentScheme.benefits_summary.ilike(f"%{q}%"))
        )
    schemes = query.all()

    # Get user checklist items if logged in
    user_checklist_map = {}
    if current_user:
        items = db.query(SchemeChecklist).filter(SchemeChecklist.user_id == current_user.id).all()
        for item in items:
            user_checklist_map[(item.scheme_id, item.item_key)] = item.is_completed

    results = []
    for s in schemes:
        default_checklist = [
            {"key": "aadhaar_linked", "label": "Aadhaar linked with mobile number", "completed": user_checklist_map.get((s.id, "aadhaar_linked"), False)},
            {"key": "artisan_pehchan_card", "label": "Valid Artisan Pehchan ID / Craft Card", "completed": user_checklist_map.get((s.id, "artisan_pehchan_card"), False)},
            {"key": "active_bank_account", "label": "Active bank account with DBT enabled", "completed": user_checklist_map.get((s.id, "active_bank_account"), False)},
            {"key": "craft_sample_photos", "label": "Recent photographs of handmade craft items", "completed": user_checklist_map.get((s.id, "craft_sample_photos"), False)}
        ]
        results.append({
            "id": s.id,
            "scheme_name_en": s.scheme_name_en,
            "scheme_name_hi": s.scheme_name_hi,
            "nodal_ministry": s.nodal_ministry,
            "description_en": s.description_en,
            "description_hi": s.description_hi,
            "eligibility_criteria": s.eligibility_criteria,
            "benefits_summary": s.benefits_summary,
            "official_url": s.official_url,
            "last_verified_date": s.last_verified_date,
            "checklist": default_checklist
        })
    return results

@router.post("/checklist")
def toggle_checklist(
    toggle_in: SchemeChecklistToggle,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    item = db.query(SchemeChecklist).filter(
        SchemeChecklist.user_id == current_user.id,
        SchemeChecklist.scheme_id == toggle_in.scheme_id,
        SchemeChecklist.item_key == toggle_in.item_key
    ).first()

    if not item:
        item = SchemeChecklist(
            user_id=current_user.id,
            scheme_id=toggle_in.scheme_id,
            item_key=toggle_in.item_key,
            item_label=toggle_in.item_key.replace("_", " ").title(),
            is_completed=toggle_in.is_completed
        )
        db.add(item)
    else:
        item.is_completed = toggle_in.is_completed

    db.commit()
    return {"success": True, "scheme_id": toggle_in.scheme_id, "is_completed": toggle_in.is_completed}
