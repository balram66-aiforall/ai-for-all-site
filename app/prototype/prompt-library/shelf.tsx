'use client';

/* The shelf of the prompt library: a sticky bar (search, a chip per group, the count) over the prompts, grouped under their
   group names. Search and group live in the URL (?q=...&group=...), so a filtered view can be shared and Back works.
   Server HTML and a first render without JavaScript show all 36 prompts; the bar and the copy buttons only appear once the
   page is live, since neither works without it. */
import { useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import type { Prompt, PromptGroup } from './prompts';

const EVENT = 'pl-url';
const subscribe = (fn: () => void) => { addEventListener('popstate', fn); addEventListener(EVENT, fn); return () => { removeEventListener('popstate', fn); removeEventListener(EVENT, fn); }; };
const noop = () => () => {};

// Writes ?q= and ?group= in place (no new history entry per keystroke), keeping any #prompt-n.
function setParams(next: { q?: string; group?: string }) {
  const url = new URL(location.href);
  for (const [k, v] of Object.entries(next)) { if (v) url.searchParams.set(k, v); else url.searchParams.delete(k); }
  history.replaceState(history.state, '', url);
  dispatchEvent(new Event(EVENT));
}

// [placeholders] in gold, so the parts to fill in stand out; the text itself is unchanged.
function Marked({ text }: { text: string }) {
  return <>{text.split(/(\[[^\]]+\])/).map((part, i) => i % 2 ? <mark key={i} className="pl-fill">{part}</mark> : part)}</>;
}

async function copyText(text: string) {
  try { await navigator.clipboard.writeText(text); return true; } catch {
    const area = document.createElement('textarea');
    area.value = text; area.setAttribute('readonly', ''); area.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
    document.body.append(area); area.select();
    const ok = document.execCommand('copy'); area.remove(); return ok;
  }
}

function CopyIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="1.5" /><path d="M16 8V5.5A1.5 1.5 0 0 0 14.5 4h-9A1.5 1.5 0 0 0 4 5.5v9A1.5 1.5 0 0 0 5.5 16H8" /></svg>; }
function TickIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>; }

export function Shelf({ groups, prompts }: { groups: readonly PromptGroup[]; prompts: readonly Prompt[] }) {
  const live = useSyncExternalStore(noop, () => true, () => false);
  const search = useSyncExternalStore(subscribe, () => location.search, () => '');
  const params = new URLSearchParams(search);
  const q = params.get('q') ?? '';
  const asked = params.get('group') ?? '';
  const group = groups.some(g => g.id === asked) ? asked : '';
  const [copied, setCopied] = useState(0);
  const [said, setSaid] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const name = new Map(groups.map(g => [g.id, g.name]));
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  const shown = prompts.filter(p => (!group || p.group === group)
    && terms.every(t => `${p.n} ${p.title} ${p.prompt} ${name.get(p.group)}`.toLowerCase().includes(t)));

  async function copy(p: Prompt) {
    const ok = await copyText(p.prompt);
    clearTimeout(timer.current);
    setCopied(ok ? p.n : -p.n);
    setSaid(ok ? `Copied prompt ${p.n}, ${p.title}` : `Could not copy prompt ${p.n}. Select the text and copy it instead.`);
    // A failed copy says so on the button too, and stays a little longer so it can be read.
    timer.current = setTimeout(() => setCopied(0), ok ? 2200 : 4000);
  }

  const chip = (id: string, label: ReactNode) => <button type="button" key={id || 'all'} className="pl-chip" aria-pressed={group === id} onClick={() => setParams({ group: id })}>{label}</button>;

  return <section className="pl-shelf" aria-label="Prompts">
    {live && <div className="pl-tools">
      <div className="pl-tools-in">
        <label className="pl-search">
          <span className="pl-sr">Search prompts</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m15.5 15.5 5 5" /></svg>
          <input type="search" value={q} placeholder="Search prompts" autoComplete="off" spellCheck={false} onChange={e => setParams({ q: e.target.value })} />
        </label>
        <div className="pl-chips" role="group" aria-label="Show a group">
          {chip('', 'All')}
          {groups.map(g => chip(g.id, g.name))}
        </div>
        <p className="pl-count" role="status">Showing {shown.length} of {prompts.length}</p>
      </div>
    </div>}
    <p className="pl-sr" role="status" aria-live="polite">{said}</p>

    {shown.length === 0 && <div className="pl-empty">
      <p>No prompts match {q ? <>&ldquo;{q}&rdquo;</> : 'that'}{group ? ` in ${name.get(group)}` : ''}.</p>
      <button type="button" className="pl-chip" onClick={() => setParams({ q: '', group: '' })}>Show all prompts</button>
    </div>}

    {groups.filter(g => shown.some(p => p.group === g.id)).map(g => <section key={g.id} className="pl-group" id={g.id} aria-labelledby={`${g.id}-title`}>
      <h2 id={`${g.id}-title`}>{g.name}</h2>
      <ol className="pl-cards">
        {shown.filter(p => p.group === g.id).map(p => <li key={p.n} className="pl-card" id={`prompt-${p.n}`}>
          <p className="pl-card-n"><span className="pl-sr">Prompt </span>{String(p.n).padStart(2, '0')}</p>
          <h3>{p.title}</h3>
          <p className="pl-prompt"><Marked text={p.prompt} /></p>
          {live && <button type="button" className={`pl-copy${copied === p.n ? ' is-done' : ''}`} onClick={() => copy(p)}>
            {copied === p.n ? <><TickIcon />Copied</> : copied === -p.n ? <><CopyIcon />Not copied</> : <><CopyIcon />Copy</>}<span className="pl-sr"> prompt {p.n}, {p.title}</span>
          </button>}
        </li>)}
      </ol>
    </section>)}
  </section>;
}
