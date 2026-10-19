/* Balram's live home-page copy (app/page.tsx), copied word for word, except the lines marked APPROVED below.
   tests/journey-checks.mjs fails if any line drifts from the source or from the approved text. */
export const tips = [
  'Start with the outcome you need, not the prompt you want to write.',
  'Show AI examples of good work. It learns taste faster than adjectives.',
  'Ask for options first, then have it pressure-test the safest answer.',
  'Keep a swipe file of prompts, bad outputs, and the fixes that worked.',
];

export const trainingLanes = [
  ['Foundations', 'Make AI understandable for beginners, non-technical teams, and anyone who wants confidence before tools.', 'Start here'],
  ['Tools', 'Teach people how to use AI assistants, product features, and everyday work tools with clear judgment.', 'Hands-on'],
  ['Workflows', 'Turn scattered prompting into repeatable systems for research, writing, planning, review, and output.', 'Practice'],
  ['Agents', 'Help teams understand agentic work, context, skills, MCPs, and when AI should move work forward.', 'Next wave'],
] as const;

export const trainingSignals = [
  '50,000+ people trained', // APPROVED Oct 19: Balram, "35,000 - this has gone up to 50,000"
  'AI For All initiative',
  'Generative AI workshops',
  'Tool walkthroughs',
  'Plain-language teaching',
  'Prompting with context',
  'Role-specific learning',
];

export const aiProjects = [
  /* Added Oct 19 (Balram: "https://html-harbor-ai.lovable.app/ - add this to my builds. remove pinky promise"). Type and
     summary are the app's own words (its badge and hero line). */
  {
    title: 'HTML Harbor',
    type: 'privacy-first HTML publishing',
    summary: 'Turn your HTML into a shareable website in seconds. Upload a file, choose your URL, and decide exactly who gets access.',
    href: 'https://html-harbor-ai.lovable.app/',
    image: '/assets/projects/html-harbor-1000.webp',
    smallImage: '/assets/projects/html-harbor-640.webp',
    width: 1123,
    height: 1403,
    action: 'Open project',
  },
  {
    title: 'Gulpy',
    type: 'daily hydration companion',
    summary: 'An intelligent, friendly hydration companion with personalized goals, AI-powered health insights, smart reminders, and Google Drive cloud sync.',
    href: 'https://github.com/balram66-aiforall/Gulpy',
    image: '/assets/projects/gulpy-1000.webp',
    smallImage: '/assets/projects/gulpy-640.webp',
    width: 1122,
    height: 1402,
    action: 'View GitHub',
  },
  {
    title: 'Keats',
    type: 'mindful communication companion',
    summary: 'A conversation companion inspired by John Keats and Negative Capability, built to move people beyond autopilot small talk into curiosity and wonder.',
    href: 'https://github.com/balram66-aiforall/Keats',
    image: '/assets/projects/keats-1000.webp',
    smallImage: '/assets/projects/keats-640.webp',
    width: 1122,
    height: 1402,
    action: 'View GitHub',
  },
];

/* Oct 19 (Balram): Understand lands on AWS Skill Builder's fundamentals course, prompting uses his CROFTC page, and role
   guides are "not ready - mention as coming soon" (empty href = coming soon, no link). */
export const learningLinks = [
  ['https://skillbuilder.aws/learn/16ASDUHF86/fundamentals-of-machine-learning-and-artificial-intelligence/M7JZCTA94N', 'Learn the fundamentals'],
  ['https://html-harbor-ai.lovable.app/p/croftc', 'Build a better prompt'],
  ['', 'Find a role guide'],
] as const;


/* APPROVED Oct 19 (Balram: "the best video to start with - <video>. the courses - <Skilljar>. lets add this"): where to start, under
   Learn AI simply. label = his words; title and by = the video's and the course site's own names. */
export const startHere = [
  { kind: 'video', label: 'The best video to start with', title: 'How I use LLMs', by: 'Andrej Karpathy', action: 'Watch on YouTube',
    href: 'https://www.youtube.com/watch?v=EWvNQjAaOHw&list=PLIzgOGKqOza351djBd3bE7XY68Ky5HHsJ' },
  { kind: 'course', label: 'The courses', title: 'Anthropic Courses', by: 'Anthropic', action: 'Open the courses', href: 'https://anthropic.skilljar.com/' },
] as const;

/* APPROVED Oct 19 (Balram: "Approved, replace the old chips"): the who-I-am block in the cave mouth. Generic on purpose: no
   internal program, team, tool or channel names. Replaces the live chips 'AI learning leader', 'Role-based guides',
   'Community examples', 'Human judgment first'. */
export const about = {
  lead: "I'm Balram, AI Marketing Lead at Amazon. Every role can work better with AI, and I help people find out how: I teach it in plain language, build with it every day, and match the right AI to the job. More than 50,000 people have learned AI through my sessions, and AI For All is where I share what works.",
  suit: 'Every AI and every workflow is an AI-suit: one for research, one for writing, one for building, one for clearing the busywork. I suit up for the mission in front of me, and I show you how to wear yours.',
  doing: [
    ['Teach AI.', 'Workshops, masterclasses and hands-on sessions that take anyone from a first prompt to confident everyday use.'],
    ['Fit AI to any role.', 'Marketing, sales, operations, engineering, HR or finance: workflows built around the work you actually do.'],
    ['Build with AI.', 'Agents, apps and tools that turn an idea into something people use.'],
    ['Grow communities.', 'Bring people together to learn, share and ship AI work.'],
  ],
  mastery: ['Generative AI training', 'Prompt engineering', 'Agentic AI and automation', 'AI for every role', 'Building AI products', 'Community building'],
} as const;

/* The six chambers below the masthead, in scroll order. id = the chamber's anchor; the masthead's Learn/Work/About links reuse the live ids. */
// Order Oct 19 (Balram: "move the mission room to 1, and the proving wall 2, then suit vault, then learning deck, 5 - builds").
export const chapters = [
  { id: 'training', n: '01', name: 'The mission room' },
  { id: 'proving-wall', n: '02', name: 'The proving wall' },
  { id: 'ai-suits', n: '03', name: 'The AI-suit vault' },
  { id: 'learn', n: '04', name: 'The learning deck' },
  { id: 'projects', n: '05', name: 'The workshop' },
  { id: 'about', n: '06', name: 'The cave mouth' },
] as const;

/* APPROVED Oct 19 (Balram: "The bAIram signal - works", headline "go with A", "dont say any years", button "just Send the
   signal", the same WhatsApp link as Contact; generic speaking, nothing about his employer). */
export const signal = {
  kicker: 'The bAIram signal',
  title: "Light the signal. I'll bring the AI-suit.",
  lead: 'Keynotes, masterclasses, hands-on workshops and mentoring for teams, communities, colleges and anyone starting out with AI. In person or online, wherever the signal goes up.',
  topicsLabel: 'Topics I speak on',
  topics: [
    'Generative AI for everyone: from a first prompt to everyday use',
    'Prompt engineering: briefs that AI can actually follow',
    'Agentic AI and automation: agents that clear the busywork',
    'AI for every role: marketing, sales, operations, HR, finance and more',
    'Building AI products: from an idea to something people use',
    'Growing AI communities: learning together, shipping together',
  ],
  action: 'Send the signal',
  href: 'https://wa.me/qr/3EZXUASKEW5RM1',
} as const;
