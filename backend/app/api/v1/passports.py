from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import CraftPassport, Product, ArtisanProfile, User
from app.schemas.schemas import CraftPassportOut, PublicCraftPassportOut

router = APIRouter(prefix="/craft-passport", tags=["Digital Craft Passport"])

@router.get("/public/{public_code}", response_model=PublicCraftPassportOut)
def get_public_passport(public_code: str, db: Session = Depends(get_db)):
    """
    Module J: Public QR-linked Digital Craft Passport endpoint.
    Publicly accessible without authentication when scanning QR code on packaging.
    Safely reveals verified craft origin, materials, and artisan story without leaking private financial records.
    """
    passport = db.query(CraftPassport).filter(CraftPassport.public_code == public_code).first()
    if not passport or not passport.is_active:
        raise HTTPException(status_code=404, detail="Craft Passport not found or inactive")

    product = passport.product
    if not product:
        raise HTTPException(status_code=404, detail="Associated product record not found")

    artisan = product.artisan
    artisan_name = artisan.user.full_name if (artisan and artisan.user) else "Traditional Master Artisan"
    region = f"{artisan.district}, {artisan.state}" if artisan else "India"
    cluster_name = artisan.cluster.cluster_name if (artisan and artisan.cluster) else "Heritage Craft Cluster"

    primary_img = None
    if product.images:
        primary_img = product.images[0].enhanced_url or product.images[0].original_url

    return {
        "public_code": passport.public_code,
        "product_title": product.title_en,
        "category": product.category,
        "craft_type": product.craft_type,
        "image_url": primary_img or "/placeholder-craft.jpg",
        "artisan_name": artisan_name,
        "region": region,
        "cluster_name": cluster_name,
        "craft_story": passport.craft_story_en,
        "materials": passport.materials_certified or product.materials or "Natural Organic Materials",
        "heritage_notes": passport.heritage_notes,
        "verification_badge": passport.region_badge or "Verified Handcrafted Authenticity",
        "created_at": passport.created_at
    }

@router.get("/{product_id}", response_model=CraftPassportOut)
def get_product_passport(product_id: int, db: Session = Depends(get_db)):
    passport = db.query(CraftPassport).filter(CraftPassport.product_id == product_id).first()
    if not passport:
        raise HTTPException(status_code=404, detail="Passport not found for this product")
    return passport
