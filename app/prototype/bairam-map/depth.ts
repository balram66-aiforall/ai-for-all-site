/* Depth for the painted cave (step 4): layers in front of the painting that move at their own speed, and the small
   loops painted onto it. Pure data and maths, so the tests run the same numbers as the page.
   Layers: each sits at a depth f (1 = the painting). A point p of a layer shows at centre + (p - camera) * k * f, so
   when the camera moves, a nearer layer slides past faster than the painting. The near rocks (f 2.2) are blurred,
   placed so each one crosses the top or bottom edge of the frame during a flight and never covers the room you are
   reading; the dust (f 1.15) floats just in front of the rooms. Both fade out as the camera pulls back to the whole map.
   Loops, in the painting's pixels: the waterfall falling, the screens flickering, light running along the gold cable. */
import type { Shot } from './camera';

export const NEAR_F = 2.2;
export const DUST_F = 1.15;

/* Near rocks, in the painting's pixels at depth NEAR_F, found by search: each reaches 4-30% into the top or bottom of the
   frame during its flight (6-24% of the screen at most) and never overlaps the room being read at any hold. up: a stalactite hanging into the top of the frame, or a ledge rising from the bottom. */
export type Rock = { x: number; y: number; rx: number; ry: number; up: boolean };
export const ROCKS: Rock[] = [
  { x: 469, y: 410, rx: 90, ry: 160, up: false },    // the deck to the gallery: hangs over the top edge
  { x: 1010, y: 857, rx: 90, ry: 160, up: true },    // the gallery to the proving wall: rises at the bottom
  { x: 1665, y: 482, rx: 90, ry: 160, up: false },   // the proving wall to the mission room
  { x: 2102, y: 890, rx: 90, ry: 160, up: true },   // the mission room to the workshop
  { x: 2349, y: 482, rx: 90, ry: 160, up: false },   // the workshop to the cave mouth
];

// The layer's CSS transform for a camera shot (same convention as cameraTransform, at depth f).
export function layerTransform(shot: Shot, vw: number, vh: number, f: number) {
  const k = vw / shot.w * f;
  return `translate3d(${(vw / 2 - shot.x * k).toFixed(1)}px, ${(vh / 2 - shot.y * k).toFixed(1)}px, 0) scale(${k.toFixed(5)})`;
}

// Near layers belong to the rooms: full while the camera is in close, gone by the time it shows the whole map.
export const depthFade = (w: number) => (w <= 2000 ? 1 : w >= 2700 ? 0 : 1 - (w - 2000) / 700);

/* Each rock is a sprite cut from the painting's own rock (out of focus, darkened, soft-edged), made by
   frontier-aimplify/work/builder/2026-10-18-cave-map-step4/source/rocks.py. Its box is the rock plus ROCK_PAD on every side. */
export const ROCK_PAD = 39;
export const rockSprite = (i: number) => `/assets/bairam-map/near-rock-${i}.webp`;

// Dust: a loose cloud of motes in front of each room (painting pixels at DUST_F), drifting slowly.
export type Mote = { x: number; y: number; r: number; o: number };
const rand = (seed: number) => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
export function dustCloud(cx: number, cy: number, rx: number, ry: number, n: number, seed: number): Mote[] {
  const next = rand(seed);
  return Array.from({ length: n }, () => ({ x: cx + (next() * 2 - 1) * rx, y: cy + (next() * 2 - 1) * ry, r: 1.4 + next() * 2.4, o: .25 + next() * .45 }));
}

/* The gold cable, traced on the painting (the six runs between rooms). Light pulses run along it in a chain, out from
   the desk, on one shared cycle. at: when the pulse sets off, in seconds into the cycle. */
export type Run = { id: string; at: number; pts: [number, number][] };
export const CABLE_CYCLE = 8;
const CABLE_SPEED = 300; // painting pixels per second
export const CABLE: Run[] = [
  { id: 'desk-deck', at: 0, pts: [[573, 507], [599, 514], [625, 515], [650, 512], [675, 509], [700, 507], [725, 505], [750, 502], [775, 497], [800, 492], [825, 485], [850, 482], [875, 482], [900, 482], [925, 479], [950, 474], [975, 470], [1000, 471], [1025, 473], [1050, 475], [1076, 476], [1102, 472], [1125, 456], [1134, 445]] },
  { id: 'down', at: 1.45, pts: [[1011, 506], [1033, 519], [1055, 532], [1074, 546], [1087, 565], [1093, 588], [1095, 613], [1097, 638], [1098, 663], [1098, 687], [1099, 713], [1100, 737], [1100, 762], [1101, 787], [1101, 812], [1101, 837], [1102, 863], [1104, 889], [1111, 916], [1129, 939], [1156, 953], [1182, 964], [1196, 969]] },
  { id: 'deck-hub', at: 2.2, pts: [[1503, 399], [1516, 408], [1542, 420], [1571, 425], [1598, 430], [1623, 438], [1647, 447], [1672, 454], [1698, 460], [1723, 464], [1748, 468], [1774, 469], [1800, 470], [1825, 468], [1838, 467]] },
  { id: 'wall-hub', at: 3.4, pts: [[1220, 942], [1247, 930], [1274, 923], [1299, 919], [1324, 916], [1350, 913], [1375, 910], [1400, 906], [1424, 901], [1449, 896], [1474, 892], [1499, 889], [1524, 885], [1549, 882], [1574, 878], [1599, 875], [1624, 872], [1649, 868], [1674, 864], [1699, 860], [1724, 856], [1749, 853], [1774, 850], [1799, 846], [1823, 836], [1846, 823], [1870, 812], [1895, 807], [1908, 805]] },
  { id: 'to-workshop', at: 3.4, pts: [[1207, 973], [1230, 986], [1249, 1002], [1265, 1021], [1281, 1042], [1298, 1063], [1317, 1083], [1337, 1103], [1360, 1120], [1385, 1132], [1411, 1137], [1437, 1133]] },
  { id: 'workshop-exit', at: 5.2, pts: [[2233, 1124], [2259, 1129], [2286, 1131], [2313, 1127], [2337, 1116], [2357, 1099], [2374, 1079], [2392, 1061], [2413, 1048], [2437, 1041], [2462, 1037], [2487, 1033], [2512, 1029], [2536, 1026], [2548, 1023]] },
];

