import React, { useState } from 'react';
import { ToolContainer } from '../../../components/layout/ToolContainer';
import { ShareDownloadBar } from '../../../components/common/ShareDownloadBar';

type CalcType = 'what_is_x_percent_of_y' | 'x_is_what_percent_of_y' | 'percentage_increase' | 'percentage_decrease';

export const PercentageCalculator: React.FC = () => {
  const [calcType, setCalcType] = useState<CalcType>('what_is_x_percent_of_y');
  const [valX, setValX] = useState<string>('20');
  const [valY, setValY] = useState<string>('150');

  const numX = parseFloat(valX);
  const numY = parseFloat(valY);

  let resultString = '';
  let explanation = '';
  const isFiniteX = Number.isFinite(numX);
  const isFiniteY = Number.isFinite(numY);
  const isOutOfRange = isFiniteX && isFiniteY && (Math.abs(numX) > 1e14 || Math.abs(numY) > 1e14);

  let isValid = isFiniteX && isFiniteY && !isOutOfRange;

  if (isOutOfRange) {
    resultString = 'Value out of range (max 10¹⁴)';
  } else if (isValid) {
    switch (calcType) {
      case 'what_is_x_percent_of_y': {
        const res = (numX / 100) * numY;
        if (!Number.isFinite(res)) {
          isValid = false;
          resultString = 'Value out of range';
        } else {
          resultString = Number.isInteger(res) ? res.toString() : res.toFixed(2);
          explanation = `${numX}% of ${numY} = ${resultString}`;
        }
        break;
      }
      case 'x_is_what_percent_of_y': {
        if (numY === 0) {
          resultString = 'Cannot divide by zero';
          isValid = false;
        } else {
          const res = (numX / numY) * 100;
          if (!Number.isFinite(res)) {
            isValid = false;
            resultString = 'Value out of range';
          } else {
            resultString = `${Number.isInteger(res) ? res.toString() : res.toFixed(2)}%`;
            explanation = `${numX} is ${resultString} of ${numY}`;
          }
        }
        break;
      }
      case 'percentage_increase': {
        if (numX === 0) {
          resultString = 'Initial value cannot be zero';
          isValid = false;
        } else {
          const diff = numY - numX;
          const res = (diff / numX) * 100;
          if (!Number.isFinite(res)) {
            isValid = false;
            resultString = 'Value out of range';
          } else {
            resultString = `${Number.isInteger(res) ? res.toString() : res.toFixed(2)}%`;
            explanation = `Increase from ${numX} to ${numY} = +${resultString} (+${(numY - numX).toFixed(2)})`;
          }
        }
        break;
      }
      case 'percentage_decrease': {
        if (numX === 0) {
          resultString = 'Initial value cannot be zero';
          isValid = false;
        } else {
          const diff = numX - numY;
          const res = (diff / numX) * 100;
          if (!Number.isFinite(res)) {
            isValid = false;
            resultString = 'Value out of range';
          } else {
            resultString = `${Number.isInteger(res) ? res.toString() : res.toFixed(2)}%`;
            explanation = `Decrease from ${numX} to ${numY} = -${resultString} (-${(numX - numY).toFixed(2)})`;
          }
        }
        break;
      }
    }
  }

  const modes: { id: CalcType; label: string; desc: string }[] = [
    { id: 'what_is_x_percent_of_y', label: 'X% of Y', desc: 'Calculate percentage value' },
    { id: 'x_is_what_percent_of_y', label: 'X is what % of Y', desc: 'Find ratio percentage' },
    { id: 'percentage_increase', label: 'Percentage Increase', desc: 'From X up to Y' },
    { id: 'percentage_decrease', label: 'Percentage Decrease', desc: 'From X down to Y' },
  ];

  const handleReset = () => {
    setValX('20');
    setValY('100');
  };

  return (
    <ToolContainer toolId="percentage-calculator" onReset={handleReset} canReset={true}>
      <div className="space-y-6">
        {/* Mode Selector */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <label className="font-display text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Calculation Formula
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {modes.map((m) => {
              const isSelected = calcType === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setCalcType(m.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50/40 dark:bg-amber-950/30 text-amber-900 dark:text-amber-100 shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <p className="font-semibold text-xs sm:text-sm">{m.label}</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{m.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Input Cards */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="input-x" className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                {calcType === 'what_is_x_percent_of_y'
                  ? 'Percentage (X %)'
                  : calcType === 'percentage_increase' || calcType === 'percentage_decrease'
                  ? 'Starting Value (X)'
                  : 'Numerator (X)'}
              </label>
              <input
                id="input-x"
                type="number"
                inputMode="decimal"
                step="any"
                value={valX}
                onChange={(e) => setValX(e.target.value)}
                placeholder="Enter value X"
                aria-invalid={valX.trim() !== '' && !isFiniteX ? 'true' : undefined}
                className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-base font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 tabular-nums"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="input-y" className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                {calcType === 'what_is_x_percent_of_y'
                  ? 'Total Value (Y)'
                  : calcType === 'percentage_increase' || calcType === 'percentage_decrease'
                  ? 'Final Value (Y)'
                  : 'Total / Denominator (Y)'}
              </label>
              <input
                id="input-y"
                type="number"
                inputMode="decimal"
                step="any"
                value={valY}
                onChange={(e) => setValY(e.target.value)}
                placeholder="Enter value Y"
                aria-invalid={valY.trim() !== '' && (!isFiniteY || (calcType === 'x_is_what_percent_of_y' && numY === 0)) ? 'true' : undefined}
                className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-base font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 tabular-nums"
              />
            </div>
          </div>

          {/* Result Box */}
          <div aria-live="polite" className="p-5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
              Calculated Result
            </span>
            <div className={`font-display font-extrabold tabular-nums ${!isValid && resultString ? 'text-rose-600 dark:text-rose-400 text-lg sm:text-xl' : 'text-slate-900 dark:text-white text-3xl sm:text-4xl'}`}>
              {isValid ? resultString : (resultString || '—')}
            </div>
            {isValid && explanation && (
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                {explanation}
              </p>
            )}
          </div>

          {isValid && (
            <div className="flex justify-end">
              <ShareDownloadBar
                onCopyText={explanation || resultString}
                copyLabel="Copy Result"
                textToShare={explanation || resultString}
              />
            </div>
          )}
        </div>
      </div>
    </ToolContainer>
  );
};
