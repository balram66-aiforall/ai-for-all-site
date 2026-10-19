import type { Metadata } from 'next';
import { ProvingWall } from './wall';
import './wall.css';

export const metadata: Metadata = {
  title: 'bAIram | Proving wall preview',
  description: 'The certifications level of Balram’s personal-site cave. Local design preview.',
  robots: { index: false, follow: false },
};
export default function ProvingWallPreview() {
  return <main className="pw-page">
    <link rel="preload" href="/fonts/loading/hanken-grotesk-latin-var.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
    <ProvingWall />
  </main>;
}
