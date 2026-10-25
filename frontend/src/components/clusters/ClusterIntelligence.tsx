import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import {
  MapPin, Users, Package, Award, Sparkles, Phone,
  Layers, ChevronRight, RefreshCw, Compass
} from 'lucide-react';

export const ClusterIntelligence: React.FC = () => {
  const { t, language } = useLanguage();
  const [clusters, setClusters] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedClusterId, setSelectedClusterId] = useState<number | null>(null);
  const [selectedClusterDetail, setSelectedClusterDetail] = useState<any>(null);
  const [stateFilter, setStateFilter] = useState<string>('All');

  const STATES = [
    'All',
    'Uttar Pradesh',
    'Gujarat',
    'Karnataka',
    'Rajasthan',
    'Bihar',
    'Chhattisgarh'
  ];

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (stateFilter !== 'All') params.state = stateFilter;

    api.getClusters(params)
      .then((data) => {
        setClusters(data);
        if (data.length > 0 && !selectedClusterId) {
          handleSelectCluster(data[0].id);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [stateFilter]);

  const handleSelectCluster = async (id: number) => {
    setSelectedClusterId(id);
    try {
      const detail = await api.getClusterDetail(id);
      setSelectedClusterDetail(detail);
    } catch (err) {
      console.warn('Failed to fetch cluster detail');
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-[#23211E] to-[#C85A32] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-xs text-amber-200 mb-3 border border-white/20">
            <Compass className="w-3.5 h-3.5" /> Module H & T: Cluster Intelligence & Craft Map of India
          </div>
          <h1 className="text-3xl font-serif font-bold text-white tracking-tight">
            {language === 'hi' ? 'भारतीय शिल्प क्लस्टर व भौगोलिक मानचित्र' : 'Craft Clusters of India'}
          </h1>
          <p className="text-xs text-amber-100 mt-2 leading-relaxed">
            State → District/Cluster → Craft → Artisan/Product. Aggregate production capacity and institutional discovery for bulk procurement.
          </p>
        </div>
      </div>

      {/* State Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#E8E2D8]">
        {STATES.map((st) => (
          <button
            key={st}
            onClick={() => setStateFilter(st)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              stateFilter === st
                ? 'bg-[#C85A32] text-white shadow-xs'
                : 'bg-white text-[#5C5852] hover:bg-[#F2ECE1] border border-[#E8E2D8]'
            }`}
          >
            {st === 'All' ? 'All Indian Regions' : st}
          </button>
        ))}
      </div>

      {/* Content Layout */}
      {loading ? (
        <div className="bg-white p-12 rounded-2xl border border-[#E8E2D8] text-center text-xs text-[#5C5852] flex flex-col items-center gap-2">
          <RefreshCw className="w-6 h-6 animate-spin text-[#C85A32]" />
          <span>Loading verified artisan craft clusters...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Cluster List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#23211E] uppercase tracking-wider">
              Regional Clusters ({clusters.length})
            </h3>
            <div className="space-y-2">
              {clusters.map((c) => {
                const isSelected = selectedClusterId === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => handleSelectCluster(c.id)}
                    className={`p-4 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#C85A32] bg-[#F7EAE4]/60 shadow-xs ring-1 ring-[#C85A32]/30'
                        : 'border-[#E8E2D8] bg-white hover:bg-[#FAF8F5]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-serif font-bold text-sm text-[#23211E]">{c.cluster_name}</span>
                      <ChevronRight className="w-4 h-4 text-[#C85A32]" />
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-[#5C5852]">
                      <MapPin className="w-3 h-3 text-[#C85A32]" />
                      <span>{c.district}, {c.state}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#8C827A] mt-2 pt-2 border-t border-[#F2ECE1]">
                      <span>👥 {c.total_artisans} Artisans</span>
                      <span className="text-[#2D5A43] font-bold">📦 {c.aggregate_monthly_capacity} units/mo</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cluster Detail View */}
          {selectedClusterDetail && (
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-[#E8E2D8] shadow-sm space-y-4">
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#F2ECE1] pb-4">
                  <div>
                    <span className="text-[10px] font-bold text-[#C85A32] uppercase tracking-wider block">
                      Traditional Craft Specialization: {selectedClusterDetail.craft_type}
                    </span>
                    <h2 className="font-serif text-2xl font-bold text-[#23211E] mt-0.5">
                      {selectedClusterDetail.cluster_name}
                    </h2>
                    <p className="text-xs text-[#5C5852] flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-[#C85A32]" />
                      {selectedClusterDetail.district}, {selectedClusterDetail.state}
                    </p>
                  </div>

                  <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#E8E2D8] text-right">
                    <span className="text-[10px] text-[#8C827A] uppercase font-bold block">Aggregate Production</span>
                    <span className="font-serif text-xl font-bold text-[#2D5A43]">
                      {selectedClusterDetail.aggregate_monthly_capacity.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-[#8C827A] block">Units / Month</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-[#5C5852] leading-relaxed">
                  {selectedClusterDetail.description}
                </p>

                {/* Lead Contact Info */}
                <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#E8E2D8] flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-[#8C827A] uppercase font-bold block">Cluster Representative / Federation Lead:</span>
                    <span className="font-bold text-[#23211E]">{selectedClusterDetail.contact_lead}</span>
                  </div>
                  <span className="text-emerald-700 bg-emerald-100 text-[10px] font-bold px-2.5 py-1 rounded-full">
                    Authorized Procurement Partner
                  </span>
                </div>

                {/* Participating Artisans Directory */}
                <div className="space-y-3 pt-2">
                  <h3 className="font-serif font-bold text-base text-[#23211E] flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[#2D5A43]" /> Participating Master Artisans & Weavers:
                  </h3>

                  {selectedClusterDetail.artisans && selectedClusterDetail.artisans.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedClusterDetail.artisans.map((art: any) => (
                        <div key={art.id} className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E2D8] text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#23211E]">{art.name}</span>
                            <span className="text-[#D4A359] font-bold">★ {art.rating_avg}</span>
                          </div>
                          <p className="text-[#C85A32] text-[11px] font-semibold">{art.craft_name}</p>
                          <div className="flex items-center justify-between text-[10px] text-[#8C827A] pt-1">
                            <span>Capacity: {art.monthly_capacity} units/mo</span>
                            <span>{art.products_count} Published listings</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[#8C827A]">Artisans in this cluster are accessible via the cluster federation coordinator.</p>
                  )}
                </div>

              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
