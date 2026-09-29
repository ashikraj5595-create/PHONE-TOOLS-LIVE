import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { CATEGORIES, getToolById } from '../../registry/toolRegistry';
import { ToolIcon } from '../common/ToolIcon';
import { ArrowLeft, Heart, ShieldCheck, RotateCcw } from 'lucide-react';

interface ToolContainerProps {
  toolId: string;
  onReset?: () => void;
  canReset?: boolean;
  children: React.ReactNode;
}

export const ToolContainer: React.FC<ToolContainerProps> = ({
  toolId,
  onReset,
  canReset = false,
  children,
}) => {
  const { navigate, isFavorite, toggleFavorite, recordRecent, showToast } = useApp();
  const { t, tTool, tCat } = useLanguage();
  const tool = getToolById(toolId);

  useEffect(() => {
    if (toolId) {
      recordRecent(toolId);
    }
  }, [toolId, recordRecent]);

  if (!tool) {
    return (
      <div className="py-20 text-center">
        <p className="text-base text-slate-600 dark:text-slate-400">{t('tool_not_found')}</p>
        <button
          onClick={() => navigate('/tools')}
          className="mt-4 px-4 py-2 text-sm font-medium bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl active:scale-95 transition-transform"
        >
          {t('view_all_tools')}
        </button>
      </div>
    );
  }

  const cat = CATEGORIES[tool.category];
  const favorited = isFavorite(tool.id);
  const toolTrans = tTool(tool);
  const catName = tCat(tool.category).name;

  const handleFavoriteClick = () => {
    const willFavorite = !favorited;
    toggleFavorite(tool.id);
    showToast(
      willFavorite ? t('toast_added_favorite') : t('toast_removed_favorite'),
      willFavorite ? 'success' : 'info'
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8 pb-24 md:pb-12">
      {/* Top Breadcrumb & Controls */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <button
          onClick={() => navigate('/tools')}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t('back_to_tools')}</span>
        </button>

        <div className="flex items-center gap-2">
          {canReset && onReset && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors active:scale-95"
              title={t('reset_tool')}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>{t('reset')}</span>
            </button>
          )}
          <button
            onClick={handleFavoriteClick}
            aria-label={favorited ? `${t('remove_from_favorites')}: ${toolTrans.name}` : `${t('add_to_favorites')}: ${toolTrans.name}`}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50/50 dark:hover:bg-rose-950/30 transition-colors active:scale-90"
          >
            <Heart
              className={`h-4.5 w-4.5 motion-safe:transition-transform active:scale-125 ${
                favorited
                  ? 'fill-rose-500 text-rose-500 dark:fill-rose-400 dark:text-rose-400'
                  : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Header Info */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-start gap-3.5">
          <div
            className={`flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl ${cat.iconBg} shadow-xs`}
          >
            <ToolIcon name={tool.icon} className="h-6 w-6 sm:h-7 sm:w-7" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {catName}
              </span>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-3 w-3" />
                {t('local_and_private')}
              </span>
            </div>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
              {toolTrans.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              {toolTrans.description}
            </p>
          </div>
        </div>
      </div>

      {/* Main Tool Content */}
      <div className="w-full">{children}</div>
    </div>
  );
};

