import React, { useState } from 'react';
import { TOOL_REGISTRY, CATEGORIES, searchTools } from '../../registry/toolRegistry';
import { ToolCategory } from '../../types';
import { ToolCard } from '../../components/cards/ToolCard';
import { useLanguage } from '../../context/LanguageContext';
import { Search, X } from 'lucide-react';

export const ToolsPage: React.FC = () => {
  const { t, tCat } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<ToolCategory | 'all'>('all');

  const categories: ToolCategory[] = [
    'image',
    'pdf',
    'text',
    'qr',
    'calculators',
    'converters',
    'security',
  ];

  const filteredTools = searchTools(searchQuery, activeCategory);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-28 md:pb-16 space-y-6 animate-page-enter">
      {/* Title & Filter Bar with subtle Blue + White depth */}
      <div className="p-5 sm:p-6 rounded-2xl bg-linear-to-b from-blue-50/70 via-white to-blue-50/20 dark:from-blue-950/30 dark:via-slate-900 dark:to-blue-950/10 border border-blue-200/80 dark:border-blue-900/50 shadow-[0_4px_24px_-8px_rgba(59,130,246,0.12)] space-y-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('all_tools_title')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('all_tools_subtitle')}
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-blue-500/80 dark:text-blue-400/80" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('filter_placeholder')}
            className="w-full h-11 pl-10 pr-9 rounded-xl bg-white dark:bg-slate-900 border border-blue-200/80 dark:border-blue-900/50 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400 shadow-2xs transition-all duration-200"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 duration-200"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 active:scale-95 ${
            activeCategory === 'all'
              ? 'bg-blue-600 text-white dark:bg-blue-500 dark:text-slate-950 shadow-xs shadow-blue-500/25 ring-1 ring-blue-500/30'
              : 'bg-blue-50/70 dark:bg-blue-950/40 text-blue-950/80 dark:text-blue-200 border border-blue-200/50 dark:border-blue-900/40 hover:bg-blue-100/70 dark:hover:bg-blue-900/60'
          }`}
        >
          {t('all')} (17)
        </button>
        {categories.map((catKey) => {
          const count = TOOL_REGISTRY.filter((t) => t.category === catKey).length;
          const isSelected = activeCategory === catKey;
          const catName = tCat(catKey).name;

          return (
            <button
              key={catKey}
              onClick={() => setActiveCategory(catKey)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 active:scale-95 ${
                isSelected
                  ? 'bg-blue-600 text-white dark:bg-blue-500 dark:text-slate-950 shadow-xs shadow-blue-500/25 ring-1 ring-blue-500/30'
                  : 'bg-blue-50/70 dark:bg-blue-950/40 text-blue-950/80 dark:text-blue-200 border border-blue-200/50 dark:border-blue-900/40 hover:bg-blue-100/70 dark:hover:bg-blue-900/60'
              }`}
            >
              {catName} ({count})
            </button>
          );
        })}
      </div>

      {/* If filtering by a single category or searching, show flat grid. Otherwise group by category. */}
      {activeCategory !== 'all' || searchQuery ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {filteredTools.length} {filteredTools.length === 1 ? t('tool_found') : t('tools_found')}
            </span>
          </div>

          {filteredTools.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {filteredTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center rounded-2xl bg-white dark:bg-slate-900 border border-blue-200/70 dark:border-blue-900/50">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {t('no_tools_match')} &ldquo;{searchQuery}&rdquo;
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                }}
                className="mt-3 px-4 py-1.5 text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:text-slate-950 rounded-lg shadow-xs"
              >
                {t('reset_filters')}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {categories.map((catKey) => {
            const catTrans = tCat(catKey);
            const toolsInCat = TOOL_REGISTRY.filter((t) => t.category === catKey);

            return (
              <section key={catKey} className="space-y-3">
                <div className="flex items-baseline justify-between border-b border-blue-200/60 dark:border-blue-900/40 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="h-4 w-1 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0" aria-hidden="true" />
                    <h2 className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      {catTrans.name}
                    </h2>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-900/50">
                      ({toolsInCat.length})
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
                    {catTrans.description}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {toolsInCat.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};
