/* The cave map's camera: where each chamber sits in the painted cave, and how the camera frames it.
   One world for every screen: the Workbench cutaway (fix-d F2, 3168 x 1344). Coordinates are the painting's pixels.
   A shot is a centre (x, y) and a view width w in world units: the viewport shows w units across.
   Desktop frames each room right of the copy; phones keep the painting's full height on screen and pan across it. */

export type ZoneId = 'desk' | 'learn' | 'ai-suits' | 'proving-wall' | 'training' | 'projects' | 'about';
export type Shot = { x: number; y: number; w: number };
// x, y: the room's centre; rx, ry: its half-size in the painting; w: the desktop view width that frames it.
export type Zone = { id: ZoneId; x: number; y: number; rx: number; ry: number; w: number };
export type World = { width: number; height: number; zones: Zone[] };

// Rooms in chapter order (the route), from the desk (top left) to the waterfall exit (right edge). Measured on the painting.
export const CAVE: World = {
  width: 3168,
  height: 1344,
  zones: [
    { id: 'desk', x: 436, y: 277, rx: 325, ry: 182, w: 1100 },
    { id: 'training', x: 2200, y: 600, rx: 333, ry: 245, w: 1150 },
    { id: 'proving-wall', x: 1481, y: 713, rx: 340, ry: 190, w: 1150 },
    { id: 'ai-suits', x: 539, y: 850, rx: 410, ry: 250, w: 1300 },
    { id: 'learn', x: 1299, y: 270, rx: 290, ry: 205, w: 1000 },
    { id: 'projects', x: 1855, y: 1130, rx: 420, ry: 180, w: 1350 },
    { id: 'about', x: 2893, y: 635, rx: 235, ry: 500, w: 1500 },
  ],
};

export const zone = (world: World, id: ZoneId) => world.zones.find(z => z.id === id)!;

const clampTo = (v: number, lo: number, hi: number) => (lo > hi ? (lo + hi) / 2 : v < lo ? lo : v > hi ? hi : v);

/* How a chamber is framed while you read it (aspect = viewport width / height).
   Desktop: the copy covers the left of the screen, so the room sits right of centre; the view never runs past the
   cave's right edge, and at most 30% of it past the left edge (under the copy).
   Phones: the copy covers everything, so the room is centred, and the view keeps the painting's full height on
   screen (never empty rock above or below), panning across to each room. */
export function holdShot(world: World, id: ZoneId, wide: boolean, aspect: number): Shot {
  const z = zone(world, id);
  if (!wide) {
    const w = Math.min(z.w, world.height * aspect * .96);
    return { x: clampTo(z.x, w / 2, world.width - w / 2), y: world.height / 2, w };
  }
  const w = z.w, h = w / aspect;
  return { x: clampTo(z.x - w * .2, w * .3, world.width - w / 2), y: h >= world.height ? world.height / 2 : clampTo(z.y, h / 2, world.height - h / 2), w };
}

// The establishing shot: the whole world fits in the viewport (contain).
export function wideShot(world: World, aspect: number): Shot {
  return { x: world.width / 2, y: world.height / 2, w: Math.max(world.width, world.height * aspect) * 1.02 };
}

/* A key on the scroll timeline. lift: the flight INTO this key pulls the camera back mid-way (a swoop),
   0 for holds and for the reveal (already a pull-back). */
export type Key = { s: number; shot: Shot; label: string; lift: number };

export type Camera = Shot & { label: string; phase: 'hold' | 'travel' };

/* One continuous path through every key. Each channel (x, y, log of the view width) is a monotone cubic
   (Fritsch-Carlson): it passes exactly through each key, never overshoots (no wobble past a room), and its speed
   changes smoothly everywhere, so the camera eases through a handoff instead of stopping at it. A flight's swoop is a
   real midpoint key on the path. The path starts and ends at rest. */
export type Path = { s: number[]; ch: number[][]; m: number[][]; label: string[] };

function tangents(s: number[], v: number[]) {
  const n = s.length, d: number[] = [], m = new Array(n).fill(0);
  for (let k = 0; k < n - 1; k++) d.push((v[k + 1] - v[k]) / (s[k + 1] - s[k]));
  for (let k = 1; k < n - 1; k++) {
    if (d[k - 1] * d[k] <= 0) continue;
    const h0 = s[k] - s[k - 1], h1 = s[k + 1] - s[k], w1 = 2 * h1 + h0, w2 = h1 + 2 * h0;
    m[k] = (w1 + w2) / (w1 / d[k - 1] + w2 / d[k]);
  }
  return m;
}

