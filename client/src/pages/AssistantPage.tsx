import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Bot, 
  Send, 
  User, 
  Trash2, 
  Sparkles, 
  ShieldAlert, 
  Languages, 
  CornerDownLeft,
  AlertCircle
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const AssistantPage: React.FC = () => {
  const { t, language, toggleLanguage } = useLanguage();
  const { user } = useAuth();
  const location = useLocation();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Initial greeting and handling of passed-in prompt from crop analysis
  useEffect(() => {
    const passedPrompt = (location.state as any)?.initialPrompt;
    const cropContext = (location.state as any)?.cropContext;

    const initialGreeting = language === 'te'
      ? `నమస్కారం ${user?.displayName || 'రైతు సోదరులారా'}! నేను మీ AgriVision AI వ్యవసాయ సహాయకుడిని. మీ పంట సంరక్షణ, ఎరువులు, నీటి తడులు మరియు సహజ పురుగుల నివారణ గురించి నన్ను ఏమైనా అడగండి.`
      : `Hello ${user?.displayName || 'Farmer'}! I am your AgriVision AI Farming Assistant. How can I assist with your crops, water scheduling, or pest scouting today?`;

    const initialMsgs: ChatMessage[] = [
      {
        id: 'msg-init',
        role: 'assistant',
        content: initialGreeting,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];

    setMessages(initialMsgs);

    if (passedPrompt) {
      handleSend(passedPrompt, cropContext);
    }
  }, [language]);

  const handleSend = async (messageText?: string, cropContext?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isLoading) return;

    setError(null);
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setIsLoading(true);

    try {
      const apiMessages = newHistory.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const reply = await api.chat(apiMessages, language, 'Andhra Pradesh / Telangana', cropContext);

      const assistantMsg: ChatMessage = {
        id: `msg-ast-${Date.now()}`,
        role: 'assistant',
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setError(err.message || 'Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'msg-init-reset',
        role: 'assistant',
        content: language === 'te' ? 'సంభాషణ తిరిగి ప్రారంభించబడింది. మీ ప్రశ్నను అడగండి.' : 'Conversation cleared. Feel free to ask another farming question.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const suggestedChips = [
    t('chip1'),
    t('chip2'),
    t('chip3'),
    t('chip4'),
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4 h-[calc(100vh-8rem)] flex flex-col">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-800 text-teal-100 flex items-center justify-center shadow-xs">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-bold text-stone-900 font-sans">{t('assistantTitle')}</h1>
            <p className="text-[11px] text-stone-500">Multilingual Agricultural Knowledge & Diagnostic Follow-up</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 cursor-pointer"
          >
            <Languages className="w-3.5 h-3.5 text-teal-700" />
            <span>{language === 'en' ? 'తెలుగు' : 'English'}</span>
          </button>

          <button
            onClick={handleClearChat}
            className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            title={t('assistantClear')}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll View */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-emerald-800 text-white'
                    : 'bg-teal-100 text-teal-900 border border-teal-200'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[82%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-emerald-800 text-white rounded-tr-xs'
                    : 'bg-white border border-stone-200/90 text-stone-800 shadow-2xs rounded-tl-xs whitespace-pre-line'
                }`}
              >
                <div className="space-y-1">
                  <p>{msg.content}</p>
                  <span className={`block text-[10px] text-right mt-1 ${isUser ? 'text-emerald-200' : 'text-stone-400'}`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-900 border border-teal-200 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-stone-200 rounded-2xl rounded-tl-xs px-4 py-3 shadow-2xs flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-teal-600 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-teal-600 animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 rounded-full bg-teal-600 animate-bounce [animation-delay:0.4s]" />
              <span className="text-xs text-stone-500 ml-1">Thinking...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested question chips */}
      <div className="pt-2">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-stone-500 mb-1.5">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          <span>{t('assistantSuggestedTitle')}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {suggestedChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(chip)}
              className="px-2.5 py-1 rounded-full bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 text-[11px] transition-colors cursor-pointer text-left"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Input bar */}
      <div className="relative pt-1">
        <div className="flex items-center gap-2 bg-white rounded-2xl border border-stone-300 shadow-sm p-1.5 focus-within:ring-2 focus-within:ring-teal-700/30 focus-within:border-teal-700">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('assistantPlaceholder')}
            className="flex-1 px-3 py-2 text-xs focus:outline-hidden"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="p-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white disabled:opacity-40 transition-colors cursor-pointer shrink-0"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-stone-400 mt-1 text-center">
          {t('assistantDisclaimer')}
        </p>
      </div>
    </div>
  );
};

