/* The painted cave: the Workbench cutaway (fix-d F2) with our own marks and the room labels drawn over it in code.
   The painting carries no text, logos or marks; the bAI Wing on the deck's turntable and at the searchlight's tip is
   ours and is added here, so it stays crisp at any zoom and can change without repainting.
   One world for desktop and phones (camera.ts frames it differently per screen). */
import type { Ref } from 'react';
import { chapters } from '../bairam/content';
import { MARKS } from '../bairam/mark/marks';
import { CAVE, type World } from './camera';
import { CABLE, CABLE_CYCLE, FALL, FALL_TILE, GLOWS, ROCKS, ROCK_PAD, cableKeyframes, dustCloud, fallTile, rockSprite } from './depth';

const wing = MARKS.find(m => m.id === 'wing')!;
export const ART = { avif: '/assets/bairam-map/cave-map-3168.avif', webp: '/assets/bairam-map/cave-map-3168.webp', jpg: '/assets/bairam-map/cave-map-3168.jpg' };
/* The sharp versions (SeedVR 2x upscale of the same painting, pixel-aligned): the engine swaps one in after the page
   has loaded, during a hold. Phones get 1.5x (less memory), everything else 2x. No JPEG: only AVIF/WebP browsers. */
export const ART_HI = {
  desktop: { width: 6336, avif: '/assets/bairam-map/cave-map-6336.avif', webp: '/assets/bairam-map/cave-map-6336.webp' },
  phone: { width: 4752, avif: '/assets/bairam-map/cave-map-4752.avif', webp: '/assets/bairam-map/cave-map-4752.webp' },
};

// Where our marks sit on the painting (its pixels): flat on the turntable's top, and where the searchlight beam ends.
const TURNTABLE = { x: 1305, y: 356, size: 190, squash: .13 };
const BEAM_TIP = { x: 3032, y: 362, size: 118, angle: -27 };

function WingMark({ x, y, size, squash = 1, angle = 0, className }: { x: number; y: number; size: number; squash?: number; angle?: number; className: string }) {
  return (
    <g className={className} transform={`translate(${x} ${y}) rotate(${angle}) scale(1 ${squash})`}>
      <svg x={-size / 2} y={-size / 2} width={size} height={size} viewBox="0 0 100 100" overflow="visible">{wing.shapes}</svg>
    </g>
  );
}

// Painted room labels, in painting units, and the smallest on-screen size they may show at (see map-journey).
export const LABEL_SIZE = 40;
export const LABEL_MIN_PX = 15;

