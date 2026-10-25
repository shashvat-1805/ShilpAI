from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.schemas import BuyerMatchRequest, SupplierMatchResult, ProductOut
from app.services.matching_service import matching_service
from app.models.models import Favorite, Product, User, BuyerProfile
from app.api.deps import require_buyer, get_current_user
from app.api.v1.products import _format_product

router = APIRouter(prefix="/buyers", tags=["Buyer Matchmaking & Favorites"])

@router.post("/match", response_model=List[SupplierMatchResult])
def match_suppliers(
    match_req: BuyerMatchRequest,
    db: Session = Depends(get_db)
):
    """
    Module G: Match buyer criteria with artisan capacity, skills, location, and pricing.
    """
    matches = matching_service.match_suppliers(
        db=db,
        category=match_req.category,
        keywords=match_req.keywords or "",
        target_quantity=match_req.target_quantity,
        target_budget=match_req.target_budget,
        state_preference=match_req.state_preference,
        max_lead_time_days=match_req.max_lead_time_days or 30
    )
    return matches

@router.get("/favorites", response_model=List[ProductOut])
def get_favorites(
    current_user: User = Depends(require_buyer),
    db: Session = Depends(get_db)
):
    buyer = current_user.buyer_profile
    if not buyer:
        raise HTTPException(status_code=400, detail="Buyer profile not found")

    favs = db.query(Favorite).filter(Favorite.buyer_id == buyer.id).all()
    products = [f.product for f in favs if f.product]
    return [_format_product(p) for p in products]

@router.post("/favorites/{product_id}")
def toggle_favorite(
    product_id: int,
    current_user: User = Depends(require_buyer),
    db: Session = Depends(get_db)
):
    buyer = current_user.buyer_profile
    if not buyer:
        raise HTTPException(status_code=400, detail="Buyer profile not found")

    existing = db.query(Favorite).filter(
        Favorite.buyer_id == buyer.id,
        Favorite.product_id == product_id
    ).first()

    if existing:
        db.delete(existing)
        db.commit()
        return {"saved": False, "message": "Product removed from favorites"}
    else:
        fav = Favorite(buyer_id=buyer.id, product_id=product_id)
        db.add(fav)
        db.commit()
        return {"saved": True, "message": "Product saved to favorites"}
