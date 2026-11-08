/* The learning path on the Second Brain OS wing (Balram, Nov 8: "we should give people a learning path. from human to
   superhuman ... like super hero transformation"). Five stages, from human to superhuman (Balram, Nov 8: "lets not say becoming bAIram"), each made of the author's own
   sections (course modules and second-brain chapters, read in this order); the handbooks are optional deep dives on the
   stage they belong to. Our own bat mark only, never the DC emblem or the Batman name.
   DRAFT words (stage names, lines, "Go deeper", the heading): proposed for Balram to edit. The lede is his own line. */
import { library, type Section } from './library';

type StageSpec = { id: string; name: string; line: string; sections: string[]; deeper: string[] };

export const PATH = {
  eyebrow: 'The path · 5 stages',
  title: 'From human to superhuman',
  // His own words, from the AI-suit vault on the home page.
  lede: 'I suit up for the mission in front of me, and I show you how to wear yours.',
  stages: [
    { id: 'human', name: 'Human', line: 'Learn what is under the hood: what an agent is, and what the model sees.', sections: ['course-0-map', 'course-1-context'], deeper: [] },
    { id: 'suited', name: 'Suited', line: 'Build your first AI-suit: a second brain your agent keeps for you.', sections: ['01-concepts', '02-setup', '03-ingestion'], deeper: [] },
    { id: 'powered', name: 'Powered', line: 'Let it move on its own: loops, gates, graphs and agents.', sections: ['course-2-loop', 'course-3-gate', '04-structuring', '05-graphs', '06-agents'], deeper: ['track-loop', 'track-jev', 'track-graph'] },
    { id: 'armoured', name: 'Armoured', line: 'Make it hold under pressure: the harness, evals, and fixes for when it breaks.', sections: ['course-4-harness', 'course-5-evals', '07-retrieval', '09-maintenance', '10-troubleshooting'], deeper: ['track-harness', 'track-evals'] },
    { id: 'superhuman', name: 'Superhuman', line: 'Ship it and put it to work, with the tools I would reach for.', sections: ['course-6-production', '08-outputs', 'resources'], deeper: [] },
  ] satisfies StageSpec[],
};

export type PathSection = { id: string; title: string; url: string; pages: string[] };
export type Stage = { id: string; n: number; name: string; line: string; sections: PathSection[]; deeper: PathSection[]; pages: string[] };

const sections = new Map<string, Section>(library.groups.flatMap(g => g.sections.map(s => [s.id, s] as const)));
const take = (id: string): PathSection => {
  const s = sections.get(id);
  if (!s) throw new Error(`learning path: no section ${id}`);
  return { id: s.id, title: s.title, url: s.url, pages: s.pages };
};

// The stages with their sections resolved; a stage's pages are its sections' pages in order (the deep dives are extra).
export const learningPath: Stage[] = PATH.stages.map((st, i) => {
  const own = st.sections.map(take);
  return { id: st.id, n: i + 1, name: st.name, line: st.line, sections: own, deeper: st.deeper.map(take), pages: own.flatMap(s => s.pages) };
});

export const titleOf = (url: string) => library.pages[url]?.title ?? '';
