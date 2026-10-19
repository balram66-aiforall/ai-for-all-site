/* The cave's sound. On by default; the Sound button mutes it, and a mute is remembered. Browsers only allow audio
   once the visitor has clicked, tapped or pressed a key (scrolling does not count), so on load it tries to start and,
   if the browser says no, starts at the first click, tap or key press instead.
   One AudioContext, created on first use. The music streams from an <audio> element routed through Web Audio
   (iOS ignores element.volume); the effects are small decoded buffers. Nothing is fetched until sound can play.
   Bat sounds follow the bats: no bats under reduced motion, so no bat sound either. */

// v2: sound became on by default (Oct 19); mutes saved under the old key while it was opt-in are not carried over.
const KEY = 'bairam:sound-v2';
const BASE = '/assets/bairam-map/sound/';
export const SOUND_FILES = {
  music: 'cave-theme.m4a',
  openingBats: 'bats-opening.m4a',
  cutBats: 'bats-cut.m4a',
  whooshGentle: 'whoosh-gentle.m4a',
  whooshFast: 'whoosh-fast.m4a',
  waterfall: 'waterfall.m4a',
  suitHum: 'suit-hum.m4a',
} as const;
type Effect = Exclude<keyof typeof SOUND_FILES, 'music'>;

// Levels, set by ear against the preview demos Balram approved (music low under the bats).
const LEVEL = { music: 0.32, duck: 0.55, openingBats: 0.9, cutBats: 0.8, cutDuck: 0.65, whoosh: 0.42, waterfall: 0.3, suitHum: 0.45 };
// A flight faster than this (scroll px per second) gets the fast whoosh.
const FAST_FLIGHT = 1800;
const MUSIC_FADE_IN = 3, FADE_OUT = 0.3;
// Opening bats: the music dips from just before the fly-by to the end of the fly-away (seconds on the opening clock).
const OPENING_DUCK = [0.8, 4.2] as const;

export type SoundState = { on: boolean; running: boolean };
const OFF: SoundState = { on: false, running: false };

let ctx: AudioContext | null = null;
let master: GainNode, duck: GainNode, musicGain: GainNode, fx: GainNode;
let music: HTMLAudioElement | null = null;
let musicStarted = false;
const buffers = new Map<Effect, Promise<AudioBuffer | null>>();
let on = false, running = false, initialised = false, mounted = 0, stopTimer = 0;
let snapshot: SoundState = OFF;
const listeners = new Set<() => void>();
const emit = () => { snapshot = { on, running }; listeners.forEach(listener => listener()); publishDebug(); };

export const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
export const getSnapshot = () => snapshot;
export const getServerSnapshot = () => OFF;

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

function context() {
  if (ctx) return ctx;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  ctx = new Ctor({ latencyHint: 'interactive' });
  master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
  duck = ctx.createGain(); duck.connect(master);
  musicGain = ctx.createGain(); musicGain.gain.value = 0; musicGain.connect(duck);
  fx = ctx.createGain(); fx.connect(master);
  return ctx;
}

function buffer(name: Effect) {
  let pending = buffers.get(name);
  if (!pending) {
    pending = fetch(BASE + SOUND_FILES[name]).then(r => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(String(r.status)))))
      .then(data => context().decodeAudioData(data)).catch(() => null);
    buffers.set(name, pending);
  }
  return pending;
}

const ramp = (param: AudioParam, value: number, seconds: number) => {
  const now = ctx!.currentTime;
  param.cancelScheduledValues(now);
  param.setValueAtTime(param.value, now);
  param.linearRampToValueAtTime(value, now + seconds);
};

/* Must run inside a click, tap or key handler (or after one has already unlocked the context). */
async function start() {
  clearTimeout(stopTimer);
  const c = context();
  if (!music) {
    music = new Audio(BASE + SOUND_FILES.music);
    music.loop = true;
    music.preload = 'auto';
    c.createMediaElementSource(music).connect(musicGain);
  }
  const playing = music.play().catch(() => undefined);
  await c.resume().catch(() => undefined);
  await playing;
  if (!on) return;  // turned off again while starting
  if (c.state !== 'running') { arm(); return; }  // still locked (e.g. Escape is not a gesture): wait for the next one
  if (running) return;  // the load-time try and a first click both got here
  disarm();
  running = true;
  ramp(master.gain, 1, 0.15);
  if (!musicStarted) { musicStarted = true; ramp(musicGain.gain, LEVEL.music, MUSIC_FADE_IN); }
  else ramp(musicGain.gain, LEVEL.music, 0.6);
  emit();
  (Object.keys(SOUND_FILES) as (keyof typeof SOUND_FILES)[]).forEach(name => { if (name !== 'music') void buffer(name); });
  playOpening();
  if (waterLevel > 0) setWaterfall(waterLevel);
}

