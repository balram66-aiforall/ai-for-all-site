'use client';

/* Loop on its screen. The frame is drawn once the page is running, so React sees its load event (a frame drawn by the server
   can finish loading before React is listening, and the page would wrongly think it never loaded); without JavaScript the
   <noscript> copy shows it straight away. If Loop has not loaded after SLOW_MS, the way out to the original is also shown as a
   pill at the foot of the screen (not a cover: Loop may already be drawn and usable while its last files arrive), announced
   politely to screen readers. A frame refused by Loop's host still fires load (with the browser's error page),
   so the link in the bar is always there too. */
import { useEffect, useState, useSyncExternalStore } from 'react';
import { Arrow } from '../masthead/site-header';
import { loop } from '../bairam/content';

export const SLOW_MS = 8000;
// What Loop may do inside bAIram: run, keep its own storage (its origin, not ours), use forms, open its outside links in a new
// tab as a normal page, and take over the whole tab only when a visitor clicks a link meant to (target="_top").
const SANDBOX = 'allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation';
const TITLE = `${loop.name} — ${loop.tagline}`;

function Frame({ onLoad }: { onLoad?: () => void }) {
  return <iframe className="lp-frame" src={loop.href} title={TITLE} sandbox={SANDBOX}
    referrerPolicy="strict-origin-when-cross-origin" onLoad={onLoad} />;
}

export function OpenLoop({ className }: { className: string }) {
  return <a className={className} href={loop.href} target="_blank" rel="noopener noreferrer">{loop.open} <Arrow /></a>;
}

// false while the server draws the page and while React takes it over, true once the page is running in the browser.
const noop = () => () => {};
const useRunning = () => useSyncExternalStore(noop, () => true, () => false);

export function LoopScreen() {
  const running = useRunning();
  const [arrived, setArrived] = useState<'loading' | 'ready' | 'slow'>('loading');
  useEffect(() => {
    const slow = setTimeout(() => setArrived(s => (s === 'loading' ? 'slow' : s)), SLOW_MS);
    return () => clearTimeout(slow);
  }, []);
  const state = running ? arrived : 'server';
  return <div className="lp-screen" data-state={state} aria-busy={state === 'loading'}>
    {state === 'server' ? <noscript><Frame /></noscript> : <Frame onLoad={() => setArrived('ready')} />}
    <div className="lp-slow" role="status">{state === 'slow' && <OpenLoop className="bj-link lp-open" />}</div>
  </div>;
}
