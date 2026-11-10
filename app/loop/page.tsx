import type { Metadata } from 'next';
import { LoopPage } from '../prototype/loop/loop';
import { loop } from '../prototype/bairam/content';
import '../prototype/loading/loading.css';
import '../prototype/masthead/masthead.css';
import '../prototype/bairam/journey.css';
import '../prototype/loop/loop.css';

const title = `${loop.name}: ${loop.tagline} | bAIram | Balram R.`;

export const metadata: Metadata = {
  title,
  description: loop.description,
  alternates: { canonical: loop.path },
  robots: { index: true, follow: true },
  openGraph: { title, description: loop.description, url: loop.path, type: 'website',
    images: [{ url: '/assets/projects/loop-1000.webp', width: 1000, height: 1250, alt: `${loop.name} — ${loop.tagline}` }] },
};

export default function Loop() {
  const origin = new URL(loop.href).origin;
  return <>
    <link rel="preconnect" href={origin} />
    <link rel="preload" href="/fonts/loading/cinzel-700.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
    <link rel="preload" href="/fonts/loading/hanken-grotesk-latin-var.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
    <LoopPage />
  </>;
}
