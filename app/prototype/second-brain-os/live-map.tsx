'use client';

/* The live map on the Second Brain OS wing: every page a point of light, every link between two pages a thread.
   Hover (or focus, or tap) a point for its title and summary; click to read. A shelf button glides the view to that shelf.
   Pages this visitor has read to the end stay lit (trail.ts; kept in this browser only). Light runs along the threads,
   from the point under the pointer when there is one; it runs only while the map is on screen, and never for reduced motion.
   Two layouts ship (wide for desktops, tall for phones); CSS shows one, and only that one redraws as you explore. Without
   JavaScript every point is still a link, and the shelves below the map link every section too. */
import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent, type MouseEvent, type PointerEvent } from 'react';
import { flushSync } from 'react-dom';
import type { MapData, MapLayout, MapNode } from './map-data';
import { clearTrail, lastPage, watchTrail } from './trail';

type Mode = 'wide' | 'tall';
const MODES: Mode[] = ['wide', 'tall'];
type Card = { x: number; y: number; flip: boolean; below: boolean };
const EMPTY = new Set<number>();
// Media queries, made once and read live (their .matches follows the setting).
let queries: { phone: MediaQueryList; still: MediaQueryList } | null = null;
const mq = () => (queries ??= { phone: window.matchMedia('(max-width: 760px)'), still: window.matchMedia('(prefers-reduced-motion: reduce)') });
const still = () => mq().still.matches;
const activeMode = (): Mode => (mq().phone.matches ? 'tall' : 'wide');
const connections = (n: number) => (n === 1 ? '1 connected page' : `${n} connected pages`);

// The view box that shows one shelf: its points with a margin, widened to the map's own shape, never closer than 2.6x.
function fit([x0, y0, x1, y1]: [number, number, number, number], L: MapLayout) {
  const aspect = L.w / L.h; let w = x1 - x0 + 70, h = y1 - y0 + 70;
  if (w / h < aspect) w = h * aspect; else h = w / aspect;
  if (w < L.w / 2.6) { w = L.w / 2.6; h = w / aspect; }
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  return [Math.max(0, Math.min(L.w - w, cx - w / 2)), Math.max(0, Math.min(L.h - h, cy - h / 2)), Math.min(w, L.w), Math.min(h, L.h)];
}

// What a layout needs from the map: a stable hub that registers its elements and hands over the current handlers, so a
// layout redraws only when what it shows changes.
type Api = { onMove: (e: PointerEvent<SVGSVGElement>, m: Mode) => void; onClick: (e: MouseEvent<SVGSVGElement>, m: Mode) => void; onKey: (e: KeyboardEvent<SVGSVGElement>, m: Mode) => void;
  onLeave: (e: PointerEvent<SVGSVGElement>) => void; onFocus: (i: number, m: Mode) => void; onBlur: (next: Element | null) => void; setPointer: (t: string) => void };
type Hub = { svg: (m: Mode, el: SVGSVGElement | null) => void; sparks: (m: Mode, el: SVGGElement | null) => void; api: () => Api };
type LayerProps = { mode: Mode; L: MapLayout; nodes: MapNode[]; edges: [number, number][]; shelves: MapData['shelves']; hot: number | null; hotNear: Set<number>;
  shelf: string; cursor: number; read: Set<string>; hub: Hub };

