import React from 'react';
import { Sparkles, ShieldCheck, Heart, Award } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const Footer: React.FC = () => {
  const { language, t } = useLanguage();

  return (
    <footer className="bg-[#23211E] text-[#FAF8F5] mt-auto border-t border-[#3D3A35]">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-6 border-b border-[#3D3A35]">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[#2E2B27] text-[#D4A359]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#D4A359]">
                {language === 'hi' ? '100% प्रत्यक्ष शिल्पकार मॉडल' : 'Direct Artisan Model'}
              </h4>
              <p className="text-xs text-[#A8A29E] mt-0.5">
                {language === 'hi' ? 'बिचौलियों के बिना सीधे कारीगर परिवारों को सम्मानजनक लाभ व अधिकार।' : 'Zero intermediary commission leakage. Fair wages direct to craft families.'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[#2E2B27] text-[#C85A32]">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#C85A32]">
                {language === 'hi' ? 'डिजिटल क्राफ्ट पासपोर्ट' : 'Digital Craft Passport'}
              </h4>
              <p className="text-xs text-[#A8A29E] mt-0.5">
                {language === 'hi' ? 'पैकेजिंग पर क्यूआर कोड से सत्यापित भौगोलिक संकेत (GI) व विरासत कथा।' : 'QR-linked provenance, verified craft authenticity, and artisan storytelling.'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[#2E2B27] text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                {language === 'hi' ? 'वॉइस-फर्स्ट व सुगम' : 'Voice-First AI Accessible'}
              </h4>
              <p className="text-xs text-[#A8A29E] mt-0.5">
                {language === 'hi' ? 'कम डिजिटल साक्षरता वाले बुनकरों हेतु बोलकर लिस्टिंग व ऑडियो मार्गदर्शन।' : 'Minimal forms, regional voice input, and text-to-speech for low literacy.'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[#2E2B27] text-amber-300">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                {language === 'hi' ? 'आत्मनिर्भर भारत व ओडीओपी' : 'Vocal For Local & ODOP'}
              </h4>
              <p className="text-xs text-[#A8A29E] mt-0.5">
                {language === 'hi' ? 'पीएम विश्वकर्मा व एक जनपद एक उत्पाद (ODOP) के क्लस्टरों से जुड़ाव।' : 'Empowering national handloom and handicraft clusters year-round.'}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#8C827A] gap-4">
          <p>© 2026 ShilpAI (शिल्पएआई) — AI-Driven Market Linkage & Smart Cataloging for Artisans.</p>
          <div className="flex items-center gap-4">
            <span>Official GI Heritage</span>
            <span>•</span>
            <span>MoMSME PM-Vishwakarma Aligned</span>
            <span>•</span>
            <span className="text-emerald-400">Data Encrypted & Private</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
