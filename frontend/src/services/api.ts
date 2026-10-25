const API_BASE = '/api/v1';

function getAuthHeader(): HeadersInit {
  const token = localStorage.getItem('shilpai_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const api = {
  // Auth
  async login(email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Login failed');
    }
    return res.json();
  },

  async register(data: any) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Registration failed');
    }
    return res.json();
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to fetch user profile');
    return res.json();
  },

  async updateLanguage(lang: 'en' | 'hi') {
    const res = await fetch(`${API_BASE}/auth/language?lang=${lang}`, {
      method: 'PUT',
      headers: getAuthHeader()
    });
    return res.json();
  },

  // Products & Studio
  async getProducts(params: Record<string, any> = {}) {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') q.append(k, String(v));
    });
    const res = await fetch(`${API_BASE}/products?${q.toString()}`, {
      headers: getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  },

  async getProduct(id: number) {
    const res = await fetch(`${API_BASE}/products/${id}`);
    if (!res.ok) throw new Error('Product not found');
    return res.json();
  },

  async createProduct(data: any) {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to create product');
    }
    return res.json();
  },

  async updateProduct(id: number, data: any) {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update product');
    return res.json();
  },

  async analyzeImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/products/analyze-image`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: formData
    });
    if (!res.ok) throw new Error('Image analysis failed');
    return res.json();
  },

  async enhanceImage(imageUrl: string, action: 'enhance' | 'remove_bg' | 'lifestyle' = 'enhance') {
    const formData = new FormData();
    formData.append('image_url', imageUrl);
    formData.append('action', action);
    const res = await fetch(`${API_BASE}/products/enhance-image`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: formData
    });
    if (!res.ok) throw new Error('Image enhancement failed');
    return res.json();
  },

  // Zero-Form Catalog
  async catalogFromVoice(transcript: string, language: string = 'hi', categoryHint?: string) {
    const res = await fetch(`${API_BASE}/catalog/from-voice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ transcript, language, category_hint: categoryHint })
    });
    if (!res.ok) throw new Error('Voice cataloging failed');
    return res.json();
  },

  // Dynamic Pricing
  async recommendPricing(data: {
    raw_material_cost: number;
    labor_cost: number;
    packaging_cost?: number;
    overhead_cost?: number;
    target_margin_pct?: number;
  }) {
    const res = await fetch(`${API_BASE}/pricing/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Pricing calculation failed');
    return res.json();
  },

  // B2B Matchmaking
  async matchSuppliers(data: any) {
    const res = await fetch(`${API_BASE}/buyers/match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Matchmaking failed');
    return res.json();
  },

  async getFavorites() {
    const res = await fetch(`${API_BASE}/buyers/favorites`, {
      headers: getAuthHeader()
    });
    return res.json();
  },

  async toggleFavorite(productId: number) {
    const res = await fetch(`${API_BASE}/buyers/favorites/${productId}`, {
      method: 'POST',
      headers: getAuthHeader()
    });
    return res.json();
  },

  // Inquiries & Quotations
  async createInquiry(data: {
    product_id: number;
    quantity: number;
    target_price_per_unit?: number;
    delivery_deadline?: string;
    buyer_notes?: string;
  }) {
    const res = await fetch(`${API_BASE}/inquiries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create inquiry');
    return res.json();
  },

  async getMyInquiries() {
    const res = await fetch(`${API_BASE}/inquiries/my`, {
      headers: getAuthHeader()
    });
    return res.json();
  },

  async createQuotation(data: any) {
    const res = await fetch(`${API_BASE}/quotations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create quotation');
    return res.json();
  },

  async getMyQuotations() {
    const res = await fetch(`${API_BASE}/quotations/my`, {
      headers: getAuthHeader()
    });
    return res.json();
  },

  async respondToQuotation(id: number, action: 'accept' | 'reject' | 'revise', revisedPrice?: number, notes?: string) {
    const res = await fetch(`${API_BASE}/quotations/${id}/respond`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ action, revised_unit_price: revisedPrice, notes })
    });
    if (!res.ok) throw new Error('Failed to respond to quotation');
    return res.json();
  },

  // Orders & Fulfillment
  async createDirectOrder(data: any) {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create order');
    return res.json();
  },

  async getMyOrders() {
    const res = await fetch(`${API_BASE}/orders/my`, {
      headers: getAuthHeader()
    });
    return res.json();
  },

  async getOrder(id: number) {
    const res = await fetch(`${API_BASE}/orders/${id}`, {
      headers: getAuthHeader()
    });
    return res.json();
  },

  async advanceMilestone(orderId: number, stage: string, title: string, notes?: string) {
    const res = await fetch(`${API_BASE}/orders/${orderId}/milestones`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ stage, title, notes })
    });
    return res.json();
  },

  async updateShipment(orderId: number, carrier: string, trackingNumber: string) {
    const q = new URLSearchParams({ carrier_name: carrier, tracking_number: trackingNumber });
    const res = await fetch(`${API_BASE}/orders/${orderId}/shipment?${q.toString()}`, {
      method: 'POST',
      headers: getAuthHeader()
    });
    return res.json();
  },

  // Craft Passport
  async getPublicPassport(publicCode: string) {
    const res = await fetch(`${API_BASE}/craft-passport/public/${publicCode}`);
    if (!res.ok) throw new Error('Passport not found');
    return res.json();
  },

  async getProductPassport(productId: number) {
    const res = await fetch(`${API_BASE}/craft-passport/${productId}`);
    return res.json();
  },

  // Marketing
  async generateMarketingPack(productId: number, festivalFocus?: string) {
    const res = await fetch(`${API_BASE}/marketing/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ product_id: productId, festival_focus: festivalFocus })
    });
    return res.json();
  },

  // Packaging
  async getPackagingAdvice(data: any) {
    const res = await fetch(`${API_BASE}/packaging/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Schemes
  async getSchemes(q?: string) {
    const url = q ? `${API_BASE}/schemes?q=${encodeURIComponent(q)}` : `${API_BASE}/schemes`;
    const res = await fetch(url, {
      headers: getAuthHeader()
    });
    return res.json();
  },

  async toggleSchemeChecklist(schemeId: number, itemKey: string, isCompleted: boolean) {
    const res = await fetch(`${API_BASE}/schemes/checklist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ scheme_id: schemeId, item_key: itemKey, is_completed: isCompleted })
    });
    return res.json();
  },

  // Finances
  async getFinancialSummary() {
    const res = await fetch(`${API_BASE}/finances/summary`, {
      headers: getAuthHeader()
    });
    return res.json();
  },

  async logExpense(data: { expense_type: string; amount: number; description: string; product_id?: number }) {
    const res = await fetch(`${API_BASE}/finances/expenses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Feedback & Reviews
  async submitReview(data: { order_id: number; product_id: number; rating: number; review_text: string }) {
    const res = await fetch(`${API_BASE}/feedback/review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async getProductReviews(productId: number) {
    const res = await fetch(`${API_BASE}/feedback/product/${productId}`);
    return res.json();
  },

  // Clusters & Craft Map
  async getClusters(params: Record<string, string> = {}) {
    const q = new URLSearchParams(params);
    const res = await fetch(`${API_BASE}/clusters?${q.toString()}`);
    return res.json();
  },

  async getClusterDetail(id: number) {
    const res = await fetch(`${API_BASE}/clusters/${id}`);
    return res.json();
  },

  // AI Virtual Business Manager
  async askBusinessManager(question: string, language: string = 'en') {
    const res = await fetch(`${API_BASE}/ai-manager/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ question, language })
    });
    return res.json();
  },

  async getDailyBrief() {
    const res = await fetch(`${API_BASE}/ai-manager/daily-brief`, {
      headers: getAuthHeader()
    });
    return res.json();
  },

  // Admin
  async getAllUsers() {
    const res = await fetch(`${API_BASE}/admin/users`, {
      headers: getAuthHeader()
    });
    return res.json();
  },

  async verifyArtisan(userId: number) {
    const res = await fetch(`${API_BASE}/admin/verify-artisan/${userId}`, {
      method: 'POST',
      headers: getAuthHeader()
    });
    return res.json();
  },

  async toggleUserStatus(userId: number) {
    const res = await fetch(`${API_BASE}/admin/toggle-user-status/${userId}`, {
      method: 'POST',
      headers: getAuthHeader()
    });
    return res.json();
  },

  async getSystemHealth() {
    const res = await fetch(`${API_BASE}/admin/health`, {
      headers: getAuthHeader()
    });
    return res.json();
  },

  async getAuditLogs() {
    const res = await fetch(`${API_BASE}/admin/audit-logs`, {
      headers: getAuthHeader()
    });
    return res.json();
  },

  // Notifications
  async getNotifications() {
    const res = await fetch(`${API_BASE}/notifications`, {
      headers: getAuthHeader()
    });
    return res.json();
  },

  async markNotificationRead(id: number) {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PUT',
      headers: getAuthHeader()
    });
    return res.json();
  }
};
