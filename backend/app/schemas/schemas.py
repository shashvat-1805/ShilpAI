from typing import List, Optional, Any, Dict
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime

# Token & Auth
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: int
    full_name: str
    language_pref: str

class TokenData(BaseModel):
    user_id: Optional[int] = None
    role: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str = "artisan"  # artisan, buyer, cluster_manager, admin
    phone: Optional[str] = None
    language_pref: str = "en"  # "en" or "hi"
    # Optional profile details on registration
    craft_name: Optional[str] = None
    craft_category: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    organization_name: Optional[str] = None
    city: Optional[str] = None

class UserOut(BaseModel):
    id: int
    email: str
    phone: Optional[str] = None
    full_name: str
    role: str
    language_pref: str
    is_active: bool
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Profiles
class ArtisanProfileOut(BaseModel):
    id: int
    user_id: int
    craft_name: str
    craft_category: str
    state: str
    district: str
    cluster_id: Optional[int] = None
    experience_years: int
    bio_en: Optional[str] = None
    bio_hi: Optional[str] = None
    capacity_per_month: int
    available_units: int
    trust_score: float
    orders_completed: int
    rating_avg: float
    verification_status: str

    class Config:
        from_attributes = True

class ArtisanProfileUpdate(BaseModel):
    craft_name: Optional[str] = None
    craft_category: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    experience_years: Optional[int] = None
    bio_en: Optional[str] = None
    bio_hi: Optional[str] = None
    capacity_per_month: Optional[int] = None
    available_units: Optional[int] = None

class BuyerProfileOut(BaseModel):
    id: int
    user_id: int
    organization_name: str
    business_type: str
    gstin: Optional[str] = None
    city: str
    state: str
    delivery_address: Optional[str] = None
    procurement_needs: Optional[str] = None
    verified_status: str

    class Config:
        from_attributes = True

class BuyerProfileUpdate(BaseModel):
    organization_name: Optional[str] = None
    business_type: Optional[str] = None
    gstin: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    delivery_address: Optional[str] = None
    procurement_needs: Optional[str] = None

# Clusters
class CraftClusterOut(BaseModel):
    id: int
    cluster_name: str
    state: str
    district: str
    craft_type: str
    description: Optional[str] = None
    total_artisans: int
    aggregate_monthly_capacity: int
    contact_lead: Optional[str] = None

    class Config:
        from_attributes = True

# Products
class ProductImageOut(BaseModel):
    id: int
    original_url: str
    enhanced_url: Optional[str] = None
    is_primary: bool
    background_removed: bool

    class Config:
        from_attributes = True

class ProductVariantOut(BaseModel):
    id: int
    variant_name: str
    color: Optional[str] = None
    size: Optional[str] = None
    extra_price: float
    stock_quantity: int

    class Config:
        from_attributes = True

class ProductAttributeOut(BaseModel):
    id: int
    attribute_key: str
    attribute_value: str
    confidence_score: float
    is_confirmed: bool

    class Config:
        from_attributes = True

class InventoryOut(BaseModel):
    id: int
    total_stock: int
    reserved_stock: int
    reorder_level: int

    class Config:
        from_attributes = True

class PriceRecommendationOut(BaseModel):
    raw_material_cost: float
    labor_cost: float
    packaging_cost: float
    overhead_cost: float
    transport_cost: float
    total_cost: float
    target_margin_pct: float
    min_recommended_price: float
    target_recommended_price: float
    max_recommended_price: float
    underpricing_warning: bool
    confidence_score: float
    calculation_notes: Optional[str] = None

    class Config:
        from_attributes = True

class ProductOut(BaseModel):
    id: int
    artisan_id: int
    category: str
    craft_type: str
    title_en: str
    title_hi: Optional[str] = None
    description_en: str
    description_hi: Optional[str] = None
    materials: Optional[str] = None
    dimensions: Optional[str] = None
    weight_kg: float
    fragility: str
    status: str
    cost_price: float
    target_margin_pct: float
    selling_price: float
    views_count: int
    inquiries_count: int
    created_at: datetime
    images: List[ProductImageOut] = []
    inventory: Optional[InventoryOut] = None
    price_recommendation: Optional[PriceRecommendationOut] = None
    artisan_name: Optional[str] = None
    artisan_state: Optional[str] = None
    artisan_district: Optional[str] = None

    class Config:
        from_attributes = True

class ProductCreate(BaseModel):
    category: str
    craft_type: str
    title_en: str
    title_hi: Optional[str] = None
    description_en: str
    description_hi: Optional[str] = None
    materials: Optional[str] = None
    dimensions: Optional[str] = None
    weight_kg: float = 0.5
    fragility: str = "Medium"
    cost_price: float = 0.0
    target_margin_pct: float = 30.0
    selling_price: float
    initial_stock: int = 15
    image_url: Optional[str] = None