const Layer = memo(function Layer({ mode, L, nodes, edges, shelves, hot, hotNear, shelf, cursor, read, hub }: LayerProps) {
  const inShelf = (i: number) => shelf === 'all' || nodes[i].shelf === shelf;
  return <svg ref={el => hub.svg(mode, el)} className={`sb-map-svg sb-map-${mode}`} viewBox={`0 0 ${L.w} ${L.h}`} role="group"
    aria-label={`Map of all ${nodes.length} pages and the links between them`} aria-describedby="sb-map-hint"
    onPointerDown={e => hub.api().setPointer(e.pointerType)} onPointerMove={e => hub.api().onMove(e, mode)} onPointerLeave={e => hub.api().onLeave(e)}
    onClick={e => hub.api().onClick(e, mode)} onKeyDown={e => hub.api().onKey(e, mode)}>
    <g className="sb-map-names" aria-hidden="true">
      {shelves.map(s => { const b = L.boxes[s.id], end = s.id === 'resources'; return b && <text key={s.id} data-shelf={s.id} x={end ? b[2] - 4 : b[0] + 4} y={b[1] - 8} textAnchor={end ? 'end' : undefined}>{s.title}</text>; })}
    </g>
    <g className="sb-map-threads" aria-hidden="true">
      {edges.map(([a, b], k) => <line key={k} x1={L.points[a][0]} y1={L.points[a][1]} x2={L.points[b][0]} y2={L.points[b][1]}
        className={hot !== null && (a === hot || b === hot) ? 'is-lit' : shelf !== 'all' && !inShelf(a) && !inShelf(b) ? 'is-dim' : undefined} />)}
    </g>
    <g className="sb-map-sparks" aria-hidden="true" ref={el => hub.sparks(mode, el)} />
    <g className="sb-map-points">
      {nodes.map((n, i) => {
        const dim = !inShelf(i) || (hot !== null && hot !== i && !hotNear.has(i));
        const cls = ['sb-map-point', read.has(n.url) && 'is-read', hot === i && 'is-hot', hotNear.has(i) && 'is-near', dim && 'is-dim', n.index && 'is-index'].filter(Boolean).join(' ');
        return <a key={n.url} href={n.url} data-i={i} data-shelf={n.shelf} className={cls} tabIndex={i === cursor ? 0 : -1}
          aria-label={`${n.title}, ${n.place}${read.has(n.url) ? ', read' : ''}`} aria-describedby={i === cursor ? 'sb-map-desc' : undefined}
          onFocus={() => hub.api().onFocus(i, mode)} onBlur={e => hub.api().onBlur(e.relatedTarget as Element | null)}>
          <circle className="sb-map-halo" cx={L.points[i][0]} cy={L.points[i][1]} r={n.r + 5} />
          <circle className="sb-map-dot" cx={L.points[i][0]} cy={L.points[i][1]} r={n.r} />
        </a>;
      })}
    </g>
  </svg>;
});

