import React, { useEffect, useState, useCallback } from 'react';
import { AppLogo } from './AppLogo';

interface WelcomeSplashProps {
  onComplete: () => void;
}

export const WelcomeSplash: React.FC<WelcomeSplashProps> = ({ onComplete }) => {
  const [fadingOut, setFadingOut] = useState(false);
  const [step, setStep] = useState(0);

  const finish = useCallback(() => {
    try {
      sessionStorage.setItem('phonetools_welcomed_v1', '1');
    } catch {
      // Ignore storage access issues in restricted contexts
    }
    onComplete();
  }, [onComplete]);

  const handleDismiss = useCallback(() => {
    setFadingOut(true);
    setTimeout(finish, 200);
  }, [finish]);

  useEffect(() => {
    // Check prefers-reduced-motion
    const isReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isReduced) {
      const timer = setTimeout(finish, 150);
      return () => clearTimeout(timer);
    }

    // Sequenced presentation timing (~1.8s total)
    const t1 = setTimeout(() => setStep(1), 80);    // Step 1: Logo reveal
    const t2 = setTimeout(() => setStep(2), 340);   // Step 2: "PHONE TOOLS" + Tagline
    const t3 = setTimeout(() => setStep(3), 720);   // Step 3: Attribution & Welcome badge
    const t4 = setTimeout(() => setFadingOut(true), 1550); // Step 4: Smooth fade out
    const t5 = setTimeout(finish, 1850);            // Step 5: Unmount

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        handleDismiss();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [finish, handleDismiss]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to PHONE TOOLS"
      onClick={handleDismiss}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 transition-opacity duration-300 ease-out select-none cursor-pointer ${
        fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
      }`}
    >
      <div className="relative flex flex-col items-center max-w-sm px-6 text-center">
        {/* Step 1: Layered PHONE TOOLS Logo Reveal */}
        <div
          className={`transition-all duration-500 ease-out transform ${
            step >= 1 ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-2'
          }`}
        >
          <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 shadow-md backdrop-blur-xs">
            <AppLogo className="h-16 w-16" size={64} />
          </div>
        </div>

        {/* Step 2: Product Name & Tagline */}
        <div
          className={`mt-5 transition-all duration-500 ease-out transform ${
            step >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2.5'
          }`}
        >
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            PHONE TOOLS
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
            Your everyday digital toolbox.
          </p>
        </div>

        {/* Step 3: Creator Attribution & Welcome Badge */}
        <div
          className={`mt-6 flex flex-col items-center gap-2 transition-all duration-500 ease-out transform ${
            step >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide bg-blue-50 text-blue-700 border border-blue-200/70 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-900/50">
            Welcome to PHONE TOOLS
          </span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            Built by Ashik Raj
          </span>
        </div>
      </div>
    </div>
  );
};
