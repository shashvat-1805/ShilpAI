from typing import Dict, Any, List

class PackagingService:
    @staticmethod
    def get_packaging_advice(
        dimensions: str,
        weight_kg: float,
        fragility: str = "Medium",
        quantity: int = 1,
        destination_distance_km: int = 500
    ) -> Dict[str, Any]:
        frag = fragility.capitalize()
        
        if frag == "High":  # e.g., Terracotta pottery, Blue pottery, glass
            box_type = "5-Ply Double-Wall Heavy-Duty Corrugated Master Carton"
            cushioning = "Biodegradable Bubble Wrap (3 layers) + Custom Shredded Kraft Paper / Honeycomb Pad"
            outer = "Corner Edge Protectors + Moisture-Proof Stretch Film + 'FRAGILE / HANDLE WITH CARE' Tape"
            unit_cost = 45.0 + (weight_kg * 12.0)
            checklist = [
                "Wrap each individual item with 3 layers of honeycomb or bubble wrap",
                "Ensure at least 5 cm clearance between item and box walls filled with cushioning",
                "Perform standard drop test from 1 meter height before bulk sealing",
                "Affix prominent bilingual 'Fragile / संभालकर रखें' handling labels",
                "Seal all box seams with H-tape taping pattern"
            ]
            shipping_notes = "Opt for air express or designated fragile ground courier to avoid excessive hub transfers."

        elif frag == "Medium":  # e.g., Wooden toys, brassware, folk paintings
            box_type = "3-Ply Corrugated Die-Cut Mailer Box"
            cushioning = "Recycled Kraft Cushioning Paper + EPE Foam sheet wrapping"
            outer = "Reinforced Paper Tape + Shrink Wrap"
            unit_cost = 25.0 + (weight_kg * 8.0)
            checklist = [
                "Wrap product in non-scratch protective tissue or thin foam",
                "Place inside inner carton before placing in outer master carton",
                "Fill empty void spaces to eliminate internal shifting during transit",
                "Apply water-resistant outer sleeve for monsoon season protection"
            ]
            shipping_notes = "Standard surface cargo or India Post Speed Post is suitable."

        else:  # Low - e.g. handloom textiles, dupattas, stoles, mats
            box_type = "Kraft Corrugated Presentation Box or Eco-Friendly Poly-Free Fabric Bag"
            cushioning = "Acid-free Butter Paper wrapping with artisan thank-you insert"
            outer = "Tear-resistant Recycled Courier Bag"
            unit_cost = 15.0 + (weight_kg * 5.0)
            checklist = [
                "Neatly fold textile and insert silica gel sachet for moisture prevention",
                "Wrap in printed branded butter paper with craft passport sticker",
                "Seal in waterproof tamper-evident courier bag",
                "Ensure weight is accurately measured for postage calculation"
            ]
            shipping_notes = "Lightweight surface courier offers most economical freight rate."

        total_est = round(unit_cost * max(1, quantity), 2)

        return {
            "box_type": box_type,
            "cushioning_material": cushioning,
            "outer_protection": outer,
            "estimated_cost_inr": total_est,
            "checklist": checklist,
            "shipping_notes": shipping_notes
        }

packaging_service = PackagingService()
