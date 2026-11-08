import type { Metadata } from 'next';
import { Wing } from '../../prototype/second-brain-os/wing';
import { WING, library } from '../../prototype/second-brain-os/library';
import { roomOfLearning } from '../../prototype/bairam/content';
import '../../prototype/loading/loading.css';
import '../../prototype/masthead/masthead.css';
import '../../prototype/second-brain-os/library.css';

const title = 'Second Brain OS | bAI room of learning | bAIram';
const description = roomOfLearning.cards[0].summary;

// The original is the author's repo: search engines are pointed there (canonical), so this copy never competes with it.
export const metadata: Metadata = {
  title, description,
  alternates: { canonical: library.source.repo },
  robots: { index: true, follow: true },
  openGraph: { title, description, url: WING, type: 'website', images: [{ url: '/assets/second-brain-os/learning-deck-1920.webp', width: 1920, height: 1080, alt: 'The learning deck in the bAIram cave' }] },
};

export default function SecondBrainOsPage() {
  return <>
    <link rel="preload" href="/fonts/loading/hanken-grotesk-latin-var.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
    <Wing />
  </>;
}
