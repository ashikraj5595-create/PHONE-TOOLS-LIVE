import React, { useState, useEffect, useMemo } from 'react';
import {
  Dna,
  ShieldCheck,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  FileText,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react';
import { FileDNA } from '../../core/types/dna';
import { FileAsset } from '../../core/types/asset';
import { FileExplanation, generateFileExplanation } from '../../core/explain/explainEngine';
import { analyzeFileDNA } from '../../core/dna/fileDnaEngine';

export interface FileDnaCardProps {
  dna?: FileDNA | null;
  explanation?: FileExplanation | null;
  asset?: FileAsset | null;
  targetToolId?: string;
  className?: string;
  defaultExpanded?: boolean;
}

/**
 * PHONE TOOLS — File DNA & Pre-Flight Diagnostics Card
 *
 * Exposes non-destructive, on-device diagnostic metadata and processing insights.
 *
 * Invariants:
 * - 100% client-side memory execution (Zero server uploads)
 * - Safe rendering (no dangerouslySetInnerHTML or innerHTML)
 * - Non-blocking: Hash and QR analysis disabled by default
 * - Respects prefers-reduced-motion
 */
export const FileDnaCard: React.FC<FileDnaCardProps> = ({
  dna: dnaProp,
  explanation: explanationProp,
  asset,
  targetToolId,
  className = '',
  defaultExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);
  const [internalDna, setInternalDna] = useState<FileDNA | null>(null);
  const [internalExplanation, setInternalExplanation] = useState<FileExplanation | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // If asset is passed without pre-computed DNA, analyze client-side safely
  useEffect(() => {
    let isMounted = true;
    if (!asset || dnaProp) {
      return;
    }

    setIsAnalyzing(true);
    analyzeFileDNA(asset, { includeHash: false, includeQr: false })
      .then((computedDna) => {
        if (!isMounted) return;
        setInternalDna(computedDna);
        const computedExp = generateFileExplanation(computedDna, { targetToolId });
        setInternalExplanation(computedExp);
      })
      .catch(() => {
        // Fail gracefully without crashing
      })
      .finally(() => {
        if (isMounted) setIsAnalyzing(false);
      });

    return () => {
      isMounted = false;
    };
  }, [asset, dnaProp, targetToolId]);

  const activeDna = dnaProp || internalDna;
  const activeExplanation = useMemo(() => {
    if (explanationProp) return explanationProp;
    if (internalExplanation) return internalExplanation;
    if (activeDna) {
      return generateFileExplanation(activeDna, { targetToolId });
    }
    return null;
  }, [explanationProp, internalExplanation, activeDna, targetToolId]);

  if (isAnalyzing) {
    return (
      <div className={`p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center gap-2 text-xs text-slate-500 ${className}`}>
        <div className="h-3.5 w-3.5 rounded-full border-2 border-slate-300 dark:border-slate-700 border-t-blue-500 animate-spin" />
        <span>Reading file diagnostics...</span>
      </div>
    );
  }

  if (!activeDna) {
    return null;
  }

  const { universal, image, pdf, text, health } = activeDna;
  const isCorrupt = health.isCorrupt || (image?.exceedsCanvasLimit ?? false);

  return (
    <div
      role="region"
      aria-label="File DNA & Diagnostics"
      className={`rounded-xl border transition-all duration-200 ease-out motion-reduce:transition-none overflow-hidden ${
        isCorrupt
          ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40'
          : 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200/70 dark:border-slate-800'
      } ${className}`}
    >
      {/* Header bar / Toggle */}
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        aria-expanded={isExpanded}
        className="w-full min-h-[44px] px-3.5 py-2.5 flex items-center justify-between gap-2 text-left hover:bg-slate-100/50 dark:hover:bg-slate-800/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Dna className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <span className="font-semibold text-xs text-slate-800 dark:text-slate-200 truncate block">
              File DNA & Diagnostics
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate block">
              {universal.humanSize} • {universal.extension.toUpperCase()} • 100% on-device
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/50">
            <ShieldCheck className="h-3 w-3" />
            <span>Private</span>
          </span>
          <div className="text-slate-400 dark:text-slate-500 p-1">
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </div>
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-3.5 pb-3.5 pt-1 space-y-3 border-t border-slate-200/50 dark:border-slate-800/60 text-xs">
          {/* Health warnings if any */}
          {isCorrupt && (
            <div className="p-2.5 rounded-lg bg-rose-100/60 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2 text-rose-800 dark:text-rose-300">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <div className="text-[11px] leading-tight">
                {image?.exceedsCanvasLimit
                  ? 'Image dimensions exceed the safe browser canvas limit (8192px). Processing may be scaled.'
                  : health.errorReason || 'Diagnostic analysis detected an anomaly in this file.'}
              </div>
            </div>
          )}

          {/* Diagnostic Metrics Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="p-2 rounded-lg bg-white/70 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800 space-y-0.5">
              <span className="text-[10px] text-slate-400 block truncate">File Size</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                {universal.humanSize}
              </span>
            </div>

            <div className="p-2 rounded-lg bg-white/70 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800 space-y-0.5">
              <span className="text-[10px] text-slate-400 block truncate">Format</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                {universal.extension.toUpperCase()}
              </span>
            </div>

            {image && (
              <>
                <div className="p-2 rounded-lg bg-white/70 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800 space-y-0.5">
                  <span className="text-[10px] text-slate-400 block truncate">Dimensions</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 tabular-nums truncate block">
                    {image.width} × {image.height}
                  </span>
                </div>

                <div className="p-2 rounded-lg bg-white/70 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800 space-y-0.5">
                  <span className="text-[10px] text-slate-400 block truncate">Ratio / MP</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 tabular-nums truncate block">
                    {image.aspectRatio} ({image.megapixels.toFixed(1)} MP)
                  </span>
                </div>
              </>
            )}

            {pdf && (
              <>
                <div className="p-2 rounded-lg bg-white/70 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800 space-y-0.5">
                  <span className="text-[10px] text-slate-400 block truncate">Pages</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                    {pdf.pageCount} {pdf.pageCount === 1 ? 'page' : 'pages'}
                  </span>
                </div>

                <div className="p-2 rounded-lg bg-white/70 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800 space-y-0.5">
                  <span className="text-[10px] text-slate-400 block truncate">Security</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {pdf.isEncrypted ? 'Protected' : 'Standard'}
                  </span>
                </div>
              </>
            )}

            {text && (
              <>
                <div className="p-2 rounded-lg bg-white/70 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800 space-y-0.5">
                  <span className="text-[10px] text-slate-400 block truncate">Words</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                    {text.wordCount.toLocaleString()}
                  </span>
                </div>

                <div className="p-2 rounded-lg bg-white/70 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800 space-y-0.5">
                  <span className="text-[10px] text-slate-400 block truncate">Characters</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                    {text.charCount.toLocaleString()}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Explain Engine Insights */}
          {activeExplanation?.summary && (
            <div className="p-2.5 rounded-lg bg-white/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/80 flex items-start gap-2">
              <Sparkles className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5" />
              <div className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                {activeExplanation.summary}
              </div>
            </div>
          )}

          {/* Privacy Footnote */}
          <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 pt-0.5">
            <span>100% on-device • Zero server uploads</span>
            <span className="font-mono text-[9px] uppercase tracking-wider">{universal.mimeType}</span>
          </div>
        </div>
      )}
    </div>
  );
};
