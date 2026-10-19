import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Masthead } from '../masthead/masthead';
import { Vault } from '../vault/vault';
import { ProvingWall } from '../proving-wall/wall';
import { CaveMouth, LearningDeck, MissionRoom, WhoIsBalram, Workshop } from '../bairam/chambers';
import { chapters } from '../bairam/content';
import { MapJourney } from './map-journey';
import '../loading/loading.css';
import '../masthead/masthead.css';
import '../vault/vault.css';
import '../proving-wall/wall.css';
import '../bairam/journey.css';
import './map.css';
import '../sound/sound.css';

export const metadata: Metadata = {
  title: 'bAIram | The cave map',
  description: 'The cave map journey: one painted cave, a camera that flies between chambers. Local design preview.',
  robots: { index: false, follow: false },
};

// Same stages as /prototype/bairam (Phase 1), plus the reveal: after Who is Balram? (held on the desk) the camera pulls back to the whole map.
function Stage({ id, children, last }: { id?: string; children: ReactNode; last?: boolean }) {
  return <div className="bj-stage" id={id}>{children}{!last && <div className="bj-passage" aria-hidden="true" />}</div>;
}

export default function CaveMapJourney() {
  return <>
    <link rel="preload" href="/fonts/loading/cinzel-700.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
    <link rel="preload" href="/fonts/loading/hanken-grotesk-latin-var.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
    <Masthead base="" sound>
      <MapJourney>
        <Stage id="who"><WhoIsBalram /></Stage>
        <Stage>
          <section className="bj-chamber bmap-reveal" data-chamber="reveal" aria-label="Map of the cave">
            <ol className="bmap-legend">
              {chapters.map(c => <li key={c.id}><a href={`#${c.id}`}><span className="bj-num">{c.n}</span> {c.name}</a></li>)}
            </ol>
          </section>
        </Stage>
        <Stage id="training"><MissionRoom /></Stage>
        <Stage id="proving-wall"><div className="bj-chamber pw-page" data-chamber="proving-wall"><ProvingWall /></div></Stage>
        <Stage id="ai-suits"><div className="bj-chamber bv-page" data-chamber="ai-suits"><Vault /></div></Stage>
        <Stage id="learn"><LearningDeck /></Stage>
        <Stage id="projects"><Workshop /></Stage>
        <Stage id="about" last><CaveMouth /></Stage>
      </MapJourney>
    </Masthead>
    <div id="bm-preveil" className="bm-preveil" aria-hidden="true" suppressHydrationWarning />
    <script dangerouslySetInnerHTML={{ __html: "if(new URLSearchParams(location.search).get('intro')==='0'||location.hash||document.hidden)document.getElementById('bm-preveil').hidden=true" }} />
    <noscript><style>{'.bm-preveil{display:none!important}'}</style></noscript>
  </>;
}