class ProductUpdate(BaseModel):
    title_en: Optional[str] = None
    title_hi: Optional[str] = None
    description_en: Optional[str] = None
    description_hi: Optional[str] = None
    category: Optional[str] = None
    craft_type: Optional[str] = None
    materials: Optional[str] = None
    dimensions: Optional[str] = None
    weight_kg: Optional[float] = None
    fragility: Optional[str] = None
    selling_price: Optional[float] = None
    cost_price: Optional[float] = None
    status: Optional[str] = None
    total_stock: Optional[int] = None

# Smart Cataloging & Voice
class VoiceCatalogRequest(BaseModel):
    transcript: str
    category_hint: Optional[str] = None
    language: str = "hi"  # "hi" or "en"

class CatalogGenerateRequest(BaseModel):
    category: str
    craft_type: str
    materials: str
    features: List[str] = []
    artisan_notes: Optional[str] = None

class CatalogGenerateResponse(BaseModel):
    category: str
    craft_type: str
    title_en: str
    title_hi: str
    description_en: str
    description_hi: str
    suggested_materials: str
    suggested_dimensions: str
    suggested_tags: List[str]
    detected_attributes: Dict[str, str]

# Pricing Calculator
class PricingCalculateRequest(BaseModel):
    raw_material_cost: float
    labor_cost: float
    packaging_cost: float = 0.0
    overhead_cost: float = 0.0
    transport_cost: float = 0.0
    target_margin_pct: float = 30.0
    quantity: int = 1

# Inquiries & Quotations
class InquiryCreate(BaseModel):
    product_id: int
    quantity: int = 50
    target_price_per_unit: Optional[float] = None
    delivery_deadline: Optional[str] = None
    buyer_notes: Optional[str] = None

class InquiryOut(BaseModel):
    id: int
    buyer_id: int
    product_id: int
    artisan_id: int
    quantity: int
    target_price_per_unit: Optional[float] = None
    delivery_deadline: Optional[str] = None
    buyer_notes: Optional[str] = None
    status: str
    created_at: datetime
    product_title: Optional[str] = None
    buyer_org: Optional[str] = None
    artisan_name: Optional[str] = None

    class Config:
        from_attributes = True

class QuotationCreate(BaseModel):
    inquiry_id: Optional[int] = None
    buyer_id: int
    product_id: int
    unit_price: float
    quantity: int
    lead_time_days: int = 14
    shipping_terms: str = "Standard Express - Included"
    notes: Optional[str] = None

class QuotationOut(BaseModel):
    id: int
    inquiry_id: Optional[int] = None
    artisan_id: int
    buyer_id: int
    product_id: int
    unit_price: float
    quantity: int
    total_amount: float
    lead_time_days: int
    shipping_terms: str
    status: str
    notes: Optional[str] = None
    created_at: datetime
    product_title: Optional[str] = None

    class Config:
        from_attributes = True

class QuotationRespond(BaseModel):
    action: str  # "accept", "reject", "revise"
    revised_unit_price: Optional[float] = None
    notes: Optional[str] = None

# Orders
class OrderCreate(BaseModel):
    quotation_id: Optional[int] = None
    product_id: int
    quantity: int
    unit_price: float
    delivery_address: str

class OrderMilestoneOut(BaseModel):
    id: int
    stage: str
    title: str
    notes: Optional[str] = None
    proof_image_url: Optional[str] = None
    completed_at: datetime

    class Config:
        from_attributes = True

class ShipmentOut(BaseModel):
    id: int
    carrier_name: str
    tracking_number: str
    origin_address: Optional[str] = None
    destination_address: str
    weight_kg: float
    estimated_delivery: Optional[str] = None
    current_status: str
    dispatch_date: datetime
    delivered_date: Optional[datetime] = None

    class Config:
        from_attributes = True

