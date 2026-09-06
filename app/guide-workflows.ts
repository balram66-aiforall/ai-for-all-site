export type GuideWorkflow = {
  role: string;
  task: string;
  minutes: number;
  input: string;
  prompt: string;
  output: string;
  steps: { title: string; body: string }[];
  checks: string[];
  next: string;
};

export const guideWorkflows: Record<string, GuideWorkflow> = {
  managers: {
    role: "Team lead",
    task: "Turn a meeting into a plan people can act on.",
    minutes: 10,
    input: "Launch check-in: QA found a checkout bug. Maya will investigate by Thursday. Release date depends on the fix. Leo needs the final help article before launch. Nobody owns the article yet.",
    prompt: "Context: I lead a team preparing a product launch. Use only the meeting notes below.\nRole: Act as a careful project coordinator.\nObjective: Turn these notes into an action plan and surface missing decisions.\nFormat: A table with action, owner, due date, and dependency, followed by open questions.\nTone: Clear, neutral, and concise.\nConstraints: Do not invent owners, dates, or commitments. Label missing details as 'Not assigned' or 'Not agreed'. Separate decisions from suggestions.\n\nNotes:\n[Paste approved meeting notes here]",
    output: "ACTION                         OWNER         DUE\nInvestigate checkout bug       Maya          Thursday\nFinalize help article          Not assigned  Not agreed\nConfirm release date           Not assigned  After bug review\n\nOpen questions\nWho owns the help article?\nWho decides whether the fix is ready for release?\nDoes Leo need the article before or on launch day?",
    steps: [
      { title: "Gather the right notes", body: "Start with an approved meeting summary. Remove private employee information. Keep decisions, commitments, and unresolved questions; a full transcript is usually unnecessary." },
      { title: "Draft the action plan", body: "Paste the prompt with your notes into your team's approved AI tool. Ask it to leave gaps visible. A missing owner is a question for the team, not a detail for AI to guess." },
      { title: "Confirm before sharing", body: "Compare every action with the notes. Ask the named people to confirm their commitments. Put the agreed actions into the system the team already uses." },
    ],
    checks: ["Every action is supported by the notes", "Owners and dates are confirmed or marked missing", "Suggestions are separate from decisions", "The team has confirmed the final plan"],
    next: "Reuse the same structure for your next meeting. Keep the final approved example as a reference for future drafts.",
  },
  operations: {
    role: "Operations",
    task: "Turn a recurring task into a dependable checklist.",
    minutes: 15,
    input: "Weekly report: download last week's orders, remove cancelled orders, check duplicate order IDs, total net sales, compare with the previous week, send to the team lead. If the export is incomplete, ask the data team for a replacement.",
    prompt: "Context: I am documenting a recurring operational process for a colleague doing it for the first time.\nRole: Act as a process editor.\nObjective: Create a practical SOP from the notes below and identify missing controls.\nFormat: Purpose, inputs, numbered steps, exception handling, and a final checklist.\nTone: Direct and plain.\nConstraints: Do not invent system names, approval rules, or thresholds. Mark unresolved details as questions. Preserve the stated order of steps.\n\nProcess notes:\n[Paste the approved process here]",
    output: "Weekly sales report\n\n1. Download orders for the previous week.\n2. Check the export is complete. If not, request a replacement.\n3. Remove cancelled orders.\n4. Identify duplicate order IDs before calculating totals.\n5. Total net sales and compare with the prior week.\n6. Send the checked report to the team lead.\n\nClarify before use\nWhich timezone defines the reporting week?\nHow should duplicate IDs be resolved?\nWhat is the approved definition of net sales?",
    steps: [
      { title: "Describe the actual process", body: "Write down what a colleague really does, including exceptions and handoffs. Use approved sample data rather than customer records or credentials." },
      { title: "Ask for steps and gaps", body: "Use the prompt to create a first SOP. Pay attention to questions about definitions, approvals, and failure cases. Resolve these with the process owner." },
      { title: "Run a small dry run", body: "Have a colleague follow the checklist with a safe sample. Record where they pause or interpret a step differently, then revise the SOP before making it the team standard." },
    ],
    checks: ["Inputs and definitions are explicit", "Exception handling matches the real process", "No policy or approval was invented", "A colleague has completed a dry run"],
    next: "Add an owner and review date to your approved SOP. Revisit it when the underlying process changes.",
  },
  analysts: {
    role: "Analyst",
    task: "Compare options without hiding uncertainty.",
    minutes: 15,
    input: "Option A: two-week setup, $200 monthly, manual export. Option B: six-week setup, $350 monthly, scheduled export. Team capacity is limited this month. Reliable scheduled exports would reduce recurring manual work. Security review has not been completed for either option.",
    prompt: "Context: Our team is comparing options using the evidence below.\nRole: Act as a skeptical decision analyst.\nObjective: Help a decision maker understand the tradeoffs and unresolved questions.\nFormat: Comparison table, conditional recommendation, evidence gaps, and next checks.\nTone: Neutral and specific.\nConstraints: Use only supplied facts. Do not invent savings, performance data, or security claims. Separate evidence from inference. Show what would change the recommendation.\n\nEvidence:\n[Paste approved evidence and source references here]",
    output: "                 OPTION A          OPTION B\nSetup            2 weeks           6 weeks\nMonthly cost     $200              $350\nExport           Manual            Scheduled\nSecurity review  Not completed     Not completed\n\nConditional assessment\nA may fit near-term capacity. B may reduce recurring export work.\nNeither is ready for approval without the security review.\n\nEvidence gaps\nHours spent on exports today; implementation effort;\nrequired controls; integration compatibility.",
    steps: [
      { title: "Build an evidence pack", body: "Gather dated source extracts, the decision criteria, and known constraints. Label estimates separately from observed results. An AI summary is not a substitute for the original source." },
      { title: "Compare against shared criteria", body: "Use the prompt to build a comparison. Ask where the conclusion depends on an assumption. Recalculate numbers in a spreadsheet or another reliable tool." },
      { title: "Write a conditional recommendation", body: "Explain the tradeoff and which evidence would change the decision. Include source references so the reviewer can trace the reasoning." },
    ],
    checks: ["Every factual claim has a source", "Calculations have been independently checked", "Assumptions and missing evidence are visible", "Recommendation explains its conditions"],
    next: "Turn the reviewed comparison into a one-page decision memo with a named decision owner and follow-up date.",
  },
  "client-teams": {
    role: "Client teams",
    task: "Write a follow-up that earns the next conversation.",
    minutes: 10,
    input: "Call with a client: they want faster onboarding and a single support contact. We agreed to send a draft onboarding outline on Friday. Pricing was discussed but not agreed. Next call is not scheduled.",
    prompt: "Context: I need to follow up on a client conversation using only the notes below.\nRole: Act as a careful client communications editor.\nObjective: Confirm what we heard, what we agreed, and the next step.\nFormat: Subject line and an email under 150 words.\nTone: Warm, clear, and professional.\nConstraints: Do not invent commitments, pricing, names, or dates. Separate requests from agreed actions. Use placeholders for missing names. End with one clear question.\n\nCall notes:\n[Paste approved notes here]",
    output: "Subject: Onboarding outline and next steps\n\nHi [Name],\n\nThanks for sharing your priorities: faster onboarding and a single support contact.\n\nAs agreed, we will send a draft onboarding outline on Friday. Pricing and the support arrangement remain open for discussion.\n\nWould you like to arrange a call to review the outline once you have had a chance to read it?\n\nBest,\n[Your name]",
    steps: [
      { title: "Separate requests from promises", body: "Capture what the client asked for and what your team actually agreed to deliver. Remove confidential information your AI tool is not approved to process." },
      { title: "Draft a short follow-up", body: "Use the prompt to draft an email. Give AI an approved example of your writing if the first version sounds unlike you." },
      { title: "Read it as the client", body: "Check whether any sentence creates an unintended promise. Verify names, dates, pricing, and attachments. Edit and send the email yourself." },
    ],
    checks: ["Requests are not presented as commitments", "Names, dates, and commercial details are verified", "There is one clear next step", "The final email sounds like me"],
    next: "Save an anonymized, approved example as a reusable style reference. Refresh the facts for every client.",
  },
};
