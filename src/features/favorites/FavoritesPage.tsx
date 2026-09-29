import React from 'react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { getToolById, POPULAR_TOOL_IDS } from '../../registry/toolRegistry';
import { ToolCard } from '../../components/cards/ToolCard';
import { Heart, ArrowRight, Sparkles } from 'lucide-react';

export const FavoritesPage: React.FC = () => {
  const { favorites, navigate } = useApp();
  const { t } = useLanguage();

  const favoriteTools = favorites
    .map((id) => getToolById(id))
    .filter((t): t is NonNullable<typeof t> => !!t);

  const suggestedTools = POPULAR_TOOL_IDS
    .map((id) => getToolById(id))
    .filter((t): t is NonNullable<typeof t> => !!t);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-28 md:pb-16 space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          {t('favorites_title')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t('favorites_subtitle')}
        </p>
      </div>

      {favoriteTools.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              {favoriteTools.length} {favoriteTools.length === 1 ? t('favorite_count_single') : t('favorite_count_multi')}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {favoriteTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="py-16 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 space-y-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 mx-auto">
              <Heart className="h-7 w-7" />
            </div>
            <div className="max-w-sm mx-auto">
              <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                {t('no_favorites_title')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                {t('no_favorites_desc')}
              </p>
            </div>
            <button
              onClick={() => navigate('/tools')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs sm:text-sm font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-xs"
            >
              <span>{t('browse_all_tools')}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Useful Suggestions in Empty State */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-display text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  {t('suggested_tools')}
                </h3>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {suggestedTools.map((tool) => (
                <ToolCard key={`suggested-${tool.id}`} tool={tool} variant="compact" />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
