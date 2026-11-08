/* The reading trail: which Second Brain OS pages this visitor has read to the end, the last page they opened, and which
   missions on the learning path they have marked done (path.ts). Kept only
   in this browser (localStorage); nothing is sent anywhere. Every function survives storage being blocked (private modes). */
const READ = 'bairam:sbos:read', LAST = 'bairam:sbos:last', MISSIONS = 'bairam:sbos:missions', EVENT = 'sbos-trail';

function list(key: string): string[] { try { const v = JSON.parse(localStorage.getItem(key) ?? '[]'); return Array.isArray(v) ? v.filter(x => typeof x === 'string') : []; } catch { return []; } }
function keep(key: string, items: string[]) { try { localStorage.setItem(key, JSON.stringify(items)); } catch { /* storage blocked: the trail just isn't kept */ } window.dispatchEvent(new Event(EVENT)); }
const load = () => list(READ), save = (urls: string[]) => keep(READ, urls);

export const readPages = () => new Set(load());
export function markRead(url: string) { const all = load(); if (!all.includes(url)) save([...all, url]); }
export function clearTrail() { try { localStorage.removeItem(LAST); localStorage.removeItem(MISSIONS); } catch { /* blocked */ } save([]); }
// Missions: the stage ids whose mission this visitor has marked done.
export const missionsDone = () => new Set(list(MISSIONS));
export function setMission(id: string, done: boolean) { const all = list(MISSIONS).filter(x => x !== id); keep(MISSIONS, done ? [...all, id] : all); }
export function lastPage(): string | null { try { return localStorage.getItem(LAST); } catch { return null; } }
export function setLastPage(url: string) { try { localStorage.setItem(LAST, url); } catch { /* blocked */ } }
// Calls back now and whenever the trail changes (here or in another tab); returns the unsubscribe.
export function watchTrail(fn: (read: Set<string>) => void) {
  const run = () => fn(readPages());
  const onStorage = (e: StorageEvent) => { if (e.key === READ || e.key === MISSIONS || e.key === null) run(); };
  run(); window.addEventListener(EVENT, run); window.addEventListener('storage', onStorage);
  return () => { window.removeEventListener(EVENT, run); window.removeEventListener('storage', onStorage); };
}
