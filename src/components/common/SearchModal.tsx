import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { searchTools, CATEGORIES, POPULAR_TOOL_IDS, getToolById } from '../../registry/toolRegistry';
import { ToolIcon } from './ToolIcon';
import { Search, X, ArrowRight, CornerDownLeft, Sparkles, Heart, Clock } from 'lucide-react';

interface SearchModalProps {
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { navigate, favorites, recents } = useApp();
  const { t, tTool, tCat } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const results = searchTools(query);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    inputRef.current?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (results.length > 0 ? (prev + 1) % results.length : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (results.length > 0 ? (prev - 1 + results.length) % results.length : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (results.length > 0 && results[selectedIndex]) {
          navigate(results[selectedIndex].route);
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, results, selectedIndex, navigate]);

  const handleSelect = (route: string) => {
    navigate(route);
    onClose();
  };

  const popularTools = POPULAR_TOOL_IDS.map((id) => getToolById(id)).filter(
    (tool): tool is NonNullable<typeof tool> => !!tool
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('search_tools_btn')}
      className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 bg-slate-950/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden mt-6 sm:mt-16 flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 dark:border-slate-800">
          <Search className="h-5 w-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('search_modal_placeholder')}
            className="w-full bg-transparent text-sm sm:text-base text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              aria-label={t('clear_search')}
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-1 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            {t('esc')}
          </button>
        </div>

        {/* Results List */}
        <div ref={listRef} className="overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-slate-800/60">
          {results.length > 0 ? (
            results.map((tool, idx) => {
              const cat = CATEGORIES[tool.category];
              const trans = tTool(tool);
              const catName = tCat(tool.category).name;
              const isSelected = idx === selectedIndex;
              const isFav = favorites.includes(tool.id);
              const isRecent = recents.includes(tool.id);

              return (
                <button
                  key={tool.id}
                  onClick={() => handleSelect(tool.route)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors text-left group ${
                    isSelected
                      ? 'bg-slate-100/90 dark:bg-slate-800'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${cat.iconBg}`}
                    >
                      <ToolIcon name={tool.icon} className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {trans.name}
                        </span>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500">
                          {catName}
                        </span>
                        {isFav && (
                          <Heart className="h-3 w-3 text-rose-500 fill-rose-500 shrink-0" />
                        )}
                        {isRecent && !isFav && (
                          <Clock className="h-3 w-3 text-slate-400 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {trans.description}
                      </p>
                    </div>
                  </div>
                  <ArrowRight
                    className={`h-4 w-4 shrink-0 transition-all ${
                      isSelected
                        ? 'text-slate-900 dark:text-white translate-x-0.5'
                        : 'text-slate-300 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                    }`}
                  />
                </button>
              );
            })
          ) : (
            <div className="py-8 px-4 text-center space-y-4">
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {t('no_tools_match')} &ldquo;{query}&rdquo;
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  {t('adjust_query')}
                </p>
                <button
                  onClick={() => setQuery('')}
                  className="mt-3 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  {t('clear_search')}
                </button>
              </div>

              {/* Useful fallback suggestions */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-left">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2">
                  {t('suggested_tools')}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {popularTools.map((tool) => {
                    const cat = CATEGORIES[tool.category];
                    const trans = tTool(tool);
                    return (
                      <button
                        key={tool.id}
                        onClick={() => handleSelect(tool.route)}
                        className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors"
                      >
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${cat.iconBg}`}>
                          <ToolIcon name={tool.icon} className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                            {trans.name}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {CATEGORIES[tool.category].name}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2 bg-slate-50/70 dark:bg-slate-900/70 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>{results.length} {t('tools_available')}</span>
          <span className="flex items-center gap-2">
            <span className="hidden sm:inline">Use ↑↓ to navigate</span>
            <span className="flex items-center gap-1">
              {t('tap_to_open')} <CornerDownLeft className="h-3 w-3 inline" />
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};