function stop(suspend = true) {
  if (!ctx) { running = false; emit(); return; }
  ramp(master.gain, 0, FADE_OUT);
  stopOpening(0.05);
  stopWhoosh(0.1);
  running = false;
  emit();
  clearTimeout(stopTimer);
  stopTimer = window.setTimeout(() => { if (running) return; music?.pause(); if (suspend) void ctx?.suspend(); }, FADE_OUT * 1000 + 50);
}

/* Sound on but not yet allowed: the first click, tap or key anywhere starts it (a press on the Sound button itself is
   left to the button, which mutes). */
const GESTURES = ['pointerdown', 'keydown', 'touchend'] as const;
function onGesture(event: Event) {
  if (event.target instanceof Element && event.target.closest('[data-sound-toggle]')) return;
  if (on && !running) void start();
}
let armed = false;
function arm() { if (armed) return; armed = true; GESTURES.forEach(type => window.addEventListener(type, onGesture, { capture: true })); }
function disarm() { if (!armed) return; armed = false; GESTURES.forEach(type => window.removeEventListener(type, onGesture, { capture: true })); }

function onVisibility() {
  if (!on) return;
  if (document.hidden) { if (running) { stop(); running = false; resumeOnShow = true; emit(); } }
  else if (resumeOnShow) { resumeOnShow = false; void start(); }
}
let resumeOnShow = false;

/* On load: a browser that already allows audio here (Chrome does for sites you often play sound on) starts at once.
   Only an empty AudioContext is made to ask; nothing is fetched unless it is allowed. */
function tryAutoplay() {
  const c = context();
  const go = () => { if (on && !running && c.state === 'running') void start(); };
  if (c.state === 'running') { go(); return; }
  c.addEventListener('statechange', go, { once: true });
  void c.resume().catch(() => undefined);
}

/* A Sound button mounted: read the remembered choice once (on unless muted before). When the last button unmounts
   (the visitor left the page), everything goes quiet; the choice itself is kept. */
export function mountToggle() {
  mounted++;
  if (!initialised) {
    initialised = true;
    try { on = localStorage.getItem(KEY) !== '0'; } catch { on = true; }
    document.addEventListener('visibilitychange', onVisibility);
    emit();
  }
  if (mounted === 1 && on && !running) { arm(); tryAutoplay(); }
  return () => {
    if (--mounted > 0) return;
    disarm();
    if (running) stop();
  };
}

/* The Sound button (on = sound, off = muted). Runs inside its click handler, so turning on is always allowed. */
export function setSoundOn(next: boolean) {
  on = next;
  try { localStorage.setItem(KEY, next ? '1' : '0'); } catch { /* storage blocked: choice lasts this visit */ }
  if (next) void start();
  else { disarm(); resumeOnShow = false; stop(); }
  emit();
}

/* The loading screen's clock: the frame time its animation started (null when it ends, is skipped or has no bats).
   The bats sound starts at the matching point, also when sound is turned on part-way through. */
let openingStart: number | null = null;
let openingSource: { node: AudioBufferSourceNode; gain: GainNode } | null = null;
let lastOpening: { offset: number; elapsedAtCall: number } | null = null;
export function openingClock(startTime: number | null) {
  openingStart = startTime;
  if (startTime === null) { stopOpening(0.12); return; }
  playOpening();
}
function stopOpening(seconds: number) {
  const source = openingSource;
  openingSource = null;
  if (!source || !ctx) return;
  ramp(source.gain.gain, 0, seconds);
  try { source.node.stop(ctx.currentTime + seconds + 0.02); } catch { /* already stopped */ }
  ramp(duck.gain, 1, 0.4);
  publishDebug();
}
function playOpening() {
  if (!running || openingStart === null || reduced()) return;
  void buffer('openingBats').then(buf => {
    if (!buf || !running || openingStart === null || !ctx) return;
    const elapsed = (performance.now() - openingStart) / 1000;
    if (elapsed >= buf.duration - 0.3) return;
    stopOpening(0.04);
    const node = ctx.createBufferSource(), gain = ctx.createGain();
    node.buffer = buf; gain.gain.value = LEVEL.openingBats;
    node.connect(gain).connect(fx);
    const now = ctx.currentTime;
    node.start(now, Math.max(0, elapsed));
    openingSource = { node, gain };
    node.onended = () => { if (openingSource?.node === node) openingSource = null; publishDebug(); };
    lastOpening = { offset: Math.max(0, elapsed), elapsedAtCall: elapsed };
    duck.gain.cancelScheduledValues(now);
    duck.gain.setValueAtTime(duck.gain.value, now);
    duck.gain.setTargetAtTime(LEVEL.duck, now + Math.max(0, OPENING_DUCK[0] - elapsed), 0.15);
    duck.gain.setTargetAtTime(1, now + Math.max(0, OPENING_DUCK[1] - elapsed), 0.4);
    publishDebug();
  });
}

