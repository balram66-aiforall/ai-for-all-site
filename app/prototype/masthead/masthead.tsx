'use client';

/* eslint-disable @next/next/no-html-link-for-pages -- This isolated preview uses existing, server-rendered content destinations. */
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { LoadingOpening } from '../loading/opening';
import { SoundToggle } from '../sound/sound-toggle';

// The bio: #who on the cave pages (its own stop after the masthead), the live home page's #about otherwise.
const aboutHref = (base: string) => (base === '' ? '#who' : `${base}#about`);
// base '/' points at the live home page's sections; the cave journey passes '' so the same links land on its own chambers.
const navLinks = (base: string) => [
  { label: 'Home', href: '#masthead', current: true },
  { label: 'Learn', href: `${base}#learn` },
  { label: 'Work', href: `${base}#projects` },
  { label: 'About', href: aboutHref(base) },
];
function Wordmark() { return <>b<span>AI</span>ram</>; }
function Arrow() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" /></svg>; }
/* AI-generated cave workstation (Workbench suit edit 2b27d3c9, looped with Seedance 2.0 run cb4cb463).
   The still is the loop's first frame, so the video can fade in over it without a jump. Phones get a crop centred on the desk. */
type Clip = { file: string; av1: string; avc: string };
const clips = {
  phone: { file: 'loop-phone', av1: 'av01.0.04M.10', avc: 'avc1.64001F' },
  laptop: { file: 'loop-desk-2560', av1: 'av01.0.12M.10', avc: 'avc1.640032' },
  large: { file: 'loop-desk-3840', av1: 'av01.0.12M.10', avc: 'avc1.640033' },
} satisfies Record<string, Clip>;
const phoneQuery = '(max-width: 760px)';
// Look-around follow time (seconds): about how long the view takes to catch most of the way up to the pointer.
const LOOK_LAG = .22;
const reduceQuery = '(prefers-reduced-motion: reduce)';
// The scene spans 108vw; only screens that need well over 2560 device pixels get the 4K file.
function pickClip(): Clip {
  if (matchMedia(phoneQuery).matches) return clips.phone;
  return innerWidth * 1.08 * devicePixelRatio > 3200 ? clips.large : clips.laptop;
}
// Data saver and reduced motion keep the still only.
function motionAllowed() {
  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
  return !saveData && !matchMedia(reduceQuery).matches && !matchMedia('(prefers-reduced-data: reduce)').matches;
}
function Scene({ hold, waking, paused, onMotion }: { hold: boolean; waking: boolean; paused: boolean; onMotion: (available: boolean) => void }) {
  const [failed, setFailed] = useState(false);
  const [clip, setClip] = useState<Clip | null>(null);
  const [videoFailed, setVideoFailed] = useState(false);
  const [shown, setShown] = useState(false);
  const [visible, setVisible] = useState(true);
  const image = useRef<HTMLImageElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  // The image can fail before hydration attaches onError, so check once on mount too.
  useEffect(() => { const node = image.current; if (node?.complete && node.naturalWidth === 0) setFailed(true); }, []);

  // Fetch the loop only after the page has loaded and any opening has finished, so it never competes with first paint.
  useEffect(() => {
    if (hold || clip || failed || videoFailed) return;
    let timer = 0;
    const start = () => { timer = window.setTimeout(() => { if (motionAllowed()) setClip(pickClip()); }, 400); };
    if (document.readyState === 'complete') start(); else addEventListener('load', start, { once: true });
    return () => { clearTimeout(timer); removeEventListener('load', start); };
  }, [hold, clip, failed, videoFailed]);

  // Reduced motion switched on mid-visit drops the video; crossing the phone breakpoint swaps to the matching crop.
  useEffect(() => {
    const reduce = matchMedia(reduceQuery), phone = matchMedia(phoneQuery);
    const onReduce = () => { if (reduce.matches) { setClip(null); setShown(false); } };
    const onPhone = () => { setShown(false); setClip(current => current && pickClip()); };
    reduce.addEventListener('change', onReduce);
    phone.addEventListener('change', onPhone);
    return () => { reduce.removeEventListener('change', onReduce); phone.removeEventListener('change', onPhone); };
  }, []);

  // Pause whenever the scene is off screen or the tab is hidden.
  useEffect(() => {
    const node = box.current;
    if (!node) return;
    let inView = true;
    const update = () => setVisible(inView && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; update(); });
    observer.observe(node);
    document.addEventListener('visibilitychange', update);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', update); };
  }, [failed]);

  useEffect(() => {
    const node = video.current;
    if (!node || !clip) return;
    node.muted = true;
    if (!hold && !waking && !paused && visible) node.play().catch(() => {}); else node.pause();
  }, [clip, hold, waking, paused, visible]);

  // Look around (Balram, Oct 19: "see other rooms ... just hovering"): on a mouse or trackpad the pointer steers the view
  // continuously. Pointer right = you turn right: the cave pans left and turns slightly, the side you look at comes
  // nearer. It follows with a short lag (critically damped), drifts home when the pointer leaves the window, and stops
  // while the scene is paused. Phones, touch and reduced motion keep the still frame. CSS reads --bm-look-x/-y in -1..1.
  useEffect(() => {
    const node = inner.current;
    const fine = matchMedia('(hover: hover) and (pointer: fine)');
    if (!node || paused || !fine.matches || matchMedia(reduceQuery).matches) return;
    node.dataset.look = 'on';
    const unit = (v: number) => (v < -1 ? -1 : v > 1 ? 1 : v);
    let frame = 0, last = 0, x = 0, y = 0, tx = 0, ty = 0;
    const step = (now: number) => {
      const dt = last ? Math.min(.05, (now - last) / 1000) : 1 / 60;
      last = now;
      const k = 1 - Math.exp(-dt / LOOK_LAG);
      x += (tx - x) * k; y += (ty - y) * k;
      node.style.setProperty('--bm-look-x', x.toFixed(4)); node.style.setProperty('--bm-look-y', y.toFixed(4));
      if (Math.abs(tx - x) + Math.abs(ty - y) > .0005) frame = requestAnimationFrame(step); else { frame = 0; last = 0; }
    };
    const aim = (nx: number, ny: number) => { tx = nx; ty = ny; if (!frame) frame = requestAnimationFrame(step); };
    const onMove = (event: PointerEvent) => { if (event.pointerType === 'touch') return; aim(unit(event.clientX / innerWidth * 2 - 1), unit(event.clientY / innerHeight * 2 - 1)); };
    const onOut = (event: MouseEvent) => { if (!event.relatedTarget) aim(0, 0); };
    addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('mouseout', onOut);
    return () => {
      removeEventListener('pointermove', onMove); document.removeEventListener('mouseout', onOut); cancelAnimationFrame(frame);
      delete node.dataset.look; node.style.removeProperty('--bm-look-x'); node.style.removeProperty('--bm-look-y');
    };
  }, [failed, paused]);

  const available = Boolean(clip) && shown && !failed;
  useEffect(() => { onMotion(available); }, [available, onMotion]);

  if (failed) return null;
  const stopVideo = () => { setVideoFailed(true); setClip(null); setShown(false); };
  return <div className="bm-scene" ref={box} data-motion={available ? (paused ? 'paused' : 'playing') : 'still'}>
    <div className="bm-scene-inner" ref={inner}>
    <picture>
      <source media={phoneQuery} type="image/avif" srcSet="/assets/masthead/suit-phone.avif" />
      <source media={phoneQuery} type="image/webp" srcSet="/assets/masthead/suit-phone.webp" />
      <source type="image/avif" srcSet="/assets/masthead/suit-desk-1600.avif 1600w, /assets/masthead/suit-desk-2400.avif 2400w" sizes="108vw" />
      <source type="image/webp" srcSet="/assets/masthead/suit-desk-1600.webp 1600w, /assets/masthead/suit-desk-2400.webp 2400w" sizes="108vw" />
      <img ref={image} src="/assets/masthead/suit-desk-2400.webp" width={2400} height={1029} alt="AI-generated art: an underground cave workstation, a figure in dark armour at a desk below a curved wall of data screens, beside a waterfall" decoding="async" onError={() => setFailed(true)} />
    </picture>
    {clip && <video key={clip.file} ref={video} className="bm-scene-video" data-shown={shown} muted playsInline loop preload="auto" aria-hidden="true" tabIndex={-1} disablePictureInPicture onLoadedData={() => setShown(true)} onError={stopVideo}>
      <source src={`/assets/masthead/${clip.file}.av1.mp4`} type={`video/mp4; codecs="${clip.av1}"`} />
      <source src={`/assets/masthead/${clip.file}.h264.mp4`} type={`video/mp4; codecs="${clip.avc}"`} onError={stopVideo} />
    </video>}
    <span className="bm-wake-screens" aria-hidden="true" />
    <span className="bm-wake-desk" aria-hidden="true" />
    {/* AI FOR ALL on the three plain desk screens (Balram, Oct 19: "Monitor one - AI, second one FOR, third - All"; caps).
        Decorative, so hidden from screen readers: the page already names AI For All. They ride the scene's mouse drift. */}
    <span className="bm-monitors" aria-hidden="true">
      <span className="bm-monitor" data-monitor="1">AI</span>
      <span className="bm-monitor" data-monitor="2">FOR</span>
      <span className="bm-monitor" data-monitor="3">ALL</span>
    </span>
    </div>
  </div>;
}
const pauseKey = 'bairam:scene-paused';
function PauseIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M8 5v14M16 5v14" /></svg>; }
function PlayIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M7 4.5v15l12-7.5z" /></svg>; }
function Navigation({ base, close }: { base: string; close?: () => void }) {
  return <>{navLinks(base).map(link => <a key={link.label} href={link.href} aria-current={link.current ? 'page' : undefined} onClick={close}>{link.label}</a>)}</>;
}
// On its own the masthead is the page's <main>; in the cave journey it becomes the first chamber inside one shared <main>.
function Landing({ journey, children }: { journey?: ReactNode; children: ReactNode }) {
  if (!journey) return <main className="bm-main" id="masthead">{children}</main>;
  return <main className="bm-journey-main"><div className="bj-stage"><div className="bm-main" id="masthead" data-chamber="masthead">{children}</div><div className="bj-passage" aria-hidden="true" /></div>{journey}</main>;
}
/* children: the cave journey's chambers. They join the masthead's <main>, so the page keeps one main landmark. */
/* sound: the cave map's Sound button in the controls and in the loading screen (other routes stay silent). */
export function Masthead({ base = '/', children, sound = false }: { base?: string; children?: ReactNode; sound?: boolean }) {
  const menu = useRef<HTMLDetailsElement>(null);
  const menuToggle = useRef<HTMLElement>(null);
  const replay = useRef<HTMLButtonElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [playing, setPlaying] = useState(false);
  const [enhanced, setEnhanced] = useState(false);
  const [motion, setMotion] = useState(false);
  const [scenePaused, setScenePaused] = useState(false);
  const [waking, setWaking] = useState(true);
  const page = useRef<HTMLDivElement>(null);
  const wakeRun = useRef(0);
  // Track the CSS wake-up; after an opening, restart it so the cave wakes as the overlay lifts.
  // lag delays the copy so it rises only after the opening's own wordmark has faded (hand-off case).
  const wake = useCallback((restart: boolean, lag = 0) => {
    const root = page.current;
    if (root && restart) { root.style.setProperty('--bm-text-lag', `${lag}s`); root.dataset.wakeReset = ''; void root.offsetWidth; delete root.dataset.wakeReset; }
    const runs = root ? root.getAnimations({ subtree: true }).filter((a): a is CSSAnimation => a instanceof CSSAnimation && a.animationName.startsWith('bm-wake')) : [];
    // A restart cancels the previous run; only the latest run may end the wake-up.
    const run = ++wakeRun.current;
    if (!runs.length) { setWaking(false); return; }
    setWaking(true);
    Promise.allSettled(runs.map(a => a.finished)).then(() => { if (run === wakeRun.current) setWaking(false); });
  }, []);
  const replayRequested = useRef(false);
  // The opening's bats take off over a fading veil while the cave wakes underneath: one continuous hand-off.
  const handedOff = useRef(false);
  const [handoff, setHandoff] = useState(false);
  const onOpeningPhase = useCallback((phase: string) => {
    if (phase !== 'flight' || handedOff.current) return;
    handedOff.current = true;
    setHandoff(true);
    wake(true, .9);
  }, [wake]);
  const toggleScene = () => {
    const next = !scenePaused;
    setScenePaused(next);
    try { localStorage.setItem(pauseKey, next ? '1' : '0'); } catch { /* storage blocked: choice lasts this visit */ }
  };
  const closeMenu = () => { if (menu.current) menu.current.open = false; };
  const finish = useCallback(() => {
    dialog.current?.close();
    setPlaying(false);
    if (!handedOff.current) wake(true);
    handedOff.current = false;
    setHandoff(false);
    if (replayRequested.current) replay.current?.focus();
    else heading.current?.focus({ preventScroll: true });
  }, [wake]);

  useEffect(() => {
    const root = menu.current!;
    const mobile = matchMedia('(max-width: 760px)');
    const onResize = () => { if (!mobile.matches) root.open = false; };
    const onOutside = (event: PointerEvent) => { if (event.target instanceof Node && !root.contains(event.target)) root.open = false; };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && root.open) { root.open = false; menuToggle.current?.focus(); }
    };
    const onBlur = (event: FocusEvent) => { if (event.relatedTarget instanceof Node && !root.contains(event.relatedTarget)) root.open = false; };
    root.addEventListener('focusout', onBlur);
    document.addEventListener('pointerdown', onOutside);
    document.addEventListener('keydown', onKey);
    mobile.addEventListener('change', onResize);
    // Progressively enhance after hydration; the masthead never depends on JS to be readable.
    const ready = requestAnimationFrame(() => {
      setEnhanced(true);
      wake(false);
      try { setScenePaused(localStorage.getItem(pauseKey) === '1'); } catch { /* storage blocked: default to playing */ }
      // The loading screen opens every fresh visit; ?intro=0 or a deep link (#section) goes straight to the masthead.
      if (new URLSearchParams(location.search).get('intro') !== '0' && !location.hash && !document.hidden) setPlaying(true);
    });
    return () => {
      cancelAnimationFrame(ready);
      root.removeEventListener('focusout', onBlur);
      document.removeEventListener('pointerdown', onOutside);
      document.removeEventListener('keydown', onKey);
      mobile.removeEventListener('change', onResize);
    };
  }, [wake]);

  // Layout effect: the dialog is open before the pre-veil goes, so no frame shows the bare masthead.
  useLayoutEffect(() => {
    if (!playing) return;
    const node = dialog.current!;
    node.showModal();
    return () => { if (node.open) node.close(); };
  }, [playing]);

  return <div ref={page} className="bm-page" data-opening={playing ? 'playing' : 'complete'} data-enhanced={enhanced} data-wake={waking ? 'running' : 'done'}>
    <a className="bm-skip" href="#masthead">Skip to introduction</a>
    <header className="bm-header">
      <a className="bm-brand" href="#masthead" aria-label="bAIram home"><Wordmark /></a>
      <nav className="bm-desktop-nav" aria-label="Main navigation"><Navigation base={base} /></nav>
      <a className="bm-connect" href="https://in.linkedin.com/in/balramr66">Contact me <Arrow /></a>
      <details ref={menu} className="bm-mobile-menu">
        <summary ref={menuToggle} aria-label="Navigation menu"><span>Menu</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h16M4 16h16" /></svg></summary>
        <nav aria-label="Mobile navigation"><Navigation base={base} close={closeMenu}/><a href="https://in.linkedin.com/in/balramr66" onClick={closeMenu}>Contact me <Arrow /></a></nav>
      </details>
    </header>
    <Landing journey={children}>
      <div className="bm-hero">
        <Scene hold={!enhanced || playing} waking={waking} paused={scenePaused} onMotion={setMotion} />
        <div className="bm-copy">
          <p className="bm-role">Balram R. <span aria-hidden="true">/</span> AI Marketing Lead, Amazon</p>
          <h1 ref={heading} tabIndex={-1} className="bm-title" aria-label="bAIram"><Wordmark /></h1>
          <div className="bm-introduction"><h2>I make AI accessible.</h2><p>Learn it simply. Put it to work. Build something that matters.</p></div>
          <div className="bm-actions" aria-label="Primary actions"><a className="bm-primary" href={`${base}#learn`}>Learn AI simply <Arrow /></a><a className="bm-secondary" href="/guides">Find your workflow <Arrow /></a></div>
        </div>
      </div>
      <div className="bm-bottom">
        <a className="bm-initiative" href={aboutHref(base)}>AI For All <span aria-hidden="true">↗</span></a>
        <div className="bm-socials" aria-label="Social links"><a href="https://in.linkedin.com/in/balramr66">LinkedIn <Arrow /></a><a href="https://github.com/balram66-aiforall">GitHub <Arrow /></a></div>
        <div className="bm-controls">
          {sound && <SoundToggle className="bm-sound-toggle" />}
          <button className="bm-scene-toggle" type="button" hidden={!motion} onClick={toggleScene}>{scenePaused ? <PlayIcon /> : <PauseIcon />}{scenePaused ? 'Play scene' : 'Pause scene'}</button>
          <button className="bm-replay" ref={replay} type="button" hidden={!enhanced} onClick={() => { closeMenu(); replayRequested.current = true; setPlaying(true); }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M4 10a8 8 0 1 1 1.2 6M4 4v6h6"/></svg>Replay opening</button>
        </div>
      </div>
    </Landing>
    {playing && <dialog className="bm-opening-dialog" ref={dialog} data-handoff={handoff || undefined} aria-label="bAIram opening" onCancel={event => { event.preventDefault(); finish(); }} onKeyDown={event => {
      if (event.key !== 'Tab') return;
      const controls = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('button')).filter(button => !button.hidden && getComputedStyle(button).visibility !== 'hidden');
      const first = controls[0], last = controls.at(-1);
      if (!first) { event.preventDefault(); return; }
      if (event.shiftKey && (document.activeElement === first || document.activeElement === event.currentTarget)) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || document.activeElement === event.currentTarget)) { event.preventDefault(); first.focus(); }
    }}><LoadingOpening onComplete={finish} onPhase={onOpeningPhase} sound={sound} /></dialog>}
  </div>;
}
