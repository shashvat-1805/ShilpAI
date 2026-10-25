import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import (
    Quotation, Inquiry, Product, Order, OrderItem, OrderMilestone,
    ProductionAllocation, Notification, User, Inventory
)
from app.schemas.schemas import QuotationCreate, QuotationOut, QuotationRespond
from app.api.deps import get_current_user, require_artisan

router = APIRouter(prefix="/quotations", tags=["Quotations & Negotiations"])

@router.post("", response_model=QuotationOut)
def create_quotation(
    q_in: QuotationCreate,
    current_user: User = Depends(require_artisan),
    db: Session = Depends(get_db)
):
    artisan = current_user.artisan_profile
    if not artisan:
        raise HTTPException(status_code=400, detail="Artisan profile required")

    total = round(q_in.unit_price * q_in.quantity, 2)
    quotation = Quotation(
        inquiry_id=q_in.inquiry_id,
        artisan_id=artisan.id,
        buyer_id=q_in.buyer_id,
        product_id=q_in.product_id,
        unit_price=q_in.unit_price,
        quantity=q_in.quantity,
        total_amount=total,
        lead_time_days=q_in.lead_time_days,
        shipping_terms=q_in.shipping_terms,
        status="sent",
        notes=q_in.notes
    )
    db.add(quotation)

    # If linked to an inquiry, update inquiry status
    if q_in.inquiry_id:
        inquiry = db.query(Inquiry).filter(Inquiry.id == q_in.inquiry_id).first()
        if inquiry:
            inquiry.status = "quoted"

    # Notify buyer
    product = db.query(Product).filter(Product.id == q_in.product_id).first()
    p_title = product.title_en if product else "Craft Item"
    buyer = quotation.buyer
    if buyer and buyer.user:
        notif = Notification(
            user_id=buyer.user.id,
            title="Quotation Received! / कोटेशन प्राप्त हुआ!",
            message=f"Artisan {current_user.full_name} sent a quote of ₹{q_in.unit_price:.2f}/unit for {q_in.quantity} units of '{p_title}'.",
            link="/buyer/quotations",
            notification_type="order"
        )
        db.add(notif)

    db.commit()
    db.refresh(quotation)
    return _format_quotation(quotation)

@router.get("/my", response_model=List[QuotationOut])
def get_my_quotations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == "artisan" and current_user.artisan_profile:
        quotes = db.query(Quotation).filter(Quotation.artisan_id == current_user.artisan_profile.id).order_by(Quotation.created_at.desc()).all()
    elif current_user.role == "buyer" and current_user.buyer_profile:
        quotes = db.query(Quotation).filter(Quotation.buyer_id == current_user.buyer_profile.id).order_by(Quotation.created_at.desc()).all()
    elif current_user.role == "admin":
        quotes = db.query(Quotation).order_by(Quotation.created_at.desc()).all()
    else:
        quotes = []
    return [_format_quotation(q) for q in quotes]

@router.post("/{id}/respond")
def respond_to_quotation(
    id: int,
    action_in: QuotationRespond,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    quote = db.query(Quotation).filter(Quotation.id == id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quotation not found")

    if action_in.action == "accept":
        quote.status = "accepted"
        
        # Automatically generate a confirmed order!
        order_num = f"SHILP-ORD-{uuid.uuid4().hex[:6].upper()}"
        delivery_addr = quote.buyer.delivery_address if quote.buyer else "Primary Registered Address"
        
        order = Order(
            order_number=order_num,
            buyer_id=quote.buyer_id,
            quotation_id=quote.id,
            total_amount=quote.total_amount,
            status="confirmed",
            delivery_address=delivery_addr
        )
        db.add(order)
        db.flush()

        # Order item
        item = OrderItem(
            order_id=order.id,
            product_id=quote.product_id,
            quantity=quote.quantity,
            unit_price=quote.unit_price,
            subtotal=quote.total_amount
        )
        db.add(item)

        # Initial milestones
        m1 = OrderMilestone(
            order_id=order.id,
            stage="confirmed",
            title="Quotation Accepted & Order Confirmed",
            notes=f"Order #{order_num} agreed at ₹{quote.unit_price:.2f}/unit for {quote.quantity} units."
        )
        db.add(m1)

        # Production allocation
        alloc = ProductionAllocation(
            order_id=order.id,
            artisan_id=quote.artisan_id,
            units_allocated=quote.quantity,
            units_completed=0,
            status="in_progress"
        )
        db.add(alloc)

        # Reserve inventory stock if available
        inv = db.query(Inventory).filter(Inventory.product_id == quote.product_id).first()
        if inv:
            inv.reserved_stock += min(quote.quantity, inv.total_stock)

        # Notify artisan
        artisan_user = quote.product.artisan.user if (quote.product and quote.product.artisan) else None
        if artisan_user:
            notif = Notification(
                user_id=artisan_user.id,
                title="Quotation Accepted! New Order Confirmed! 🎉",
                message=f"Buyer accepted quotation. Order #{order_num} for ₹{quote.total_amount:.2f} is now confirmed.",
                link=f"/artisan/orders",
                notification_type="order"
            )
            db.add(notif)

        db.commit()
        return {"success": True, "status": "accepted", "order_id": order.id, "order_number": order_num}

    elif action_in.action == "reject":
        quote.status = "rejected"
        db.commit()
        return {"success": True, "status": "rejected"}
    
    elif action_in.action == "revise":
        quote.status = "revised"
        if action_in.revised_unit_price:
            quote.unit_price = action_in.revised_unit_price
            quote.total_amount = round(action_in.revised_unit_price * quote.quantity, 2)
        if action_in.notes:
            quote.notes = f"{quote.notes or ''} [Revision request: {action_in.notes}]"
        db.commit()
        return {"success": True, "status": "revised"}

    else:
        raise HTTPException(status_code=400, detail="Invalid action")

def _format_quotation(q: Quotation) -> dict:
    return {
        "id": q.id,
        "inquiry_id": q.inquiry_id,
        "artisan_id": q.artisan_id,
        "buyer_id": q.buyer_id,
        "product_id": q.product_id,
        "unit_price": q.unit_price,
        "quantity": q.quantity,
        "total_amount": q.total_amount,
        "lead_time_days": q.lead_time_days,
        "shipping_terms": q.shipping_terms,
        "status": q.status,
        "notes": q.notes,
        "created_at": q.created_at,
        "product_title": q.product.title_en if q.product else "Craft Item"
    }
