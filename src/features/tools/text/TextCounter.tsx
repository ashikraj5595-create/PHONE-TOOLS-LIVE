import React, { useState } from 'react';
import { ToolContainer } from '../../../components/layout/ToolContainer';
import { ShareDownloadBar } from '../../../components/common/ShareDownloadBar';

export const TextCounter: React.FC = () => {
  const [text, setText] = useState('');

  const charCount = text.length;
  const charNoSpaces = text.replace(/\s/g, '').length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const sentenceCount = text.trim()
    ? (text.match(/[.!?]+(?:\s+|$)/g) || []).length || 1
    : 0;
  const paragraphCount = text.trim()
    ? text.split(/\n+/).filter((p) => p.trim().length > 0).length
    : 0;
  const lineCount = text ? text.split(/\r\n|\r|\n/).length : 0;
  const readingTimeMin = Math.ceil(wordCount / 200);

  const stats = [
    { label: 'Words', value: wordCount },
    { label: 'Characters', value: charCount },
    { label: 'No Spaces', value: charNoSpaces },
    { label: 'Sentences', value: sentenceCount },
    { label: 'Paragraphs', value: paragraphCount },
    { label: 'Lines', value: lineCount },
  ];

  const handleReset = () => setText('');

  return (
    <ToolContainer toolId="text-counter" onReset={handleReset} canReset={text.length > 0}>
      <div className="space-y-6">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
          {stats.map((item) => (
            <div
              key={item.label}
              className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center"
            >
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {item.label}
              </span>
              <p className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
                {item.value.toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        {/* Text Input Area */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <label htmlFor="text-counter-input" className="font-semibold text-slate-700 dark:text-slate-300">
              Type or paste your text below:
            </label>
            <span>Approx. {readingTimeMin} min read</span>
          </div>

          <textarea
            id="text-counter-input"
            rows={8}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Start typing or paste articles, notes, essays, or transcripts here..."
            className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white resize-y leading-relaxed font-sans"
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
            <span className="text-xs text-slate-400">
              Live updates as you type
            </span>
            <ShareDownloadBar
              onCopyText={text}
              copyLabel="Copy Text"
              textToShare={text}
            />
          </div>
        </div>
      </div>
    </ToolContainer>
  );
};
