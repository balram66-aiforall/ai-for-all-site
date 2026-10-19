import type { Metadata } from 'next';
import { Masthead } from './masthead';
import '../loading/loading.css';
import './masthead.css';

export const metadata: Metadata = {
  title: 'bAIram | Masthead preview',
  description: 'Balram’s personal-site masthead. Local design preview.',
  robots: { index: false, follow: false },
};
export default function MastheadPreview() {
  return <>
    <link rel="preload" href="/fonts/loading/cinzel-700.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
    <link rel="preload" href="/fonts/loading/hanken-grotesk-latin-var.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
    <Masthead />
    {/* Covers the page until the loading screen opens, so a plain visit never flashes the masthead first. ?intro=0, a #link or no JS skip it. */}
    <div id="bm-preveil" className="bm-preveil" aria-hidden="true" suppressHydrationWarning />
    <script dangerouslySetInnerHTML={{ __html: "if(new URLSearchParams(location.search).get('intro')==='0'||location.hash||document.hidden)document.getElementById('bm-preveil').hidden=true" }} />
    <noscript><style>{'.bm-preveil{display:none!important}'}</style></noscript>
  </>;
}
