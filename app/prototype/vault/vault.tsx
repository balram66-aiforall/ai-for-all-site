'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react';
// Picking a suit plays its power-up, only when the cave map's Sound is on (a no-op everywhere else).
import { suitPicked } from '../sound/engine';
import { chapters } from '../bairam/content';

/* AI-generated vault art (Workbench nano-banana-pro edit, run e3b0969b, image _1). Positions are percent of the 21:9 frame:
   x = bay centre (its ceiling light), logo = chest emblem. Measured from the 6336x2688 master.
   Copy approved by Balram on Oct 17 ("Use these lines, build it"); first person, his own terms (AI-suit, bAI-tech). */
const suits = [
  { name: 'ChatGPT', x: 20.04, logoX: 19.4, glow: '#ffffff', callsign: 'The everyday AI-suit', tech: 'Thinking partner',
    line: 'My daily armour: I think out loud, draft and untangle problems fast.' },
  { name: 'Claude Code', x: 35.23, logoX: 35.4, glow: '#d97757', callsign: 'The builder’s AI-suit', tech: 'Agentic coding',
    line: 'When something needs fixing, I suit up: it reads the code, makes the change and proves it with tests.' },
  { name: 'Amazon Quick', x: 50.17, logoX: 50.17, glow: '#e0219f', callsign: 'The intelligence AI-suit', tech: 'Answers from data',
    line: 'I wear it to find the truth in the data, so decisions rest on numbers, not guesses.' },
  { name: 'Kiro', x: 65.12, logoX: 65.35, glow: '#9046ff', callsign: 'The architect’s cloak', tech: 'Spec-driven building',
    line: 'For big builds I plan first: requirements, design and tasks, then the code.' },
  { name: 'Gemini', x: 80.29, logoX: 80.84, glow: '#4f8dff', callsign: 'The recon AI-suit', tech: 'Multimodal research',
    line: 'On research missions it reads text, images and long documents at once.' },
];
const phoneQuery = '(max-width: 760px)';
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
// bAI-tech carries the gold AI of bAIram.
const BaiTech = (): ReactNode => <span className="bv-term">b<span>AI</span>-tech</span>;
// AI-suit is one coined word: never let it break at its hyphen.
const t = (text: string): ReactNode => text.split('AI-suit').flatMap((part, i) => (i ? [<span key={i} className="bv-keep">AI-suit</span>, part] : [part]));

