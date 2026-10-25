from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import MarketingAsset, Product, User
from app.schemas.schemas import MarketingGenerateRequest, MarketingAssetOut
from app.services.marketing_service import marketing_service
from app.api.deps import require_artisan

router = APIRouter(prefix="/marketing", tags=["AI Social Media & Marketing Generator"])

@router.post("/generate", response_model=List[MarketingAssetOut])
def generate_marketing_pack(
    req: MarketingGenerateRequest,
    current_user: User = Depends(require_artisan),
    db: Session = Depends(get_db)
):
    """
    Module L: Generates full social media and marketing campaign pack for the selected product.
    """
    product = db.query(Product).filter(Product.id == req.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    artisan = product.artisan
    artisan_name = artisan.user.full_name if (artisan and artisan.user) else "Artisan"
    region = f"{artisan.district}, {artisan.state}" if artisan else "India"

    pack_items = marketing_service.generate_marketing_pack(
        product_title=product.title_en,
        craft_type=product.craft_type,
        materials=product.materials or "Natural materials",
        price=product.selling_price,
        artisan_name=artisan_name,
        region=region,
        festival_focus=req.festival_focus
    )

    # Clean existing assets for this product and save new
    db.query(MarketingAsset).filter(MarketingAsset.product_id == product.id).delete()
    
    saved_assets = []
    for item in pack_items:
        asset = MarketingAsset(
            product_id=product.id,
            artisan_id=artisan.id,
            asset_type=item["asset_type"],
            content_en=item["content_en"],
            content_hi=item["content_hi"],
            hashtags=item["hashtags"]
        )
        db.add(asset)
        saved_assets.append(asset)

    db.commit()
    for sa in saved_assets:
        db.refresh(sa)
    return saved_assets

@router.get("/product/{product_id}", response_model=List[MarketingAssetOut])
def get_product_marketing(product_id: int, db: Session = Depends(get_db)):
    assets = db.query(MarketingAsset).filter(MarketingAsset.product_id == product_id).all()
    return assets
