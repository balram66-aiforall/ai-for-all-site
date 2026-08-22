"use client";

import { useRef } from "react";

const articles = [
  {
    title: "MCP vs skill.md",
    kicker: "Tools + direction",
    summary:
      "A clean breakdown of when AI needs access through MCP and when it needs behavior through skill.md.",
    href: "https://www.linkedin.com/pulse/mcp-vs-skillmd-whats-difference-why-you-need-both-balram-r-42l0c",
    image: "/assets/articles/mcp-vs-skillmd.png",
  },
  {
    title: "Most people use Kiro like a chat box",
    kicker: "Stop chatting. Start structuring.",
    summary:
      "A practical shift from loose prompts to context, specs, tasks, and execution inside Kiro.",
    href: "https://www.linkedin.com/pulse/most-people-use-kiro-like-chat-box-dont-balram-r-xraac",
    image: "/assets/articles/kiro-chat-box.png",
  },
  {
    title: "MCPs vs APIs",
    kicker: "Model Context Protocol",
    summary:
      "A simple visual explanation of how tools, requests, menus, and usable actions fit together.",
    href: "https://www.linkedin.com/pulse/simplest-way-understand-mcps-model-context-protocol-balram-r-6zvdc",
    image: "/assets/articles/mcps-vs-apis.png",
  },
  {
    title: "Non-technical? Use AI like a pro.",
    kicker: "Clarity, context, judgment",
    summary:
      "A non-technical guide for turning blank prompts into workflows and clear output.",
    href: "https://www.linkedin.com/pulse/non-technical-guide-using-ai-like-pro-balram-r-w6rrc",
    image: "/assets/articles/non-technical-ai-pro.png",
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

  function scrollArticles(direction: -1 | 1) {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    track.scrollBy({
      left: direction * track.clientWidth * 0.82,
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
            onClick={() => scrollArticles(-1)}
          >
            <Chevron direction="prev" />
          </button>
          <button
            type="button"
            aria-label="Next articles"
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
          <a
            className="article-slide"
            href={article.href}
            key={article.title}
            target="_blank"
            rel="noreferrer"
          >
            <figure>
              <img
                src={article.image}
                alt={`${article.title} article artwork`}
                loading="lazy"
              />
            </figure>
            <div className="article-slide-copy">
              <p>{article.kicker}</p>
              <h3>{article.title}</h3>
              <span>{article.summary}</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
