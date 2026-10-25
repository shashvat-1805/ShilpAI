import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import {
  Sparkles, Send, Volume2, MessageSquare, Bot, ArrowRight,
  TrendingUp, PackageCheck, AlertCircle, RefreshCw, X
} from 'lucide-react';

interface AIBusinessManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
}

export const AIBusinessManagerModal: React.FC<AIBusinessManagerModalProps> = ({ isOpen, onClose, onNavigateTab }) => {
  const { t, language, speak, isSpeaking } = useLanguage();
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'assistant'; text: string; actions?: any[] }>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Fetch daily briefing as opening prompt
      setLoading(true);
      api.getDailyBrief()
        .then((res) => {
          setMessages([
            {
              sender: 'assistant',
              text: res.answer,
              actions: res.suggested_actions
            }
          ]);
        })
        .catch(() => {
          setMessages([
            {
              sender: 'assistant',
              text: language === 'hi'
                ? "नमस्ते! मैं आपका शिल्पएआई वर्चुअल बिजनेस मैनेजर हूँ। मुझसे अपने मुनाफे, स्टॉक, बायर पूछताछ या ऑर्डर के बारे में पूछें।"
                : "Namaste! I am your ShilpAI Business Manager. Ask me about your profits, inventory, inquiries, or order fulfillment.",
              actions: []
            }
          ]);
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, language]);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    const userText = query;
    setQuery('');
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setLoading(true);

    try {
      const res = await api.askBusinessManager(userText, language);
      setMessages(prev => [...prev, {
        sender: 'assistant',
        text: res.answer,
        actions: res.suggested_actions
      }]);
    } catch (err: any) {
      setMessages(prev => [...prev, {
        sender: 'assistant',
        text: "I experienced an issue fetching the database context. Please verify your connection."
      }]);
    } finally {
      setLoading(false);
    }
  };

  const sampleQuestions = language === 'hi' ? [
    "इस महीने मेरी कुल कमाई और मुनाफा कितना हुआ?",
    "किन उत्पादों का स्टॉक कम है और निर्माण शुरू करना चाहिए?",
    "क्या कोई लंबित बायर पूछताछ है जिसे जवाब देना बाकी है?",
    "आगामी त्योहारी सीजन के लिए क्या मार्केटिंग रणनीति होनी चाहिए?"
  ] : [
    "What is my net profit and margin breakdown this month?",
    "Which products are low on stock and need restocking?",
    "Do I have any pending wholesale inquiries to reply to?",
    "What are the best seasonal promotion tips for my craft?"
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-[#FAF8F5] rounded-2xl shadow-2xl border border-[#E8E2D8] w-full max-w-2xl h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#23211E] to-[#3D3A35] text-white p-4 flex items-center justify-between border-b border-[#3D3A35]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C85A32] to-[#A44321] flex items-center justify-center shadow-md">
              <Bot className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-serif font-bold text-base">{t('manager.title')}</h3>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-600/30">
                  Grounded DB Live
                </span>
              </div>
              <p className="text-[11px] text-[#A8A29E]">{t('manager.subtitle')}</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-lg text-[#A8A29E] hover:text-white hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed whitespace-pre-line shadow-xs ${
                  m.sender === 'user'
                    ? 'bg-[#C85A32] text-white rounded-br-xs'
                    : 'bg-white text-[#23211E] border border-[#E8E2D8] rounded-bl-xs'
                }`}
              >
                {m.text}

                {/* Text-to-speech button on assistant answers */}
                {m.sender === 'assistant' && (
                  <div className="mt-2 pt-2 border-t border-[#F2ECE1] flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => speak(m.text)}
                      className="text-[11px] text-[#C85A32] font-semibold flex items-center gap-1 hover:underline"
                    >
                      <Volume2 className="w-3.5 h-3.5" /> {isSpeaking ? 'Stop Audio' : t('voice.readAloud')}
                    </button>
                    <span className="text-[10px] text-[#8C827A]">Grounded in Artisan DB</span>
                  </div>
                )}
              </div>

              {/* Action Buttons if provided */}
              {m.actions && m.actions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2 max-w-[85%]">
                  {m.actions.map((act, actIdx) => (
                    <button
                      key={actIdx}
                      onClick={() => {
                        onClose();
                        if (act.action.includes('finances')) onNavigateTab('finances');
                        else if (act.action.includes('orders')) onNavigateTab('orders');
                        else if (act.action.includes('catalog')) onNavigateTab('studio');
                        else if (act.action.includes('marketing')) onNavigateTab('marketing');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#EBF2EE] hover:bg-[#D7E7DE] border border-[#2D5A43]/30 text-[#2D5A43] text-[11px] font-bold flex items-center gap-1 transition-colors"
                    >
                      <span>{act.label}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-[#8C827A] bg-white p-3 rounded-2xl border border-[#E8E2D8] w-fit">
              <RefreshCw className="w-4 h-4 animate-spin text-[#C85A32]" />
              <span>Analyzing your database metrics...</span>
            </div>
          )}
        </div>

        {/* Quick Sample Questions Bar */}
        <div className="p-2.5 bg-[#FAF8F5] border-t border-[#E8E2D8] overflow-x-auto flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-[#8C827A] whitespace-nowrap pl-1">Suggested:</span>
          {sampleQuestions.map((q, qIdx) => (
            <button
              key={qIdx}
              onClick={() => {
                setQuery(q);
              }}
              className="px-2.5 py-1 rounded-full bg-white hover:bg-[#F7EAE4] border border-[#E8E2D8] text-[10px] font-medium text-[#5C5852] hover:text-[#C85A32] whitespace-nowrap transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-[#E8E2D8] flex items-center gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('manager.askPlaceholder')}
            className="flex-1 px-4 py-2.5 rounded-xl border border-[#E8E2D8] text-xs bg-[#FAF8F5] focus:ring-2 focus:ring-[#C85A32] focus:outline-hidden"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="p-2.5 rounded-xl bg-[#C85A32] text-white hover:bg-[#A44321] transition-all disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};
