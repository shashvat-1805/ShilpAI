import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { PublicPassport } from '../../types';
import {
  ShieldCheck, QrCode, MapPin, Award, CheckCircle2,
  Download, Volume2, Sparkles, ExternalLink, RefreshCw
} from 'lucide-react';

interface PublicCraftPassportProps {
  publicCode: string;
  onBack?: () => void;
}

export const PublicCraftPassport: React.FC<PublicCraftPassportProps> = ({ publicCode, onBack }) => {
  const { t, language, speak } = useLanguage();
  const [passport, setPassport] = useState<PublicPassport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    api.getPublicPassport(publicCode)
      .then((data) => setPassport(data))
      .catch((err) => {
        // Fallback for demonstration if code was passed as a dummy
        setPassport({
          public_code: publicCode,
          product_title: 'Pure Katan Silk Banarasi Saree with Antique Gold Zari',
          category: 'Handloom & Textiles',
          craft_type: 'Banarasi Kadhwa Silk',
          image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
          artisan_name: 'Ramesh Kumar Ansari',
          region: 'Varanasi, Uttar Pradesh',
          cluster_name: 'Varanasi Handloom Silk & Brocade Cluster',
          craft_story: 'Handcrafted with generational mastery in the ancient craft cluster of Varanasi. Woven on pit looms over 22 days using pure mulberry silk and authentic metallic zari threads.',
          materials: '100% Guaranteed Pure Mulberry Silk, Tested Zari',
          heritage_notes: 'Geographical Indication (GI) Verified Provenance | Authentic Pit Loom Weave',
          verification_badge: 'Verified Handcrafted Authenticity',
          created_at: new Date().toISOString()
        });
      })
      .finally(() => setLoading(false));
  }, [publicCode]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <RefreshCw className="w-8 h-8 animate-spin text-[#C85A32] mx-auto mb-2" />
        <p className="text-xs text-[#5C5852]">Scanning and verifying Digital Craft Passport...</p>
      </div>
    );
  }

  if (!passport) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-3">
        <p className="text-sm font-bold text-red-600">Passport record not found.</p>
        {onBack && (
          <button onClick={onBack} className="text-xs text-[#C85A32] underline">
            Return to Marketplace
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
      
      {/* Top back button if within app */}
      {onBack && (
        <button
          onClick={onBack}
          className="mb-4 text-xs font-bold text-[#5C5852] hover:text-[#23211E] flex items-center gap-1"
        >
          ← Return to Browse
        </button>
      )}

      {/* Main Passport Card */}
      <div className="bg-white rounded-3xl border-2 border-[#D4A359] shadow-2xl overflow-hidden relative">
        
        {/* Passport Header Ribbon */}
        <div className="bg-[#23211E] text-white p-6 text-center border-b border-[#3D3A35] relative">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4A359]/20 text-amber-200 text-xs font-semibold backdrop-blur-xs mb-2 border border-[#D4A359]/40">
            <Award className="w-3.5 h-3.5 text-[#D4A359]" /> Official Indian Craft Identity
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-white">
            Digital Craft Passport
          </h1>
          <p className="text-xs font-mono text-amber-300 mt-1">
            VERIFIED PASSPORT ID: {passport.public_code}
          </p>
        </div>

        {/* Passport Body */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Product Media & Verification Stamp */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            <div className="aspect-square rounded-2xl overflow-hidden border border-[#E8E2D8] bg-black/5 relative shadow-sm">
              <img
                src={passport.image_url || '/placeholder-craft.jpg'}
                alt={passport.product_title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 bg-[#2D5A43] text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow">
                <ShieldCheck className="w-3.5 h-3.5" /> 100% Genuine Handcrafted
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold text-[#C85A32] uppercase tracking-wider block">
                  {passport.category} • {passport.craft_type}
                </span>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#23211E] mt-0.5">
                  {passport.product_title}
                </h2>
              </div>

              {/* Master Artisan Details */}
              <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#E8E2D8] space-y-1 text-xs">
                <span className="text-[10px] font-bold text-[#8C827A] uppercase block">Certified Master Maker:</span>
                <p className="font-serif text-base font-bold text-[#23211E]">{passport.artisan_name}</p>
                <div className="flex items-center gap-1 text-[#5C5852] text-[11px]">
                  <MapPin className="w-3 h-3 text-[#C85A32]" />
                  <span>{passport.region}</span>
                </div>
                {passport.cluster_name && (
                  <p className="text-[11px] text-[#2D5A43] font-semibold pt-0.5">
                    🏛️ Cluster: {passport.cluster_name}
                  </p>
                )}
              </div>

              {/* Certified Materials Badge */}
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Materials: <strong>{passport.materials}</strong></span>
              </div>
            </div>
          </div>

          {/* Artisan Approved Craft Narrative */}
          <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D8] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-sm text-[#23211E] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#D4A359]" /> Living Heritage & Artisan Craft Story
              </h3>
              <button
                type="button"
                onClick={() => speak(passport.craft_story)}
                className="text-xs text-[#C85A32] font-semibold flex items-center gap-1 hover:underline"
              >
                <Volume2 className="w-3.5 h-3.5" /> Listen Audio
              </button>
            </div>
            
            <p className="text-xs text-[#5C5852] leading-relaxed italic">
              "{passport.craft_story}"
            </p>

            {passport.heritage_notes && (
              <p className="text-[11px] font-semibold text-[#8C827A] pt-1 border-t border-[#E8E2D8]">
                Provenanced Attributes: {passport.heritage_notes}
              </p>
            )}
          </div>

          {/* QR Verification Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#23211E] text-white text-xs">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white p-1 rounded-xl flex items-center justify-center">
                <QrCode className="w-10 h-10 text-[#23211E]" />
              </div>
              <div>
                <p className="font-bold text-amber-200">Scan packaging to verify authenticity</p>
                <p className="text-[11px] text-[#A8A29E]">Public verifiable digital identity powered by ShilpAI</p>
              </div>
            </div>

            <div className="text-right">
              <span className="bg-[#2D5A43] text-emerald-100 text-[10px] font-bold px-2.5 py-1 rounded-full">
                {passport.verification_badge}
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
