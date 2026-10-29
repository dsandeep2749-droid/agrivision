import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Sprout, 
  LayoutDashboard, 
  ScanLine, 
  Bot, 
  CloudSun, 
  History, 
  User, 
  Menu, 
  X, 
  Languages, 
  LogOut,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const { language, toggleLanguage, t } = useLanguage();
  const { user, signOut, isDemoMode } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: '/', label: t('navHome'), icon: Sprout },
    ...(user
      ? [
          { to: '/dashboard', label: t('navDashboard'), icon: LayoutDashboard },
          { to: '/analyze', label: t('navAnalyze'), icon: ScanLine },
          { to: '/assistant', label: t('navAssistant'), icon: Bot },
          { to: '/weather', label: t('navWeather'), icon: CloudSun },
          { to: '/history', label: t('navHistory'), icon: History },
        ]
      : [
          { to: '/analyze', label: t('navAnalyze'), icon: ScanLine },
          { to: '/assistant', label: t('navAssistant'), icon: Bot },
          { to: '/weather', label: t('navWeather'), icon: CloudSun },
        ]),
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-800 to-green-600 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
              <Sprout className="w-6 h-6 text-emerald-100" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-tight text-emerald-950 font-sans">AgriVision</span>
                <span className="text-xs px-1.5 py-0.5 rounded font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">AI</span>
              </div>
              <p className="text-[10px] text-stone-500 font-medium hidden sm:block">Smart Crop Health & Insights</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200/60 font-semibold'
                      : 'text-stone-600 hover:text-emerald-900 hover:bg-stone-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-emerald-700' : 'text-stone-400'}`} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Bar */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Language Switcher Pill */}
            <button
              onClick={toggleLanguage}
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 transition-all cursor-pointer shadow-2xs"
              title="Switch language between English and Telugu"
            >
              <Languages className="w-3.5 h-3.5 text-emerald-700" />
              <span>{language === 'en' ? 'తెలుగు' : 'English'}</span>
            </button>

            {/* User State */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-stone-200">
                <Link
                  to="/profile"
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/profile') ? 'bg-emerald-50 text-emerald-900 font-semibold' : 'text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <div className="w-7 h-7 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 text-xs font-bold">
                    {user.displayName.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[110px] truncate text-xs">{user.displayName}</span>
                  {isDemoMode && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-normal">Demo</span>
                  )}
                </Link>

                <button
                  onClick={() => signOut()}
                  className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  title={t('navSignOut')}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/auth"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-stone-700 hover:bg-stone-100 transition-colors"
                >
                  {t('navSignIn')}
                </Link>
                <Link
                  to="/auth?tab=signup"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-800 hover:bg-emerald-900 text-white shadow-xs transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                  {t('ctaStartFarming')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleLanguage}
              type="button"
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-800 border border-stone-200"
            >
              <span>{language === 'en' ? 'తె' : 'EN'}</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-6 space-y-2 shadow-lg animate-in slide-in-from-top-2">
          {user && (
            <div className="flex items-center gap-3 p-2 mb-3 bg-emerald-50 rounded-xl border border-emerald-100">
              <div className="w-9 h-9 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-900 font-bold text-sm">
                {user.displayName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-emerald-950 truncate">{user.displayName}</p>
                <p className="text-xs text-emerald-700 truncate">{user.email}</p>
              </div>
              {isDemoMode && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-medium">Demo</span>
              )}
            </div>
          )}

          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  active
                    ? 'bg-emerald-800 text-white font-semibold'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-stone-400'}`} />
                {link.label}
              </Link>
            );
          })}

          {user && (
            <Link
              to="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                isActive('/profile') ? 'bg-emerald-800 text-white' : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <User className="w-5 h-5 text-stone-400" />
              {t('navProfile')}
            </Link>
          )}

          <div className="pt-3 border-t border-stone-100 flex flex-col gap-2">
            {user ? (
              <button
                onClick={() => {
                  signOut();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 w-full px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
              >
                <LogOut className="w-5 h-5" />
                {t('navSignOut')}
              </button>
            ) : (
              <Link
                to="/auth"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center w-full py-2.5 bg-emerald-800 text-white text-sm font-semibold rounded-lg shadow-sm"
              >
                {t('navSignIn')}
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

