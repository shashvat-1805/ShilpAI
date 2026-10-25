from fastapi import APIRouter
from app.schemas.schemas import PackagingRecommendationRequest, PackagingRecommendationResponse
from app.services.packaging_service import packaging_service

router = APIRouter(prefix="/packaging", tags=["AI Packaging Assistant"])

@router.post("/recommend", response_model=PackagingRecommendationResponse)
def get_packaging_advice(req: PackagingRecommendationRequest):
    """
    Module P: AI Packaging recommendations based on product fragility, dimensions, and shipping distance.
    """
    advice = packaging_service.get_packaging_advice(
        dimensions=req.dimensions,
        weight_kg=req.weight_kg,
        fragility=req.fragility,
        quantity=req.quantity,
        destination_distance_km=req.destination_distance_km
    )
    return advice
