import React, { useEffect, useRef } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { FileAsset } from '../../core/types/asset';
import { WorkflowBuilder } from './WorkflowBuilder';
import { sanitizeFilename } from '../../lib/security';
import {
  X,
  Trash2,
  Upload,
  FileText,
  Image as ImageIcon,
  FolderOpen,
  Download,
  Layers,
} from 'lucide-react';

interface WorkspaceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export const WorkspaceDrawer: React.FC<WorkspaceDrawerProps> = ({ isOpen, onClose }) => {
  const {
    items,
    selectedAsset,
    selectedAssetId,
    itemCount,
    isFull,
    addAssets,
    removeAsset,
    selectAsset,
    clearWorkspace,
  } = useWorkspace();
  const { showToast } = useApp();
  const { t } = useLanguage();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const drawerRef = useRef<HTMLDivElement | null>(null);

  // Keyboard accessibility: Escape to close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle file uploads into workspace
  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);
    const added = await addAssets(files);
    if (added.length > 0) {
      selectAsset(added[0]);
      showToast(`Added ${added.length} file(s) to workspace`, 'success');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Download any selected workspace asset
  const handleDownloadSelected = () => {
    if (!selectedAsset) return;
    const blob = selectedAsset.raw;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = sanitizeFilename(selectedAsset.name);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(t('toast_download_started'), 'success');
  };

  // Adopt final workflow output into workspace
  const handleAdoptOutput = async (outputAsset: FileAsset) => {
    try {
      const fileToSave =
        outputAsset.raw instanceof File
          ? outputAsset.raw
          : new File([outputAsset.raw], outputAsset.name, { type: outputAsset.mimeType });

      const addedIds = await addAssets([fileToSave]);
      if (addedIds && addedIds.length > 0) {
        selectAsset(addedIds[0]);
        showToast('Output saved to workspace and set as active input for next step!', 'success');
      }
    } catch {
      showToast('Could not save output to workspace.', 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Workspace and Workflow Drawer"
      className="fixed inset-0 z-50 overflow-hidden"
    >
      {/* Dimmed backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-4 sm:pl-10">
        <div
          ref={drawerRef}
          className="w-screen max-w-xl bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col focus:outline-hidden"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/70 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-xs">
                <FolderOpen className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    Workspace
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {itemCount}/50
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  In-memory session storage • Zero server uploads
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {itemCount > 0 && (
                <button
                  type="button"
                  onClick={clearWorkspace}
                  className="min-h-[44px] min-w-[44px] px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  aria-label="Clear all workspace items"
                >
                  Clear All
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Close workspace drawer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
            {/* Ingestion & Add Button */}
            <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center gap-2 min-w-0">
                <Upload className="h-4 w-4 text-slate-500 shrink-0" />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
                  Add files to session workspace
                </span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                id="workspace-file-input"
                onChange={handleFileInputChange}
              />
              <label
                htmlFor="workspace-file-input"
                className={`min-h-[44px] px-4 flex items-center justify-center rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold cursor-pointer hover:opacity-90 active:scale-95 transition-all shadow-xs ${
                  isFull ? 'opacity-40 pointer-events-none' : ''
                }`}
              >
                Choose Files
              </label>
            </div>

            {/* Workspace Items List */}
            {items.length === 0 ? (
              <div className="py-12 px-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2">
                <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
                  <Layers className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Workspace is empty
                </h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Files processed in tools or uploaded here stay in local memory during your session for rapid tool-to-tool workflows.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  <span>Session Files ({items.length})</span>
                  <span>Select file to chain</span>
                </div>

                <div className="grid grid-cols-1 gap-2 max-h-52 overflow-y-auto pr-1">
                  {items.map((item) => {
                    const isSelected = item.id === selectedAssetId;
                    const isImage = item.asset.mimeType.startsWith('image/');
                    const isPdf = item.asset.mimeType === 'application/pdf';

                    return (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                          isSelected
                            ? 'bg-slate-900/5 dark:bg-white/10 border-slate-900 dark:border-white ring-1 ring-slate-900/20 dark:ring-white/20'
                            : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => selectAsset(item.id)}
                          className="flex items-center gap-3 min-w-0 flex-1 text-left min-h-[44px]"
                          aria-label={`Select ${item.asset.name}`}
                        >
                          <div className="h-9 w-9 rounded-lg bg-slate-100 dark:bg-slate-700/60 flex items-center justify-center shrink-0 text-slate-500">
                            {isImage ? (
                              <ImageIcon className="h-4 w-4" />
                            ) : isPdf ? (
                              <FileText className="h-4 w-4 text-rose-500" />
                            ) : (
                              <FileText className="h-4 w-4 text-blue-500" />
                            )}
                          </div>
                          <div className="min-w-0 pr-2">
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                              {item.asset.name}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {formatBytes(item.asset.raw.size)} • {item.asset.mimeType || 'file'}
                            </p>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => removeAsset(item.id)}
                          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                          aria-label={`Remove ${item.asset.name} from workspace`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Selected Asset Details & Universal Workflow Builder */}
            {selectedAsset && (
              <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
                {/* Active File Header */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div className="min-w-0 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                      {selectedAsset.mimeType.startsWith('image/') ? (
                        <ImageIcon className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                      ) : (
                        <FileText className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                        {selectedAsset.name}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {formatBytes(selectedAsset.raw.size)} • {selectedAsset.mimeType || 'file'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleDownloadSelected}
                    className="min-h-[44px] px-3 flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download</span>
                  </button>
                </div>

                {/* Workflow Builder with Presets, Smart Actions, Pipeline & Execution */}
                <WorkflowBuilder
                  asset={selectedAsset}
                  onAdoptOutput={handleAdoptOutput}
                  onCloseDrawer={onClose}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
