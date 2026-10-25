import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { Product } from '../../types';
import { ProductDetailModal } from './ProductDetailModal';
import {
  Search, Filter, ShoppingBag, MapPin, ShieldCheck,
  Star, Sparkles, Heart, Eye, ArrowUpDown, RefreshCw
} from 'lucide-react';

interface BuyerMarketplaceProps {
  onOpenPassport: (code: string) => void;
  onOpenStudio?: () => void;
}

export const BuyerMarketplace: React.FC<BuyerMarketplaceProps> = ({ onOpenPassport, onOpenStudio }) => {
  const { t, language } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedState, setSelectedState] = useState<string>('All');
  const [activeModalProduct, setActiveModalProduct] = useState<Product | null>(null);

  const CATEGORIES = [
    'All',
    'Handloom & Textiles',
    'Woodcraft & Toys',
    'Folk Paintings & Art',
    'Pottery & Terracotta',
    'Metalware & Dhokra'
  ];

  const STATES = [
    'All',
    'Uttar Pradesh',
    'Karnataka',
    'Gujarat',
    'Rajasthan',
    'Bihar',
    'Chhattisgarh'
  ];

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {};
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (selectedState !== 'All') params.state = selectedState;
      if (searchQuery.trim()) params.q = searchQuery;

      const data = await api.getProducts(params);
      setProducts(data);
    } catch (err) {
      console.warn('Failed to fetch marketplace products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, selectedState]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Hero Welcome Bar */}
      <div className="bg-gradient-to-r from-[#23211E] via-[#352F2B] to-[#23211E] rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-15 pointer-events-none bg-[radial-gradient(#D4A359_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold backdrop-blur-xs text-amber-200 mb-3 border border-white/10">
            <Sparkles className="w-3.5 h-3.5" /> Direct Artisan-To-Enterprise Market Linkage
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
            {language === 'hi' ? 'भारतीय कारीगरों का डिजिटल बाज़ार' : 'India’s Living Craft Marketplace'}
          </h1>
          <p className="text-sm text-[#D6D3D1] mt-2 leading-relaxed">
            Discover authentic GI-tagged handlooms, tribal folk paintings, lacquer woodcraft, and terracotta directly from master artisans and verified rural clusters.
          </p>

          {/* Quick Search Bar */}
          <form onSubmit={handleSearchSubmit} className="mt-6 flex items-center gap-2 bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/20">
            <div className="flex-1 flex items-center gap-2 px-3">
              <Search className="w-4 h-4 text-amber-200" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'hi' ? 'साड़ी, मिट्टी के बर्तन, खिलौने या शिल्पकार खोजें...' : 'Search sarees, wooden toys, dhokra brass, or master artisans...'}
                className="w-full bg-transparent text-xs text-white placeholder:text-[#A8A29E] focus:outline-hidden"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#C85A32] hover:bg-[#A44321] text-white text-xs font-bold transition-all shadow-md"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#E8E2D8]">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-[#C85A32] text-white shadow-xs'
                : 'bg-white text-[#5C5852] hover:bg-[#F2ECE1] border border-[#E8E2D8]'
            }`}
          >
            {cat}
          </button>
        ))}

        {/* State filter dropdown */}
        <div className="ml-auto flex items-center gap-2 pl-4">
          <MapPin className="w-3.5 h-3.5 text-[#C85A32]" />
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="p-1.5 rounded-xl border border-[#E8E2D8] text-xs bg-white font-semibold text-[#23211E]"
          >
            {STATES.map((st) => (
              <option key={st} value={st}>{st === 'All' ? 'All Indian States' : st}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="bg-white p-16 rounded-2xl border border-[#E8E2D8] text-center text-xs text-[#5C5852] flex flex-col items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-[#C85A32]" />
          <span>Fetching handcrafted listings directly from artisan clusters...</span>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-[#E8E2D8] text-center text-xs text-[#8C827A] space-y-2">
          <ShoppingBag className="w-8 h-8 text-[#8C827A] mx-auto" />
          <p className="font-semibold text-sm text-[#23211E]">No listings matched your criteria.</p>
          <p>Try resetting filters or explore other traditional craft categories.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((p) => {
            const primaryImg = p.images && p.images.length > 0
              ? (p.images[0].enhanced_url || p.images[0].original_url)
              : '/placeholder-craft.jpg';

            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-[#E8E2D8] overflow-hidden shadow-xs hover:shadow-md hover:border-[#C85A32]/40 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Image Container with Badges */}
                  <div className="relative aspect-4/3 overflow-hidden bg-black/5">
                    <img
                      src={primaryImg}
                      alt={p.title_en}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    <span className="absolute top-2.5 left-2.5 bg-[#23211E]/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" /> Verified
                    </span>

                    <span className="absolute bottom-2.5 right-2.5 bg-white/90 backdrop-blur-xs text-[#23211E] text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                      Stock: {p.inventory?.total_stock || 15}
                    </span>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-bold text-[#C85A32] uppercase tracking-wider">
                      <span>{p.category}</span>
                      <span className="text-[#8C827A]">{p.craft_type}</span>
                    </div>

                    <h3 className="font-serif font-bold text-sm text-[#23211E] line-clamp-1 group-hover:text-[#C85A32] transition-colors">
                      {p.title_en}
                    </h3>
                    
                    {p.title_hi && (
                      <p className="text-[11px] text-[#8C827A] line-clamp-1 font-normal">
                        {p.title_hi}
                      </p>
                    )}

                    <div className="flex items-center gap-1 text-[11px] text-[#5C5852] pt-1">
                      <MapPin className="w-3 h-3 text-[#C85A32] shrink-0" />
                      <span className="truncate">{p.artisan_name || 'Master Artisan'} ({p.artisan_district}, {p.artisan_state})</span>
                    </div>

                    <p className="text-xs text-[#5C5852] line-clamp-2 pt-1 leading-relaxed">
                      {p.description_en}
                    </p>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="p-4 pt-0 border-t border-[#F2ECE1] mt-3 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] text-[#8C827A] uppercase font-bold block">Wholesale Rate</span>
                    <span className="font-serif text-lg font-bold text-[#C85A32]">
                      ₹{p.selling_price.toLocaleString()}
                    </span>
                  </div>

                  <button
                    onClick={() => setActiveModalProduct(p)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#23211E] hover:bg-[#C85A32] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" /> Quote / View
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Product Detail Modal */}
      {activeModalProduct && (
        <ProductDetailModal
          product={activeModalProduct}
          onClose={() => setActiveModalProduct(null)}
          onOpenPassport={onOpenPassport}
        />
      )}

    </div>
  );
};
