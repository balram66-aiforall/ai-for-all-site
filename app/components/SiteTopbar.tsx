"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type ThemeMode = "dark" | "light";

type SiteTopbarProps = {
  theme: ThemeMode;
  onToggleTheme: () => void;
  activeItem?: string;
};

const navItems = [
  { id: "top", label: "Top", href: "/#top" },
  { id: "learn", label: "Learn", href: "/#learn" },
  { id: "guides", label: "Guides", href: "/#guides" },
  { id: "examples", label: "Examples", href: "/#community" },
  { id: "articles", label: "Articles", href: "/#articles" },
  { id: "school", label: "School", href: "/#school-of-aifa" },
  { id: "croftc", label: "CROFTC", href: "/prompting-framework" },
  { id: "projects", label: "Projects", href: "/#projects" },
  { id: "aifa", label: "AIFA", href: "/#agent" },
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
  const pathname = usePathname();
  const isHome = pathname === "/";

  const brandHref = isHome ? "#top" : "/#top";

  return (
    <nav className="topbar" aria-label="Main navigation">
      <Link className="brand" href={brandHref} aria-label="AI For All home">
        <span className="aifa-mark" aria-hidden="true">
          <span />
        </span>
        <span>AI For All</span>
      </Link>
      <div className="nav-tools">
        <div className="nav-links">
          {navItems.map((item) => (
            <Link
              key={item.id}
              className={activeItem === item.id ? "is-active" : ""}
              aria-current={activeItem === item.id ? "page" : undefined}
              href={isHome && item.href.startsWith("/#") ? item.href.slice(1) : item.href}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <button
          type="button"
          className="theme-toggle"
          aria-pressed={theme === "light"}
          onClick={onToggleTheme}
        >
          <span className="theme-toggle-icon" aria-hidden="true">
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </span>
          <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
        </button>
      </div>
    </nav>
  );
}
