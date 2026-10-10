"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

/* eslint-disable @next/next/no-html-link-for-pages -- Plain anchors keep the shared nav from loading router code on the homepage. */

type ThemeMode = "dark" | "light";

type SiteTopbarProps = {
  theme: ThemeMode;
  onToggleTheme: () => void;
  activeItem?: string;
};

const navItems = [
  { id: "learn", label: "Learn", href: "/#learn" },
  { id: "guides", label: "Guides", href: "/#guides" },
  { id: "training", label: "Training", href: "/#training" },
  { id: "articles", label: "Articles", href: "/#articles" },
  { id: "croftc", label: "School", href: "/prompting-framework" },
  { id: "projects", label: "Projects", href: "/#projects" },
  { id: "contact", label: "Contact", href: "/#contact" },
] as const;

function SunIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 2.8v2.7M12 18.5v2.7M4.2 4.2l1.9 1.9M17.9 17.9l1.9 1.9M2.8 12h2.7M18.5 12h2.7M4.2 19.8l1.9-1.9M17.9 6.1l1.9-1.9" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M15.5 3.8A8.8 8.8 0 1 0 20.2 15.5 8.2 8.2 0 1 1 15.5 3.8Z" />
    </svg>
  );
}

export function SiteTopbar({ theme, onToggleTheme, activeItem }: SiteTopbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [section, setSection] = useState("");
  const reduceMotion = useReducedMotion();
  useEffect(() => {
    if (activeItem) return;
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting);
      if (visible.length) setSection(visible[0].target.id);
    }, { rootMargin: "-15% 0px -60% 0px" });
    navItems.forEach(item => {
      const node = document.getElementById(item.id);
      if (node) observer.observe(node);
    });
    return () => observer.disconnect();
  }, [activeItem]);

  return (
    <motion.nav
      className="topbar"
      aria-label="Main navigation"
      initial={reduceMotion ? false : { y: -42, opacity: 0, scale: 0.985 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
      onKeyDown={event => {
        if (event.key === "Escape") {
          setMenuOpen(false);
          document.getElementById("site-menu-toggle")?.focus();
        }
      }}
    >
      <motion.a
        className="brand"
        href="/#top"
        aria-label="AI For All home"
        whileHover={reduceMotion ? undefined : { scale: 1.06, rotate: 1.5 }}
        whileTap={reduceMotion ? undefined : { scale: 0.97 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <span className="aifa-mark" aria-hidden="true">
          <span />
        </span>
        <span>AI For All</span>
      </motion.a>
      <div className="nav-tools">
        <button id="site-menu-toggle" className="menu-toggle" type="button" aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} aria-controls="site-navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
        <div id="site-navigation" className={`nav-links${menuOpen ? " is-open" : ""}`}>
          {navItems.map((item, index) => (
            <motion.a
              key={item.id}
              className={(activeItem ?? section) === item.id ? "is-active" : ""}
              aria-current={(activeItem ?? section) === item.id ? activeItem ? "page" : "location" : undefined}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              initial={reduceMotion ? false : { opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reduceMotion ? { duration: 0 } : { delay: 0.08 * index, duration: 0.42, ease: "easeOut" }}
            >
              {item.label}
            </motion.a>
          ))}
        </div>
        <motion.button
          type="button"
          className="theme-toggle"
          aria-pressed={theme === "light"}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          title={theme === "dark" ? "Light mode" : "Dark mode"}
          onClick={onToggleTheme}
          whileHover={reduceMotion ? undefined : { scale: 1.06 }}
          whileTap={reduceMotion ? undefined : { scale: 0.97 }}
        >
          <span className="theme-toggle-icon" aria-hidden="true">
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </span>
          <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
        </motion.button>
      </div>
    </motion.nav>
  );
}
