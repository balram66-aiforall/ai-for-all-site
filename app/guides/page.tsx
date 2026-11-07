import Link from "next/link";
import { roleGuides } from "../site-content";
import { ThemeShell } from "../components/ThemeShell";
import { pillarGuides } from "../pillar-guides";
import { pageMetadata } from "../seo";

export const metadata = pageMetadata(
  "Practical AI Guides: Kiro, Amazon Quick and Role Workflows | AI For All",
  "Explore practical guides to Kiro, Amazon Quick, MCP, and AI workflows for managers, operations, analysts, and client teams.",
  "/guides",
);

export default function GuidesIndexPage() {
  return (
    <ThemeShell activeItem="guides">
      <section className="content-section guide-page-hero">
        <p className="eyebrow">Tool and role guides</p>
        <h1>Simple AI guides for the work people already do.</h1>
        <p>
          Start with a tool you want to learn or a task you already do.
          Each guide shows what to automate, what to keep human, and what to try
          next.
        </p>
        <p className="guide-status-banner">
          Find walkthroughs, copyable examples, and checks you can use before sharing the result.
        </p>
      </section>

      <section className="content-section guide-index-grid" aria-label="Tool guides">
        {pillarGuides.map((guide) => (
          <article className="guide-card" key={guide.slug}>
            <span>tool guide</span>
            <h2>{guide.name}</h2>
            <p>{guide.description}</p>
            <Link href={`/guides/${guide.slug}`}>Read the guide</Link>
          </article>
        ))}
      </section>

      <section className="content-section guide-index-grid" aria-label="Role guides">
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
