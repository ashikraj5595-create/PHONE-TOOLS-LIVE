import React, { useState } from 'react';
import { ToolContainer } from '../../../components/layout/ToolContainer';
import { ShareDownloadBar } from '../../../components/common/ShareDownloadBar';

export const DiscountCalculator: React.FC = () => {
  const [originalPrice, setOriginalPrice] = useState<string>('99.99');
  const [discountPercent, setDiscountPercent] = useState<string>('25');

  const rawPrice = parseFloat(originalPrice);
  const price = Number.isFinite(rawPrice) && rawPrice >= 0 ? Math.min(rawPrice, 1e12) : 0;
  const rawDiscount = parseFloat(discountPercent);
  const discount = Number.isFinite(rawDiscount) ? Math.min(Math.max(rawDiscount, 0), 100) : 0;

  const discountAmount = (price * Math.min(Math.max(discount, 0), 100)) / 100;
  const finalPrice = Math.max(price - discountAmount, 0);

  const presets = [10, 15, 20, 25, 30, 40, 50, 70];

  const isPriceInvalid = originalPrice.trim() !== '' && (!Number.isFinite(rawPrice) || rawPrice < 0);
  const isDiscountInvalid = discountPercent.trim() !== '' && (!Number.isFinite(rawDiscount) || rawDiscount < 0 || rawDiscount > 100);

  const summaryText = `Original: $${price.toFixed(2)} | Discount (${discount}%): -$${discountAmount.toFixed(2)} | Final: $${finalPrice.toFixed(2)}`;

  return (
    <ToolContainer
      toolId="discount-calculator"
      onReset={() => {
        setOriginalPrice('100');
        setDiscountPercent('20');
      }}
      canReset={true}
    >
      <div className="space-y-6">
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5">
          {/* Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="original-price" className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Original Price ($)
              </label>
              <input
                id="original-price"
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                placeholder="e.g. 99.99"
                aria-invalid={isPriceInvalid ? 'true' : undefined}
                className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-base font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 tabular-nums"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="discount-pct" className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Discount Percentage (%)
              </label>
              <input
                id="discount-pct"
                type="number"
                inputMode="decimal"
                min="0"
                max="100"
                step="any"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                placeholder="e.g. 25"
                aria-invalid={isDiscountInvalid ? 'true' : undefined}
                className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-base font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 tabular-nums"
              />
            </div>
          </div>

          {/* Quick Discount Presets */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Quick Percentage Presets
            </span>
            <div className="flex flex-wrap gap-1.5">
              {presets.map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setDiscountPercent(pct.toString())}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    parseFloat(discountPercent) === pct
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {pct}% OFF
                </button>
              ))}
            </div>
          </div>

          {/* Results Summary Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 text-center">
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                You Save
              </span>
              <p className="font-display text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-1 tabular-nums">
                ${discountAmount.toFixed(2)}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                ({discount}% reduction)
              </p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/40 text-center">
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                Final Price
              </span>
              <p className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1 tabular-nums">
                ${finalPrice.toFixed(2)}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Original: ${price.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <ShareDownloadBar
              onCopyText={summaryText}
              copyLabel="Copy Summary"
              textToShare={summaryText}
            />
          </div>
        </div>
      </div>
    </ToolContainer>
  );
};
