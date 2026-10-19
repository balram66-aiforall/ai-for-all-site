import type { Metadata } from "next";
import CaveMapJourney from "./prototype/bairam-map/page";

export const metadata: Metadata = {
  title: "bAIram | Balram R. | AI For All",
  description:
    "Learn practical AI with Balram R., an AI lead, educator, and builder. Explore AI training, learning resources, projects, and workflows through AI For All.",
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "bAIram | Balram R. | AI For All",
    description:
      "I make AI accessible. Learn it simply. Put it to work. Build something that matters.",
    url: "/",
    type: "website",
    images: [
      {
        url: "/assets/masthead/suit-desk-2400.webp",
        width: 2400,
        height: 1029,
        alt: "bAIram's cave workstation for AI For All",
      },
    ],
  },
};

export default function Home() {
  return <CaveMapJourney />;
}
