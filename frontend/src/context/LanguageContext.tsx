import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'hi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  speak: (text: string) => void;
  isSpeaking: boolean;
}

const translations: Record<string, Record<Language, string>> = {
  // Navigation & Branding
  'brand.name': { en: 'ShilpAI', hi: 'शिल्पएआई' },
  'brand.tagline': { en: 'From Craft to Commerce — AI Business Manager for Artisans', hi: 'कला से कारोबार तक — शिल्पकारों का एआई बिजनेस मैनेजर' },
  'nav.marketplace': { en: 'Marketplace', hi: 'हाट / बाज़ार' },
  'nav.catalogStudio': { en: 'AI Studio', hi: 'एआई स्टूडियो' },
  'nav.dashboard': { en: 'Dashboard', hi: 'डैशबोर्ड' },
  'nav.matchmaking': { en: 'B2B Matchmaker', hi: 'थोक खरीदार खोज' },
  'nav.orders': { en: 'Orders', hi: 'ऑर्डर ट्रैकर' },
  'nav.finances': { en: 'Finances', hi: 'आय-व्यय व मुनाफा' },
  'nav.schemes': { en: 'Govt Schemes', hi: 'सरकारी योजनाएं' },
  'nav.clusters': { en: 'Craft Clusters', hi: 'शिल्प क्लस्टर' },
  'nav.craftMap': { en: 'Craft Map of India', hi: 'भारत का शिल्प मानचित्र' },
  'nav.admin': { en: 'Platform Admin', hi: 'एडमिन पैनल' },
  'nav.signIn': { en: 'Sign In', hi: 'लॉग इन' },
  'nav.signOut': { en: 'Sign Out', hi: 'लॉग आउट' },

  // Role labels
  'role.artisan': { en: 'Artisan / Seller', hi: 'शिल्पकार / विक्रेता' },
  'role.buyer': { en: 'B2B Buyer', hi: 'थोक खरीदार' },
  'role.cluster_manager': { en: 'Cluster Manager', hi: 'क्लस्टर प्रबंधक' },
  'role.admin': { en: 'Administrator', hi: 'व्यवस्थापक' },

  // Studio & Catalog
  'studio.title': { en: 'Zero-Form Smart Catalog Studio', hi: 'ज़ीरो-फॉर्म स्मार्ट कैटलॉग स्टूडियो' },
  'studio.subtitle': { en: 'Capture a photo and speak naturally to create a market-ready bilingual listing in seconds.', hi: 'फोटो खींचें और अपनी भाषा में बोलें — सेकंडों में बाज़ार के लिए द्विभाषी लिस्टिंग तैयार।' },
  'studio.step1': { en: '1. Take or Upload Product Photo', hi: '१. उत्पाद का फोटो खींचें या अपलोड करें' },
  'studio.step2': { en: '2. Speak or Describe Your Craft', hi: '२. अपनी कलाकृति के बारे में बोलकर बताएं' },
  'studio.step3': { en: '3. AI Image Studio & Background Cleanup', hi: '३. एआई फोटो संवर्धन व पृष्ठभूमि सफाई' },
  'studio.step4': { en: '4. Dynamic Cost & Margin Pricing', hi: '४. लागत व सुरक्षित मुनाफा मूल्य निर्धारण' },
  'studio.step5': { en: '5. Review & Publish Listing', hi: '५. समीक्षा करें और तुरंत प्रकाशित करें' },
  
  // Voice & Multilingual
  'voice.listening': { en: 'Listening... speak clearly in Hindi or English', hi: 'सुन रहे हैं... कृपया हिंदी या अंग्रेजी में स्पष्ट बोलें' },
  'voice.startPrompt': { en: 'Tap microphone and speak about your product (materials, technique, size)', hi: 'माइक दबाकर अपनी वस्तु के बारे में बताएं (सामग्री, तकनीक, आकार)' },
  'voice.readAloud': { en: 'Listen Audio', hi: 'आवाज में सुनें' },

  // Pricing
  'pricing.title': { en: 'Dynamic Pricing Assistant', hi: 'डायनामिक मूल्य निर्धारण सहायक' },
  'pricing.formulaNotice': { en: 'Pricing Formula: Selling Price = Total Cost / (1 - Target Margin %)', hi: 'गणना सूत्र: विक्रय मूल्य = कुल लागत / (1 - लक्षित मुनाफा %)' },
  'pricing.rawMaterial': { en: 'Raw Material Cost (₹)', hi: 'कच्चे माल की लागत (₹)' },
  'pricing.labor': { en: 'Artisan Labor Cost (₹)', hi: 'कारीगरी व श्रम लागत (₹)' },
  'pricing.packaging': { en: 'Packaging Cost (₹)', hi: 'पैकेजिंग लागत (₹)' },
  'pricing.overhead': { en: 'Overhead & Utility Allocation (₹)', hi: 'अन्य अप्रत्यक्ष खर्च (₹)' },
  'pricing.targetMargin': { en: 'Target Gross Margin (%)', hi: 'लक्षित मुनाफा प्रतिशत (%)' },
  'pricing.recommendedTarget': { en: 'Recommended Selling Price', hi: 'सुझाया गया विक्रय मूल्य' },
  'pricing.minPrice': { en: 'Floor Price (Min Acceptable)', hi: 'न्यूनतम स्वीकार्य दर' },
  'pricing.maxPrice': { en: 'Boutique / Export Premium', hi: 'प्रीमियम / बुटीक दर' },
  'pricing.warning': { en: 'Underpricing Warning: Your profit margin is below healthy threshold!', hi: 'कम मूल्य चेतावनी: आपका मुनाफा सुरक्षित स्तर से कम है!' },

  // Marketing
  'marketing.title': { en: 'AI Social Media & Marketing Pack', hi: 'एआई सोशल मीडिया व प्रचार सामग्री' },
  'marketing.generateBtn': { en: 'Generate Marketing Pack', hi: 'मार्केटिंग पैक तैयार करें' },
  'marketing.copy': { en: 'Copy Text', hi: 'कॉपी करें' },
  'marketing.copied': { en: 'Copied to Clipboard!', hi: 'कॉपी हो गया!' },

  // Craft Passport
  'passport.title': { en: 'Digital Craft Passport', hi: 'डिजिटल क्राफ्ट पासपोर्ट' },
  'passport.scanSubtitle': { en: 'Verified Handcrafted Provenance & Cultural Heritage', hi: 'सत्यापित हस्तनिर्मित प्रामाणिकता व सांस्कृतिक धरोहर' },
  'passport.downloadQR': { en: 'Download Packaging QR Code', hi: 'पैकेजिंग क्यूआर कोड डाउनलोड करें' },

  // Assistant
  'manager.title': { en: 'AI Virtual Business Manager', hi: 'एआई वर्चुअल बिजनेस मैनेजर' },
  'manager.subtitle': { en: 'Grounded in your actual inventory, orders, and finances.', hi: 'आपके वास्तविक स्टॉक, ऑर्डर और मुनाफे पर आधारित।' },
  'manager.askPlaceholder': { en: 'Ask: "How much did I earn this month?" or "What should I restock?"', hi: 'पूछें: "इस महीने मेरा मुनाफा कितना रहा?" या "किस सामान का निर्माण शुरू करूं?"' },

  // Common buttons
  'btn.publish': { en: 'Publish to Marketplace', hi: 'हाट में प्रकाशित करें' },
  'btn.saveDraft': { en: 'Save Draft', hi: 'ड्राफ्ट सहेजें' },
  'btn.enhance': { en: 'Enhance Lighting & Contrast', hi: 'लाइटिंग व कंट्रास्ट सुधारें' },
  'btn.removeBg': { en: 'Studio Clean Background', hi: 'स्टूडियो साफ बैकग्राउंड' },
  'btn.lifestyle': { en: 'Living Room Staged View', hi: 'लिविंग रूम सजावट दृश्य' },
  'btn.submitInquiry': { en: 'Send Wholesale Inquiry', hi: 'थोक पूछताछ भेजें' },
  'btn.createQuotation': { en: 'Send Quotation', hi: 'कोटेशन भेजें' },
  'btn.accept': { en: 'Accept & Confirm Order', hi: 'स्वीकारें व ऑर्डर बनाएं' }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('shilpai_lang') as Language) || 'en';
  });
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('shilpai_lang', lang);
  };

  const t = (key: string): string => {
    if (translations[key] && translations[key][language]) {
      return translations[key][language];
    }
    return key;
  };

  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis not supported in this browser.');
      return;
    }
    window.speechSynthesis.cancel();
    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.95;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, speak, isSpeaking }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
