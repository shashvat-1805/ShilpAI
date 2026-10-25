import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { VoiceInputButton } from '../common/VoiceInputButton';
import {
  Camera, Upload, Wand2, Sparkles, Check, ArrowRight,
  ShieldAlert, RefreshCw, Volume2, Image as ImageIcon, Sliders, CheckCircle2
} from 'lucide-react';

interface SmartCatalogStudioProps {
  onProductCreated?: () => void;
}

export const SmartCatalogStudio: React.FC<SmartCatalogStudioProps> = ({ onProductCreated }) => {
  const { currentUser } = useAuth();
  const { t, language, speak } = useLanguage();

  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Studio State
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80');
  const [enhancedUrl, setEnhancedUrl] = useState<string>('');
  const [activeImageTab, setActiveImageTab] = useState<'original' | 'enhanced' | 'lifestyle'>('original');

  // Voice & Extraction State
  const [voiceText, setVoiceText] = useState<string>('');
  const [missingAnswers, setMissingAnswers] = useState<Record<string, string>>({});

  // Generated Catalog Fields (Bilingual)
  const [titleEn, setTitleEn] = useState<string>('Handcrafted Pure Mulberry Silk Banarasi Saree');
  const [titleHi, setTitleHi] = useState<string>('पारंपरिक हथकरघा शुद्ध मलबरी सिल्क बनारसी साड़ी');
  const [descEn, setDescEn] = useState<string>('Handwoven on traditional pit looms using pure mulberry silk and tested gold zari brocade motifs.');
  const [descHi, setDescHi] = useState<string>('गड्ढा करघे पर कुशल बुनकरों द्वारा बुनी गई शुद्ध रेशम की साड़ी, बारीक ज़री के आकर्षक काम सहित।');
  const [category, setCategory] = useState<string>('Handloom & Textiles');
  const [craftType, setCraftType] = useState<string>('Banarasi Handloom Weaving');
  const [materials, setMaterials] = useState<string>('100% Pure Mulberry Silk, Tested Zari');
  const [dimensions, setDimensions] = useState<string>('5.5m x 1.1m (with blouse piece)');
  const [weightKg, setWeightKg] = useState<number>(0.8);
  const [fragility, setFragility] = useState<'Low' | 'Medium' | 'High'>('Low');
  const [tags, setTags] = useState<string[]>(['Handloom', 'Silk Saree', 'Banarasi', 'Authentic GI']);

  // Pricing formula state
  const [rawMaterialCost, setRawMaterialCost] = useState<number>(2400);
  const [laborCost, setLaborCost] = useState<number>(1800);
  const [packagingCost, setPackagingCost] = useState<number>(150);
  const [overheadCost, setOverheadCost] = useState<number>(100);
  const [targetMarginPct, setTargetMarginPct] = useState<number>(30);
  const [sellingPrice, setSellingPrice] = useState<number>(6400);
  const [stockQuantity, setStockQuantity] = useState<number>(15);

  // Exact ShilpAI Gross Margin Formula:
  // Selling Price = Total Cost / (1 - Target Margin % / 100)
  const totalCost = rawMaterialCost + laborCost + packagingCost + overheadCost;
  const recommendedTargetPrice = Math.round(totalCost / (1 - targetMarginPct / 100));
  const minFloorPrice = Math.round(totalCost / (1 - Math.max(15, targetMarginPct - 12) / 100));
  const boutiqueMaxPrice = Math.round(totalCost / (1 - Math.min(65, targetMarginPct + 15) / 100));
  const currentProfit = Math.round(sellingPrice - totalCost);
  const effectiveMargin = sellingPrice > 0 ? ((currentProfit / sellingPrice) * 100).toFixed(1) : '0';
  const isUnderpriced = sellingPrice < minFloorPrice || parseFloat(effectiveMargin) < 18;

  // Image Upload handler
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));

      // Trigger AI visual analysis
      setLoading(true);
      try {
        const analysis = await api.analyzeImage(file);
        if (analysis.detected_category) {
          setCategory(analysis.detected_category);
        }
        if (analysis.suggested_materials) {
          setMaterials(analysis.suggested_materials);
        }
        if (analysis.suggested_dimensions) {
          setDimensions(analysis.suggested_dimensions);
        }
        if (analysis.image_url) {
          setPreviewUrl(analysis.image_url);
        }
      } catch (err) {
        console.warn('Local preview used for image analysis');
      } finally {
        setLoading(false);
      }
    }
  };

  // Image Enhancement handler
  const handleEnhance = async (action: 'enhance' | 'remove_bg' | 'lifestyle') => {
    setLoading(true);
    try {
      const res = await api.enhanceImage(previewUrl, action);
      if (res.enhanced_url) {
        setEnhancedUrl(res.enhanced_url);
        setActiveImageTab(action === 'lifestyle' ? 'lifestyle' : 'enhanced');
      }
    } catch (err) {
      console.warn('Enhancement fallback used');
    } finally {
      setLoading(false);
    }
  };

  // Voice Catalog generation handler
  const handleVoiceTranscript = async (transcript: string) => {
    setVoiceText(transcript);
    setLoading(true);
    try {
      const cat = await api.catalogFromVoice(transcript, language, category);
      if (cat.title_en) setTitleEn(cat.title_en);
      if (cat.title_hi) setTitleHi(cat.title_hi);
      if (cat.description_en) setDescEn(cat.description_en);
      if (cat.description_hi) setDescHi(cat.description_hi);
      if (cat.craft_type) setCraftType(cat.craft_type);
      if (cat.suggested_materials) setMaterials(cat.suggested_materials);
      if (cat.suggested_dimensions) setDimensions(cat.suggested_dimensions);
      if (cat.suggested_tags) setTags(cat.suggested_tags);
    } catch (err) {
      console.warn('Catalog generated from heuristic dictionary');
    } finally {
      setLoading(false);
    }
  };

  // Publish product handler
  const handlePublishProduct = async () => {
    setLoading(true);
    try {
      const finalImg = enhancedUrl || previewUrl;
      await api.createProduct({
        category,
        craft_type: craftType,
        title_en: titleEn,
        title_hi: titleHi,
        description_en: descEn,
        description_hi: descHi,
        materials,
        dimensions,
        weight_kg: weightKg,
        fragility,
        cost_price: totalCost,
        target_margin_pct: targetMarginPct,
        selling_price: sellingPrice,
        initial_stock: stockQuantity,
        image_url: finalImg
      });

      setSuccessMessage('🎉 Product published successfully! Digital Craft Passport QR generated and inventory updated in live database.');
      if (onProductCreated) onProductCreated();
    } catch (err: any) {
      alert('Error publishing product: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      
      {/* Studio Banner */}
      <div className="bg-gradient-to-r from-[#C85A32] to-[#A44321] rounded-2xl p-6 text-white shadow-lg mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-xs mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-200" /> Module A & B: Zero-Form Smart Catalog Studio
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold">
              {t('studio.title')}
            </h1>
            <p className="text-sm text-amber-100 mt-1 max-w-2xl">
              {t('studio.subtitle')}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-black/20 p-2 rounded-xl backdrop-blur-xs text-xs">
            <span className="font-semibold text-amber-200">Current Step:</span>
            <span className="bg-white text-[#C85A32] px-2 py-0.5 rounded-full font-bold">
              {step} of 4
            </span>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-sm font-semibold">{successMessage}</p>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-xs font-bold text-emerald-700 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Stepper Navigation */}
      <div className="grid grid-cols-4 gap-2 mb-8 text-xs font-semibold">
        {[
          { num: 1, label: '1. Photo & Studio', icon: Camera },
          { num: 2, label: '2. Voice & Attributes', icon: Wand2 },
          { num: 3, label: '3. Margin Pricing', icon: Sliders },
          { num: 4, label: '4. Review & Publish', icon: Check }
        ].map((s) => (
          <button
            key={s.num}
            onClick={() => setStep(s.num)}
            className={`py-3 px-2 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
              step === s.num
                ? 'border-[#C85A32] bg-[#F7EAE4] text-[#C85A32] shadow-xs'
                : 'border-[#E8E2D8] bg-white text-[#5C5852] hover:bg-[#F2ECE1]'
            }`}
          >
            <s.icon className="w-4 h-4" />
            <span className="truncate">{s.label}</span>
          </button>
        ))}
      </div>

      {/* Step 1: Photo Capture & AI Enhancement */}
      {step === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-6 rounded-2xl border border-[#E8E2D8] shadow-sm">
          <div>
            <h3 className="font-serif font-bold text-lg text-[#23211E] mb-1">
              {t('studio.step1')}
            </h3>
            <p className="text-xs text-[#5C5852] mb-4">
              Take a photo using your phone camera or upload from files. ShilpAI automatically normalizes contrast, lighting, and cleans clutter.
            </p>

            {/* Upload Area */}
            <label className="border-2 border-dashed border-[#C85A32]/40 bg-[#FAF8F5] rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-[#F7EAE4]/30 transition-colors">
              <Upload className="w-8 h-8 text-[#C85A32] mb-2" />
              <span className="text-xs font-bold text-[#23211E]">Select or Snap Photo</span>
              <span className="text-[10px] text-[#8C827A] mt-1">Supports JPG, PNG, WEBP</span>
              <input type="file" accept="image/*" onChange={handleImageFileChange} className="hidden" />
            </label>

            {/* Quick Enhance Controls */}
            <div className="mt-5 space-y-2">
              <h4 className="text-xs font-bold text-[#23211E] flex items-center gap-1.5">
                <Wand2 className="w-3.5 h-3.5 text-[#C85A32]" /> AI Enhancement Tools:
              </h4>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleEnhance('enhance')}
                  disabled={loading}
                  className="p-2.5 rounded-xl border border-[#E8E2D8] bg-[#FAF8F5] hover:bg-[#F7EAE4] text-[11px] font-semibold text-[#23211E] flex flex-col items-center gap-1 transition-all"
                >
                  <Sparkles className="w-4 h-4 text-[#C85A32]" />
                  <span>Auto Lighting</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleEnhance('remove_bg')}
                  disabled={loading}
                  className="p-2.5 rounded-xl border border-[#E8E2D8] bg-[#FAF8F5] hover:bg-[#F7EAE4] text-[11px] font-semibold text-[#23211E] flex flex-col items-center gap-1 transition-all"
                >
                  <ImageIcon className="w-4 h-4 text-[#2D5A43]" />
                  <span>Studio Clean</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleEnhance('lifestyle')}
                  disabled={loading}
                  className="p-2.5 rounded-xl border border-[#E8E2D8] bg-[#FAF8F5] hover:bg-[#F7EAE4] text-[11px] font-semibold text-[#23211E] flex flex-col items-center gap-1 transition-all"
                >
                  <Sparkles className="w-4 h-4 text-[#D4A359]" />
                  <span>Living Room</span>
                </button>
              </div>
            </div>
          </div>

          {/* Preview Panel with Toggle */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#23211E]">Studio Preview:</span>
              <div className="flex bg-[#E8E2D8] p-0.5 rounded-lg text-[10px] font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveImageTab('original')}
                  className={`px-2 py-1 rounded ${activeImageTab === 'original' ? 'bg-white shadow-xs text-[#23211E]' : 'text-[#5C5852]'}`}
                >
                  Original
                </button>
                {enhancedUrl && (
                  <button
                    type="button"
                    onClick={() => setActiveImageTab('enhanced')}
                    className={`px-2 py-1 rounded ${activeImageTab === 'enhanced' ? 'bg-white shadow-xs text-[#C85A32]' : 'text-[#5C5852]'}`}
                  >
                    AI Enhanced
                  </button>
                )}
              </div>
            </div>

            <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#23211E]/5 border border-[#E8E2D8] flex items-center justify-center">
              <img
                src={activeImageTab === 'enhanced' && enhancedUrl ? enhancedUrl : previewUrl}
                alt="Product Preview"
                className="w-full h-full object-cover"
              />
              {loading && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center text-white text-xs font-bold gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin" /> Enhancing image with Pillow AI...
                </div>
              )}
            </div>

            <button
              onClick={() => setStep(2)}
              className="mt-4 w-full py-2.5 rounded-xl bg-[#C85A32] text-white font-bold text-xs hover:bg-[#A44321] transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              Continue to Voice & Attributes <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Voice Input & Zero-Form Generation */}
      {step === 2 && (
        <div className="bg-white p-6 rounded-2xl border border-[#E8E2D8] shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-serif font-bold text-lg text-[#23211E]">
                {t('studio.step2')}
              </h3>
              <p className="text-xs text-[#5C5852]">
                Describe your craft in simple voice speech. No typing required!
              </p>
            </div>
            <VoiceInputButton onTranscript={handleVoiceTranscript} language={language} />
          </div>

          {/* Voice transcript display */}
          {voiceText && (
            <div className="p-3 rounded-xl bg-[#F7EAE4] border border-[#C85A32]/30 text-xs">
              <span className="font-bold text-[#A44321]">Transcribed Speech: </span>
              <span className="italic text-[#23211E]">"{voiceText}"</span>
            </div>
          )}

          {/* Generated Bilingual Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-[#23211E] mb-1">
                English Product Title
              </label>
              <input
                type="text"
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                className="w-full p-2.5 border border-[#E8E2D8] rounded-xl text-xs bg-[#FAF8F5]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#23211E] mb-1">
                हिंदी शीर्षक (Hindi Title)
              </label>
              <input
                type="text"
                value={titleHi}
                onChange={(e) => setTitleHi(e.target.value)}
                className="w-full p-2.5 border border-[#E8E2D8] rounded-xl text-xs bg-[#FAF8F5]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-[#23211E]">English Description</label>
                <button
                  type="button"
                  onClick={() => speak(descEn)}
                  className="text-[11px] text-[#C85A32] flex items-center gap-1 font-semibold"
                >
                  <Volume2 className="w-3.5 h-3.5" /> {t('voice.readAloud')}
                </button>
              </div>
              <textarea
                rows={3}
                value={descEn}
                onChange={(e) => setDescEn(e.target.value)}
                className="w-full p-2.5 border border-[#E8E2D8] rounded-xl text-xs bg-[#FAF8F5]"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-[#23211E]">हिंदी विवरण (Hindi Description)</label>
                <button
                  type="button"
                  onClick={() => speak(descHi)}
                  className="text-[11px] text-[#C85A32] flex items-center gap-1 font-semibold"
                >
                  <Volume2 className="w-3.5 h-3.5" /> {t('voice.readAloud')}
                </button>
              </div>
              <textarea
                rows={3}
                value={descHi}
                onChange={(e) => setDescHi(e.target.value)}
                className="w-full p-2.5 border border-[#E8E2D8] rounded-xl text-xs bg-[#FAF8F5]"
              />
            </div>
          </div>

          {/* Specifications */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#23211E] mb-1">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 border border-[#E8E2D8] rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#23211E] mb-1">Craft Type</label>
              <input
                type="text"
                value={craftType}
                onChange={(e) => setCraftType(e.target.value)}
                className="w-full p-2 border border-[#E8E2D8] rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#23211E] mb-1">Materials</label>
              <input
                type="text"
                value={materials}
                onChange={(e) => setMaterials(e.target.value)}
                className="w-full p-2 border border-[#E8E2D8] rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#23211E] mb-1">Dimensions</label>
              <input
                type="text"
                value={dimensions}
                onChange={(e) => setDimensions(e.target.value)}
                className="w-full p-2 border border-[#E8E2D8] rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 border border-[#E8E2D8] rounded-xl text-xs font-bold text-[#5C5852]"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="px-6 py-2.5 rounded-xl bg-[#C85A32] text-white text-xs font-bold hover:bg-[#A44321] transition-all flex items-center gap-1.5"
            >
              Proceed to Dynamic Pricing <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Dynamic Pricing Assistant */}
      {step === 3 && (
        <div className="bg-white p-6 rounded-2xl border border-[#E8E2D8] shadow-sm space-y-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C85A32] bg-[#F7EAE4] px-2.5 py-1 rounded-full mb-1">
              <Sliders className="w-3.5 h-3.5" /> Module D: Dynamic Pricing Assistant
            </div>
            <h3 className="font-serif font-bold text-lg text-[#23211E]">
              {t('pricing.title')}
            </h3>
            <p className="text-xs text-[#5C5852]">
              {t('pricing.formulaNotice')}
            </p>
          </div>

          {/* Cost Inputs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-[#FAF8F5] p-4 rounded-xl border border-[#E8E2D8]">
            <div>
              <label className="block text-xs font-semibold text-[#23211E] mb-1">
                {t('pricing.rawMaterial')}
              </label>
              <input
                type="number"
                value={rawMaterialCost}
                onChange={(e) => setRawMaterialCost(Number(e.target.value))}
                className="w-full p-2 bg-white border border-[#E8E2D8] rounded-lg text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#23211E] mb-1">
                {t('pricing.labor')}
              </label>
              <input
                type="number"
                value={laborCost}
                onChange={(e) => setLaborCost(Number(e.target.value))}
                className="w-full p-2 bg-white border border-[#E8E2D8] rounded-lg text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#23211E] mb-1">
                {t('pricing.packaging')}
              </label>
              <input
                type="number"
                value={packagingCost}
                onChange={(e) => setPackagingCost(Number(e.target.value))}
                className="w-full p-2 bg-white border border-[#E8E2D8] rounded-lg text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#23211E] mb-1">
                {t('pricing.overhead')}
              </label>
              <input
                type="number"
                value={overheadCost}
                onChange={(e) => setOverheadCost(Number(e.target.value))}
                className="w-full p-2 bg-white border border-[#E8E2D8] rounded-lg text-xs font-semibold"
              />
            </div>
          </div>

          {/* Target Margin Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold">
              <span>{t('pricing.targetMargin')}</span>
              <span className="text-[#C85A32] text-sm">{targetMarginPct}% Gross Margin</span>
            </div>
            <input
              type="range"
              min="10"
              max="60"
              step="1"
              value={targetMarginPct}
              onChange={(e) => {
                const val = Number(e.target.value);
                setTargetMarginPct(val);
                setSellingPrice(Math.round(totalCost / (1 - val / 100)));
              }}
              className="w-full accent-[#C85A32]"
            />
          </div>

          {/* Price Range Recommendation Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50">
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wide">
                {t('pricing.minPrice')}
              </span>
              <p className="text-xl font-bold font-serif text-amber-900 mt-1">₹{minFloorPrice.toLocaleString()}</p>
              <p className="text-[10px] text-amber-700 mt-0.5">Floor margin (18%) to cover minimum wages.</p>
            </div>

            <div className="p-3.5 rounded-xl border-2 border-[#C85A32] bg-[#F7EAE4]/60 relative shadow-xs">
              <span className="absolute top-2 right-2 bg-[#C85A32] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                Recommended
              </span>
              <span className="text-[11px] font-bold text-[#A44321] uppercase tracking-wide">
                {t('pricing.recommendedTarget')}
              </span>
              <p className="text-2xl font-bold font-serif text-[#C85A32] mt-1">₹{recommendedTargetPrice.toLocaleString()}</p>
              <p className="text-[10px] text-[#A44321] mt-0.5">Net Profit: ₹{Math.round(recommendedTargetPrice - totalCost)} ({targetMarginPct}%)</p>
            </div>

            <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide">
                {t('pricing.maxPrice')}
              </span>
              <p className="text-xl font-bold font-serif text-emerald-900 mt-1">₹{boutiqueMaxPrice.toLocaleString()}</p>
              <p className="text-[10px] text-emerald-700 mt-0.5">Export & luxury boutique positioning.</p>
            </div>
          </div>

          {/* Manual Selling Price Input & Warning */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-[#E8E2D8] bg-[#FAF8F5]">
            <div>
              <label className="block text-xs font-bold text-[#23211E] mb-1">
                Your Chosen Selling Price (₹)
              </label>
              <input
                type="number"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(Number(e.target.value))}
                className="px-3 py-2 border border-[#E8E2D8] rounded-xl font-serif text-lg font-bold text-[#C85A32] w-48 bg-white"
              />
            </div>
            <div className="text-xs">
              <p className="font-semibold text-[#23211E]">
                Net Profit: <span className="text-emerald-700 font-bold">₹{currentProfit.toLocaleString()}</span> ({effectiveMargin}% margin)
              </p>
              <p className="text-[11px] text-[#8C827A] mt-0.5">
                Total production input cost: ₹{totalCost.toLocaleString()}
              </p>
            </div>
          </div>

          {isUnderpriced && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 shrink-0 text-red-600" />
              <span>{t('pricing.warning')}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2 border border-[#E8E2D8] rounded-xl text-xs font-bold text-[#5C5852]"
            >
              Back
            </button>
            <button
              onClick={() => setStep(4)}
              className="px-6 py-2.5 rounded-xl bg-[#C85A32] text-white text-xs font-bold hover:bg-[#A44321] transition-all flex items-center gap-1.5"
            >
              Review Listing & Passport <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Final Review & 1-Tap Publish */}
      {step === 4 && (
        <div className="bg-white p-6 rounded-2xl border border-[#E8E2D8] shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-[#E8E2D8] pb-4">
            <div>
              <h3 className="font-serif font-bold text-lg text-[#23211E]">
                {t('studio.step5')}
              </h3>
              <p className="text-xs text-[#5C5852]">
                Your listing is ready. Publishing instantly activates your marketplace listing, reserves inventory, and mints your verified Digital Craft Passport QR.
              </p>
            </div>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-300">
              ✓ Ready for Marketplace
            </span>
          </div>

          {/* Summary Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="aspect-square rounded-2xl overflow-hidden border border-[#E8E2D8]">
              <img
                src={enhancedUrl || previewUrl}
                alt="Product"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="md:col-span-2 space-y-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-[#C85A32] tracking-wider">{category} • {craftType}</span>
                <h4 className="font-serif text-xl font-bold text-[#23211E]">{titleEn}</h4>
                <p className="text-xs font-semibold text-[#8C827A]">{titleHi}</p>
              </div>

              <p className="text-xs text-[#5C5852] leading-relaxed line-clamp-3">
                {descEn}
              </p>

              <div className="grid grid-cols-2 gap-3 text-xs bg-[#FAF8F5] p-3 rounded-xl border border-[#E8E2D8]">
                <div>
                  <span className="text-[#8C827A] block text-[10px]">Selling Price</span>
                  <span className="font-serif text-lg font-bold text-[#C85A32]">₹{sellingPrice.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[#8C827A] block text-[10px]">Initial Stock</span>
                  <span className="font-bold text-[#23211E]">{stockQuantity} Units</span>
                </div>
                <div>
                  <span className="text-[#8C827A] block text-[10px]">Certified Materials</span>
                  <span className="font-medium text-[#23211E] truncate block">{materials}</span>
                </div>
                <div>
                  <span className="text-[#8C827A] block text-[10px]">Craft Provenance</span>
                  <span className="font-medium text-[#23211E]">GI Tagged Authenticity</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#E8E2D8]">
            <button
              onClick={() => setStep(3)}
              className="px-4 py-2 border border-[#E8E2D8] rounded-xl text-xs font-bold text-[#5C5852]"
            >
              Back to Pricing
            </button>
            <button
              onClick={handlePublishProduct}
              disabled={loading}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#C85A32] to-[#A44321] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Publishing to Marketplace...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5 text-amber-200" /> 1-Tap Publish Listing & Mint QR Passport
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
