from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Inquiry, Product, User, Notification
from app.schemas.schemas import InquiryCreate, InquiryOut
from app.api.deps import get_current_user

router = APIRouter(prefix="/inquiries", tags=["Inquiries & RFQs"])

@router.post("", response_model=InquiryOut)
def create_inquiry(
    inquiry_in: InquiryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    buyer = current_user.buyer_profile
    if not buyer:
        raise HTTPException(status_code=400, detail="Only registered buyers can submit inquiries.")

    product = db.query(Product).filter(Product.id == inquiry_in.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    inquiry = Inquiry(
        buyer_id=buyer.id,
        product_id=product.id,
        artisan_id=product.artisan_id,
        quantity=inquiry_in.quantity,
        target_price_per_unit=inquiry_in.target_price_per_unit,
        delivery_deadline=inquiry_in.delivery_deadline,
        buyer_notes=inquiry_in.buyer_notes,
        status="pending"
    )
    db.add(inquiry)
    
    # Increment inquiries count on product
    product.inquiries_count += 1

    # Send notification to artisan user
    artisan_user = product.artisan.user if product.artisan else None
    if artisan_user:
        notif = Notification(
            user_id=artisan_user.id,
            title="New Bulk Inquiry Received! / नई थोक पूछताछ प्राप्त!",
            message=f"Buyer {buyer.organization_name} requested a quote for {inquiry_in.quantity} units of '{product.title_en}'.",
            link="/artisan/inquiries",
            notification_type="inquiry"
        )
        db.add(notif)

    db.commit()
    db.refresh(inquiry)
    return _format_inquiry(inquiry)

@router.get("/my", response_model=List[InquiryOut])
def get_my_inquiries(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == "artisan" and current_user.artisan_profile:
        inquiries = db.query(Inquiry).filter(Inquiry.artisan_id == current_user.artisan_profile.id).order_by(Inquiry.created_at.desc()).all()
    elif current_user.role == "buyer" and current_user.buyer_profile:
        inquiries = db.query(Inquiry).filter(Inquiry.buyer_id == current_user.buyer_profile.id).order_by(Inquiry.created_at.desc()).all()
    elif current_user.role == "admin":
        inquiries = db.query(Inquiry).order_by(Inquiry.created_at.desc()).all()
    else:
        inquiries = []
    return [_format_inquiry(iq) for iq in inquiries]

def _format_inquiry(iq: Inquiry) -> dict:
    return {
        "id": iq.id,
        "buyer_id": iq.buyer_id,
        "product_id": iq.product_id,
        "artisan_id": iq.artisan_id,
        "quantity": iq.quantity,
        "target_price_per_unit": iq.target_price_per_unit,
        "delivery_deadline": iq.delivery_deadline,
        "buyer_notes": iq.buyer_notes,
        "status": iq.status,
        "created_at": iq.created_at,
        "product_title": iq.product.title_en if iq.product else "Craft Product",
        "buyer_org": iq.buyer.organization_name if iq.buyer else "Buyer Org",
        "artisan_name": iq.product.artisan.user.full_name if (iq.product and iq.product.artisan and iq.product.artisan.user) else "Artisan"
    }
