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
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-28 md:pb-16 space-y-6">
      {/* Title & Filter Bar */}
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          {t('all_tools_title')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t('all_tools_subtitle')}
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('filter_placeholder')}
          className="w-full h-11 pl-10 pr-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
            activeCategory === 'all'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
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
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                isSelected
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
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
            <div className="py-16 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {t('no_tools_match')} &ldquo;{searchQuery}&rdquo;
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                }}
                className="mt-3 px-4 py-1.5 text-xs font-medium bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-lg"
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
                <div className="flex items-baseline justify-between border-b border-slate-200/80 dark:border-slate-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      {catTrans.name}
                    </h2>
                    <span className="text-xs text-slate-400">({toolsInCat.length})</span>
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
