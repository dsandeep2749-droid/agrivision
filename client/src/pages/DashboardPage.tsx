import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ScanLine, 
  Bot, 
  CloudSun, 
  History, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Leaf, 
  PlusCircle, 
  Calendar,
  Sparkles,
  MapPin
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api, CropAssessment, WeatherData } from '../services/api';
import { WeatherCard } from '../components/weather/WeatherCard';

export const DashboardPage: React.FC = () => {
  const { user, token } = useAuth();
  const { t, language } = useLanguage();

  const [assessments, setAssessments] = useState<CropAssessment[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [assessRes, weatherRes] = await Promise.allSettled([
          api.getAssessments(token, { limit: 5 }),
          api.getWeather(16.3067, 80.4365, 'Guntur', 'Andhra Pradesh'),
        ]);

        if (assessRes.status === 'fulfilled') {
          setAssessments(assessRes.value.data || []);
        }

        if (weatherRes.status === 'fulfilled') {
          setWeather(weatherRes.value);
        }
      } catch (err: any) {
        console.error('Failed to load dashboard data:', err);
        setError('Failed to load some dashboard information.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // Derive real statistics from stored data
  const totalAssessments = assessments.length;
  const needingFollowupCount = assessments.filter((a) => a.needs_followup).length;
  const recent30DaysCount = assessments.filter((a) => {
    const d = new Date(a.created_at);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return d >= thirtyDaysAgo;
  }).length;

  const currentDateFormatted = new Date().toLocaleDateString(
    language === 'te' ? 'te-IN' : 'en-IN',
    { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header with greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200/90 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{currentDateFormatted}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-sans tracking-tight">
            {t('dashWelcome')}, {user?.displayName || 'Farmer'}!
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">{t('dashSubtitle')}</p>
        </div>

        {/* Quick action buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/analyze"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-800 hover:bg-emerald-900 text-white shadow-xs transition-colors"
          >
            <ScanLine className="w-4 h-4 text-emerald-300" />
            <span>{t('quickActionAnalyze')}</span>
          </Link>

          <Link
            to="/assistant"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 transition-colors"
          >
            <Bot className="w-4 h-4 text-teal-700" />
            <span>{t('quickActionAssistant')}</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">{t('statTotalAssessments')}</p>
            <p className="text-3xl font-black text-stone-900 mt-1">{totalAssessments}</p>
            <span className="text-[11px] text-stone-400">Total recorded observations</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Leaf className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">{t('statRecentObservations')}</p>
            <p className="text-3xl font-black text-stone-900 mt-1">{recent30DaysCount}</p>
            <span className="text-[11px] text-stone-400">Past 30 days</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">{t('statNeedsFollowup')}</p>
            <p className="text-3xl font-black text-amber-700 mt-1">{needingFollowupCount}</p>
            <span className="text-[11px] text-amber-600 font-medium">Scouting or MAO review</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Assessments & Weather */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Recent Crop Assessments */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-stone-900 font-sans">{t('dashRecentAssessments')}</h2>
            <Link
              to="/history"
              className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
            >
              <span>{t('dashViewAll')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-stone-200 text-xs text-stone-400">
              Loading recent assessments...
            </div>
          ) : assessments.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-stone-300 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
                <PlusCircle className="w-6 h-6" />
              </div>
              <p className="text-xs text-stone-600 max-w-sm mx-auto">{t('dashNoAssessments')}</p>
              <Link
                to="/analyze"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-800 text-white"
              >
                <ScanLine className="w-4 h-4" />
                <span>{t('quickActionAnalyze')}</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {assessments.map((a) => (
                <div
                  key={a.id}
                  className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs hover:shadow-xs transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-950 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
                        {a.crop_name}
                      </span>
                      {a.needs_followup && (
                        <span className="text-[10px] font-bold text-amber-800 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200">
                          Follow-up Advised
                        </span>
                      )}
                      <span className="text-[11px] text-stone-400">
                        {new Date(a.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-stone-900 mt-1">
                      {a.possible_condition || 'Visual Assessment'}
                    </h3>

                    <p className="text-xs text-stone-600 line-clamp-2 max-w-xl">
                      {a.assessment_summary}
                    </p>
                  </div>

                  <Link
                    to={`/history`}
                    className="shrink-0 self-end sm:self-center px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-700 hover:text-emerald-900 hover:bg-stone-100 flex items-center gap-1 transition-colors"
                  >
                    <span>View Record</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Weather Snapshot */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-stone-900 font-sans">{t('dashLocalWeather')}</h2>
            <Link
              to="/weather"
              className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
            >
              <span>{t('quickActionWeather')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {weather ? (
            <div className="space-y-4">
              <WeatherCard weather={weather} compact={true} />

              {/* Top Agro Consideration preview */}
              {weather.agroInsights && weather.agroInsights.length > 0 && (
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block mb-1">
                    Agro Advisory Preview
                  </span>
                  <h4 className="text-xs font-bold text-stone-900">
                    {language === 'te' ? weather.agroInsights[0].titleTe : weather.agroInsights[0].title}
                  </h4>
                  <p className="text-xs text-stone-700 mt-1 leading-relaxed line-clamp-3">
                    {language === 'te' ? weather.agroInsights[0].descriptionTe : weather.agroInsights[0].description}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-stone-200 text-xs text-stone-400">
              Loading weather...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
