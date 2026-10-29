import React from 'react';
import { 
  CloudSun, 
  Droplets, 
  Wind, 
  CloudRain, 
  Compass, 
  MapPin, 
  Sun, 
  Cloud, 
  CloudLightning 
} from 'lucide-react';
import { WeatherData } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

interface WeatherCardProps {
  weather: WeatherData;
  compact?: boolean;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({ weather, compact = false }) => {
  const { t, language } = useLanguage();
  const { current, location } = weather;

  const getWeatherIcon = (code: number) => {
    if (code === 0) return <Sun className="w-8 h-8 text-amber-500" />;
    if (code >= 1 && code <= 3) return <CloudSun className="w-8 h-8 text-amber-500" />;
    if (code >= 51 && code <= 67) return <CloudRain className="w-8 h-8 text-blue-500" />;
    if (code >= 80 && code <= 82) return <CloudRain className="w-8 h-8 text-blue-600" />;
    if (code >= 95) return <CloudLightning className="w-8 h-8 text-purple-600" />;
    return <Cloud className="w-8 h-8 text-stone-400" />;
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-900 to-green-800 p-5 text-white">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-emerald-200 text-xs font-semibold uppercase tracking-wider mb-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>{location.name} {location.admin1 ? `(${location.admin1})` : ''}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold tracking-tight">{Math.round(current.temperature)}°C</span>
              <span className="text-sm text-emerald-100 font-medium">{current.conditionText}</span>
            </div>
            <p className="text-xs text-emerald-200/80 mt-1">
              {t('weatherFeelsLike')}: {Math.round(current.apparentTemperature)}°C
            </p>
          </div>
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-xs">
            {getWeatherIcon(current.weatherCode)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 divide-x divide-stone-100 p-4 bg-stone-50/50">
        <div className="flex flex-col items-center justify-center text-center p-2">
          <div className="flex items-center gap-1 text-xs text-stone-500 font-medium mb-1">
            <Droplets className="w-3.5 h-3.5 text-blue-500" />
            <span>{t('weatherHumidity')}</span>
          </div>
          <span className="text-base font-bold text-stone-800">{current.relativeHumidity}%</span>
        </div>

        <div className="flex flex-col items-center justify-center text-center p-2">
          <div className="flex items-center gap-1 text-xs text-stone-500 font-medium mb-1">
            <Wind className="w-3.5 h-3.5 text-teal-600" />
            <span>{t('weatherWind')}</span>
          </div>
          <span className="text-base font-bold text-stone-800">{Math.round(current.windSpeed)} km/h</span>
        </div>

        <div className="flex flex-col items-center justify-center text-center p-2">
          <div className="flex items-center gap-1 text-xs text-stone-500 font-medium mb-1">
            <CloudRain className="w-3.5 h-3.5 text-indigo-500" />
            <span>{t('weatherPrecipitation')}</span>
          </div>
          <span className="text-base font-bold text-stone-800">{current.precipitation.toFixed(1)} mm</span>
        </div>
      </div>
    </div>
  );
};
