'use client';

import { useEffect, useRef, useState } from 'react';
import { BATS, FLYBY, createOpening, type Phase } from './motion';
import { openingClock } from '../sound/engine';
import { SoundToggle } from '../sound/sound-toggle';

/* sound: show the Sound button and play the bats' sound in sync (only the cave map route opts in). */
type OpeningProps = { onComplete?: () => void; onPhase?: (phase: Phase) => void; sound?: boolean };

function Bat({ pass = false, near = false }: { pass?: boolean; near?: boolean }) {
  return <svg className={`bairam-opening-bat${pass ? ' bairam-opening-pass' : ''}${near ? ' bairam-opening-pass-near' : ''}`} viewBox="-28 -16 56 32" aria-hidden="true" focusable="false">
    <g data-wing="left"><path d="M-1-2 C-6-10-15-13-26-10 C-22-7-21-2-21 2 C-17-2-12-1-11 4 C-7 1-4 4-2 9 L0 3Z" /></g>
    <g data-wing="right"><path d="M1-2 C6-10 15-13 26-10 C22-7 21-2 21 2 C17-2 12-1 11 4 C7 1 4 4 2 9 L0 3Z" /></g>
    <path className="bairam-opening-bat-body" d="M-3-5 L-3-10 0-7 3-10 3-5 Q5 0 2 7 L0 11-2 7 Q-5 0-3-5Z" />
  </svg>;
}

export function LoadingOpening({ onComplete, onPhase, sound = false }: OpeningProps = {}) {
  const stage = useRef<HTMLElement>(null);
  const replay = useRef<HTMLButtonElement>(null);
  const skip = useRef<HTMLButtonElement>(null);
  const triggerReplay = useRef<() => void>(() => {});
  const triggerSkip = useRef<() => void>(() => {});
  const [phase, setPhase] = useState<Phase>('balram');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const root = stage.current!;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    let disposed = false, interacted = false;
    const opening = createOpening({
      stage: root,
      word: root.querySelector<HTMLElement>('.bairam-opening-word')!,
      slots: Array.from(root.querySelectorAll<HTMLElement>('[data-letter]')),
      from: Array.from(root.querySelectorAll<HTMLElement>('[data-from]')),
      to: Array.from(root.querySelectorAll<HTMLElement>('[data-to]')),
      bats: Array.from(root.querySelectorAll<SVGSVGElement>('.bairam-opening-bat:not(.bairam-opening-pass)')),
      flyby: Array.from(root.querySelectorAll<SVGSVGElement>('.bairam-opening-pass')),
    }, {
      reduced: media.matches,
      onClock: sound ? openingClock : undefined,
      onPhase(next) {
        if (next === 'complete' && document.activeElement === skip.current) replay.current?.focus();
        setPhase(next); setReady(true);
        onPhase?.(next);
        if (next === 'complete') onComplete?.();
      },
    });
    triggerReplay.current = () => { interacted = true; opening.start(); };
    triggerSkip.current = () => { interacted = true; opening.skip(); };
    const onMotion = () => { if (media.matches) interacted = true; opening.setReducedMotion(media.matches); };
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') triggerSkip.current(); };
    media.addEventListener('change', onMotion);
    window.addEventListener('keydown', onKey);
    // Start with the bundled font, but never wait indefinitely for an asset.
    const begin = () => { if (!disposed && !interacted) { interacted = true; opening.start(); } };
    const fontDeadline = window.setTimeout(begin, 450);
    document.fonts.load('700 80px "Bairam Display"').then(begin, begin);
    return () => {
      disposed = true;
      clearTimeout(fontDeadline);
      opening.destroy();
      media.removeEventListener('change', onMotion);
      window.removeEventListener('keydown', onKey);
    };
  }, [onComplete, onPhase, sound]);

  return <main ref={stage} className="bairam-opening" data-phase={phase} data-ready={ready}>
    <h1 className="bairam-opening-word" aria-label="Balram becomes bAIram">
      <span className="bairam-opening-letters" aria-hidden="true">
        {['B', 'a', 'l'].map((letter, i) => <span className={`bairam-opening-slot bairam-opening-slot-${i}`} data-letter={i} key={letter}>
          <span data-from>{letter}</span><span data-to className={i > 0 ? 'bairam-opening-gold' : undefined}>{['b', 'A', 'I'][i]}</span>
        </span>)}
        {['r', 'a', 'm'].map((letter, i) => <span className={`bairam-opening-slot bairam-opening-slot-${i + 3}`} data-letter={i + 3} key={letter}>{letter}</span>)}
      </span>
    </h1>
    <div className="bairam-opening-flock" aria-hidden="true">{BATS.map((_, i) => <Bat key={i} />)}{FLYBY.map((bat, i) => <Bat pass near={bat.near} key={`pass-${i}`} />)}</div>
    <div className="bairam-opening-controls">
      <button ref={replay} type="button" onClick={() => triggerReplay.current()} aria-label="Replay opening">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M4 10a8 8 0 1 1 1.2 6M4 4v6h6" /></svg>
        Replay
      </button>
      {sound && <SoundToggle className="bairam-opening-sound" />}
      <button ref={skip} type="button" onClick={() => triggerSkip.current()} hidden={phase === 'complete'} aria-label="Skip opening">Skip <span aria-hidden="true">↗</span></button>
    </div>
    <p className="sr-only" role="status">{phase === 'complete' ? 'Opening complete.' : ''}</p>
    <noscript><style>{'.bairam-opening-controls{display:none!important}'}</style></noscript>
  </main>;
}
