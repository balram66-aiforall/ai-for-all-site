"use client";

import { useId } from "react";

type AifaMascotProps = {
  className?: string;
};

export function AifaMascot({ className }: AifaMascotProps) {
  const glowId = useId().replace(/:/g, "");

  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 220 220"
    >
      <defs>
        <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g filter={`url(#${glowId})`}>
        <path
          d="M110 24c20 0 39 14 49 35 10 22 10 52 1 76-11 30-31 51-50 51-20 0-40-18-51-46-10-24-12-56-2-80 9-23 31-36 53-36Z"
          fill="#050506"
          stroke="#f5f1e8"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path
          d="M84 121c8 3 14 10 18 19m33-19c-8 3-14 10-18 19"
          fill="none"
          stroke="#f5f1e8"
          strokeLinecap="round"
          strokeWidth="3"
        />
        <circle cx="93" cy="92" r="5" fill="#f5f1e8" />
        <circle cx="127" cy="92" r="5" fill="#f5f1e8" />
        <path
          d="M101 115h18"
          fill="none"
          stroke="#f5f1e8"
          strokeLinecap="round"
          strokeWidth="3"
        />
        <path
          d="M68 150c10 1 14 10 16 20m68-20c-10 1-14 10-16 20"
          fill="none"
          stroke="#f5f1e8"
          strokeLinecap="round"
          strokeWidth="3"
        />
        <path
          d="M78 171h21m23 0h21"
          fill="none"
          stroke="#f5f1e8"
          strokeLinecap="round"
          strokeWidth="3"
        />
        <path
          d="M58 100c-13 11-19 25-17 43m121-44c11 12 16 26 15 42"
          fill="none"
          stroke="#f5f1e8"
          strokeLinecap="round"
          strokeWidth="3"
        />
        <path
          d="M40 82c10-8 20-10 31-10m99 0c11 0 21 3 31 10"
          fill="none"
          stroke="#ff9f43"
          strokeLinecap="round"
          strokeWidth="3"
        />
      </g>
      <text
        x="110"
        y="204"
        fill="#f5f1e8"
        fontFamily="Bradley Hand, Segoe Print, Marker Felt, Comic Sans MS, cursive"
        fontSize="15"
        textAnchor="middle"
      >
        AIFA
      </text>
    </svg>
  );
}
