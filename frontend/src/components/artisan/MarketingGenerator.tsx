import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { Product } from '../../types';
import {
  Sparkles, Copy, Check, Share2, MessageCircle,
  Film, FileText, Download, Calendar, RefreshCw
} from 'lucide-react';

export const MarketingGenerator: React.FC = () => {
  const { t, language } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [festivalFocus, setFestivalFocus] = useState<string>('Diwali Festive Season');
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    api.getProducts({ artisan_only: true })
      .then((data: Product[]) => {
        setProducts(data);
        if (data.length > 0) {
          setSelectedProductId(data[0].id);
          loadOrGenerate(data[0].id);
        }
      })
      .catch(() => {});
  }, []);

  const loadOrGenerate = async (productId: number) => {
    setLoading(true);
    try {
      const generated = await api.generateMarketingPack(productId, festivalFocus);
      setAssets(generated);
    } catch (err) {
      console.warn('Failed to generate marketing pack');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleDownloadPack = () => {
    if (assets.length === 0) return;
    const selectedProd = products.find(p => p.id === selectedProductId);
    const prodTitle = selectedProd ? selectedProd.title_en : 'Artisan Product';
    
    let content = `SHILPAI MARKETING PACK: ${prodTitle}\n`;
    content += `Generated on: ${new Date().toLocaleDateString()}\n`;
    content += `Festival Theme: ${festivalFocus}\n\n`;
    content += `==============================================\n\n`;

    assets.forEach((a) => {
      content += `[${a.asset_type.toUpperCase()}]\n`;
      content += `ENGLISH:\n${a.content_en}\n\n`;
      if (a.content_hi) {
        content += `HINDI:\n${a.content_hi}\n\n`;
      }
      if (a.hashtags) {
        content += `HASHTAGS:\n${a.hashtags}\n\n`;
      }
      content += `----------------------------------------------\n\n`;
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ShilpAI_Marketing_${selectedProductId}.txt`;
    link.click();
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-[#2D5A43] to-[#1F3F2E] rounded-2xl p-6 text-white shadow-lg mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-xs mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-200" /> Module L & K: AI Social Media & Marketing Generator
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold">
            {t('marketing.title')}
          </h1>
          <p className="text-xs text-emerald-100 mt-1 max-w-2xl">
            Turn your handmade craft into ready-to-post Instagram captions, WhatsApp broadcast notes, festival campaign copy, and video reel scripts in Hindi & English.
          </p>
        </div>

        {assets.length > 0 && (
          <button
            onClick={handleDownloadPack}
            className="px-4 py-2 rounded-xl bg-white text-[#2D5A43] font-bold text-xs hover:bg-emerald-50 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-4 h-4" /> Download Complete Pack
          </button>
        )}
      </div>

      {/* Product & Campaign Selector Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E8E2D8] shadow-sm mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          <label className="text-xs font-bold text-[#23211E] whitespace-nowrap">Select Craft Item:</label>
          <select
            value={selectedProductId || ''}
            onChange={(e) => {
              const id = Number(e.target.value);
              setSelectedProductId(id);
              loadOrGenerate(id);
            }}
            className="p-2 border border-[#E8E2D8] rounded-xl text-xs bg-[#FAF8F5] font-semibold text-[#23211E] w-full max-w-md"
          >
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.title_en} (₹{p.selling_price})</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-[#23211E] whitespace-nowrap">Occasion / Theme:</label>
          <select
            value={festivalFocus}
            onChange={(e) => {
              setFestivalFocus(e.target.value);
              if (selectedProductId) loadOrGenerate(selectedProductId);
            }}
            className="p-2 border border-[#E8E2D8] rounded-xl text-xs bg-[#FAF8F5] font-semibold text-[#23211E]"
          >
            <option value="Diwali & Dhanteras Festive Season">Diwali & Dhanteras Festive Season</option>
            <option value="Wedding Season & Trousseau Gifting">Wedding Season & Trousseau Gifting</option>
            <option value="Navratri & Dussehra Celebrations">Navratri & Dussehra Celebrations</option>
            <option value="Contemporary Minimalist Home Decor">Contemporary Home Decor</option>
            <option value="Corporate Sustainable Gifting">Corporate Gifting</option>
          </select>
        </div>
      </div>

      {/* Marketing Assets Grid */}
      {loading ? (
        <div className="bg-white p-12 rounded-2xl border border-[#E8E2D8] text-center text-xs text-[#5C5852] flex flex-col items-center gap-2">
          <RefreshCw className="w-6 h-6 animate-spin text-[#C85A32]" />
          <span>Generating AI marketing assets in Hindi & English...</span>
        </div>
      ) : assets.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-[#E8E2D8] text-center text-xs text-[#8C827A]">
          No products found. Create a product in the AI Studio first to generate its marketing pack.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assets.map((asset, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-[#E8E2D8] p-5 shadow-sm flex flex-col justify-between hover:border-[#C85A32]/40 transition-all">
              <div>
                {/* Channel Header */}
                <div className="flex items-center justify-between pb-3 border-b border-[#F2ECE1] mb-3">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-[#C85A32] uppercase tracking-wider">
                    {asset.asset_type === 'instagram' && <Share2 className="w-4 h-4 text-pink-600" />}
                    {asset.asset_type === 'whatsapp' && <MessageCircle className="w-4 h-4 text-emerald-600" />}
                    {asset.asset_type === 'festival_campaign' && <Calendar className="w-4 h-4 text-amber-600" />}
                    {asset.asset_type === 'reel_script' && <Film className="w-4 h-4 text-purple-600" />}
                    {asset.asset_type === 'b2b_catalog_sheet' && <FileText className="w-4 h-4 text-blue-600" />}
                    {asset.asset_type.replace('_', ' ')}
                  </span>
                  
                  <button
                    onClick={() => handleCopy(language === 'hi' && asset.content_hi ? asset.content_hi : asset.content_en, idx)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#E8E2D8] text-[11px] font-semibold text-[#5C5852] hover:bg-[#F2ECE1] transition-colors"
                  >
                    {copiedIndex === idx ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Content in active language or bilingual tabs */}
                <div className="space-y-3 text-xs leading-relaxed">
                  <div>
                    <span className="text-[10px] font-bold text-[#8C827A] uppercase block mb-0.5">English Post:</span>
                    <p className="bg-[#FAF8F5] p-3 rounded-xl border border-[#E8E2D8] text-[#23211E] whitespace-pre-line font-normal">
                      {asset.content_en}
                    </p>
                  </div>

                  {asset.content_hi && (
                    <div>
                      <span className="text-[10px] font-bold text-[#8C827A] uppercase block mb-0.5">हिंदी पोस्ट (Hindi):</span>
                      <p className="bg-[#FAF8F5] p-3 rounded-xl border border-[#E8E2D8] text-[#23211E] whitespace-pre-line font-normal">
                        {asset.content_hi}
                      </p>
                    </div>
                  )}

                  {asset.hashtags && (
                    <p className="text-[11px] font-mono text-[#A44321] break-words">
                      {asset.hashtags}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
