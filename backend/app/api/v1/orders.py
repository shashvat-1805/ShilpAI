import uuid
import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import (
    Order, OrderItem, OrderMilestone, Shipment, Product, ArtisanProfile,
    BuyerProfile, User, Notification, RevenueRecord, Inventory
)
from app.schemas.schemas import OrderCreate, OrderOut, MilestoneCreate
from app.api.deps import get_current_user

router = APIRouter(prefix="/orders", tags=["Orders & Fulfillment"])

@router.post("", response_model=OrderOut)
def create_direct_order(
    order_in: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    buyer = current_user.buyer_profile
    if not buyer:
        raise HTTPException(status_code=400, detail="Only registered buyers can place orders.")

    product = db.query(Product).filter(Product.id == order_in.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    order_num = f"SHILP-ORD-{uuid.uuid4().hex[:6].upper()}"
    total = round(order_in.unit_price * order_in.quantity, 2)

    order = Order(
        order_number=order_num,
        buyer_id=buyer.id,
        quotation_id=order_in.quotation_id,
        total_amount=total,
        status="confirmed",
        delivery_address=order_in.delivery_address
    )
    db.add(order)
    db.flush()

    item = OrderItem(
        order_id=order.id,
        product_id=product.id,
        quantity=order_in.quantity,
        unit_price=order_in.unit_price,
        subtotal=total
    )
    db.add(item)

    # Milestones
    m = OrderMilestone(
        order_id=order.id,
        stage="confirmed",
        title="Direct Order Confirmed",
        notes=f"Order placed for {order_in.quantity} units of '{product.title_en}'."
    )
    db.add(m)

    # Reserve inventory
    if product.inventory:
        product.inventory.reserved_stock += min(order_in.quantity, product.inventory.total_stock)

    # Notify artisan
    artisan_user = product.artisan.user if product.artisan else None
    if artisan_user:
        notif = Notification(
            user_id=artisan_user.id,
            title="New Direct Order Received! 📦",
            message=f"Buyer {buyer.organization_name} placed an order for {order_in.quantity} units (₹{total:,.2f}).",
            link="/artisan/orders",
            notification_type="order"
        )
        db.add(notif)

    db.commit()
    db.refresh(order)
    return _format_order(order)

@router.get("/my", response_model=List[OrderOut])
def get_my_orders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == "buyer" and current_user.buyer_profile:
        orders = db.query(Order).filter(Order.buyer_id == current_user.buyer_profile.id).order_by(Order.created_at.desc()).all()
    elif current_user.role == "artisan" and current_user.artisan_profile:
        orders = (
            db.query(Order)
            .join(OrderItem)
            .join(Product)
            .filter(Product.artisan_id == current_user.artisan_profile.id)
            .distinct()
            .order_by(Order.created_at.desc())
            .all()
        )
    elif current_user.role == "admin":
        orders = db.query(Order).order_by(Order.created_at.desc()).all()
    else:
        orders = []
    return [_format_order(o) for o in orders]

@router.get("/{id}", response_model=OrderOut)
def get_order(id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return _format_order(order)

@router.post("/{id}/milestones", response_model=OrderOut)
def advance_milestone(
    id: int,
    ms_in: MilestoneCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Module I: Production tracking milestones (production_started, qc_inspected, packaged, dispatched, delivered)
    """
    order = db.query(Order).filter(Order.id == id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    milestone = OrderMilestone(
        order_id=order.id,
        stage=ms_in.stage,
        title=ms_in.title,
        notes=ms_in.notes,
        proof_image_url=ms_in.proof_image_url
    )
    db.add(milestone)

    # Update overall order status
    order.status = ms_in.stage
    order.updated_at = datetime.datetime.utcnow()

    # If delivered, record revenue for artisan and decrement inventory
    if ms_in.stage == "delivered":
        for item in order.items:
            if item.product and item.product.artisan_id:
                # Add revenue record
                rev = RevenueRecord(
                    artisan_id=item.product.artisan_id,
                    order_id=order.id,
                    amount=item.subtotal,
                    source="order_delivery"
                )
                db.add(rev)
                # Deduct inventory stock
                if item.product.inventory:
                    item.product.inventory.total_stock = max(0, item.product.inventory.total_stock - item.quantity)
                    item.product.inventory.reserved_stock = max(0, item.product.inventory.reserved_stock - item.quantity)

    # Notify buyer
    if order.buyer and order.buyer.user:
        notif = Notification(
            user_id=order.buyer.user.id,
            title=f"Order Update: {ms_in.title}",
            message=f"Order #{order.order_number} status updated to: {ms_in.stage.replace('_', ' ').title()}.",
            link="/buyer/orders",
            notification_type="order"
        )
        db.add(notif)

    db.commit()
    db.refresh(order)
    return _format_order(order)

@router.post("/{id}/shipment")
def create_or_update_shipment(
    id: int,
    carrier_name: str,
    tracking_number: str,
    weight_kg: float = 1.0,
    estimated_delivery: str = "3-5 Business Days",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Module Q: Smart Logistics tracking details.
    """
    order = db.query(Order).filter(Order.id == id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    shipment = db.query(Shipment).filter(Shipment.order_id == order.id).first()
    if not shipment:
        shipment = Shipment(
            order_id=order.id,
            carrier_name=carrier_name,
            tracking_number=tracking_number,
            origin_address="Artisan Craft Center",
            destination_address=order.delivery_address,
            weight_kg=weight_kg,
            estimated_delivery=estimated_delivery,
            current_status="In Transit",
            dispatch_date=datetime.datetime.utcnow()
        )
        db.add(shipment)
    else:
        shipment.carrier_name = carrier_name
        shipment.tracking_number = tracking_number
        shipment.weight_kg = weight_kg
        shipment.estimated_delivery = estimated_delivery

    # Add dispatched milestone
    order.status = "dispatched"
    ms = OrderMilestone(
        order_id=order.id,
        stage="dispatched",
        title="Package Dispatched via Courier",
        notes=f"Carrier: {carrier_name} | Tracking #: {tracking_number}"
    )
    db.add(ms)

    db.commit()
    return {"success": True, "tracking_number": tracking_number, "carrier": carrier_name}

def _format_order(o: Order) -> dict:
    buyer_name = o.buyer.organization_name if o.buyer else "Buyer"
    return {
        "id": o.id,
        "order_number": o.order_number,
        "buyer_id": o.buyer_id,
        "quotation_id": o.quotation_id,
        "total_amount": o.total_amount,
        "status": o.status,
        "delivery_address": o.delivery_address,
        "created_at": o.created_at,
        "items": [
            {
                "id": it.id,
                "product_id": it.product_id,
                "quantity": it.quantity,
                "unit_price": it.unit_price,
                "subtotal": it.subtotal,
                "product_title": it.product.title_en if it.product else "Craft Item"
            } for it in o.items
        ],
        "milestones": [
            {
                "id": m.id,
                "stage": m.stage,
                "title": m.title,
                "notes": m.notes,
                "proof_image_url": m.proof_image_url,
                "completed_at": m.completed_at
            } for m in o.milestones
        ],
        "shipment": {
            "id": o.shipment.id,
            "carrier_name": o.shipment.carrier_name,
            "tracking_number": o.shipment.tracking_number,
            "origin_address": o.shipment.origin_address,
            "destination_address": o.shipment.destination_address,
            "weight_kg": o.shipment.weight_kg,
            "estimated_delivery": o.shipment.estimated_delivery,
            "current_status": o.shipment.current_status,
            "dispatch_date": o.shipment.dispatch_date,
            "delivered_date": o.shipment.delivered_date
        } if o.shipment else None,
        "buyer_name": buyer_name
    }
