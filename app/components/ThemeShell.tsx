"use client";

import { useEffect, useState, useSyncExternalStore, type ReactNode, type MouseEvent } from "react";
import { SiteTopbar } from "./SiteTopbar";

type ThemeMode = "dark" | "light";
type ThemePhase = "idle" | "to-light" | "to-dark";

const THEME_STORAGE_KEY = "aifa-theme";
let memoryTheme: ThemeMode = "light";

function readTheme(): ThemeMode {
  try { return window.localStorage.getItem(THEME_STORAGE_KEY) === "dark" ? "dark" : "light"; }
  catch { return memoryTheme; }
}

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
    readTheme,
    () => "light",
  ) as ThemeMode;
}

export function ThemeShell({ children, activeItem }: { children: ReactNode; activeItem?: string }) {
  const theme = useThemeMode();
  const [themePhase, setThemePhase] = useState<ThemePhase>("idle");

  useEffect(() => {
    const headings = document.querySelectorAll<HTMLElement>(".section-heading, .shelf-copy, .training-lead, .about-copy, .contact-copy");
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("has-entered");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0, rootMargin: "0px 0px -24px 0px" });
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      headings.forEach(heading => {
        if (heading.getBoundingClientRect().top > innerHeight) heading.classList.add("scroll-reveal");
        observer.observe(heading);
      });
    }
    return () => {
      observer.disconnect();
      headings.forEach(heading => heading.classList.remove("scroll-reveal"));
    };
  }, []);

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

    memoryTheme = nextTheme;
    try { window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme); } catch { /* Private storage can be unavailable. */ }
    window.dispatchEvent(new Event("aifa-theme-change"));

    if (reducedMotion) {
      setThemePhase("idle");
      return;
    }

    setThemePhase(nextTheme === "light" ? "to-light" : "to-dark");
  }

  function followSection(event: MouseEvent<HTMLElement>) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = (event.target as Element).closest<HTMLAnchorElement>("a[href]");
    if (!link || link.target || link.hasAttribute("download")) return;
    const url = new URL(link.href);
    if (url.origin !== location.origin || url.pathname !== location.pathname || url.search !== location.search || !url.hash) return;
    const destination = document.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (!destination) return;
    event.preventDefault();
    if (location.hash !== url.hash) history.pushState(null, "", url.hash);
    destination.tabIndex = -1;
    destination.focus({ preventScroll: true });
    destination.scrollIntoView({ block: "start", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches || event.detail === 0 ? "auto" : "smooth" });
  }

  return (
    <main
      className="site-shell"
      data-theme={theme}
      data-theme-phase={themePhase}
      onClick={followSection}
    >
      <div className="theme-wash" aria-hidden="true" />
      <div className="scroll-progress" aria-hidden="true" />
      <a className="skip-link" href="#page-content">Skip to content</a>
      <SiteTopbar theme={theme} onToggleTheme={toggleTheme} activeItem={activeItem} />
      <div id="page-content" tabIndex={-1} />
      {children}
    </main>
  );
}
