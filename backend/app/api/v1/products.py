import os
import uuid
import shutil
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.models.models import (
    Product, ProductImage, Inventory, PriceRecommendation, CraftPassport,
    ArtisanProfile, User, AuditLog
)
from app.schemas.schemas import (
    ProductCreate, ProductUpdate, ProductOut, ProductImageOut
)
from app.api.deps import get_current_user, require_artisan, get_optional_user
from app.services.image_service import image_service
from app.services.catalog_service import catalog_service
from app.services.pricing_service import pricing_service
from app.services.passport_service import passport_service

router = APIRouter(prefix="/products", tags=["Products & Studio"])

@router.post("", response_model=ProductOut)
def create_product(
    product_in: ProductCreate,
    current_user: User = Depends(require_artisan),
    db: Session = Depends(get_db)
):
    artisan = current_user.artisan_profile
    if not artisan:
        raise HTTPException(status_code=400, detail="Artisan profile not found")

    # 1. Create Product
    product = Product(
        artisan_id=artisan.id,
        category=product_in.category,
        craft_type=product_in.craft_type,
        title_en=product_in.title_en,
        title_hi=product_in.title_hi or product_in.title_en,
        description_en=product_in.description_en,
        description_hi=product_in.description_hi or product_in.description_en,
        materials=product_in.materials,
        dimensions=product_in.dimensions,
        weight_kg=product_in.weight_kg,
        fragility=product_in.fragility,
        status="published",
        cost_price=product_in.cost_price,
        target_margin_pct=product_in.target_margin_pct,
        selling_price=product_in.selling_price
    )
    db.add(product)
    db.commit()
    db.refresh(product)

    # 2. Attach Image
    img_url = product_in.image_url or "/placeholder-craft.jpg"
    p_img = ProductImage(
        product_id=product.id,
        original_url=img_url,
        enhanced_url=img_url,
        is_primary=True,
        background_removed=False
    )
    db.add(p_img)

    # 3. Create Inventory Record
    inv = Inventory(
        product_id=product.id,
        total_stock=product_in.initial_stock,
        reserved_stock=0,
        reorder_level=5
    )
    db.add(inv)

    # 4. Generate Pricing Recommendation Record
    pricing_rec = pricing_service.calculate_recommendation(
        raw_material_cost=product_in.cost_price * 0.5,
        labor_cost=product_in.cost_price * 0.35,
        packaging_cost=product_in.cost_price * 0.1,
        overhead_cost=product_in.cost_price * 0.05,
        target_margin_pct=product_in.target_margin_pct
    )
    p_rec = PriceRecommendation(
        product_id=product.id,
        raw_material_cost=pricing_rec["raw_material_cost"],
        labor_cost=pricing_rec["labor_cost"],
        packaging_cost=pricing_rec["packaging_cost"],
        overhead_cost=pricing_rec["overhead_cost"],
        transport_cost=0.0,
        total_cost=pricing_rec["total_cost"],
        target_margin_pct=pricing_rec["target_margin_pct"],
        min_recommended_price=pricing_rec["min_recommended_price"],
        target_recommended_price=pricing_rec["target_recommended_price"],
        max_recommended_price=pricing_rec["max_recommended_price"],
        underpricing_warning=product_in.selling_price < pricing_rec["min_recommended_price"],
        confidence_score=0.92,
        calculation_notes=pricing_rec["calculation_notes"]
    )
    db.add(p_rec)

    # 5. Generate Digital Craft Passport & QR Code
    public_code = f"SHILP-{uuid.uuid4().hex[:8].upper()}"
    qr_url = passport_service.generate_craft_passport_qr(public_code)
    story_data = passport_service.create_craft_story(
        craft_type=product.craft_type,
        artisan_name=current_user.full_name,
        region=f"{artisan.district}, {artisan.state}"
    )
    passport = CraftPassport(
        product_id=product.id,
        public_code=public_code,
        qr_code_url=qr_url,
        craft_story_en=story_data["story_en"],
        craft_story_hi=story_data["story_hi"],
        heritage_notes=story_data["heritage_notes"],
        materials_certified=story_data["materials_certified"],
        region_badge=story_data["region_badge"],
        is_active=True
    )
    db.add(passport)

    # Audit log
    audit = AuditLog(
        user_id=current_user.id,
        action="product_created",
        resource_type="product",
        resource_id=str(product.id),
        details=f"Created product: {product.title_en}"
    )
    db.add(audit)
    db.commit()
    db.refresh(product)

    return _format_product(product)

