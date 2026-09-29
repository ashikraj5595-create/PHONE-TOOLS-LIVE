import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { Language, ToolDefinition, ToolCategory, CategoryMeta } from '../types';
import { storage } from '../lib/storage/localStorage';
import { LOCALES } from '../locales';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  tTool: (toolOrId: ToolDefinition | string) => { name: string; description: string };
  tCat: (catOrId: ToolCategory | CategoryMeta | string) => { name: string; description: string };
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => storage.getLanguage());

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    storage.setLanguage(lang);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  }, []);

  const currentLocale = useMemo(() => LOCALES[language] || LOCALES.en, [language]);
  const defaultLocale = LOCALES.en;

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      let text = currentLocale.strings[key] ?? defaultLocale.strings[key] ?? key;
      if (params) {
        Object.entries(params).forEach(([paramKey, paramVal]) => {
          text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal));
        });
      }
      return text;
    },
    [currentLocale, defaultLocale]
  );

  const tTool = useCallback(
    (toolOrId: ToolDefinition | string): { name: string; description: string } => {
      const id = typeof toolOrId === 'string' ? toolOrId : toolOrId.id;
      const trans = currentLocale.tools[id] || defaultLocale.tools[id];
      if (trans) {
        return { name: trans.name, description: trans.description };
      }
      if (typeof toolOrId !== 'string') {
        return { name: toolOrId.name, description: toolOrId.description };
      }
      return { name: id, description: '' };
    },
    [currentLocale, defaultLocale]
  );

  const tCat = useCallback(
    (catOrId: ToolCategory | CategoryMeta | string): { name: string; description: string } => {
      const id = (typeof catOrId === 'string' ? catOrId : catOrId.id) as ToolCategory;
      const trans = currentLocale.categories[id] || defaultLocale.categories[id];
      if (trans) {
        return { name: trans.name, description: trans.description };
      }
      if (typeof catOrId !== 'string' && 'name' in catOrId) {
        return { name: catOrId.name, description: catOrId.description };
      }
      return { name: id, description: '' };
    },
    [currentLocale, defaultLocale]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, tTool, tCat }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
