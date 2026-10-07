import React, { useRef, useState, useMemo } from 'react';
import { UploadCloud, File as FileIcon, AlertCircle, FolderSync } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { validateImageFile, validatePdfFile } from '../../lib/security';

interface FileDropZoneProps {
  accept: string;
  multiple?: boolean;
  maxSizeMB?: number;
  label?: string;
  sublabel?: string;
  onFilesSelected: (files: File[]) => void;
  className?: string;
}

export const FileDropZone: React.FC<FileDropZoneProps> = ({
  accept,
  multiple = false,
  maxSizeMB = 50,
  label,
  sublabel,
  onFilesSelected,
  className = '',
}) => {
  const { t } = useLanguage();
  const { selectedAsset } = useWorkspace();
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const effectiveLabel = label || t('drop_label');
  const effectiveSublabel = sublabel || t('drop_sublabel');
  const browseText = multiple ? t('browse_files') : t('browse_file');

  // Check if active workspace asset matches the tool's accept filter
  const matchingWorkspaceAsset = useMemo(() => {
    if (!selectedAsset) return null;
    if (!accept || accept === '*' || accept === '*/*') return selectedAsset;

    const parts = accept.split(',').map((p) => p.trim().toLowerCase());
    const dotIdx = selectedAsset.name.lastIndexOf('.');
    const ext = dotIdx >= 0 ? `.${selectedAsset.name.substring(dotIdx + 1).toLowerCase()}` : '';
    const lowerMime = selectedAsset.mimeType.toLowerCase();

    const matches = parts.some((p) => {
      if (p.startsWith('.')) return ext === p;
      if (p.endsWith('/*')) {
        const category = p.slice(0, -2);
        return lowerMime.startsWith(category + '/');
      }
      return lowerMime === p;
    });

    return matches ? selectedAsset : null;
  }, [selectedAsset, accept]);

  const handleUseWorkspaceAsset = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!matchingWorkspaceAsset) return;

    setError(null);
    const raw = matchingWorkspaceAsset.raw;
    const file =
      raw instanceof File
        ? raw
        : new File([raw], matchingWorkspaceAsset.name, { type: matchingWorkspaceAsset.mimeType });

    // Validate using existing format-specific security checks
    if (accept.includes('image')) {
      const check = validateImageFile(file, maxSizeMB);
      if (!check.valid) {
        setError(check.error || 'Invalid image file from workspace.');
        return;
      }
    } else if (accept.includes('pdf')) {
      const check = validatePdfFile(file, maxSizeMB);
      if (!check.valid) {
        setError(check.error || 'Invalid PDF file from workspace.');
        return;
      }
    } else {
      const maxBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxBytes) {
        setError(`File exceeds the ${maxSizeMB}MB limit.`);
        return;
      }
      if (file.size === 0) {
        setError('File is empty (0 bytes).');
        return;
      }
    }

    onFilesSelected([file]);
  };

  const validateAndPassFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setError(null);

    const validFiles: File[] = [];
    const maxFiles = multiple ? 50 : 1;
    const count = Math.min(fileList.length, maxFiles);

    for (let i = 0; i < count; i++) {
      const file = fileList[i];

      // Format-specific security checks
      if (accept.includes('image')) {
        const check = validateImageFile(file, maxSizeMB);
        if (!check.valid) {
          setError(check.error || 'Invalid image file.');
          return;
        }
      } else if (accept.includes('pdf')) {
        const check = validatePdfFile(file, maxSizeMB);
        if (!check.valid) {
          setError(check.error || 'Invalid PDF file.');
          return;
        }
      } else {
        // Generic fallback check
        const maxBytes = maxSizeMB * 1024 * 1024;
        if (file.size > maxBytes) {
          setError(`File exceeds the ${maxSizeMB}MB limit.`);
          return;
        }
        if (file.size === 0) {
          setError('File is empty (0 bytes).');
          return;
        }
      }

      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    validateAndPassFiles(e.dataTransfer.files);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    validateAndPassFiles(e.target.files);
    // Reset input value so re-selecting same file triggers event
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Workspace Quick-Load Banner */}
      {matchingWorkspaceAsset && (
        <div className="mb-3.5 p-3 sm:p-3.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/50 flex items-center justify-between gap-3 text-xs transition-all">
          <div className="min-w-0 flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400">
              <FolderSync className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px] sm:max-w-xs">
                  {matchingWorkspaceAsset.name}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-900/70 text-blue-700 dark:text-blue-300">
                  Workspace
                </span>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                {(matchingWorkspaceAsset.size / (1024 * 1024)).toFixed(2)} MB • Ready to use
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleUseWorkspaceAsset}
            className="shrink-0 min-h-[44px] px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 active:scale-95 flex items-center gap-1.5 shadow-xs"
          >
            <span>Use workspace file</span>
          </button>
        </div>
      )}

      <div
        role="button"
        tabIndex={0}
        aria-label={`${effectiveLabel}. ${browseText}`}
        onKeyDown={handleKeyDown}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center p-6 sm:p-10 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center select-none active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2 ${
          isDragging
            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
            : 'border-slate-300 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 hover:border-slate-400 dark:hover:border-slate-600 hover:bg-slate-50/50 dark:hover:bg-slate-800/40'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          className="hidden"
        />

        <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 mb-3 shadow-xs">
          <UploadCloud className="h-6 w-6 sm:h-7 sm:w-7" />
        </div>

        <p className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200">
          {effectiveLabel}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
          {effectiveSublabel}
        </p>

        <div className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 shadow-xs">
          <FileIcon className="h-3.5 w-3.5" />
          <span>{browseText}</span>
        </div>
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-700 dark:text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
