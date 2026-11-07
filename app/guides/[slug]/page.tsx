import Link from "next/link";
import { notFound } from "next/navigation";
import { getRoleGuide, roleGuides } from "../../site-content";
import { ThemeShell } from "../../components/ThemeShell";
import { GuidePractice } from "../../components/GuidePractice";
import { guideWorkflows } from "../../guide-workflows";
import { pillarGuides } from "../../pillar-guides";
import { roleGuideSeo } from "../../role-guide-seo";
import { pageMetadata } from "../../seo";
import { CopyableExample } from "../../components/CopyableExample";
import { GuideFaqs } from "../../components/GuideFaqs";
import type { Metadata } from "next";

type GuidePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return [...roleGuides, ...pillarGuides].map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = pillarGuides.find((guide) => guide.slug === slug) ?? (getRoleGuide(slug) ? roleGuideSeo[slug] : null);
  return guide
    ? pageMetadata(guide.title, guide.description, `/guides/${slug}`, "article")
    : { title: "Guide not found | AI For All", robots: { index: false } };
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { slug } = await params;
  const pillar = pillarGuides.find((guide) => guide.slug === slug);
  if (pillar) {
    return (
      <ThemeShell activeItem="guides">
        <section className="content-section guide-page-hero">
          <Link className="eyebrow" href="/guides">All guides</Link>
          <h1>{pillar.heading}</h1>
          <p>{pillar.description}</p>
        </section>
        <section className="content-section guide-detail-grid">
          <div className="guide-detail-panel">
            <h2>Who it is for</h2>
            <p>{pillar.audience}</p>
          </div>
          <div className="guide-detail-panel">
            <h2>What you should get</h2>
            <ul>{pillar.outcomes.map((outcome) => <li key={outcome}>{outcome}</li>)}</ul>
          </div>
        </section>
        <section className="content-section workflow-steps">
          <h2>The walkthrough</h2>
          {pillar.sections.map((section, index) => (
            <article key={section.title}>
              <span className="eyebrow" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h3>{section.title}</h3>
                {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                {section.examples?.map((example) => (
                  <div className="practice-section" key={example.label}>
                    <CopyableExample {...example} />
                  </div>
                ))}
              </div>
            </article>
          ))}
        </section>
        <section className="content-section practice-section">
          <h2>Adapt the prompts for your work</h2>
          <p>Use the <Link className="learning-action" href="/prompting-framework">CROFTC prompt engineering framework</Link> to describe your context, your objective, and what the tool should leave to a human.</p>
          <p className="eyebrow">Official references</p>
          <ul>{pillar.sources.map((source) => <li key={source.href}><a className="learning-action" href={source.href}>{source.label}</a></li>)}</ul>
        </section>
        <GuideFaqs slug={slug} heading={pillar.heading} description={pillar.description} faqs={pillar.faqs} />
        <section className="content-section guide-page-footer">
          <h2>Keep learning</h2>
          <div className="hero-actions">
            <Link className="button primary" href="/guides">Back to guides</Link>
            {pillarGuides.filter((guide) => guide.slug !== slug).map((guide) => (
              <Link className="button secondary" key={guide.slug} href={`/guides/${guide.slug}`}>{guide.name}</Link>
            ))}
          </div>
        </section>
      </ThemeShell>
    );
  }
  const guide = getRoleGuide(slug);
  const seo = roleGuideSeo[slug];

  if (!guide || !seo) {
    notFound();
  }

  return (
    <ThemeShell activeItem="guides">
      <section className="content-section guide-page-hero">
        <Link className="eyebrow" href="/guides">All guides</Link>
        <h1>{seo.heading}</h1>
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
      {slug === "operations" && (
        <section className="content-section practice-section">
          <h2>From an SOP to a Quick Flow</h2>
          <p>Once a colleague can follow your checklist, try the <Link className="learning-action" href="/guides/amazon-quick">Amazon Quick Flows guide</Link> to turn a recurring report into a draft your team can review.</p>
        </section>
      )}
      <GuideFaqs slug={slug} heading={seo.heading} description={seo.description} faqs={seo.faqs} />

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
