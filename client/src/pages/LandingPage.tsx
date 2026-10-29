import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sprout, 
  ScanLine, 
  Bot, 
  CloudSun, 
  History, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Languages, 
  Leaf, 
  Sparkles,
  PhoneCall
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { t, language, toggleLanguage } = useLanguage();
  const { user } = useAuth();

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-16 sm:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-900 text-xs font-semibold shadow-2xs">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <span>Smart Agriculture for Indian Farmers</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-emerald-700">English & తెలుగు</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-emerald-950 font-sans leading-[1.15]">
              {t('heroHeadline')}
            </h1>

            <p className="text-base sm:text-lg text-stone-600 leading-relaxed font-normal">
              {t('heroSubheadline')}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Link
                to={user ? '/dashboard' : '/auth'}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold bg-emerald-800 hover:bg-emerald-900 text-white shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <span>{user ? t('navDashboard') : t('ctaStartFarming')}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/analyze"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 shadow-2xs transition-all cursor-pointer"
              >
                <ScanLine className="w-4 h-4 text-emerald-700" />
                <span>{t('ctaExploreFeatures')}</span>
              </Link>
            </div>

            {/* Micro Highlights */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs text-stone-500">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>No complex setup</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Real-time Open-Meteo weather</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Non-chemical safe advice</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-sans tracking-tight">
            Comprehensive Digital Agronomy in Your Pocket
          </h2>
          <p className="text-sm text-stone-600 mt-2">
            Engineered to assist smallholders and progressive farmers across diverse crops and micro-climates.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4">
                <ScanLine className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-stone-900 mb-2 font-sans">{t('featureCropAnalysisTitle')}</h3>
              <p className="text-xs text-stone-600 leading-relaxed">{t('featureCropAnalysisDesc')}</p>
            </div>
            <Link to="/analyze" className="mt-6 text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1">
              <span>Try Analysis</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center mb-4">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-stone-900 mb-2 font-sans">{t('featureAssistantTitle')}</h3>
              <p className="text-xs text-stone-600 leading-relaxed">{t('featureAssistantDesc')}</p>
            </div>
            <Link to="/assistant" className="mt-6 text-xs font-semibold text-teal-800 hover:text-teal-950 flex items-center gap-1">
              <span>Chat in English / తెలుగు</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4">
                <CloudSun className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-stone-900 mb-2 font-sans">{t('featureWeatherTitle')}</h3>
              <p className="text-xs text-stone-600 leading-relaxed">{t('featureWeatherDesc')}</p>
            </div>
            <Link to="/weather" className="mt-6 text-xs font-semibold text-amber-800 hover:text-amber-950 flex items-center gap-1">
              <span>View Weather</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-stone-100 text-stone-800 flex items-center justify-center mb-4">
                <History className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-stone-900 mb-2 font-sans">{t('featureHistoryTitle')}</h3>
              <p className="text-xs text-stone-600 leading-relaxed">{t('featureHistoryDesc')}</p>
            </div>
            <Link to="/history" className="mt-6 text-xs font-semibold text-stone-800 hover:text-stone-950 flex items-center gap-1">
              <span>Review Past Logs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="bg-stone-100/70 py-16 border-y border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-sans tracking-tight">
              {t('howItWorksTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-2">
              Three simple steps from observing symptoms in the field to taking safe, verifiable action.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs relative">
              <span className="text-3xl font-black text-emerald-200/80 absolute top-4 right-4">01</span>
              <h3 className="text-base font-bold text-stone-900 mb-2">{t('step1Title')}</h3>
              <p className="text-xs text-stone-600 leading-relaxed">{t('step1Desc')}</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs relative">
              <span className="text-3xl font-black text-emerald-200/80 absolute top-4 right-4">02</span>
              <h3 className="text-base font-bold text-stone-900 mb-2">{t('step2Title')}</h3>
              <p className="text-xs text-stone-600 leading-relaxed">{t('step2Desc')}</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs relative">
              <span className="text-3xl font-black text-emerald-200/80 absolute top-4 right-4">03</span>
              <h3 className="text-base font-bold text-stone-900 mb-2">{t('step3Title')}</h3>
              <p className="text-xs text-stone-600 leading-relaxed">{t('step3Desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Bilingual Feature Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-green-900 text-white shadow-md relative overflow-hidden">
          <div className="max-w-2xl relative z-10 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-semibold">
              <Languages className="w-3.5 h-3.5" />
              <span>తెలుగు మరియు ఇంగ్లీష్ (Telugu & English)</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight font-sans">
              {t('bilingualNoticeTitle')}
            </h2>

            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              {t('bilingualNoticeDesc')}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={toggleLanguage}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-emerald-950 hover:bg-emerald-50 transition-colors cursor-pointer shadow-xs"
              >
                {language === 'en' ? 'తెలుగులోకి మార్చండి (Switch to Telugu)' : 'Switch to English'}
              </button>

              <Link
                to="/assistant"
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-800 hover:bg-emerald-700 text-white border border-emerald-600 transition-colors"
              >
                {t('featureAssistantTitle')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Scientific Responsibility Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 rounded-2xl bg-amber-50/80 border border-amber-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-amber-100 text-amber-800 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-950">{t('responsibleUseTitle')}</h4>
              <p className="text-xs text-amber-900/90 leading-relaxed mt-1 max-w-3xl">
                {t('responsibleUseNotice')}
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2 text-xs font-semibold text-amber-900 bg-amber-100/80 px-3 py-2 rounded-xl">
            <PhoneCall className="w-4 h-4 text-amber-800" />
            <span>Kisan Call: 1800-180-1551</span>
          </div>
        </div>
      </section>
    </div>
  );
};

