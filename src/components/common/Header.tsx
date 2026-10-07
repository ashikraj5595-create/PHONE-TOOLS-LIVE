import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Search, Sun, Moon, Laptop, FolderOpen } from 'lucide-react';
import { SearchModal } from './SearchModal';
import { WorkspaceDrawer } from '../workspace/WorkspaceDrawer';
import { AppLogo } from './AppLogo';

export const Header: React.FC = () => {
  const { currentPath, navigate } = useApp();
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();
  const { itemCount } = useWorkspace();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);

  useEffect(() => {
    if (currentPath === '/workspace') {
      setIsWorkspaceOpen(true);
    }
  }, [currentPath]);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.tagName === 'SELECT' ||
          (activeEl as HTMLElement).isContentEditable);

      if ((e.key === '/' && !isInput) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  const navLinks = [
    { label: t('nav_home'), path: '/' },
    { label: t('nav_all_tools'), path: '/tools' },
    { label: t('nav_favorites'), path: '/favorites' },
    { label: t('nav_settings'), path: '/settings' },
  ];

  return (
    <>
      <header className="sticky top-0 z-30 w-full border-b border-slate-200/80 bg-white/85 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/85 transition-colors">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          {/* Zone 1: Brand wordmark */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 text-left focus:outline-none group active:scale-95 transition-transform"
            aria-label={t('home_label')}
          >
            <AppLogo className="h-8 w-8 rounded-lg shadow-sm transition-transform group-hover:scale-105" />
            <span className="font-display text-base font-bold tracking-tight text-slate-900 dark:text-white sm:text-lg">
              PHONE TOOLS
            </span>
          </button>

          {/* Zone 2: Navigation Links (Desktop/Tablet) */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            {navLinks.map((item) => {
              const isActive =
                item.path === '/'
                  ? currentPath === '/'
                  : currentPath.startsWith(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`transition-colors hover:text-slate-900 dark:hover:text-white active:scale-95 ${
                    isActive
                      ? 'text-slate-900 dark:text-white font-semibold underline underline-offset-8 decoration-2 decoration-slate-900 dark:decoration-white'
                      : ''
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Search & Theme Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 h-9 px-3 rounded-lg text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 transition-all active:scale-95 text-xs font-medium"
              aria-label={t('search_tools_btn')}
            >
              <Search className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t('search_tools_btn')}</span>
              <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700">
                /
              </kbd>
            </button>

            {/* Workspace & Workflow Entry Point */}
            <button
              onClick={() => setIsWorkspaceOpen(true)}
              className="relative flex items-center gap-1.5 h-9 px-2.5 sm:px-3 rounded-lg text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 transition-all active:scale-95 text-xs font-medium"
              aria-label={`Workspace (${itemCount} items)`}
              title="Session Workspace & Universal Workflow"
            >
              <FolderOpen className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Workspace</span>
              {itemCount > 0 && (
                <span className="flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-slate-900 dark:bg-white text-[10px] font-bold text-white dark:text-slate-900">
                  {itemCount}
                </span>
              )}
            </button>

            <button
              onClick={cycleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-90"
              title={`${t('theme_title')}: ${theme}`}
              aria-label={t('toggle_theme')}
            >
              {theme === 'light' ? (
                <Sun className="h-4 w-4" />
              ) : theme === 'dark' ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Laptop className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Global Search Modal */}
      {isSearchOpen && <SearchModal onClose={() => setIsSearchOpen(false)} />}

      {/* Workspace & Universal Workflow Drawer */}
      <WorkspaceDrawer isOpen={isWorkspaceOpen} onClose={() => setIsWorkspaceOpen(false)} />
    </>
  );
};

