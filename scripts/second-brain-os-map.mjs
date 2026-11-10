// The live map of Second Brain OS: every synced page as a point, every link between two pages as a thread, laid out once
// (here, not in the visitor's browser) so the map is the same on every visit and costs the page nothing to compute.
// Reads app/prototype/second-brain-os/data/library.json, writes data/map.json. Run after the sync (the sync runs it too).
// Two layouts, both drawn as a brain (below): a wide one for desktops and a tall one for phones. The two start pages (overview, guides) link back from
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

// ---- The brain: the map is drawn as a brain and every shelf lives in one part of it (Balram, Nov 10: "can we create it
// like a brain?", then "Looks good, build it" on the mock). Desktop: seen from the side, front to the left. The agents
// course in the frontal lobe, the handbooks across the top (parietal), the second brain low and behind (temporal and
// occipital, where memory sits), the resources in the cerebellum, the start pages in the brainstem. Phones: seen from
// above (two hemispheres, front at the top), the same order from top to bottom, the cerebellum peeking out below.
// Original line art, generated here: a ridged edge (the gyri seen edge-on), meandering folds, the two main sulci.
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const radius = i => +(Math.min(7.5, 2.4 + Math.sqrt(degree[i]) * 0.85) + (indexes.has(urls[i]) || START.includes(urls[i]) ? 1.6 : 0)).toFixed(1);
const titles = Object.fromEntries(L.groups.map(g => [g.id, g.title]));

function spline(pts, closed, seg = 8) {
  const n = pts.length, out = [], P = i => closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))];
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const [p0, p1, p2, p3] = [P(i - 1), P(i), P(i + 1), P(i + 2)];
    for (let t = 0; t < seg; t++) { const s = t / seg, s2 = s * s, s3 = s2 * s;
      out.push([0, 1].map(k => .5 * (2 * p1[k] + (-p0[k] + p2[k]) * s + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * s2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * s3))); }
  }
  if (!closed) out.push(pts[n - 1]);
  return out;
}
const inside = (poly, x, y) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j];
  if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
// The value of coordinate `to` on a polyline where coordinate `from` = v (the polyline runs one way along `from`).
const along = (line, v, from, to) => { if (v <= line[0][from]) return line[0][to];
  for (let i = 1; i < line.length; i++) if (v <= line[i][from]) { const a = line[i - 1], b = line[i], t = (v - a[from]) / (b[from] - a[from]); return a[to] + (b[to] - a[to]) * t; }
  return line[line.length - 1][to]; };
const ellipse = (cx, cy, rx, ry, rot = 0, n = 64) => Array.from({ length: n }, (_, k) => { const a = k / n * Math.PI * 2, c = Math.cos(rot), s = Math.sin(rot), x = Math.cos(a) * rx, y = Math.sin(a) * ry; return [cx + x * c - y * s, cy + x * s + y * c]; });
const centroid = poly => poly.reduce((a, p) => [a[0] + p[0] / poly.length, a[1] + p[1] / poly.length], [0, 0]);
const path = (lines, closed, dp = 1) => lines.map(pts => 'M' + pts.map(p => p.map(v => +v.toFixed(dp)).join(' ')).join('L') + (closed ? 'Z' : '')).join('');
// Fine line work in whole units as short relative steps (the folds are many lines; this keeps the map's data small).
const steps = lines => lines.map(pts => { const q = pts.map(p => p.map(Math.round)); return `M${q[0][0]} ${q[0][1]}l` + q.slice(1).map((p, i) => `${p[0] - q[i][0]} ${p[1] - q[i][1]}`).join(' ').replace(/ -/g, '-'); }).join('');
// Ridged edge: the outline pushed out in rounded bumps with creases between them; mask(x, y) 0..1 calms it where the brain is smooth.
function ridged(poly, bumps, amp, mask = () => 1) {
  const n = poly.length, [cx, cy] = centroid(poly), len = [0];
  for (let i = 1; i < n; i++) len.push(len[i - 1] + Math.hypot(poly[i][0] - poly[i - 1][0], poly[i][1] - poly[i - 1][1]));
  const total = len[n - 1] + Math.hypot(poly[0][0] - poly[n - 1][0], poly[0][1] - poly[n - 1][1]);
  return poly.map((q, i) => { const a = poly[(i - 1 + n) % n], b = poly[(i + 1) % n]; let nx = b[1] - a[1], ny = a[0] - b[0]; const m = Math.hypot(nx, ny) || 1; nx /= m; ny /= m;
    if (nx * (q[0] - cx) + ny * (q[1] - cy) < 0) { nx = -nx; ny = -ny; }
    const t = len[i] / total, bump = Math.pow(Math.abs(Math.sin(Math.PI * bumps * t + Math.sin(t * 37) * .35)), .55) * amp * mask(q[0], q[1]);
    return [q[0] + nx * bump, q[1] + ny * bump]; });
}
// Folds: lines that start at the edge and meander inward (some branch), and a few short ones inside.
function folds(poly, count, steps, seed, skip, inner, [x0, y0, x1, y1]) {
  const rand = rng(seed), out = [], [cx, cy] = centroid(poly), n = poly.length;
  const walk = (x, y, a, k) => { const line = [[x, y]]; let turn = 0;
    for (let i = 0; i < k; i++) { turn = turn * .82 + (rand() - .5) * .32; a += turn; x += Math.cos(a) * 7; y += Math.sin(a) * 7; if (!inside(poly, x, y)) break; line.push([x, y]);
      if (i === Math.floor(k / 2) && rand() < .5) out.push(walk(x, y, a + (rand() < .5 ? .9 : -.9), Math.floor(k / 2.5))); }
    return line; };
  for (let j = 0; j < count; j++) { const q = poly[Math.floor((j + rand() * .6) / count * n) % n]; if (skip(q[0], q[1])) continue;
    const a = Math.atan2(cy - q[1], cx - q[0]) + (rand() - .5) * .9; out.push(walk(q[0] + Math.cos(a) * 2, q[1] + Math.sin(a) * 2, a, steps - 2 + Math.floor(rand() * 5))); }
  for (let j = 0; j < inner; j++) { const x = x0 + rand() * (x1 - x0), y = y0 + rand() * (y1 - y0); if (inside(poly, x, y)) out.push(walk(x, y, rand() * Math.PI * 2, 5 + Math.floor(rand() * 6))); }
  return out.filter(l => l.length > 2).map(l => spline(l, false, 2));
}
// The cerebellum's ridges (folia): gently arched lines across it.
const folia = (cx, cy, rx, ry, n) => Array.from({ length: n }, (_, k) => { const y = cy - ry + (k + 1) * (2 * ry / (n + 1)), lift = 18 * (1 - (k + 1) / (n + 1));
  return Array.from({ length: 25 }, (_, i) => { const u = i / 24 * 2 - 1; return [cx + u * rx, y - lift + lift * u * u + Math.sin(i * 1.3 + k) * 1.2]; }); });

