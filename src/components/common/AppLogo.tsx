import React from 'react';

interface AppLogoProps {
  className?: string;
  size?: number;
}

export const AppLogo: React.FC<AppLogoProps> = ({ className = 'h-8 w-8', size }) => {
  const style = size ? { width: size, height: size } : undefined;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      fill="none"
      style={style}
      className={`shrink-0 select-none ${className}`}
      aria-hidden="true"
    >
      <defs>
        {/* Background Gradient */}
        <linearGradient id="ptHeaderBgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1E293B" />
          <stop offset="100%" stopColor="#090D16" />
        </linearGradient>

        {/* Smartphone Body Gradient */}
        <linearGradient id="ptHeaderPhoneGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#CBD5E1" />
        </linearGradient>

        {/* Tool Accent Gradient */}
        <linearGradient id="ptHeaderToolGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
      </defs>

      {/* App Icon Squircle Container */}
      <rect
        width="100"
        height="100"
        rx="22"
        fill="url(#ptHeaderBgGrad)"
        stroke="rgba(255,255,255,0.14)"
        strokeWidth="1.5"
      />

      {/* Smartphone Outer Shell */}
      <rect
        x="28"
        y="15"
        width="44"
        height="70"
        rx="10"
        fill="#0B1120"
        stroke="url(#ptHeaderPhoneGrad)"
        strokeWidth="3.5"
      />

      {/* Smartphone Top Pill Speaker */}
      <rect x="43" y="20.5" width="14" height="2.5" rx="1.25" fill="#94A3B8" />

      {/* Smartphone Screen Area Subtle Backdrop */}
      <rect x="32" y="26" width="36" height="49" rx="4" fill="#0F172A" />

      {/* Center Tool: Sleek Precision Diagonal Wrench */}
      <g transform="translate(50, 50) rotate(-40) translate(-50, -50)">
        {/* Wrench Open Head */}
        <path
          d="M 44.5 32 C 40 35 39 42 42.5 47 L 47 62 C 47.5 63.5 48.5 64.5 50 64.5 C 51.5 64.5 52.5 63.5 53 62 L 57.5 47 C 61 42 60 35 55.5 32 L 53 37 C 51.5 38 48.5 38 47 37 Z"
          fill="url(#ptHeaderToolGrad)"
        />
        {/* Wrench Bottom Ring */}
        <circle cx="50" cy="65" r="5" fill="url(#ptHeaderToolGrad)" />
        <circle cx="50" cy="65" r="2.2" fill="#0F172A" />

        {/* Center Spine Highlight */}
        <path
          d="M 50 42 L 50 59"
          stroke="#93C5FD"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.8"
        />
      </g>

      {/* Phone Bottom Navigation Bar */}
      <rect x="42" y="78" width="16" height="2" rx="1" fill="#64748B" />
    </svg>
  );
};
