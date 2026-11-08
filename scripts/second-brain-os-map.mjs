// The live map of Second Brain OS: every synced page as a point, every link between two pages as a thread, laid out once
// (here, not in the visitor's browser) so the map is the same on every visit and costs the page nothing to compute.
// Reads app/prototype/second-brain-os/data/library.json, writes data/map.json. Run after the sync (the sync runs it too).
// Two layouts: a wide one for desktops and a tall one for phones. The two start pages (overview, guides) link back from
// nearly every page; those links are left out (they would hide the real structure), except their links to each section.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATA = join(ROOT, 'app/prototype/second-brain-os/data');
const L = JSON.parse(readFileSync(join(DATA, 'library.json'), 'utf8'));
const WING = '/bai-room-of-learning/second-brain-os';
const START = [`${WING}/overview`, `${WING}/guides`];

// ---- Nodes: each page, its shelf and section ----
const urls = L.order;
const at = new Map(urls.map((u, i) => [u, i]));
const shelfOf = new Map(), sectionOf = new Map(), indexes = new Set();
for (const g of L.groups) for (const s of g.sections) { indexes.add(s.url); for (const u of s.pages) { shelfOf.set(u, g.id); sectionOf.set(u, `${g.id}/${s.id}`); } }
shelfOf.set(`${WING}/roadmap`, 'second-brain'); sectionOf.set(`${WING}/roadmap`, 'second-brain/roadmap');
for (const u of [...START, `${WING}/license`]) { shelfOf.set(u, 'start'); sectionOf.set(u, 'start'); }
const missing = urls.filter(u => !shelfOf.has(u));
if (missing.length) throw new Error(`Pages with no shelf: ${missing.join(', ')}`);

// ---- Threads: one per pair of pages that link to each other (either way) ----
const pairs = new Set();
for (const u of urls) for (const m of L.pages[u].html.matchAll(/href="(\/bai-room-of-learning\/second-brain-os\/[^"#]*)/g)) {
  const v = m[1]; if (v === u || !at.has(v)) continue;
  const hub = START.includes(u) || START.includes(v);
  if (hub && !(START.includes(u) && (indexes.has(v) || START.includes(v))) && !(START.includes(v) && (indexes.has(u) || START.includes(u)))) continue;
  const [a, b] = [at.get(u), at.get(v)].sort((x, y) => x - y); pairs.add(`${a}-${b}`);
}
const edges = [...pairs].map(p => p.split('-').map(Number)).sort((x, y) => x[0] - y[0] || x[1] - y[1]);
const degree = urls.map(() => 0); for (const [a, b] of edges) { degree[a]++; degree[b]++; }

// ---- Layout: a small force simulation, seeded, so every run gives the same map ----
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const radius = i => +(Math.min(7.5, 2.4 + Math.sqrt(degree[i]) * 0.85) + (indexes.has(urls[i]) || START.includes(urls[i]) ? 1.6 : 0)).toFixed(1);

function layout({ w, h, anchors, spread, seed }) {
  const rand = rng(seed);
  // Section centres sit on a ring around their shelf's anchor; pages start near their section's centre.
  const centre = new Map();
  for (const [shelf, [ax, ay]] of Object.entries(anchors)) {
    const secs = [...new Set(urls.filter(u => shelfOf.get(u) === shelf).map(u => sectionOf.get(u)))];
    const n = urls.filter(u => shelfOf.get(u) === shelf).length, R = secs.length > 1 ? spread * Math.sqrt(n) : 0;
    secs.forEach((s, k) => { const a = (k / secs.length) * Math.PI * 2 - Math.PI / 2; centre.set(s, [ax + Math.cos(a) * R, ay + Math.sin(a) * R * 0.82]); });
  }
  const P = urls.map(u => { const [cx, cy] = centre.get(sectionOf.get(u)); return [cx + (rand() - .5) * 30, cy + (rand() - .5) * 30]; });
  const r = urls.map((_, i) => radius(i));
  const N = urls.length;
  for (let it = 0; it < 700; it++) {
    const cool = 1 - it / 700, F = urls.map(() => [0, 0]);
    for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
      let dx = P[i][0] - P[j][0], dy = P[i][1] - P[j][1]; const d2 = dx * dx + dy * dy + .01, d = Math.sqrt(d2);
      if (d > 110) continue;
      const push = 260 / d2 + (d < r[i] + r[j] + 7 ? (r[i] + r[j] + 7 - d) * .5 : 0);
      dx /= d; dy /= d; F[i][0] += dx * push; F[i][1] += dy * push; F[j][0] -= dx * push; F[j][1] -= dy * push;
    }
    for (const [a, b] of edges) {
      const same = sectionOf.get(urls[a]) === sectionOf.get(urls[b]), shelf = shelfOf.get(urls[a]) === shelfOf.get(urls[b]);
      const rest = same ? 24 : shelf ? 60 : 180, k = same ? .04 : shelf ? .01 : .001;
      const dx = P[b][0] - P[a][0], dy = P[b][1] - P[a][1], d = Math.hypot(dx, dy) || .01, f = (d - rest) * k;
      F[a][0] += dx / d * f; F[a][1] += dy / d * f; F[b][0] -= dx / d * f; F[b][1] -= dy / d * f;
    }
    for (let i = 0; i < N; i++) {
      const [cx, cy] = centre.get(sectionOf.get(urls[i])), [ax, ay] = anchors[shelfOf.get(urls[i])];
      F[i][0] += (cx - P[i][0]) * .03 + (ax - P[i][0]) * .004; F[i][1] += (cy - P[i][1]) * .03 + (ay - P[i][1]) * .004;
      const step = Math.min(6, Math.hypot(F[i][0], F[i][1])) / (Math.hypot(F[i][0], F[i][1]) || 1) * (0.25 + cool);
      P[i][0] = Math.max(28, Math.min(w - 28, P[i][0] + F[i][0] * step)); P[i][1] = Math.max(40, Math.min(h - 22, P[i][1] + F[i][1] * step));
    }
  }
  const boxes = Object.fromEntries(Object.keys(anchors).map(shelf => {
    const pts = urls.map((u, i) => [u, i]).filter(([u]) => shelfOf.get(u) === shelf).map(([, i]) => P[i]);
    const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
    return [shelf, [Math.min(...xs) - 14, Math.min(...ys) - 14, Math.max(...xs) + 14, Math.max(...ys) + 14].map(v => Math.round(v))];
  }));
  return { w, h, points: P.map(([x, y]) => [+x.toFixed(1), +y.toFixed(1)]), boxes };
}

const wide = layout({ w: 1000, h: 620, spread: 18, seed: 7, anchors: { course: [190, 175], handbooks: [790, 175], 'second-brain': [430, 430], resources: [865, 500], start: [490, 200] } });
const tall = layout({ w: 440, h: 760, spread: 11.5, seed: 11, anchors: { course: [130, 125], start: [330, 80], resources: [345, 205], handbooks: [215, 345], 'second-brain': [220, 595] } });

const map = {
  source: L.source.commit,
  nodes: urls.map((u, i) => ({ url: u, shelf: shelfOf.get(u), section: sectionOf.get(u), r: radius(i), index: indexes.has(u) || START.includes(u) })),
  edges, wide, tall,
};
writeFileSync(join(DATA, 'map.json'), JSON.stringify(map) + '\n');
const cross = edges.filter(([a, b]) => shelfOf.get(urls[a]) !== shelfOf.get(urls[b])).length;
console.log(`map: ${urls.length} pages, ${edges.length} threads (${cross} between shelves), wrote data/map.json`);
