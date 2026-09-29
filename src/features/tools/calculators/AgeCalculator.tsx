import React, { useState } from 'react';
import { ToolContainer } from '../../../components/layout/ToolContainer';
import { ShareDownloadBar } from '../../../components/common/ShareDownloadBar';
import { Calendar, AlertCircle } from 'lucide-react';

type AgeResult =
  | { success: false; error: string }
  | {
      success: true;
      years: number;
      months: number;
      days: number;
      totalDays: number;
      totalWeeks: number;
      totalHours: number;
      daysToNextBday: number;
    };

interface ParsedCalendarDate {
  year: number;
  month: number;
  day: number;
  date: Date;
}

const parseCalendarDate = (dateStr: string): ParsedCalendarDate | null => {
  if (!dateStr) return null;
  const parts = dateStr.split('-');
  if (parts.length !== 3) return null;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
  // Use local midday to avoid any daylight saving shift boundaries
  const date = new Date(year, month - 1, day, 12, 0, 0);
  if (isNaN(date.getTime())) return null;
  return { year, month, day, date };
};

const getLocalTodayString = (): string => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const AgeCalculator: React.FC = () => {
  const todayStr = getLocalTodayString();
  const [dob, setDob] = useState<string>('1998-05-15');
  const [targetDate, setTargetDate] = useState<string>(todayStr);

  const calculateAge = (): AgeResult | null => {
    if (!dob || !targetDate) return null;

    const birth = parseCalendarDate(dob);
    const target = parseCalendarDate(targetDate);

    if (!birth || !target) return null;

    if (birth.year < 1900 || birth.year > 2200 || target.year < 1900 || target.year > 2200) {
      return { success: false, error: 'Please enter a valid year between 1900 and 2200.' };
    }

    if (birth.date.getTime() > target.date.getTime()) {
      return { success: false, error: 'Date of birth cannot be after the calculation date.' };
    }

    let years = target.year - birth.year;
    let months = target.month - birth.month;
    let days = target.day - birth.day;

    if (days < 0) {
      months -= 1;
      const prevMonthDays = new Date(target.year, target.month - 1, 0).getDate();
      days += prevMonthDays;
    }

    if (months < 0) {
      years -= 1;
      months += 12;
    }

    const diffMs = target.date.getTime() - birth.date.getTime();
    const totalDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const totalHours = totalDays * 24;

    // Next birthday calculation
    const nextBday = new Date(target.year, birth.month - 1, birth.day, 12, 0, 0);
    if (nextBday.getTime() < target.date.getTime()) {
      nextBday.setFullYear(target.year + 1);
    }
    const daysToNextBday = Math.round((nextBday.getTime() - target.date.getTime()) / (1000 * 60 * 60 * 24));

    return {
      success: true,
      years,
      months,
      days,
      totalDays,
      totalWeeks,
      totalHours,
      daysToNextBday,
    };
  };

  const result = calculateAge();

  const handleReset = () => {
    setDob('2000-01-01');
    setTargetDate(todayStr);
  };

  const summary = result && result.success
    ? `Age: ${result.years} years, ${result.months} months, ${result.days} days (${result.totalDays.toLocaleString()} total days)`
    : '';

  return (
    <ToolContainer toolId="age-calculator" onReset={handleReset} canReset={true}>
      <div className="space-y-6">
        {/* Date Inputs */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="dob-input" className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-amber-500" />
                <span>Date of Birth</span>
              </label>
              <input
                id="dob-input"
                type="date"
                value={dob}
                max={targetDate}
                onChange={(e) => setDob(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="target-date" className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-amber-500" />
                <span>Age as of Date</span>
              </label>
              <input
                id="target-date"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {result && !result.success ? (
            <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{result.error}</span>
            </div>
          ) : result && result.success ? (
            <div className="space-y-4 pt-2">
              {/* Primary Age Display */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
                <div className="p-3.5 sm:p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                    Years
                  </span>
                  <p className="font-display text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-1 tabular-nums">
                    {result.years}
                  </p>
                </div>
                <div className="p-3.5 sm:p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                    Months
                  </span>
                  <p className="font-display text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-1 tabular-nums">
                    {result.months}
                  </p>
                </div>
                <div className="p-3.5 sm:p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                    Days
                  </span>
                  <p className="font-display text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-1 tabular-nums">
                    {result.days}
                  </p>
                </div>
              </div>

              {/* Extended Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-400">Total Days</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 tabular-nums">
                    {result.totalDays.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-400">Total Weeks</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 tabular-nums">
                    {result.totalWeeks.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-400">Total Hours</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 tabular-nums">
                    {result.totalHours.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-400">Next Birthday</span>
                  <p className="font-semibold text-amber-600 dark:text-amber-400 mt-0.5 tabular-nums">
                    in {result.daysToNextBday} days
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <ShareDownloadBar
                  onCopyText={summary}
                  copyLabel="Copy Age Summary"
                  textToShare={summary}
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </ToolContainer>
  );
};
