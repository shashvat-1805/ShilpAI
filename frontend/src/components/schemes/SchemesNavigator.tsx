import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { GovernmentScheme } from '../../types';
import {
  Shield, CheckSquare, ExternalLink, Search, Sparkles,
  Award, Landmark, CheckCircle2, RefreshCw
} from 'lucide-react';

export const SchemesNavigator: React.FC = () => {
  const { t, language } = useLanguage();
  const [schemes, setSchemes] = useState<GovernmentScheme[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  const fetchSchemes = async () => {
    setLoading(true);
    try {
      const data = await api.getSchemes(search);
      setSchemes(data);
    } catch (err) {
      console.warn('Failed to load schemes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, []);

  const handleToggleChecklist = async (schemeId: number, itemKey: string, currentStatus: boolean) => {
    try {
      await api.toggleSchemeChecklist(schemeId, itemKey, !currentStatus);
      setSchemes(prev => prev.map(s => {
        if (s.id !== schemeId) return s;
        return {
          ...s,
          checklist: s.checklist.map(c => c.key === itemKey ? { ...c, completed: !currentStatus } : c)
        };
      }));
    } catch (err: any) {
      alert('Failed to update checklist item: ' + err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1F3F2E] via-[#2D5A43] to-[#1F3F2E] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-xs text-emerald-200 mb-3 border border-white/20">
            <Shield className="w-3.5 h-3.5" /> Module R: Government Scheme Navigator
          </div>
          <h1 className="text-3xl font-serif font-bold text-white tracking-tight">
            {language === 'hi' ? 'शिल्पकार सरकारी योजना मार्गदर्शक' : 'Government Schemes for Artisans'}
          </h1>
          <p className="text-xs text-emerald-100 mt-2 leading-relaxed">
            Discover verified Central & State initiatives (PM Vishwakarma, ODOP, MUDRA, AHVY) with simple eligibility checks, document preparation checklists, and official portal links.
          </p>
        </div>
      </div>

      {/* Scheme Cards */}
      {loading ? (
        <div className="bg-white p-12 rounded-2xl border border-[#E8E2D8] text-center text-xs text-[#5C5852] flex flex-col items-center gap-2">
          <RefreshCw className="w-6 h-6 animate-spin text-[#2D5A43]" />
          <span>Verifying official government scheme registries...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {schemes.map((s) => (
            <div
              key={s.id}
              className="bg-white rounded-2xl border border-[#E8E2D8] p-6 shadow-sm flex flex-col justify-between hover:border-[#2D5A43]/40 transition-all space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2 border-b border-[#F2ECE1] pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-[#2D5A43] uppercase tracking-wider block">
                      {s.nodal_ministry}
                    </span>
                    <h3 className="font-serif font-bold text-lg text-[#23211E]">
                      {language === 'hi' ? s.scheme_name_hi : s.scheme_name_en}
                    </h3>
                  </div>

                  <a
                    href={s.official_url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-[#FAF8F5] hover:bg-[#EBF2EE] text-[#2D5A43] text-xs font-bold border border-[#E8E2D8] transition-colors shrink-0"
                    title="Open Official Govt Portal"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                {/* Description */}
                <p className="text-xs text-[#5C5852] leading-relaxed">
                  {language === 'hi' ? s.description_hi : s.description_en}
                </p>

                {/* Key Benefits */}
                <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E8E2D8] text-xs space-y-1">
                  <span className="text-[10px] font-bold text-[#C85A32] uppercase block">Key Benefits:</span>
                  <p className="font-semibold text-[#23211E]">{s.benefits_summary}</p>
                </div>

                {/* Eligibility Criteria */}
                <div className="p-3 bg-[#EBF2EE] rounded-xl border border-[#2D5A43]/20 text-xs space-y-1 text-[#1F3F2E]">
                  <span className="text-[10px] font-bold text-[#2D5A43] uppercase block">Eligibility:</span>
                  <p>{s.eligibility_criteria}</p>
                </div>

                {/* Interactive Document Checklist */}
                <div className="pt-2 space-y-2">
                  <span className="text-xs font-bold text-[#23211E] block">
                    Application Document Checklist:
                  </span>
                  <div className="space-y-1.5">
                    {s.checklist && s.checklist.map((item) => (
                      <label
                        key={item.key}
                        onClick={() => handleToggleChecklist(s.id, item.key, item.completed)}
                        className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                          item.completed
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                            : 'bg-white border-[#E8E2D8] text-[#5C5852] hover:bg-[#FAF8F5]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={() => {}}
                          className="rounded text-[#2D5A43] focus:ring-0"
                        />
                        <span>{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-[#F2ECE1] flex items-center justify-between text-[11px] text-[#8C827A]">
                <span>Verified: {s.last_verified_date}</span>
                <a
                  href={s.official_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#2D5A43] font-bold hover:underline flex items-center gap-1"
                >
                  Official Portal <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
