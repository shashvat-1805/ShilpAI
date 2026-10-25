from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.models import ArtisanProfile, Product, CraftCluster, User

class MatchingService:
    @staticmethod
    def match_suppliers(
        db: Session,
        category: str,
        keywords: str = "",
        target_quantity: int = 50,
        target_budget: float = None,
        state_preference: str = None,
        max_lead_time_days: int = 30
    ) -> List[Dict[str, Any]]:
        """
        Calculates match score (0-100) and human-understandable reasons
        for suppliers matching buyer requirements.
        """
        # Query active artisans
        query = db.query(ArtisanProfile).join(User).filter(User.is_active == True)
        artisans = query.all()

        results = []
        kw = keywords.lower() if keywords else ""

        for artisan in artisans:
            score = 40  # base baseline score
            reasons = []

            # 1. Category fit (up to 30 pts)
            if category.lower() in artisan.craft_category.lower() or artisan.craft_category.lower() in category.lower():
                score += 30
                reasons.append(f"Direct match in craft category: '{artisan.craft_category}'")
            elif any(w in artisan.craft_name.lower() for w in category.lower().split()):
                score += 20
                reasons.append(f"Related craft specialty: '{artisan.craft_name}'")

            # 2. Capacity vs Target Quantity (up to 20 pts)
            monthly_cap = artisan.capacity_per_month or 50
            if monthly_cap >= target_quantity:
                score += 20
                reasons.append(f"Production capacity ({monthly_cap} units/mo) comfortably fulfills {target_quantity} units")
            elif monthly_cap >= (target_quantity * 0.6):
                score += 10
                reasons.append(f"Capacity ({monthly_cap} units/mo) can fulfill with cluster co-production")
            else:
                score -= 10
                reasons.append(f"Individual monthly capacity ({monthly_cap} units) requires cluster aggregation")

            # 3. Location / State Preference (up to 15 pts)
            if state_preference and state_preference.lower() in artisan.state.lower():
                score += 15
                reasons.append(f"Located in requested target region: {artisan.state}")

            # 4. Trust score & verification (up to 15 pts)
            if artisan.trust_score and artisan.trust_score >= 4.5:
                score += 10
                reasons.append(f"Top-rated artisan trust score ({artisan.trust_score:.1f}/5.0)")
            if artisan.verification_status == "verified":
                score += 5
                reasons.append("Verified artisan credentials (Pehchan / Artisan Registry)")

            # Normalize score between 0 and 100
            final_score = min(98, max(25, score))

            # Fetch a sample product
            sample_product = db.query(Product).filter(
                Product.artisan_id == artisan.id,
                Product.status == "published"
            ).first()

            cluster_name = artisan.cluster.cluster_name if artisan.cluster else None
            artisan_user = artisan.user

            results.append({
                "artisan_id": artisan.id,
                "artisan_name": artisan_user.full_name if artisan_user else f"Artisan #{artisan.id}",
                "craft_name": artisan.craft_name,
                "craft_category": artisan.craft_category,
                "state": artisan.state,
                "district": artisan.district,
                "cluster_name": cluster_name,
                "match_score": final_score,
                "match_reasons": reasons,
                "monthly_capacity": monthly_cap,
                "available_units": artisan.available_units or monthly_cap,
                "trust_score": artisan.trust_score or 4.5,
                "verification_status": artisan.verification_status,
                "sample_product_id": sample_product.id if sample_product else None,
                "sample_product_title": sample_product.title_en if sample_product else f"{artisan.craft_name} Item",
                "sample_product_image": sample_product.images[0].enhanced_url or sample_product.images[0].original_url if sample_product and sample_product.images else "/placeholder-craft.jpg",
                "typical_unit_price": sample_product.selling_price if sample_product else 750.0
            })

        # Sort descending by match score
        results.sort(key=lambda x: x["match_score"], reverse=True)
        return results

matching_service = MatchingService()
