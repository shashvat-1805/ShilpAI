import React, { useState } from 'react';
import { Product } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  X, ShieldCheck, QrCode, MapPin, Send, CheckCircle2,
  Package, Sparkles, AlertCircle
} from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onOpenPassport: (code: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose, onOpenPassport }) => {
  const { currentUser } = useAuth();
  const { t, language } = useLanguage();

  const [quantity, setQuantity] = useState<number>(25);
  const [targetPrice, setTargetPrice] = useState<number>(product ? product.selling_price : 0);
  const [deadline, setDeadline] = useState<string>('30 Days');
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [inquirySent, setInquirySent] = useState<boolean>(false);

  if (!product) return null;

  const handleSendInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      alert('Please sign in as a buyer to submit a wholesale inquiry.');
      return;
    }
    setSubmitting(true);
    try {
      await api.createInquiry({
        product_id: product.id,
        quantity,
        target_price_per_unit: targetPrice,
        delivery_deadline: deadline,
        buyer_notes: notes
      });
      setInquirySent(true);
    } catch (err: any) {
      alert('Error sending inquiry: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const primaryImg = product.images && product.images.length > 0
    ? (product.images[0].enhanced_url || product.images[0].original_url)
    : '/placeholder-craft.jpg';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-[#FAF8F5] rounded-2xl shadow-2xl border border-[#E8E2D8] w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-[#23211E] text-white p-4 flex items-center justify-between border-b border-[#3D3A35]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-[#D4A359] uppercase tracking-wider">
              {product.category}
            </span>
            <span className="text-xs text-[#8C827A]">•</span>
            <span className="text-xs text-[#D6D3D1]">{product.craft_type}</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-[#A8A29E] hover:text-white hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Image & Badges */}
            <div className="space-y-3">
              <div className="aspect-square rounded-2xl overflow-hidden border border-[#E8E2D8] bg-black/5 relative">
                <img src={primaryImg} alt={product.title_en} className="w-full h-full object-cover" />
                <span className="absolute top-3 left-3 bg-[#2D5A43] text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow">
                  <ShieldCheck className="w-3 h-3" /> GI Provenance Verified
                </span>
              </div>

              {/* QR Passport Button */}
              <button
                onClick={() => onOpenPassport(`SHILP-${product.id}`)}
                className="w-full py-2.5 rounded-xl border border-[#C85A32] bg-[#F7EAE4] hover:bg-[#C85A32] text-[#C85A32] hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs"
              >
                <QrCode className="w-4 h-4" /> View Public Digital Craft Passport
              </button>
            </div>

            {/* Details & Specs */}
            <div className="space-y-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#23211E]">{product.title_en}</h2>
                {product.title_hi && <p className="text-xs text-[#8C827A] mt-0.5">{product.title_hi}</p>}
                
                <div className="flex items-center gap-1.5 text-xs text-[#5C5852] mt-2">
                  <MapPin className="w-3.5 h-3.5 text-[#C85A32]" />
                  <span>Master Artisan: <strong>{product.artisan_name || 'Traditional Maker'}</strong> ({product.artisan_district}, {product.artisan_state})</span>
                </div>
              </div>

              <div className="p-3.5 bg-white rounded-xl border border-[#E8E2D8] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#8C827A] uppercase font-bold block">Wholesale Base Price</span>
                  <span className="font-serif text-2xl font-bold text-[#C85A32]">₹{product.selling_price.toLocaleString()}</span>
                  <span className="text-[10px] text-[#8C827A] block">Direct Artisan Price (No Markups)</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#8C827A] uppercase font-bold block">Available Stock</span>
                  <span className="text-sm font-bold text-emerald-800">
                    {product.inventory?.total_stock || 15} units ready
                  </span>
                </div>
              </div>

              {/* Narrative */}
              <div>
                <h4 className="text-xs font-bold text-[#23211E] mb-1">Craft Description & Technique:</h4>
                <p className="text-xs text-[#5C5852] leading-relaxed">
                  {language === 'hi' && product.description_hi ? product.description_hi : product.description_en}
                </p>
              </div>

              {/* Specifications table */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-[#FAF8F5] p-3 rounded-xl border border-[#E8E2D8]">
                <div>
                  <span className="text-[#8C827A] block text-[10px]">Materials:</span>
                  <span className="font-semibold text-[#23211E]">{product.materials || 'Natural materials'}</span>
                </div>
                <div>
                  <span className="text-[#8C827A] block text-[10px]">Dimensions:</span>
                  <span className="font-semibold text-[#23211E]">{product.dimensions || 'Standard'}</span>
                </div>
                <div>
                  <span className="text-[#8C827A] block text-[10px]">Weight:</span>
                  <span className="font-semibold text-[#23211E]">{product.weight_kg} kg</span>
                </div>
                <div>
                  <span className="text-[#8C827A] block text-[10px]">Fragility Level:</span>
                  <span className="font-semibold text-[#23211E]">{product.fragility}</span>
                </div>
              </div>

            </div>

          </div>

          {/* Wholesale RFQ / Inquiry Section */}
          <div className="bg-white p-5 rounded-2xl border border-[#E8E2D8] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#F2ECE1] pb-2">
              <h3 className="font-serif font-bold text-base text-[#23211E] flex items-center gap-1.5">
                <Send className="w-4 h-4 text-[#C85A32]" /> Submit Bulk Inquiry / Request Quotation (RFQ)
              </h3>
              <span className="text-[10px] font-bold text-[#2D5A43] bg-[#EBF2EE] px-2 py-0.5 rounded-full">
                Direct to Artisan
              </span>
            </div>

            {inquirySent ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 flex items-center gap-2 text-xs font-semibold">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Your wholesale inquiry was submitted! The artisan has received an alert and will respond with a formal quotation.</span>
              </div>
            ) : (
              <form onSubmit={handleSendInquiry} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#23211E] mb-1">Quantity Needed</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="w-full p-2 border border-[#E8E2D8] rounded-xl text-xs bg-[#FAF8F5] font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#23211E] mb-1">Target Price / Unit (₹)</label>
                    <input
                      type="number"
                      required
                      value={targetPrice}
                      onChange={(e) => setTargetPrice(Number(e.target.value))}
                      className="w-full p-2 border border-[#E8E2D8] rounded-xl text-xs bg-[#FAF8F5] font-semibold text-[#C85A32]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#23211E] mb-1">Delivery Need Date</label>
                    <input
                      type="text"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      placeholder="e.g. Within 25 Days"
                      className="w-full p-2 border border-[#E8E2D8] rounded-xl text-xs bg-[#FAF8F5]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#23211E] mb-1">Customization / Requirements Notes</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Need individual boutique packaging with branded tags"
                    className="w-full p-2 border border-[#E8E2D8] rounded-xl text-xs bg-[#FAF8F5]"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-[#C85A32] hover:bg-[#A44321] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {submitting ? 'Submitting...' : 'Submit Wholesale Inquiry'}
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
