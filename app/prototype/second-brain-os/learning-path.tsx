'use client';

/* The learning path, from human to superhuman (path.ts). Server-rendered as plain links, so it reads without JavaScript; in the
   browser it follows the reading trail (trail.ts): each stage's bat mark fills with gold as its pages are read to the end,
   and the button at the top always points at the first page on the path not yet read. */
import { useEffect, useState, type CSSProperties } from 'react';
import { MARKS } from '../bairam/mark/marks';
import { PATH, type Stage } from './path';
import { watchTrail } from './trail';

const WING_MARK = MARKS.find(m => m.id === 'wing')!;

// The bat mark, outlined, filling with gold from the feet up as `fill` goes from 0 to 1.
function Emblem({ id, fill }: { id: string; fill: number }) {
  return <svg className="sb-emblem" viewBox="-4 -4 108 108" aria-hidden="true" focusable="false">
    <defs><clipPath id={`sb-fill-${id}`}><rect className="sb-emblem-level" x="-4" y="-4" width="108" height="108" style={{ transform: `translateY(${((1 - fill) * 108).toFixed(1)}px)` }} /></clipPath></defs>
    <g className="sb-emblem-line">{WING_MARK.shapes}</g>
    <g className="sb-emblem-gold" clipPath={`url(#sb-fill-${id})`}>{WING_MARK.shapes}</g>
  </svg>;
}

export function LearningPath({ stages, titles }: { stages: Stage[]; titles: Record<string, string> }) {
  const [read, setRead] = useState<Set<string>>(() => new Set());
  useEffect(() => watchTrail(setRead), []);
  const all = stages.flatMap(s => s.pages);
  const done = all.filter(u => read.has(u)).length;
  const next = all.find(u => !read.has(u));
  return <section className="sb-path" id="path" aria-labelledby="sb-path-title">
    <header className="sb-path-head">
      <div>
        <p className="sb-shelf-n">{PATH.eyebrow}</p>
        <h2 id="sb-path-title">{PATH.title}</h2>
        <p className="sb-path-lede">{PATH.lede}</p>
      </div>
      <div className="sb-path-now">
        <p className="sb-path-count">{done > 0 ? <><strong>{done}</strong> of {all.length} pages on the path read</> : <>{all.length} pages, one stage at a time</>}</p>
        {next && <a className="sb-button" href={next}><span>{done > 0 ? 'Next on your path' : 'Start the path'}: <span className="sb-path-next">{titles[next]}</span></span><span aria-hidden="true">→</span></a>}
      </div>
    </header>
    <ol className="sb-stages">
      {stages.map(st => {
        const got = st.pages.filter(u => read.has(u)).length, fill = got / st.pages.length;
        return <li className="sb-stage" key={st.id} data-stage={st.id} data-done={got === st.pages.length ? '' : undefined} style={{ '--lvl': st.n } as CSSProperties}>
          <Emblem id={st.id} fill={fill} />
          <p className="sb-stage-n">Stage {st.n}</p>
          <h3>{st.name}</h3>
          <p className="sb-stage-line">{st.line}</p>
          <ul className="sb-stage-list">
            {st.sections.map(s => <li key={s.id}><a href={s.url}>{s.title}</a><span className="sb-stage-pages" aria-label={`${s.pages.length} pages`}>{s.pages.length}</span></li>)}
          </ul>
          {st.deeper.length > 0 && <p className="sb-stage-deeper"><span>Go deeper:</span> {st.deeper.map((s, i) => <span key={s.id}>{i > 0 && ', '}<a href={s.url}>{s.title}</a></span>)}</p>}
          <p className="sb-stage-progress">
            <span className="sb-stage-bar" aria-hidden="true"><span style={{ width: `${(fill * 100).toFixed(1)}%` }} /></span>
            <span>{got} of {st.pages.length} read</span>
          </p>
        </li>;
      })}
    </ol>
  </section>;
}
