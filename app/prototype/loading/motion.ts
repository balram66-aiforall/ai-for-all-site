/** The intro is choreography, never a measure of network loading. */
// Balram holds, a flock flies across it, the letters change behind the bats, bAIram holds, then the bats fly away.
export const TIMING = { flyby: 900, morph: 1320, morphEnd: 1720, flight: 2500, fade: 2980, fadeEnd: 3550, end: 4260, reducedMorph: 900, reducedMorphEnd: 1380, reducedEnd: 1700 } as const;
export type Phase = 'balram' | 'flyby' | 'transforming' | 'bairam' | 'flight' | 'complete';
export const clamp = (n: number) => Math.min(1, Math.max(0, n));
const smooth = (n: number) => { const t = clamp(n); return t * t * (3 - 2 * t); };
/** Each letter changes in a quick shadow cut centred on the moment a near bat crosses it (reduced motion keeps the gentle crossfade). */
export const LETTER_SWAP = [1400, 1520, 1640] as const;
export function letterMix(time: number, index: number, reduced = false) {
  if (reduced) return smooth((time - TIMING.reducedMorph - index * 45) / 390);
  return smooth((time - LETTER_SWAP[index] + 100) / 200);
}
/** The name dims a little while the fly-by flock crosses it, so the letter change reads as hidden behind the bats. */
export function passDim(time: number) {
  return 1 - 0.2 * smooth((time - 1150) / 250) * (1 - smooth((time - 1750) / 300));
}
export function phaseAt(time: number, reduced: boolean): Phase {
  if (reduced) {
    if (time >= TIMING.reducedEnd) return 'complete';
    if (time >= TIMING.reducedMorphEnd) return 'bairam';
    return time >= TIMING.reducedMorph ? 'transforming' : 'balram';
  }
  if (time >= TIMING.end) return 'complete';
  if (time >= TIMING.flight) return 'flight';
  if (time >= TIMING.morphEnd) return 'bairam';
  if (time >= TIMING.morph) return 'transforming';
  return time >= TIMING.flyby ? 'flyby' : 'balram';
}