function sideBrain() { // 1000 x 620
  const cerebrum = ridged(spline([[110, 362], [92, 290], [118, 200], [188, 118], [300, 62], [432, 38], [572, 40], [702, 64], [812, 114], [892, 190], [928, 282], [908, 362], [852, 410], [760, 440], [660, 470], [540, 490], [432, 482], [362, 452], [330, 404], [300, 378], [222, 388], [150, 388]], true, 20),
    26, 14, (x, y) => y > 430 && x < 700 ? .35 : y > 372 && x < 330 ? .25 : 1);
  const cerebellum = ellipse(782, 490, 122, 64, -0.1), stem = spline([[588, 452], [648, 452], [664, 540], [672, 612], [610, 612], [600, 540]], true, 4);
  const fissure = spline([[300, 378], [420, 334], [540, 302], [660, 290], [790, 284], [940, 268]], false);
  const central = spline([[478, 40], [472, 80], [456, 112], [460, 150], [440, 186], [444, 222], [426, 258], [430, 292], [414, 326]], false);
  const byY = central.slice().sort((a, b) => a[1] - b[1]);
  const part = (x, y) => {
    if (inside(cerebrum, x, y)) { if (x > 300 && y > along(fissure, x, 0, 1)) return 'temporal'; return x < along(byY, y, 1, 0) ? 'frontal' : 'parietal'; }
    if (inside(cerebellum, x, y)) return 'cerebellum'; if (inside(stem, x, y)) return 'stem'; return null; };
  return { w: 1000, h: 620, part, seed: 7, spread: 17,
    lobe: { course: 'frontal', handbooks: 'parietal', 'second-brain': 'temporal', resources: 'cerebellum', start: 'stem' },
    anchors: { course: [[268, 228]], handbooks: [[690, 186]], 'second-brain': [[500, 410], [770, 350]], resources: [[790, 506]], start: [[630, 548]] },
    ring: { course: [1.25, 1.25], handbooks: [1.75, .62], 'second-brain': [1.5, .7], resources: [.9, .5], start: [0, 0] },
    labels: { course: [150, 128, 'start'], handbooks: [800, 104, 'end'], 'second-brain': [560, 470, 'middle'], resources: [782, 600, 'middle'] },
    drawing: { shells: [['stem', stem], ['cerebellum', cerebellum], ['cerebrum', cerebrum]],
      sulci: [fissure, central], folds: folds(cerebrum, 58, 15, 5, (x, y) => (y > 440 && x < 690) || (x < 330 && y > 360), 70, [130, 60, 910, 470]), folia: folia(782, 490, 122, 64, 8) } };
}
function topBrain() { // 440 x 760
  const left = ridged(spline([[212, 46], [172, 30], [124, 44], [80, 92], [50, 168], [32, 262], [26, 362], [30, 462], [44, 552], [74, 622], [120, 662], [172, 680], [208, 676], [212, 560], [208, 420], [213, 280], [208, 150]], true, 18), 30, 11, x => x > 196 ? 0 : 1);
  const right = left.map(([x, y]) => [440 - x, y]), cerebellum = ellipse(220, 700, 150, 48, 0);
  const front = spline([[28, 236], [90, 246], [150, 264], [210, 282]], false), back = spline([[34, 452], [100, 440], [160, 446], [210, 460]], false);
  const mirror = l => l.map(([x, y]) => [440 - x, y]).reverse();
  const part = (x, y) => {
    const side = inside(left, x, y) ? 'L' : inside(right, x, y) ? 'R' : null;
    if (side) { const xm = side === 'L' ? x : 440 - x; if (y < along(front, xm, 0, 1)) return 'frontal'; return y < along(back, xm, 0, 1) ? 'parietal' : 'occipital'; }
    return inside(cerebellum, x, y) ? 'cerebellum' : null; };
  return { w: 440, h: 760, part, seed: 11, spread: 11,
    lobe: { course: 'frontal', start: 'frontal', handbooks: 'parietal', 'second-brain': 'occipital', resources: 'cerebellum' },
    anchors: { course: [[120, 150], [320, 150]], start: [[176, 70], [264, 70]], handbooks: [[118, 350], [322, 350]], 'second-brain': [[118, 560], [322, 560]], resources: [[150, 714], [290, 714]] },
    ring: { course: [1, 1], start: [0, 0], handbooks: [1, 1], 'second-brain': [1, 1.2], resources: [1, .2] },
    labels: { course: [220, 22, 'middle'], handbooks: [46, 300, 'start'], 'second-brain': [46, 488, 'start'], resources: [220, 756, 'middle'] },
    drawing: { shells: [['cerebellum', cerebellum], ['hemisphere', left], ['hemisphere', right]],
      sulci: [front, mirror(front), back, mirror(back)], folds: [...folds(left, 44, 11, 3, x => x > 196, 34, [30, 40, 205, 670]), ...folds(right, 44, 11, 9, x => x < 244, 34, [235, 40, 410, 670])], folia: folia(220, 700, 150, 48, 5) } };
}

