import Link from "next/link";
import { notFound } from "next/navigation";
import { getRoleGuide, roleGuides } from "../../site-content";

type GuidePageProps = {
  params: { slug: string };
};

export function generateStaticParams() {
  return roleGuides.map((guide) => ({ slug: guide.slug }));
}

export default function GuidePage({ params }: GuidePageProps) {
  const { slug } = params;
  const guide = getRoleGuide(slug);

  if (!guide) {
    notFound();
  }

  return (
    <main className="site-shell guide-shell" data-theme="light" data-theme-phase="idle">
      <section className="content-section guide-page-hero">
        <p className="eyebrow">Guide</p>
        <h1>{guide.title}</h1>
        <p>{guide.summary}</p>
        <p className="guide-status-banner">
          This guide is a preview while the full role library is still taking
          shape.
        </p>
      </section>

      <section className="content-section guide-detail-grid">
        <article className="guide-detail-panel">
          <p className="eyebrow">Who it is for</p>
          <h2>{guide.audience}</h2>
        </article>

        <article className="guide-detail-panel">
          <p className="eyebrow">What you should get</p>
          <ul>
            {guide.outcomes.map((outcome) => (
              <li key={outcome}>{outcome}</li>
            ))}
          </ul>
        </article>

        <article className="guide-detail-panel">
          <p className="eyebrow">Try these prompts</p>
          <ul>
            {guide.prompts.map((prompt) => (
              <li key={prompt}>{prompt}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="content-section guide-page-footer">
        <p className="eyebrow">Want a more personal walkthrough?</p>
        <h2>Ask AIFA or contact Balram for practical AI help and site work.</h2>
        <div className="hero-actions">
          <Link className="button primary" href="/guides">
            Back to guides
          </Link>
          <a className="button secondary" href="https://wa.me/qr/3EZXUASKEW5RM1">
            Contact on WhatsApp
          </a>
        </div>
      </section>
    </main>
  );
}
