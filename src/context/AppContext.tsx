import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { storage } from '../lib/storage/localStorage';
import { getToolByRoute } from '../registry/toolRegistry';

export interface ToastMessage {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'error';
}

/**
 * Normalizes incoming pathname when messaging platforms (like WhatsApp Stories)
 * append invisible Unicode format/control characters (e.g., U+2060 / %E2%81%A0)
 * at the edge of the root path.
 */
export function normalizeIncomingPath(rawPath: string): string {
  if (!rawPath || typeof rawPath !== 'string') return '/';
  if (rawPath === '/') return '/';

  let decoded = rawPath;
  try {
    decoded = decodeURIComponent(rawPath);
  } catch {
    // Malformed percent-encoding, keep rawPath
  }

  const edgeInvisibleRegex = /^[\s\u00A0\u200B-\u200F\u2028-\u202F\u2060-\u206F\uFEFF]+|[\s\u00A0\u200B-\u200F\u2028-\u202F\u2060-\u206F\uFEFF]+$/g;

  const trimmedDecoded = decoded.replace(edgeInvisibleRegex, '');
  if (trimmedDecoded === '/' || trimmedDecoded === '') {
    return '/';
  }

  const trimmedRaw = rawPath.replace(/^(\/%[eE]2%81%[aA]0|\/%[eE]2%80%[89a-fA-F][0-9a-fA-F])+$/i, '/');
  if (trimmedRaw === '/') {
    return '/';
  }

  return rawPath;
}

interface AppContextType {
  currentPath: string;
  navigate: (path: string) => void;
  favorites: string[];
  toggleFavorite: (toolId: string) => void;
  isFavorite: (toolId: string) => boolean;
  recents: string[];
  recordRecent: (toolId: string) => void;
  clearRecents: () => void;
  clearAllData: () => void;
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const raw = window.location.pathname || '/';
      const normalized = normalizeIncomingPath(raw);
      if (normalized !== raw) {
        window.history.replaceState(
          window.history.state,
          '',
          normalized + window.location.search + window.location.hash
        );
      }
      return normalized;
    }
    return '/';
  });

  const [favorites, setFavorites] = useState<string[]>(() => storage.getFavorites());
  const [recents, setRecents] = useState<string[]>(() => storage.getRecents());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync with browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const normalized = normalizeIncomingPath(window.location.pathname || '/');
      setCurrentPath(normalized);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((path: string) => {
    const target = normalizeIncomingPath(path);
    if (target === window.location.pathname) return;
    window.history.pushState({}, '', target);
    setCurrentPath(target);
    window.scrollTo({ top: 0, behavior: 'instant' });

    // If navigating to a tool route, automatically record recent tool
    const tool = getToolByRoute(target);
    if (tool) {
      const updated = storage.addRecent(tool.id);
      setRecents(updated);
    }
  }, []);

  const toggleFavorite = useCallback((toolId: string) => {
    const updated = storage.toggleFavorite(toolId);
    setFavorites(updated);
  }, []);

  const isFavorite = useCallback((toolId: string) => {
    return favorites.includes(toolId);
  }, [favorites]);

  const recordRecent = useCallback((toolId: string) => {
    const updated = storage.addRecent(toolId);
    setRecents(updated);
  }, []);

  const clearRecents = useCallback(() => {
    storage.clearRecents();
    setRecents([]);
  }, []);

  const clearAllData = useCallback(() => {
    storage.clearAllData();
    setFavorites([]);
    setRecents([]);
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = `${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev.slice(-2), { id, message, type }]); // Keep at most 3
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentPath,
        navigate,
        favorites,
        toggleFavorite,
        isFavorite,
        recents,
        recordRecent,
        clearRecents,
        clearAllData,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
