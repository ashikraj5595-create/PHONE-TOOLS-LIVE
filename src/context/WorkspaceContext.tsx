import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  ReactNode,
} from 'react';
import { FileAsset, WorkspaceItem, createFileAsset } from '../core/types/asset';
import { objectUrlManager } from '../core/memory/objectUrlManager';
import { validateImageFile, validatePdfFile } from '../lib/security';
import { useApp } from './AppContext';

export const MAX_WORKSPACE_ITEMS = 50;
export const MAX_FILE_SIZE_MB = 50;

export interface WorkspaceContextType {
  readonly items: readonly WorkspaceItem[];
  readonly selectedAssetId: string | null;
  readonly selectedAsset: FileAsset | null;
  readonly itemCount: number;
  readonly isFull: boolean;
  addAssets: (files: File[]) => Promise<string[]>;
  removeAsset: (assetId: string) => void;
  selectAsset: (assetId: string | null) => void;
  clearWorkspace: () => void;
  getAsset: (assetId: string) => FileAsset | undefined;
  getItem: (assetId: string) => WorkspaceItem | undefined;
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

export interface WorkspaceProviderProps {
  children: ReactNode;
}

/**
 * PHONE TOOLS — In-Memory Session Workspace Provider
 *
 * Guarantees:
 * - Session-oriented: Preserved across client-side route navigation.
 * - In-memory only: Zero localStorage, sessionStorage, IndexedDB, or backend calls.
 * - Zero automatic object URLs: Ingestion never creates object URLs.
 * - Deterministic memory cleanup: Revokes tracked URLs on item removal or clear.
 * - Capacity bounded: Hard-capped at 50 items and 50MB per file.
 */
export const WorkspaceProvider: React.FC<WorkspaceProviderProps> = ({ children }) => {
  const { showToast } = useApp();
  const [items, setItems] = useState<WorkspaceItem[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);

  // Cleanup object URLs when provider unmounts
  useEffect(() => {
    return () => {
      objectUrlManager.revokeAll();
    };
  }, []);

  const addAssets = useCallback(
    async (files: File[]): Promise<string[]> => {
      if (!files || files.length === 0) return [];

      const availableSlots = MAX_WORKSPACE_ITEMS - items.length;
      if (availableSlots <= 0) {
        showToast(`Workspace is full. Maximum limit is ${MAX_WORKSPACE_ITEMS} items.`, 'error');
        return [];
      }

      const filesToProcess = files.slice(0, availableSlots);
      if (files.length > availableSlots) {
        showToast(
          `Added ${availableSlots} files. Maximum workspace capacity is ${MAX_WORKSPACE_ITEMS}.`,
          'info'
        );
      }

      const newItems: WorkspaceItem[] = [];
      const addedIds: string[] = [];

      for (const file of filesToProcess) {
        // Enforce format-specific security checks from security.ts
        const isImage = file.type.startsWith('image/');
        const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

        if (isImage) {
          const check = validateImageFile(file, MAX_FILE_SIZE_MB);
          if (!check.valid) {
            showToast(check.error || `Invalid image: ${file.name}`, 'error');
            continue;
          }
        } else if (isPdf) {
          const check = validatePdfFile(file, MAX_FILE_SIZE_MB);
          if (!check.valid) {
            showToast(check.error || `Invalid PDF: ${file.name}`, 'error');
            continue;
          }
        } else {
          const maxBytes = MAX_FILE_SIZE_MB * 1024 * 1024;
          if (file.size > maxBytes) {
            showToast(`${file.name} exceeds ${MAX_FILE_SIZE_MB}MB limit.`, 'error');
            continue;
          }
          if (file.size === 0) {
            showToast(`${file.name} is empty (0 bytes).`, 'error');
            continue;
          }
        }

        // Create asset using existing helper (objectUrl is intentionally omitted / lazy)
        const asset = createFileAsset({
          raw: file,
          name: file.name,
          mimeType: file.type,
          origin: 'user_upload',
        });

        const item: WorkspaceItem = {
          id: asset.id,
          asset,
          status: 'idle',
          outputHistory: [],
        };

        newItems.push(item);
        addedIds.push(asset.id);
      }

      if (newItems.length > 0) {
        setItems((prev) => [...prev, ...newItems]);
        setSelectedAssetId((prev) => prev ?? addedIds[0] ?? null);
      }

      return addedIds;
    },
    [items.length, showToast]
  );

  const removeAsset = useCallback((assetId: string) => {
    setItems((prev) => {
      const target = prev.find((item) => item.id === assetId);
      if (target?.asset.objectUrl) {
        objectUrlManager.revoke(target.asset.objectUrl);
      }
      return prev.filter((item) => item.id !== assetId);
    });

    setSelectedAssetId((prev) => (prev === assetId ? null : prev));
  }, []);

  const selectAsset = useCallback((assetId: string | null) => {
    setSelectedAssetId(assetId);
  }, []);

  const clearWorkspace = useCallback(() => {
    setItems((prev) => {
      prev.forEach((item) => {
        if (item.asset.objectUrl) {
          objectUrlManager.revoke(item.asset.objectUrl);
        }
      });
      return [];
    });
    setSelectedAssetId(null);
  }, []);

  const getAsset = useCallback(
    (assetId: string): FileAsset | undefined => {
      return items.find((item) => item.id === assetId)?.asset;
    },
    [items]
  );

  const getItem = useCallback(
    (assetId: string): WorkspaceItem | undefined => {
      return items.find((item) => item.id === assetId);
    },
    [items]
  );

  const selectedAsset = useMemo(() => {
    if (!selectedAssetId) return null;
    return items.find((item) => item.id === selectedAssetId)?.asset ?? null;
  }, [items, selectedAssetId]);

  const value = useMemo<WorkspaceContextType>(
    () => ({
      items,
      selectedAssetId,
      selectedAsset,
      itemCount: items.length,
      isFull: items.length >= MAX_WORKSPACE_ITEMS,
      addAssets,
      removeAsset,
      selectAsset,
      clearWorkspace,
      getAsset,
      getItem,
    }),
    [
      items,
      selectedAssetId,
      selectedAsset,
      addAssets,
      removeAsset,
      selectAsset,
      clearWorkspace,
      getAsset,
      getItem,
    ]
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
};

/**
 * Hook to access session workspace state and actions.
 */
export function useWorkspace(): WorkspaceContextType {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}