// Fixed seeds keep Replay identical. No random values during hydration or playback.
export const BATS = Array.from({ length: 22 }, (_, i) => ({
  letter: [1, 2, 0, 3, 4, 5, 1, 2, 4, 0, 5][i % 11],
  delay: TIMING.flight + (i % 8) * 44 + Math.floor(i / 8) * 39,
  duration: 1010 + (i % 5) * 95,
  near: i === 6 || i === 13 || i === 19,
  side: (i % 2 === 0 ? -1 : 1),
  spread: 0.19 + ((i * 7) % 13) / 18,
  lift: 0.2 + ((i * 11) % 17) / 24,
  startX: 0.24 + ((i * 3) % 7) * 0.075,
  startY: 0.31 + ((i * 5) % 7) * 0.052,
}));
// The fly-by flock: crosses the name left to right while B, a, l change, and is gone before the flight.
// Four large near bats; the first three cover B, a and l as each one changes. Eight distant bats add depth.
// Delays put bat i's body over letter i at LETTER_SWAP[i] (letter centres sit near 20%, 32% and 44% of the stage width).
const NEAR_PASS = [{ delay: 1159, band: 0.34 }, { delay: 1193, band: 0.6 }, { delay: 1231, band: 0.44 }, { delay: 1040, band: 0.1 }];
export const FLYBY = [
  ...NEAR_PASS.map((bat, i) => ({ ...bat, duration: 840, near: true, arc: (i % 2 === 0 ? 1 : -1) * 0.05 })),
  ...Array.from({ length: 8 }, (_, i) => ({
    delay: TIMING.flyby + (i % 4) * 90 + Math.floor(i / 4) * 45,
    duration: 820 + (i % 4) * 20,
    near: false,
    band: -0.14 + ((i * 5) % 8) / 5.6,
    arc: (i % 2 === 0 ? 1 : -1) * (0.06 + (i % 3) * 0.04),
  })),
];
type Box = { x: number; y: number; width: number; height: number };
export function flybyPose(index: number, time: number, word: Box, width: number) {
  const bat = FLYBY[index];
  const t = clamp((time - bat.delay) / bat.duration);
  const travel = t * (0.86 + 0.14 * t);
  const x = -0.12 * width + travel * 1.24 * width;
  const y = word.y + word.height * bat.band - Math.sin(t * Math.PI) * word.height * bat.arc + Math.sin(t * Math.PI * 3 + index) * word.height * 0.035;
  const size = Math.min(1.3, Math.max(0.35, word.height / 260));
  const scale = size * (bat.near ? 2.5 + (index % 2) * 0.35 : 0.5 + (index % 5) * 0.12);
  const opacity = t <= 0 || t >= 1 ? 0 : smooth(t / 0.06) * (1 - smooth((t - 0.94) / 0.06)) * (bat.near ? 0.94 : 0.72);
  const bank = 4 + Math.sin(t * Math.PI * 2 + index) * 9;
  const flap = Math.sin(t * Math.PI * (bat.near ? 9 : 13) + index * 0.9);
  return { x, y, scale, opacity, bank, flap, t };
}
type Point = { x: number; y: number };
export function batPose(index: number, time: number, origin: Point, width: number, height: number) {
  const bat = BATS[index];
  const t = clamp((time - bat.delay) / bat.duration);
  const travel = t * t * (0.7 + 0.3 * t);
  const dx = bat.side * width * bat.spread;
  const dy = -height * bat.lift;
  const x = origin.x + dx * travel + Math.sin(t * Math.PI) * bat.side * 26;
  const y = origin.y + dy * (t * 0.32 + t * t * 0.68) + Math.sin(t * Math.PI * 2 + index) * 7 * Math.sin(t * Math.PI);
  const scale = bat.near ? 0.05 + t ** 2.1 * Math.min(4.8, width / 270) : 0.05 + Math.sin(t * Math.PI * 0.88) * (0.42 + index % 3 * 0.16);
  const opacity = smooth(t / 0.085) * (1 - smooth((t - 0.73) / 0.27)) * (bat.near ? 0.88 : 0.76);
  const bank = bat.side * (8 + Math.sin(t * Math.PI) * 27);
  const flap = Math.sin(t * Math.PI * (bat.near ? 11 : 15) + index * 0.7);
  return { x, y, scale, opacity, bank, flap, t };
}

type Elements = {
  stage: HTMLElement;
  word: HTMLElement;
  slots: HTMLElement[];
  from: HTMLElement[];
  to: HTMLElement[];
  bats: SVGSVGElement[];
  flyby: SVGSVGElement[];
};
/* onClock (optional): the frame time the animation started, or null when it stops. Sound syncs to it. Reduced
   motion has no bats, so it reports null. */
type Options = { reduced: boolean; onPhase: (phase: Phase) => void; onClock?: (start: number | null) => void };