@router.get("", response_model=List[ProductOut])
def get_products(
    category: Optional[str] = None,
    craft_type: Optional[str] = None,
    state: Optional[str] = None,
    q: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    status_filter: Optional[str] = "published",
    artisan_only: bool = False,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    query = db.query(Product).join(ArtisanProfile)

    if artisan_only and current_user and current_user.artisan_profile:
        query = query.filter(Product.artisan_id == current_user.artisan_profile.id)
        if status_filter and status_filter != "all":
            query = query.filter(Product.status == status_filter)
    else:
        # Public marketplace query
        if status_filter and status_filter != "all":
            query = query.filter(Product.status == status_filter)

    if category:
        query = query.filter(Product.category.ilike(f"%{category}%"))
    if craft_type:
        query = query.filter(Product.craft_type.ilike(f"%{craft_type}%"))
    if state:
        query = query.filter(ArtisanProfile.state.ilike(f"%{state}%"))
    if min_price is not None:
        query = query.filter(Product.selling_price >= min_price)
    if max_price is not None:
        query = query.filter(Product.selling_price <= max_price)
    if q:
        query = query.filter(
            (Product.title_en.ilike(f"%{q}%")) |
            (Product.description_en.ilike(f"%{q}%")) |
            (Product.materials.ilike(f"%{q}%")) |
            (Product.craft_type.ilike(f"%{q}%"))
        )

    products = query.order_by(Product.created_at.desc()).all()
    return [_format_product(p) for p in products]

@router.get("/{id}", response_model=ProductOut)
def get_product(id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Increment view count
    product.views_count += 1
    db.commit()
    
    return _format_product(product)

@router.put("/{id}", response_model=ProductOut)
def update_product(
    id: int,
    product_update: ProductUpdate,
    current_user: User = Depends(require_artisan),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Ownership check
    if current_user.role != "admin" and product.artisan_id != current_user.artisan_profile.id:
        raise HTTPException(status_code=403, detail="You do not have permission to edit this product.")

    update_data = product_update.dict(exclude_unset=True)
    if "total_stock" in update_data and product.inventory:
        product.inventory.total_stock = update_data.pop("total_stock")

    for key, value in update_data.items():
        setattr(product, key, value)

    db.commit()
    db.refresh(product)
    return _format_product(product)

@router.post("/analyze-image")
def analyze_uploaded_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Module A / B: Analyzes uploaded product photo and detects craft category,
    materials, and attributes.
    """
    ext = os.path.splitext(file.filename)[1] or ".jpg"
    filename = f"prod_{uuid.uuid4().hex[:10]}{ext}"
    upload_path = os.path.join(settings.UPLOAD_DIR, "products", filename)
    
    with open(upload_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    relative_url = f"/uploads/products/{filename}"
    analysis = catalog_service.analyze_image_attributes(file.filename)
    analysis["image_url"] = relative_url
    analysis["filename"] = filename
    return analysis

@router.post("/enhance-image")
def enhance_image(
    image_url: str = Form(...),
    action: str = Form("enhance")  # "enhance", "remove_bg", "lifestyle"
):
    """
    Module A: AI Product Studio image enhancement.
    """
    # Resolve relative url to local filesystem
    local_path = image_url.replace("/uploads/", "")
    full_path = os.path.join(settings.UPLOAD_DIR, local_path)
    
    if not os.path.exists(full_path):
        # Fallback to demo default if path doesn't exist
        return {
            "success": True,
            "enhanced_url": image_url,
            "original_url": image_url,
            "details": {"status": "Using studio enhancement filter preview"}
        }

    if action == "remove_bg":
        res = image_service.remove_background_fallback(full_path)
        return {
            "success": res["success"],
            "enhanced_url": res.get("clean_url", image_url),
            "original_url": image_url,
            "method": "Studio Clean Background"
        }
    elif action == "lifestyle":
        res = image_service.generate_lifestyle_scene(full_path)
        return {
            "success": res["success"],
            "enhanced_url": res.get("lifestyle_url", image_url),
            "original_url": image_url,
            "method": "Living Room Staged Scene"
        }
    else:
        res = image_service.enhance_product_image(full_path)
        return {
            "success": res["success"],
            "enhanced_url": res.get("enhanced_url", image_url),
            "original_url": image_url,
            "details": res.get("details", {})
        }

def _format_product(p: Product) -> dict:
    artisan = p.artisan
    user = artisan.user if artisan else None
    return {
        "id": p.id,
        "artisan_id": p.artisan_id,
        "category": p.category,
        "craft_type": p.craft_type,
        "title_en": p.title_en,
        "title_hi": p.title_hi,
        "description_en": p.description_en,
        "description_hi": p.description_hi,
        "materials": p.materials,
        "dimensions": p.dimensions,
        "weight_kg": p.weight_kg,
        "fragility": p.fragility,
        "status": p.status,
        "cost_price": p.cost_price,
        "target_margin_pct": p.target_margin_pct,
        "selling_price": p.selling_price,
        "views_count": p.views_count,
        "inquiries_count": p.inquiries_count,
        "created_at": p.created_at,
        "images": [
            {
                "id": img.id,
                "original_url": img.original_url,
                "enhanced_url": img.enhanced_url,
                "is_primary": img.is_primary,
                "background_removed": img.background_removed
            } for img in p.images
        ],
        "inventory": {
            "id": p.inventory.id,
            "total_stock": p.inventory.total_stock,
            "reserved_stock": p.inventory.reserved_stock,
            "reorder_level": p.inventory.reorder_level
        } if p.inventory else None,
        "price_recommendation": {
            "raw_material_cost": p.price_recommendation.raw_material_cost,
            "labor_cost": p.price_recommendation.labor_cost,
            "packaging_cost": p.price_recommendation.packaging_cost,
            "overhead_cost": p.price_recommendation.overhead_cost,
            "transport_cost": p.price_recommendation.transport_cost,
            "total_cost": p.price_recommendation.total_cost,
            "target_margin_pct": p.price_recommendation.target_margin_pct,
            "min_recommended_price": p.price_recommendation.min_recommended_price,
            "target_recommended_price": p.price_recommendation.target_recommended_price,
            "max_recommended_price": p.price_recommendation.max_recommended_price,
            "underpricing_warning": p.price_recommendation.underpricing_warning,
            "confidence_score": p.price_recommendation.confidence_score,
            "calculation_notes": p.price_recommendation.calculation_notes
        } if p.price_recommendation else None,
        "artisan_name": user.full_name if user else "Master Artisan",
        "artisan_state": artisan.state if artisan else "India",
        "artisan_district": artisan.district if artisan else "Cluster"
    }
