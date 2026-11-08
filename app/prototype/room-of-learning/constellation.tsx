/* A small constellation of Second Brain OS for its card in the room: the wing's own map (every page a point, every link
   between two pages a thread), drawn on the server from data/map.json. Decorative: the card's words and links carry the
   meaning. A few points twinkle; they stay still for reduced motion. */
import layout from '../second-brain-os/data/map.json';

const { w, h } = layout.wide, points = layout.wide.points as number[][];
const nodes = layout.nodes as { shelf: string; r: number }[];
const edges = layout.edges as number[][];
const at = (n: number) => Math.round(n);

export function Constellation() {
  return <svg className="bl-sky" viewBox={`0 0 ${w} ${h}`} aria-hidden="true" focusable="false">
    <g className="bl-sky-threads">{edges.map(([a, b], k) => <line key={k} x1={at(points[a][0])} y1={at(points[a][1])} x2={at(points[b][0])} y2={at(points[b][1])} />)}</g>
    <g className="bl-sky-points">{nodes.map((n, i) => <circle key={i} data-shelf={n.shelf} className={i % 9 === 4 ? 'is-twinkle' : undefined}
      style={i % 9 === 4 ? { animationDelay: `${(i * 0.37) % 6}s` } : undefined} cx={at(points[i][0])} cy={at(points[i][1])} r={Math.max(2.4, n.r * 0.7).toFixed(1)} />)}</g>
  </svg>;
}
