'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { certs } from './certs';
import { chapters } from '../bairam/content';

/* Level 03 of the cave. Copy drafted by us and approved for the build by Balram on Oct 17
   ("Build it with The proving wall"); first person, his term AI-suit. Rock art is cut from the vault art
   (Workbench run e3b0969b, image _1) so the two levels match. */
const phoneQuery = '(max-width: 760px)';
// AI-suit is one coined word: never let it break at its hyphen.
// Same for hyphenated words on a plate ("Multi-Agent"): the line breaks before the word, never inside it.
const keepHyphenated = (text: string) => text.split(/(\S+-\S+)/).map((part, i) => (i % 2 ? <span key={i} className="pw-keep">{part}</span> : part));
const keep = (text: string) => text.split('AI-suit').flatMap((part, i) => (i ? [<span key={i} className="pw-keep">AI-suit</span>, part] : [part]));

// Machine-readable date for <time>: '2026-04-06' from 'April 06, 2026', or '2026-09' from 'Sep 2026'.
// Parsed by hand: engines differ on free-form date strings.
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const pad = (n: number) => String(n).padStart(2, '0');
const isoDate = (date: string) => {
  const [m, d, y] = date.replace(',', '').split(' ');
  return `${y}-${pad(months.indexOf(m.slice(0, 3)) + 1)}-${pad(Number(d))}`;
};
const isoMonth = (issued: string) => {
  const [m, y] = issued.split(' ');
  return `${y}-${pad(months.indexOf(m) + 1)}`;
};

export function ProvingWall() {
  const list = useRef<HTMLOListElement>(null);
  const [enhanced, setEnhanced] = useState(false);
  const [awake, setAwake] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const [centred, setCentred] = useState<number | null>(null);
  const shown = hovered ?? centred;

  // Progressively enhance after hydration; without JS every plate is lit and readable.
  useEffect(() => {
    const ready = requestAnimationFrame(() => setEnhanced(true));
    const el = list.current;
    if (!el) return () => cancelAnimationFrame(ready);
    // The lamps come on the first time the plates reach the upper three quarters of the screen. Watching the list's
    // entry, not a share of its height, so a long wall (15 plates stacked on a phone) still wakes.
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setAwake(true); io.disconnect(); } }, { rootMargin: '0px 0px -25% 0px' });
    io.observe(el);
    return () => { cancelAnimationFrame(ready); io.disconnect(); };
  }, []);

  // Phones have no hover: the plate passing through the middle of the screen lights up by itself.
  useEffect(() => {
    const root = list.current;
    if (!root) return;
    const mq = matchMedia(phoneQuery);
    let io: IntersectionObserver | null = null;
    const setup = () => {
      io?.disconnect(); io = null; setCentred(null);
      if (!mq.matches) return;
      io = new IntersectionObserver(entries => {
        for (const e of entries) {
          const i = Number((e.target as HTMLElement).dataset.index);
          setCentred(c => (e.isIntersecting ? i : c === i ? null : c));
        }
      }, { rootMargin: '-42% 0px -42% 0px' });
      root.querySelectorAll('.pw-item').forEach(p => io!.observe(p));
    };
    setup();
    mq.addEventListener('change', setup);
    return () => { io?.disconnect(); mq.removeEventListener('change', setup); };
  }, []);

  return <section className="pw-level" id="certifications" aria-labelledby="pw-title" data-enhanced={enhanced}>
    <div className="pw-wall" data-awake={awake} data-count={certs.length}>
      <div className="pw-art" aria-hidden="true">
        <picture className="pw-rock pw-rock-left">
          <source type="image/avif" srcSet="/assets/proving-wall/wall-left.avif" />
          <img src="/assets/proving-wall/wall-left.webp" width={363} height={1400} alt="" loading="lazy" decoding="async" />
        </picture>
        <picture className="pw-rock pw-rock-right">
          <source type="image/avif" srcSet="/assets/proving-wall/wall-right.avif" />
          <img src="/assets/proving-wall/wall-right.webp" width={346} height={1400} alt="" loading="lazy" decoding="async" />
        </picture>
        <picture className="pw-ceiling">
          <source type="image/avif" srcSet="/assets/proving-wall/wall-ceiling.avif" />
          <img src="/assets/proving-wall/wall-ceiling.webp" width={2400} height={191} alt="" loading="lazy" decoding="async" />
        </picture>
      </div>

      <header className="pw-head">
        <p className="pw-eyebrow"><span className="pw-num">{chapters.find(c => c.id === 'proving-wall')!.n}</span><span>The proving wall</span></p>
        <h2 id="pw-title">{keep('Every AI-suit is earned.')}</h2>
        <p className="pw-lede">Before I wear it, I prove it.</p>
      </header>

      <ol className="pw-plates" ref={list} data-active={shown ?? undefined} aria-label="Certificates and badges">
        {certs.map((c, i) => <li key={c.name + i} className="pw-item" data-index={i} data-on={shown === i || undefined}
          style={{ '--i': i } as CSSProperties}
          onPointerEnter={e => { if (e.pointerType === 'mouse') setHovered(i); }}
          onPointerLeave={e => { if (e.pointerType === 'mouse') setHovered(h => (h === i ? null : h)); }}
          onFocus={e => { if ((e.target as HTMLElement).matches(':focus-visible')) setHovered(i); }} onBlur={() => setHovered(h => (h === i ? null : h))}>
          <span className="pw-lamp" aria-hidden="true" />
          <article className="pw-plate" aria-labelledby={`pw-n${i}`}>
            <span className="pw-sheen" aria-hidden="true" />
            {c.sample && <p className="pw-sample">Sample</p>}
            <div className="pw-top">
              {c.badge && <picture className="pw-badge">
                <source type="image/avif" srcSet={`${c.badge.src}.avif`} />
                <img src={`${c.badge.src}.webp`} width={192} height={192} alt={c.badge.alt} loading="lazy" decoding="async" />
              </picture>}
              <div>
                <p className="pw-year">{c.date ? <time dateTime={isoDate(c.date)}>{c.year}</time>
                  : c.issued ? <time dateTime={isoMonth(c.issued)}>{c.year}</time> : c.year}</p>
                {c.kind && <p className="pw-kind">{c.kind}</p>}
              </div>
            </div>
            {c.photo && <picture className="pw-photo">
              <source type="image/avif" srcSet={`${c.photo.src}.avif`} />
              <img src={`${c.photo.src}.webp`} width={c.photo.width} height={c.photo.height} alt={`Certificate: ${c.name}`} loading="lazy" decoding="async" />
            </picture>}
            <h3 id={`pw-n${i}`} className="pw-name">{keepHyphenated(c.name)}</h3>
            <p className="pw-issuer">{c.issuer}</p>
            {c.credentialId && <p className="pw-id"><span>Credential ID</span> {c.credentialId}</p>}
            {c.date ? <p className="pw-done">Completed {c.date}</p> : c.issued && <p className="pw-done">Issued {c.issued}</p>}
            {c.url
              ? <a className="pw-verify" href={c.url} target="_blank" rel="noopener noreferrer"
                  aria-label={`Verify ${c.name} on ${c.verifiedBy ?? c.issuer} (opens in a new tab)`}>
                  {c.verifiedBy ? `Verify on ${c.verifiedBy}` : 'Verify credential'} <span aria-hidden="true">↗</span></a>
              : c.sample ? <p className="pw-pending">Verification link to come</p> : null}
          </article>
        </li>)}
      </ol>
    </div>
  </section>;
}
