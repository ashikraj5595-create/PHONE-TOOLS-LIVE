import { ThemeMode, Language } from '../../types';
import { safeJsonParse } from '../security';

const THEME_KEY = 'phonetools_theme_v1';
const FAVORITES_KEY = 'phonetools_favorites_v1';
const RECENTS_KEY = 'phonetools_recents_v1';
const LANGUAGE_KEY = 'phonetools_language_v1';

const ALLOWED_TOOL_IDS = new Set([
  'image-compressor',
  'image-resizer',
  'image-cropper',
  'image-converter',
  'image-to-pdf',
  'pdf-to-image',
  'text-counter',
  'text-cleaner',
  'case-converter',
  'qr-scanner',
  'qr-generator',
  'percentage-calculator',
  'discount-calculator',
  'age-calculator',
  'unit-converter',
  'data-storage-converter',
  'password-generator',
]);

const DEFAULT_FAVORITES = ['image-compressor', 'qr-scanner', 'password-generator'];

export const storage = {
  getLanguage(): Language {
    try {
      const val = localStorage.getItem(LANGUAGE_KEY);
      if (val === 'en' || val === 'hi' || val === 'bn') {
        return val;
      }
    } catch {
      // ignore storage access error
    }
    return 'en';
  },

  setLanguage(lang: Language): void {
    try {
      if (lang === 'en' || lang === 'hi' || lang === 'bn') {
        localStorage.setItem(LANGUAGE_KEY, lang);
      }
    } catch {
      // ignore
    }
  },

  getTheme(): ThemeMode {
    try {
      const val = localStorage.getItem(THEME_KEY);
      if (val === 'light' || val === 'dark' || val === 'system') {
        return val;
      }
    } catch {
      // ignore
    }
    return 'system';
  },

  setTheme(theme: ThemeMode): void {
    try {
      if (theme === 'light' || theme === 'dark' || theme === 'system') {
        localStorage.setItem(THEME_KEY, theme);
      }
    } catch {
      // ignore
    }
  },

  getFavorites(): string[] {
    try {
      const raw = localStorage.getItem(FAVORITES_KEY);
      if (raw !== null) {
        const parsed = safeJsonParse<unknown>(raw, null);
        if (Array.isArray(parsed)) {
          return parsed
            .filter((id): id is string => typeof id === 'string' && ALLOWED_TOOL_IDS.has(id))
            .slice(0, 20);
        }
      }
    } catch {
      // ignore
    }
    return [...DEFAULT_FAVORITES];
  },

  setFavorites(favorites: string[]): void {
    try {
      const validated = favorites
        .filter((id) => typeof id === 'string' && ALLOWED_TOOL_IDS.has(id))
        .slice(0, 20);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(validated));
    } catch {
      // ignore
    }
  },

  toggleFavorite(id: string): string[] {
    if (!ALLOWED_TOOL_IDS.has(id)) return this.getFavorites();
    const current = this.getFavorites();
    const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
    this.setFavorites(next);
    return next;
  },

  isFavorite(id: string): boolean {
    return this.getFavorites().includes(id);
  },

  getRecents(): string[] {
    try {
      const raw = localStorage.getItem(RECENTS_KEY);
      if (raw) {
        const parsed = safeJsonParse<unknown[]>(raw, []);
        if (Array.isArray(parsed)) {
          return parsed
            .filter((id): id is string => typeof id === 'string' && ALLOWED_TOOL_IDS.has(id))
            .slice(0, 10);
        }
      }
    } catch {
      // ignore
    }
    return [];
  },

  addRecent(id: string): string[] {
    if (!ALLOWED_TOOL_IDS.has(id)) return this.getRecents();
    const current = this.getRecents().filter((x) => x !== id);
    const updated = [id, ...current].slice(0, 10); // max 10
    try {
      localStorage.setItem(RECENTS_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
    return updated;
  },

  clearRecents(): void {
    try {
      localStorage.removeItem(RECENTS_KEY);
    } catch {
      // ignore
    }
  },

  clearAllData(): void {
    try {
      localStorage.removeItem(THEME_KEY);
      localStorage.removeItem(FAVORITES_KEY);
      localStorage.removeItem(RECENTS_KEY);
      localStorage.removeItem(LANGUAGE_KEY);
    } catch {
      // ignore
    }
  },
};

