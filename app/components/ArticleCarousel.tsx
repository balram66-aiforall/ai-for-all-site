"use client";

/* eslint-disable @next/next/no-img-element -- Vinext's next/image shim breaks hydration. */
import { useEffect, useRef, useState } from "react";

const articles = [
  {
    title: "MCP vs skill.md",
    kicker: "Tools + direction",
    summary:
      "A clean breakdown of when AI needs access through MCP and when it needs behavior through skill.md.",
    href: "https://www.linkedin.com/pulse/mcp-vs-skillmd-whats-difference-why-you-need-both-balram-r-42l0c",
    image: "/assets/articles/mcp-vs-skillmd.jpg",
  },
  {
    title: "Most people use Kiro like a chat box",
    kicker: "Stop chatting. Start structuring.",
    summary:
      "A practical shift from loose prompts to context, specs, tasks, and execution inside Kiro.",
    href: "https://www.linkedin.com/pulse/most-people-use-kiro-like-chat-box-dont-balram-r-xraac",
    image: "/assets/articles/kiro-chat-box.jpg",
  },
  {
    title: "MCPs vs APIs",
    kicker: "Model Context Protocol",
    summary:
      "A simple visual explanation of how tools, requests, menus, and usable actions fit together.",
    href: "https://www.linkedin.com/pulse/simplest-way-understand-mcps-model-context-protocol-balram-r-6zvdc",
    image: "/assets/articles/mcps-vs-apis.jpg",
  },
  {
    title: "Non-technical? Use AI like a pro.",
    kicker: "Clarity, context, judgment",
    summary:
      "A non-technical guide for turning blank prompts into workflows and clear output.",
    href: "https://www.linkedin.com/pulse/non-technical-guide-using-ai-like-pro-balram-r-w6rrc",
    image: "/assets/articles/non-technical-ai-pro.jpg",
  },
];

function Chevron({ direction }: { direction: "prev" | "next" }) {
  return (
    <svg
      aria-hidden="true"
      className={direction === "prev" ? "chevron prev" : "chevron"}
      viewBox="0 0 24 24"
    >
      <path d="M9 5l7 7-7 7" />
    </svg>
  );
}

export function ArticleCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<
    (typeof articles)[number] | null
  >(null);
  const [canScroll, setCanScroll] = useState({ previous: false, next: true });

  useEffect(() => {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    function updateControls() {
      if (!track) {
        return;
      }

      const maximum = track.scrollWidth - track.clientWidth;
      setCanScroll({
        previous: track.scrollLeft > 4,
        next: track.scrollLeft < maximum - 4,
      });
    }

    updateControls();
    track.addEventListener("scroll", updateControls, { passive: true });
    const resizeObserver = new ResizeObserver(updateControls);
    resizeObserver.observe(track);

    return () => {
      track.removeEventListener("scroll", updateControls);
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!selectedArticle) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const dialog = dialogRef.current;
    const focusable = dialog?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
    );
    focusable?.[0]?.focus();

    function handleDialogKeys(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedArticle(null);
        return;
      }

      if (event.key !== "Tab" || !focusable?.length) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleDialogKeys);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleDialogKeys);
      document.body.style.overflow = previousOverflow;
      triggerRef.current?.focus();
    };
  }, [selectedArticle]);

  function scrollArticles(direction: -1 | 1) {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const firstSlide = track.querySelector<HTMLElement>(".article-slide");
    const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 16;
    const distance = firstSlide ? firstSlide.offsetWidth + gap : track.clientWidth;

    track.scrollBy({
      left: direction * distance,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }

  return (
    <div className="article-carousel-shell">
      <div className="carousel-meta">
        <p>LinkedIn originals</p>
        <div className="carousel-controls" aria-label="Article carousel controls">
          <button
            type="button"
            aria-label="Previous articles"
            disabled={!canScroll.previous}
            onClick={() => scrollArticles(-1)}
          >
            <Chevron direction="prev" />
          </button>
          <button
            type="button"
            aria-label="Next articles"
            disabled={!canScroll.next}
            onClick={() => scrollArticles(1)}
          >
            <Chevron direction="next" />
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        className="article-carousel-track"
        aria-label="Featured LinkedIn articles"
        tabIndex={0}
      >
        {articles.map((article) => (
          <button
            type="button"
            className="article-slide"
            key={article.title}
            onClick={(event) => {
              triggerRef.current = event.currentTarget;
              setSelectedArticle(article);
            }}
          >
            <figure>
              <img
                src={article.image}
                alt={`${article.title} article artwork`}
                width={1280}
                height={719}
                loading="lazy"
                decoding="async"
              />
            </figure>
            <div className="article-slide-copy">
              <p>{article.kicker}</p>
              <h3>{article.title}</h3>
              <span>{article.summary}</span>
              <small>Open preview</small>
            </div>
          </button>
        ))}
      </div>

      {selectedArticle ? (
        <div
          className="article-preview-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedArticle(null);
            }
          }}
        >
          <article
            ref={dialogRef}
            className="article-preview"
            role="dialog"
            aria-modal="true"
            aria-labelledby="article-preview-title"
            aria-describedby="article-preview-summary"
          >
            <button
              type="button"
              className="article-preview-close"
              aria-label="Close article preview"
              onClick={() => setSelectedArticle(null)}
            >
              <svg aria-hidden="true" viewBox="0 0 24 24">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
            <img
              src={selectedArticle.image}
              alt={`${selectedArticle.title} article artwork`}
              width={1280}
              height={719}
              decoding="async"
            />
            <div className="article-preview-copy">
              <p>{selectedArticle.kicker}</p>
              <h3 id="article-preview-title">{selectedArticle.title}</h3>
              <span id="article-preview-summary">{selectedArticle.summary}</span>
              <a href={selectedArticle.href} target="_blank" rel="noopener noreferrer">
                Read the article
              </a>
            </div>
          </article>
        </div>
      ) : null}
    </div>
  );
}
