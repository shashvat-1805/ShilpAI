import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Sparkles, Globe, Bell, ShoppingBag, Wand2, BarChart3,
  Shield, MapPin, Landmark, Users, LogOut, LogIn, Menu, X
} from 'lucide-react';
import { api } from '../../services/api';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab, onOpenAuthModal }) => {
  const { currentUser, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  useEffect(() => {
    if (currentUser) {
      api.getNotifications()
        .then(data => setNotifications(data))
        .catch(() => {});
    } else {
      setNotifications([]);
    }
  }, [currentUser]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleNotificationClick = async (notif: any) => {
    if (!notif.is_read) {
      await api.markNotificationRead(notif.id);
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
    }
    if (notif.link) {
      // Route to tab if matches
      if (notif.link.includes('inquiries') || notif.link.includes('orders')) {
        onSelectTab('orders');
      } else if (notif.link.includes('catalog')) {
        onSelectTab('studio');
      }
    }
    setShowNotifMenu(false);
  };

  const role = currentUser?.role || 'guest';

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E8E2D8] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectTab('marketplace')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C85A32] to-[#A44321] flex items-center justify-center text-white shadow-md shadow-[#C85A32]/20">
              <Sparkles className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif text-xl font-bold tracking-tight text-[#23211E]">
                  Shilp<span className="text-[#C85A32]">AI</span>
                </span>
                <span className="bg-[#EBF2EE] text-[#2D5A43] text-[10px] font-semibold px-1.5 py-0.5 rounded border border-[#2D5A43]/20">
                  v1.0
                </span>
              </div>
              <p className="text-[10px] text-[#5C5852] font-medium hidden sm:block">
                {language === 'hi' ? 'शिल्पकारों का एआई बिजनेस मैनेजर' : 'AI Business Manager for Artisans'}
              </p>
            </div>
          </div>

          {/* Desktop Nav Tabs */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => onSelectTab('marketplace')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentTab === 'marketplace'
                  ? 'bg-[#C85A32]/10 text-[#C85A32] font-semibold'
                  : 'text-[#5C5852] hover:text-[#23211E] hover:bg-[#F2ECE1]'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              {t('nav.marketplace')}
            </button>

            {/* Artisan specific: AI Studio */}
            {(role === 'artisan' || role === 'admin') && (
              <button
                onClick={() => onSelectTab('studio')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  currentTab === 'studio'
                    ? 'bg-[#C85A32]/10 text-[#C85A32] font-semibold'
                    : 'text-[#5C5852] hover:text-[#23211E] hover:bg-[#F2ECE1]'
                }`}
              >
                <Wand2 className="w-4 h-4 text-[#C85A32]" />
                {t('nav.catalogStudio')}
              </button>
            )}

            {/* B2B Matchmaker */}
            <button
              onClick={() => onSelectTab('matchmaker')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentTab === 'matchmaker'
                  ? 'bg-[#C85A32]/10 text-[#C85A32] font-semibold'
                  : 'text-[#5C5852] hover:text-[#23211E] hover:bg-[#F2ECE1]'
              }`}
            >
              <Users className="w-4 h-4 text-[#2D5A43]" />
              {t('nav.matchmaking')}
            </button>

            {/* Orders & Milestones */}
            {currentUser && (
              <button
                onClick={() => onSelectTab('orders')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  currentTab === 'orders'
                    ? 'bg-[#C85A32]/10 text-[#C85A32] font-semibold'
                    : 'text-[#5C5852] hover:text-[#23211E] hover:bg-[#F2ECE1]'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                {t('nav.orders')}
              </button>
            )}

            {/* Finances (Artisan) */}
            {(role === 'artisan' || role === 'admin') && (
              <button
                onClick={() => onSelectTab('finances')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  currentTab === 'finances'
                    ? 'bg-[#C85A32]/10 text-[#C85A32] font-semibold'
                    : 'text-[#5C5852] hover:text-[#23211E] hover:bg-[#F2ECE1]'
                }`}
              >
                <Landmark className="w-4 h-4 text-[#D4A359]" />
                {t('nav.finances')}
              </button>
            )}

            {/* Government Schemes */}
            <button
              onClick={() => onSelectTab('schemes')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentTab === 'schemes'
                  ? 'bg-[#C85A32]/10 text-[#C85A32] font-semibold'
                  : 'text-[#5C5852] hover:text-[#23211E] hover:bg-[#F2ECE1]'
              }`}
            >
              <Shield className="w-4 h-4 text-[#2D5A43]" />
              {t('nav.schemes')}
            </button>

            {/* Craft Map & Clusters */}
            <button
              onClick={() => onSelectTab('clusters')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentTab === 'clusters'
                  ? 'bg-[#C85A32]/10 text-[#C85A32] font-semibold'
                  : 'text-[#5C5852] hover:text-[#23211E] hover:bg-[#F2ECE1]'
              }`}
            >
              <MapPin className="w-4 h-4 text-[#C85A32]" />
              {t('nav.craftMap')}
            </button>

            {/* Admin panel */}
            {role === 'admin' && (
              <button
                onClick={() => onSelectTab('admin')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  currentTab === 'admin'
                    ? 'bg-[#2D5A43] text-white font-semibold'
                    : 'text-[#2D5A43] hover:bg-[#EBF2EE]'
                }`}
              >
                <Shield className="w-4 h-4" />
                {t('nav.admin')}
              </button>
            )}
          </nav>

          {/* Right Controls: Language, Notifications, Auth */}
          <div className="flex items-center gap-3">
            
            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#E8E2D8] bg-white text-xs font-semibold text-[#23211E] hover:bg-[#F7EAE4] hover:border-[#C85A32]/40 transition-all shadow-xs"
              title="Toggle Hindi / English"
            >
              <Globe className="w-3.5 h-3.5 text-[#C85A32]" />
              <span>{language === 'en' ? 'हिंदी' : 'English'}</span>
            </button>

            {/* Notifications Dropdown */}
            {currentUser && (
              <div className="relative">
                <button
                  onClick={() => setShowNotifMenu(!showNotifMenu)}
                  className="p-2 rounded-lg border border-[#E8E2D8] bg-white text-[#5C5852] hover:text-[#23211E] hover:bg-[#F2ECE1] relative transition-colors shadow-xs"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#C85A32] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifMenu && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-[#E8E2D8] p-3 z-50 animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between pb-2 border-b border-[#F2ECE1]">
                      <span className="text-xs font-bold text-[#23211E]">Notifications</span>
                      <span className="text-[10px] text-[#8C827A]">{unreadCount} unread</span>
                    </div>
                    <div className="max-h-64 overflow-y-auto divide-y divide-[#FAF8F5] mt-1">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-[#8C827A] py-4 text-center">No notifications yet.</p>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => handleNotificationClick(n)}
                            className={`p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                              n.is_read ? 'hover:bg-[#FAF8F5] text-[#5C5852]' : 'bg-[#F7EAE4]/50 hover:bg-[#F7EAE4] font-medium text-[#23211E]'
                            }`}
                          >
                            <p className="font-semibold text-[#A44321]">{n.title}</p>
                            <p className="text-[11px] text-[#5C5852] line-clamp-2 mt-0.5">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Auth CTA */}
            {currentUser ? (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={logout}
                  className="p-2 rounded-lg border border-[#E8E2D8] text-[#5C5852] hover:text-red-600 hover:bg-red-50 transition-colors shadow-xs"
                  title={t('nav.signOut')}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="px-3.5 py-1.5 rounded-lg bg-[#C85A32] hover:bg-[#A44321] text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                {t('nav.signIn')}
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg border border-[#E8E2D8] text-[#23211E]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E8E2D8] bg-[#FAF8F5] px-4 py-3 space-y-1 animate-in slide-in-from-top duration-200">
          <button
            onClick={() => { onSelectTab('marketplace'); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-[#23211E] hover:bg-[#F2ECE1] flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4 text-[#C85A32]" /> {t('nav.marketplace')}
          </button>
          {(role === 'artisan' || role === 'admin') && (
            <button
              onClick={() => { onSelectTab('studio'); setMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-[#23211E] hover:bg-[#F2ECE1] flex items-center gap-2"
            >
              <Wand2 className="w-4 h-4 text-[#C85A32]" /> {t('nav.catalogStudio')}
            </button>
          )}
          <button
            onClick={() => { onSelectTab('matchmaker'); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-[#23211E] hover:bg-[#F2ECE1] flex items-center gap-2"
          >
            <Users className="w-4 h-4 text-[#2D5A43]" /> {t('nav.matchmaking')}
          </button>
          {currentUser && (
            <button
              onClick={() => { onSelectTab('orders'); setMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-[#23211E] hover:bg-[#F2ECE1] flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4 text-[#D4A359]" /> {t('nav.orders')}
            </button>
          )}
          {(role === 'artisan' || role === 'admin') && (
            <button
              onClick={() => { onSelectTab('finances'); setMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-[#23211E] hover:bg-[#F2ECE1] flex items-center gap-2"
            >
              <Landmark className="w-4 h-4 text-[#2D5A43]" /> {t('nav.finances')}
            </button>
          )}
          <button
            onClick={() => { onSelectTab('schemes'); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-[#23211E] hover:bg-[#F2ECE1] flex items-center gap-2"
          >
            <Shield className="w-4 h-4 text-[#2D5A43]" /> {t('nav.schemes')}
          </button>
          <button
            onClick={() => { onSelectTab('clusters'); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-[#23211E] hover:bg-[#F2ECE1] flex items-center gap-2"
          >
            <MapPin className="w-4 h-4 text-[#C85A32]" /> {t('nav.craftMap')}
          </button>
          {role === 'admin' && (
            <button
              onClick={() => { onSelectTab('admin'); setMobileMenuOpen(false); }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-[#2D5A43] hover:bg-[#EBF2EE] flex items-center gap-2"
            >
              <Shield className="w-4 h-4" /> {t('nav.admin')}
            </button>
          )}
        </div>
      )}
    </header>
  );
};
