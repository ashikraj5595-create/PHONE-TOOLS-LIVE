import React, { useState, useMemo } from 'react';
import { ToolContainer } from '../../../components/layout/ToolContainer';
import { ShareDownloadBar } from '../../../components/common/ShareDownloadBar';
import { Check } from 'lucide-react';

interface CleanOptions {
  trimEdges: boolean;
  collapseSpaces: boolean;
  removeBlankLines: boolean;
  normalizeBreaks: boolean;
  stripTabs: boolean;
}

export const TextCleaner: React.FC = () => {
  const [input, setInput] = useState('');
  const [options, setOptions] = useState<CleanOptions>({
    trimEdges: true,
    collapseSpaces: true,
    removeBlankLines: true,
    normalizeBreaks: true,
    stripTabs: false,
  });

  const cleanedText = useMemo(() => {
    if (!input) return '';
    let res = input.length > 500000 ? input.slice(0, 500000) : input;

    if (options.normalizeBreaks) {
      res = res.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    }

    if (options.stripTabs) {
      res = res.replace(/\t+/g, ' ');
    }

    if (options.collapseSpaces) {
      // Collapse spaces within each line
      res = res
        .split('\n')
        .map((line) => line.replace(/[^\S\r\n]+/g, ' '))
        .join('\n');
    }

    if (options.removeBlankLines) {
      res = res
        .split('\n')
        .filter((line) => line.trim().length > 0)
        .join('\n');
    }

    if (options.trimEdges) {
      res = res
        .split('\n')
        .map((line) => line.trim())
        .join('\n')
        .trim();
    }

    return res;
  }, [input, options]);

  const toggleOption = (key: keyof CleanOptions) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleReset = () => {
    setInput('');
  };

  const optionItems: { key: keyof CleanOptions; label: string; desc: string }[] = [
    { key: 'trimEdges', label: 'Trim whitespace', desc: 'Remove leading and trailing spaces per line' },
    { key: 'collapseSpaces', label: 'Single spacing', desc: 'Replace multiple spaces with a single space' },
    { key: 'removeBlankLines', label: 'Remove empty lines', desc: 'Strip out completely blank rows' },
    { key: 'normalizeBreaks', label: 'Normalize line breaks', desc: 'Convert inconsistent CRLF to standard LF' },
    { key: 'stripTabs', label: 'Convert tabs to spaces', desc: 'Change tab characters into standard single spaces' },
  ];

  return (
    <ToolContainer toolId="text-cleaner" onReset={handleReset} canReset={input.length > 0}>
      <div className="space-y-6">
        {/* Cleaning Options Toggles */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <h2 className="font-display text-sm font-bold text-slate-900 dark:text-white">
            Cleaning Rules
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {optionItems.map((item) => {
              const checked = options[item.key];
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => toggleOption(item.key)}
                  className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                    checked
                      ? 'border-emerald-500/40 bg-emerald-50/30 dark:bg-emerald-950/20 text-slate-900 dark:text-white'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-500'
                  }`}
                >
                  <div
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border mt-0.5 transition-colors ${
                      checked
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                    }`}
                  >
                    {checked && <Check className="h-3.5 w-3.5" />}
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-semibold">{item.label}</p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">{item.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Input & Output Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Before */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <label htmlFor="raw-text" className="font-semibold text-slate-700 dark:text-slate-300">
                Original Text (Before)
              </label>
              <span>{input.length} characters</span>
            </div>
            <textarea
              id="raw-text"
              rows={8}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste unformatted or messy text with extra spaces and blank lines..."
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white resize-y font-mono text-xs leading-relaxed"
            />
          </div>

          {/* After */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                Cleaned Result (After)
              </span>
              <span>{cleanedText.length} characters</span>
            </div>
            <textarea
              readOnly
              rows={8}
              value={cleanedText}
              placeholder="Cleaned output will appear here automatically..."
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none resize-y font-mono text-xs leading-relaxed"
            />
            <div className="pt-2 flex justify-end">
              <ShareDownloadBar
                onCopyText={cleanedText}
                copyLabel="Copy Clean Text"
                textToShare={cleanedText}
              />
            </div>
          </div>
        </div>
      </div>
    </ToolContainer>
  );
};
