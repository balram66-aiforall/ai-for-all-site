/* Shared pieces of the Second Brain OS wing: the trail, the credit line and the arrow. */
import { roomOfLearning } from '../bairam/content';
import { WING, credit, library } from './library';

export function Arrow() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" /></svg>; }
export function Back() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M19 12H5m6-6-6 6 6 6" /></svg>; }
export function Forward() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>; }
// One span, so the space before "room" survives inside the trail's flex links.
const Name = () => <span>b<span className="sb-ai">AI</span>{roomOfLearning.name.slice(3)}</span>;

// The way back up: bAI room of learning / Second Brain OS / shelf / section (the last entry is the current page's parent).
// atWing: on the wing itself, its own entry is marked as the current page.
export function Trail({ steps, atWing }: { steps: { label: string; href: string }[]; atWing?: boolean }) {
  return <nav className="sb-trail" aria-label="You are here">
    <ol>
      <li><a href={roomOfLearning.path}><Name /></a></li>
      <li><a href={WING} aria-current={atWing ? 'page' : undefined}>{credit.title}</a></li>
      {steps.map(s => <li key={s.href}><a href={s.href}>{s.label}</a></li>)}
    </ol>
  </nav>;
}

// Every page says whose work it is: From Second Brain OS · MIT license (· View source on GitHub). No author name
// (Balram, Nov 10); the link to the original repo and the license stay.
export function Credit({ github }: { github?: string }) {
  return <p className="sb-credit">
    <span>From <a href={library.source.repo} target="_blank" rel="noopener noreferrer">{credit.title}<span className="sb-sr"> (opens in a new tab)</span></a></span>
    <span aria-hidden="true">·</span>
    <a href={credit.licenseUrl}>{credit.license}</a>
    {github && <><span aria-hidden="true">·</span><a href={github} target="_blank" rel="noopener noreferrer">View source on GitHub<span className="sb-sr"> (opens in a new tab)</span></a></>}
  </p>;
}
