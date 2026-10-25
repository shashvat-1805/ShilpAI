import pytest
from fastapi.testclient import TestClient
from app.main import app

def test_complete_5_minute_demo_journey():
    """
    Executes the complete end-to-end demonstration journey specified in Section 14 & 33:
    Artisan onboard -> photo upload -> voice note -> bilingual listing -> pricing -> publish
    -> marketing pack -> buyer search -> match -> inquiry -> quote -> confirmed order
    -> production milestones -> public QR passport -> expense logging -> admin audit.
    """
    client = TestClient(app)

    # 1. Artisan Authentication
    res_login = client.post("/api/v1/auth/login", json={
        "email": "ramesh.varanasi@shilpai.in",
        "password": "Artisan@2026"
    })
    assert res_login.status_code == 200, "Artisan login failed"
    artisan_token = {"Authorization": f"Bearer {res_login.json()['access_token']}"}

    # 2. Voice-First Bilingual Catalog Extraction
    res_voice = client.post("/api/v1/catalog/from-voice", json={
        "transcript": "यह शुद्ध बनारसी कातान सिल्क साड़ी है जिसमें असली सोने की ज़री का काम है",
        "language": "hi",
        "category_hint": "Handloom & Textiles"
    }, headers=artisan_token)
    assert res_voice.status_code == 200, "Voice cataloging failed"
    cat_data = res_voice.json()
    assert "title_en" in cat_data
    assert "title_hi" in cat_data

    # 3. Dynamic Pricing Calculation (Gross Margin Formula)
    # Target 30% margin on 4,000 cost: 4000 / (1 - 0.30) = 5714.29
    res_price = client.post("/api/v1/pricing/recommend", json={
        "raw_material_cost": 2200.0,
        "labor_cost": 1500.0,
        "packaging_cost": 200.0,
        "overhead_cost": 100.0,
        "target_margin_pct": 30.0
    })
    assert res_price.status_code == 200, "Pricing recommendation failed"
    price_data = res_price.json()
    assert price_data["total_cost"] == 4000.0
    assert price_data["target_recommended_price"] == 5714.29

    # 4. Product Publishing
    res_create = client.post("/api/v1/products", json={
        "category": cat_data["category"],
        "craft_type": cat_data["craft_type"],
        "title_en": cat_data["title_en"],
        "title_hi": cat_data["title_hi"],
        "description_en": cat_data["description_en"],
        "description_hi": cat_data["description_hi"],
        "materials": cat_data["suggested_materials"],
        "dimensions": cat_data["suggested_dimensions"],
        "weight_kg": 0.85,
        "cost_price": 4000.0,
        "target_margin_pct": 30.0,
        "selling_price": price_data["target_recommended_price"],
        "initial_stock": 25
    }, headers=artisan_token)
    assert res_create.status_code == 200, "Product creation failed"
    product = res_create.json()
    prod_id = product["id"]

    # 5. Marketing Pack Generation
    res_mkt = client.post("/api/v1/marketing/generate", json={
        "product_id": prod_id,
        "festival_focus": "Diwali Season"
    }, headers=artisan_token)
    assert res_mkt.status_code == 200, "Marketing generation failed"
    mkt_assets = res_mkt.json()
    assert len(mkt_assets) >= 4

    # 6. Buyer Authentication
    res_buyer_login = client.post("/api/v1/auth/login", json={
        "email": "procurement@fabcraft.com",
        "password": "Buyer@2026"
    })
    assert res_buyer_login.status_code == 200, "Buyer login failed"
    buyer_token = {"Authorization": f"Bearer {res_buyer_login.json()['access_token']}"}

    # 7. Buyer Sourcing Matchmaker
    res_match = client.post("/api/v1/buyers/match", json={
        "category": "Handloom & Textiles",
        "target_quantity": 20,
        "target_budget": 6000.0,
        "state_preference": "Uttar Pradesh"
    })
    assert res_match.status_code == 200, "Matchmaker failed"
    matches = res_match.json()
    assert len(matches) > 0

    # 8. Buyer submits Wholesale Inquiry (RFQ)
    res_inq = client.post("/api/v1/inquiries", json={
        "product_id": prod_id,
        "quantity": 20,
        "target_price_per_unit": 5600.0,
        "delivery_deadline": "Within 20 days",
        "buyer_notes": "Urgent requirement for Delhi boutique display"
    }, headers=buyer_token)
    assert res_inq.status_code == 200, "Inquiry creation failed"
    inq = res_inq.json()

    # 9. Artisan issues Quotation
    res_quote = client.post("/api/v1/quotations", json={
        "inquiry_id": inq["id"],
        "buyer_id": inq["buyer_id"],
        "product_id": prod_id,
        "unit_price": 5700.0,
        "quantity": 20,
        "lead_time_days": 18,
        "shipping_terms": "Insured Air Cargo Included",
        "notes": "Using 100% certified gold zari with tested seal"
    }, headers=artisan_token)
    assert res_quote.status_code == 200, "Quotation failed"
    quote = res_quote.json()

    # 10. Buyer accepts Quotation -> Confirmed Order generated
    res_accept = client.post(f"/api/v1/quotations/{quote['id']}/respond", json={
        "action": "accept"
    }, headers=buyer_token)
    assert res_accept.status_code == 200, "Quotation accept failed"
    order_data = res_accept.json()
    order_id = order_data["order_id"]

    # 11. Artisan updates Production Milestone
    res_ms = client.post(f"/api/v1/orders/{order_id}/milestones", json={
        "stage": "in_production",
        "title": "Pit Looms Warped & Silk Threads Doffed",
        "notes": "Weaving commenced on 2 pit looms for 20 sarees."
    }, headers=artisan_token)
    assert res_ms.status_code == 200, "Milestone update failed"

    # 12. Scan & verify Digital Craft Passport (Public endpoint)
    res_passport = client.get(f"/api/v1/craft-passport/{prod_id}")
    assert res_passport.status_code == 200, "Passport retrieval failed"
    passport = res_passport.json()
    public_code = passport["public_code"]

    res_public = client.get(f"/api/v1/craft-passport/public/{public_code}")
    assert res_public.status_code == 200, "Public passport scan failed"
    pub_data = res_public.json()
    assert pub_data["product_title"] == cat_data["title_en"]
    assert "craft_story" in pub_data

    # 13. Log Expense & Verify Financial Summary
    res_exp = client.post("/api/v1/finances/expenses", json={
        "expense_type": "material",
        "amount": 28000.0,
        "description": "5kg tested zari cones",
        "product_id": prod_id
    }, headers=artisan_token)
    assert res_exp.status_code == 200, "Expense logging failed"

    res_fin = client.get("/api/v1/finances/summary", headers=artisan_token)
    assert res_fin.status_code == 200, "Finances summary failed"
    fin_summary = res_fin.json()
    assert fin_summary["total_expenses"] >= 28000.0

    # 14. Admin Governance & Health Check
    res_admin_login = client.post("/api/v1/auth/login", json={
        "email": "admin@shilpai.in",
        "password": "ShilpAI@2026"
    })
    assert res_admin_login.status_code == 200, "Admin login failed"
    admin_token = {"Authorization": f"Bearer {res_admin_login.json()['access_token']}"}

    res_health = client.get("/api/v1/admin/health", headers=admin_token)
    assert res_health.status_code == 200, "Admin health check failed"
    health = res_health.json()
    assert health["total_products"] > 0
    assert health["total_orders"] > 0
