import type { Metadata } from 'next';
import { PromptLibrary, PATH, ART } from '../../prototype/prompt-library/library';
import { roomOfLearning } from '../../prototype/bairam/content';
import '../../prototype/loading/loading.css';
import '../../prototype/masthead/masthead.css';
import '../../prototype/prompt-library/library.css';

const card = roomOfLearning.cards.find(c => c.read.href === PATH)!;
const title = `${card.title} | ${roomOfLearning.name} | bAIram`;

// His own prompts, so this page is the original: canonical to itself and indexable.
export const metadata: Metadata = {
  title, description: card.summary,
  alternates: { canonical: PATH },
  robots: { index: true, follow: true },
  openGraph: { title, description: card.summary, url: PATH, type: 'website', images: [{ url: `${ART}-1600.webp`, width: 1600, height: 914, alt: 'A library hall carved into the bAIram cave' }] },
};

export default function PromptLibraryPage() {
  return <>
    <link rel="preload" href="/fonts/loading/cinzel-700.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
    <link rel="preload" href="/fonts/loading/hanken-grotesk-latin-var.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
    <PromptLibrary />
  </>;
}
