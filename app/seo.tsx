import type { Metadata } from "next";

export const siteUrl = "https://balramr.in";
export const personId = `${siteUrl}/#balram`;

export function pageMetadata(title: string, description: string, path: string, type: "website" | "article" = "website"): Metadata {
  const url = new URL(path, siteUrl).href;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title, description, url, type, siteName: "AI For All",
      images: [{ url: `${siteUrl}/assets/masthead/suit-desk-2400.webp`, width: 2400, height: 1029, alt: "bAIram's cave workstation for AI For All" }],
    },
  };
}

export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
