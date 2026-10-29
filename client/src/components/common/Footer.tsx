import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, ShieldAlert, Heart, ExternalLink } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const Footer: React.FC = () => {
  const { t, language } = useLanguage();

  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-stone-800 mt-auto">
      {/* Responsible Use Banner */}
      <div className="bg-emerald-950/80 border-b border-emerald-900/50 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="text-xs text-stone-300 leading-relaxed">
            <span className="font-semibold text-amber-300 uppercase tracking-wider block sm:inline mr-2">
              {t('responsibleUseTitle')}:
            </span>
            {t('responsibleUseNotice')}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white">
                <Sprout className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg text-white font-sans">AgriVision AI</span>
            </div>
            <p className="text-xs text-stone-400 max-w-md leading-relaxed">
              {language === 'te'
                ? 'రైతుల కోసం రూపొందించిన ఆధునిక స్మార్ట్ వ్యవసాయ వేదిక. AI సాంకేతికతతో పంట లక్షణాల పరిశీలన, శాస్త్రీయ వాతావరణ అంచనాలు మరియు ఆచరణాత్మక వ్యవసాయ సలహాలు.'
                : 'An intelligent agriculture platform supporting Indian farmers with multimodal foliar symptom observations, live micro-climate forecasts, and practical agronomic guidance.'}
            </p>
            <div className="text-xs text-stone-400 pt-2 flex items-center gap-2">
              <span>Weather data:</span>
              <a
                href="https://open-meteo.com/"
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 hover:underline inline-flex items-center gap-1"
              >
                Open-Meteo API <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-200 mb-3">Quick Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/analyze" className="hover:text-emerald-400 transition-colors">{t('navAnalyze')}</Link></li>
              <li><Link to="/assistant" className="hover:text-emerald-400 transition-colors">{t('navAssistant')}</Link></li>
              <li><Link to="/weather" className="hover:text-emerald-400 transition-colors">{t('navWeather')}</Link></li>
              <li><Link to="/history" className="hover:text-emerald-400 transition-colors">{t('navHistory')}</Link></li>
              <li><Link to="/dashboard" className="hover:text-emerald-400 transition-colors">{t('navDashboard')}</Link></li>
            </ul>
          </div>

          {/* Agricultural Helplines */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-200 mb-3">Farmer Helplines (India)</h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li><span className="text-stone-300 font-medium">Kisan Call Center:</span> 1800-180-1551 (Toll-Free)</li>
              <li><span className="text-stone-300 font-medium">Andhra Pradesh RBK:</span> 155251</li>
              <li><span className="text-stone-300 font-medium">Telangana Agri Helpline:</span> 040-23383520</li>
              <li className="pt-1 text-[11px] text-stone-400">Local Krishi Vigyan Kendra (KVK) for physical lab diagnostics.</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-stone-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-400">
          <p>© {new Date().getFullYear()} AgriVision AI. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with care for farmers across India <Heart className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" />
          </p>
        </div>
      </div>
    </footer>
  );
};
