from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import CraftCluster, ArtisanProfile, Product, User
from app.schemas.schemas import CraftClusterOut

router = APIRouter(prefix="/clusters", tags=["Cluster Intelligence & Craft Map"])

@router.get("", response_model=List[CraftClusterOut])
def get_clusters(
    state: Optional[str] = None,
    craft_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Module H & T: Cluster directory and Craft Map of India data.
    """
    query = db.query(CraftCluster)
    if state:
        query = query.filter(CraftCluster.state.ilike(f"%{state}%"))
    if craft_type:
        query = query.filter(CraftCluster.craft_type.ilike(f"%{craft_type}%"))
    return query.all()

@router.get("/{id}")
def get_cluster_detail(id: int, db: Session = Depends(get_db)):
    cluster = db.query(CraftCluster).filter(CraftCluster.id == id).first()
    if not cluster:
        raise HTTPException(status_code=404, detail="Cluster not found")

    artisans = db.query(ArtisanProfile).filter(ArtisanProfile.cluster_id == cluster.id).all()
    artisan_list = []
    for a in artisans:
        artisan_list.append({
            "id": a.id,
            "name": a.user.full_name if a.user else f"Artisan #{a.id}",
            "craft_name": a.craft_name,
            "monthly_capacity": a.capacity_per_month,
            "rating_avg": a.rating_avg,
            "trust_score": a.trust_score,
            "products_count": len(a.products)
        })

    return {
        "id": cluster.id,
        "cluster_name": cluster.cluster_name,
        "state": cluster.state,
        "district": cluster.district,
        "craft_type": cluster.craft_type,
        "description": cluster.description,
        "total_artisans": cluster.total_artisans,
        "aggregate_monthly_capacity": cluster.aggregate_monthly_capacity,
        "contact_lead": cluster.contact_lead,
        "artisans": artisan_list
    }
