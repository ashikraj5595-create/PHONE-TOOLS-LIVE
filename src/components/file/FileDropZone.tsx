import React, { useRef, useState } from 'react';
import { UploadCloud, File, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
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
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const effectiveLabel = label || t('drop_label');
  const effectiveSublabel = sublabel || t('drop_sublabel');
  const browseText = multiple ? t('browse_files') : t('browse_file');

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

  return (
    <div className={`w-full ${className}`}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center p-6 sm:p-10 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center select-none active:scale-[0.99] ${
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
          <File className="h-3.5 w-3.5" />
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
