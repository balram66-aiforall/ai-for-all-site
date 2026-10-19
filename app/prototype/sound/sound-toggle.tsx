'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { getServerSnapshot, getSnapshot, mountToggle, setSoundOn, subscribe } from './engine';

function SoundIcon({ on }: { on: boolean }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" />
    {on ? <path d="M15.5 9a4.5 4.5 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11" /> : <path d="M16 9.5l5 5M21 9.5l-5 5" />}
  </svg>;
}

const noop = () => () => {};

/* One toggle for all of the cave's sound, on by default. Label stays "Sound"; pressed (gold) = on, not pressed = muted.
   "waiting" = on, but the browser has not allowed audio yet (it starts at the first click, tap or key press): it
   pulses, and a click on it starts the sound (that click is the gesture the browser wants) instead of muting.
   Rendered only after hydration: without JS there is no sound to control. */
export function SoundToggle({ className }: { className?: string }) {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  useEffect(() => mountToggle(), []);
  if (!hydrated) return null;
  const waiting = state.on && !state.running;
  return <button type="button" className={className} data-sound-toggle={state.running ? 'on' : waiting ? 'waiting' : 'off'} aria-pressed={state.on}
    title={waiting ? 'Click for sound' : undefined} onClick={() => setSoundOn(waiting || !state.on)}>
    <SoundIcon on={state.on} />Sound
  </button>;
}
