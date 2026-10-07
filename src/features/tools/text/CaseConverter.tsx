import React, { useState, useMemo, useEffect } from 'react';
import { ToolContainer } from '../../../components/layout/ToolContainer';
import { ShareDownloadBar } from '../../../components/common/ShareDownloadBar';
import { createFileAsset } from '../../../core/types/asset';
import { FileDNA } from '../../../core/types/dna';
import { FileExplanation, generateFileExplanation } from '../../../core/explain/explainEngine';
import { analyzeFileDNA } from '../../../core/dna/fileDnaEngine';
import { FileDnaCard } from '../../../components/common/FileDnaCard';

type CaseMode = 'upper' | 'lower' | 'title' | 'sentence' | 'toggle';

export const CaseConverter: React.FC = () => {
  const [text, setText] = useState('');
  const [activeMode, setActiveMode] = useState<CaseMode>('title');
  const [outputDna, setOutputDna] = useState<FileDNA | null>(null);
  const [outputExplanation, setOutputExplanation] = useState<FileExplanation | null>(null);

  const toTitleCase = (str: string): string => {
    return str.replace(/\w\S*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
    });
  };

  const toSentenceCase = (str: string): string => {
    return str.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
  };

  const toToggleCase = (str: string): string => {
    return str
      .split('')
      .map((char) =>
        char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase()
      )
      .join('');
  };

  const convertText = (str: string, mode: CaseMode): string => {
    if (!str) return '';
    const safeStr = str.length > 500000 ? str.slice(0, 500000) : str;
    switch (mode) {
      case 'upper':
        return safeStr.toUpperCase();
      case 'lower':
        return safeStr.toLowerCase();
      case 'title':
        return toTitleCase(safeStr);
      case 'sentence':
        return toSentenceCase(safeStr);
      case 'toggle':
        return toToggleCase(safeStr);
      default:
        return safeStr;
    }
  };

  const convertedResult = convertText(text, activeMode);

  const handleReset = () => {
    setText('');
    setOutputDna(null);
    setOutputExplanation(null);
  };

  const outputAsset = useMemo(() => {
    if (!convertedResult) return null;
    const blob = new Blob([convertedResult], { type: 'text/plain;charset=utf-8' });
    return createFileAsset({
      raw: blob,
      name: 'converted-text.txt',
      mimeType: 'text/plain',
      origin: 'tool_output',
      producerToolId: 'case-converter',
    });
  }, [convertedResult]);

  // Activate File DNA & Explain for the converted text output
  useEffect(() => {
    let isCurrent = true;
    if (!outputAsset) {
      setOutputDna(null);
      setOutputExplanation(null);
      return;
    }

    analyzeFileDNA(outputAsset, { includeHash: false, includeQr: false })
      .then((dna) => {
        if (!isCurrent) return;
        setOutputDna(dna);
        const explanation = generateFileExplanation(dna, { targetToolId: 'case-converter' });
        setOutputExplanation(explanation);
      })
      .catch(() => {
        // Fail gracefully without breaking case converter flow
      });

    return () => {
      isCurrent = false;
    };
  }, [outputAsset]);

  const modes: { id: CaseMode; label: string; example: string }[] = [
    { id: 'upper', label: 'UPPERCASE', example: 'ALL CAPITAL LETTERS' },
    { id: 'lower', label: 'lowercase', example: 'all small letters' },
    { id: 'title', label: 'Title Case', example: 'First Letter Of Each Word' },
    { id: 'sentence', label: 'Sentence case', example: 'First letter of each sentence.' },
    { id: 'toggle', label: 'tOGGLE cASE', example: 'iNVERTED cAPITALIZATION' },
  ];

  return (
    <ToolContainer toolId="case-converter" onReset={handleReset} canReset={text.length > 0}>
      <div className="space-y-6">
        {/* Case Mode Selector */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <label className="font-display text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Select Target Case
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {modes.map((m) => {
              const isSelected = activeMode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setActiveMode(m.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-100 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <p className="font-semibold text-xs sm:text-sm">{m.label}</p>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">{m.example}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Text Input & Converted Result */}
        <div className="space-y-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <label htmlFor="case-input" className="font-semibold text-slate-700 dark:text-slate-300">
                Input Text
              </label>
              <span>{text.length} chars</span>
            </div>
            <textarea
              id="case-input"
              rows={5}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type or paste sentences here to convert case..."
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white resize-y leading-relaxed"
            />
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                Converted Output ({modes.find((m) => m.id === activeMode)?.label})
              </span>
              <span>{convertedResult.length} chars</span>
            </div>
            <textarea
              readOnly
              rows={5}
              value={convertedResult}
              placeholder="Output in selected case will appear here..."
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none resize-y leading-relaxed"
            />
            <div className="flex justify-end pt-1">
              <ShareDownloadBar
                onCopyText={convertedResult}
                copyLabel="Copy Converted Text"
                textToShare={convertedResult}
              />
            </div>

            {outputDna && (
              <div className="pt-1">
                <FileDnaCard
                  dna={outputDna}
                  explanation={outputExplanation}
                  asset={outputAsset}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolContainer>
  );
};
