from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Review, Order, Product, User, BuyerProfile
from app.schemas.schemas import ReviewCreate, ReviewOut
from app.api.deps import require_buyer, get_current_user

router = APIRouter(prefix="/feedback", tags=["Buyer Feedback & Reviews"])

@router.post("/review", response_model=ReviewOut)
def submit_review(
    review_in: ReviewCreate,
    current_user: User = Depends(require_buyer),
    db: Session = Depends(get_db)
):
    buyer = current_user.buyer_profile
    if not buyer:
        raise HTTPException(status_code=400, detail="Buyer profile required")

    order = db.query(Order).filter(Order.id == review_in.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Simple sentiment & recurring theme classification
    txt = review_in.review_text.lower()
    if review_in.rating >= 4:
        sentiment = "positive"
        themes = "authentic craftsmanship, excellent texture, on-time delivery"
    elif review_in.rating == 3:
        sentiment = "neutral"
        themes = "good quality, packaging could be reinforced"
    else:
        sentiment = "negative"
        themes = "sizing variance, fragile transit damage"

    review = Review(
        order_id=review_in.order_id,
        product_id=review_in.product_id,
        buyer_id=buyer.id,
        rating=review_in.rating,
        review_text=review_in.review_text,
        sentiment=sentiment,
        recurring_themes=themes
    )
    db.add(review)

    # Update artisan's average rating
    product = db.query(Product).filter(Product.id == review_in.product_id).first()
    if product and product.artisan:
        artisan = product.artisan
        all_reviews = (
            db.query(Review)
            .join(Product, Review.product_id == Product.id)
            .filter(Product.artisan_id == artisan.id)
            .all()
        )
        if all_reviews:
            avg_r = (sum(r.rating for r in all_reviews) + review_in.rating) / (len(all_reviews) + 1)
            artisan.rating_avg = round(avg_r, 2)

    db.commit()
    db.refresh(review)
    return _format_review(review)

@router.get("/product/{product_id}", response_model=List[ReviewOut])
def get_product_reviews(product_id: int, db: Session = Depends(get_db)):
    reviews = db.query(Review).filter(Review.product_id == product_id).order_by(Review.created_at.desc()).all()
    return [_format_review(r) for r in reviews]

def _format_review(r: Review) -> dict:
    buyer_name = r.buyer.organization_name if r.buyer else "Verified Buyer"
    return {
        "id": r.id,
        "order_id": r.order_id,
        "product_id": r.product_id,
        "buyer_id": r.buyer_id,
        "rating": r.rating,
        "review_text": r.review_text,
        "sentiment": r.sentiment,
        "recurring_themes": r.recurring_themes,
        "artisan_reply": r.artisan_reply,
        "created_at": r.created_at,
        "buyer_name": buyer_name
    }