// ---- Layout: a small force simulation, seeded (every run gives the same map), every point held inside its part ----
function layout(B) {
  const { w, h, spread, seed } = B, rand = rng(seed), N = urls.length, r = urls.map((_, i) => radius(i));
  // Which part of the brain each spot is in, worked out once on a 2-unit grid (the layout asks millions of times).
  const G = 2, gw = Math.ceil(w / G) + 1, gh = Math.ceil(h / G) + 1, parts = [...new Set(Object.values(B.lobe))], grid = new Int8Array(gw * gh).fill(-1);
  for (let gy = 0; gy < gh; gy++) for (let gx = 0; gx < gw; gx++) { const p = B.part(gx * G, gy * G); grid[gy * gw + gx] = p ? parts.indexOf(p) : -1; }
  const partAt = (x, y) => { const gx = Math.round(x / G), gy = Math.round(y / G); return gx < 0 || gy < 0 || gx >= gw || gy >= gh ? -1 : grid[gy * gw + gx]; };
  const tw = s => s.length * 9.6, label = Object.entries(B.labels).map(([s, [x, y, a]]) => { const x0 = a === 'start' ? x : a === 'end' ? x - tw(titles[s]) : x - tw(titles[s]) / 2; return [x0 - 6, y - 16, x0 + tw(titles[s]) + 6, y + 6]; });
  const home = urls.map(u => parts.indexOf(B.lobe[shelfOf.get(u)]));
  const ok = (i, x, y, pad = 5) => { const rr = r[i] + pad;
    if (label.some(([x0, y0, x1, y1]) => x > x0 - rr && x < x1 + rr && y > y0 - rr && y < y1 + rr)) return false;
    if (partAt(x, y) !== home[i]) return false;
    for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2; if (partAt(x + Math.cos(a) * rr, y + Math.sin(a) * rr) !== home[i]) return false; }
    return true; };
  for (const [shelf, list] of Object.entries(B.anchors)) for (const [x, y] of list) { const i = urls.findIndex(u => shelfOf.get(u) === shelf); if (!ok(i, x, y, 12)) throw new Error(`${shelf}: anchor ${x},${y} is not inside its part of the brain`); }
  // Section centres sit on a ring around their shelf's anchor (or anchors); pages start near their section's centre.
  const centre = new Map();
  for (const [shelf, list] of Object.entries(B.anchors)) {
    const secs = [...new Set(urls.filter(u => shelfOf.get(u) === shelf).map(u => sectionOf.get(u)))], n = urls.filter(u => shelfOf.get(u) === shelf).length;
    const per = Math.ceil(secs.length / list.length), R = per > 1 ? spread * Math.sqrt(n / list.length) : 0, [rx, ry] = B.ring[shelf];
    secs.forEach((s, k) => { const [ax, ay] = list[k % list.length], a = Math.floor(k / list.length) / per * Math.PI * 2 - Math.PI / 2;
      centre.set(s, [ax + Math.cos(a) * R * rx, ay + Math.sin(a) * R * ry, ax, ay]); });
  }
  const target = i => { const c = centre.get(sectionOf.get(urls[i])); return ok(i, c[0], c[1], 8) ? [c[0], c[1]] : [c[2], c[3]]; };
  const P = urls.map((_, i) => { const [x, y] = target(i); return [x + (rand() - .5) * 20, y + (rand() - .5) * 20]; });
  const hold = i => { if (ok(i, P[i][0], P[i][1])) return; const [tx, ty] = target(i);
    for (let t = .05; t <= 1.001; t += .05) { const x = P[i][0] + (tx - P[i][0]) * t, y = P[i][1] + (ty - P[i][1]) * t; if (ok(i, x, y)) { P[i] = [x, y]; return; } }
    P[i] = [tx + (rand() - .5) * 4, ty + (rand() - .5) * 4]; };
  P.forEach((_, i) => hold(i));
  for (let it = 0; it < 600; it++) {
    const cool = 1 - it / 600, F = urls.map(() => [0, 0]);
    for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
      let dx = P[i][0] - P[j][0], dy = P[i][1] - P[j][1]; const d2 = dx * dx + dy * dy + .01, d = Math.sqrt(d2); if (d > 110) continue;
      const rr = r[i] + r[j] + 6, push = 200 / d2 + (d < rr ? (rr - d) * .5 : 0); dx /= d; dy /= d;
      F[i][0] += dx * push; F[i][1] += dy * push; F[j][0] -= dx * push; F[j][1] -= dy * push; }
    for (const [a, b] of edges) {
      const same = sectionOf.get(urls[a]) === sectionOf.get(urls[b]), shelf = shelfOf.get(urls[a]) === shelfOf.get(urls[b]);
      const rest = same ? 22 : shelf ? 55 : 180, k = same ? .04 : shelf ? .01 : .0008;
      const dx = P[b][0] - P[a][0], dy = P[b][1] - P[a][1], d = Math.hypot(dx, dy) || .01, f = (d - rest) * k;
      F[a][0] += dx / d * f; F[a][1] += dy / d * f; F[b][0] -= dx / d * f; F[b][1] -= dy / d * f; }
    for (let i = 0; i < N; i++) { const [tx, ty] = target(i); F[i][0] += (tx - P[i][0]) * .03; F[i][1] += (ty - P[i][1]) * .03;
      const m = Math.hypot(F[i][0], F[i][1]) || 1, step = Math.min(6, m) / m * (.25 + cool); P[i] = [P[i][0] + F[i][0] * step, P[i][1] + F[i][1] * step]; hold(i); }
  }
  const stray = urls.filter((_, i) => !ok(i, P[i][0], P[i][1], 2)); if (stray.length) throw new Error(`${stray.length} pages fell outside their part of the brain: ${stray.join(', ')}`);
  const boxes = Object.fromEntries(Object.keys(B.anchors).map(shelf => {
    const pts = urls.map((u, i) => [u, i]).filter(([u]) => shelfOf.get(u) === shelf).map(([, i]) => P[i]);
    const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
    return [shelf, [Math.min(...xs) - 14, Math.min(...ys) - 14, Math.max(...xs) + 14, Math.max(...ys) + 14].map(v => Math.round(v))];
  }));
  const D = B.drawing;
  const brain = { shells: D.shells.map(([part, pts]) => ({ part, d: path([pts], true) })), sulci: path(D.sulci, false), folds: steps(D.folds), folia: steps(D.folia) };
  return { w, h, points: P.map(([x, y]) => [+x.toFixed(1), +y.toFixed(1)]), boxes, labels: B.labels, brain };
}

const wide = layout(sideBrain());
const tall = layout(topBrain());

const map = {
  source: L.source.commit,
  nodes: urls.map((u, i) => ({ url: u, shelf: shelfOf.get(u), section: sectionOf.get(u), r: radius(i), index: indexes.has(u) || START.includes(u) })),
  edges, wide, tall,
};
writeFileSync(join(DATA, 'map.json'), JSON.stringify(map) + '\n');
const cross = edges.filter(([a, b]) => shelfOf.get(urls[a]) !== shelfOf.get(urls[b])).length;
console.log(`map: ${urls.length} pages, ${edges.length} threads (${cross} between shelves), wrote data/map.json`);
