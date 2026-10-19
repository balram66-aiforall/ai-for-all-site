import type { Metadata } from 'next';
import { CavePortfolio } from './portfolio';
import './cave.css';

export const metadata: Metadata = {
  title: 'bAIram | The Cave · Local prototype',
  description: 'Balram’s personal headquarters. A cinematic cave portfolio, built with agents.',
  robots: { index: false, follow: false },
};

export default function CavePage() {
  return <>
    <link rel="preload" href="/fonts/gotham/barlow-condensed-700.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
    <link rel="preload" href="/fonts/gotham/manrope-400.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
    <CavePortfolio />
  </>;
}