/* One-shot effect through the effects bus. Returns the playing node (or null when sound is off or not loaded). */
function shot(name: Effect, level: number) {
  if (!running || !ctx) return Promise.resolve(null);
  return buffer(name).then(buf => {
    if (!buf || !running || !ctx) return null;
    const node = ctx.createBufferSource(), gain = ctx.createGain();
    node.buffer = buf; gain.gain.value = level;
    node.connect(gain).connect(fx);
    node.start();
    counts[name] = (counts[name] ?? 0) + 1;
    return { node, gain };
  });
}
const counts: Partial<Record<Effect, number>> = {};
const dip = (to: number, hold: number) => {
  if (!ctx) return;
  const now = ctx.currentTime;
  duck.gain.cancelScheduledValues(now);
  duck.gain.setValueAtTime(duck.gain.value, now);
  duck.gain.setTargetAtTime(to, now, 0.12);
  duck.gain.setTargetAtTime(1, now + hold, 0.4);
};

/* The scroll cuts: the cover flock sweeps across (masthead to map, the cave mouth). No flock under reduced motion. */
export function cutBats() {
  if (!running || reduced()) return;
  void shot('cutBats', LEVEL.cutBats).then(played => { if (played) dip(LEVEL.cutDuck, 2.0); });
}

/* Camera flights. The journey reports the camera phase every frame it moves: a take-off (hold -> travel) plays a
   whoosh, fast or gentle by scroll speed; landing (travel -> hold) fades it. At most one whoosh per 0.9 s. */
let lastPhase = 'hold', whoosh: { node: AudioBufferSourceNode; gain: GainNode } | null = null, lastWhoosh = 0;
export function cameraPhase(phase: 'hold' | 'travel', speed: number) {
  if (phase === lastPhase) return;
  lastPhase = phase;
  if (phase === 'hold') { stopWhoosh(0.35); return; }
  if (!running || reduced() || !ctx || ctx.currentTime - lastWhoosh < 0.9) return;
  lastWhoosh = ctx.currentTime;
  const fast = Math.abs(speed) > FAST_FLIGHT;
  const level = LEVEL.whoosh * (0.7 + 0.3 * Math.min(1, Math.abs(speed) / (FAST_FLIGHT * 1.4)));
  void shot(fast ? 'whooshFast' : 'whooshGentle', level).then(played => {
    if (!played) return;
    stopWhoosh(0.05);
    whoosh = played;
    played.node.onended = () => { if (whoosh?.node === played.node) whoosh = null; };
  });
}
function stopWhoosh(seconds: number) {
  const w = whoosh; whoosh = null;
  if (!w || !ctx) return;
  ramp(w.gain.gain, 0, seconds);
  try { w.node.stop(ctx.currentTime + seconds + 0.02); } catch { /* already ended */ }
}

/* The waterfall: a seamless loop whose level follows how close the camera is to the cave mouth (0..1). */
let waterLevel = 0, water: { node: AudioBufferSourceNode; gain: GainNode } | null = null, waterStarting = false;
export function setWaterfall(level: number) {
  waterLevel = Math.max(0, Math.min(1, level));
  if (!running || !ctx) return;
  if (!water) {
    if (waterLevel <= 0.01 || waterStarting) return;
    waterStarting = true;
    void buffer('waterfall').then(buf => {
      waterStarting = false;
      if (!buf || !running || !ctx || water) return;
      const node = ctx.createBufferSource(), gain = ctx.createGain();
      node.buffer = buf; node.loop = true; gain.gain.value = 0;
      node.connect(gain).connect(fx);
      node.start();
      water = { node, gain };
      setWaterfall(waterLevel);
    });
    return;
  }
  const now = ctx.currentTime;
  water.gain.gain.cancelScheduledValues(now);
  water.gain.gain.setValueAtTime(water.gain.gain.value, now);
  water.gain.gain.setTargetAtTime(waterLevel * LEVEL.waterfall, now, 0.35);
}

/* Picking an AI-suit in the vault. */
export function suitPicked() { void shot('suitHum', LEVEL.suitHum); }

/* Read-only, live state for the browser checks (tests/sound-checks.mjs). */
function publishDebug() {
  if (typeof window === 'undefined' || '__caveSound' in window) return;
  Object.defineProperty(window, '__caveSound', {
    get: () => ({ on, running, context: ctx?.state ?? 'none', musicPaused: music ? music.paused : true, openingPlaying: !!openingSource, lastOpening, openingStart,
      played: { ...counts }, whooshPlaying: !!whoosh, waterfall: water ? +(water.gain.gain.value / LEVEL.waterfall).toFixed(2) : 0, waterTarget: waterLevel }),
  });
}
