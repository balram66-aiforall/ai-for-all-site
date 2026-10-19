import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { MARKS, Mark, type MarkSpec } from './marks';
import './mark.css';

export const metadata: Metadata = {
  title: 'bAIram | Mark sketches',
  description: 'Bat mark sketches for bAIram, tested small, projected and beside the name. Local design preview.',
  robots: { index: false, follow: false },
};

function Wordmark() {
  return <span className="bk-word">b<span>AI</span>ram</span>;
}

function Tile({ label, className, children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <figure className={className ? `bk-tile ${className}` : 'bk-tile'}>
      <div className="bk-stage">{children}</div>
      <figcaption>{label}</figcaption>
    </figure>
  );
}

function MarkStudy({ spec }: { spec: MarkSpec }) {
  return (
    <section className="bk-study" id={`mark-${spec.id}`} aria-labelledby={`mark-${spec.id}-name`} data-study={spec.id}>
      <header className="bk-study-head">
        <p className="bk-no">{spec.no}</p>
        <h2 id={`mark-${spec.id}-name`}>
          {spec.name}
          {spec.recommended ? <span className="bk-pick">Recommended</span> : null}
        </h2>
        <dl>
          <div><dt>Idea</dt><dd>{spec.idea}</dd></div>
          <div><dt>Small</dt><dd>{spec.small}</dd></div>
          <div><dt>Risk</dt><dd>{spec.risk}</dd></div>
        </dl>
      </header>

      <div className="bk-grid">
        <Tile label="Actual size: 16, 32, 96 px" className="bk-ladder">
          {[16, 32, 96].map((s) => (
            <span key={s} className="bk-step">
              <Mark spec={spec} size={s} />
              <small>{s}</small>
            </span>
          ))}
        </Tile>

        <Tile label="Squint test: 32 px, blurred" className="bk-squint">
          <Mark spec={spec} size={32} />
          <Mark spec={spec} size={64} />
        </Tile>

        <Tile label="Gold on dark / dark on gold" className="bk-pair">
          <span className="bk-on-dark"><Mark spec={spec} size={88} /></span>
          <span className="bk-on-gold"><Mark spec={spec} size={88} /></span>
        </Tile>

        <Tile label="Favicon in a browser tab" className="bk-tab">
          <span className="bk-tabbar">
            <span className="bk-tabitem is-active"><Mark spec={spec} size={16} /><span>bAIram | The cave</span></span>
            <span className="bk-tabitem"><span className="bk-dot" /><span>Inbox</span></span>
          </span>
        </Tile>

        <Tile label="Beside the wordmark" className="bk-lockup">
          <span className="bk-lock-row"><Mark spec={spec} size={46} /><Wordmark /></span>
          <span className="bk-lock-stack"><Mark spec={spec} size={72} /><Wordmark /></span>
        </Tile>

        <Tile label="Cable node and chapter marker" className="bk-cable">
          <span className="bk-wire" aria-hidden="true" />
          <span className="bk-node"><span className="bk-pip" /></span>
          <span className="bk-node is-mark"><Mark spec={spec} size={26} /><small>03</small></span>
          <span className="bk-node"><span className="bk-pip" /></span>
        </Tile>

        <Tile label="Projected as light on the night sky" className="bk-sky">
          <span className="bk-beam" aria-hidden="true" />
          <span className="bk-glow"><Mark spec={spec} size={120} /></span>
          <span className="bk-skyline" aria-hidden="true" />
        </Tile>

        <Tile label="Floor turntable" className="bk-floor">
          <span className="bk-plate">
            <span className="bk-spin"><Mark spec={spec} size={150} /></span>
          </span>
        </Tile>

        <Tile label="Large: 512 px" className="bk-big">
          <Mark spec={spec} size={512} title={`${spec.name} mark, large`} />
        </Tile>
      </div>
    </section>
  );
}

export default function MarkSketchesPage() {
  return (
    <main className="bk-page">
      <header className="bk-intro">
        <p className="bk-eyebrow"><Wordmark /> · mark sketches</p>
        <h1>A bat for the cave</h1>
        <p className="bk-lede">Local sketches, no spend. Each mark is one colour on a 100-unit grid, tested small, projected, on the floor and beside the name.</p>
      </header>

      <nav className="bk-lineup" aria-label="All marks">
        {MARKS.map((spec) => (
          <a key={spec.id} href={`#mark-${spec.id}`} className={spec.recommended ? 'is-pick' : undefined}>
            <Mark spec={spec} size={96} />
            <span className="bk-lineup-sizes">
              <Mark spec={spec} size={32} />
              <Mark spec={spec} size={16} />
            </span>
            <span className="bk-lineup-name"><span>{spec.no}</span> {spec.name}</span>
          </a>
        ))}
      </nav>

      {MARKS.map((spec) => <MarkStudy key={spec.id} spec={spec} />)}

      <footer className="bk-foot">
        <p>Guardrail: our own bat, never the famous emblem. No oval around a spread-wing bat, and no two-eared cowl head on it.</p>
      </footer>
    </main>
  );
}