/* One run's keyframes: the pulse fades in at the start, moves at constant speed through every traced point, fades
   out at the end, and waits (hidden) for the rest of the cycle. Transform and opacity only, so the compositor runs it. */
export function cableKeyframes(run: Run) {
  const seg = run.pts.slice(1).map((p, i) => Math.hypot(p[0] - run.pts[i][0], p[1] - run.pts[i][1]));
  const total = seg.reduce((a, b) => a + b, 0);
  const span = total / CABLE_SPEED / CABLE_CYCLE * 100;
  let acc = 0;
  const frames = run.pts.map((p, i) => {
    if (i > 0) acc += seg[i - 1];
    const t = acc / total;
    const o = Math.min(1, t / .12, (1 - t) / .18);
    return `${(t * span).toFixed(2)}%{transform:translate3d(${p[0]}px,${p[1]}px,0);opacity:${o.toFixed(2)}}`;
  });
  const end = run.pts[run.pts.length - 1];
  frames.push(`${Math.min(100, span + .01).toFixed(2)}%,100%{transform:translate3d(${end[0]}px,${end[1]}px,0);opacity:0}`);
  return { span, css: `@keyframes bmap-cable-${run.id}{${frames.join('')}}` };
}

/* The screens: soft glows over the desk wall and the mission room's hub, each flickering on its own clock.
   x, y, rx, ry in the painting's pixels; warm or cool to match the screen underneath. */
export type Glow = { x: number; y: number; rx: number; ry: number; cool?: boolean; t: number; d: number };
export const GLOWS: Glow[] = [
  { x: 325, y: 222, rx: 95, ry: 48, t: 6.3, d: -1.1 },
  { x: 455, y: 155, rx: 52, ry: 30, t: 4.7, d: -3.2 },
  { x: 137, y: 232, rx: 36, ry: 52, t: 7.9, d: -.4 },
  { x: 548, y: 222, rx: 52, ry: 46, t: 5.6, d: -2.5 },
  { x: 392, y: 310, rx: 66, ry: 28, t: 9.1, d: -5.0 },
  { x: 2102, y: 548, rx: 118, ry: 54, t: 6.8, d: -2.0 },
  { x: 2268, y: 548, rx: 60, ry: 54, cool: true, t: 5.1, d: -.7 },
  { x: 2112, y: 470, rx: 112, ry: 30, t: 8.4, d: -4.1 },
  { x: 2380, y: 558, rx: 52, ry: 60, t: 7.3, d: -3.6 },
  { x: 1962, y: 555, rx: 44, ry: 62, cool: true, t: 6.1, d: -1.8 },
];

// The waterfall at the cave mouth: the falling sheet's box, and its outline inside that box (the overhang cuts its top left).
export const FALL = { x: 2688, y: 66, w: 136, h: 910, outline: [[112, 6], [126, 6], [128, 894], [10, 894], [8, 124], [52, 74], [97, 28]] as [number, number][] };
export const FALL_TILE = 260;
// A tile of streaks, seamless top to bottom, as an SVG background (two seeds give two layers falling at different speeds).
export function fallTile(seed: number, n: number) {
  const next = rand(seed), w = FALL.w, h = FALL_TILE;
  const lines: string[] = [];
  for (let i = 0; i < n; i++) {
    const x = (6 + next() * (w - 12)).toFixed(1), y = next() * h, len = 40 + next() * 120;
    const sw = (1.2 + next() * 2.6).toFixed(1), o = (.12 + next() * .3).toFixed(2);
    for (const dy of [0, -h]) lines.push(`<line x1='${x}' x2='${x}' y1='${(y + dy).toFixed(1)}' y2='${(y + dy + len).toFixed(1)}' stroke-width='${sw}' stroke-opacity='${o}'/>`);
  }
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' viewBox='0 0 ${w} ${h}'><g stroke='%23eaf3ff' stroke-linecap='round'>${lines.join('')}</g></svg>`;
  return `url("data:image/svg+xml,${svg.replace(/</g, '%3C').replace(/>/g, '%3E')}")`;
}
