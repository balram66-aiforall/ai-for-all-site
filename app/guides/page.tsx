import Link from "next/link";
import { roleGuides } from "../site-content";
import { ThemeShell } from "../components/ThemeShell";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "AI workflows for your role | AI For All", description: "Practical AI walkthroughs for managers, operations, analysts, and client teams. Start with a prompt, learn from an example, and review the result." };

export default function GuidesIndexPage() {
  return (
    <ThemeShell activeItem="guides">
      <section className="content-section guide-page-hero">
        <p className="eyebrow">Role guides</p>
        <h1>Simple AI guides for the work people already do.</h1>
        <p>
          Start here if you want AI explained clearly and mapped to a real role.
          Each guide shows what to automate, what to keep human, and what to try
          next.
        </p>
        <p className="guide-status-banner">
          Each starting workflow includes step-by-step instructions, a reusable
          prompt, a worked example, and a review checklist.
        </p>
      </section>

      <section className="content-section guide-index-grid">
        {roleGuides.map((guide) => (
          <article className="guide-card" key={guide.slug}>
            <span>guide</span>
            <h2>{guide.title}</h2>
            <p>{guide.summary}</p>
            <ul>
              {guide.outcomes.map((outcome) => (
                <li key={outcome}>{outcome}</li>
              ))}
            </ul>
            <Link href={`/guides/${guide.slug}`}>Try the workflow</Link>
          </article>
        ))}
      </section>

      <section className="content-section guide-page-footer">
        <p className="eyebrow">Need help building a site?</p>
        <h2>Talk to Balram about practical AI help or a new site.</h2>
        <div className="hero-actions">
          <Link className="button primary" href="/">
            Back home
          </Link>
          <a className="button secondary" href="https://wa.me/qr/3EZXUASKEW5RM1">
            Contact on WhatsApp
          </a>
        </div>
      </section>
    </ThemeShell>
  );
}
