import React, { useState } from 'react';
import { ToolContainer } from '../../../components/layout/ToolContainer';
import { ShareDownloadBar } from '../../../components/common/ShareDownloadBar';
import { ArrowLeftRight } from 'lucide-react';

type UnitCategory = 'length' | 'weight' | 'temperature' | 'area' | 'volume' | 'speed' | 'time';

interface UnitDef {
  id: string;
  name: string;
  symbol: string;
  toBase?: (val: number) => number;
  fromBase?: (val: number) => number;
  factor?: number; // relative to base
}

const UNIT_DATA: Record<UnitCategory, { name: string; base: string; units: UnitDef[] }> = {
  length: {
    name: 'Length',
    base: 'meter',
    units: [
      { id: 'meter', name: 'Meter', symbol: 'm', factor: 1 },
      { id: 'kilometer', name: 'Kilometer', symbol: 'km', factor: 1000 },
      { id: 'centimeter', name: 'Centimeter', symbol: 'cm', factor: 0.01 },
      { id: 'millimeter', name: 'Millimeter', symbol: 'mm', factor: 0.001 },
      { id: 'mile', name: 'Mile', symbol: 'mi', factor: 1609.344 },
      { id: 'yard', name: 'Yard', symbol: 'yd', factor: 0.9144 },
      { id: 'foot', name: 'Foot', symbol: 'ft', factor: 0.3048 },
      { id: 'inch', name: 'Inch', symbol: 'in', factor: 0.0254 },
    ],
  },
  weight: {
    name: 'Weight / Mass',
    base: 'kilogram',
    units: [
      { id: 'kilogram', name: 'Kilogram', symbol: 'kg', factor: 1 },
      { id: 'gram', name: 'Gram', symbol: 'g', factor: 0.001 },
      { id: 'milligram', name: 'Milligram', symbol: 'mg', factor: 0.000001 },
      { id: 'pound', name: 'Pound', symbol: 'lb', factor: 0.45359237 },
      { id: 'ounce', name: 'Ounce', symbol: 'oz', factor: 0.028349523125 },
      { id: 'metric_ton', name: 'Metric Ton', symbol: 't', factor: 1000 },
    ],
  },
  temperature: {
    name: 'Temperature',
    base: 'celsius',
    units: [
      {
        id: 'celsius',
        name: 'Celsius',
        symbol: '°C',
        toBase: (v) => v,
        fromBase: (v) => v,
      },
      {
        id: 'fahrenheit',
        name: 'Fahrenheit',
        symbol: '°F',
        toBase: (v) => ((v - 32) * 5) / 9,
        fromBase: (v) => (v * 9) / 5 + 32,
      },
      {
        id: 'kelvin',
        name: 'Kelvin',
        symbol: 'K',
        toBase: (v) => v - 273.15,
        fromBase: (v) => v + 273.15,
      },
    ],
  },
  area: {
    name: 'Area',
    base: 'square_meter',
    units: [
      { id: 'square_meter', name: 'Square Meter', symbol: 'm²', factor: 1 },
      { id: 'square_kilometer', name: 'Square Kilometer', symbol: 'km²', factor: 1000000 },
      { id: 'square_foot', name: 'Square Foot', symbol: 'ft²', factor: 0.092903 },
      { id: 'square_mile', name: 'Square Mile', symbol: 'mi²', factor: 2589988.11 },
      { id: 'acre', name: 'Acre', symbol: 'ac', factor: 4046.85642 },
      { id: 'hectare', name: 'Hectare', symbol: 'ha', factor: 10000 },
    ],
  },
  volume: {
    name: 'Volume',
    base: 'liter',
    units: [
      { id: 'liter', name: 'Liter', symbol: 'L', factor: 1 },
      { id: 'milliliter', name: 'Milliliter', symbol: 'mL', factor: 0.001 },
      { id: 'cubic_meter', name: 'Cubic Meter', symbol: 'm³', factor: 1000 },
      { id: 'us_gallon', name: 'US Gallon', symbol: 'gal', factor: 3.78541 },
      { id: 'us_quart', name: 'US Quart', symbol: 'qt', factor: 0.946353 },
      { id: 'us_pint', name: 'US Pint', symbol: 'pt', factor: 0.473176 },
      { id: 'us_cup', name: 'US Cup', symbol: 'cup', factor: 0.236588 },
    ],
  },
  speed: {
    name: 'Speed',
    base: 'mps',
    units: [
      { id: 'mps', name: 'Meters / Second', symbol: 'm/s', factor: 1 },
      { id: 'kph', name: 'Kilometers / Hour', symbol: 'km/h', factor: 1 / 3.6 },
      { id: 'mph', name: 'Miles / Hour', symbol: 'mph', factor: 0.44704 },
      { id: 'knot', name: 'Knot', symbol: 'kn', factor: 0.514444 },
    ],
  },
  time: {
    name: 'Time',
    base: 'second',
    units: [
      { id: 'second', name: 'Second', symbol: 's', factor: 1 },
      { id: 'minute', name: 'Minute', symbol: 'min', factor: 60 },
      { id: 'hour', name: 'Hour', symbol: 'hr', factor: 3600 },
      { id: 'day', name: 'Day', symbol: 'd', factor: 86400 },
      { id: 'week', name: 'Week', symbol: 'wk', factor: 604800 },
      { id: 'year', name: 'Year (365d)', symbol: 'yr', factor: 31536000 },
    ],
  },
};