export function buildPath(keys: Key[]): Path {
  const pts: { s: number; x: number; y: number; lw: number; label: string }[] = [];
  const push = (s: number, x: number, y: number, w: number, label: string) => {
    // Keys must strictly increase along the scroll; a zero-length hold gets a hair of length.
    const prev = pts[pts.length - 1];
    pts.push({ s: prev && s <= prev.s ? prev.s + .5 : s, x, y, lw: Math.log(w), label });
  };
  keys.forEach((b, i) => {
    const a = keys[i - 1];
    if (a && a.label !== b.label && b.lift > 0) {
      const mid = (a.s + b.s) / 2;
      push(mid, (a.shot.x + b.shot.x) / 2, (a.shot.y + b.shot.y) / 2, Math.sqrt(a.shot.w * b.shot.w) * (1 + b.lift), '~');
    }
    push(b.s, b.shot.x, b.shot.y, b.shot.w, b.label);
  });
  const s = pts.map(p => p.s);
  const ch = [pts.map(p => p.x), pts.map(p => p.y), pts.map(p => p.lw)];
  return { s, ch, m: ch.map(v => tangents(s, v)), label: pts.map(p => p.label) };
}

export function cameraAt(path: Path, at: number): Camera {
  const { s, ch, m, label } = path, n = s.length;
  const v = (c: number, k: number, t: number, h: number) => {
    const t2 = t * t, t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * ch[c][k] + (t3 - 2 * t2 + t) * h * m[c][k] + (-2 * t3 + 3 * t2) * ch[c][k + 1] + (t3 - t2) * h * m[c][k + 1];
  };
  if (at <= s[0]) return { x: ch[0][0], y: ch[1][0], w: Math.exp(ch[2][0]), label: label[0], phase: 'hold' };
  if (at >= s[n - 1]) return { x: ch[0][n - 1], y: ch[1][n - 1], w: Math.exp(ch[2][n - 1]), label: label[n - 1], phase: 'hold' };
  let k = 0;
  while (k < n - 2 && at > s[k + 1]) k++;
  const h = s[k + 1] - s[k], t = (at - s[k]) / h;
  // Which room the camera belongs to: a hold is between two keys of the same room; a flight is anything else.
  const named = (j: number, dir: number) => { while (label[j] === '~') j += dir; return label[j]; };
  const from = named(k, -1), to = named(k + 1, 1);
  const hold = from === to && label[k] !== '~' && label[k + 1] !== '~';
  // Mid-flight the camera belongs to the room it is heading for once it passes the swoop (or halfway, with no swoop).
  const past = label[k] === '~' ? true : label[k + 1] === '~' ? false : t >= .5;
  return { x: v(0, k, t, h), y: v(1, k, t, h), w: Math.exp(v(2, k, t, h)), label: hold || !past ? from : to, phase: hold ? 'hold' : 'travel' };
}

/* Critically damped follower (the classic SmoothDamp): the world's camera chases the scroll position with no
   overshoot and a continuous speed, so a mouse-wheel notch becomes a short glide instead of a jump. */
export function smoothDamp(current: number, target: number, velocity: number, smoothTime: number, dt: number) {
  const omega = 2 / smoothTime, x = omega * dt;
  const decay = 1 / (1 + x + .48 * x * x + .235 * x * x * x);
  const change = current - target, temp = (velocity + omega * change) * dt;
  const v = (velocity - omega * temp) * decay;
  return { value: target + (change + temp) * decay, velocity: v };
}

// The CSS transform that puts a shot's centre in the middle of a vw x vh viewport.
export function cameraTransform(shot: Shot, vw: number, vh: number) {
  const k = vw / shot.w;
  return { k, transform: `translate3d(${(vw / 2 - shot.x * k).toFixed(1)}px, ${(vh / 2 - shot.y * k).toFixed(1)}px, 0) scale(${k.toFixed(5)})` };
}

/* ---- The scroll timeline, built from the measured layout (pure, so tests run it on the same code as the page). ---- */

// A chamber has settled once its top is 20% down the viewport.
export const ENTRY_END = .2;
const LIFT = .38;
const DRIFT = .025;
const PUSH = .015;

// exit = where the chamber's leaving move starts; run = its length; settle = where its copy has fully arrived.
export type Box = { id: string; top: number; height: number; exit: number; run: number; settle: number };
// A stretch of scroll with no chamber copy on screen: room labels show there (labels false: not between the masthead and
// the bio, which both sit at the desk; a neighbouring room's name there would point the wrong way); flock marks the two cuts the bats cover.
export type Gap = { a: number; b: number; flock: boolean; labels: boolean };

