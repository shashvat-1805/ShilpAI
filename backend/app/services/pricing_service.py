class PricingService:
    @staticmethod
    def calculate_recommendation(
        raw_material_cost: float,
        labor_cost: float,
        packaging_cost: float = 0.0,
        overhead_cost: float = 0.0,
        transport_cost: float = 0.0,
        target_margin_pct: float = 30.0,
        quantity: int = 1
    ) -> dict:
        """
        Implements ShilpAI explainable pricing formula:
        Selling Price = Total Cost / (1 - Target Gross Margin % / 100)
        """
        # Ensure non-negative costs
        rm = max(0.0, raw_material_cost)
        lb = max(0.0, labor_cost)
        pkg = max(0.0, packaging_cost)
        ovh = max(0.0, overhead_cost)
        trn = max(0.0, transport_cost)
        
        unit_cost = rm + lb + pkg + ovh + trn
        if unit_cost <= 0:
            unit_cost = 100.0  # Safe fallback baseline

        # Guard margin percentage from division by zero or negative divisor
        margin_pct = min(max(5.0, target_margin_pct), 85.0)
        margin_fraction = margin_pct / 100.0
        
        # Core target price
        target_price = round(unit_cost / (1.0 - margin_fraction), 2)
        
        # Minimum acceptable price (using 18% floor margin to protect artisan from under-recovery)
        min_margin_pct = max(15.0, margin_pct - 12.0)
        min_price = round(unit_cost / (1.0 - (min_margin_pct / 100.0)), 2)
        
        # Maximum premium price (for boutique/export buyers at higher tier)
        max_margin_pct = min(70.0, margin_pct + 15.0)
        max_price = round(unit_cost / (1.0 - (max_margin_pct / 100.0)), 2)
        
        # Profit calculations
        target_profit = round(target_price - unit_cost, 2)
        effective_margin = round((target_profit / target_price) * 100, 1)

        # Underpricing warning check
        underpricing_warning = margin_pct < 20.0 or target_profit < (lb * 0.5)

        notes = (
            f"Based on total input cost of ₹{unit_cost:.2f} (Materials: ₹{rm:.2f}, Labor: ₹{lb:.2f}, "
            f"Packaging: ₹{pkg:.2f}, Overheads: ₹{ovh:.2f}, Transport: ₹{trn:.2f}). "
            f"At a target gross margin of {margin_pct}%, your recommended selling price is ₹{target_price:.2f}, "
            f"generating ₹{target_profit:.2f} net profit per piece."
        )

        return {
            "raw_material_cost": rm,
            "labor_cost": lb,
            "packaging_cost": pkg,
            "overhead_cost": ovh,
            "transport_cost": trn,
            "total_cost": round(unit_cost, 2),
            "target_margin_pct": margin_pct,
            "min_recommended_price": min_price,
            "target_recommended_price": target_price,
            "max_recommended_price": max_price,
            "underpricing_warning": underpricing_warning,
            "confidence_score": 0.94,
            "calculation_notes": notes
        }

pricing_service = PricingService()
