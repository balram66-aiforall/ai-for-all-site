import CaveMapJourney from "./prototype/bairam-map/page";
import { JsonLd, pageMetadata, personId, siteUrl } from "./seo";

export const metadata = pageMetadata(
  "Balram R. (bAIram) | Amazon AI, Kiro Workflows & Practical Prompt Engineering",
  "Practical AI guides, Kiro spec-driven workflows, Amazon Quick automation, and the CROFTC prompt engineering framework by Balram R. Making AI accessible for all.",
  "/",
);

export default function Home() {
  return <>
    <JsonLd data={{
      "@context": "https://schema.org",
      "@graph": [
        { "@type": "Person", "@id": personId, name: "Balram R.", alternateName: "bAIram", url: siteUrl, sameAs: ["https://in.linkedin.com/in/balramr66", "https://github.com/balram66-aiforall"] },
        { "@type": "WebSite", "@id": `${siteUrl}/#website`, name: "AI For All", url: siteUrl, publisher: { "@id": personId }, inLanguage: "en-IN" },
      ],
    }} />
    <CaveMapJourney />
  </>;
}
