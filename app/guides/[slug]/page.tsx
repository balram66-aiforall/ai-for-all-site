import Link from "next/link";
import { notFound } from "next/navigation";
import { getRoleGuide, roleGuides } from "../../site-content";
import { ThemeShell } from "../../components/ThemeShell";
import { GuidePractice } from "../../components/GuidePractice";
import { guideWorkflows } from "../../guide-workflows";
import type { Metadata } from "next";

type GuidePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return roleGuides.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const guide = getRoleGuide((await params).slug);
  return { title: guide ? `${guide.title} | AI For All` : "Guide not found | AI For All", description: guide?.summary };
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { slug } = await params;
  const guide = getRoleGuide(slug);

  if (!guide) {
    notFound();
  }

  return (
    <ThemeShell activeItem="guides">
      <section className="content-section guide-page-hero">
        <Link className="eyebrow" href="/guides">All role guides</Link>
        <h1>{guide.title}</h1>
        <p>{guide.summary}</p>
        <p className="guide-status-banner">{guideWorkflows[slug].minutes} minutes to try / includes a prompt, worked example, and review checklist</p>
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

      </section>

      <section className="content-section workflow-steps">
        <p className="eyebrow">The walkthrough</p>
        <h2>{guideWorkflows[slug].task}</h2>
        {guideWorkflows[slug].steps.map((step, index) => <article key={step.title}><span className="eyebrow">0{index + 1}</span><div><h3>{step.title}</h3><p>{step.body}</p></div></article>)}
      </section>
      <GuidePractice workflow={guideWorkflows[slug]} />

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
    </ThemeShell>
  );
}
