'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { chapters } from '../bairam/content';
import { Mark, MARKS } from '../bairam/mark/marks';
import { ART_HI, CaveDepth, CaveWorld, LABEL_MIN_PX, LABEL_SIZE } from './world';
import { DUST_F, NEAR_F, ROCKS, depthFade, layerTransform, rockSprite } from './depth';
import { cameraPhase, cutBats, setWaterfall } from '../sound/engine';
import { CAVE, ENTRY_END, buildPath, cameraAt, cameraTransform, smoothDamp, timeline, wideShot, type Box, type Gap, type Key, type Path, type World } from './camera';

/* The cave map journey: one shared world behind every chamber, and a camera that flies through it as you scroll.
   Same stages as Phase 1 (each chamber pins at its last screen while its passage scrolls by), but the passage is now
   real scroll distance and a flight: the chamber's copy fades, the camera flies to the next room (swooping back on
   desktop, panning across at full height on phones), the next copy rises in. The world is the painted cave (world.tsx).
   The camera rides one continuous curve (camera.ts): while you read it drifts slowly along the direction of travel and
   pushes in a touch, so it carries through every handoff instead of stopping. It follows the scroll through a critically
   damped spring (about 140 ms), so a mouse-wheel notch glides; the copy stays on the real scroll, so reading never lags.
   Room labels only show while no copy is on screen. Bats sweep across the two hardest cuts (masthead to map, and the
   arrival at the cave mouth). Only transform and opacity change per frame; layout is measured on resize only.
   Depth (step 4, depth.ts): out-of-focus rock and dust ride the camera at their own depth, and small loops run on the
   painting (waterfall, screens, cable light); the masthead's Pause scene stills them, reduced motion removes them.
   Reduced motion: no flights; the world cuts (a short fade) to each room as its chapter becomes current.
   No JavaScript: no world, a normal dark page. */

const clamp = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const ease = (t: number) => t * t * (3 - 2 * t);
const FOLLOW = .14;
// Jumps bigger than this (a keyboard End, a restored scroll) cut instead of fast-forwarding through every room.
const SNAP = 2.5;
const BATS = 9;
const wing = MARKS.find(m => m.id === 'wing')!;

function docTop(node: HTMLElement) {
  let y = 0;
  for (let n: HTMLElement | null = node; n; n = n.offsetParent as HTMLElement | null) y += n.offsetTop;
  return y;
}

