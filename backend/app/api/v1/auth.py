from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token
from app.models.models import User, ArtisanProfile, BuyerProfile, AuditLog, Notification
from app.schemas.schemas import Token, UserLogin, UserRegister, UserOut, ArtisanProfileUpdate, BuyerProfileUpdate
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication & Profiles"])

@router.post("/register", response_model=Token)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )

    hashed_pwd = get_password_hash(user_in.password)
    user = User(
        email=user_in.email,
        phone=user_in.phone,
        full_name=user_in.full_name,
        role=user_in.role,
        language_pref=user_in.language_pref,
        hashed_password=hashed_pwd,
        is_active=True,
        is_verified=True if user_in.role == "admin" else False
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Automatically create associated profile based on role
    if user.role == "artisan":
        artisan_prof = ArtisanProfile(
            user_id=user.id,
            craft_name=user_in.craft_name or "Traditional Craft",
            craft_category=user_in.craft_category or "Handicrafts & Decor",
            state=user_in.state or "Uttar Pradesh",
            district=user_in.district or "Varanasi",
            bio_en=f"Generational artisan dedicated to preserving Indian heritage crafts.",
            bio_hi=f"भारतीय पारंपरिक हस्तशिल्प को समर्पित कुशल शिल्पकार।",
            capacity_per_month=60,
            available_units=60,
            trust_score=4.5,
            verification_status="verified"
        )
        db.add(artisan_prof)
    elif user.role == "buyer":
        buyer_prof = BuyerProfile(
            user_id=user.id,
            organization_name=user_in.organization_name or f"{user.full_name} Enterprise",
            business_type="Retailer / Boutique",
            city=user_in.city or "New Delhi",
            state=user_in.state or "Delhi",
            delivery_address="Connaught Place, New Delhi",
            procurement_needs="High quality artisanal crafts and handmade textiles",
            verified_status="verified"
        )
        db.add(buyer_prof)

    # Welcome notification
    welcome_notif = Notification(
        user_id=user.id,
        title="Welcome to ShilpAI! / शिल्पएआई में आपका स्वागत है!",
        message="Your digital artisan account is active. Start by creating a listing or exploring the craft directory.",
        notification_type="system"
    )
    db.add(welcome_notif)

    # Audit log
    audit = AuditLog(
        user_id=user.id,
        action="user_registered",
        resource_type="user",
        resource_id=str(user.id),
        details=f"Registered as role: {user.role}"
    )
    db.add(audit)
    db.commit()

    access_token = create_access_token(subject=user.id)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "user_id": user.id,
        "full_name": user.full_name,
        "language_pref": user.language_pref
    }

@router.post("/login", response_model=Token)
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_in.email).first()
    if not user or not verify_password(login_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Account is inactive")

    access_token = create_access_token(subject=user.id)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "user_id": user.id,
        "full_name": user.full_name,
        "language_pref": user.language_pref
    }

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    res = {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "phone": current_user.phone,
        "role": current_user.role,
        "language_pref": current_user.language_pref,
        "is_verified": current_user.is_verified,
        "created_at": current_user.created_at
    }
    if current_user.role == "artisan" and current_user.artisan_profile:
        prof = current_user.artisan_profile
        res["profile"] = {
            "id": prof.id,
            "craft_name": prof.craft_name,
            "craft_category": prof.craft_category,
            "state": prof.state,
            "district": prof.district,
            "experience_years": prof.experience_years,
            "bio_en": prof.bio_en,
            "bio_hi": prof.bio_hi,
            "capacity_per_month": prof.capacity_per_month,
            "available_units": prof.available_units,
            "trust_score": prof.trust_score,
            "orders_completed": prof.orders_completed,
            "rating_avg": prof.rating_avg,
            "verification_status": prof.verification_status
        }
    elif current_user.role == "buyer" and current_user.buyer_profile:
        prof = current_user.buyer_profile
        res["profile"] = {
            "id": prof.id,
            "organization_name": prof.organization_name,
            "business_type": prof.business_type,
            "gstin": prof.gstin,
            "city": prof.city,
            "state": prof.state,
            "delivery_address": prof.delivery_address,
            "procurement_needs": prof.procurement_needs,
            "verified_status": prof.verified_status
        }
    return res

@router.put("/language")
def update_language(lang: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if lang not in ["en", "hi"]:
        raise HTTPException(status_code=400, detail="Language must be 'en' or 'hi'")
    current_user.language_pref = lang
    db.commit()
    return {"success": True, "language_pref": lang}