export function CaveWorld({ world }: { world: World }) {
  const name = (id: string) => chapters.find(c => c.id === id);
  return (
    <div className="bmap-art" style={{ width: world.width, height: world.height }}>
      <picture>
        <source type="image/avif" srcSet={ART.avif} />
        <source type="image/webp" srcSet={ART.webp} />
        <img className="bmap-art-img" src={ART.jpg} width={world.width} height={world.height} alt="" decoding="async" draggable={false} />
      </picture>
      {/* eslint-disable-next-line @next/next/no-img-element -- the engine sets its src after load and swaps it in during a hold */}
      <img className="bmap-art-hi" width={world.width} height={world.height} alt="" decoding="async" draggable={false} hidden />
      <CaveLoops />
      <svg className="bmap-svg" viewBox={`0 0 ${world.width} ${world.height}`} width={world.width} height={world.height} aria-hidden="true" focusable="false" overflow="visible">
        <defs>
          <radialGradient id="bmap-beam-glow"><stop offset="0" stopColor="#f3d68c" stopOpacity=".35" /><stop offset="1" stopColor="#f3d68c" stopOpacity="0" /></radialGradient>
        </defs>
        <WingMark className="bmap-mark bmap-mark-deck" {...TURNTABLE} />
        <circle cx={BEAM_TIP.x} cy={BEAM_TIP.y} r={BEAM_TIP.size * .9} fill="url(#bmap-beam-glow)" />
        <WingMark className="bmap-mark bmap-mark-sky" {...BEAM_TIP} />
        {world.zones.map(z => {
          const ch = name(z.id);
          return (
            <text key={z.id} className="bmap-label" data-zone={z.id} x={z.x} y={z.y - z.ry - 26} textAnchor="middle" fontFamily="'Bairam Text', sans-serif" fontSize={LABEL_SIZE} letterSpacing=".04em">
              {ch ? <><tspan className="bmap-label-n">{ch.n}</tspan>{`  ${ch.name}`}</> : 'The desk'}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

/* ---- Step 4: the loops on the painting, and the layers in front of it (data and maths in depth.ts). ---- */

const cable = CABLE.map(run => ({ run, ...cableKeyframes(run) }));
const FALL_FAST = fallTile(11, 26), FALL_SLOW = fallTile(29, 18);

// On the painting (inside the camera, in its pixels): the waterfall falls, the screens flicker, light runs along the cable.
function CaveLoops() {
  const clip = `polygon(${FALL.outline.map(([x, y]) => `${x}px ${y}px`).join(',')})`;
  return (
    <div className="bmap-fx">
      <style>{cable.map(c => c.css).join('')}</style>
      <div className="bmap-fall" style={{ left: FALL.x, top: FALL.y, width: FALL.w, height: FALL.h, clipPath: clip }}>
        <i className="bmap-loop bmap-fall-sheet" style={{ height: FALL.h + FALL_TILE, backgroundImage: FALL_FAST, ['--bmap-fall-t' as string]: '1.15s' }} />
        <i className="bmap-loop bmap-fall-sheet" style={{ height: FALL.h + FALL_TILE, backgroundImage: FALL_SLOW, ['--bmap-fall-t' as string]: '1.9s' }} />
      </div>
      <i className="bmap-loop bmap-mist" style={{ left: FALL.x - 60, top: FALL.y + FALL.h - 75, width: FALL.w + 120, height: 110 }} />
      {GLOWS.map((g, i) => (
        <i key={i} className="bmap-loop bmap-glow" data-cool={g.cool ? '' : undefined}
          style={{ left: g.x - g.rx, top: g.y - g.ry, width: g.rx * 2, height: g.ry * 2, animationDuration: `${g.t}s`, animationDelay: `${g.d}s` }} />
      ))}
      {cable.map(({ run }) => (
        <i key={run.id} className="bmap-loop bmap-spark" data-run={run.id}
          style={{ animationName: `bmap-cable-${run.id}`, animationDuration: `${CABLE_CYCLE}s`, animationDelay: `${run.at}s` }} />
      ))}
    </div>
  );
}

// Dust in front of each room (not the desk: the masthead covers it), drifting on its own slow clock.
const DUST = CAVE.zones.filter(z => z.id !== 'desk').map((z, i) => ({ id: z.id, box: { x: z.x - z.rx * 1.1, y: z.y - z.ry * 1.1, w: z.rx * 2.2, h: z.ry * 2.2 }, motes: dustCloud(z.rx * 1.1, z.ry * 1.1, z.rx * 1.05, z.ry * 1.05, 11, 101 + i * 37), t: 11 + (i % 3) * 2.7 }));

/* The layers in front of the painting: the engine moves them (layerTransform) at their own depth. Out-of-focus rock
   nearest, sliding past fastest; dust just in front of the rooms. */
export function CaveDepth({ nearRef, dustRef }: { nearRef: Ref<HTMLDivElement>; dustRef: Ref<HTMLDivElement> }) {
  return <>
    <div className="bmap-dust" ref={dustRef}>
      {DUST.map(d => (
        <svg key={d.id} className="bmap-loop bmap-dust-cloud" style={{ left: d.box.x, top: d.box.y, animationDuration: `${d.t}s` }} width={d.box.w} height={d.box.h} viewBox={`0 0 ${d.box.w} ${d.box.h}`} focusable="false">
          {d.motes.map((m, j) => <circle key={j} cx={m.x.toFixed(1)} cy={m.y.toFixed(1)} r={m.r.toFixed(1)} fill="url(#bmap-mote)" opacity={m.o.toFixed(2)} />)}
        </svg>
      ))}
      <svg width="0" height="0" focusable="false" style={{ position: 'absolute' }}><defs><radialGradient id="bmap-mote"><stop offset="0" stopColor="#ffe9bf" /><stop offset=".45" stopColor="#f3d08a" stopOpacity=".7" /><stop offset="1" stopColor="#f3d08a" stopOpacity="0" /></radialGradient></defs></svg>
    </div>
    <div className="bmap-near" ref={nearRef}>
      {ROCKS.map((r, i) => {
        const w = (r.rx + ROCK_PAD) * 2, h = (r.ry + ROCK_PAD) * 2;
        return <i key={i} className="bmap-rock" data-up={r.up ? '' : undefined} style={{ left: r.x - w / 2, top: r.y - h / 2, width: w, height: h, backgroundImage: `url(${rockSprite(i)})` }} />;
      })}
    </div>
  </>;
}
