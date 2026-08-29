export type RoleGuide = {
  slug: string;
  title: string;
  audience: string;
  summary: string;
  outcomes: string[];
  prompts: string[];
};

export type CommunityExample = {
  title: string;
  byline: string;
  summary: string;
  tag: string;
  href: string;
};

export const simpleLearningCards = [
  {
    title: "Understand",
    summary:
      "Learn what AI does well, where it fails, and how to ask for useful help without sounding technical.",
  },
  {
    title: "Use",
    summary:
      "Turn AI into a day-to-day teammate for notes, writing, planning, research, and quick decisions.",
  },
  {
    title: "Apply",
    summary:
      "Shape AI around your role so the outputs fit the work you already do instead of forcing a new workflow.",
  },
];

export const roleGuides: RoleGuide[] = [
  {
    slug: "managers",
    title: "Managers and team leads",
    audience: "People leading meetings, priorities, feedback, and follow-through.",
    summary:
      "Use AI to prepare one-to-ones, summarize context, draft updates, and turn messy notes into clearer direction.",
    outcomes: [
      "Prepare cleaner 1:1 agendas",
      "Draft feedback with better tone",
      "Turn meetings into action",
    ],
    prompts: [
      "Turn these notes into a clear manager update.",
      "Rewrite this feedback so it is direct, kind, and specific.",
      "Summarize these meeting notes into next actions.",
    ],
  },
  {
    slug: "operations",
    title: "Operations and project teams",
    audience: "People turning moving parts into repeatable systems and checklists.",
    summary:
      "Use AI to create workflows, capture SOPs, and keep projects moving with less friction.",
    outcomes: [
      "Build reusable checklists",
      "Standardize workflows",
      "Cut down recurring admin",
    ],
    prompts: [
      "Convert this process into a simple step-by-step SOP.",
      "Create a checklist for this weekly workflow.",
      "Find the missing steps in this process and tighten it up.",
    ],
  },
  {
    slug: "analysts",
    title: "Analysts and strategy teams",
    audience: "People comparing options, summarizing research, and helping decisions land.",
    summary:
      "Use AI to structure research, compare scenarios, and produce clearer memos and recommendations.",
    outcomes: [
      "Summarize research quickly",
      "Compare options with context",
      "Write better decision memos",
    ],
    prompts: [
      "Summarize this research into 3 useful insights.",
      "Compare these options by risk, effort, and impact.",
      "Turn this rough thinking into a decision memo.",
    ],
  },
  {
    slug: "client-teams",
    title: "Client-facing teams",
    audience: "Sales, customer success, consulting, and anyone writing for people outside the company.",
    summary:
      "Use AI to write better outreach, sharper follow-ups, and client-ready explanations that sound human.",
    outcomes: [
      "Write stronger outreach",
      "Prepare client-ready follow-ups",
      "Make explanations easier to understand",
    ],
    prompts: [
      "Rewrite this email so it feels clear and confident.",
      "Turn these bullet points into a client-ready update.",
      "Give me three ways to explain this simply.",
    ],
  },
];

export const communityExamples: CommunityExample[] = [
  {
    title: "From meeting notes to a shared action plan",
    byline: "Featured example",
    summary:
      "A simple before-and-after showing how a rough conversation can become a clear working plan.",
    tag: "workflows",
    href: "#contact",
  },
  {
    title: "A role-based prompt kit for a sales team",
    byline: "Featured example",
    summary:
      "A collection of prompts and checks that make outreach, prep, and follow-up easier to reuse.",
    tag: "teams",
    href: "#contact",
  },
  {
    title: "An AI learning note turned into a reusable playbook",
    byline: "Featured example",
    summary:
      "A compact example of how one useful idea can become a guide others can actually use.",
    tag: "guides",
    href: "#contact",
  },
];

export function getRoleGuide(slug: string) {
  return roleGuides.find((guide) => guide.slug === slug) ?? null;
}
