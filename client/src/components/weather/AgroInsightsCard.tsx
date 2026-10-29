import React from 'react';
import { ShieldAlert, AlertTriangle, Info, Droplets, Wind, Thermometer, Bug } from 'lucide-react';
import { WeatherData } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

interface AgroInsightsCardProps {
  insights: WeatherData['agroInsights'];
}

export const AgroInsightsCard: React.FC<AgroInsightsCardProps> = ({ insights }) => {
  const { language, t } = useLanguage();

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'warning':
        return {
          border: 'border-amber-300 bg-amber-50/70',
          badge: 'bg-amber-100 text-amber-800 border-amber-200',
          icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
        };
      case 'caution':
        return {
          border: 'border-blue-200 bg-blue-50/60',
          badge: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: <Info className="w-5 h-5 text-blue-600 shrink-0" />,
        };
      default:
        return {
          border: 'border-emerald-200 bg-emerald-50/60',
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          icon: <Info className="w-5 h-5 text-emerald-600 shrink-0" />,
        };
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'irrigation':
        return <Droplets className="w-4 h-4" />;
      case 'spraying':
        return <Wind className="w-4 h-4" />;
      case 'heat_stress':
        return <Thermometer className="w-4 h-4" />;
      case 'disease_risk':
        return <Bug className="w-4 h-4" />;
      default:
        return <ShieldAlert className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
          <Droplets className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-stone-900 font-sans">{t('weatherAgroInsightsTitle')}</h3>
          <p className="text-xs text-stone-500">Pragmatic, cautious guidance computed from live forecast metrics</p>
        </div>
      </div>

      <div className="space-y-3">
        {insights.map((insight, idx) => {
          const style = getSeverityStyle(insight.severity);
          const title = language === 'te' ? insight.titleTe : insight.title;
          const desc = language === 'te' ? insight.descriptionTe : insight.description;

          return (
            <div
              key={idx}
              className={`p-4 rounded-xl border ${style.border} transition-all`}
            >
              <div className="flex items-start gap-3">
                {style.icon}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <h4 className="text-sm font-bold text-stone-900">{title}</h4>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${style.badge}`}>
                      {getTypeIcon(insight.type)}
                      <span>{insight.type.replace('_', ' ')}</span>
                    </span>
                  </div>
                  <p className="text-xs text-stone-700 leading-relaxed">{desc}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
