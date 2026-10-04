import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { TOOL_REGISTRY, CATEGORIES, getToolById, searchTools, POPULAR_TOOL_IDS } from '../../registry/toolRegistry';
import { ToolCategory, ToolDefinition } from '../../types';
import { ToolCard } from '../../components/cards/ToolCard';
import { Search, Shield, Zap, Lock, Trash2, ArrowRight, Sparkles } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { navigate, favorites, recents, clearRecents } = useApp();
  const { t, tTool, tCat } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const favoriteTools = favorites
    .map((id) => getToolById(id))
    .filter((t): t is NonNullable<typeof t> => !!t);

  const recentTools = recents
    .map((id) => getToolById(id))
    .filter((t): t is NonNullable<typeof t> => !!t);

  const quickTools = useMemo(() => {
    const selectedIds: string[] = [];

    // 1. Prioritize user's favorited tools
    for (const id of favorites) {
      if (!selectedIds.includes(id) && getToolById(id)) {
        selectedIds.push(id);
      }
      if (selectedIds.length >= 4) break;
    }

    // 2. Add recently used tools
    for (const id of recents) {
      if (!selectedIds.includes(id) && getToolById(id)) {
        selectedIds.push(id);
      }
      if (selectedIds.length >= 4) break;
    }

    // 3. Fallback to fixed set of popular tools if insufficient history
    for (const id of POPULAR_TOOL_IDS) {
      if (!selectedIds.includes(id) && getToolById(id)) {
        selectedIds.push(id);
      }
      if (selectedIds.length >= 4) break;
    }

    return selectedIds
      .map((id) => getToolById(id))
      .filter((t): t is ToolDefinition => !!t);
  }, [favorites, recents]);

  const filteredTools = searchTools(searchQuery, selectedCategory);

  const categoriesList: { id: ToolCategory | 'all'; name: string }[] = [
    { id: 'all', name: `${t('all')} (17)` },
    { id: 'image', name: `${tCat('image').name} (4)` },
    { id: 'pdf', name: `${tCat('pdf').name} (2)` },
    { id: 'text', name: `${tCat('text').name} (3)` },
    { id: 'qr', name: `${tCat('qr').name} (2)` },
    { id: 'calculators', name: `${tCat('calculators').name} (3)` },
    { id: 'converters', name: `${tCat('converters').name} (2)` },
    { id: 'security', name: `${tCat('security').name} (1)` },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 pb-28 md:pb-16 space-y-8 sm:space-y-12">
      {/* Hero / Intro */}
      <section className="p-6 sm:p-8 rounded-3xl bg-linear-to-b from-[#FAF8F3] to-[#F5F6F2] dark:from-[#131A14] dark:to-[#172019] border border-[#D9E1D8] dark:border-[#263529] shadow-2xs text-center sm:text-left space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-[#3D5240] bg-[#EBF0EA] border border-[#CCD8CB] dark:text-[#A8C8AB] dark:bg-[#1B261D] dark:border-[#2D3F30]">
          <Shield className="h-3.5 w-3.5 text-[#4D6D50] dark:text-[#97B89A]" />
          <span>{t('privacy_badge')}</span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          PHONE TOOLS
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl font-normal">
          {t('app_tagline')}
        </p>

        {/* Global Search Bar */}
        <div className="pt-2 max-w-xl">
          <div className="relative flex items-center">
            <Search className="absolute left-4 h-4.5 w-4.5 text-[#5A715C] dark:text-[#8EAA91]" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search_placeholder')}
              className="w-full h-12 pl-11 pr-4 rounded-xl bg-white dark:bg-[#131A14] border border-[#D9E1D8] dark:border-[#263529] text-sm text-slate-900 dark:text-white placeholder:text-slate-400 shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#526B54] dark:focus:ring-[#8EAA91] transition-all"
            />
          </div>
        </div>
      </section>

      {/* Quick Tools Section */}
      {!searchQuery && quickTools.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#526B54]/10 text-[#435B45] dark:bg-[#526B54]/25 dark:text-[#A8C8AB]">
                <Zap className="h-4 w-4" />
              </div>
              <h2 className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {t('quick_tools')}
              </h2>
            </div>
            <span className="text-xs text-slate-400 dark:text-slate-500 hidden sm:inline">
              {t('quick_tools_desc')}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {quickTools.map((tool) => (
              <ToolCard key={`quick-${tool.id}`} tool={tool} variant="compact" />
            ))}
          </div>
        </section>
      )}

      {/* Recently Used Tools */}
      {recentTools.length > 0 && !searchQuery && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {t('recently_used')}
            </h2>
            <button
              onClick={clearRecents}
              className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <Trash2 className="h-3 w-3" />
              <span>{t('clear')}</span>
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentTools.slice(0, 3).map((tool) => (
              <ToolCard key={`recent-${tool.id}`} tool={tool} />
            ))}
          </div>
        </section>
      )}

      {/* Favorite Tools */}
      {favoriteTools.length > 0 && !searchQuery && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {t('favorite_tools')}
            </h2>
            <button
              onClick={() => navigate('/favorites')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <span>{t('view_all')} ({favoriteTools.length})</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {favoriteTools.slice(0, 3).map((tool) => (
              <ToolCard key={`fav-${tool.id}`} tool={tool} />
            ))}
          </div>
        </section>
      )}

      {/* Category Filter Bar */}
      <section className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            {searchQuery ? `${t('search_results')} (${filteredTools.length})` : t('all_tools')}
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {filteredTools.length} {t('of_tools')}
          </span>
        </div>

        {/* Scrollable Categories on Mobile */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categoriesList.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  isSelected
                    ? 'bg-[#3D5240] text-[#FBF9F5] dark:bg-[#97B89A] dark:text-[#111A13] shadow-2xs'
                    : 'bg-[#F2F5F0] dark:bg-[#1B261D]/80 text-[#475E4A] dark:text-[#BACDBB] hover:bg-[#E5ECE3] dark:hover:bg-[#253629]'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Tools Grid */}
        {filteredTools.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filteredTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center rounded-2xl bg-[#FAF9F5] dark:bg-[#141C16] border border-[#D9E1D8] dark:border-[#263529] p-8 shadow-2xs">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {t('no_tools_found')}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {t('adjust_query')}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-4 px-4 py-2 text-xs font-semibold bg-[#3D5240] text-[#FBF9F5] dark:bg-[#97B89A] dark:text-[#111A13] rounded-xl hover:opacity-90 transition-opacity"
            >
              {t('reset_filters')}
            </button>
          </div>
        )}
      </section>

      {/* Privacy & Architecture Guarantee Note */}
      <section className="p-5 sm:p-6 rounded-2xl bg-[#F4F6F1] dark:bg-[#151E17]/70 border border-[#DCE4DA] dark:border-[#243327] shadow-2xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[#526B54]/10 text-[#3D5240] dark:text-[#A8C8AB] dark:bg-[#526B54]/25 shrink-0">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white">{t('zero_server_uploads')}</h4>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                {t('zero_server_uploads_desc')}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[#526B54]/10 text-[#3D5240] dark:text-[#A8C8AB] dark:bg-[#526B54]/25 shrink-0">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white">{t('instant_offline')}</h4>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                {t('instant_offline_desc')}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[#526B54]/10 text-[#3D5240] dark:text-[#A8C8AB] dark:bg-[#526B54]/25 shrink-0">
              <Lock className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white">{t('no_signups')}</h4>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                {t('no_signups_desc')}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
