import React from 'react';
import { Check, RotateCcw } from 'lucide-react';
import { ShareDownloadBar } from './ShareDownloadBar';

export interface ResultStat {
  label: string;
  value: string;
  subtext?: string;
  highlight?: boolean;
}

interface PremiumResultCardProps {
  title?: string;
  badgeText?: string;
  stats?: ResultStat[];
  children?: React.ReactNode;
  onDownload?: () => void;
  downloadLabel?: string;
  downloadFilename?: string;
  blobToShare?: Blob;
  textToShare?: string;
  onCopyText?: string;
  copyLabel?: string;
  onReset?: () => void;
  resetLabel?: string;
  disabled?: boolean;
  className?: string;
}

export const PremiumResultCard: React.FC<PremiumResultCardProps> = ({
  title = 'Processing Complete',
  badgeText,
  stats,
  children,
  onDownload,
  downloadLabel,
  downloadFilename,
  blobToShare,
  textToShare,
  onCopyText,
  copyLabel,
  onReset,
  resetLabel = 'Do Another',
  disabled = false,
  className = '',
}) => {
  return (
    <div
      role="region"
      aria-label={title}
      className={`p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 transition-all duration-200 ease-out motion-reduce:transition-none ${className}`}
    >
      {/* Header Banner */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Check className="h-3.5 w-3.5" />
          </div>
          <h3 className="font-display text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            {title}
          </h3>
        </div>

        {badgeText && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
            {badgeText}
          </span>
        )}
      </div>

      {/* Stats Summary Grid */}
      {stats && stats.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
          {stats.map((stat, idx) => (
            <div key={idx} className="space-y-0.5">
              <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 block truncate">
                {stat.label}
              </span>
              <p
                className={`font-display text-base font-bold tabular-nums truncate ${
                  stat.highlight
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-900 dark:text-white'
                }`}
              >
                {stat.value}
              </p>
              {stat.subtext && (
                <span className="text-[10px] text-slate-400 block truncate">
                  {stat.subtext}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Optional Preview / Details Content */}
      {children && <div className="pt-1">{children}</div>}

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs sm:text-sm transition-colors active:scale-[0.98]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>{resetLabel}</span>
          </button>
        )}

        <div className="flex-1 flex justify-end">
          <ShareDownloadBar
            onDownload={onDownload}
            downloadLabel={downloadLabel}
            downloadFilename={downloadFilename}
            blobToShare={blobToShare}
            textToShare={textToShare}
            onCopyText={onCopyText}
            copyLabel={copyLabel}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
};
