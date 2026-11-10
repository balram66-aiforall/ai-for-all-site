/* The live map's data, server side: the laid-out points and threads (data/map.json, from scripts/second-brain-os-map.mjs)
   joined with each page's own title and summary. Only what the map shows is passed to the browser. */
import layout from './data/map.json';
import { WING, credit, library, placeOf } from './library';

export type Shelf = 'course' | 'handbooks' | 'second-brain' | 'resources' | 'start';
export type MapNode = { url: string; title: string; summary: string; shelf: Shelf; place: string; r: number; index: boolean };
// The brain each layout is drawn as (scripts/second-brain-os-map.mjs): outline parts, the main sulci, the folds, the cerebellum's ridges.
export type Brain = { shells: { part: 'cerebrum' | 'hemisphere' | 'cerebellum' | 'stem'; d: string }[]; sulci: string; folds: string; folia: string };
export type MapLayout = { w: number; h: number; points: [number, number][]; boxes: Record<string, [number, number, number, number]>;
  labels: Record<string, [number, number, 'start' | 'middle' | 'end']>; brain: Brain };
export type MapData = { nodes: MapNode[]; edges: [number, number][]; wide: MapLayout; tall: MapLayout; shelves: { id: Shelf; title: string }[] };

const raw = layout as unknown as { nodes: { url: string; shelf: Shelf; r: number; index: boolean }[]; edges: [number, number][]; wide: MapLayout; tall: MapLayout };

// Where a page sits, in the source's own words: its section (or shelf, when the shelf has one section).
function placeName(url: string) {
  const at = placeOf(url);
  if (!at) return credit.title;
  return at.group.sections.length > 1 ? `${at.group.title} · ${at.section.title}` : at.group.title;
}

export const mapData: MapData = {
  nodes: raw.nodes.map(n => { const p = library.pages[n.url]; return { url: n.url, shelf: n.shelf, r: n.r, index: n.index, title: p.title, summary: p.summary, place: n.url === `${WING}/roadmap` ? library.groups.find(g => g.id === 'second-brain')!.title : placeName(n.url) }; }),
  edges: raw.edges, wide: raw.wide, tall: raw.tall,
  shelves: library.groups.map(g => ({ id: g.id as Shelf, title: g.title })),
};

// The pages a page links to or is linked from (the map's threads), in reading order.
export function connected(url: string) {
  const i = mapData.nodes.findIndex(n => n.url === url);
  if (i < 0) return [];
  const near = mapData.edges.flatMap(([a, b]) => (a === i ? [b] : b === i ? [a] : []));
  return [...new Set(near)].sort((a, b) => a - b).map(j => mapData.nodes[j]);
}
