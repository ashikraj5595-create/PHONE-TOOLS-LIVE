import React, { useState, useEffect, useCallback } from 'react';
import { ToolContainer } from '../../../components/layout/ToolContainer';
import { ShareDownloadBar } from '../../../components/common/ShareDownloadBar';
import { RotateCw, ShieldCheck, Check } from 'lucide-react';
import { getSecureRandomInt, clampNumber } from '../../../lib/security';

export const PasswordGenerator: React.FC = () => {
  const [length, setLength] = useState<number>(16);
  const [includeUpper, setIncludeUpper] = useState<boolean>(true);
  const [includeLower, setIncludeLower] = useState<boolean>(true);
  const [includeNumbers, setIncludeNumbers] = useState<boolean>(true);
  const [includeSymbols, setIncludeSymbols] = useState<boolean>(true);
  const [password, setPassword] = useState<string>('');

  const generatePassword = useCallback(() => {
    let charset = '';
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (includeUpper) charset += upper;
    if (includeLower) charset += lower;
    if (includeNumbers) charset += numbers;
    if (includeSymbols) charset += symbols;

    if (!charset) {
      setPassword('');
      return;
    }

    const safeLength = clampNumber(length, 6, 48, 16);
    let generated = '';

    try {
      for (let i = 0; i < safeLength; i++) {
        const randIndex = getSecureRandomInt(charset.length);
        generated += charset[randIndex];
      }
      setPassword(generated);
    } catch {
      setPassword('');
    }
  }, [length, includeUpper, includeLower, includeNumbers, includeSymbols]);

  useEffect(() => {
    generatePassword();
  }, [generatePassword]);

  // Entropy & strength evaluation
  const evaluateStrength = (pwd: string) => {
    if (!pwd) return { label: 'Empty', score: 0, color: 'bg-slate-300' };
    let pool = 0;
    if (/[a-z]/.test(pwd)) pool += 26;
    if (/[A-Z]/.test(pwd)) pool += 26;
    if (/[0-9]/.test(pwd)) pool += 10;
    if (/[^a-zA-Z0-9]/.test(pwd)) pool += 30;

    const entropy = pwd.length * Math.log2(pool || 1);

    if (entropy < 35) return { label: 'Weak', score: 1, color: 'bg-rose-500' };
    if (entropy < 55) return { label: 'Fair', score: 2, color: 'bg-amber-500' };
    if (entropy < 75) return { label: 'Good', score: 3, color: 'bg-blue-500' };
    if (entropy < 90) return { label: 'Strong', score: 4, color: 'bg-emerald-500' };
    return { label: 'Very Strong', score: 5, color: 'bg-emerald-600' };
  };

  const strength = evaluateStrength(password);

  const options = [
    {
      label: 'Uppercase Letters (A-Z)',
      checked: includeUpper,
      onChange: () => setIncludeUpper(!includeUpper),
    },
    {
      label: 'Lowercase Letters (a-z)',
      checked: includeLower,
      onChange: () => setIncludeLower(!includeLower),
    },
    {
      label: 'Numbers (0-9)',
      checked: includeNumbers,
      onChange: () => setIncludeNumbers(!includeNumbers),
    },
    {
      label: 'Special Symbols (!@#$%...)',
      checked: includeSymbols,
      onChange: () => setIncludeSymbols(!includeSymbols),
    },
  ];

  return (
    <ToolContainer
      toolId="password-generator"
      onReset={() => {
        setLength(16);
        setIncludeUpper(true);
        setIncludeLower(true);
        setIncludeNumbers(true);
        setIncludeSymbols(true);
        generatePassword();
      }}
      canReset={true}
    >
      <div className="space-y-6">
        {/* Generated Password Box */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Generated Password
            </span>
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>crypto.getRandomValues</span>
            </span>
          </div>

          <div className="relative flex items-center">
            <input
              type="text"
              readOnly
              value={password}
              placeholder="Select at least one character type"
              className="w-full h-14 pl-4 pr-14 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-mono text-base sm:text-lg font-bold text-slate-900 dark:text-white focus:outline-none tracking-wider select-all"
            />
            <button
              onClick={generatePassword}
              className="absolute right-2 h-10 w-10 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Regenerate password"
              aria-label="Regenerate password"
            >
              <RotateCw className="h-5 w-5" />
            </button>
          </div>

          {/* Strength Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Strength:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {strength.label}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1.5 h-1.5">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={`rounded-full transition-colors ${
                    level <= strength.score ? strength.color : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <ShareDownloadBar
              onCopyText={password}
              copyLabel="Copy Password"
              textToShare={password}
            />
          </div>
        </div>

        {/* Options & Settings */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5">
          {/* Length Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="pwd-length" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Password Length
              </label>
              <span className="font-mono text-sm font-bold text-slate-900 dark:text-white px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">
                {length} chars
              </span>
            </div>
            <input
              id="pwd-length"
              type="range"
              min="6"
              max="48"
              value={length}
              onChange={(e) => setLength(parseInt(e.target.value, 10))}
              className="w-full accent-fuchsia-600 h-2 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>6</span>
              <span>16</span>
              <span>24</span>
              <span>32</span>
              <span>48</span>
            </div>
          </div>

          {/* Character Type Toggles */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Character Sets
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {options.map((opt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={opt.onChange}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                    opt.checked
                      ? 'border-fuchsia-500/40 bg-fuchsia-50/30 dark:bg-fuchsia-950/20 text-slate-900 dark:text-white'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-500'
                  }`}
                >
                  <div
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                      opt.checked
                        ? 'border-fuchsia-600 bg-fuchsia-600 text-white'
                        : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                    }`}
                  >
                    {opt.checked && <Check className="h-3.5 w-3.5" />}
                  </div>
                  <span className="text-xs sm:text-sm font-semibold">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ToolContainer>
  );
};
