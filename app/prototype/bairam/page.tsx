import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Masthead } from '../masthead/masthead';
import { Vault } from '../vault/vault';
import { ProvingWall } from '../proving-wall/wall';
import { Journey } from './journey';
import { CaveMouth, LearningDeck, MissionRoom, WhoIsBalram, Workshop } from './chambers';
import '../loading/loading.css';
import '../masthead/masthead.css';
import '../vault/vault.css';
import '../proving-wall/wall.css';
import './journey.css';

export const metadata: Metadata = {
  title: 'bAIram | The cave',
  description: 'Balram’s personal site as one journey through the cave. Local design preview.',
  robots: { index: false, follow: false },
};

/* Each chamber sits in a stage with the passage after it. The chamber pins at its last screen while the passage scrolls by
   and the next chamber rises over it (the last one has no passage: the page ends there).
   The chapter anchor sits on the stage, which never moves, so a jump always targets the chamber's true position. */
function Stage({ id, children, last }: { id: string; children: ReactNode; last?: boolean }) {
  return <div className="bj-stage" id={id}>{children}{!last && <div className="bj-passage" aria-hidden="true" />}</div>;
}

export default function CaveJourney() {
  return <>
    <link rel="preload" href="/fonts/loading/cinzel-700.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
    <link rel="preload" href="/fonts/loading/hanken-grotesk-latin-var.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
    <Masthead base="">
      <Journey>
        <Stage id="who"><WhoIsBalram /></Stage>
        <Stage id="training"><MissionRoom /></Stage>
        <Stage id="proving-wall"><div className="bj-chamber pw-page" data-chamber="proving-wall"><ProvingWall /></div></Stage>
        <Stage id="ai-suits"><div className="bj-chamber bv-page" data-chamber="ai-suits"><Vault /></div></Stage>
        <Stage id="learn"><LearningDeck /></Stage>
        <Stage id="projects"><Workshop /></Stage>
        <Stage id="about" last><CaveMouth /></Stage>
      </Journey>
    </Masthead>
    {/* Same pre-veil as the masthead preview: covers the page until the loading screen opens. ?intro=0, a #link or no JS skip it. */}
    <div id="bm-preveil" className="bm-preveil" aria-hidden="true" suppressHydrationWarning />
    <script dangerouslySetInnerHTML={{ __html: "if(new URLSearchParams(location.search).get('intro')==='0'||location.hash||document.hidden)document.getElementById('bm-preveil').hidden=true" }} />
    <noscript><style>{'.bm-preveil{display:none!important}'}</style></noscript>
  </>;
}
