import type { GuideFaq } from "./pillar-guides";

export const roleGuideSeo: Record<string, { title: string; description: string; heading: string; faqs: GuideFaq[] }> = {
  managers: {
    title: "AI for Managers and Team Leads: Meeting Notes and Action Plans | Balram R.",
    description: "Turn approved meeting notes into an action plan with owners, dates, dependencies, and open questions using a practical AI prompt.",
    heading: "AI for managers and team leads",
    faqs: [
      { question: "What meeting notes should I use?", answer: "Use an approved summary that includes decisions and commitments. Remove information your AI tool is not approved to process." },
      { question: "What if nobody owns an action yet?", answer: "Mark the owner as unassigned. Ask the team to confirm ownership and a due date before sharing the plan." },
      { question: "Can I reuse this prompt?", answer: "Yes. Keep an approved example as a reference and replace the meeting notes each time." },
    ],
  },
  operations: {
    title: "AI for Operations Teams: Amazon Quick Flows, SOPs & Workflow Prompts",
    description: "Automate routine operations, build SOPs, and streamline project updates using Amazon Quick workflows and structured AI prompts.",
    heading: "AI for operations teams: SOPs and workflow prompts",
    faqs: [
      { question: "What belongs in an AI-assisted SOP?", answer: "Include purpose, inputs, numbered steps, exception handling, and a final checklist. Have the process owner confirm any unresolved rules." },
      { question: "When is an SOP ready to automate?", answer: "Start after a colleague can follow it with sample data and handle common exceptions. Then try a draft-only run in your workflow tool." },
      { question: "What if the process depends on an incomplete export?", answer: "Write an explicit stop condition and name who can supply a replacement. The workflow should flag the missing data instead of guessing." },
    ],
  },
  "client-teams": {
    title: "AI Prompts for Sales, Customer Success & Client Communication | Balram R.",
    description: "Practical AI workflows and copy-paste prompts for client-facing teams, account managers, and customer success leaders.",
    heading: "AI prompts for sales, customer success and client communication",
    faqs: [
      { question: "Can AI draft a client follow-up?", answer: "Yes. Give it approved notes and ask for a short draft that separates requests, agreements, and the next question. Edit and send it yourself." },
      { question: "How do I keep AI from promising something we did not agree to?", answer: "Label decisions and open requests separately in the notes. Check the draft for dates, pricing, and commitments before sending." },
      { question: "How can the draft sound more like me?", answer: "Give the tool an approved, anonymised example of your writing, then revise the draft in your own voice." },
    ],
  },
  analysts: {
    title: "AI for Business Analysts & Strategy Teams: Research & Memo Prompts",
    description: "Accelerate market research, data synthesis, and strategy memos using structured AI prompting and agentic workflows.",
    heading: "AI for business analysts and strategy teams",
    faqs: [
      { question: "What should I give AI for a research comparison?", answer: "Provide dated source extracts, shared comparison criteria, and constraints. Label estimates separately from observations." },
      { question: "How should I handle uncertain evidence?", answer: "Keep assumptions and missing evidence visible. State which new information would change the recommendation." },
      { question: "What should I review before sharing a strategy memo?", answer: "Trace factual claims to their sources, recalculate the numbers independently, and confirm that the recommendation explains its conditions." },
    ],
  },
};
