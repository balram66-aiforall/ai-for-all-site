"use client";
/* eslint-disable @next/next/no-html-link-for-pages -- Existing pages intentionally remain outside this isolated prototype. */
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Boxes,
  ChartNoAxesColumn,
  Check,
  Copy,
  GraduationCap,
  Handshake,
  ListChecks,
  Moon,
  PenLine,
  Search,
  Sun,
  Users,
  WandSparkles,
  X,
} from "lucide-react";
import { guideWorkflows } from "../guide-workflows";
import { roleGuides } from "../site-content";
import { aiProjects, articles } from "./content";

/* ---------- Data ---------- */

const sections: [string, string, LucideIcon][] = [
  ["Learn", "learn", GraduationCap],
  ["Practice", "practice", PenLine],
  ["Build", "build", Boxes],
  ["Read", "read", BookOpen],
];

const roleIcons: Record<string, LucideIcon> = {
  managers: Users,
  operations: ListChecks,
  analysts: ChartNoAxesColumn,
  "client-teams": Handshake,
};

const tileTones = ["sky", "paper", "sun", "ink"];

type Resource = { title: string; summary: string; kind: string; href: string };

const resources: Resource[] = [
  ...roleGuides.map((g) => ({
    title: g.title,
    summary: `${g.summary} ${guideWorkflows[g.slug]?.prompt ?? ""}`,
    kind: "Role guide",
    href: `/guides/${g.slug}`,
  })),
  {
    title: "CROFTC prompt builder",
    summary: "Context Role Objective Format Tone Constraints",
    kind: "Interactive class",
    href: "/prompting-framework#builder",
  },
  ...articles.map((a) => ({ title: a.title, summary: a.summary, kind: "LinkedIn article", href: a.href })),
  ...aiProjects.map((p) => ({ title: p.title, summary: p.summary, kind: "Project", href: p.href })),
];

const askTopics: [string, string, string][] = [
  ["guides", "Role guides", "Role guide"],
  ["prompt", "Better prompts", "Interactive class"],
  ["build", "Building projects", "Project"],
];

/* ---------- Local storage hook ---------- */

const STORAGE_EVENT = "playground-storage";
const memory: Record<string, string> = {};

function subscribe(notify: () => void) {
  window.addEventListener("storage", notify);
  window.addEventListener(STORAGE_EVENT, notify);
  return () => {
    window.removeEventListener("storage", notify);
    window.removeEventListener(STORAGE_EVENT, notify);
  };
}

function useLocalValue(key: string, fallback: string) {
  const value = useSyncExternalStore(
    subscribe,
    () => {
      try {
        return localStorage.getItem(key) ?? memory[key] ?? fallback;
      } catch {
        return memory[key] ?? fallback;
      }
    },
    () => fallback,
  );
  const set = (next: string) => {
    memory[key] = next;
    try {
      localStorage.setItem(key, next);
    } catch {}
    window.dispatchEvent(new Event(STORAGE_EVENT));
  };
  return [value, set] as const;
}

/* ---------- Pieces ---------- */

function Wordmark() {
  return (
    <a href="#top" className="pg-wordmark" aria-label="AI For All home">
      <span className="pg-wordmark-mark" aria-hidden="true">
        AI
      </span>
      <span>For All</span>
    </a>
  );
}

function TryItTile() {
  const slugs = Object.keys(guideWorkflows);
  const [role, setRole] = useState(slugs[0]);
  const [clear, setClear] = useState(false);
  const [status, setStatus] = useState("");
  const item = guideWorkflows[role];
  const text = clear ? item.output : item.input;

  function pick(slug: string) {
    setRole(slug);
    setClear(false);
    setStatus("");
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setStatus("Copied.");
    } catch {
      setStatus("Copy is unavailable. Select the text to copy it.");
    }
  }

  return (
    <div className="pg-tryit" aria-label="Try it on your role" role="region">
      <div className="pg-tryit-head">
        <span className="pg-tag">
          <WandSparkles size={15} aria-hidden="true" /> Try it on your role
        </span>
        <span className="pg-tryit-meta">{item.minutes} min</span>
      </div>

      <div className="pg-chips" role="group" aria-label="Choose your role">
        {slugs.map((slug) => (
          <button key={slug} type="button" aria-pressed={role === slug} onClick={() => pick(slug)}>
            {guideWorkflows[slug].role}
          </button>
        ))}
      </div>

      <h2 className="pg-tryit-task">{item.task}</h2>

      <div className="pg-segment" role="group" aria-label="Example view">
        <button type="button" aria-pressed={!clear} onClick={() => setClear(false)}>
          Rough notes
        </button>
        <button type="button" aria-pressed={clear} onClick={() => setClear(true)}>
          Clear output
        </button>
        <span className="pg-segment-thumb" data-on={clear ? "right" : "left"} aria-hidden="true" />
      </div>

      <div className={`pg-prompt-card${clear ? " is-clear" : ""}`} key={`${role}-${clear}`}>
        <span className="pg-prompt-label">{clear ? "Review before using" : "Start with context"}</span>
        <pre>{text}</pre>
      </div>

      <div className="pg-tryit-actions">
        {clear ? (
          <button type="button" className="pg-btn pg-btn-sun" onClick={copy}>
            {status === "Copied." ? <Check size={18} aria-hidden="true" /> : <Copy size={18} aria-hidden="true" />}
            Copy output
          </button>
        ) : (
          <button type="button" className="pg-btn pg-btn-sun" onClick={() => setClear(true)}>
            <WandSparkles size={18} aria-hidden="true" /> Make it clear
          </button>
        )}
        <a className="pg-btn pg-btn-ghost" href={`/guides/${role}`}>
          Open the guide <ArrowUpRight size={17} aria-hidden="true" />
        </a>
      </div>
      <p className="pg-tryit-foot" role="status">
        {status || "Illustrative example · Human review required"}
      </p>
    </div>
  );
}

