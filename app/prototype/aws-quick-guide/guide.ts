/* AWS Quick on desktop, the complete guide (/guides/aws-quick-desktop): a hub and eight chapters, in the cave's reading style.
   Shipped in parts (Balram, Nov 16: "Ship the 3 pages first, build it"): the hub, chapter 3 and chapter 4 first. A chapter
   without a page in data/guide.json shows in the rail and the chapter list as "Coming soon", never as a link.
   The words come from content/aws-quick-desktop/*.md through scripts/build-aws-quick-guide.mjs; edit the markdown, not this data. */
import data from './data/guide.json' with { type: 'json' };

export const HUB = '/guides/aws-quick-desktop';
export const NAME = 'AWS Quick on desktop';
export const DISCLOSURE = 'I work at Amazon; this is my own experience, not official guidance.';
export const AUTHOR = 'Balram R.';

export type GuidePage = {
  slug: string; chapter: number; short: string; title: string; description: string; heading: string;
  published: string; modified: string; html: string; toc: { id: string; text: string }[]; faqs: { question: string; answer: string }[]; words: number;
};

// The eight chapters in reading order, as planned (Nov 16). blurb = one line for the hub's chapter list.
export const CHAPTERS = [
  { n: 1, slug: 'install-and-sign-in', title: 'Install and sign in', blurb: 'Requirements, first-launch prompts, the three ways to sign in and first-run setup.' },
  { n: 2, slug: 'chat-spaces-library-apps', title: 'Chat, Spaces, Library and Apps', blurb: 'Modes, slash commands, plan mode, deep research, Incognito, session tabs and Spaces.' },
  { n: 3, slug: 'agents-routines-mission-control', title: 'Agents, routines and Mission Control', blurb: 'Build a meeting-prep agent and a channel digest, schedule them and run them from Mission Control.' },
  { n: 4, slug: 'skills', title: 'Skills', blurb: 'How skills load, a weekly status skill to copy, and how publishing and sharing work.' },
  { n: 5, slug: 'connectors-mcp-coding-agents', title: 'Connectors, MCP and coding agents', blurb: 'Cloud and local connectors, tool permissions, MCP setup, Kiro and Claude Code.' },
  { n: 6, slug: 'memory-knowledge-graph-privacy', title: 'Memory, knowledge graph and privacy', blurb: 'What it remembers, what each folder switch uploads, and how to reset.' },
  { n: 7, slug: 'rolling-it-out-at-work', title: 'Rolling it out at work', blurb: 'Desktop access, identity providers, managed deployment, MDM, network checks and security.' },
  { n: 8, slug: 'troubleshooting-and-limits', title: 'Troubleshooting and limits', blurb: 'Fixes for the common problems and the full limits table.' },
] as const;

export const pages = data.pages as GuidePage[];
export const hub = pages.find(p => p.chapter === 0)!;
export const chapterPage = (slug: string) => pages.find(p => p.chapter > 0 && p.slug === slug);
export const urlOf = (p: { slug: string }) => (p.slug ? `${HUB}/${p.slug}` : HUB);
export const isLive = (slug: string) => Boolean(chapterPage(slug));

// The reading order of the pages that exist: the hub, then the live chapters by number.
export const order = () => [hub, ...CHAPTERS.map(c => chapterPage(c.slug)).filter((p): p is GuidePage => Boolean(p))];
export function neighbours(p: GuidePage) {
  const o = order(); const i = o.indexOf(p);
  return { prev: i > 0 ? o[i - 1] : undefined, next: i >= 0 && i < o.length - 1 ? o[i + 1] : undefined };
}
export const labelOf = (p: GuidePage) => (p.chapter ? `Chapter ${p.chapter}: ${p.short}` : p.short);
// "16 November 2026" from 2026-11-16, without the visitor's time zone moving the day.
export const longDate = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
