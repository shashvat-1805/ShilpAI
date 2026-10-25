import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { RoleBanner } from './components/common/RoleBanner';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { AuthModal } from './components/common/AuthModal';
import { BuyerMarketplace } from './components/buyer/BuyerMarketplace';
import { SmartCatalogStudio } from './components/artisan/SmartCatalogStudio';
import { BuyerMatchmaker } from './components/buyer/BuyerMatchmaker';
import { OrdersTracker } from './components/artisan/OrdersTracker';
import { FinancesDashboard } from './components/artisan/FinancesDashboard';
import { MarketingGenerator } from './components/artisan/MarketingGenerator';
import { SchemesNavigator } from './components/schemes/SchemesNavigator';
import { ClusterIntelligence } from './components/clusters/ClusterIntelligence';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { PublicCraftPassport } from './components/passport/PublicCraftPassport';
import { AIBusinessManagerModal } from './components/artisan/AIBusinessManagerModal';
import { Bot, Sparkles } from 'lucide-react';

const MainContent: React.FC = () => {
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  const [currentTab, setCurrentTab] = useState<string>('marketplace');
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [aiManagerOpen, setAiManagerOpen] = useState<boolean>(false);
  const [passportCode, setPassportCode] = useState<string | null>(null);

  // Check URL path for public passport scan (e.g. /passport/public/SHILP-...)
  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes('/passport/public/')) {
      const code = path.split('/passport/public/')[1];
      if (code) {
        setPassportCode(code);
        setCurrentTab('passport');
      }
    }
  }, []);

  const handleOpenPassport = (code: string) => {
    setPassportCode(code);
    setCurrentTab('passport');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#23211E]">
      
      {/* 1-Click Role Switcher Demo Banner */}
      <RoleBanner />

      {/* Main Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setPassportCode(null);
          setCurrentTab(tab);
        }}
        onOpenAuthModal={() => setAuthModalOpen(true)}
      />

      {/* Main Body */}
      <main className="flex-1">
        {currentTab === 'passport' && passportCode ? (
          <PublicCraftPassport
            publicCode={passportCode}
            onBack={() => setCurrentTab('marketplace')}
          />
        ) : currentTab === 'studio' ? (
          <SmartCatalogStudio onProductCreated={() => setCurrentTab('marketplace')} />
        ) : currentTab === 'matchmaker' ? (
          <BuyerMatchmaker onOpenProductDetail={() => setCurrentTab('marketplace')} />
        ) : currentTab === 'orders' ? (
          <OrdersTracker />
        ) : currentTab === 'finances' ? (
          <FinancesDashboard />
        ) : currentTab === 'marketing' ? (
          <MarketingGenerator />
        ) : currentTab === 'schemes' ? (
          <SchemesNavigator />
        ) : currentTab === 'clusters' ? (
          <ClusterIntelligence />
        ) : currentTab === 'admin' ? (
          <AdminDashboard />
        ) : (
          <BuyerMarketplace
            onOpenPassport={handleOpenPassport}
            onOpenStudio={() => setCurrentTab('studio')}
          />
        )}
      </main>

      {/* Floating AI Business Manager Trigger (Available for Artisans) */}
      {(currentUser?.role === 'artisan' || currentUser?.role === 'admin' || !currentUser) && (
        <button
          onClick={() => setAiManagerOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-[#C85A32] hover:bg-[#A44321] text-white p-3.5 rounded-full shadow-2xl flex items-center gap-2 group transition-all duration-300 active:scale-95 ring-4 ring-[#C85A32]/20"
          title="Open AI Virtual Business Manager"
        >
          <Bot className="w-5 h-5 text-amber-200" />
          <span className="text-xs font-bold hidden sm:inline max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300">
            AI Business Manager
          </span>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
          </span>
        </button>
      )}

      {/* AI Business Manager Modal */}
      <AIBusinessManagerModal
        isOpen={aiManagerOpen}
        onClose={() => setAiManagerOpen(false)}
        onNavigateTab={(tab) => {
          setPassportCode(null);
          setCurrentTab(tab);
        }}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <MainContent />
      </LanguageProvider>
    </AuthProvider>
  );
}