export function timeline(boxes: Box[], world: World, vw: number, vh: number, wide: boolean, travel: number) {
  const last = boxes.length - 1;
  const aspect = vw / vh;
  const shotFor = (id: string) => id === 'masthead' ? holdShot(world, 'desk', false, aspect) : id === 'who' ? holdShot(world, 'desk', wide, aspect) : id === 'reveal' ? wideShot(world, aspect) : holdShot(world, id as ZoneId, wide, aspect);
  const shots = boxes.map(b => shotFor(b.id));
  const keys: Key[] = [];
  boxes.forEach((b, i) => {
    const shot = shots[i];
    const end = i === last ? travel : b.exit;
    const start = i === 0 ? 0 : b.settle;
    // Phones never swoop: a pull-back would show empty rock above and below the painting. They pan instead.
    const lift = !wide || i === 0 || b.id === 'reveal' || boxes[i - 1].id === 'reveal' || boxes[i - 1].id === 'masthead' ? 0 : LIFT;
    if (b.id === 'masthead') {
      // The world is hidden under the masthead. When the next stop frames the same room the same way (Who is Balram? on a
      // phone: both hold the desk), park the hidden camera two drift steps behind that stop's entry, so the camera is
      // already gliding when the bio settles instead of starting from a dead stop.
      let park = shot;
      const next = shots[i + 1], after = shots[i + 2];
      if (next && after && Math.hypot(next.x - shot.x, next.y - shot.y) < 1 && Math.abs(next.w / shot.w - 1) < 1e-3) {
        const l = Math.hypot(after.x - next.x, after.y - next.y) || 1, d = next.w * DRIFT * 2;
        park = { x: next.x - (after.x - next.x) / l * d, y: next.y - (after.y - next.y) / l * d, w: next.w * (1 + PUSH * 2) };
      }
      keys.push({ s: start, shot: park, label: b.id, lift }, { s: Math.max(start, end), shot: park, label: b.id, lift: 0 });
      return;
    }
    if (b.id === 'reveal') {
      // The overview never freezes: it keeps easing back a little while gliding toward the first room, so the
      // pull-back runs straight into the dive (zoom carries the motion in, position carries it out).
      const next = shots[i + 1] ?? shot;
      const len = Math.hypot(next.x - shot.x, next.y - shot.y) || 1, d = shot.w * .02;
      const ux = (next.x - shot.x) / len, uy = (next.y - shot.y) / len;
      keys.push(
        { s: start, shot: { x: shot.x - ux * d, y: shot.y - uy * d, w: shot.w * .97 }, label: b.id, lift },
        { s: Math.max(start, end), shot: { x: shot.x + ux * d, y: shot.y + uy * d, w: shot.w }, label: b.id, lift: 0 },
      );
      return;
    }
    // Drift through the room: it carries on in the direction it arrived until mid-read, then eases toward the next
    // room, pushing in a touch all the way. So no handoff is ever a dead stop, even where the route doubles back (on a
    // phone the gallery is left of both its neighbours): the turn happens mid-read, while the push-in keeps it moving.
    const prev = shots[i - 1], to = shots[i + 1] ?? { x: shot.x * 2 - prev.x, y: shot.y * 2 - prev.y, w: shot.w };
    // Arriving from the same framing (the bio after the masthead on a phone): carry on in the direction it will leave.
    const from = Math.hypot(prev.x - shot.x, prev.y - shot.y) < 1 ? { x: shot.x * 2 - to.x, y: shot.y * 2 - to.y, w: shot.w } : prev;
    const unit = (a: Shot, b: Shot) => { const l = Math.hypot(b.x - a.x, b.y - a.y) || 1; return [(b.x - a.x) / l, (b.y - a.y) / l]; };
    const [ax, ay] = unit(from, shot), [bx, by] = unit(shot, to), d = shot.w * DRIFT;
    const stop = Math.max(start, end);
    keys.push(
      { s: start, shot: { x: shot.x - ax * d, y: shot.y - ay * d, w: shot.w * (1 + PUSH) }, label: b.id, lift },
      { s: (start + stop) / 2, shot, label: b.id, lift: 0 },
      { s: stop, shot: { x: shot.x + bx * d, y: shot.y + by * d, w: shot.w * (1 - PUSH) }, label: b.id, lift: 0 },
    );
  });
  // Gaps between copy: from the moment one chamber's copy has fully faded (35% into its leaving run) to the moment
  // the next one's starts to appear (40% into its entry). The reveal has no chamber copy, so it sits inside a gap.
  const copy = boxes.filter(b => b.id !== 'reveal');
  const gaps: Gap[] = [];
  for (let j = 0; j < copy.length - 1; j++) {
    const p = copy[j], q = copy[j + 1];
    const a = p.exit + Math.max(0, p.run) * .35, z = q.top - vh + vh * (1 - ENTRY_END) * .4;
    if (z > a) gaps.push({ a, b: z, flock: j === 0 || j === copy.length - 2, labels: !(p.id === 'masthead' && q.id === 'who') });
  }
  return { keys, gaps };
}
