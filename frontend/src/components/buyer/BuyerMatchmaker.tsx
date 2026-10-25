import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { SupplierMatchResult } from '../../types';
import {
  Users, Sparkles, ShieldCheck, MapPin, CheckCircle2,
  Send, Package, Star, ArrowRight, RefreshCw, Sliders
} from 'lucide-react';

interface BuyerMatchmakerProps {
  onOpenProductDetail?: (productId: number) => void;
}

export const BuyerMatchmaker: React.FC<BuyerMatchmakerProps> = ({ onOpenProductDetail }) => {
  const { t, language } = useLanguage();

  const [category, setCategory] = useState<string>('Handloom & Textiles');
  const [targetQuantity, setTargetQuantity] = useState<number>(50);
  const [targetBudget, setTargetBudget] = useState<number>(7500);
  const [statePreference, setStatePreference] = useState<string>('All');
  const [keywords, setKeywords] = useState<string>('Pure Silk Handloom');
  const [results, setResults] = useState<SupplierMatchResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [inquiryModalSupplier, setInquiryModalSupplier] = useState<SupplierMatchResult | null>(null);

  const handleMatch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const data = await api.matchSuppliers({
        category,
        target_quantity: targetQuantity,
        target_budget: targetBudget,
        state_preference: statePreference === 'All' ? null : statePreference,
        keywords
      });
      setResults(data);
    } catch (err) {
      console.warn('Matchmaking failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleMatch();
  }, []);

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-[#23211E] to-[#2D5A43] rounded-2xl p-6 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-xs mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-200" /> Module G: AI B2B Matchmaking Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold">
            {t('nav.matchmaking')}
          </h1>
          <p className="text-xs text-emerald-100 mt-1 max-w-xl">
            Match procurement specifications with verified artisan cluster capacity, authentic GI credentials, and transparent criteria ranking scores.
          </p>
        </div>
      </div>

      {/* Matchmaking Query Form */}
      <form onSubmit={handleMatch} className="bg-white p-6 rounded-2xl border border-[#E8E2D8] shadow-sm space-y-4">
        <h3 className="font-serif font-bold text-base text-[#23211E] flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#C85A32]" /> Sourcing Criteria & Capacity Requirements:
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#23211E] mb-1">Craft Domain</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2.5 border border-[#E8E2D8] rounded-xl text-xs bg-[#FAF8F5] font-semibold text-[#23211E]"
            >
              <option value="Handloom & Textiles">Handloom & Textiles</option>
              <option value="Woodcraft & Toys">Woodcraft & Toys</option>
              <option value="Folk Paintings & Art">Folk Paintings & Art</option>
              <option value="Pottery & Terracotta">Pottery & Terracotta</option>
              <option value="Metalware & Dhokra">Metalware & Dhokra</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#23211E] mb-1">Bulk Order Quantity</label>
            <input
              type="number"
              min="5"
              max="5000"
              value={targetQuantity}
              onChange={(e) => setTargetQuantity(Number(e.target.value))}
              className="w-full p-2.5 border border-[#E8E2D8] rounded-xl text-xs bg-[#FAF8F5] font-bold text-[#C85A32]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#23211E] mb-1">Target Price / Unit (₹)</label>
            <input
              type="number"
              min="100"
              value={targetBudget}
              onChange={(e) => setTargetBudget(Number(e.target.value))}
              className="w-full p-2.5 border border-[#E8E2D8] rounded-xl text-xs bg-[#FAF8F5] font-bold text-[#23211E]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#23211E] mb-1">State Preference</label>
            <select
              value={statePreference}
              onChange={(e) => setStatePreference(e.target.value)}
              className="w-full p-2.5 border border-[#E8E2D8] rounded-xl text-xs bg-[#FAF8F5] font-semibold text-[#23211E]"
            >
              <option value="All">All India</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Gujarat">Gujarat</option>
              <option value="Rajasthan">Rajasthan</option>
              <option value="Bihar">Bihar</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#23211E] mb-1">Specific Craft Keywords / Materials</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="e.g. Mulberry Silk, Gold Zari, Kadhwa Weave, Non-Toxic Lacquer"
              className="flex-1 p-2.5 border border-[#E8E2D8] rounded-xl text-xs bg-[#FAF8F5]"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-[#2D5A43] hover:bg-[#1F3F2E] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-200" />}
              Find Ranked Suppliers
            </button>
          </div>
        </div>
      </form>

      {/* Match Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif font-bold text-lg text-[#23211E]">
            Ranked Artisan Suppliers ({results.length})
          </h3>
          <span className="text-xs text-[#8C827A]">
            Sorted by transparent composite match score
          </span>
        </div>

        {loading ? (
          <div className="bg-white p-12 rounded-2xl border border-[#E8E2D8] text-center text-xs text-[#5C5852] flex flex-col items-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-[#2D5A43]" />
            <span>Calculating criteria rankings against verified artisan capacities...</span>
          </div>
        ) : results.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-[#E8E2D8] text-center text-xs text-[#8C827A]">
            No matching suppliers found. Broaden criteria or adjust target quantity.
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((m) => (
              <div
                key={m.artisan_id}
                className="bg-white p-6 rounded-2xl border border-[#E8E2D8] shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                {/* Supplier Info */}
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-serif font-bold text-lg text-[#23211E]">{m.artisan_name}</span>
                    <span className="bg-[#EBF2EE] text-[#2D5A43] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-[#2D5A43]/20">
                      <ShieldCheck className="w-3 h-3" /> Pehchan Verified
                    </span>
                    <span className="text-xs text-[#D4A359] font-bold flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-[#D4A359]" /> {m.trust_score.toFixed(1)} Trust Score
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-[#C85A32]">
                    {m.craft_name} • {m.craft_category}
                  </p>

                  <div className="flex items-center gap-2 text-xs text-[#5C5852]">
                    <MapPin className="w-3.5 h-3.5 text-[#C85A32]" />
                    <span>{m.district}, {m.state} {m.cluster_name ? `• Cluster: ${m.cluster_name}` : ''}</span>
                  </div>

                  {/* Match Reasons Badges */}
                  <div className="pt-1 flex flex-wrap gap-1.5">
                    {m.match_reasons.map((r, rIdx) => (
                      <span key={rIdx} className="bg-[#FAF8F5] border border-[#E8E2D8] text-[#5C5852] text-[10px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" /> {r}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Capacity & Price Metrics */}
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-4 pt-4 md:pt-0 border-t md:border-t-0 border-[#F2ECE1]">
                  
                  {/* Match Score Badge */}
                  <div className="text-center md:text-right">
                    <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#EBF2EE] text-[#2D5A43] font-bold text-sm border border-[#2D5A43]/30">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{m.match_score}% Match</span>
                    </div>
                    <span className="block text-[10px] text-[#8C827A] mt-0.5">
                      Monthly Cap: {m.monthly_capacity} units
                    </span>
                  </div>

                  {/* Action */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#C85A32] hidden md:block">
                      Typical: ₹{m.typical_unit_price} / unit
                    </span>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
};
