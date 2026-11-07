import type { GuideFaq } from "../pillar-guides";
import { JsonLd, personId, siteUrl } from "../seo";

export function GuideFaqs({ slug, heading, description, faqs }: { slug: string; heading: string; description: string; faqs: GuideFaq[] }) {
  const url = `${siteUrl}/guides/${slug}`;
  return <>
    <JsonLd data={{
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Article", "@id": `${url}#article`, headline: heading, description,
          mainEntityOfPage: url, author: { "@type": "Person", "@id": personId, name: "Balram R.", url: siteUrl },
          isPartOf: { "@id": `${siteUrl}/#website` }, inLanguage: "en-IN",
        },
        {
          "@type": "FAQPage", "@id": `${url}#faq`, url,
          mainEntity: faqs.map(({ question, answer }) => ({
            "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer },
          })),
        },
      ],
    }} />
    <section className="content-section workflow-steps" id="faq">
      <h2>Frequently asked questions</h2>
      {faqs.map(({ question, answer }) => (
        <details className="worked-example" key={question}>
          <summary>{question}</summary>
          <p>{answer}</p>
        </details>
      ))}
    </section>
  </>;
}
