'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { chapters } from './content';

/* The cave journey: native scrolling, with a camera move between chambers.
   Each chamber sits in a stage followed by a passage. Reaching a chamber's last screen, it pins there natively
   (position: sticky) while the passage scrolls by: it pushes forward and fades, a rock arch rushes past the screen
   edges, and the next chamber rises over it, turning in from one side and settling flat. Turns alternate.
   A chamber you are reading is completely still (no transform). Only transform and opacity change per frame;
   layout is measured on resize only. Reduced motion: a plain crossfade. Phones: smaller turns, no blur.
   No JavaScript: no pinning, no passages, a normal page. */

const clamp = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const ease = (t: number) => t * t * (3 - 2 * t);
// A chamber has settled once its top is 20% down the viewport.
const ENTRY_END = .2;

// exit = scroll position where the leaving move starts; run = its length. A chamber about one screen tall stays pinned
// and flat for a short dwell first, so it always has a still moment to be read.
type Box = { top: number; height: number; exit: number; run: number };
function docTop(node: HTMLElement) {
  let y = 0;
  for (let n: HTMLElement | null = node; n; n = n.offsetParent as HTMLElement | null) y += n.offsetTop;
  return y;
}

export function Journey({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const arch = useRef<HTMLDivElement>(null);
  const pulse = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const host = root.current!;
    const main = host.closest('main')!;
    const chambers = Array.from(main.querySelectorAll<HTMLElement>('.bj-stage > [data-chamber]'));
    const stages = chambers.map(node => node.parentElement!);
    const passages = stages.map(stage => stage.querySelector<HTMLElement>(':scope > .bj-passage'));
    const links = Array.from(host.querySelectorAll<HTMLAnchorElement>('.bj-chapters a'));
    const nodes = Array.from(host.querySelectorAll<HTMLElement>('.bj-cable-node'));
    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    const phone = matchMedia('(max-width: 760px)');
    const last = chambers.length - 1;
    // The first numbered chapter: the masthead and Who is Balram? come before it and have no chapter.
    const first = Math.max(1, chambers.findIndex(node => node.dataset.chamber === chapters[0].id));
    let boxes: Box[] = [], vh = innerHeight, vw = innerWidth, travel = 1, frame = 0;
    let current = -1, marker = '', lit = -1;
    const written = new Map<Element, string>();
    const write = (node: HTMLElement, transform: string, opacity: string) => {
      const key = transform + '|' + opacity;
      if (written.get(node) === key) return;
      written.set(node, key);
      node.style.transform = transform;
      node.style.opacity = opacity;
    };

    const measure = () => {
      vh = innerHeight; vw = innerWidth;
      boxes = chambers.map((node, i) => {
        const top = docTop(stages[i]), height = node.offsetHeight;
        // Sticky offset: a tall chamber pins with its bottom on the viewport bottom; a short one pins at the top.
        const stick = Math.min(0, vh - height);
        node.style.setProperty('--bj-top', `${stick}px`);
        const pass = passages[i]?.offsetHeight ?? 0;
        const dwell = Math.min(pass * .4, Math.max(0, vh * .3 - (height - vh)));
        return { top, height, exit: top - stick + dwell, run: pass - dwell };
      });
      travel = Math.max(1, document.documentElement.scrollHeight - vh);
      // Cable nodes mark where each chapter starts along the scroll; placed once per layout, not per frame.
      nodes.forEach((node, index) => { node.style.transform = `translate3d(0, ${(60 + clamp(boxes[index + first].top / travel) * (vh - 120)).toFixed(1)}px, 0)`; });
    };

    const update = () => {
      frame = 0;
      const s = scrollY;
      const calm = main.dataset.motion !== '3d';
      const small = phone.matches;
      let passage = -1, passageT = 0;
      chambers.forEach((node, i) => {
        const box = boxes[i];
        const top = box.top - s;
        const enter = i === 0 ? 1 : clamp((vh - top) / (vh * (1 - ENTRY_END)));
        const leave = i === last || box.run <= 0 ? 0 : clamp((s - box.exit) / box.run);
        if (enter >= 1 && leave <= 0) {
          if (node.dataset.passage) { delete node.dataset.passage; written.delete(node); node.style.transform = ''; node.style.opacity = ''; }
          return;
        }
        // arriving / in / out = mid-passage (will-change); away = fully off stage, parked in its start or end pose.
        // arriving and leaving (the faint halves) take no clicks, so they never cover the chamber you are using.
        node.dataset.passage = enter > 0 && enter < 1 ? (enter < .5 ? 'arriving' : 'in') : leave > 0 && leave < 1 ? (leave < .5 ? 'out' : 'leaving') : 'away';
        const shown = ease(enter) * (1 - ease(leave));
        if (calm) { write(node, '', shown.toFixed(3)); return; }
        // Turn direction alternates: chamber 1 turns in from the right, 2 from the left, and so on.
        const turn = i % 2 ? 1 : -1, nextTurn = -turn;
        const k = 1 - ease(enter), push = ease(leave);
        const angle = turn * (small ? 9 : 20) * k;
        const x = turn * vw * (small ? .04 : .07) * k - nextTurn * vw * (small ? .02 : .035) * push;
        const z = -(small ? 120 : 260) * k;
        const scale = 1 + (small ? .14 : .3) * push;
        // Pivot on the viewport centre, so the turn and the push read as a camera move, not a page swinging on its top edge.
        const viewTop = leave > 0 ? Math.min(0, vh - box.height) : top;
        const pivot = vh * .5 - viewTop;
        write(node, `translate3d(${x.toFixed(1)}px, ${pivot.toFixed(1)}px, 0) perspective(${small ? 900 : 1300}px) translateZ(${z.toFixed(1)}px) rotateY(${angle.toFixed(2)}deg) scale(${scale.toFixed(4)}) translate3d(0, ${(-pivot).toFixed(1)}px, 0)`, Math.min(1, shown * 1.1).toFixed(3));
      });

      // The running passage: from chamber i starting to leave to chamber i+1 settling.
      for (let i = 0; i < last; i++) {
        const settle = boxes[i + 1].top - vh * ENTRY_END;
        const t = (s - boxes[i].exit) / Math.max(1, settle - boxes[i].exit);
        if (t > 0 && t < 1) { passage = i + 1; passageT = t; break; }
      }
      const rock = arch.current!;
      if (calm || passage < 0) write(rock, '', '0');
      else {
        const turn = passage % 2 ? 1 : -1;
        const scale = .6 + 1.25 * Math.pow(passageT, 1.2);
        const x = -turn * vw * (small ? .1 : .2) * ease(passageT);
        const fade = passageT < .3 ? ease(passageT / .3) : passageT > .78 ? 1 - ease((passageT - .78) / .22) : 1;
        write(rock, `translate3d(${x.toFixed(1)}px, 0, 0) scale(${scale.toFixed(4)})`, fade.toFixed(3));
      }

      // The cable pulse follows the whole scroll.
      write(pulse.current!, `translate3d(0, ${(clamp(s / travel) * (vh - 120)).toFixed(1)}px, 0)`, '');

      // Chapter marker: the latest chamber whose top has passed the viewport middle. The masthead and the bio have no chapter.
      let now = 0;
      for (let i = first; i <= last; i++) if (boxes[i].top - s <= vh * .5) now = i - first + 1;
      if (now !== current) {
        current = now;
        links.forEach((link, index) => { if (index === now - 1) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current'); });
      }
      if (now !== lit) { lit = now; nodes.forEach((node, index) => { node.toggleAttribute('data-lit', index < now); }); }
      // The marker stays off over the masthead; it appears once the first chamber is current.
      const show = now > 0 ? 'on' : 'off';
      if (show !== marker) { marker = show; host.dataset.marker = show; }
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };

    // In-page links: the browser would aim at a chamber's moved (transformed or pinned) box, so aim at its true layout
    // position instead: the stage's top plus the target's offset inside the chamber. Then mark the URL and move focus there.
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest?.('a[href^="#"]') as HTMLAnchorElement | null;
      const target = link && link.hash.length > 1 ? document.getElementById(decodeURIComponent(link.hash.slice(1))) : null;
      const stage = target?.closest<HTMLElement>('.bj-stage');
      if (!link || !target || !stage) return;
      event.preventDefault();
      const chamber = stage.firstElementChild as HTMLElement;
      let y = docTop(stage);
      if (target !== stage && target !== chamber) for (let n: HTMLElement | null = target; n && n !== chamber; n = n.offsetParent as HTMLElement | null) y += n.offsetTop;
      y -= parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
      scrollTo({ top: Math.max(0, y), behavior: main.dataset.motion === '3d' ? 'smooth' : 'auto' });
      if (location.hash !== link.hash) history.pushState(null, '', link.hash);
      if (!target.matches('a[href], button, input, select, textarea, [tabindex]')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    };
    document.addEventListener('click', onClick);
    const relayout = () => { measure(); schedule(); };
    const setMode = () => { main.dataset.motion = reduce.matches ? 'calm' : '3d'; };
    const onReduce = () => { setMode(); requestAnimationFrame(relayout); };

    setMode();
    measure();
    update();
    const resize = new ResizeObserver(relayout);
    chambers.forEach(node => resize.observe(node));
    resize.observe(document.body);
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', relayout);
    reduce.addEventListener('change', onReduce);
    phone.addEventListener('change', relayout);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      removeEventListener('scroll', schedule);
      document.removeEventListener('click', onClick);
      removeEventListener('resize', relayout);
      reduce.removeEventListener('change', onReduce);
      phone.removeEventListener('change', relayout);
      delete main.dataset.motion;
      chambers.forEach(node => { node.style.transform = ''; node.style.opacity = ''; node.style.removeProperty('--bj-top'); delete node.dataset.passage; });
    };
  }, []);

  return <div className="bj-journey" ref={root}>
    <nav className="bj-chapters" aria-label="Chapters">
      <ol>{chapters.map(c => <li key={c.id}><a href={`#${c.id}`}><span className="bj-chapters-n">{c.n}</span><span className="bj-chapters-name">{c.name}</span></a></li>)}</ol>
    </nav>
    {children}
    {/* Rock arch for the passages, cut from the vault art (the proving wall's crops). */}
    <div className="bj-arch" ref={arch} aria-hidden="true">
      <picture className="bj-arch-left"><source type="image/avif" srcSet="/assets/proving-wall/wall-left.avif" /><img src="/assets/proving-wall/wall-left.webp" width={363} height={1400} alt="" decoding="async" /></picture>
      <picture className="bj-arch-right"><source type="image/avif" srcSet="/assets/proving-wall/wall-right.avif" /><img src="/assets/proving-wall/wall-right.webp" width={346} height={1400} alt="" decoding="async" /></picture>
      <picture className="bj-arch-ceiling"><source type="image/avif" srcSet="/assets/proving-wall/wall-ceiling.avif" /><img src="/assets/proving-wall/wall-ceiling.webp" width={2400} height={191} alt="" decoding="async" /></picture>
    </div>
    <div className="bj-cable" aria-hidden="true">
      {chapters.map(c => <span key={c.id} className="bj-cable-node" />)}
      <span className="bj-cable-pulse" ref={pulse} />
    </div>
  </div>;
}
