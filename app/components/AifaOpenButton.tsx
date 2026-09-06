"use client";

import type { ReactNode } from "react";

type AifaOpenButtonProps = {
  children: ReactNode;
  className?: string;
};

export function AifaOpenButton({ children, className }: AifaOpenButtonProps) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => window.dispatchEvent(new Event("aifa-assistant-open"))}
    >
      {children}
    </button>
  );
}
