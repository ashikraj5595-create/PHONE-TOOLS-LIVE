import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { ThemeMode, Language } from '../../types';
import { LANGUAGE_OPTIONS } from '../../locales';
import { Sun, Moon, Laptop, ShieldCheck, Trash2, CheckCircle2, Cpu, Globe } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { clearRecents, clearAllData, showToast } = useApp();

  const [confirmReset, setConfirmReset] = React.useState(false);

  const themeOptions: { id: ThemeMode; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'light', label: t('theme_light'), icon: Sun },
    { id: 'dark', label: t('theme_dark'), icon: Moon },
    { id: 'system', label: t('theme_system'), icon: Laptop },
  ];

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    showToast(t('toast_lang_updated'), 'info');
  };

  const handleClearHistory = () => {
    clearRecents();
    showToast(t('toast_recent_cleared'), 'info');
  };

  const handleResetAll = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 4000);
      return;
    }
    clearAllData();
    setConfirmReset(false);
    showToast(t('toast_all_cleared'), 'info');
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-28 md:pb-16 space-y-6 sm:space-y-8">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          {t('settings_title')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t('settings_subtitle')}
        </p>
      </div>

      {/* Language Selector */}
      <section className="p-5 rounded-2xl bg-purple-950/[0.04] dark:bg-purple-950/25 border border-purple-200/70 dark:border-purple-900/50 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-950 dark:bg-purple-900 text-lime-400 dark:text-lime-300 ring-1 ring-lime-400/30 dark:ring-lime-400/40 shadow-xs">
            <Globe className="h-4 w-4" />
          </div>
          <div>
            <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
              {t('language')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t('language_desc')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {LANGUAGE_OPTIONS.map((opt) => {
            const isSelected = language === opt.id;

            return (
              <button
                key={opt.id}
                onClick={() => handleLanguageChange(opt.id)}
                className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl border text-xs sm:text-sm font-semibold transition-all ${
                  isSelected
                    ? 'border-purple-800 dark:border-purple-600 bg-purple-950 dark:bg-purple-900 text-white ring-1 ring-lime-400/50 dark:ring-lime-400/60 shadow-xs'
                    : 'border-purple-200/60 dark:border-purple-900/50 bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:border-purple-300 dark:hover:border-purple-700'
                }`}
              >
                <span className="text-sm sm:text-base font-bold mb-0.5">{opt.nativeName}</span>
                <span className={`text-[10px] sm:text-xs font-normal ${isSelected ? 'text-lime-300 dark:text-lime-400' : 'opacity-75'}`}>
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Theme Settings */}
      <section className="p-5 rounded-2xl bg-purple-950/[0.04] dark:bg-purple-950/25 border border-purple-200/70 dark:border-purple-900/50 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-950 dark:bg-purple-900 text-lime-400 dark:text-lime-300 ring-1 ring-lime-400/30 dark:ring-lime-400/40 shadow-xs">
            <Laptop className="h-4 w-4" />
          </div>
          <div>
            <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
              {t('appearance')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t('appearance_desc')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {themeOptions.map((opt) => {
            const isSelected = theme === opt.id;
            const Icon = opt.icon;

            return (
              <button
                key={opt.id}
                onClick={() => setTheme(opt.id)}
                className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl border text-xs sm:text-sm font-semibold transition-all ${
                  isSelected
                    ? 'border-purple-800 dark:border-purple-600 bg-purple-950 dark:bg-purple-900 text-white ring-1 ring-lime-400/50 dark:ring-lime-400/60 shadow-xs'
                    : 'border-purple-200/60 dark:border-purple-900/50 bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:border-purple-300 dark:hover:border-purple-700'
                }`}
              >
                <Icon className={`h-5 w-5 mb-1.5 ${isSelected ? 'text-lime-300 dark:text-lime-400' : 'text-slate-500 dark:text-slate-400'}`} />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Privacy Architecture Notice */}
      <section className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-purple-950/10 dark:bg-purple-900/40 text-purple-900 dark:text-purple-300 ring-1 ring-lime-500/30 dark:ring-lime-400/40 shrink-0">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
              {t('local_arch_title')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {t('local_arch_desc')}
            </p>
          </div>
        </div>

        <div className="space-y-2.5 pt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-lime-600 dark:text-lime-400 shrink-0" />
            <span>{t('privacy_point_1')}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-lime-600 dark:text-lime-400 shrink-0" />
            <span>{t('privacy_point_2')}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-lime-600 dark:text-lime-400 shrink-0" />
            <span>{t('privacy_point_3')}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-lime-600 dark:text-lime-400 shrink-0" />
            <span>{t('privacy_point_4')}</span>
          </div>
        </div>
      </section>

      {/* Local Storage & Data Management */}
      <section className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
        <div>
          <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
            {t('data_mgmt_title')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t('data_mgmt_desc')}
          </p>
        </div>

        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800">
            <div>
              <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                {t('clear_history_title')}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {t('clear_history_desc')}
              </p>
            </div>
            <button
              onClick={handleClearHistory}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {t('clear_history_btn')}
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-900/40">
            <div>
              <p className="text-xs sm:text-sm font-semibold text-rose-800 dark:text-rose-300">
                {t('reset_all_title')}
              </p>
              <p className="text-[11px] text-rose-600/80 dark:text-rose-400/80">
                {t('reset_all_desc')}
              </p>
            </div>
            <button
              onClick={handleResetAll}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                confirmReset
                  ? 'text-white bg-rose-600 hover:bg-rose-700 shadow-xs'
                  : 'text-rose-700 dark:text-rose-300 bg-rose-100/80 dark:bg-rose-900/50 hover:bg-rose-200 dark:hover:bg-rose-900'
              }`}
            >
              <Trash2 className="h-3 w-3" />
              <span>{confirmReset ? 'Tap again to confirm' : t('reset_all_btn')}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Browser Environment Capability Detection */}
      <section className="p-4 rounded-xl bg-slate-100/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Cpu className="h-4 w-4 text-slate-400" />
          <span>{t('web_engine_capabilities')}</span>
        </div>
        <div className="flex items-center gap-3">
          <span>{t('web_crypto')} {typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function' ? t('active') : t('fallback')}</span>
          <span>·</span>
          <span>{t('web_share')} {typeof navigator !== 'undefined' && !!navigator.share ? t('supported') : t('download_fallback')}</span>
        </div>
      </section>
    </div>
  );
};
