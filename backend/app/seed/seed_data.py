import os
import uuid
import datetime
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.models import (
    User, ArtisanProfile, BuyerProfile, CraftCluster, Product, ProductImage,
    Inventory, PriceRecommendation, CraftPassport, Inquiry, Quotation,
    Order, OrderItem, OrderMilestone, Shipment, Review, Expense, RevenueRecord,
    Notification, GovernmentScheme, SchemeChecklist
)
from app.services.passport_service import passport_service
from app.services.pricing_service import pricing_service

def seed_database():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        # Check if already seeded
        if db.query(User).count() > 0:
            print("Database already contains data. Skipping full seed.")
            return

        print("Seeding initial ShilpAI database...")

        # 1. Admin
        admin_user = User(
            email="admin@shilpai.in",
            phone="+91 98110 00001",
            full_name="Platform Administrator",
            role="admin",
            language_pref="en",
            hashed_password=get_password_hash("ShilpAI@2026"),
            is_active=True,
            is_verified=True
        )
        db.add(admin_user)

        # 2. Craft Clusters
        clusters = [
            CraftCluster(
                cluster_name="Varanasi Handloom Silk & Brocade Cluster",
                state="Uttar Pradesh",
                district="Varanasi",
                craft_type="Banarasi Silk Weaving",
                description="One of India's most celebrated textile clusters, known for intricate pit-loom jacquard brocades and authentic gold-silver zari work.",
                total_artisans=450,
                aggregate_monthly_capacity=3500,
                contact_lead="Shri Rameshwar Weaver Committee",
                contact_phone="+91 542 220011"
            ),
            CraftCluster(
                cluster_name="Kutch Rogan & Bandhani Heritage Cluster",
                state="Gujarat",
                district="Kachchh",
                craft_type="Rogan Art & Tie-Dye",
                description="Rare 400-year-old castor-oil based metal rod painting and intricate natural-dyed bandhani textiles.",
                total_artisans=180,
                aggregate_monthly_capacity=1200,
                contact_lead="Nirona Artisan Cooperative",
                contact_phone="+91 283 234567"
            ),
            CraftCluster(
                cluster_name="Channapatna Wooden Toys & Craft Cluster",
                state="Karnataka",
                district="Ramanagara",
                craft_type="Natural Lacquer Turned Woodcraft",
                description="GI-tagged Gombegala Ooru (toy-town) crafting safe, organic vegetable-dyed lacquer toys and kitchenware.",
                total_artisans=320,
                aggregate_monthly_capacity=8000,
                contact_lead="Channapatna Craft Federation",
                contact_phone="+91 80 272511"
            ),
            CraftCluster(
                cluster_name="Bastar Bell Metal & Dhokra Tribal Cluster",
                state="Chhattisgarh",
                district="Bastar",
                craft_type="Lost-Wax Dhokra Casting",
                description="Ancient 4000-year-old brass casting by tribal artisans producing rustic folk motifs and sacred figurines.",
                total_artisans=210,
                aggregate_monthly_capacity=1500,
                contact_lead="Bastar Shilpi Mahasangh",
                contact_phone="+91 778 221234"
            ),
            CraftCluster(
                cluster_name="Jaipur Blue Pottery Craft Cluster",
                state="Rajasthan",
                district="Jaipur",
                craft_type="Glazed Quartz Pottery",
                description="Unique no-clay pottery crafted from ground quartz stone, Fuller's earth, and natural copper oxide blues.",
                total_artisans=290,
                aggregate_monthly_capacity=4200,
                contact_lead="Jaipur Ceramic Guild",
                contact_phone="+91 141 238910"
            ),
            CraftCluster(
                cluster_name="Madhubani Mithila Folk Painting Cluster",
                state="Bihar",
                district="Madhubani",
                craft_type="Traditional Mithila Art",
                description="Intricate folk paintings created with twig brushes and organic plant dyes celebrating nature and mythic harmony.",
                total_artisans=520,
                aggregate_monthly_capacity=2200,
                contact_lead="Mithila Hastshilp Samiti",
                contact_phone="+91 627 622345"
            )
        ]
        for c in clusters:
            db.add(c)
        db.flush()

        # 3. Artisans
        # Artisan 1: Ramesh Kumar (Varanasi Silk)
        u_artisan1 = User(
            email="ramesh.varanasi@shilpai.in",
            phone="+91 94520 11223",
            full_name="Ramesh Kumar Ansari",
            role="artisan",
            language_pref="hi",
            hashed_password=get_password_hash("Artisan@2026"),
            is_active=True,
            is_verified=True
        )
        db.add(u_artisan1)
        db.flush()

        p_artisan1 = ArtisanProfile(
            user_id=u_artisan1.id,
            craft_name="Banarasi Silk Handloom Weaving",
            craft_category="Handloom & Textiles",
            state="Uttar Pradesh",
            district="Varanasi",
            cluster_id=clusters[0].id,
            experience_years=28,
            bio_en="Master weaver carrying forward 4 generations of traditional pit-loom silk weaving with hand-drawn zari motifs.",
            bio_hi="चार पीढ़ियों से बनारसी सिल्क हथकरघा बुनाई की पारंपरिक विरासत को आगे बढ़ा रहे राष्ट्रीय स्तर के मास्टर बुनकर।",
            capacity_per_month=45,
            available_units=30,
            trust_score=4.9,
            orders_completed=38,
            rating_avg=4.9,
            verification_status="verified"
        )
        db.add(p_artisan1)

        # Artisan 2: Meera Ben (Kutch)
        u_artisan2 = User(
            email="meera.kutch@shilpai.in",
            phone="+91 98251 44332",
            full_name="Meera Khatri",
            role="artisan",
            language_pref="hi",
            hashed_password=get_password_hash("Artisan@2026"),
            is_active=True,
            is_verified=True
        )
        db.add(u_artisan2)
        db.flush()

        p_artisan2 = ArtisanProfile(
            user_id=u_artisan2.id,
            craft_name="Traditional Rogan Art & Bandhani",
            craft_category="Folk Paintings & Art",
            state="Gujarat",
            district="Kachchh",
            cluster_id=clusters[1].id,
            experience_years=19,
            bio_en="Preserving endangered Rogan art using boiled castor oil paste drawn meticulously with an iron stylus.",
            bio_hi="उबले हुए अरंडी के तेल के प्राकृतिक पेस्ट और लोहे की सुई से लुप्तप्राय रोगन कला को सहेज रहीं विशेषज्ञ शिल्पकार।",
            capacity_per_month=25,
            available_units=18,
            trust_score=4.8,
            orders_completed=22,
            rating_avg=4.85,
            verification_status="verified"
        )
        db.add(p_artisan2)

        # Artisan 3: Basavaraj (Channapatna)
        u_artisan3 = User(
            email="basavaraj.channapatna@shilpai.in",
            phone="+91 94481 99887",
            full_name="Basavaraj Gowda",
            role="artisan",
            language_pref="en",
            hashed_password=get_password_hash("Artisan@2026"),
            is_active=True,
            is_verified=True
        )
        db.add(u_artisan3)
        db.flush()

        p_artisan3 = ArtisanProfile(
            user_id=u_artisan3.id,
            craft_name="Channapatna Lacquer Woodcraft",
            craft_category="Woodcraft & Toys",
            state="Karnataka",
            district="Ramanagara",
            cluster_id=clusters[2].id,
            experience_years=15,
            bio_en="Specializing in certified non-toxic organic lacquer wooden educational toys and eco-friendly home accents.",
            bio_hi="प्राकृतिक आवेरी लकड़ी और वानस्पतिक रंगों से सुरक्षित व पर्यावरण-अनुकूल खिलौने तैयार करने वाले कुशल कारीगर।",
            capacity_per_month=200,
            available_units=140,
            trust_score=4.7,
            orders_completed=56,
            rating_avg=4.75,
            verification_status="verified"
        )
        db.add(p_artisan3)
        db.flush()

        # 4. Buyers
        u_buyer1 = User(
            email="procurement@fabcraft.com",
            phone="+91 99100 22334",
            full_name="FabCraft India Procurement Team",
            role="buyer",
            language_pref="en",
            hashed_password=get_password_hash("Buyer@2026"),
            is_active=True,
            is_verified=True
        )
        db.add(u_buyer1)
        db.flush()

        p_buyer1 = BuyerProfile(
            user_id=u_buyer1.id,
            organization_name="FabCraft Retail Chain India",
            business_type="Boutique & Retail Chain",
            gstin="07AAAAF1234F1Z5",
            city="New Delhi",
            state="Delhi",
            delivery_address="Plot 44, Okhla Phase III, New Delhi 110020",
            procurement_needs="Authentic handloom silk sarees, GI-tagged crafts, and natural wooden decor for seasonal retail.",
            verified_status="verified"
        )
        db.add(p_buyer1)

        u_buyer2 = User(
            email="boutique@swadeshiheritage.org",
            phone="+91 98200 77665",
            full_name="Swadeshi Heritage Export Guild",
            role="buyer",
            language_pref="en",
            hashed_password=get_password_hash("Buyer@2026"),
            is_active=True,
            is_verified=True
        )
        db.add(u_buyer2)
        db.flush()

        p_buyer2 = BuyerProfile(
            user_id=u_buyer2.id,
            organization_name="Swadeshi Heritage Export Guild",
            business_type="Export House",
            gstin="27AABCS5678G2Z1",
            city="Mumbai",
            state="Maharashtra",
            delivery_address="Nariman Point, World Trade Centre, Mumbai 400021",
            procurement_needs="High-end handloom textiles and collectible tribal metal figurines for European retail partners.",
            verified_status="verified"
        )
        db.add(p_buyer2)
        db.flush()

        # 5. Products & Passports
        products_data = [
            {
                "artisan": p_artisan1,
                "category": "Handloom & Textiles",
                "craft_type": "Banarasi Kadhwa Silk",
                "title_en": "Pure Katan Silk Banarasi Saree with Antique Gold Zari",
                "title_hi": "एंटीक गोल्ड ज़री युक्त शुद्ध कातान सिल्क बनारसी साड़ी",
                "desc_en": "Woven on pit looms over 22 days using pure mulberry silk and authentic metallic zari threads. The kadhwa weave technique ensures motifs appear embossed with no loose threads behind.",
                "desc_hi": "22 दिनों की निरंतर साधना से गड्ढा करघे पर बुनी गई शुद्ध कातान सिल्क साड़ी। कढ़वा तकनीक से तैयार बारीक बूटियां और नक्काशीदार पल्लू।",
                "materials": "Pure Katan Mulberry Silk, Tested Zari",
                "dimensions": "5.5m Saree + 0.8m Blouse Piece",
                "weight_kg": 0.85,
                "fragility": "Low",
                "cost_price": 5400.0,
                "target_margin_pct": 32.0,
                "selling_price": 7950.0,
                "stock": 12,
                "img": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80"
            },
            {
                "artisan": p_artisan1,
                "category": "Handloom & Textiles",
                "craft_type": "Banarasi Brocade",
                "title_en": "Handwoven Mulberry Silk Stole with Floral Boota",
                "title_hi": "पुष्प बूटा नक्काशीदार हथकरघा शहतूत सिल्क स्टोल",
                "desc_en": "Lightweight pure silk stole woven with floral jaal pattern and subtle gold selvedge. Ideal for contemporary styling and ethnic occasions.",
                "desc_hi": "पारंपरिक बनारसी पुष्प जाल और सुनहरी किनारी से सज्जित शुद्ध रेशम का हल्का व आकर्षक स्टोल।",
                "materials": "100% Fine Mulberry Silk",
                "dimensions": "2.0m x 0.7m",
                "weight_kg": 0.25,
                "fragility": "Low",
                "cost_price": 1250.0,
                "target_margin_pct": 35.0,
                "selling_price": 1920.0,
                "stock": 25,
                "img": "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?auto=format&fit=crop&w=800&q=80"
            },
            {
                "artisan": p_artisan2,
                "category": "Folk Paintings & Art",
                "craft_type": "Kutch Rogan Art",
                "title_en": "Heritage Tree of Life Rogan Art Framed Masterpiece",
                "title_hi": "पारंपरिक कल्पवृक्ष (ट्री ऑफ लाइफ) रोगन कला फ्रेम कृति",
                "desc_en": "Intricate Tree of Life painted with cast-iron stylus using natural boiled castor oil paste on dark khadi cloth. Each line is hand-threaded without stencils.",
                "desc_hi": "काले खादी वस्त्र पर उबले अरंडी तेल के प्राकृतिक पेस्ट से लोहे की सुई द्वारा उकेरा गया पारंपरिक कल्पवृक्ष। हर रेखा हाथों के संतुलन का कमाल है।",
                "materials": "Boiled Castor Oil Paste, Handspun Khadi, Organic Pigments",
                "dimensions": "45cm x 60cm",
                "weight_kg": 1.2,
                "fragility": "Medium",
                "cost_price": 2800.0,
                "target_margin_pct": 40.0,
                "selling_price": 4650.0,
                "stock": 8,
                "img": "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80"
            },
            {
                "artisan": p_artisan3,
                "category": "Woodcraft & Toys",
                "craft_type": "Channapatna Turnwood",
                "title_en": "Organic Lacquer Wooden Stacking Rings & Toy Train Set",
                "title_hi": "प्राकृतिक लाख से रंगी चन्नपटना लकड़ी की छल्ला व खिलौना ट्रेन",
                "desc_en": "Handcrafted on traditional wood lathes using safe Wrightia tinctoria wood and natural vegetable dyes (turmeric, indigo). 100% child-safe, BPA-free, and heirloom quality.",
                "desc_hi": "पारंपरिक खराद पर आवेरी लकड़ी से बनी बच्चों की खिलौना ट्रेन व रिंग सेट। हल्दी व नील के वानस्पतिक रंगों से सुरक्षित पॉलिश।",
                "materials": "Wrightia Tinctoria (Ivory Wood), Natural Shellac, Herbal Dyes",
                "dimensions": "32cm x 12cm x 10cm",
                "weight_kg": 0.65,
                "fragility": "Medium",
                "cost_price": 520.0,
                "target_margin_pct": 35.0,
                "selling_price": 800.0,
                "stock": 40,
                "img": "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80"
            },
            {
                "artisan": p_artisan3,
                "category": "Woodcraft & Toys",
                "craft_type": "Channapatna Craft",
                "title_en": "Artisan Turned Lacquer Salt & Pepper Shaker Set",
                "title_hi": "प्राकृतिक लाख से पॉलिश लकड़ी का सॉल्ट-पेपर शेकर सेट",
                "desc_en": "Glossy ergonomic tableware turned by hand with lustrous natural resin finish. Waterproof, food-safe, and sustainable.",
                "desc_hi": "प्राकृतिक लाख की प्राकृतिक चमक से तैयार सुंदर व टिकाऊ टेबलवेयर सेट। खाद्य-सुरक्षित व पर्यावरण-हितैषी।",
                "materials": "Seasoned Ivory Wood, Natural Lac Resin",
                "dimensions": "15cm x 6cm x 6cm",
                "weight_kg": 0.3,
                "fragility": "Low",
                "cost_price": 310.0,
                "target_margin_pct": 38.0,
                "selling_price": 500.0,
                "stock": 60,
                "img": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80"
            }
        ]

        created_products = []
        for pd in products_data:
            prod = Product(
                artisan_id=pd["artisan"].id,
                category=pd["category"],
                craft_type=pd["craft_type"],
                title_en=pd["title_en"],
                title_hi=pd["title_hi"],
                description_en=pd["desc_en"],
                description_hi=pd["desc_hi"],
                materials=pd["materials"],
                dimensions=pd["dimensions"],
                weight_kg=pd["weight_kg"],
                fragility=pd["fragility"],
                status="published",
                cost_price=pd["cost_price"],
                target_margin_pct=pd["target_margin_pct"],
                selling_price=pd["selling_price"],
                views_count=42,
                inquiries_count=5
            )
            db.add(prod)
            db.flush()

            # Image
            p_img = ProductImage(
                product_id=prod.id,
                original_url=pd["img"],
                enhanced_url=pd["img"],
                is_primary=True,
                background_removed=False
            )
            db.add(p_img)

            # Inventory
            inv = Inventory(
                product_id=prod.id,
                total_stock=pd["stock"],
                reserved_stock=4,
                reorder_level=5
            )
            db.add(inv)

            # Pricing rec
            rec = pricing_service.calculate_recommendation(
                raw_material_cost=pd["cost_price"] * 0.55,
                labor_cost=pd["cost_price"] * 0.35,
                packaging_cost=pd["cost_price"] * 0.06,
                overhead_cost=pd["cost_price"] * 0.04,
                target_margin_pct=pd["target_margin_pct"]
            )
            p_rec = PriceRecommendation(
                product_id=prod.id,
                raw_material_cost=rec["raw_material_cost"],
                labor_cost=rec["labor_cost"],
                packaging_cost=rec["packaging_cost"],
                overhead_cost=rec["overhead_cost"],
                transport_cost=0.0,
                total_cost=rec["total_cost"],
                target_margin_pct=rec["target_margin_pct"],
                min_recommended_price=rec["min_recommended_price"],
                target_recommended_price=rec["target_recommended_price"],
                max_recommended_price=rec["max_recommended_price"],
                underpricing_warning=False,
                confidence_score=0.95,
                calculation_notes=rec["calculation_notes"]
            )
            db.add(p_rec)

            # Craft Passport
            code = f"SHILP-{uuid.uuid4().hex[:8].upper()}"
            qr_url = passport_service.generate_craft_passport_qr(code)
            story = passport_service.create_craft_story(
                craft_type=prod.craft_type,
                artisan_name=pd["artisan"].user.full_name,
                region=f"{pd['artisan'].district}, {pd['artisan'].state}"
            )
            cp = CraftPassport(
                product_id=prod.id,
                public_code=code,
                qr_code_url=qr_url,
                craft_story_en=story["story_en"],
                craft_story_hi=story["story_hi"],
                heritage_notes=story["heritage_notes"],
                materials_certified=story["materials_certified"],
                region_badge=story["region_badge"],
                is_active=True
            )
            db.add(cp)
            created_products.append(prod)

        db.flush()

        # 6. Sample Inquiries & Quotations
        inquiry1 = Inquiry(
            buyer_id=p_buyer1.id,
            product_id=created_products[0].id,
            artisan_id=p_artisan1.id,
            quantity=20,
            target_price_per_unit=7500.0,
            delivery_deadline="November 20, 2026",
            buyer_notes="Looking for 20 sarees for our prime Diwali festive window display in Delhi flagship store.",
            status="quoted"
        )
        db.add(inquiry1)
        db.flush()

        quote1 = Quotation(
            inquiry_id=inquiry1.id,
            artisan_id=p_artisan1.id,
            buyer_id=p_buyer1.id,
            product_id=created_products[0].id,
            unit_price=7600.0,
            quantity=20,
            total_amount=152000.0,
            lead_time_days=18,
            shipping_terms="Express Door-to-Door Insured Air Courier",
            status="accepted",
            notes="Honored to craft this batch. Using tested gold zari with individual silk certification tags."
        )
        db.add(quote1)
        db.flush()

        # Confirmed Order from Quote 1
        order1 = Order(
            order_number="SHILP-ORD-2026-8812",
            buyer_id=p_buyer1.id,
            quotation_id=quote1.id,
            total_amount=152000.0,
            status="in_production",
            delivery_address=p_buyer1.delivery_address
        )
        db.add(order1)
        db.flush()

        item1 = OrderItem(
            order_id=order1.id,
            product_id=created_products[0].id,
            quantity=20,
            unit_price=7600.0,
            subtotal=152000.0
        )
        db.add(item1)

        m_list = [
            OrderMilestone(order_id=order1.id, stage="confirmed", title="Quotation Accepted & Order Confirmed", notes="Agreed at ₹7,600/unit for 20 units."),
            OrderMilestone(order_id=order1.id, stage="in_production", title="Pit Looms Set & Raw Silk Doffing Started", notes="Warp & weft warping completed. Weaving batch in progress.")
        ]
        for m in m_list:
            db.add(m)

        # Sample Delivered Order with Review
        order2 = Order(
            order_number="SHILP-ORD-2026-7734",
            buyer_id=p_buyer2.id,
            total_amount=24000.0,
            status="delivered",
            delivery_address=p_buyer2.delivery_address
        )
        db.add(order2)
        db.flush()

        item2 = OrderItem(
            order_id=order2.id,
            product_id=created_products[3].id,
            quantity=30,
            unit_price=800.0,
            subtotal=24000.0
        )
        db.add(item2)

        shipment2 = Shipment(
            order_id=order2.id,
            carrier_name="India Post Speed Post",
            tracking_number="EK928374829IN",
            origin_address="Ramanagara Craft Centre, Karnataka",
            destination_address=p_buyer2.delivery_address,
            weight_kg=19.5,
            estimated_delivery="Delivered",
            current_status="Delivered to Consignee",
            delivered_date=datetime.datetime.utcnow()
        )
        db.add(shipment2)

        rev2 = Review(
            order_id=order2.id,
            product_id=created_products[3].id,
            buyer_id=p_buyer2.id,
            rating=5,
            review_text="Outstanding craftsmanship! Natural lacquer finish is flawless and smooth. European clients are ecstatic with the non-toxic wooden toys. Digital Craft Passport QR was a huge hit with customers.",
            sentiment="positive",
            recurring_themes="safe materials, pristine lacquer gloss, QR passport verified"
        )
        db.add(rev2)

        # Financials for Ramesh
        exp1 = Expense(
            artisan_id=p_artisan1.id,
            expense_type="material",
            amount=42000.0,
            description="Pure mulberry silk yarn cones (5 kg) from government silk depot",
            product_id=created_products[0].id
        )
        exp2 = Expense(
            artisan_id=p_artisan1.id,
            expense_type="material",
            amount=18500.0,
            description="Tested metallic gold zari spools for temple borders",
            product_id=created_products[0].id
        )
        exp3 = Expense(
            artisan_id=p_artisan1.id,
            expense_type="labor",
            amount=22000.0,
            description="Wages paid to 3 assistant weavers for warp setting and shuttle work",
            product_id=created_products[0].id
        )
        db.add(exp1)
        db.add(exp2)
        db.add(exp3)

        rev_record = RevenueRecord(
            artisan_id=p_artisan1.id,
            order_id=order1.id,
            amount=152000.0,
            source="wholesale_bulk_order"
        )
        db.add(rev_record)

        # 7. Official Indian Government Schemes for Artisans
        schemes = [
            GovernmentScheme(
                scheme_name_en="PM Vishwakarma Scheme",
                scheme_name_hi="प्रधानमंत्री विश्वकर्मा योजना",
                nodal_ministry="Ministry of Micro, Small and Medium Enterprises (MoMSME)",
                description_en="Central Sector scheme providing holistic end-to-end support to traditional artisans and craftspeople. Includes PM Vishwakarma Certificate & ID Card, modern toolkit incentive of ₹15,000, basic & advanced skill training with ₹500/day stipend, and collateral-free enterprise credit up to ₹3,00,000 at concessional 5% interest rate.",
                description_hi="पारंपरिक कारीगरों और शिल्पकारों को समग्र सहायता प्रदान करने वाली केंद्रीय योजना। इसके तहत ₹15,000 का टूलकिट प्रोत्साहन, प्रशिक्षण के दौरान ₹500/दिन वजीफा, और बिना गारंटी 5% ब्याज दर पर ₹3 लाख तक का ऋण मिलता है।",
                eligibility_criteria="Artisans engaged in 18 notified traditional trades (including weavers, potters, toy-makers, sculptors). Minimum age 18 years. Not availed loans under similar credit schemes (PMEGP, Mudra) in the last 5 years.",
                benefits_summary="₹15,000 Toolkit Grant + ₹1,00,000 (Tranche 1) & ₹2,00,000 (Tranche 2) Collateral-Free Loan at 5% + Digital Transaction Incentives.",
                official_url="https://pmvishwakarma.gov.in",
                last_verified_date="October 2026"
            ),
            GovernmentScheme(
                scheme_name_en="One District One Product (ODOP) Scheme",
                scheme_name_hi="एक जनपद एक उत्पाद (ओडीओपी) योजना",
                nodal_ministry="Ministry of Commerce and Industry / State Govts",
                description_en="Transformative initiative to foster balanced regional development by promoting specialized district craft products. Provides subsidized participation in national/international exhibitions, Common Facility Centre (CFC) access, branding, and export logistics subsidies.",
                description_hi="प्रत्येक जिले के विशिष्ट पारंपरिक हस्तशिल्प और उत्पाद को वैश्विक पहचान दिलाने की योजना। राष्ट्रीय व अंतरराष्ट्रीय मेलों में भागीदारी, ब्रांडिंग और निर्यात सहायता।",
                eligibility_criteria="Artisans, weavers, and SHGs producing the designated ODOP craft of their registered district (e.g., Banarasi Silk for Varanasi, Wood Toys for Ramanagara).",
                benefits_summary="Up to 75% exhibition stall subsidy + Packaging and lab testing assistance + Direct e-marketplace onboarding support.",
                official_url="https://odop.commerce.gov.in",
                last_verified_date="October 2026"
            ),
            GovernmentScheme(
                scheme_name_en="Ambedkar Hastshilp Vikas Yojana (AHVY)",
                scheme_name_hi="आंबेडकर हस्तशिल्प विकास योजना",
                nodal_ministry="Office of the Development Commissioner (Handicrafts), Ministry of Textiles",
                description_en="Cluster-centric mobilization scheme to transform artisan clusters into self-sustaining community production enterprises through SHG formation, design development workshops, and technological upgradation.",
                description_hi="शिल्पकारों के क्लस्टर विकास, स्वयं सहायता समूहों के गठन और आधुनिक डिजाइन कार्यशालाओं के लिए वस्त्र मंत्रालय की योजना।",
                eligibility_criteria="Registered artisan SHGs, craft societies, NGOs, and cooperatives holding valid Pehchan Artisan Cards.",
                benefits_summary="Financial assistance for Common Facility Centres + Free technical toolkits + Exposure tours to export markets.",
                official_url="https://handicrafts.nic.in",
                last_verified_date="October 2026"
            ),
            GovernmentScheme(
                scheme_name_en="Pradhan Mantri MUDRA Yojana (PMMY) - Shishu & Kishore",
                scheme_name_hi="प्रधानमंत्री मुद्रा योजना (शिशु व किशोर)",
                nodal_ministry="Department of Financial Services, Ministry of Finance",
                description_en="Collateral-free micro loans to non-corporate, non-farm small/micro enterprises. Artisans can access 'Shishu' loans up to ₹50,000 for raw materials or 'Kishore' loans up to ₹5,00,000 for purchasing power-looms or equipment.",
                description_hi="लघु कारीगरों के लिए बिना किसी गारंटी के ₹50,000 (शिशु) से ₹5,00,000 (किशोर) तक का आसान व्यापार ऋण।",
                eligibility_criteria="Any Indian citizen with an artisan enterprise or viable micro-craft manufacturing proposal with a clean banking record.",
                benefits_summary="Zero processing fee for Shishu loans + No collateral requirement + Flexible working capital overdraft facility.",
                official_url="https://www.mudra.org.in",
                last_verified_date="October 2026"
            )
        ]
        for s in schemes:
            db.add(s)

        # Commit everything
        db.commit()
        print("Database successfully seeded with authentic Indian craft data, artisans, buyers, orders, and schemes.")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