export function MapJourney({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<HTMLDivElement>(null);
  const pulse = useRef<HTMLSpanElement>(null);
  const flock = useRef<HTMLDivElement>(null);
  const nearRef = useRef<HTMLDivElement>(null);
  const dustRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = root.current!, stage = worldRef.current!, camera = cameraRef.current!, flockEl = flock.current!, near = nearRef.current!, dust = dustRef.current!;
    const main = host.closest('main')!;
    const chambers = Array.from(main.querySelectorAll<HTMLElement>('.bj-stage > [data-chamber]'));
    const stages = chambers.map(node => node.parentElement!);
    const passages = stages.map(s => s.querySelector<HTMLElement>(':scope > .bj-passage'));
    const links = Array.from(host.querySelectorAll<HTMLAnchorElement>('.bj-chapters a'));
    const nodes = Array.from(host.querySelectorAll<HTMLElement>('.bj-cable-node'));
    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    const phone = matchMedia('(max-width: 760px)');
    const last = chambers.length - 1;
    // The first numbered chapter: masthead, Who is Balram? and the reveal come before it and have no chapter.
    const first = Math.max(0, chambers.findIndex(node => node.dataset.chamber === chapters[0].id));
    let boxes: Box[] = [], keys: Key[] = [], path: Path = buildPath([{ s: 0, shot: { x: 0, y: 0, w: 1 }, label: 'masthead', lift: 0 }]), gaps: Gap[] = [];
    const world: World = CAVE;
    let vh = innerHeight, vw = innerWidth, travel = 1, frame = 0, current = -1, marker = '', lit = -1, cut = '', cutTimer = 0;
    // The follower: where the camera is along the scroll (camS) and how fast it is moving there.
    let camS = -1, camV = 0, lastT = 0, label = '', flockIn = -1, open = '';
    // Sound: where the camera is looking (painting units) and the waterfall level last sent (only when sound is on).
    let view = { x: 0, y: 0, w: 1 }, water = -1, waterRef = 1;
    const mouth = world.zones.find(z => z.id === 'about')!;
    // How near the camera is to the cave mouth: falls off with distance (measured in screen widths of painting), and
    // with how far the camera has pulled back (the whole-map shot hears it from a distance).
    const nearMouth = (v: { x: number; y: number; w: number }) => clamp(1 - Math.hypot(v.x - mouth.x, v.y - mouth.y) / (v.w * .9)) * clamp(world.width / 2 / v.w);
    // Full at the cave mouth's own hold (whatever framing the layout gives it), quieter elsewhere; 0 on the masthead.
    const waterAt = (v: { x: number; y: number; w: number }) => clamp(nearMouth(v) / waterRef);
    // The sharp painting: fetched in the background once the page has loaded, put in place during a hold.
    const hiEl = host.querySelector<HTMLImageElement>('.bmap-art-hi')!, loEl = host.querySelector<HTMLImageElement>('.bmap-art-img')!;
    let hi: 'lo' | 'loading' | 'ready' | 'hi' | 'off' = 'lo', hiTimer = 0, hiProbe: HTMLImageElement | null = null;
    const written = new Map<Element, string>();
    const write = (node: HTMLElement, transform: string, opacity: string) => {
      const key = transform + '|' + opacity;
      if (written.get(node) === key) return;
      written.set(node, key);
      node.style.transform = transform;
      node.style.opacity = opacity;
    };
    const setData = (node: HTMLElement, name: string, value: string) => { if (node.dataset[name] !== value) node.dataset[name] = value; };

    const measure = () => {
      vh = innerHeight; vw = innerWidth;
      setData(stage, 'layout', phone.matches ? 'phone' : 'desktop');
      // The whole-map shot shrinks the painted room labels with the painting. Below a readable size (15px on screen)
      // they wait for the camera to come in; the legend under the map names every chapter meanwhile.
      setData(stage, 'revealLabels', LABEL_SIZE * vw / wideShot(world, vw / vh).w >= LABEL_MIN_PX ? 'on' : 'off');
      boxes = chambers.map((node, i) => {
        const top = docTop(stages[i]), height = node.offsetHeight;
        const stick = Math.min(0, vh - height);
        node.style.setProperty('--bj-top', `${stick}px`);
        const pass = passages[i]?.offsetHeight ?? 0;
        const dwell = Math.min(pass * .3, Math.max(0, vh * .3 - (height - vh)));
        return { id: node.dataset.chamber!, top, height, exit: top - stick + dwell, run: pass - dwell, settle: i === 0 ? 0 : top - vh * ENTRY_END };
      });
      travel = Math.max(1, document.documentElement.scrollHeight - vh);
      // The scroll timeline: hold on each room from the moment its chamber settles until it starts to leave,
      // fly to the next room during the passage. The masthead holds on the desk; the reveal holds on the whole map.
      ({ keys, gaps } = timeline(boxes, world, vw, vh, !phone.matches, travel));
      path = buildPath(keys);
      const atMouth = boxes.find(b => b.id === 'about');
      waterRef = (atMouth && nearMouth(cameraAt(path, Math.max(atMouth.settle, 0)))) || 1;
      nodes.forEach((node, index) => { node.style.transform = `translate3d(0, ${(60 + clamp(boxes[index + first].top / travel) * (vh - 120)).toFixed(1)}px, 0)`; });
      setData(stage, 'ready', 'true');
    };

    const loadHi = () => {
      const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
      if (hi !== 'lo') return;
      if (conn?.saveData || matchMedia('(prefers-reduced-data: reduce)').matches) { hi = 'off'; setData(stage, 'art', 'lo'); return; }
      // Same format the browser chose for the first paint; a JPEG-only browser keeps the first paint.
      const format = loEl.currentSrc.endsWith('.avif') ? 'avif' : loEl.currentSrc.endsWith('.webp') ? 'webp' : '';
      if (!format) { hi = 'off'; setData(stage, 'art', 'lo'); return; }
      const src = ART_HI[phone.matches ? 'phone' : 'desktop'][format];
      hi = 'loading'; setData(stage, 'art', 'loading');
      const probe = hiProbe = new Image();
      probe.decoding = 'async';
      probe.src = src;
      probe.decode().then(() => {
        if (hiProbe !== probe) return;
        hiEl.src = src;
        return hiEl.decode();
      }).then(() => {
        if (hiProbe !== probe) return;
        hi = 'ready'; setData(stage, 'art', 'ready'); schedule();
      }).catch(() => { if (hiProbe === probe) { hi = 'off'; setData(stage, 'art', 'lo'); } });
    };
    // Swap during a hold (or any time in calm mode): the camera is still, so the change is never mid-flight.
    const swapHi = (still: boolean) => {
      if (hi !== 'ready' || !still) return;
      hi = 'hi';
      hiEl.hidden = false;
      setData(stage, 'art', 'hi');
    };

    const update = () => {
      frame = 0;
      const s = scrollY;
      const calm = main.dataset.motion !== '3d';

      // Copy: fades and rises in, fades and lifts away. Never moves while you read it.
      chambers.forEach((node, i) => {
        const box = boxes[i];
        const top = box.top - s;
        const enter = i === 0 ? 1 : clamp((vh - top) / (vh * (1 - ENTRY_END)));
        const leave = i === last || box.run <= 0 ? 0 : clamp((s - box.exit) / box.run);
        if (enter >= 1 && leave <= 0) {
          if (node.dataset.passage) { delete node.dataset.passage; written.delete(node); node.style.transform = ''; node.style.opacity = ''; }
          return;
        }
        node.dataset.passage = enter > 0 && enter < 1 ? (enter < .5 ? 'arriving' : 'in') : leave > 0 && leave < 1 ? (leave < .5 ? 'out' : 'leaving') : 'away';
        // Copy clears early in a passage and returns late, so the flight itself is all world.
        const shown = ease(clamp((enter - .4) / .6)) * (1 - ease(clamp(leave / .35)));
        if (calm) { write(node, '', shown.toFixed(3)); return; }
        const y = (1 - ease(enter)) * vh * .08 - ease(leave) * vh * .06;
        write(node, `translate3d(0, ${y.toFixed(1)}px, 0)`, shown.toFixed(3));
      });

      // Camera
      if (calm) {
        camS = s; camV = 0;
        if (cut !== '') swapHi(true);
        // No flights: hold the room of the current chamber; when it changes, fade out, cut, fade in.
        const target = cameraAt(path, s).label;
        if (target !== cut) {
          const first = cut === '';
          cut = target;
          const apply = () => {
            const b = boxes.find(x => x.id === target)!;
            const { transform } = cameraTransform(cameraAt(path, Math.max(b.settle, 0)), vw, vh);
            camera.style.transform = transform;
            setData(stage, 'shot', target); setData(stage, 'phase', 'hold'); setData(stage, 'settled', 'true');
            view = cameraAt(path, Math.max(b.settle, 0));
            stage.style.opacity = '';
            swapHi(true);
          };
          clearTimeout(cutTimer);
          if (first) apply();
          else { stage.style.opacity = '0'; cutTimer = window.setTimeout(apply, 220); }
        }
      } else {
        cut = '';
        const t = performance.now(), dt = Math.min(.05, lastT ? (t - lastT) / 1000 : 1 / 60);
        lastT = t;
        if (camS < 0 || Math.abs(s - camS) > vh * SNAP) { camS = s; camV = 0; }
        else ({ value: camS, velocity: camV } = smoothDamp(camS, s, camV, FOLLOW, dt));
        const settled = Math.abs(s - camS) < .5 && Math.abs(camV) < 4;
        if (settled) { camS = s; camV = 0; lastT = 0; }
        const cam = cameraAt(path, camS);
        write(camera, cameraTransform(cam, vw, vh).transform, '');
        view = cam;
        cameraPhase(cam.phase, camV);
        // Depth: the rock and the dust ride the same shot at their own depth, fading as the camera pulls back to the map.
        const shown = depthFade(cam.w).toFixed(2);
        write(near, layerTransform(cam, vw, vh, NEAR_F), shown);
        write(dust, layerTransform(cam, vw, vh, DUST_F), shown);
        setData(stage, 'shot', cam.label);
        setData(stage, 'phase', cam.phase);
        setData(stage, 'settled', settled ? 'true' : 'false');
        swapHi(settled && cam.phase === 'hold');
        // Keep gliding until the camera catches the scroll, then go idle (no frames while nothing moves).
        if (!settled) schedule();
      }

      // The masthead keeps its own clean scene: the world stays hidden until the masthead's copy has faded (35% into its
      // leaving run), then fades in over the next 25%, inside the gap the bats cover. Same in calm mode.
      const mast = boxes[0], mastLeave = mast.run > 0 ? clamp((s - mast.exit) / mast.run) : 1;
      const openText = clamp((mastLeave - .35) / .25).toFixed(2);
      if (openText !== open) { open = openText; stage.style.setProperty('--bmap-open', openText); }
      const waterNow = Math.round(waterAt(view) * +openText * 50) / 50;
      if (waterNow !== water) { water = waterNow; setWaterfall(waterNow); }

      // Room labels: only in a gap between copy, ramping in and out at its edges. Bats cover the two hardest cuts.
      let lab = 0, inFlock = -1;
      gaps.forEach((g, j) => {
        if (s <= g.a || s >= g.b) return;
        const r = Math.min(vh * .15, (g.b - g.a) / 3);
        if (g.labels) lab = Math.max(lab, Math.min(clamp((s - g.a) / r), clamp((g.b - s) / r)));
        if (g.flock) inFlock = j;
      });
      const labText = lab.toFixed(2);
      if (labText !== label) { label = labText; stage.style.setProperty('--bmap-label', labText); }
      if (inFlock !== flockIn) {
        flockIn = inFlock;
        if (inFlock >= 0 && !calm) { flockEl.removeAttribute('data-run'); void flockEl.offsetWidth; flockEl.setAttribute('data-run', String(inFlock)); cutBats(); }
      }

      write(pulse.current!, `translate3d(0, ${(clamp(s / travel) * (vh - 120)).toFixed(1)}px, 0)`, '');

      // Chapter marker: the latest chapter chamber whose top has passed the viewport middle (masthead, bio and reveal have none).
      let now = 0;
      for (let i = first; i <= last; i++) if (boxes[i].top - s <= vh * .5) now = i - first + 1;
      if (now !== current) {
        current = now;
        links.forEach((link, index) => { if (index === now - 1) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current'); });
      }
      if (now !== lit) { lit = now; nodes.forEach((node, index) => { node.toggleAttribute('data-lit', index < now); }); }
      const show = now > 0 ? 'on' : 'off';
      if (show !== marker) { marker = show; host.dataset.marker = show; }
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest?.('a[href^="#"]') as HTMLAnchorElement | null;
      const target = link && link.hash.length > 1 ? document.getElementById(decodeURIComponent(link.hash.slice(1))) : null;
      const st = target?.closest<HTMLElement>('.bj-stage');
      if (!link || !target || !st) return;
      event.preventDefault();
      const chamber = st.firstElementChild as HTMLElement;
      let y = docTop(st);
      if (target !== st && target !== chamber) for (let n: HTMLElement | null = target; n && n !== chamber; n = n.offsetParent as HTMLElement | null) y += n.offsetTop;
      y -= parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
      scrollTo({ top: Math.max(0, y), behavior: main.dataset.motion === '3d' ? 'smooth' : 'auto' });
      if (location.hash !== link.hash) history.pushState(null, '', link.hash);
      if (!target.matches('a[href], button, input, select, textarea, [tabindex]')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    };
    document.addEventListener('click', onClick);
    const relayout = () => { written.clear(); cut = ''; label = ''; open = ''; water = -1; camS = -1; measure(); schedule(); };
    const setMode = () => { main.dataset.motion = reduce.matches ? 'calm' : '3d'; };
    const onReduce = () => { setMode(); requestAnimationFrame(relayout); };

    setMode();
    measure();
    setData(stage, 'art', 'lo');
    update();
    // After the page (and the first painting) has loaded, and the browser is idle, fetch the sharp one.
    // The near rocks' sprites are decoded up front, so the first rock to slide in never costs a frame.
    const decodeRocks = () => { if (main.dataset.motion === '3d') ROCKS.forEach((_, i) => { const img = new Image(); img.src = rockSprite(i); img.decode().catch(() => {}); }); };
    const startHi = () => { decodeRocks(); hiTimer = window.setTimeout(loadHi, 400); };
    if (document.readyState === 'complete') startHi(); else addEventListener('load', startHi, { once: true });
    const resize = new ResizeObserver(relayout);
    chambers.forEach(node => resize.observe(node));
    resize.observe(document.body);
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', relayout);
    reduce.addEventListener('change', onReduce);
    phone.addEventListener('change', relayout);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(cutTimer);
      clearTimeout(hiTimer);
      removeEventListener('load', startHi);
      hiProbe = null;
      resize.disconnect();
      removeEventListener('scroll', schedule);
      document.removeEventListener('click', onClick);
      removeEventListener('resize', relayout);
      reduce.removeEventListener('change', onReduce);
      phone.removeEventListener('change', relayout);
      delete main.dataset.motion;
      delete stage.dataset.ready;
      delete stage.dataset.art;
      stage.style.removeProperty('--bmap-open');
      flockEl.removeAttribute('data-run');
      setWaterfall(0);
      chambers.forEach(node => { node.style.transform = ''; node.style.opacity = ''; node.style.removeProperty('--bj-top'); delete node.dataset.passage; });
    };
  }, []);

  return <div className="bj-journey bmap" ref={root}>
    <div className="bmap-world" ref={worldRef} aria-hidden="true">
      <div className="bmap-camera" ref={cameraRef} style={{ width: CAVE.width, height: CAVE.height }}>
        <CaveWorld world={CAVE} />
      </div>
      <CaveDepth nearRef={nearRef} dustRef={dustRef} />
    </div>
    <nav className="bj-chapters" aria-label="Chapters">
      <ol>{chapters.map(c => <li key={c.id}><a href={`#${c.id}`}><span className="bj-chapters-n">{c.n}</span><span className="bj-chapters-name">{c.name}</span></a></li>)}</ol>
    </nav>
    {children}
    {/* The cover flock: the loader's bat, dark against the world, sweeping across the masthead-to-map and cave-mouth cuts. */}
    <div className="bmap-flock" ref={flock} aria-hidden="true" onAnimationEnd={event => { if ((event.target as Element).matches('.bmap-bat:last-child')) flock.current?.removeAttribute('data-run'); }}>
      {Array.from({ length: BATS }, (_, i) => (
        <svg key={i} className="bmap-bat" viewBox="-28 -16 56 32" style={{ ['--i' as string]: i }} focusable="false">
          <g className="bmap-wing"><path d="M-1-2 C-6-10-15-13-26-10 C-22-7-21-2-21 2 C-17-2-12-1-11 4 C-7 1-4 4-2 9 L0 3Z" /></g>
          <g className="bmap-wing"><path d="M1-2 C6-10 15-13 26-10 C22-7 21-2 21 2 C17-2 12-1 11 4 C7 1 4 4 2 9 L0 3Z" /></g>
          <path d="M-3-5 L-3-10 0-7 3-10 3-5 Q5 0 2 7 L0 11-2 7 Q-5 0-3-5Z" />
        </svg>
      ))}
    </div>
    <div className="bj-cable" aria-hidden="true">
      {chapters.map(c => <span key={c.id} className="bj-cable-node" />)}
      <span className="bj-cable-pulse bmap-pulse" ref={pulse}><Mark spec={wing} size={22} /></span>
    </div>
  </div>;
}

