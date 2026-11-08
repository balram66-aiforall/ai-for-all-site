/* Second Brain OS, synced into the bAI room of learning (scripts/sync-second-brain-os.mjs writes data/library.json).
   Server-side only: the pages render from this at build time, so visitors never download the library itself. */
import data from './data/library.json';

export type TocItem = { id: string; text: string; depth: number };
export type Page = { source: string; slug: string[]; url: string; github: string; title: string; summary: string; html: string; toc: TocItem[]; words: number };
export type Section = { id: string; title: string; summary: string; url: string; pages: string[] };
export type Group = { id: string; title: string; summary: string; sections: Section[] };
type Library = { source: { repo: string; site: string; author: string; license: string; commit: string; date: string | null; synced: string }; groups: Group[]; order: string[]; pages: Record<string, Page> };

export const library = data as Library;
export const WING = '/bai-room-of-learning/second-brain-os';
export const credit = { title: 'Second Brain OS', by: library.source.author, license: `${library.source.license} license`, licenseUrl: `${WING}/license` };

// View source: the file at the synced commit, so it shows exactly the text on this page (the canonical stays the living file).
export const sourceAt = (github: string) => github.replace('/blob/main/', `/blob/${library.source.commit}/`);

export const pageAt = (slug: string[]) => library.pages[`${WING}/${slug.join('/')}`];
export const allSlugs = () => library.order.map(url => library.pages[url].slug);

// Where a page sits: its shelf (group) and section, if any (the overview, guides, roadmap and license stand alone).
export function placeOf(url: string) {
  for (const group of library.groups) for (const section of group.sections) if (section.pages.includes(url)) return { group, section };
  return null;
}
export function neighbours(url: string) {
  const i = library.order.indexOf(url);
  return { prev: i > 0 ? library.pages[library.order[i - 1]] : null, next: i < library.order.length - 1 ? library.pages[library.order[i + 1]] : null };
}
export const count = (urls: string[]) => urls.length;
export const totals = () => ({
  pages: library.order.length,
  words: Object.values(library.pages).reduce((n, p) => n + p.words, 0),
});
