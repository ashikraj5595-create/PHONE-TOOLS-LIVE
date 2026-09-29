import React, { useState } from 'react';
import { ToolContainer } from '../../../components/layout/ToolContainer';
import { ShareDownloadBar } from '../../../components/common/ShareDownloadBar';

type StorageStandard = 'decimal' | 'binary';

interface StorageUnit {
  id: string;
  name: string;
  symbol: string;
  power: number; // power of 1000 or 1024
}

const STORAGE_UNITS: StorageUnit[] = [
  { id: 'b', name: 'Bit', symbol: 'b', power: -1 }, // special handling (1 byte = 8 bits)
  { id: 'B', name: 'Byte', symbol: 'B', power: 0 },
  { id: 'K', name: 'Kilobyte', symbol: 'KB', power: 1 },
  { id: 'M', name: 'Megabyte', symbol: 'MB', power: 2 },
  { id: 'G', name: 'Gigabyte', symbol: 'GB', power: 3 },
  { id: 'T', name: 'Terabyte', symbol: 'TB', power: 4 },
];

export const DataStorageConverter: React.FC = () => {
  const [amount, setAmount] = useState<string>('1');
  const [selectedUnit, setSelectedUnit] = useState<string>('G');
  const [standard, setStandard] = useState<StorageStandard>('decimal');

  const rawAmount = parseFloat(amount);
  const parsedAmount = Number.isFinite(rawAmount) && rawAmount >= 0 ? Math.min(rawAmount, 1e15) : 0;
  const baseFactor = standard === 'decimal' ? 1000 : 1024;

  // Convert input value to total bytes
  const getBytesFromInput = (): number => {
    if (selectedUnit === 'b') {
      return parsedAmount / 8;
    }
    const unit = STORAGE_UNITS.find((u) => u.id === selectedUnit);
    if (!unit) return 0;
    return parsedAmount * Math.pow(baseFactor, unit.power);
  };

  const totalBytes = getBytesFromInput();

  const formatStorage = (bytes: number, targetUnit: StorageUnit, factor: number): string => {
    if (targetUnit.id === 'b') {
      const bits = bytes * 8;
      return bits.toLocaleString(undefined, { maximumFractionDigits: 4 });
    }
    const val = bytes / Math.pow(factor, targetUnit.power);
    if (val === 0) return '0';
    if (Math.abs(val) < 0.000001) return val.toExponential(4);
    return val.toLocaleString(undefined, { maximumFractionDigits: 4 });
  };

  const handleReset = () => {
    setAmount('1');
    setSelectedUnit('G');
    setStandard('decimal');
  };

  const currentUnitObj = STORAGE_UNITS.find((u) => u.id === selectedUnit);
  const summary = `${amount} ${currentUnitObj?.symbol || ''} (${standard}) = ${totalBytes.toLocaleString()} bytes`;

  return (
    <ToolContainer toolId="data-storage-converter" onReset={handleReset} canReset={true}>
      <div className="space-y-6">
        {/* Standard Selector & Explainer */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="font-display text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Storage Standard
            </span>
            <span className="text-xs text-slate-500">
              {standard === 'decimal' ? 'SI Standard (1000)' : 'IEC Binary Standard (1024)'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={() => setStandard('decimal')}
              className={`p-3 rounded-xl border text-left transition-all ${
                standard === 'decimal'
                  ? 'border-teal-500 bg-teal-50/40 dark:bg-teal-950/30 text-teal-900 dark:text-teal-100 shadow-xs'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400'
              }`}
            >
              <p className="font-bold text-xs sm:text-sm">Decimal (Base 10)</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                1 KB = 1,000 Bytes (Hard drives, telecom, macOS)
              </p>
            </button>

            <button
              onClick={() => setStandard('binary')}
              className={`p-3 rounded-xl border text-left transition-all ${
                standard === 'binary'
                  ? 'border-teal-500 bg-teal-50/40 dark:bg-teal-950/30 text-teal-900 dark:text-teal-100 shadow-xs'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400'
              }`}
            >
              <p className="font-bold text-xs sm:text-sm">Binary (Base 2)</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                1 KiB = 1,024 Bytes (RAM, operating system storage, Windows)
              </p>
            </button>
          </div>
        </div>

        {/* Amount & Unit Input */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1.5">
              <label htmlFor="storage-amount" className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Quantity
              </label>
              <input
                id="storage-amount"
                type="number"
                step="any"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-base font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 tabular-nums"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="storage-unit" className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Unit
              </label>
              <select
                id="storage-unit"
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                className="w-full h-12 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {STORAGE_UNITS.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Full Breakdown Table */}
          <div className="pt-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
              Equivalent Storage Breakdown
            </span>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
              {STORAGE_UNITS.map((u) => {
                const decimalVal = formatStorage(totalBytes, u, 1000);
                const binaryVal = formatStorage(totalBytes, u, 1024);
                const isSelected = selectedUnit === u.id;

                return (
                  <div
                    key={u.id}
                    className={`flex items-center justify-between p-3 text-xs sm:text-sm ${
                      isSelected
                        ? 'bg-teal-50/60 dark:bg-teal-950/20 font-semibold'
                        : 'bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white min-w-[36px]">
                        {u.symbol}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 text-xs">
                        {u.name}
                      </span>
                    </div>

                    <div className="text-right tabular-nums">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {standard === 'decimal' ? decimalVal : binaryVal}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {standard === 'decimal'
                          ? `(Binary: ${binaryVal})`
                          : `(Decimal: ${decimalVal})`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <ShareDownloadBar
              onCopyText={summary}
              copyLabel="Copy Conversion"
              textToShare={summary}
            />
          </div>
        </div>
      </div>
    </ToolContainer>
  );
};
