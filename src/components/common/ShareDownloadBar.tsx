import React, { useState } from 'react';
import { Download, Share2, Copy, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { sanitizeFilename } from '../../lib/security';

interface ShareDownloadBarProps {
  onDownload?: () => void;
  downloadLabel?: string;
  downloadFilename?: string;
  blobToShare?: Blob;
  textToShare?: string;
  onCopyText?: string;
  copyLabel?: string;
  className?: string;
  disabled?: boolean;
}

export const ShareDownloadBar: React.FC<ShareDownloadBarProps> = ({
  onDownload,
  downloadLabel,
  downloadFilename = 'phone-tools-export',
  blobToShare,
  textToShare,
  onCopyText,
  copyLabel,
  className = '',
  disabled = false,
}) => {
  const { showToast } = useApp();
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);

  const effectiveDownloadLabel = downloadLabel || t('download');
  const effectiveCopyLabel = copyLabel || t('copy');

  const handleCopy = async () => {
    if (!onCopyText || disabled) return;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(onCopyText);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = onCopyText;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      showToast(t('toast_copied'), 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast(t('toast_copy_failed'), 'error');
    }
  };

  const handleShare = async () => {
    if (disabled || sharing) return;

    if (typeof navigator === 'undefined' || !navigator.share) {
      // Fallback
      if (onCopyText) {
        handleCopy();
      } else if (onDownload) {
        onDownload();
        showToast(t('toast_download_started'), 'info');
      }
      return;
    }

    setSharing(true);
    try {
      const safeFilename = sanitizeFilename(downloadFilename);
      if (blobToShare) {
        try {
          const file = new File([blobToShare], safeFilename, {
            type: blobToShare.type || 'application/octet-stream',
          });
          if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: safeFilename,
            });
            showToast(t('toast_shared'), 'success');
            return;
          }
        } catch {
          // File share not supported on this browser/OS, fall through to text or direct download
        }
      }

      if (textToShare || onCopyText) {
        await navigator.share({
          title: 'PHONE TOOLS Export',
          text: textToShare || onCopyText,
        });
        showToast(t('toast_shared'), 'success');
        return;
      }

      // If no file or text shareable, trigger download fallback
      if (onDownload) {
        onDownload();
      }
    } catch (err: unknown) {
      if ((err as Error)?.name !== 'AbortError') {
        showToast(t('toast_share_cancelled'), 'info');
      }
    } finally {
      setSharing(false);
    }
  };

  const canWebShare = typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <div className={`flex flex-wrap items-center gap-2.5 ${className}`}>
      {onDownload && (
        <button
          onClick={onDownload}
          disabled={disabled || sharing}
          className="flex-1 min-w-[130px] inline-flex items-center justify-center gap-2 h-11 min-h-[44px] px-4 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 font-semibold text-xs sm:text-sm shadow-sm transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          <span>{effectiveDownloadLabel}</span>
        </button>
      )}

      {onCopyText !== undefined && (
        <button
          onClick={handleCopy}
          disabled={disabled || !onCopyText}
          aria-label={copied ? t('copied') : effectiveCopyLabel}
          aria-live="polite"
          className="inline-flex items-center justify-center gap-1.5 h-11 min-h-[44px] px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium text-xs sm:text-sm transition-colors active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-emerald-500" aria-hidden="true" />
              <span>{t('copied')}</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" aria-hidden="true" />
              <span>{effectiveCopyLabel}</span>
            </>
          )}
        </button>
      )}

      {(blobToShare || textToShare || canWebShare) && (
        <button
          onClick={handleShare}
          disabled={disabled || sharing}
          aria-busy={sharing}
          aria-label={t('share')}
          className="inline-flex items-center justify-center gap-1.5 h-11 min-h-[44px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs sm:text-sm transition-colors active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
          title={t('share')}
        >
          <Share2 className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">{t('share')}</span>
        </button>
      )}
    </div>
  );
};

