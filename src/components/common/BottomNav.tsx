import React from 'react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { Home, Grid, Heart, Settings } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { currentPath, navigate, favorites } = useApp();
  const { t } = useLanguage();

  const navItems = [
    { label: t('nav_home'), path: '/', icon: Home, matchExact: true },
    { label: t('nav_tools'), path: '/tools', icon: Grid, matchExact: false },
    { label: t('nav_favorites'), path: '/favorites', icon: Heart, matchExact: false, badgeCount: favorites.length },
    { label: t('nav_settings'), path: '/settings', icon: Settings, matchExact: false },
  ];

  const activeIndex = navItems.findIndex((item) =>
    item.matchExact
      ? currentPath === item.path
      : currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path))
  );
  const hasActiveTab = activeIndex !== -1;

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 transition-colors"
      aria-label="Mobile Navigation"
    >
      <div className="px-1">
        <div className="relative h-15 pb-safe">
          {/* Subtle smooth sliding active indicator pill */}
          <div
            aria-hidden="true"
            className="absolute inset-y-0 left-0 w-1/4 pointer-events-none flex items-center justify-center transition-transform duration-300 ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none"
            style={{
              transform: `translateX(${Math.max(0, activeIndex) * 100}%)`,
              opacity: hasActiveTab ? 1 : 0,
            }}
          >
            <div className="flex flex-col items-center justify-center min-h-[48px] py-1">
              <div className="w-13 h-7 rounded-full bg-slate-100 dark:bg-slate-800 shadow-2xs border border-slate-200/50 dark:border-slate-700/50" />
              <div className="h-[14px] mt-1 invisible" />
            </div>
          </div>

          {/* Navigation Items */}
          <div className="grid grid-cols-4 items-center h-full">
            {navItems.map((item) => {
              const isActive = item.matchExact
                ? currentPath === item.path
                : currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path));
              const Icon = item.icon;

              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="flex flex-col items-center justify-center min-h-[48px] py-1 transition-transform active:scale-95 relative z-10 group"
                  aria-current={isActive ? 'page' : undefined}
                >
                  <div className="relative flex items-center justify-center">
                    <Icon
                      className={`h-5 w-5 transition-all duration-200 ease-out motion-reduce:transition-none ${
                        isActive
                          ? 'text-slate-900 dark:text-white scale-105'
                          : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                      }`}
                      strokeWidth={isActive ? 2.3 : 1.8}
                    />
                    {item.badgeCount !== undefined && item.badgeCount > 0 && (
                      <span className="absolute -top-1 -right-2 z-20 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
                        {item.badgeCount}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-[10px] tracking-tight mt-1 transition-colors duration-200 ease-out motion-reduce:transition-none ${
                      isActive
                        ? 'font-bold text-slate-900 dark:text-white'
                        : 'font-medium text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};