export function Vault() {
  const stage = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const bays = useRef<(HTMLButtonElement | null)[]>([]);
  const art = useRef<HTMLImageElement>(null);
  const [awake, setAwake] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const [pinned, setPinned] = useState<number | null>(null);
  const [centred, setCentred] = useState<number | null>(null);
  const [enhanced, setEnhanced] = useState(false);
  const shown = hovered ?? pinned ?? centred;
  // The powered-up bay shows a brighter copy of its own pixels; reuse whichever file the browser already picked.
  const shareSource = useCallback(() => {
    const img = art.current, el = stage.current;
    if (img?.currentSrc && el) el.style.setProperty('--bv-src', `url("${img.currentSrc}")`);
  }, []);
  useEffect(() => { if (art.current?.complete) shareSource(); }, [shareSource]);

  // Lights come on the first time the vault is properly in view.
  useEffect(() => {
    // Progressively enhance after hydration; without JS the vault stays fully lit and readable.
    const ready = requestAnimationFrame(() => setEnhanced(true));
    const el = stage.current;
    if (!el) return () => cancelAnimationFrame(ready);
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setAwake(true); io.disconnect(); } }, { threshold: 0.35 });
    io.observe(el);
    return () => { cancelAnimationFrame(ready); io.disconnect(); };
  }, []);

  // Phones: the suit centred in the swipe row lights up by itself. Swiping away from a suited-up suit releases it.
  useEffect(() => {
    const root = scroller.current;
    if (!root) return;
    const mq = matchMedia(phoneQuery);
    let io: IntersectionObserver | null = null;
    const setup = () => {
      io?.disconnect(); io = null;
      if (!mq.matches) { setCentred(null); return; }
      const first = bays.current[0];
      if (first) root.scrollLeft = first.offsetLeft + first.offsetWidth / 2 - root.clientWidth / 2;
      io = new IntersectionObserver(entries => {
        for (const e of entries) if (e.isIntersecting) {
          const i = Number((e.target as HTMLElement).dataset.index);
          setCentred(i); setPinned(p => (p === null || p === i ? p : null));
        }
      }, { root, threshold: 0.75 });
      bays.current.forEach(b => b && io!.observe(b));
    };
    setup();
    mq.addEventListener('change', setup);
    return () => { io?.disconnect(); mq.removeEventListener('change', setup); };
  }, []);

  const centre = (b: HTMLElement | null | undefined) => b?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduced() ? 'auto' : 'smooth' });
  const move = useCallback((from: number, step: number) => {
    const b = bays.current[(from + step + suits.length) % suits.length];
    b?.focus(); centre(b);
  }, []);
  const onKey = (i: number) => (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); move(i, 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); move(i, -1); }
  };

  return <section className="bv-vault" id="ai-tools" aria-labelledby="bv-title" data-enhanced={enhanced}>
    <header className="bv-head">
      <p className="bv-eyebrow"><span className="bv-num">{chapters.find(c => c.id === 'ai-suits')!.n}</span><span>{t('The AI-suit vault')}</span></p>
      <h2 id="bv-title">{t('One orchestrator. An AI-suit for every mission.')}</h2>
      <p className="bv-lede">{t('Every problem calls for a different AI-suit. I pick the one the job needs, and wear it for the people who need help.')}</p>
    </header>
    <div className="bv-scroller" ref={scroller}>
      <div className="bv-stage" ref={stage} data-awake={awake} data-active={shown ?? undefined}>
        <picture className="bv-art">
          <source type="image/avif" srcSet="/assets/vault/vault-1600.avif 1600w, /assets/vault/vault-2400.avif 2400w, /assets/vault/vault-3600.avif 3600w" sizes="(max-width: 760px) 378vw, 100vw" />
          <source type="image/webp" srcSet="/assets/vault/vault-1600.webp 1600w, /assets/vault/vault-2400.webp 2400w, /assets/vault/vault-3600.webp 3600w" sizes="(max-width: 760px) 378vw, 100vw" />
          <img ref={art} onLoad={shareSource} src="/assets/vault/vault-2400.webp" width={2400} height={1018} loading="lazy" decoding="async"
            alt="AI-generated art: five empty armoured suits in lit glass cases set into a cave wall, each with a tool's emblem on its chest" />
        </picture>
        {suits.map((s, i) => <div key={s.name} className="bv-fx" aria-hidden="true" data-on={shown === i || undefined}
          style={{ '--x': `${s.x}%`, '--lx': `${s.logoX}%`, '--glow': s.glow, '--i': i } as CSSProperties}>
          <span className="bv-shade" /><span className="bv-lit" /><span className="bv-cone" /><span className="bv-boost" /><span className="bv-sweep" /><span className="bv-disc" /><span className="bv-logo" />
        </div>)}
        {suits.map((s, i) => <button key={s.name} type="button" className="bv-bay" data-index={i}
          ref={el => { bays.current[i] = el; }} aria-pressed={pinned === i} aria-describedby={`bv-d${i}`}
          style={{ '--x': `${s.x}%` } as CSSProperties}
          onPointerEnter={e => { if (e.pointerType === 'mouse') setHovered(i); }}
          onPointerLeave={e => { if (e.pointerType === 'mouse') setHovered(h => (h === i ? null : h)); }}
          onFocus={e => { if (e.currentTarget.matches(':focus-visible')) setHovered(i); }} onBlur={() => setHovered(h => (h === i ? null : h))}
          onClick={e => { if (pinned !== i) suitPicked(); setPinned(v => (v === i ? null : i)); if (matchMedia(phoneQuery).matches) centre(e.currentTarget); }}
          onKeyDown={onKey(i)}>
          <span className="bv-plaque"><span className="bv-suited" aria-hidden="true">Suited up</span>{s.name}</span>
        </button>)}
      </div>
    </div>
    {/* One caption, swapped for whichever suit is lit. Every item shares one grid cell, so the height never jumps. */}
    <div className="bv-caption" aria-hidden="true" data-active={shown ?? undefined}>
      <p className="bv-hint" data-on={shown === null || undefined}><span className="bv-hint-wide">{t('Choose an AI-suit')}</span><span className="bv-hint-phone">{t('Swipe to choose an AI-suit')}</span></p>
      {suits.map((s, i) => <div key={s.name} className="bv-card" data-on={shown === i || undefined} style={{ '--glow': s.glow } as CSSProperties}>
        <p className="bv-tag"><BaiTech /> <span className="bv-dot">·</span> {s.tech}</p>
        <p className="bv-callsign">{t(s.callsign)}</p>
        <p className="bv-line">{s.line}</p>
      </div>)}
    </div>
    {suits.map((s, i) => <span key={s.name} id={`bv-d${i}`} className="bv-sr">{`${s.callsign}. bAI-tech: ${s.tech}. ${s.line}`}</span>)}
  </section>;
}
