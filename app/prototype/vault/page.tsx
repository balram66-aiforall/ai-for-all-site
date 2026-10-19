import type { Metadata } from 'next';
import { Vault } from './vault';
import './vault.css';

export const metadata: Metadata = {
  title: 'bAIram | Suit vault preview',
  description: 'The AI tools level of Balram’s personal-site cave. Local design preview.',
  robots: { index: false, follow: false },
};
export default function VaultPreview() {
  return <main className="bv-page">
    <link rel="preload" href="/fonts/loading/hanken-grotesk-latin-var.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
    <Vault />
  </main>;
}
