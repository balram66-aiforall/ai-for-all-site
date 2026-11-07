export type GuideFaq = { question: string; answer: string };
type Example = { label: string; text: string; buttonLabel?: string };
type PillarGuide = {
  slug: string;
  name: string;
  heading: string;
  title: string;
  description: string;
  audience: string;
  outcomes: string[];
  sections: { title: string; paragraphs: string[]; examples?: Example[] }[];
  faqs: GuideFaq[];
  sources: { label: string; href: string }[];
};

export const pillarGuides: PillarGuide[] = [
  {
    slug: "kiro-workflows",
    name: "Kiro specs, hooks and steering",
    heading: "The Practical Guide to Kiro: Specs, Agent Hooks, and Steering Files",
    title: "The Practical Guide to Kiro: Specs, Agent Hooks & Steering Files | Balram R.",
    description: "Learn how to move from vibe coding to spec-driven development in Kiro. Includes copyable steering files, EARS requirements, and agent hooks.",
    audience: "Builders who can describe a feature and want a better way to check what gets shipped.",
    outcomes: ["Turn one feature into testable requirements", "Give Kiro reusable project context", "Run a small check at the right moment"],
    sections: [
      {
        title: "Turn a chat request into a spec",
        paragraphs: [
          "Imagine you maintain a workshop signup page. A teammate asks for CSV export. In chat, it is tempting to say “add a download button” and judge the first screen you see. The hard questions surface later: who can export, what happens with an empty list, and which columns are allowed? Use a feature spec to settle those questions while the change is cheap to revise.",
          "In Kiro IDE, start a requirements-first feature spec for workshop export. Describe the user, the problem, and what is out of scope. Review requirements.md with the person who owns the workflow. EARS, short for Easy Approach to Requirements Syntax, makes a requirement easier to test by pairing a trigger or condition with a specific response. For example: “When an authorised organiser requests an export, the system shall return a CSV containing workshop title and signup count.” Write another rule for someone who lacks access.",
          "Read design.md before implementation. Find where permissions are enforced, how empty results are handled, and whether the existing export utility can be reused. Then review tasks.md: start with the data contract and tests, wire the interface next, and finish with a realistic run using sample data. Ask Kiro to implement one task at a time when you want a small reviewable diff. A completed checkbox is useful only when you can point to the test or observation that backs it up.",
        ],
      },
      {
        title: "Give Kiro the project rules once",
        paragraphs: [
          "Steering is repository context that survives the chat window. Start with the three foundation files under .kiro/steering/. Keep product.md about users and boundaries, tech.md about the tools and commands the repo actually uses, and structure.md about where changes belong. These examples are for the fictional signup site; replace the stack, paths, and commands with ones you verified in your own repo.",
          "Review steering in a normal code review. A stale instruction to put exports in an old folder can misdirect every future change. Keep rules short enough that a teammate can check them, and leave credentials, production identifiers, and private customer information out of all three files.",
        ],
        examples: [
          { label: "product.md", buttonLabel: "Copy file", text: "# Workshop signup\n\nOrganisers need a weekly view of signup counts.\nExport aggregate counts only. Attendee contact details are out of scope.\nOnly authorised organisers may download an export." },
          { label: "tech.md", buttonLabel: "Copy file", text: "# Technology\n\nUse the existing TypeScript stack and CSV utility.\nUse npm run lint and npm test after changing exports.\nAdd no dependencies without explaining why the current tools cannot do the job." },
          { label: "structure.md", buttonLabel: "Copy file", text: "# Repository structure\n\nKeep export helpers in src/exports and tests in tests/exports.\nKeep permission checks at the server boundary.\nUse synthetic fixtures for export tests." },
        ],
      },
      {
        title: "Use Agent Hooks for a repeatable check",
        paragraphs: [
          "A hook pairs a trigger with an action. Begin with a manual hook for the export workflow. Configure it to run the repository’s lint and unit-test commands where those scripts exist, or ask the agent to run them and report failures. Verify it once on a branch before tying it to a file event. The first success is seeing a real failure reported clearly, not seeing a green badge on an already clean branch.",
          "For doc sync, scope a hook to the relevant export files and ask for a comparison against the public export docs. Have it report mismatches first. A hook that writes to a file watched by the same hook can cause repeated runs. Avoid automatic edits or publishes until the trigger is narrow and the expected result is clear. Leave full test runs to your normal CI if triggering them after every save gets in the way.",
        ],
      },
      {
        title: "Choose spec-driven development or chat",
        paragraphs: [
          "Use chat when a change is small, easy to reverse, and quick to inspect: a label, a layout experiment, or a question about where a function lives. The conversation is fast, but its decisions can be hard to recover later. A spec takes more preparation and gives you artefacts to share. Use it when behaviour spans permissions, data, and UI, or when several people will review the work.",
          "A useful middle ground is to explore the problem in chat, then record the settled decisions in a spec before building. If the export grows to include more columns, revise the requirements and tests first. Keeping those files current is what makes the next review easier.",
        ],
      },
    ],
    faqs: [
      { question: "Do I need a spec for every Kiro change?", answer: "No. Use chat for quick, reversible changes. A spec pays off when you have several acceptance criteria, reviewers, or dependencies to keep aligned." },
      { question: "What belongs in steering instead of a spec?", answer: "Put stable project conventions in steering, such as test commands and folder boundaries. Put the requirements and design for one feature in its spec." },
      { question: "Can hooks replace CI?", answer: "Use hooks for fast checks during development. Keep required checks in CI so every contribution is verified regardless of how it was edited." },
    ],
    sources: [
      { label: "Kiro feature specs", href: "https://kiro.dev/docs/specs/feature-specs/" },
      { label: "Kiro steering", href: "https://kiro.dev/docs/steering/" },
      { label: "Kiro Agent Hooks", href: "https://kiro.dev/docs/hooks/" },
    ],
  },
  {
    slug: "amazon-quick",
    name: "Amazon Quick and Quick Flows",
    heading: "Amazon Quick & Quick Suite Flows: Automating Everyday Business Workflows",
    title: "Amazon Quick & Quick Suite Flows: Automating Business Workflows | Balram R.",
    description: "A practical guide for operations and business teams to automate recurring tasks, reporting, and multi-step processes using Amazon Quick and Quick Flows.",
    audience: "Operations and business teams who repeat the same reporting or preparation task every week.",
    outcomes: ["Describe a workflow with explicit inputs and outputs", "Run a draft with safe sample data", "Schedule it with a clear human review step"],
    sections: [
      {
        title: "Pick the part of the job worth repeating",
        paragraphs: [
          "Amazon Quick brings together AI assistance and connected business information. A Quick Flow gives recurring work a defined sequence: collect inputs, read approved sources, produce a draft, and take an action when one is configured. A process owner can describe or arrange those steps in the Flow builder. A technical teammate can help confirm the data source, its access rules, and what a failed run looks like. You can start with a file and no connected write action.",
          "Use a small weekly exception brief for your first flow. Each Friday, an operations lead reads an export of open requests, identifies overdue items, and prepares a short update. The team already agrees on what overdue means. The frustrating part is making the same table each week, so automate the draft. Let the lead resolve ambiguous dates and decide what goes to the wider team.",
        ],
      },
      {
        title: "Build a weekly exceptions flow",
        paragraphs: [
          "1. Name the flow Weekly exceptions brief. In Quick, open Flows and create a flow. Describe it with the starter prompt below or start with a blank flow and add the steps yourself. Use a synthetic export first. Agree on fields such as request ID, status, due date, and owner team, plus the reporting date and timezone. If the team needs a consistent cutoff, write it as an input or an explicit rule.",
          "2. Add the input and source steps. A file input is a useful first pass while you learn the workflow. If a supported read connector is available, confirm that it can pull the same approved dataset and that the person running the flow has access. Scope the source to the records the report actually needs. When replacing the uploaded file, check that the connector returns the entire reporting window.",
          "3. Add an AI step that drafts an exception brief. Use structured instructions for the summary, the overdue table, and records needing review. For counts and date comparisons that matter, calculate them in a trusted source or independently verify them. Tell the model to keep missing dates separate, show record IDs, and stop with a clear error if the input is incomplete. Review the generated flow; remove any action it added that you did not ask for.",
          "4. Switch to Run mode and try a normal week, an empty export, and a row with an invalid due date. Include a closed request that would otherwise look overdue. Compare the result with a small hand-checked table. If the draft is wrong, fix the step that caused the error, then rerun the same fixture. Save the expected result so another teammate can repeat the check.",
          "5. Schedule only after the workflow works with the inputs it can get unattended. In Run mode, use the scheduling control to set a recurrence, timezone, and default inputs. A flow that still needs a fresh uploaded file can stay manual until you have a reliable source. Keep the first schedule draft-only. If you add a write action later, review the schedule’s confirmation setting and keep human confirmation for changes that affect others.",
        ],
      },
      {
        title: "Two CROFTC prompts to start with",
        paragraphs: [
          "Use the first prompt when generating the flow. Use the second inside the drafting step, with the approved records and reporting date passed in from earlier steps. Replace the placeholders with your actual fields. The prompts are starting instructions; check the resulting steps and access settings yourself.",
        ],
        examples: [
          { label: "Generate a draft-only flow", text: "Context: Every Friday we review an approved export of open requests.\nRole: Act as an operations workflow designer.\nObjective: Design a flow that prepares a weekly exceptions brief.\nFormat: Input, validation, draft, then review.\nTone: Plain and direct.\nConstraints: No write actions. Ask for the reporting date and timezone. Flag missing required fields instead of guessing." },
          { label: "Draft the exception brief", text: "Context: Use only the approved records and reporting cutoff provided.\nRole: Act as a careful reporting assistant.\nObjective: Summarise overdue open requests and flag ambiguous records.\nFormat: Short summary, table of IDs and due dates, then data gaps.\nTone: Neutral and specific.\nConstraints: Exclude closed items. Do not invent dates or owners. Return the draft for review; do not send it." },
        ],
      },
      {
        title: "Make the next run easy to diagnose",
        paragraphs: [
          "Give one person responsibility for checking the draft and following up on failures. Review run history after the first scheduled runs. Watch for stale source dates, expired connector authentication, or an unexpected drop in the number of rows. Write down how to pause the schedule and run the manual checklist. A flow earns its place when someone other than its builder can see what went wrong and recover.",
        ],
      },
    ],
    faqs: [
      { question: "Do I have to write code to build a Quick Flow?", answer: "No. Start with the visual editor or a plain-language description. You may need help setting up access to a source or checking more complex business rules." },
      { question: "Can I run the same flow every Friday?", answer: "Yes, use a weekly schedule with the right timezone and default inputs. Make sure the flow can access fresh data and that its connectors are authenticated." },
      { question: "Should my first flow send the report automatically?", answer: "Start by generating a draft. Verify several runs, then decide with the process owner whether to add a confirmed send action." },
    ],
    sources: [
      { label: "Creating Amazon Quick Flows", href: "https://docs.aws.amazon.com/quick/latest/userguide/creating-flows.html" },
      { label: "Scheduling Amazon Quick Flows", href: "https://docs.aws.amazon.com/quick/latest/userguide/schedules-in-quick-flows.html" },
      { label: "Amazon Quick integrations", href: "https://docs.aws.amazon.com/quick/latest/userguide/working-with-integrations.html" },
    ],
  },
  {
    slug: "mcp-vs-skill-orchestration",
    name: "MCP, SKILL.md and orchestration",
    heading: "Agentic Orchestration: Combining Amazon Quick, Kiro, MCPs, and SKILL.md",
    title: "Amazon AI Orchestration: Combining Amazon Quick, Kiro, MCP & SKILL.md",
    description: "Understand the difference between MCP servers and SKILL.md files, and learn how to orchestrate Amazon Quick and Kiro for end-to-end agentic workflows.",
    audience: "Teams turning a business request into a reviewed change in a codebase.",
    outcomes: ["Separate tool access from process instructions", "Define a handoff from Quick to Kiro", "Try the pattern with one approved request"],
    sections: [
      {
        title: "MCP connects tools; a skill tells the agent how to work",
        paragraphs: [
          "Say a team asks an agent to review an approved issue and propose a fix. Reading that issue may require a connector. Knowing what to read, which details to leave out, and when to stop for review are separate decisions. Keeping those decisions separate makes it easier to see whether a failure came from access, instructions, or the underlying data.",
          "Model Context Protocol, or MCP, gives a host a standard way to discover and call capabilities exposed by a server. A server can expose tools, resources, or prompts; which capabilities an application uses depends on the host. An issue tracker tool might accept a ticket ID and return its status and approved fields. If that tool cannot read the ticket, a better prompt will not fix the access problem. Check which identity is used, what it can read, and whether the connector has the permissions intended for this job.",
          "A SKILL.md file packages instructions a compatible agent can use for a recurring task. For example, a Kiro skill can describe the order of review, the tests to run, and the format for the change summary. The skill does not authenticate to the issue tracker or grant permission to call a tool. Keep credentials in the approved connection mechanism and keep the skill about the work. If the job only needs local files already available to the agent, a skill may be all you need.",
        ],
      },
      {
        title: "Quick as orchestrator, Kiro as executor",
        paragraphs: [
          "Treat this as an architecture pattern. Use Amazon Quick to gather a request, pull approved business context, and produce a brief for a reviewer. Use Kiro to inspect the codebase, turn the brief into a spec when appropriate, and implement the agreed change on a branch. An authorised person can pass the reviewed brief between the two. You can try the pattern without building an integration or letting an agent write to a ticket system.",
          "If you later connect the tools, choose an approved ticket or document system as the handoff. Quick can use supported integrations, including approved MCP tools exposed as connector actions, where available. Kiro can use an approved connector for the same system or read the reviewed brief from a local file. This pattern does not assume a Quick Flow can start a Kiro session or that both tools share credentials. Decide which identity reads or writes the record on each side and keep each permission as narrow as possible.",
        ],
      },
      {
        title: "Worked example: clarify which requests are overdue",
        paragraphs: [
          "An operations lead sees inconsistent overdue totals in a dashboard. In Quick, collect the request ID, the expected rule, two synthetic example rows, and a link to the approved source of truth. The draft brief records that a request is overdue only if it is open and its due date is before the reporting cutoff. A record with no due date goes into a separate review queue. The lead confirms the rule and the timezone before engineering starts.",
          "Give Kiro the approved brief and a test fixture, leaving out customer data. Ask it to find the existing overdue calculation and propose acceptance tests for an open overdue request, a closed request, a missing due date, and a date exactly at the cutoff. Review those tests before changing the implementation. A small skill can repeat the review routine for the next issue without carrying over this week’s facts.",
          "Once the tests pass, ask for a short handoff: files changed, behaviour changed, test results, and open decisions. The engineer reviews the diff and the operations lead checks the resulting totals on an approved sample. Update the business ticket only after the owner confirms the result. If a connector fails or the brief is missing its cutoff, stop and ask for the missing piece; don’t proceed using a guessed value.",
        ],
        examples: [
          { label: "Reviewed handoff brief", text: "Context: [Approved request ID and source link]\nRole: Work as a reviewer of the existing codebase.\nObjective: Propose tests for the approved overdue rule before implementation.\nFormat: Rule, synthetic cases, expected results, and open decisions.\nTone: Clear and concise.\nConstraints: Use approved fixtures only. Stop if the cutoff or timezone is missing. Do not deploy or update tickets." },
        ],
      },
    ],
    faqs: [
      { question: "Can a SKILL.md file replace an MCP server?", answer: "No. It can describe how and when to use a capability, but it cannot expose or authenticate to a remote tool. Use a connector or another approved access method when the workflow needs one." },
      { question: "Do Quick and Kiro need a direct integration?", answer: "No. Start with a human moving the approved brief. Add an approved shared system only when handoffs are frequent enough to justify it." },
      { question: "Can both tools share the same permissions?", answer: "Evaluate each tool independently. Give the business flow only the access it needs to assemble the brief and the coding agent only the access it needs for the reviewed change." },
    ],
    sources: [
      { label: "MCP architecture", href: "https://modelcontextprotocol.io/docs/learn/architecture" },
      { label: "Kiro Agent Skills", href: "https://kiro.dev/docs/skills/" },
      { label: "Kiro MCP", href: "https://kiro.dev/docs/mcp/" },
      { label: "Amazon Quick MCP integration", href: "https://docs.aws.amazon.com/quick/latest/userguide/mcp-integration.html" },
    ],
  },
];
