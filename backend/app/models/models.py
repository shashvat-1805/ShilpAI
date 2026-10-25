import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey, Enum as SQLEnum, JSON, Index
)
from sqlalchemy.orm import relationship
from app.core.database import Base

class UserRole(str):
    ARTISAN = "artisan"
    BUYER = "buyer"
    CLUSTER_MANAGER = "cluster_manager"
    ADMIN = "admin"

class ProductStatus(str):
    DRAFT = "draft"
    PROCESSING = "processing"
    PUBLISHED = "published"
    PAUSED = "paused"
    ARCHIVED = "archived"

class OrderStatus(str):
    PLACED = "placed"
    CONFIRMED = "confirmed"
    IN_PRODUCTION = "in_production"
    QC_COMPLETED = "qc_completed"
    PACKAGED = "packaged"
    DISPATCHED = "dispatched"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(50), nullable=True)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default=UserRole.ARTISAN, nullable=False)
    language_pref = Column(String(10), default="en", nullable=False)  # "en" or "hi"
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    consent_given = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    artisan_profile = relationship("ArtisanProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    buyer_profile = relationship("BuyerProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="user")
    ai_jobs = relationship("AIJob", back_populates="user")
    verification_records = relationship("VerificationRecord", back_populates="user", foreign_keys="VerificationRecord.user_id")

class CraftCluster(Base):
    __tablename__ = "craft_clusters"

    id = Column(Integer, primary_key=True, index=True)
    cluster_name = Column(String(255), nullable=False)
    state = Column(String(100), nullable=False, index=True)
    district = Column(String(100), nullable=False, index=True)
    craft_type = Column(String(100), nullable=False, index=True)
    description = Column(Text, nullable=True)
    total_artisans = Column(Integer, default=0)
    aggregate_monthly_capacity = Column(Integer, default=0)
    contact_lead = Column(String(255), nullable=True)
    contact_phone = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    artisans = relationship("ArtisanProfile", back_populates="cluster")

class ArtisanProfile(Base):
    __tablename__ = "artisan_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    craft_name = Column(String(255), nullable=False, index=True)
    craft_category = Column(String(100), nullable=False, index=True)
    state = Column(String(100), nullable=False, index=True)
    district = Column(String(100), nullable=False, index=True)
    cluster_id = Column(Integer, ForeignKey("craft_clusters.id", ondelete="SET NULL"), nullable=True)
    experience_years = Column(Integer, default=1)
    bio_en = Column(Text, nullable=True)
    bio_hi = Column(Text, nullable=True)
    capacity_per_month = Column(Integer, default=50)
    available_units = Column(Integer, default=50)
    trust_score = Column(Float, default=4.5)
    orders_completed = Column(Integer, default=0)
    rating_avg = Column(Float, default=4.8)
    verification_status = Column(String(50), default="verified")  # unverified, pending, verified
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="artisan_profile")
    cluster = relationship("CraftCluster", back_populates="artisans")
    products = relationship("Product", back_populates="artisan", cascade="all, delete-orphan")
    expenses = relationship("Expense", back_populates="artisan", cascade="all, delete-orphan")
    revenues = relationship("RevenueRecord", back_populates="artisan", cascade="all, delete-orphan")
    design_suggestions = relationship("DesignSuggestion", back_populates="artisan", cascade="all, delete-orphan")
    allocations = relationship("ProductionAllocation", back_populates="artisan")

