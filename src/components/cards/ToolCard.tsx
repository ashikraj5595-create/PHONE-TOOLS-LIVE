import React from 'react';
import { ToolDefinition } from '../../types';
import { CATEGORIES } from '../../registry/toolRegistry';
import { ToolIcon } from '../common/ToolIcon';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { Heart, ChevronRight } from 'lucide-react';

interface ToolCardProps {
  tool: ToolDefinition;
  variant?: 'standard' | 'compact';
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool, variant = 'standard' }) => {
  const { navigate, isFavorite, toggleFavorite, showToast } = useApp();
  const { t, tTool, tCat } = useLanguage();
  const cat = CATEGORIES[tool.category];
  const favorited = isFavorite(tool.id);

  const toolTrans = tTool(tool);
  const catName = tCat(tool.category).name;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const willFavorite = !favorited;
    toggleFavorite(tool.id);
    showToast(
      willFavorite ? t('toast_added_favorite') : t('toast_removed_favorite'),
      willFavorite ? 'success' : 'info'
    );
  };

  if (variant === 'compact') {
    return (
      <div
        onClick={() => navigate(tool.route)}
        className={`tool-surface-card group relative flex items-center justify-between p-3 sm:p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs cursor-pointer text-left active:scale-[0.985] duration-200 ${cat.cardBg}`}
      >
        <div className="flex items-center gap-3 min-w-0 pr-2">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${cat.iconBg} motion-safe:transition-transform group-hover:scale-105 duration-200 shadow-2xs`}
          >
            <ToolIcon name={tool.icon} className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500 block truncate">
              {catName}
            </span>
            <h3 className="font-display text-sm font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 truncate">
              {toolTrans.name}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handleFavoriteClick}
            aria-label={favorited ? `${t('remove_from_favorites')}: ${toolTrans.name}` : `${t('add_to_favorites')}: ${toolTrans.name}`}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50/50 dark:hover:bg-rose-950/30 transition-colors duration-200 active:scale-90"
          >
            <Heart
              className={`h-4 w-4 motion-safe:transition-transform active:scale-125 duration-200 ${
                favorited
                  ? 'fill-rose-500 text-rose-500 dark:fill-rose-400 dark:text-rose-400'
                  : ''
              }`}
            />
          </button>
          <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all duration-200" />
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => navigate(tool.route)}
      className={`tool-surface-card group relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs cursor-pointer text-left active:scale-[0.985] duration-200 ${cat.cardBg}`}
    >
      <div>
        {/* Top row: Icon + Category + Favorite button */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${cat.iconBg} motion-safe:transition-transform group-hover:scale-105 duration-200 shadow-2xs ring-1 ring-slate-900/5 dark:ring-white/5`}
            >
              <ToolIcon name={tool.icon} className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {catName}
              </span>
            </div>
          </div>

          <button
            onClick={handleFavoriteClick}
            aria-label={favorited ? `${t('remove_from_favorites')}: ${toolTrans.name}` : `${t('add_to_favorites')}: ${toolTrans.name}`}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50/50 dark:hover:bg-rose-950/30 transition-colors duration-200 active:scale-90"
          >
            <Heart
              className={`h-4.5 w-4.5 motion-safe:transition-transform active:scale-125 duration-200 ${
                favorited
                  ? 'fill-rose-500 text-rose-500 dark:fill-rose-400 dark:text-rose-400'
                  : ''
              }`}
            />
          </button>
        </div>

        {/* Name and Description */}
        <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
          {toolTrans.name}
        </h3>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {toolTrans.description}
        </p>
      </div>

      {/* Card Footer: Quiet launch affordance */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-medium text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
        <span>{t('open_tool')}</span>
        <ChevronRight className="h-4 w-4 motion-safe:transition-transform group-hover:translate-x-1 duration-200" />
      </div>
    </div>
  );
};

