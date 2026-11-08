/* The reading trail: which Second Brain OS pages this visitor has read to the end, and the last page they opened. Kept only
   in this browser (localStorage); nothing is sent anywhere. Every function survives storage being blocked (private modes). */
const READ = 'bairam:sbos:read', LAST = 'bairam:sbos:last', EVENT = 'sbos-trail';

function load(): string[] { try { const v = JSON.parse(localStorage.getItem(READ) ?? '[]'); return Array.isArray(v) ? v.filter(x => typeof x === 'string') : []; } catch { return []; } }
function save(urls: string[]) { try { localStorage.setItem(READ, JSON.stringify(urls)); } catch { /* storage blocked: the trail just isn't kept */ } window.dispatchEvent(new Event(EVENT)); }

export const readPages = () => new Set(load());
export function markRead(url: string) { const all = load(); if (!all.includes(url)) save([...all, url]); }
export function clearTrail() { try { localStorage.removeItem(LAST); } catch { /* blocked */ } save([]); }
export function lastPage(): string | null { try { return localStorage.getItem(LAST); } catch { return null; } }
export function setLastPage(url: string) { try { localStorage.setItem(LAST, url); } catch { /* blocked */ } }
// Calls back now and whenever the trail changes (here or in another tab); returns the unsubscribe.
export function watchTrail(fn: (read: Set<string>) => void) {
  const run = () => fn(readPages());
  const onStorage = (e: StorageEvent) => { if (e.key === READ || e.key === null) run(); };
  run(); window.addEventListener(EVENT, run); window.addEventListener('storage', onStorage);
  return () => { window.removeEventListener(EVENT, run); window.removeEventListener('storage', onStorage); };
}