class BuyerProfile(Base):
    __tablename__ = "buyer_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    organization_name = Column(String(255), nullable=False)
    business_type = Column(String(100), default="Retailer")  # Retailer, Exporter, Boutique, Corporate, NGO
    gstin = Column(String(50), nullable=True)
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    delivery_address = Column(Text, nullable=True)
    procurement_needs = Column(Text, nullable=True)
    verified_status = Column(String(50), default="verified")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="buyer_profile")
    inquiries = relationship("Inquiry", back_populates="buyer", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="buyer", cascade="all, delete-orphan")
    favorites = relationship("Favorite", back_populates="buyer", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="buyer", cascade="all, delete-orphan")

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    org_type = Column(String(100), default="Procurement Partner")
    contact_email = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    address = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    artisan_id = Column(Integer, ForeignKey("artisan_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    category = Column(String(100), nullable=False, index=True)
    craft_type = Column(String(100), nullable=False, index=True)
    title_en = Column(String(255), nullable=False)
    title_hi = Column(String(255), nullable=True)
    description_en = Column(Text, nullable=False)
    description_hi = Column(Text, nullable=True)
    materials = Column(String(255), nullable=True)
    dimensions = Column(String(100), nullable=True)
    weight_kg = Column(Float, default=0.5)
    fragility = Column(String(50), default="Medium")  # Low, Medium, High
    status = Column(String(50), default=ProductStatus.DRAFT, nullable=False, index=True)
    
    # Financials & Pricing
    cost_price = Column(Float, default=0.0)
    target_margin_pct = Column(Float, default=30.0)
    selling_price = Column(Float, default=0.0, nullable=False, index=True)
    
    # Engagement metrics
    views_count = Column(Integer, default=0)
    inquiries_count = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    artisan = relationship("ArtisanProfile", back_populates="products")
    images = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan")
    variants = relationship("ProductVariant", back_populates="product", cascade="all, delete-orphan")
    attributes = relationship("ProductAttribute", back_populates="product", cascade="all, delete-orphan")
    inventory = relationship("Inventory", back_populates="product", uselist=False, cascade="all, delete-orphan")
    price_recommendation = relationship("PriceRecommendation", back_populates="product", uselist=False, cascade="all, delete-orphan")
    pricing_history = relationship("PricingHistory", back_populates="product", cascade="all, delete-orphan")
    craft_passport = relationship("CraftPassport", back_populates="product", uselist=False, cascade="all, delete-orphan")
    craft_story = relationship("CraftStory", back_populates="product", uselist=False, cascade="all, delete-orphan")
    marketing_assets = relationship("MarketingAsset", back_populates="product", cascade="all, delete-orphan")
    inquiries = relationship("Inquiry", back_populates="product", cascade="all, delete-orphan")
    order_items = relationship("OrderItem", back_populates="product")
    reviews = relationship("Review", back_populates="product")
    favorites = relationship("Favorite", back_populates="product")

class ProductImage(Base):
    __tablename__ = "product_images"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    original_url = Column(String(500), nullable=False)
    enhanced_url = Column(String(500), nullable=True)
    is_primary = Column(Boolean, default=True)
    background_removed = Column(Boolean, default=False)
    enhancement_details = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    product = relationship("Product", back_populates="images")

class ProductVariant(Base):
    __tablename__ = "product_variants"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    variant_name = Column(String(100), nullable=False)
    color = Column(String(50), nullable=True)
    size = Column(String(50), nullable=True)
    extra_price = Column(Float, default=0.0)
    stock_quantity = Column(Integer, default=10)

    product = relationship("Product", back_populates="variants")

class ProductAttribute(Base):
    __tablename__ = "product_attributes"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    attribute_key = Column(String(100), nullable=False)
    attribute_value = Column(String(255), nullable=False)
    confidence_score = Column(Float, default=0.95)
    is_confirmed = Column(Boolean, default=True)

    product = relationship("Product", back_populates="attributes")

class Inventory(Base):
    __tablename__ = "inventories"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), unique=True, nullable=False)
    total_stock = Column(Integer, default=20, nullable=False)
    reserved_stock = Column(Integer, default=0, nullable=False)
    reorder_level = Column(Integer, default=5, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    product = relationship("Product", back_populates="inventory")

class PriceRecommendation(Base):
    __tablename__ = "price_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), unique=True, nullable=False)
    raw_material_cost = Column(Float, default=0.0, nullable=False)
    labor_cost = Column(Float, default=0.0, nullable=False)
    packaging_cost = Column(Float, default=0.0, nullable=False)
    overhead_cost = Column(Float, default=0.0, nullable=False)
    transport_cost = Column(Float, default=0.0, nullable=False)
    total_cost = Column(Float, default=0.0, nullable=False)
    target_margin_pct = Column(Float, default=30.0, nullable=False)
    min_recommended_price = Column(Float, nullable=False)
    target_recommended_price = Column(Float, nullable=False)
    max_recommended_price = Column(Float, nullable=False)
    underpricing_warning = Column(Boolean, default=False)
    confidence_score = Column(Float, default=0.92)
    calculation_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    product = relationship("Product", back_populates="price_recommendation")

class PricingHistory(Base):
    __tablename__ = "pricing_histories"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    old_price = Column(Float, nullable=False)
    new_price = Column(Float, nullable=False)
    changed_by = Column(String(100), default="artisan")
    reason = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    product = relationship("Product", back_populates="pricing_history")

class Inquiry(Base):
    __tablename__ = "inquiries"

    id = Column(Integer, primary_key=True, index=True)
    buyer_id = Column(Integer, ForeignKey("buyer_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    artisan_id = Column(Integer, ForeignKey("artisan_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    quantity = Column(Integer, default=50, nullable=False)
    target_price_per_unit = Column(Float, nullable=True)
    delivery_deadline = Column(String(100), nullable=True)
    buyer_notes = Column(Text, nullable=True)
    status = Column(String(50), default="pending")  # pending, quoted, rejected, closed
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    buyer = relationship("BuyerProfile", back_populates="inquiries")
    product = relationship("Product", back_populates="inquiries")
    quotations = relationship("Quotation", back_populates="inquiry", cascade="all, delete-orphan")

class Quotation(Base):
    __tablename__ = "quotations"

    id = Column(Integer, primary_key=True, index=True)
    inquiry_id = Column(Integer, ForeignKey("inquiries.id", ondelete="SET NULL"), nullable=True)
    artisan_id = Column(Integer, ForeignKey("artisan_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    buyer_id = Column(Integer, ForeignKey("buyer_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    unit_price = Column(Float, nullable=False)
    quantity = Column(Integer, nullable=False)
    total_amount = Column(Float, nullable=False)
    lead_time_days = Column(Integer, default=14)
    shipping_terms = Column(String(255), default="Standard Express - Included")
    status = Column(String(50), default="sent")  # sent, accepted, rejected, revised
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    inquiry = relationship("Inquiry", back_populates="quotations")
    buyer = relationship("BuyerProfile")
    product = relationship("Product")
    orders = relationship("Order", back_populates="quotation")

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(50), unique=True, index=True, nullable=False)
    buyer_id = Column(Integer, ForeignKey("buyer_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    quotation_id = Column(Integer, ForeignKey("quotations.id", ondelete="SET NULL"), nullable=True)
    total_amount = Column(Float, nullable=False)
    status = Column(String(50), default=OrderStatus.PLACED, nullable=False, index=True)
    delivery_address = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    buyer = relationship("BuyerProfile", back_populates="orders")
    quotation = relationship("Quotation", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    milestones = relationship("OrderMilestone", back_populates="order", cascade="all, delete-orphan")
    allocations = relationship("ProductionAllocation", back_populates="order", cascade="all, delete-orphan")
    shipment = relationship("Shipment", back_populates="order", uselist=False, cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="order", cascade="all, delete-orphan")

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    subtotal = Column(Float, nullable=False)

    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")

class ProductionAllocation(Base):
    __tablename__ = "production_allocations"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
    artisan_id = Column(Integer, ForeignKey("artisan_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    units_allocated = Column(Integer, nullable=False)
    units_completed = Column(Integer, default=0)
    status = Column(String(50), default="in_progress")
    allocated_at = Column(DateTime, default=datetime.datetime.utcnow)
    deadline = Column(DateTime, nullable=True)

    order = relationship("Order", back_populates="allocations")
    artisan = relationship("ArtisanProfile", back_populates="allocations")

class OrderMilestone(Base):
    __tablename__ = "order_milestones"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
    stage = Column(String(50), nullable=False)  # placed, confirmed, production_started, qc_inspected, packaged, dispatched, delivered
    title = Column(String(255), nullable=False)
    notes = Column(Text, nullable=True)
    proof_image_url = Column(String(500), nullable=True)
    completed_at = Column(DateTime, default=datetime.datetime.utcnow)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    order = relationship("Order", back_populates="milestones")

class Shipment(Base):
    __tablename__ = "shipments"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), unique=True, nullable=False)
    carrier_name = Column(String(100), default="India Post / Speed Post")
    tracking_number = Column(String(100), nullable=False, index=True)
    origin_address = Column(Text, nullable=True)
    destination_address = Column(Text, nullable=False)
    weight_kg = Column(Float, default=1.0)
    estimated_delivery = Column(String(100), nullable=True)
    current_status = Column(String(50), default="In Transit")
    dispatch_date = Column(DateTime, default=datetime.datetime.utcnow)
    delivered_date = Column(DateTime, nullable=True)

    order = relationship("Order", back_populates="shipment")

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    buyer_id = Column(Integer, ForeignKey("buyer_profiles.id", ondelete="CASCADE"), nullable=False)
    rating = Column(Integer, default=5, nullable=False)
    review_text = Column(Text, nullable=True)
    sentiment = Column(String(50), default="positive")  # positive, neutral, negative
    recurring_themes = Column(String(255), default="authentic craftsmanship, sturdy packaging")
    artisan_reply = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    order = relationship("Order", back_populates="reviews")
    product = relationship("Product", back_populates="reviews")
    buyer = relationship("BuyerProfile", back_populates="reviews")

class Favorite(Base):
    __tablename__ = "favorites"

    id = Column(Integer, primary_key=True, index=True)
    buyer_id = Column(Integer, ForeignKey("buyer_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    buyer = relationship("BuyerProfile", back_populates="favorites")
    product = relationship("Product", back_populates="favorites")

class CraftPassport(Base):
    __tablename__ = "craft_passports"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), unique=True, nullable=False)
    public_code = Column(String(100), unique=True, index=True, nullable=False)
    qr_code_url = Column(String(500), nullable=False)
    craft_story_en = Column(Text, nullable=False)
    craft_story_hi = Column(Text, nullable=True)
    heritage_notes = Column(Text, nullable=True)
    materials_certified = Column(String(255), nullable=True)
    region_badge = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    product = relationship("Product", back_populates="craft_passport")

class CraftStory(Base):
    __tablename__ = "craft_stories"

    id = Column(Integer, primary_key=True, index=True)
    artisan_id = Column(Integer, ForeignKey("artisan_profiles.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), unique=True, nullable=False)
    tradition_narrative = Column(Text, nullable=False)
    technique_summary = Column(Text, nullable=False)
    family_heritage = Column(Text, nullable=True)
    regional_significance = Column(Text, nullable=True)
    approved_by_artisan = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    product = relationship("Product", back_populates="craft_story")

class MarketingAsset(Base):
    __tablename__ = "marketing_assets"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    artisan_id = Column(Integer, ForeignKey("artisan_profiles.id", ondelete="CASCADE"), nullable=False)
    asset_type = Column(String(50), nullable=False)  # instagram, facebook, whatsapp, festival_campaign, reel_script, b2b_catalog_sheet
    content_en = Column(Text, nullable=False)
    content_hi = Column(Text, nullable=True)
    hashtags = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    product = relationship("Product", back_populates="marketing_assets")

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    artisan_id = Column(Integer, ForeignKey("artisan_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="SET NULL"), nullable=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="SET NULL"), nullable=True)
    expense_type = Column(String(50), nullable=False)  # material, labor, packaging, transport, overhead, other
    amount = Column(Float, nullable=False)
    description = Column(String(255), nullable=False)
    expense_date = Column(DateTime, default=datetime.datetime.utcnow)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    artisan = relationship("ArtisanProfile", back_populates="expenses")

class RevenueRecord(Base):
    __tablename__ = "revenue_records"

    id = Column(Integer, primary_key=True, index=True)
    artisan_id = Column(Integer, ForeignKey("artisan_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="SET NULL"), nullable=True)
    amount = Column(Float, nullable=False)
    source = Column(String(100), default="marketplace_sale")
    recorded_date = Column(DateTime, default=datetime.datetime.utcnow)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    artisan = relationship("ArtisanProfile", back_populates="revenues")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    link = Column(String(255), nullable=True)
    notification_type = Column(String(50), default="order")  # order, inquiry, system, warning, marketing
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="notifications")

class GovernmentScheme(Base):
    __tablename__ = "government_schemes"

    id = Column(Integer, primary_key=True, index=True)
    scheme_name_en = Column(String(255), nullable=False)
    scheme_name_hi = Column(String(255), nullable=False)
    nodal_ministry = Column(String(255), nullable=False)
    description_en = Column(Text, nullable=False)
    description_hi = Column(Text, nullable=False)
    eligibility_criteria = Column(Text, nullable=False)
    benefits_summary = Column(Text, nullable=False)
    official_url = Column(String(500), nullable=False)
    last_verified_date = Column(String(50), default="October 2026")

    checklists = relationship("SchemeChecklist", back_populates="scheme", cascade="all, delete-orphan")

class SchemeChecklist(Base):
    __tablename__ = "scheme_checklists"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    scheme_id = Column(Integer, ForeignKey("government_schemes.id", ondelete="CASCADE"), nullable=False)
    item_key = Column(String(100), nullable=False)
    item_label = Column(String(255), nullable=False)
    is_completed = Column(Boolean, default=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    scheme = relationship("GovernmentScheme", back_populates="checklists")

class DesignSuggestion(Base):
    __tablename__ = "design_suggestions"

    id = Column(Integer, primary_key=True, index=True)
    artisan_id = Column(Integer, ForeignKey("artisan_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    category = Column(String(100), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    color_palette = Column(String(255), nullable=False)
    suggested_motifs = Column(String(255), nullable=True)
    buyer_feedback_basis = Column(Text, nullable=True)
    inspiration_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    artisan = relationship("ArtisanProfile", back_populates="design_suggestions")

class AIJob(Base):
    __tablename__ = "ai_jobs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    job_type = Column(String(50), nullable=False)
    status = Column(String(50), default="completed")  # pending, processing, completed, failed
    input_data = Column(JSON, nullable=True)
    output_data = Column(JSON, nullable=True)
    error_message = Column(Text, nullable=True)
    latency_ms = Column(Integer, default=120)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="ai_jobs")

class AIEvent(Base):
    __tablename__ = "ai_events"

    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String(100), nullable=False)
    task_name = Column(String(100), nullable=False)
    latency_ms = Column(Integer, default=150)
    status = Column(String(50), default="success")
    confidence_score = Column(Float, default=0.95)
    user_feedback = Column(String(50), nullable=True)  # helpful, neutral, unhelpful
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class VerificationRecord(Base):
    __tablename__ = "verification_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    id_type = Column(String(50), default="Artisan Card / Pehchan Card")
    id_number_masked = Column(String(100), nullable=False)
    document_url = Column(String(500), nullable=True)
    reviewer_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    review_notes = Column(Text, nullable=True)
    status = Column(String(50), default="verified")  # pending, verified, rejected
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", foreign_keys=[user_id], back_populates="verification_records")

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    reporter_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    reported_product_id = Column(Integer, ForeignKey("products.id", ondelete="SET NULL"), nullable=True)
    reported_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    reason = Column(String(255), nullable=False)
    details = Column(Text, nullable=True)
    status = Column(String(50), default="pending")  # pending, resolved, dismissed
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action = Column(String(100), nullable=False)
    resource_type = Column(String(100), nullable=False)
    resource_id = Column(String(100), nullable=True)
    details = Column(Text, nullable=True)
    ip_address = Column(String(50), nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="audit_logs")
