/* Connected pages, at the end of every reading page: the pages it links to or is linked from (the live map's threads),
   as a small map with this page at the centre and as a list. The list carries the links; the small map is a picture of it. */
import { connected } from './map-data';
import type { Page } from './library';

export function Connected({ page }: { page: Page }) {
  const near = connected(page.url);
  if (!near.length) return null;
  const W = 280, H = 248, cx = W / 2, cy = H / 2, two = near.length > 12;
  const at = (k: number) => {
    const a = (k / near.length) * Math.PI * 2 - Math.PI / 2, R = two ? (k % 2 ? 76 : 108) : 96;
    return [cx + Math.cos(a) * R * 1.12, cy + Math.sin(a) * R * 0.98].map(v => +v.toFixed(1));
  };
  return <section className="sb-near" aria-labelledby="sb-near-title">
    <h2 id="sb-near-title">Connected pages</h2>
    <div className="sb-near-body">
      <svg className="sb-near-map" viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
        {near.map((n, k) => { const [x, y] = at(k); return <line key={n.url} x1={cx} y1={cy} x2={x} y2={y} />; })}
        {near.map((n, k) => { const [x, y] = at(k); return <circle key={n.url} cx={x} cy={y} r={two ? 5 : 6.5} data-shelf={n.shelf} data-sb-url={n.url} data-near-dot={k} />; })}
        <circle className="sb-near-here" cx={cx} cy={cy} r={11} />
      </svg>
      <ul className="sb-near-list">
        {near.map((n, k) => <li key={n.url}><a href={n.url} data-shelf={n.shelf} data-sb-url={n.url} data-near={k}>
          <span className="sb-near-place">{n.place}</span><span className="sb-near-title">{n.title}</span>
        </a></li>)}
      </ul>
    </div>
  </section>;
}
