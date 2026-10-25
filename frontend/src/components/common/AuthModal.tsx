import React, { useState } from 'react';
import { useAuth, DEMO_USERS } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { X, Lock, Mail, User, Phone, MapPin, Briefcase, CheckCircle, Sparkles } from 'lucide-react';
import { UserRole } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register, quickSwitchRole } = useAuth();
  const { t, language } = useLanguage();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('artisan');
  const [phone, setPhone] = useState('');
  const [craftName, setCraftName] = useState('');
  const [craftCategory, setCraftCategory] = useState('Handloom & Textiles');
  const [state, setState] = useState('Uttar Pradesh');
  const [district, setDistrict] = useState('Varanasi');
  const [orgName, setOrgName] = useState('');
  const [city, setCity] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register({
          email,
          password,
          full_name: fullName,
          role,
          phone,
          language_pref: language,
          craft_name: craftName,
          craft_category: craftCategory,
          state,
          district,
          organization_name: orgName,
          city
        });
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Operation failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (targetRole: UserRole) => {
    setLoading(true);
    setError(null);
    try {
      await quickSwitchRole(targetRole);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-[#FAF8F5] rounded-2xl shadow-2xl border border-[#E8E2D8] w-full max-w-md overflow-hidden animate-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-[#23211E] text-[#FAF8F5] p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#C85A32]" />
            <h3 className="font-serif font-bold text-lg">
              {mode === 'login' ? 'Sign In to ShilpAI' : 'Create ShilpAI Account'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-[#A8A29E] hover:text-white hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Fast Login Bar */}
        <div className="bg-[#F2ECE1] p-3 border-b border-[#E8E2D8]">
          <p className="text-[11px] font-semibold text-[#5C5852] mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#C85A32]" /> Fast 1-Click Persona Sign-In:
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => handleQuickDemo('artisan')}
              className="px-2 py-1 bg-white hover:bg-[#F7EAE4] border border-[#E8E2D8] rounded text-[11px] font-medium text-left truncate"
            >
              🧵 Ramesh (Artisan)
            </button>
            <button
              onClick={() => handleQuickDemo('buyer')}
              className="px-2 py-1 bg-white hover:bg-[#F7EAE4] border border-[#E8E2D8] rounded text-[11px] font-medium text-left truncate"
            >
              🏢 FabCraft (Buyer)
            </button>
            <button
              onClick={() => handleQuickDemo('cluster_manager')}
              className="px-2 py-1 bg-white hover:bg-[#F7EAE4] border border-[#E8E2D8] rounded text-[11px] font-medium text-left truncate"
            >
              👥 Basavaraj (Cluster)
            </button>
            <button
              onClick={() => handleQuickDemo('admin')}
              className="px-2 py-1 bg-white hover:bg-[#F7EAE4] border border-[#E8E2D8] rounded text-[11px] font-medium text-left truncate"
            >
              🛡️ Administrator
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
              {error}
            </div>
          )}

          {/* Mode Switch Tabs */}
          <div className="flex bg-[#E8E2D8] p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                mode === 'login' ? 'bg-white text-[#23211E] shadow-xs' : 'text-[#5C5852]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                mode === 'register' ? 'bg-white text-[#23211E] shadow-xs' : 'text-[#5C5852]'
              }`}
            >
              New Registration
            </button>
          </div>

          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-[#23211E] mb-1">Select User Role</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${role === 'artisan' ? 'border-[#C85A32] bg-[#F7EAE4]/60 font-semibold text-[#C85A32]' : 'border-[#E8E2D8] bg-white'}`}>
                    <input type="radio" name="role" value="artisan" checked={role === 'artisan'} onChange={() => setRole('artisan')} className="sr-only" />
                    <span>🧵 Artisan / Seller</span>
                  </label>
                  <label className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${role === 'buyer' ? 'border-[#C85A32] bg-[#F7EAE4]/60 font-semibold text-[#C85A32]' : 'border-[#E8E2D8] bg-white'}`}>
                    <input type="radio" name="role" value="buyer" checked={role === 'buyer'} onChange={() => setRole('buyer')} className="sr-only" />
                    <span>🏢 Wholesale Buyer</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#23211E] mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#8C827A] absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar Ansari"
                    className="w-full pl-9 pr-3 py-2 border border-[#E8E2D8] bg-white rounded-xl text-xs focus:ring-2 focus:ring-[#C85A32] focus:outline-hidden"
                  />
                </div>
              </div>

              {role === 'artisan' && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-[#23211E] mb-1">Craft Name</label>
                      <input
                        type="text"
                        value={craftName}
                        onChange={(e) => setCraftName(e.target.value)}
                        placeholder="e.g. Banarasi Silk"
                        className="w-full px-3 py-2 border border-[#E8E2D8] bg-white rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#23211E] mb-1">Category</label>
                      <select
                        value={craftCategory}
                        onChange={(e) => setCraftCategory(e.target.value)}
                        className="w-full px-2 py-2 border border-[#E8E2D8] bg-white rounded-xl text-xs"
                      >
                        <option value="Handloom & Textiles">Handloom & Textiles</option>
                        <option value="Pottery & Terracotta">Pottery & Terracotta</option>
                        <option value="Woodcraft & Toys">Woodcraft & Toys</option>
                        <option value="Metalware & Dhokra">Metalware & Dhokra</option>
                        <option value="Folk Paintings & Art">Folk Paintings & Art</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-[#23211E] mb-1">State</label>
                      <input
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full px-3 py-2 border border-[#E8E2D8] bg-white rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#23211E] mb-1">District / Cluster</label>
                      <input
                        type="text"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full px-3 py-2 border border-[#E8E2D8] bg-white rounded-xl text-xs"
                      />
                    </div>
                  </div>
                </>
              )}

              {role === 'buyer' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-[#23211E] mb-1">Company / Org</label>
                    <input
                      type="text"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      placeholder="e.g. FabCraft Retail"
                      className="w-full px-3 py-2 border border-[#E8E2D8] bg-white rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#23211E] mb-1">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. New Delhi"
                      className="w-full px-3 py-2 border border-[#E8E2D8] bg-white rounded-xl text-xs"
                    />
                  </div>
                </div>
              )}
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#23211E] mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#8C827A] absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@shilpai.in"
                className="w-full pl-9 pr-3 py-2 border border-[#E8E2D8] bg-white rounded-xl text-xs focus:ring-2 focus:ring-[#C85A32] focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#23211E] mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#8C827A] absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 border border-[#E8E2D8] bg-white rounded-xl text-xs focus:ring-2 focus:ring-[#C85A32] focus:outline-hidden"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-[#C85A32] hover:bg-[#A44321] text-white text-xs font-bold shadow-md transition-all disabled:opacity-50"
          >
            {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Complete Registration'}
          </button>
        </form>
      </div>
    </div>
  );
};
