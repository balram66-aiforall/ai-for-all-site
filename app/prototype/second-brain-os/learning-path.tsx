'use client';

/* The learning path, from human to superhuman (path.ts). Server-rendered as plain links, so it reads without JavaScript; in
   the browser it follows the reading trail (trail.ts). Each stage's bat mark fills with gold as its pages are read to the
   end, and only its mission, marked done, fills the last of it. The button at the top points at the first page on the path
   not yet read, then at the first mission not yet done. Times come from the pages' own word counts. */
import { useEffect, useState, type CSSProperties } from 'react';
import { MARKS } from '../bairam/mark/marks';
import { PATH, minutesOf, timeOf, type Stage } from './path';
import { missionsDone, setMission, watchTrail } from './trail';

const WING_MARK = MARKS.find(m => m.id === 'wing')!;
// How much of a stage's mark its mission fills; reading fills the rest.
const MISSION_SHARE = 0.2;

// The bat mark, outlined, filling with gold from the feet up as `fill` goes from 0 to 1.
function Emblem({ id, fill }: { id: string; fill: number }) {
  return <svg className="sb-emblem" viewBox="-4 -4 108 108" aria-hidden="true" focusable="false">
    <defs><clipPath id={`sb-fill-${id}`}><rect className="sb-emblem-level" x="-4" y="-4" width="108" height="108" style={{ transform: `translateY(${((1 - fill) * 108).toFixed(1)}px)` }} /></clipPath></defs>
    <g className="sb-emblem-line">{WING_MARK.shapes}</g>
    <g className="sb-emblem-gold" clipPath={`url(#sb-fill-${id})`}>{WING_MARK.shapes}</g>
  </svg>;
}

type Info = Record<string, { title: string; words: number }>;

export function LearningPath({ stages, info }: { stages: Stage[]; info: Info }) {
  const [read, setRead] = useState<Set<string>>(() => new Set());
  const [missions, setMissions] = useState<Set<string>>(() => new Set());
  const [ready, setReady] = useState(false);
  useEffect(() => watchTrail(r => { setRead(r); setMissions(missionsDone()); setReady(true); }), []);
  const words = (urls: string[]) => urls.reduce((k, u) => k + (info[u]?.words ?? 0), 0);
  const all = stages.flatMap(s => s.pages);
  const done = all.filter(u => read.has(u)).length;
  const total = stages.reduce((k, st) => k + minutesOf(words(st.pages)), 0);
  const nextPage = all.find(u => !read.has(u));
  const nextMission = nextPage ? undefined : stages.find(st => !missions.has(st.id));
  return <section className="sb-path" id="path" aria-labelledby="sb-path-title">
    <header className="sb-path-head">
      <div>
        <p className="sb-shelf-n">{PATH.eyebrow}</p>
        <h2 id="sb-path-title">{PATH.title}</h2>
        <p className="sb-path-lede">{PATH.lede}</p>
      </div>
      <div className="sb-path-now">
        <p className="sb-path-count">{done > 0
          ? <><strong>{done}</strong> of {all.length} pages on the path read{nextPage && <> · about {timeOf(minutesOf(words(all.filter(u => !read.has(u)))))} left</>}</>
          : <>{all.length} pages, about {timeOf(total)} of reading, one stage at a time</>}</p>
        {nextPage && <a className="sb-button" href={nextPage}><span>{done > 0 ? 'Next on your path' : 'Start the path'}: <span className="sb-path-next">{info[nextPage].title}</span></span><span aria-hidden="true">→</span></a>}
        {nextMission && <a className="sb-button" href={nextMission.mission.pages[0]}><span>Next mission: <span className="sb-path-next">{nextMission.mission.name}</span></span><span aria-hidden="true">→</span></a>}
      </div>
    </header>
    <ol className="sb-stages">
      {stages.map(st => {
        const got = st.pages.filter(u => read.has(u)).length, mission = missions.has(st.id);
        const fill = (got / st.pages.length) * (1 - MISSION_SHARE) + (mission ? MISSION_SHARE : 0);
        const left = st.pages.filter(u => !read.has(u)), m = st.mission;
        return <li className="sb-stage" key={st.id} data-stage={st.id} data-done={got === st.pages.length && mission ? '' : undefined} style={{ '--lvl': st.n } as CSSProperties}>
          <Emblem id={st.id} fill={fill} />
          <p className="sb-stage-n">Stage {st.n} <span className="sb-stage-time">· {timeOf(minutesOf(words(st.pages)))}</span></p>
          <h3>{st.name}</h3>
          <p className="sb-stage-line">{st.line}</p>
          <ul className="sb-stage-list">
            {st.sections.map(s => <li key={s.id}><a href={s.url}>{s.title}</a><span className="sb-stage-pages" aria-label={`${s.pages.length} pages`}>{s.pages.length}</span></li>)}
          </ul>
          {st.deeper.length > 0 && <p className="sb-stage-deeper"><span>Go deeper:</span> {st.deeper.map((s, i) => <span key={s.id}>{i > 0 && ', '}<a href={s.url}>{s.title}</a></span>)}</p>}
          <div className="sb-mission" data-done={mission ? '' : undefined}>
            <p className="sb-mission-k"><svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><circle cx="8" cy="8" r="6.5" /><circle cx="8" cy="8" r="3" /><circle cx="8" cy="8" r=".8" /></svg>Mission</p>
            <p className="sb-mission-name"><a href={m.pages[0]}>{m.name}</a></p>
            <p className="sb-mission-text">{m.text}</p>
            {m.pages.length > 1 && <ol className="sb-mission-steps">{m.pages.map(u => <li key={u}><a href={u}>{info[u].title}</a></li>)}</ol>}
            <p className="sb-mission-meta">About {timeOf(minutesOf(m.words))} of reading</p>
            {ready && <button type="button" className="sb-mission-done" aria-pressed={mission} onClick={() => setMission(st.id, !mission)}>
              <span className="sb-mission-box" aria-hidden="true" />{mission ? 'Mission done' : 'Mark mission done'}</button>}
          </div>
          <p className="sb-stage-progress">
            <span className="sb-stage-bar" aria-hidden="true"><span style={{ width: `${(fill * 100).toFixed(1)}%` }} /></span>
            <span>{got} of {st.pages.length} read{got > 0 && left.length > 0 && <> · {timeOf(minutesOf(words(left)))} left</>}</span>
          </p>
        </li>;
      })}
    </ol>
  </section>;
}