class OrderItemOut(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: float
    subtotal: float
    product_title: Optional[str] = None

    class Config:
        from_attributes = True

class OrderOut(BaseModel):
    id: int
    order_number: str
    buyer_id: int
    quotation_id: Optional[int] = None
    total_amount: float
    status: str
    delivery_address: str
    created_at: datetime
    items: List[OrderItemOut] = []
    milestones: List[OrderMilestoneOut] = []
    shipment: Optional[ShipmentOut] = None
    buyer_name: Optional[str] = None

    class Config:
        from_attributes = True

class MilestoneCreate(BaseModel):
    stage: str
    title: str
    notes: Optional[str] = None
    proof_image_url: Optional[str] = None

# Reviews
class ReviewCreate(BaseModel):
    order_id: int
    product_id: int
    rating: int = Field(ge=1, le=5)
    review_text: str

class ReviewOut(BaseModel):
    id: int
    order_id: int
    product_id: int
    buyer_id: int
    rating: int
    review_text: Optional[str] = None
    sentiment: str
    recurring_themes: Optional[str] = None
    artisan_reply: Optional[str] = None
    created_at: datetime
    buyer_name: Optional[str] = None

    class Config:
        from_attributes = True

# Craft Passport
class CraftPassportOut(BaseModel):
    id: int
    product_id: int
    public_code: str
    qr_code_url: str
    craft_story_en: str
    craft_story_hi: Optional[str] = None
    heritage_notes: Optional[str] = None
    materials_certified: Optional[str] = None
    region_badge: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class PublicCraftPassportOut(BaseModel):
    public_code: str
    product_title: str
    category: str
    craft_type: str
    image_url: Optional[str] = None
    artisan_name: str
    region: str
    cluster_name: Optional[str] = None
    craft_story: str
    materials: str
    heritage_notes: Optional[str] = None
    verification_badge: str
    created_at: datetime

# Marketing
class MarketingGenerateRequest(BaseModel):
    product_id: int
    festival_focus: Optional[str] = None

class MarketingAssetOut(BaseModel):
    id: int
    asset_type: str
    content_en: str
    content_hi: Optional[str] = None
    hashtags: Optional[str] = None

    class Config:
        from_attributes = True

# Finances
class ExpenseCreate(BaseModel):
    expense_type: str  # material, labor, packaging, transport, overhead, utilities, other
    amount: float
    description: str
    product_id: Optional[int] = None
    order_id: Optional[int] = None

class ExpenseOut(BaseModel):
    id: int
    expense_type: str
    amount: float
    description: str
    expense_date: datetime
    product_id: Optional[int] = None
    order_id: Optional[int] = None

    class Config:
        from_attributes = True

class FinancialSummaryOut(BaseModel):
    total_revenue: float
    total_expenses: float
    gross_profit: float
    gross_margin_pct: float
    expenses_by_type: Dict[str, float]
    low_margin_alerts: List[Dict[str, Any]]
    monthly_trend: List[Dict[str, Any]]

# Government Schemes
class GovernmentSchemeOut(BaseModel):
    id: int
    scheme_name_en: str
    scheme_name_hi: str
    nodal_ministry: str
    description_en: str
    description_hi: str
    eligibility_criteria: str
    benefits_summary: str
    official_url: str
    last_verified_date: str
    checklist: List[Dict[str, Any]] = []

    class Config:
        from_attributes = True

class SchemeChecklistToggle(BaseModel):
    scheme_id: int
    item_key: str
    is_completed: bool

# Matchmaking
class BuyerMatchRequest(BaseModel):
    category: str
    keywords: Optional[str] = None
    target_quantity: int = 50
    target_budget: Optional[float] = None
    state_preference: Optional[str] = None
    max_lead_time_days: Optional[int] = 30

class SupplierMatchResult(BaseModel):
    artisan_id: int
    artisan_name: str
    craft_name: str
    craft_category: str
    state: str
    district: str
    cluster_name: Optional[str] = None
    match_score: int  # 0 to 100
    match_reasons: List[str]
    monthly_capacity: int
    available_units: int
    trust_score: float
    verification_status: str
    sample_product_id: Optional[int] = None
    sample_product_title: Optional[str] = None
    sample_product_image: Optional[str] = None
    typical_unit_price: float

# AI Virtual Business Manager
class BusinessAssistantQuery(BaseModel):
    question: str
    language: str = "en"

class BusinessAssistantResponse(BaseModel):
    answer: str
    source_context: List[str]
    suggested_actions: List[Dict[str, str]]
    timestamp: datetime

# Packaging
class PackagingRecommendationRequest(BaseModel):
    dimensions: str
    weight_kg: float
    fragility: str  # Low, Medium, High
    quantity: int = 1
    destination_distance_km: int = 500

class PackagingRecommendationResponse(BaseModel):
    box_type: str
    cushioning_material: str
    outer_protection: str
    estimated_cost_inr: float
    checklist: List[str]
    shipping_notes: str

# Admin
class UserAdminView(BaseModel):
    id: int
    email: str
    full_name: str
    phone: Optional[str] = None
    role: str
    language_pref: str
    is_active: bool
    is_verified: bool
    created_at: datetime
    craft_or_org: Optional[str] = None

    class Config:
        from_attributes = True

class SystemHealthOut(BaseModel):
    database_status: str
    total_users: int
    total_artisans: int
    total_buyers: int
    total_products: int
    total_orders: int
    ai_status: str
    gemini_configured: bool
    uptime_seconds: float