/** Owns exactly one RAF, no timers. Unmount, Skip and hidden tabs cancel it. */
export function createOpening(elements: Elements, options: Options) {
  let raf = 0;
  let disposed = false;
  let active = false;
  let reduced = options.reduced;
  let startTime: number | null = null;
  let lastPhase: Phase | null = null;
  let width = 1, height = 1;
  let origins: Point[] = [];
  let word: Box = { x: 0, y: 0, width: 1, height: 1 };
  const wingsOf = (bat: SVGSVGElement) => [bat.querySelector<SVGGElement>('[data-wing="left"]')!, bat.querySelector<SVGGElement>('[data-wing="right"]')!];
  const wings = elements.bats.map(wingsOf);
  const passWings = elements.flyby.map(wingsOf);
  const publish = (phase: Phase) => {
    if (lastPhase !== phase) { lastPhase = phase; options.onPhase(phase); }
  };
  function measure() {
    const stage = elements.stage.getBoundingClientRect();
    width = stage.width; height = stage.height;
    const box = elements.word.getBoundingClientRect();
    word = { x: box.left - stage.left, y: box.top - stage.top, width: box.width, height: box.height };
    origins = BATS.map(bat => {
      const slot = elements.slots[bat.letter].getBoundingClientRect();
      return { x: slot.left - stage.left + slot.width * bat.startX, y: slot.top - stage.top + slot.height * bat.startY };
    });
  }
  function hideBats() { [...elements.bats, ...elements.flyby].forEach(bat => { bat.style.opacity = '0'; }); }
  function pose(bat: SVGSVGElement, wing: SVGGElement[], p: { x: number; y: number; scale: number; opacity: number; bank: number; flap: number }) {
    bat.style.opacity = String(p.opacity);
    if (p.opacity === 0) return;
    bat.style.transform = `translate3d(${p.x}px,${p.y}px,0) translate(-50%,-50%) rotate(${p.bank}deg) scale(${p.scale})`;
    wing[0].setAttribute('transform', `rotate(${-p.flap * 26}) scale(1,${0.66 + p.flap * 0.3})`);
    wing[1].setAttribute('transform', `rotate(${p.flap * 26}) scale(1,${0.66 + p.flap * 0.3})`);
  }
  function render(time: number) {
    elements.word.style.opacity = String(reduced ? 1 : smooth((time + 100) / 320) * passDim(time) * (1 - smooth((time - TIMING.fade) / (TIMING.fadeEnd - TIMING.fade))));
    elements.from.forEach((letter, i) => {
      const mix = letterMix(time, i, reduced);
      if (reduced) { letter.style.opacity = String(1 - mix); elements.to[i].style.opacity = String(mix); return; }
      // Shadow cut: the old letter darkens under the passing bat, the new one brightens out of the shadow. Never both at once.
      letter.style.opacity = String(mix < 0.5 ? 1 - 0.75 * smooth(mix * 2) : 0);
      elements.to[i].style.opacity = String(mix < 0.5 ? 0 : 0.25 + 0.75 * smooth((mix - 0.5) * 2));
    });
    if (!reduced) {
      elements.flyby.forEach((bat, i) => pose(bat, passWings[i], flybyPose(i, time, word, width)));
      elements.bats.forEach((bat, i) => pose(bat, wings[i], batPose(i, time, origins[i], width, height)));
    }
    publish(phaseAt(time, reduced));
  }
  function stop() { cancelAnimationFrame(raf); raf = 0; active = false; }
  function finish() {
    if (disposed) return;
    stop();
    options.onClock?.(null);
    elements.from.forEach((letter, i) => { letter.style.opacity = '0'; elements.to[i].style.opacity = '1'; });
    elements.word.style.opacity = reduced ? '1' : '0';
    hideBats();
    publish('complete');
  }
  function tick(now: number) {
    if (!active || disposed) return;
    if (startTime === null) { startTime = now; options.onClock?.(reduced ? null : now); }
    const time = now - startTime;
    render(time);
    if (time >= (reduced ? TIMING.reducedEnd : TIMING.end)) { finish(); return; }
    raf = requestAnimationFrame(tick);
  }
  function start() {
    if (disposed) return;
    stop();
    startTime = null;
    active = true;
    measure(); hideBats(); render(0);
    if (document.hidden) { finish(); return; }
    raf = requestAnimationFrame(tick);
  }
  const resize = () => { if (active) measure(); };
  const visibility = () => { if (document.hidden && active) finish(); };
  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', visibility);
  return {
    start,
    skip: finish,
    setReducedMotion(value: boolean) {
      reduced = value;
      if (value) { hideBats(); finish(); }
    },
    destroy() {
      disposed = true; stop(); hideBats(); options.onClock?.(null);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', visibility);
    },
  };
}
