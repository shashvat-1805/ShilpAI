from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.schemas import PricingCalculateRequest, PriceRecommendationOut
from app.services.pricing_service import pricing_service
from app.models.models import Product, PricingHistory
from app.api.deps import get_current_user

router = APIRouter(prefix="/pricing", tags=["Dynamic Pricing Assistant"])

@router.post("/recommend", response_model=PriceRecommendationOut)
def recommend_price(req: PricingCalculateRequest):
    """
    Module D: Dynamic Pricing recommendation using the exact gross margin formula:
    Selling Price = Total Cost / (1 - Target Gross Margin % / 100)
    """
    rec = pricing_service.calculate_recommendation(
        raw_material_cost=req.raw_material_cost,
        labor_cost=req.labor_cost,
        packaging_cost=req.packaging_cost,
        overhead_cost=req.overhead_cost,
        transport_cost=req.transport_cost,
        target_margin_pct=req.target_margin_pct,
        quantity=req.quantity
    )
    return rec

@router.get("/history/{product_id}")
def get_pricing_history(product_id: int, db: Session = Depends(get_db)):
    history = db.query(PricingHistory).filter(PricingHistory.product_id == product_id).order_by(PricingHistory.created_at.desc()).all()
    return [
        {
            "id": h.id,
            "old_price": h.old_price,
            "new_price": h.new_price,
            "changed_by": h.changed_by,
            "reason": h.reason,
            "created_at": h.created_at
        } for h in history
    ]