function PathTiles() {
  return (
    <div className="pg-paths">
      {roleGuides.map((g, i) => {
        const Icon = roleIcons[g.slug] ?? Users;
        const flow = guideWorkflows[g.slug];
        return (
          <a key={g.slug} href={`/guides/${g.slug}`} className={`pg-path pg-tone-${tileTones[i % tileTones.length]}`}>
            <span className="pg-path-top">
              <span className="pg-path-icon" aria-hidden="true">
                <Icon size={26} strokeWidth={2.2} />
              </span>
              {flow && <span className="pg-path-min">{flow.minutes} min</span>}
            </span>
            <span className="pg-path-title">{g.title}</span>
            <span className="pg-path-summary">{g.summary}</span>
            <span className="pg-chip-cta">
              Start <ArrowRight size={16} aria-hidden="true" />
            </span>
          </a>
        );
      })}
    </div>
  );
}

function FindOrAsk({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [tab, setTab] = useState<"find" | "ask">("find");
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState("guides");

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const q = query.toLowerCase().trim();
  const found = resources.filter((r) => `${r.title} ${r.summary}`.toLowerCase().includes(q));
  const kind = askTopics.find(([key]) => key === topic)?.[2];

  return (
    <dialog ref={ref} className="pg-dialog" aria-label="Find or ask" onClose={onClose} onCancel={onClose}>
      <div className="pg-dialog-head">
        <div className="pg-tabs" role="tablist" aria-label="Find or ask">
          <button role="tab" type="button" aria-selected={tab === "find"} onClick={() => setTab("find")}>
            Find
          </button>
          <button role="tab" type="button" aria-selected={tab === "ask"} onClick={() => setTab("ask")}>
            Ask
          </button>
        </div>
        <button type="button" className="pg-icon-btn" aria-label="Close" onClick={onClose}>
          <X size={20} aria-hidden="true" />
        </button>
      </div>

      {tab === "find" ? (
        <div role="tabpanel" aria-label="Find">
          <label className="pg-find-field">
            <Search size={20} aria-hidden="true" />
            <input
              autoFocus
              aria-label="Search resources"
              placeholder="Guides, prompts, projects, articles"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <kbd>Esc</kbd>
          </label>
          <p className="pg-find-meta" role="status">
            {found.length} results · Search runs on this device
          </p>
          <ul className="pg-results">
            {found.map((r) => (
              <li key={r.href}>
                <a href={r.href} onClick={onClose}>
                  <span>
                    <small>{r.kind}</small>
                    <strong>{r.title}</strong>
                  </span>
                  <ArrowUpRight size={18} aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
          {!found.length && (
            <div className="pg-empty">
              <p>No matches.</p>
              <button type="button" className="pg-btn pg-btn-ghost" onClick={() => setQuery("")}>
                Show everything
              </button>
            </div>
          )}
        </div>
      ) : (
        <div role="tabpanel" aria-label="Ask">
          <p className="pg-ask-note">
            <span className="pg-tag">Local guide, no AI requests</span>
          </p>
          <p className="pg-ask-lede">What do you want to explore?</p>
          <div className="pg-chips" role="group" aria-label="Choose a topic">
            {askTopics.map(([key, label]) => (
              <button key={key} type="button" aria-pressed={topic === key} onClick={() => setTopic(key)}>
                {label}
              </button>
            ))}
          </div>
          <ul className="pg-results">
            {resources
              .filter((r) => r.kind === kind)
              .map((r) => (
                <li key={r.href}>
                  <a href={r.href} onClick={onClose}>
                    <span>
                      <small>{r.kind}</small>
                      <strong>{r.title}</strong>
                    </span>
                    <ArrowUpRight size={18} aria-hidden="true" />
                  </a>
                </li>
              ))}
          </ul>
        </div>
      )}
    </dialog>
  );
}

/* ---------- Page ---------- */

export function PlaygroundPrototype() {
  const [mode, setMode] = useLocalValue("pg-prototype-theme", "light");
  const [findOpen, setFindOpen] = useState(false);
  const opener = useRef<HTMLElement | null>(null);

  function openFind(from?: HTMLElement | null) {
    opener.current = from ?? (document.activeElement as HTMLElement | null);
    setFindOpen(true);
  }

  function closeFind() {
    setFindOpen(false);
    requestAnimationFrame(() => opener.current?.focus());
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const typing = !!target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        opener.current = document.activeElement as HTMLElement | null;
        setFindOpen((o) => !o);
      } else if (e.key === "/" && !typing) {
        e.preventDefault();
        opener.current = document.activeElement as HTMLElement | null;
        setFindOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const nextMode = mode === "dark" ? "light" : "dark";

  return (
    <div className="playground" data-mode={mode}>
      <a href="#pg-main" className="pg-skip">
        Skip to content
      </a>

      <div className="pg-ribbon">
        <span>Playground · design prototype · not published</span>
        <a href="/">
          View current design <ArrowUpRight size={12} aria-hidden="true" />
        </a>
      </div>

      <header className="pg-bar">
        <Wordmark />
        <nav aria-label="Main navigation" className="pg-nav">
          {sections.map(([label, id]) => (
            <a key={id} href={`#${id}`}>
              {label}
            </a>
          ))}
        </nav>
        <button type="button" className="pg-find-trigger" aria-label="Find or ask" aria-keyshortcuts="Meta+K /" onClick={(e) => openFind(e.currentTarget)}>
          <Search size={18} aria-hidden="true" />
          <span className="pg-find-label">Find or ask</span>
          <kbd aria-hidden="true">⌘K</kbd>
        </button>
        <button
          type="button"
          className="pg-icon-btn"
          aria-label={`Switch to ${nextMode} mode`}
          onClick={() => setMode(nextMode)}
        >
          {mode === "dark" ? <Sun size={19} aria-hidden="true" /> : <Moon size={19} aria-hidden="true" />}
        </button>
      </header>

      <main id="pg-main">
        <section id="top" className="pg-hero pg-wrap">
          <div className="pg-hero-copy">
            <p className="pg-eyebrow">Balram / AI lead, educator, builder</p>
            <h1>
              I make <mark>AI</mark> accessible.
            </h1>
            <p className="pg-lede">Learn it simply. Put it to work. Build something that matters.</p>
            <div className="pg-hero-actions">
              <a className="pg-btn pg-btn-ink pg-btn-lg" href="/prompting-framework#deepdive">
                Learn AI simply <ArrowRight size={19} aria-hidden="true" />
              </a>
              <a className="pg-btn pg-btn-ghost pg-btn-lg" href="#learn">
                Find your workflow
              </a>
            </div>
            <div className="pg-proof">
              <strong>35,000+</strong>
              <span>people trained. Practical lessons from teaching and building with AI.</span>
            </div>
          </div>
          <TryItTile />
        </section>

        <section id="learn" className="pg-section pg-wrap" aria-labelledby="learn-title">
          <div className="pg-section-head">
            <span className="pg-tag">Learn</span>
            <h2 id="learn-title">Pick your path</h2>
          </div>
          <PathTiles />
        </section>

        <section className="pg-section pg-wrap" aria-label="Coming after look approval">
          <div className="pg-next">
            <p className="pg-next-title">Built after you approve this look</p>
            <div className="pg-next-grid">
              <span id="practice">Practice · CROFTC workbench</span>
              <span id="build">Build · project cards</span>
              <span id="read">Read · articles and bookshelf</span>
              <span>Connect · contact and footer</span>
            </div>
          </div>
        </section>
      </main>

      <nav className="pg-tabbar" aria-label="Quick navigation">
        {sections.map(([label, id, Icon]) => (
          <a key={id} href={`#${id}`}>
            <Icon size={21} aria-hidden="true" />
            <span>{label}</span>
          </a>
        ))}
        <button type="button" onClick={(e) => openFind(e.currentTarget)}>
          <Search size={21} aria-hidden="true" />
          <span>Find</span>
        </button>
      </nav>

      <FindOrAsk open={findOpen} onClose={closeFind} />
    </div>
  );
}
