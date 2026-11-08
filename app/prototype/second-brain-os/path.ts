/* The learning path on the Second Brain OS wing (Balram, Nov 8: "we should give people a learning path. from human to
   superhuman ... like super hero transformation"). Five stages, from human to superhuman (Balram, Nov 8: "lets not say becoming bAIram"), each made of the author's own
   sections (course modules and second-brain chapters, read in this order); the handbooks are optional deep dives on the
   stage they belong to. Our own bat mark only, never the DC emblem or the Batman name.
   Stage words approved by Balram (Nov 8, "rest is good"). The lede is his own line.
   Missions (Nov 8, "build missions and times"): one hands-on build per stage from the author's own build pages; the mission
   names are DRAFTS for Balram, the line under each is the author's own opening. Times come from the pages' word counts. */
import { WING, library, type Section } from './library';

type StageSpec = { id: string; name: string; line: string; sections: string[]; deeper: string[]; mission: { name: string; pages: string[] } };

export const PATH = {
  eyebrow: 'The path · 5 stages',
  title: 'From human to superhuman',
  // His own words, from the AI-suit vault on the home page.
  lede: 'I suit up for the mission in front of me, and I show you how to wear yours.',
  stages: [
    { id: 'human', name: 'Human', line: 'Learn what is under the hood: what an agent is, and what the model sees.', sections: ['course-0-map', 'course-1-context'], deeper: [],
      mission: { name: 'Audit an agent\u2019s context', pages: ['course-1-context/context-practice'] } },
    { id: 'suited', name: 'Suited', line: 'Build your first AI-suit: a second brain your agent keeps for you.', sections: ['01-concepts', '02-setup', '03-ingestion'], deeper: [],
      mission: { name: 'Set up your vault in one evening', pages: ['02-setup'] } },
    { id: 'powered', name: 'Powered', line: 'Let it move on its own: loops, gates, graphs and agents.', sections: ['course-2-loop', 'course-3-gate', '04-structuring', '05-graphs', '06-agents'], deeper: ['track-loop', 'track-jev', 'track-graph'],
      mission: { name: 'Build a loop you can trust overnight', pages: ['track-loop/build-goal-test', 'track-loop/build-critic', 'track-loop/build-overnight'] } },
    { id: 'armoured', name: 'Armoured', line: 'Make it hold under pressure: the harness, evals, and fixes for when it breaks.', sections: ['course-4-harness', 'course-5-evals', '07-retrieval', '09-maintenance', '10-troubleshooting'], deeper: ['track-harness', 'track-evals'],
      mission: { name: 'Build your first eval suite', pages: ['course-5-evals/evals-practice'] } },
    { id: 'superhuman', name: 'Superhuman', line: 'Ship it and put it to work, with the tools I would reach for.', sections: ['course-6-production', '08-outputs', 'resources'], deeper: [],
      mission: { name: 'Run the day-one plan', pages: ['course-6-production/day-one-plan'] } },
  ] satisfies StageSpec[],
};

export type PathSection = { id: string; title: string; url: string; pages: string[] };
export type Mission = { name: string; pages: string[]; text: string; words: number };
export type Stage = { id: string; n: number; name: string; line: string; sections: PathSection[]; deeper: PathSection[]; pages: string[]; mission: Mission };

const sections = new Map<string, Section>(library.groups.flatMap(g => g.sections.map(s => [s.id, s] as const)));
const take = (id: string): PathSection => {
  const s = sections.get(id);
  if (!s) throw new Error(`learning path: no section ${id}`);
  return { id: s.id, title: s.title, url: s.url, pages: s.pages };
};

// The stages with their sections resolved; a stage's pages are its sections' pages in order (the deep dives are extra).
export const learningPath: Stage[] = PATH.stages.map((st, i) => {
  const own = st.sections.map(take);
  const pages = st.mission.pages.map(slug => { const url = `${WING}/${slug}`; if (!library.pages[url]) throw new Error(`learning path: no page ${slug}`); return url; });
  // A mission's length: its pages, and when one is a section's index, every page in that section.
  const reads = [...new Set(pages.flatMap(u => [...sections.values()].find(x => x.url === u)?.pages ?? [u]))];
  const mission = { name: st.mission.name, pages, text: opening(library.pages[pages[0]].summary), words: reads.reduce((k, u) => k + library.pages[u].words, 0) };
  return { id: st.id, n: i + 1, name: st.name, line: st.line, sections: own, deeper: st.deeper.map(take), pages: own.flatMap(s => s.pages), mission };
});

// The author's opening, whole sentences only, long enough to say what the build is.
function opening(summary: string) {
  const parts = summary.match(/[^.!?]+[.!?]+(\s|$)/g) ?? [summary];
  let out = '';
  for (const p of parts) { if (out.length >= 70) break; out += p; }
  return out.trim();
}

// Reading time: 200 words a minute (technical text, with code), rounded up to 5 minutes.
export const WPM = 200;
export const minutesOf = (words: number) => Math.max(5, Math.ceil(words / WPM / 5) * 5);
export const timeOf = (minutes: number) => minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)} hr${minutes % 60 ? ` ${minutes % 60} min` : ''}`;

// What the browser needs about each page on the path (and in its missions): its title and its length.
export const pathInfo: Record<string, { title: string; words: number }> = Object.fromEntries(
  [...new Set(learningPath.flatMap(st => [...st.pages, ...st.mission.pages]))].map(u => [u, { title: library.pages[u].title, words: library.pages[u].words }]));
