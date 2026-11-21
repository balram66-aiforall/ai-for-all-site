---
slug: skills
chapter: 4
short: Skills
title: AWS Quick Skills: SKILL.md Guide and Template | Balram R.
description: How AWS Quick skills load, how to write a SKILL.md that triggers at the right time, and a weekly status skill you can copy, test, publish and share.
published: 2026-11-16
modified: 2026-11-16
---

# Skills in AWS Quick: write one, test it, share it

If agents are the workers in AWS Quick, skills are the methods they follow. A good skill means you explain a task once and get it done the same way every time, by you or by anyone you share it with. This chapter covers how Quick decides when to use a skill, how to write one that triggers when it should (and not when it shouldn't), and a weekly status skill you can copy.

## What a skill is

Every skill is a folder, and at its top sits a file called `SKILL.md`. That file holds two things:

- a **description**: one or two sentences on what the skill is for and when to use it
- **instructions**: the steps to follow, which can be a whole multi-step process

The folder can also carry **reference files** (templates, examples, scripts) and point to the **tools** it needs, such as a connector or a built-in capability. The skill names the tools; it doesn't contain them or grant access to them. Access still comes from your connectors and permissions (Chapter 5, coming soon).

If you've used skills in Kiro or Claude Code, the idea is the same. That's useful: a method written once can travel between tools with small edits.

## Skill or agent?

The two are easy to mix up.

| Compare | Skill | Agent |
|---|---|---|
| What it is | A method: how to do one task | A worker: who does a job, with what |
| Holds | Description, instructions, reference files, tools it needs | Instructions, capabilities, Spaces, connections, its own memory and files |
| Runs on a schedule | Through an agent's routine | Yes, with a routine |
| Who uses it | Any agent, including Quick | You and anyone you share it with |
| Good for | Status updates, brand-checked posts, report formats, review checklists | Meeting prep, inbox triage, a project monitor |

My shortcut: **if the instructions start with "When you write a...", it's a skill. If they start with "You are responsible for...", it's an agent.** And an agent can use skills, so the best setups are usually a small agent plus two or three skills.

A skill is also different from a connector. A connector gives Quick access to a tool; a skill tells it how to do the work once it's there. The [MCP and SKILL.md guide](/guides/mcp-vs-skill-orchestration) on this site covers that split in more depth.

## How Quick loads skills

Quick doesn't read every skill into every chat. It works in two stages.

::diagram D7

1. **Discovery.** Quick looks at the name and description of your enabled skills to decide whether one fits your request.
2. **Activation.** When one fits, or when you name it, Quick reads the full instructions into the conversation and follows them, along with the files and tools the skill refers to.

The practical upshot: **the description decides whether your skill is ever used.** The instructions decide how well. Most skills that "don't work" have a fine method and a vague description.

You can also trigger a skill by name ("use the weekly status skill") or start a chat with it loaded from **Try it** on its detail panel. Type `/skills` in chat to see what's available.

## What's in a skill folder

::diagram D8

```text
weekly-status/
├── SKILL.md          the description and the steps
├── template.md       the layout to fill in
└── examples/
    └── good-update.md   one update you liked
```

Keep it small. The whole skill can be up to 6 MB on the check date, but a skill that needs megabytes of reference material is usually a Space in disguise.

## Three ways to create one

Go to **Customize > Skills > Create** and choose:

- **From chat.** Describe the skill and Quick drafts the instructions, picks the tools to reference and writes the `SKILL.md`. This is where I'd start.
- **From file.** Upload a `.md` or a `.zip`.
- **From folder.** Point at a folder with `SKILL.md` at the top and its reference files.

The easiest skill of all: complete a task with several steps in chat, and Quick may offer to save the steps as a skill. If it doesn't, ask it to. You then edit a method that has already worked once, instead of writing one from scratch.

## Writing a description that triggers

A description has one job: make Quick pick this skill for the right requests and ignore it for the rest. What works:

- **Name the output and the moment.** "Writes my weekly status update for my manager" beats "Helps with updates".
- **Use the words people actually type.** If people say "weekly report" and "Friday update", put both in.
- **Say when not to use it.** "Not for project launch announcements" stops it hijacking nearby requests.
- **Keep it to two sentences.** It's a label on a shelf, not the manual.

## Build: a weekly status skill

**Goal:** every Friday, a status update in the same shape, drawn from the week's real activity, in your voice.

**`SKILL.md`**

```markdown
---
name: weekly-status
display_name: Weekly status
description: Writes my weekly status update (also called the Friday update or weekly report) from this week's email, calendar, messages and documents. Not for launch announcements or customer emails.
icon: "📝"
trigger: weekly status
---

# Weekly status update

Use template.md for the layout. Match the tone of examples/good-update.md.

## Steps
1. Find the reporting week: Monday to today, in my time zone.
2. Gather what I worked on: meetings I attended, threads I replied to, documents I created or edited. Cite each source.
3. Group the work under my current projects. If something doesn't fit a project, put it under "Other".
4. For each project write:
   - Done: finished outcomes, not activity ("Shipped X", not "Worked on X").
   - Next: what happens next week, with an owner.
   - Risks: anything blocked or late, with what would unblock it.
5. Keep the whole update under 250 words.
6. Show me the draft. Never send it.

## Rules
- If you can't find evidence for an item, leave it out rather than guess.
- No adjectives like "great" or "amazing". Facts and numbers only.
- If a project had no activity this week, write "No update" for it.
```

**`template.md`**

```markdown
**Week of [date]**

**[Project 1]**
- Done:
- Next:
- Risks:

**[Project 2]**
- Done:
- Next:
- Risks:

**Other**
-
```

Put the two files and an `examples/` folder with one update you liked into a folder, then use **Create > From folder**. Or paste the instructions into **From chat** and let Quick build the files.

### Getting the header right

The block between the two `---` lines is the skill's header, and AWS's official skill catalog on GitHub documents the fields: `name` (lower-case with hyphens, the same as the folder name), `display_name`, `description`, `icon` (one emoji), `trigger` (a short phrase that activates it) and `tools` (leave this out rather than guess tool names). Three things break it quietly, with no error message:

- **Anything above the first `---`**, even a blank line. Quick then finds no header at all.
- **Several keys on one line.** One key per line, starting at the left edge.
- **A `#` in front of a key.** That turns the line into a comment.

When it goes wrong, the skill installs with a blank name and the whole header shows up as text in its instructions. And if you build a skill in the Create form instead, the header fields are the form's own boxes: paste only the part below the closing `---` into Instructions.

## Test, publish and share

::diagram D9

A skill you own has a **draft** and a **published** version. Edits go to the draft and show an **Unpublished changes** label; the published version keeps running unchanged until you publish. That means you can improve a skill people rely on without breaking it halfway.

A test routine worth running before every publish:

1. **Try it** with a normal request: "Write my weekly status."
2. **Try it** with a request phrased differently: "Can you do my Friday update?" If it doesn't trigger, fix the description.
3. **Try it** with something it should ignore: "Draft a launch announcement." If it triggers, add a "Not for..." line.
4. Check that every item in the output is backed by a real source.

Then:

- **Publish** makes the draft live. Everyone who has the skill moves to the new version.
- **Share** is a separate step. Pick people or groups, or the whole account with Share with all. Publishing alone shares nothing.

People you share with find it under **Shared with me** in Add to Quick. They're **viewers**: they can use it, and their copy tracks your published version, but they can't edit or re-share it. To change it, they **Duplicate** it into a copy they own. Only you, as the owner, can change, publish, share, export or delete it. Careful with **Delete**: it removes the skill for everyone you shared it with, not just you.

## System and official skills

Quick comes with **system skills** marked with a System badge, for documents, presentations, spreadsheets, web browsing, code execution, the knowledge graph and transcription. You can try them and switch them off, but not edit or share them. When you ask for a deck, the presentations skill loads on its own.

On the Skills tab, **Browse all** lists **Official** skills from AWS Quick (everyday productivity, skills for roles like Sales, Marketing and Legal, and sets for specific industries) and skills shared within your organisation. Adding one links you to the owner's live version rather than copying it, so you get their updates automatically.

Before writing a skill from scratch, check the Official list. Duplicating a close match and editing it is faster.

## Admin controls

In a company account, admins can narrow what you can do with skills through custom permissions: turn skills off entirely, block sharing with individuals, block sharing with the whole account, or make every share wait for approval. If Share is greyed out, that's usually why. Chapter 7, coming soon, will cover the admin side.

## FAQ

**What is a SKILL.md file in AWS Quick?**
It's the file at the top of a skill folder. It holds the skill's description, which Quick uses to decide when the skill applies, and the instructions it follows when the skill is active.

**Why isn't my skill being used?**
Usually the description. Quick picks skills by name and description first, so describe the output, the moment and the words people actually use. Also check the skill is enabled, and that the agent you're using isn't limited to a different set of skills.

**Does publishing a skill share it?**
No. Publishing makes your draft the live version. Sharing is a separate step where you choose who gets it.

**Can I edit a skill someone shared with me?**
Not directly. Duplicate it to get your own copy, then edit that.

**Can I use the same skill in Kiro or Claude Code?**
The idea and the file name are the same, so a method usually moves across with small edits. Tool references and paths will differ between products, so test it in each one.

**How big can a skill be?**
On the check date, up to 6 MB per skill and up to 1,000 skills per user. Chapter 8, coming soon, will have the full limits table.

## Sources
- [Skills](https://docs.aws.amazon.com/quick/latest/userguide/skills-desktop.html)
- [Working with chat (slash commands)](https://docs.aws.amazon.com/quick/latest/userguide/working-with-chat-desktop.html)
- [Agents (Capabilities tab)](https://docs.aws.amazon.com/quick/latest/userguide/agents-desktop.html)
- [AWS Quick desktop usage limits](https://docs.aws.amazon.com/quick/latest/userguide/usage-limits-desktop.html)
- [The AWS Quick skill format, AWS Quick official catalog on GitHub](https://github.com/Amazon-Quick/Amazon-Quick-official-catalog/blob/main/skills/aws-quick/agent-to-quick-skill/references/quick-skill-format.md)
