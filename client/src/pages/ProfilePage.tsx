import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  MapPin, 
  Languages, 
  Database, 
  LogOut, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api, UserProfile } from '../services/api';

export const ProfilePage: React.FC = () => {
  const { user, token, signOut, isDemoMode, isSupabaseConfigured } = useAuth();
  const { t, language, setLanguage } = useLanguage();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [preferredLang, setPreferredLang] = useState<'en' | 'te'>(language);
  const [defaultLocation, setDefaultLocation] = useState('Guntur, Andhra Pradesh');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const p = await api.getProfile(token);
        if (p) {
          if (p.display_name) setDisplayName(p.display_name);
          if (p.preferred_language) {
            setPreferredLang(p.preferred_language);
            setLanguage(p.preferred_language);
          }
          if (p.default_location) setDefaultLocation(p.default_location);
        }
      } catch (err) {
        console.warn('Could not load profile from server:', err);
      }
    };

    fetchProfile();
  }, [token]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      await api.updateProfile(
        {
          display_name: displayName,
          preferred_language: preferredLang,
          default_location: defaultLocation,
        },
        token
      );
      setLanguage(preferredLang);
      setSuccessMsg(t('profileSavedSuccess'));
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-sans tracking-tight">
          {t('profileTitle')}
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          {t('profileSubtitle')}
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Settings Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-2xs space-y-6">
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              {t('profileName')}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-700/30 focus:border-emerald-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              {t('profileEmail')}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type="text"
                disabled
                value={user?.email || 'farmer@agrivision.ai'}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-500 text-xs cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              {t('profileLanguage')}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPreferredLang('en')}
                className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  preferredLang === 'en'
                    ? 'bg-emerald-800 text-white border-emerald-900 shadow-2xs'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                }`}
              >
                English (ఆంగ్లం)
              </button>

              <button
                type="button"
                onClick={() => setPreferredLang('te')}
                className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  preferredLang === 'te'
                    ? 'bg-emerald-800 text-white border-emerald-900 shadow-2xs'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                }`}
              >
                తెలుగు (Telugu)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              {t('profileLocation')}
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={defaultLocation}
                onChange={(e) => setDefaultLocation(e.target.value)}
                placeholder="e.g., Guntur, Andhra Pradesh"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-700/30 focus:border-emerald-700"
              />
            </div>
            <p className="text-[11px] text-stone-400 mt-1">{t('profileLocationHint')}</p>
          </div>

          <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : t('profileSaveBtn')}</span>
            </button>

            <button
              type="button"
              onClick={() => signOut()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>{t('navSignOut')}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Database & Infrastructure Status */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-700">
          <Database className="w-4 h-4 text-emerald-700" />
          <span>{t('profileSupabaseStatus')}</span>
        </div>

        <p className="text-xs text-stone-600 leading-relaxed">
          {isSupabaseConfigured
            ? t('profileConnected')
            : t('profileDemoMode')}
        </p>

        <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-[11px] text-stone-500 font-mono">
          User ID: {user?.id || 'demo-farmer-id'}
        </div>
      </div>
    </div>
  );
};
