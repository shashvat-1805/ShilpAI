import React from 'react';
import { useAuth, DEMO_USERS } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { UserRole } from '../../types';
import { ShieldCheck, UserCheck, Sparkles, AlertCircle } from 'lucide-react';

export const RoleBanner: React.FC = () => {
  const { currentUser, quickSwitchRole, loading } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="bg-[#23211E] text-[#FAF8F5] text-xs px-4 py-2 border-b border-[#3D3A35] flex flex-wrap items-center justify-between gap-3 shadow-inner">
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1 font-semibold text-[#D4A359] uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" /> 1-Click Role Switcher:
        </span>
        <span className="text-[#A8A29E] hidden md:inline">
          (Switch instantly to test different persona workflows)
        </span>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {(['artisan', 'buyer', 'cluster_manager', 'admin'] as UserRole[]).map((role) => {
          const isActive = currentUser?.role === role;
          return (
            <button
              key={role}
              onClick={() => quickSwitchRole(role)}
              disabled={loading}
              className={`px-2.5 py-1 rounded transition-all flex items-center gap-1 text-xs font-medium ${
                isActive
                  ? 'bg-[#C85A32] text-white shadow font-semibold ring-1 ring-[#FAF8F5]/30'
                  : 'bg-[#2E2B27] text-[#D6D3D1] hover:bg-[#3D3A35] hover:text-white'
              }`}
            >
              {role === 'artisan' && '🧵 Artisan (Ramesh)'}
              {role === 'buyer' && '🏢 Buyer (FabCraft)'}
              {role === 'cluster_manager' && '👥 Cluster (Channapatna)'}
              {role === 'admin' && '🛡️ Admin'}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        {currentUser ? (
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <UserCheck className="w-3.5 h-3.5" />
            <span className="text-[#E7E5E4]">{currentUser.full_name}</span>
            <span className="bg-[#2D5A43] text-emerald-100 text-[10px] px-1.5 py-0.5 rounded font-mono uppercase">
              {currentUser.role}
            </span>
          </span>
        ) : (
          <span className="text-amber-300 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Browsing as Guest
          </span>
        )}
      </div>
    </div>
  );
};
