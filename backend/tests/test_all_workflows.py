import pytest

def test_root_health(client):
    res = client.get("/api/v1/health")
    assert res.status_code == 200
    data = res.json()
    assert data["app"] == "ShilpAI API"
    assert data["status"] == "online"

def test_auth_login_artisan(client):
    res = client.post("/api/v1/auth/login", json={
        "email": "ramesh.varanasi@shilpai.in",
        "password": "Artisan@2026"
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["role"] == "artisan"
    assert data["user_id"] == 2

def test_auth_login_invalid(client):
    res = client.post("/api/v1/auth/login", json={
        "email": "ramesh.varanasi@shilpai.in",
        "password": "WrongPassword999"
    })
    assert res.status_code == 401

def test_auth_register_new_artisan(client):
    import uuid
    unique_email = f"test.weaver.{uuid.uuid4().hex[:8]}@testartisan.org"
    res = client.post("/api/v1/auth/register", json={
        "email": unique_email,
        "password": "Password123!",
        "full_name": "Kavitha Devi",
        "role": "artisan",
        "craft_name": "Chanderi Weaving",
        "craft_category": "Handloom & Textiles",
        "state": "Madhya Pradesh",
        "district": "Ashoknagar"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["role"] == "artisan"
    assert "access_token" in data

def test_pricing_formula(client):
    # Total Cost = 200 (material) + 150 (labor) + 30 (pkg) + 20 (ovh) = 400
    # Formula: Selling Price = Total Cost / (1 - Target Margin / 100)
    # At 20% margin: 400 / 0.80 = 500.00
    res = client.post("/api/v1/pricing/recommend", json={
        "raw_material_cost": 200.0,
        "labor_cost": 150.0,
        "packaging_cost": 30.0,
        "overhead_cost": 20.0,
        "transport_cost": 0.0,
        "target_margin_pct": 20.0,
        "quantity": 1
    })
    assert res.status_code == 200
    data = res.json()
    assert data["total_cost"] == 400.0
    assert data["target_recommended_price"] == 500.0
    assert data["min_recommended_price"] <= data["target_recommended_price"]
    assert data["max_recommended_price"] >= data["target_recommended_price"]

def test_pricing_underpricing_warning(client):
    res = client.post("/api/v1/pricing/recommend", json={
        "raw_material_cost": 500.0,
        "labor_cost": 200.0,
        "packaging_cost": 0.0,
        "overhead_cost": 0.0,
        "target_margin_pct": 10.0  # very low margin
    })
    assert res.status_code == 200
    data = res.json()
    assert data["underpricing_warning"] is True

def test_products_list_and_filter(client):
    res = client.get("/api/v1/products")
    assert res.status_code == 200
    products = res.json()
    assert len(products) > 0
    
    # Filter by category
    res_textiles = client.get("/api/v1/products?category=Handloom")
    assert res_textiles.status_code == 200
    data = res_textiles.json()
    for item in data:
        assert "Handloom" in item["category"]

def test_voice_catalog_generation(client, artisan_token):
    res = client.post("/api/v1/catalog/from-voice", json={
        "transcript": "शुद्ध शहतूत सिल्क की बनारसी साड़ी हाथ से बुनी गई ज़री बॉर्डर",
        "language": "hi",
        "category_hint": "Handloom & Textiles"
    }, headers=artisan_token)
    assert res.status_code == 200
    data = res.json()
    assert "title_en" in data
    assert "title_hi" in data
    assert "description_en" in data
    assert "suggested_tags" in data

def test_buyer_matchmaking(client):
    res = client.post("/api/v1/buyers/match", json={
        "category": "Handloom & Textiles",
        "target_quantity": 30,
        "target_budget": 8000.0,
        "state_preference": "Uttar Pradesh"
    })
    assert res.status_code == 200
    matches = res.json()
    assert len(matches) > 0
    top_match = matches[0]
    assert top_match["match_score"] >= 70
    assert len(top_match["match_reasons"]) > 0
    assert "craft_category" in top_match

def test_inquiry_and_quotation_workflow(client, buyer_token, artisan_token):
    # 1. Buyer submits inquiry
    res_inq = client.post("/api/v1/inquiries", json={
        "product_id": 1,
        "quantity": 15,
        "target_price_per_unit": 7400.0,
        "delivery_deadline": "Dec 15, 2026",
        "buyer_notes": "Bulk festive requirement for upcoming season."
    }, headers=buyer_token)
    assert res_inq.status_code == 200
    inquiry = res_inq.json()
    assert inquiry["status"] == "pending"

    # 2. Artisan responds with quotation
    res_quote = client.post("/api/v1/quotations", json={
        "inquiry_id": inquiry["id"],
        "buyer_id": inquiry["buyer_id"],
        "product_id": 1,
        "unit_price": 7500.0,
        "quantity": 15,
        "lead_time_days": 14,
        "shipping_terms": "Insured surface express included",
        "notes": "Custom woven warp with verified silk tags"
    }, headers=artisan_token)
    assert res_quote.status_code == 200
    quote = res_quote.json()
    assert quote["status"] == "sent"
    assert quote["total_amount"] == 7500.0 * 15

    # 3. Buyer accepts quotation -> converts into order!
    res_accept = client.post(f"/api/v1/quotations/{quote['id']}/respond", json={
        "action": "accept"
    }, headers=buyer_token)
    assert res_accept.status_code == 200
    res_data = res_accept.json()
    assert res_data["status"] == "accepted"
    assert "order_id" in res_data
    assert "order_number" in res_data

def test_public_craft_passport_scan(client):
    # Fetch a product to get its public craft passport
    res_prods = client.get("/api/v1/products")
    products = res_prods.json()
    first_prod_id = products[0]["id"]

    res_passport = client.get(f"/api/v1/craft-passport/{first_prod_id}")
    assert res_passport.status_code == 200
    pass_data = res_passport.json()
    public_code = pass_data["public_code"]

    # Public endpoint access (no authentication header)
    res_public = client.get(f"/api/v1/craft-passport/public/{public_code}")
    assert res_public.status_code == 200
    pub_data = res_public.json()
    assert pub_data["public_code"] == public_code
    assert "craft_story" in pub_data
    assert "artisan_name" in pub_data
    assert "verification_badge" in pub_data

def test_financial_summary_and_expenses(client, artisan_token):
    # Log expense
    res_exp = client.post("/api/v1/finances/expenses", json={
        "expense_type": "material",
        "amount": 4500.0,
        "description": "Natural plant dyes and mordants"
    }, headers=artisan_token)
    assert res_exp.status_code == 200

    # Get summary
    res_sum = client.get("/api/v1/finances/summary", headers=artisan_token)
    assert res_sum.status_code == 200
    summary = res_sum.json()
    assert summary["total_revenue"] >= 0
    assert summary["total_expenses"] >= 4500.0
    assert "expenses_by_type" in summary

def test_government_schemes_navigator(client, artisan_token):
    res = client.get("/api/v1/schemes", headers=artisan_token)
    assert res.status_code == 200
    schemes = res.json()
    assert len(schemes) >= 4
    pm_v = next((s for s in schemes if "Vishwakarma" in s["scheme_name_en"]), None)
    assert pm_v is not None
    assert len(pm_v["checklist"]) > 0

    # Toggle checklist item
    res_chk = client.post("/api/v1/schemes/checklist", json={
        "scheme_id": pm_v["id"],
        "item_key": "aadhaar_linked",
        "is_completed": True
    }, headers=artisan_token)
    assert res_chk.status_code == 200
    assert res_chk.json()["is_completed"] is True

def test_rbac_security(client, buyer_token):
    # Buyer should NOT be permitted to create products (artisan-only route)
    res = client.post("/api/v1/products", json={
        "category": "Pottery",
        "craft_type": "Clay",
        "title_en": "Hacked item",
        "description_en": "Unauthorized",
        "selling_price": 500.0
    }, headers=buyer_token)
    assert res.status_code == 403

def test_admin_system_health(client, admin_token):
    res = client.get("/api/v1/admin/health", headers=admin_token)
    assert res.status_code == 200
    data = res.json()
    assert data["database_status"] == "Healthy & Operational"
    assert data["total_users"] > 0
    assert data["total_products"] > 0
