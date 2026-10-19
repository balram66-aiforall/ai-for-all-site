'use client';

import { useEffect, useRef } from 'react';
import { MARKS, Mark } from './mark/marks';

/* The bAIram signal (Oct 19): a searchlight beam rises and the bAI Wing mark lights up in the sky as the section comes
   into view. It is light, not a dark bat in an oval. Without JavaScript, with reduced motion or in calm mode it is
   simply lit. The light switches on once and stays on. */
const wing = MARKS.find(m => m.id === 'wing')!;

export function SignalSky() {
  const sky = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = sky.current!;
    const calm = matchMedia('(prefers-reduced-motion: reduce)').matches || node.closest('main')?.dataset.motion === 'calm';
    if (calm || !('IntersectionObserver' in window)) { node.dataset.lit = 'on'; return; }
    node.dataset.lit = 'off';
    const io = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) { node.dataset.lit = 'on'; io.disconnect(); }
    }, { threshold: .35 });
    io.observe(node);
    return () => io.disconnect();
  }, []);
  return <div className="bj-signal-sky" ref={sky} aria-hidden="true">
    {/* The beam: narrow at a lamp low in the gutter between the columns, opening up and to the right onto the mark. */}
    <svg className="bj-signal-beam" viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        <linearGradient id="bj-beam-fade" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#e6b94f" stopOpacity="0" />
          <stop offset=".6" stopColor="#e6b94f" stopOpacity=".07" />
          <stop offset="1" stopColor="#e6b94f" stopOpacity=".16" />
        </linearGradient>
      </defs>
      <polygon points="54.5,100 56.5,100 95,13 79,9" fill="url(#bj-beam-fade)" />
    </svg>
    <span className="bj-signal-halo" />
    <Mark spec={wing} className="bj-signal-mark" />
  </div>;
}
