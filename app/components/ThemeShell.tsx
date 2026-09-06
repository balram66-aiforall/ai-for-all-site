"use client";

import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { SiteTopbar } from "./SiteTopbar";

type ThemeMode = "dark" | "light";
type ThemePhase = "idle" | "to-light" | "to-dark";

const THEME_STORAGE_KEY = "aifa-theme";

function useThemeMode() {
  return useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener("storage", onStoreChange);
      window.addEventListener("aifa-theme-change", onStoreChange);

      return () => {
        window.removeEventListener("storage", onStoreChange);
        window.removeEventListener("aifa-theme-change", onStoreChange);
      };
    },
    () =>
      window.localStorage.getItem(THEME_STORAGE_KEY) === "dark"
        ? "dark"
        : "light",
    () => "light",
  ) as ThemeMode;
}

export function ThemeShell({ children, activeItem }: { children: ReactNode; activeItem?: string }) {
  const theme = useThemeMode();
  const [themePhase, setThemePhase] = useState<ThemePhase>("idle");

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.dataset.themePhase = themePhase;

    const motionReduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (themePhase === "idle" || motionReduce) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setThemePhase("idle");
    }, 760);

    return () => window.clearTimeout(timeout);
  }, [theme, themePhase]);

  function toggleTheme() {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const nextTheme: ThemeMode = theme === "dark" ? "light" : "dark";

    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    window.dispatchEvent(new Event("aifa-theme-change"));

    if (reducedMotion) {
      setThemePhase("idle");
      return;
    }

    setThemePhase(nextTheme === "light" ? "to-light" : "to-dark");
  }

  return (
    <main
      className="site-shell"
      data-theme={theme}
      data-theme-phase={themePhase}
    >
      <div className="theme-wash" aria-hidden="true" />
      <div className="scroll-progress" aria-hidden="true" />
      <SiteTopbar theme={theme} onToggleTheme={toggleTheme} activeItem={activeItem} />
      {children}
    </main>
  );
}