export function LiveMap({ data }: { data: MapData }) {
  const { nodes, edges, shelves } = data;
  const [hot, setHot] = useState<number | null>(null);
  const [card, setCard] = useState<Card | null>(null);
  const [pinned, setPinned] = useState(false);
  const [shelf, setShelf] = useState<string>('all');
  const [cursor, setCursor] = useState(0);
  const [read, setRead] = useState<Set<string>>(() => new Set());
  const [last, setLast] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>('wide');
  const [ready, setReady] = useState(false);
  const [said, setSaid] = useState('');
  const stage = useRef<HTMLDivElement>(null);
  const cardLink = useRef<HTMLAnchorElement>(null);
  const svgs = useRef<Record<Mode, SVGSVGElement | null>>({ wide: null, tall: null });
  const sparks = useRef<Record<Mode, SVGGElement | null>>({ wide: null, tall: null });
  const view = useRef<Record<Mode, number[]>>({ wide: [0, 0, data.wide.w, data.wide.h], tall: [0, 0, data.tall.w, data.tall.h] });
  const tween = useRef<Record<Mode, number>>({ wide: 0, tall: 0 });
  const pointer = useRef('mouse');
  const hotRef = useRef<number | null>(null);
  const shelfRef = useRef('all');

  const near = useMemo(() => { const n = nodes.map(() => [] as number[]); for (const [a, b] of edges) { n[a].push(b); n[b].push(a); } return n; }, [nodes, edges]);
  const threadsOf = useMemo(() => { const t = nodes.map(() => [] as number[]); edges.forEach(([a, b], k) => { t[a].push(k); t[b].push(k); }); return t; }, [nodes, edges]);
  const hotNear = useMemo(() => (hot === null ? EMPTY : new Set(near[hot])), [hot, near]);
  const inShelf = useCallback((i: number) => shelf === 'all' || nodes[i].shelf === shelf, [shelf, nodes]);

  useEffect(() => { hotRef.current = hot; }, [hot]);
  useEffect(() => { shelfRef.current = shelf; }, [shelf]);
  const close = useCallback(() => { setHot(null); setPinned(false); }, []);
  useEffect(() => {
    const stop = watchTrail(r => { setRead(r); setLast(lastPage()); setSaid(''); }); // a fresh change clears the last announcement
    // The layout on show, and a card that no longer sits on its point after a resize closes.
    const onPhone = () => { setMode(activeMode()); close(); };
    mq().phone.addEventListener('change', onPhone); window.addEventListener('resize', close);
    const id = requestAnimationFrame(() => { setMode(activeMode()); setReady(true); });
    return () => { stop(); cancelAnimationFrame(id); mq().phone.removeEventListener('change', onPhone); window.removeEventListener('resize', close); };
  }, [close]);

  // A pinned card (opened by a tap) closes on a tap anywhere else; its link takes focus, so a screen reader hears it.
  useEffect(() => {
    if (!pinned) return;
    cardLink.current?.focus({ preventScroll: true });
    const away = (e: Event) => { if (!stage.current?.contains(e.target as Node)) close(); };
    document.addEventListener('pointerdown', away);
    return () => document.removeEventListener('pointerdown', away);
  }, [pinned, close]);

  const show = useCallback((i: number, m: Mode) => {
    const svg = svgs.current[m], box = stage.current?.getBoundingClientRect(), ctm = svg?.getScreenCTM();
    if (!svg || !box || !ctm) return;
    const [x, y] = data[m].points[i], p = new DOMPoint(x, y).matrixTransform(ctm);
    setCard({ x: p.x - box.left, y: p.y - box.top, flip: p.x - box.left > box.width * 0.58, below: p.y - box.top < 170 });
    setHot(i);
  }, [data]);

  // The point under the pointer: the link itself when the pointer is on one, else the nearest within reach in the shelf on show.
  const pick = useCallback((m: Mode, target: EventTarget, cx: number, cy: number, reach: number) => {
    const own = (target as Element).closest?.('a.sb-map-point')?.getAttribute('data-i');
    if (own != null) return Number(own);
    const ctm = svgs.current[m]?.getScreenCTM(); if (!ctm) return null;
    const p = new DOMPoint(cx, cy).matrixTransform(ctm.inverse()), L = data[m];
    let best: number | null = null, bestD = Infinity;
    nodes.forEach((n, i) => { if (!inShelf(i)) return; const d = Math.hypot(L.points[i][0] - p.x, L.points[i][1] - p.y) * ctm.a; if (d < bestD) { bestD = d; best = i; } });
    return best !== null && bestD <= reach + nodes[best].r * ctm.a ? best : null;
  }, [data, nodes, inShelf]);

  const zoomTo = useCallback((id: string) => {
    for (const m of MODES) {
      const L = data[m], svg = svgs.current[m]; if (!svg) continue;
      const to = id === 'all' ? [0, 0, L.w, L.h] : fit(L.boxes[id], L), from = view.current[m].slice();
      const paint = (v: number[]) => { view.current[m] = v; svg.setAttribute('viewBox', v.map(n => n.toFixed(2)).join(' ')); svg.style.setProperty('--dot', Math.sqrt(v[2] / L.w).toFixed(3)); };
      cancelAnimationFrame(tween.current[m]);
      if (still()) { paint(to); continue; }
      const t0 = performance.now();
      const step = (t: number) => { const k = Math.min(1, (t - t0) / 750), e = k < .5 ? 4 * k ** 3 : 1 - (-2 * k + 2) ** 3 / 2;
        paint(from.map((f, j) => f + (to[j] - f) * e)); if (k < 1) tween.current[m] = requestAnimationFrame(step); };
      tween.current[m] = requestAnimationFrame(step);
    }
  }, [data]);

  const choose = (id: string) => {
    setShelf(id); close(); zoomTo(id);
    if (id !== 'all' && nodes[cursor].shelf !== id) setCursor(nodes.findIndex(n => n.shelf === id));
  };

  // Light along the threads: a few sparks at a time, from the point under the pointer when there is one. The loop runs only
  // while the map is on screen and the tab is visible, and spawns nothing for reduced motion (followed live).
  useEffect(() => {
    if (!stage.current) return;
    let raf = 0, onScreen = false, lastSpawn = 0;
    const live: { el: SVGCircleElement; from: [number, number]; to: [number, number]; t0: number; life: number }[] = [];
    const clear = () => { live.forEach(s => s.el.remove()); live.length = 0; };
    const tick = (t: number) => {
      if (!onScreen || document.hidden) { raf = 0; return; }
      raf = requestAnimationFrame(tick);
      if (still()) { clear(); return; }
      const m = activeMode(), layer = sparks.current[m], L = data[m], h = hotRef.current, sh = shelfRef.current;
      if (layer && live.length < (h === null ? 7 : 12) && t - lastSpawn > (h === null ? 380 : 120)) {
        const pool = h !== null ? threadsOf[h] : edges.map((_, k) => k).filter(k => sh === 'all' || nodes[edges[k][0]].shelf === sh || nodes[edges[k][1]].shelf === sh);
        if (pool.length) {
          const k = pool[Math.floor(Math.random() * pool.length)], [a, b] = edges[k], fromA = h === null ? Math.random() < .5 : a === h;
          const el = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          el.setAttribute('r', '1.9'); el.setAttribute('class', 'sb-map-spark'); layer.appendChild(el);
          live.push({ el, from: L.points[fromA ? a : b], to: L.points[fromA ? b : a], t0: t, life: h === null ? 2200 : 900 });
          lastSpawn = t;
        }
      }
      for (let i = live.length - 1; i >= 0; i--) {
        const s = live[i], k = (t - s.t0) / s.life;
        if (k >= 1) { s.el.remove(); live.splice(i, 1); continue; }
        s.el.setAttribute('cx', (s.from[0] + (s.to[0] - s.from[0]) * k).toFixed(1));
        s.el.setAttribute('cy', (s.from[1] + (s.to[1] - s.from[1]) * k).toFixed(1));
        s.el.setAttribute('opacity', Math.sin(k * Math.PI).toFixed(2));
      }
    };
    const wake = () => { if (onScreen && !document.hidden && !raf) raf = requestAnimationFrame(tick); };
    const io = new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; if (!onScreen) clear(); wake(); });
    io.observe(stage.current);
    document.addEventListener('visibilitychange', wake);
    return () => { cancelAnimationFrame(raf); io.disconnect(); document.removeEventListener('visibilitychange', wake); clear(); };
  }, [data, edges, nodes, threadsOf]);

  const api = useRef<Api | null>(null);
  const hub = useMemo<Hub>(() => ({ svg: (m, el) => { svgs.current[m] = el; }, sparks: (m, el) => { sparks.current[m] = el; }, api: () => api.current! }), []);
  useLayoutEffect(() => { api.current = {
    setPointer: t => { pointer.current = t; },
    // Arrow keys move to the nearest point in that direction (in the shelf on show); the point's summary is its description.
    onKey: (e, m) => {
      const dir = ({ ArrowRight: [1, 0], ArrowLeft: [-1, 0], ArrowDown: [0, 1], ArrowUp: [0, -1] } as Record<string, number[]>)[e.key];
      if (!dir) return;
      e.preventDefault();
      const P = data[m].points, [x, y] = P[cursor];
      let best = -1, score = Infinity;
      P.forEach(([px, py], i) => {
        if (i === cursor || !inShelf(i)) return;
        const dx = px - x, dy = py - y, along = dx * dir[0] + dy * dir[1]; if (along <= 0) return;
        const s = along + Math.abs(dx * dir[1] - dy * dir[0]) * 2.2; if (s < score) { score = s; best = i; }
      });
      if (best < 0) return;
      flushSync(() => setCursor(best)); // the description follows before focus lands
      svgs.current[m]?.querySelector<SVGAElement>(`a[data-i="${best}"]`)?.focus();
    },
    onMove: (e, m) => {
      pointer.current = e.pointerType;
      if (e.pointerType !== 'mouse' || pinned) return;
      const i = pick(m, e.target, e.clientX, e.clientY, 18);
      if (i === null) { if (hot !== null) setHot(null); } else if (i !== hot) show(i, m);
    },
    onLeave: e => { if (e.pointerType === 'mouse' && !pinned) setHot(null); },
    onClick: (e, m) => {
      if (e.detail === 0) return; // Enter on a focused point: the link opens as usual
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // new tab, window, download: the browser's own way
      e.preventDefault();
      const touch = pointer.current !== 'mouse', i = pick(m, e.target, e.clientX, e.clientY, touch ? 26 : 18);
      if (i === null) { close(); return; }
      if (touch && !(pinned && hot === i)) { show(i, m); setPinned(true); setCursor(i); return; }
      window.location.assign(nodes[i].url);
    },
    onFocus: (i, m) => { setCursor(i); show(i, m); },
    onBlur: next => { if (!pinned && !next?.closest?.('.sb-map-point')) setHot(null); },
  }; });

  const readCount = nodes.filter(n => read.has(n.url)).length;
  const lastNode = last ? nodes.find(n => n.url === last) : undefined;
  const h = hot === null ? null : nodes[hot];

  return <div className="sb-map" data-ready={ready ? '' : undefined}>
    <div className="sb-map-bar" role="group" aria-label="Show a shelf">
      <button type="button" aria-pressed={shelf === 'all'} onClick={() => choose('all')}>All pages</button>
      {shelves.map(s => <button type="button" key={s.id} data-shelf={s.id} aria-pressed={shelf === s.id} onClick={() => choose(s.id)}><span className="sb-map-swatch" aria-hidden="true" />{s.title}</button>)}
    </div>
    <div className="sb-map-stage" ref={stage} onKeyDown={e => { if (e.key === 'Escape') close(); }}>
      {MODES.map(m => {
        const on = m === mode;
        return <Layer key={m} mode={m} L={data[m]} nodes={nodes} edges={edges} shelves={shelves} hot={on ? hot : null} hotNear={on ? hotNear : EMPTY}
          shelf={shelf} cursor={cursor} read={read} hub={hub} />;
      })}
      <p className="sb-sr" id="sb-map-desc">{nodes[cursor].summary}</p>
      {h && card && <div className={`sb-map-card${pinned ? ' is-pinned' : ''}${card.flip ? ' is-flip' : ''}${card.below ? ' is-below' : ''}`} data-shelf={h.shelf}
        style={{ left: card.x, top: card.y }} aria-hidden={pinned ? undefined : true}>
        <p className="sb-map-place">{h.place}</p>
        <p className="sb-map-title">{pinned ? <a ref={cardLink} href={h.url}>{h.title}<span aria-hidden="true"> →</span></a> : h.title}</p>
        <p className="sb-map-sum">{h.summary}</p>
        {(near[hot!].length > 0 || read.has(h.url)) && <p className="sb-map-meta">{near[hot!].length > 0 && connections(near[hot!].length)}{read.has(h.url) && <span className="sb-map-done">{near[hot!].length > 0 ? ' · ' : ''}Read</span>}</p>}
      </div>}
    </div>
    <div className="sb-map-foot">
      <p className="sb-map-hint" id="sb-map-hint">
        <span className="sb-map-fine">Hover a point to see the page, click to open it. Arrow keys move between pages.</span>
        <span className="sb-map-touch">Tap a point to see the page, tap again to open it.</span>
      </p>
      <p className="sb-map-trail">
        {readCount > 0
          ? <><span><strong>{readCount}</strong> of {nodes.length} pages read</span><button type="button" onClick={() => { clearTrail(); setSaid('Trail cleared'); }}>Clear trail</button></>
          : <span>Pages you read to the end light up here.</span>}
        {lastNode && <a className="sb-map-continue" href={lastNode.url}>Continue: {lastNode.title} <span aria-hidden="true">→</span></a>}
      </p>
      <p className="sb-sr" role="status">{said}</p>
    </div>
  </div>;
}
