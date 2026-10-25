export type UserRole = 'artisan' | 'buyer' | 'cluster_manager' | 'admin';

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  language_pref: 'en' | 'hi';
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  profile?: any;
}

export interface ArtisanProfile {
  id: number;
  user_id: number;
  craft_name: string;
  craft_category: string;
  state: string;
  district: string;
  cluster_id?: number;
  experience_years: number;
  bio_en?: string;
  bio_hi?: string;
  capacity_per_month: number;
  available_units: number;
  trust_score: number;
  orders_completed: number;
  rating_avg: number;
  verification_status: string;
}

export interface BuyerProfile {
  id: number;
  user_id: number;
  organization_name: string;
  business_type: string;
  gstin?: string;
  city: string;
  state: string;
  delivery_address?: string;
  procurement_needs?: string;
  verified_status: string;
}

export interface ProductImage {
  id: number;
  original_url: string;
  enhanced_url?: string;
  is_primary: boolean;
  background_removed: boolean;
}

export interface Inventory {
  id: number;
  total_stock: number;
  reserved_stock: number;
  reorder_level: number;
}

export interface PriceRecommendation {
  raw_material_cost: number;
  labor_cost: number;
  packaging_cost: number;
  overhead_cost: number;
  transport_cost: number;
  total_cost: number;
  target_margin_pct: number;
  min_recommended_price: number;
  target_recommended_price: number;
  max_recommended_price: number;
  underpricing_warning: boolean;
  confidence_score: number;
  calculation_notes?: string;
}

export interface Product {
  id: number;
  artisan_id: number;
  category: string;
  craft_type: string;
  title_en: string;
  title_hi?: string;
  description_en: string;
  description_hi?: string;
  materials?: string;
  dimensions?: string;
  weight_kg: number;
  fragility: 'Low' | 'Medium' | 'High';
  status: 'draft' | 'processing' | 'published' | 'paused' | 'archived';
  cost_price: number;
  target_margin_pct: number;
  selling_price: number;
  views_count: number;
  inquiries_count: number;
  created_at: string;
  images: ProductImage[];
  inventory?: Inventory;
  price_recommendation?: PriceRecommendation;
  artisan_name?: string;
  artisan_state?: string;
  artisan_district?: string;
}

export interface Inquiry {
  id: number;
  buyer_id: number;
  product_id: number;
  artisan_id: number;
  quantity: number;
  target_price_per_unit?: number;
  delivery_deadline?: string;
  buyer_notes?: string;
  status: 'pending' | 'quoted' | 'rejected' | 'closed';
  created_at: string;
  product_title?: string;
  buyer_org?: string;
  artisan_name?: string;
}

export interface Quotation {
  id: number;
  inquiry_id?: number;
  artisan_id: number;
  buyer_id: number;
  product_id: number;
  unit_price: number;
  quantity: number;
  total_amount: number;
  lead_time_days: number;
  shipping_terms: string;
  status: 'sent' | 'accepted' | 'rejected' | 'revised';
  notes?: string;
  created_at: string;
  product_title?: string;
}

export interface OrderMilestone {
  id: number;
  stage: string;
  title: string;
  notes?: string;
  proof_image_url?: string;
  completed_at: string;
}

export interface Shipment {
  id: number;
  carrier_name: string;
  tracking_number: string;
  origin_address?: string;
  destination_address: string;
  weight_kg: number;
  estimated_delivery?: string;
  current_status: string;
  dispatch_date: string;
  delivered_date?: string;
}

export interface Order {
  id: number;
  order_number: string;
  buyer_id: number;
  quotation_id?: number;
  total_amount: number;
  status: string;
  delivery_address: string;
  created_at: string;
  items: Array<{
    id: number;
    product_id: number;
    quantity: number;
    unit_price: number;
    subtotal: number;
    product_title?: string;
  }>;
  milestones: OrderMilestone[];
  shipment?: Shipment;
  buyer_name?: string;
}

export interface PublicPassport {
  public_code: string;
  product_title: string;
  category: string;
  craft_type: string;
  image_url?: string;
  artisan_name: string;
  region: string;
  cluster_name?: string;
  craft_story: string;
  materials: string;
  heritage_notes?: string;
  verification_badge: string;
  created_at: string;
}

export interface GovernmentScheme {
  id: number;
  scheme_name_en: string;
  scheme_name_hi: string;
  nodal_ministry: string;
  description_en: string;
  description_hi: string;
  eligibility_criteria: string;
  benefits_summary: string;
  official_url: string;
  last_verified_date: string;
  checklist: Array<{
    key: string;
    label: string;
    completed: boolean;
  }>;
}

export interface SupplierMatchResult {
  artisan_id: number;
  artisan_name: string;
  craft_name: string;
  craft_category: string;
  state: string;
  district: string;
  cluster_name?: string;
  match_score: number;
  match_reasons: string[];
  monthly_capacity: number;
  available_units: number;
  trust_score: number;
  verification_status: string;
  sample_product_id?: number;
  sample_product_title?: string;
  sample_product_image?: string;
  typical_unit_price: number;
}
