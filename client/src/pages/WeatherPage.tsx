import React, { useState, useEffect } from 'react';
import { 
  CloudSun, 
  Search, 
  MapPin, 
  Navigation, 
  RotateCcw, 
  AlertCircle, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api, WeatherData, GeoLocation } from '../services/api';
import { WeatherCard } from '../components/weather/WeatherCard';
import { ForecastChart } from '../components/weather/ForecastChart';
import { AgroInsightsCard } from '../components/weather/AgroInsightsCard';

const POPULAR_AGRI_HUBS = [
  { name: 'Guntur', state: 'Andhra Pradesh', lat: 16.3067, lon: 80.4365 },
  { name: 'Warangal', state: 'Telangana', lat: 17.9689, lon: 79.5941 },
  { name: 'Vijayawada', state: 'Andhra Pradesh', lat: 16.5062, lon: 80.6480 },
  { name: 'Kurnool', state: 'Andhra Pradesh', lat: 15.8281, lon: 78.0373 },
  { name: 'Nizamabad', state: 'Telangana', lat: 18.6725, lon: 78.0941 },
  { name: 'Bengaluru Rural', state: 'Karnataka', lat: 13.0634, lon: 77.5878 },
  { name: 'Nashik', state: 'Maharashtra', lat: 19.9975, lon: 73.7898 },
];

export const WeatherPage: React.FC = () => {
  const { t, language } = useLanguage();

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<GeoLocation[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Active location coordinates
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lon: number; name: string; state?: string }>({
    lat: 16.3067,
    lon: 80.4365,
    name: 'Guntur',
    state: 'Andhra Pradesh',
  });

  const fetchWeatherData = async (lat: number, lon: number, name: string, state?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getWeather(lat, lon, name, state);
      setWeather(data);
      setCurrentCoords({ lat, lon, name, state });
    } catch (err: any) {
      console.error('Weather load error:', err);
      setError(t('weatherError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData(currentCoords.lat, currentCoords.lon, currentCoords.name, currentCoords.state);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || searchQuery.trim().length < 2) return;

    setIsSearching(true);
    setError(null);
    try {
      const results = await api.searchLocation(searchQuery);
      setSearchResults(results);
      if (results.length === 0) {
        setError(`No locations found matching "${searchQuery}". Please try another town or district.`);
      }
    } catch (err: any) {
      setError('Search failed: ' + err.message);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectLocation = (loc: GeoLocation) => {
    setSearchResults([]);
    setSearchQuery('');
    fetchWeatherData(loc.latitude, loc.longitude, loc.name, loc.admin1);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        fetchWeatherData(pos.coords.latitude, pos.coords.longitude, 'Detected Farm Location', 'GPS Coordinates');
      },
      (err) => {
        setLoading(false);
        setError(`Could not access GPS location: ${err.message}. Please select a location manually.`);
      }
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-sans tracking-tight">
          {t('weatherTitle')}
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-2xl">
          {t('weatherSubtitle')}
        </p>
      </div>

      {/* Location Search Bar & Quick Hubs */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <form onSubmit={handleSearch} className="flex-1 w-full relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('weatherSearchPlaceholder')}
              className="w-full pl-10 pr-24 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-700/30 focus:border-emerald-700"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="absolute right-1.5 top-1.5 px-4 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              {isSearching ? '...' : t('weatherSearchBtn')}
            </button>
          </form>

          <button
            type="button"
            onClick={handleUseCurrentLocation}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 transition-colors cursor-pointer shrink-0"
          >
            <Navigation className="w-3.5 h-3.5 text-emerald-700" />
            <span>GPS Auto-Detect</span>
          </button>
        </div>

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="p-2 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
            <span className="text-[10px] uppercase font-bold text-stone-500 px-2 block">Matching Locations:</span>
            {searchResults.map((loc, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectLocation(loc)}
                className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-emerald-100/60 text-stone-800 flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                  <span className="font-semibold">{loc.name}</span>
                  {loc.admin1 && <span className="text-stone-500">({loc.admin1})</span>}
                </div>
                <span className="text-[11px] text-stone-400 font-mono">
                  {loc.latitude.toFixed(2)}°, {loc.longitude.toFixed(2)}°
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Agricultural Hub Pills */}
        <div className="pt-2 border-t border-stone-100">
          <span className="text-[11px] font-semibold text-stone-500 mr-2">Quick Agri Districts:</span>
          <div className="inline-flex flex-wrap gap-1.5 mt-1 sm:mt-0">
            {POPULAR_AGRI_HUBS.map((hub) => {
              const isSelected = currentCoords.name.toLowerCase() === hub.name.toLowerCase();
              return (
                <button
                  key={hub.name}
                  onClick={() => fetchWeatherData(hub.lat, hub.lon, hub.name, hub.state)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-800 text-white shadow-2xs font-bold'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                  }`}
                >
                  {hub.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchWeatherData(currentCoords.lat, currentCoords.lon, currentCoords.name, currentCoords.state)}
            className="px-3 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-800 font-bold text-xs"
          >
            {t('commonRetry')}
          </button>
        </div>
      )}

      {/* Weather Content */}
      {loading ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-stone-200 text-xs text-stone-400">
          Loading live weather data from Open-Meteo...
        </div>
      ) : weather ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Current Weather Card */}
            <div className="space-y-4">
              <WeatherCard weather={weather} />
            </div>

            {/* Agro Insights Card */}
            <div className="lg:col-span-2">
              <AgroInsightsCard insights={weather.agroInsights} />
            </div>
          </div>

          {/* 7-Day Forecast Chart */}
          <ForecastChart daily={weather.daily} />

          {/* Attribution Notice */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-500 flex items-center justify-between">
            <span>{weather.providerAttribution}</span>
            <span className="font-mono text-[11px] text-stone-400">
              Updated: {new Date(weather.fetchedAt).toLocaleTimeString()}
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
};