export const UnitConverter: React.FC = () => {
  const [category, setCategory] = useState<UnitCategory>('length');
  const [inputValue, setInputValue] = useState<string>('1');
  const [fromUnitId, setFromUnitId] = useState<string>('meter');
  const [toUnitId, setToUnitId] = useState<string>('foot');

  const currentCategoryData = UNIT_DATA[category];

  const handleCategoryChange = (newCat: UnitCategory) => {
    setCategory(newCat);
    const units = UNIT_DATA[newCat].units;
    setFromUnitId(units[0].id);
    setToUnitId(units[1] ? units[1].id : units[0].id);
  };

  const handleSwap = () => {
    setFromUnitId(toUnitId);
    setToUnitId(fromUnitId);
  };

  const convert = (val: number, fromId: string, toId: string): number => {
    if (!Number.isFinite(val) || Math.abs(val) > 1e18) return 0;
    const fromDef = currentCategoryData.units.find((u) => u.id === fromId);
    const toDef = currentCategoryData.units.find((u) => u.id === toId);
    if (!fromDef || !toDef) return 0;

    let baseVal = 0;
    if (fromDef.toBase) {
      baseVal = fromDef.toBase(val);
    } else if (fromDef.factor) {
      baseVal = val * fromDef.factor;
    }

    let targetVal = 0;
    if (toDef.fromBase) {
      targetVal = toDef.fromBase(baseVal);
    } else if (toDef.factor) {
      targetVal = baseVal / toDef.factor;
    }

    return Number.isFinite(targetVal) ? targetVal : 0;
  };

  const num = parseFloat(inputValue);
  const isInputEmpty = !inputValue.trim();
  const isOutOfRange = Number.isFinite(num) && Math.abs(num) > 1e18;
  const isValidNumber = Number.isFinite(num) && !isOutOfRange;
  const result = isValidNumber ? convert(num, fromUnitId, toUnitId) : 0;

  const formatResult = (n: number) => {
    if (!Number.isFinite(n)) return '0';
    if (Math.abs(n) >= 1e9 || (Math.abs(n) <= 1e-6 && n !== 0)) {
      return n.toExponential(6);
    }
    const fixed = parseFloat(n.toFixed(6));
    return fixed.toLocaleString(undefined, { maximumFractionDigits: 6 });
  };

  const fromDef = currentCategoryData.units.find((u) => u.id === fromUnitId);
  const toDef = currentCategoryData.units.find((u) => u.id === toUnitId);

  const displayResult = isInputEmpty
    ? '—'
    : isOutOfRange
    ? 'Out of range'
    : formatResult(result);

  const summary = isValidNumber
    ? `${inputValue} ${fromDef?.symbol || ''} = ${displayResult} ${toDef?.symbol || ''}`
    : '';

  return (
    <ToolContainer
      toolId="unit-converter"
      onReset={() => {
        setInputValue('1');
        handleCategoryChange('length');
      }}
      canReset={true}
    >
      <div className="space-y-6">
        {/* Category Picker */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <label className="font-display text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Select Unit Category
          </label>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {(Object.keys(UNIT_DATA) as UnitCategory[]).map((catKey) => {
              const isSelected = category === catKey;
              return (
                <button
                  key={catKey}
                  onClick={() => handleCategoryChange(catKey)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    isSelected
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {UNIT_DATA[catKey].name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Converter Card */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-5 items-center gap-3">
            {/* From */}
            <div className="md:col-span-2 space-y-2">
              <label htmlFor="unit-from-input" className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                From
              </label>
              <input
                id="unit-from-input"
                type="number"
                step="any"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-base font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 tabular-nums"
              />
              <select
                value={fromUnitId}
                onChange={(e) => setFromUnitId(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {currentCategoryData.units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.symbol})
                  </option>
                ))}
              </select>
            </div>

            {/* Swap Button */}
            <div className="md:col-span-1 flex justify-center py-1">
              <button
                onClick={handleSwap}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/40 text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors shadow-xs"
                title="Swap units"
              >
                <ArrowLeftRight className="h-5 w-5" />
              </button>
            </div>

            {/* To */}
            <div className="md:col-span-2 space-y-2">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                To
              </span>
              <div className="w-full h-12 px-4 flex items-center rounded-xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200/80 dark:border-teal-900/40 text-base font-extrabold text-teal-800 dark:text-teal-200 tabular-nums truncate">
                {displayResult}
              </div>
              <select
                value={toUnitId}
                onChange={(e) => setToUnitId(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {currentCategoryData.units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Formula: 1 {fromDef?.symbol} = {formatResult(convert(1, fromUnitId, toUnitId))} {toDef?.symbol}
            </span>
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
