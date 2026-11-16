---
slug: agents-routines-mission-control
chapter: 3
short: Agents, routines and Mission Control
title: AWS Quick Agents, Routines & Mission Control | Balram R.
description: Build an AWS Quick agent, put it on a routine that runs while your laptop is off, and manage every run from Mission Control. Copyable setups inside.
published: 2026-11-16
modified: 2026-11-16
---

# Agents, routines and Mission Control in AWS Quick

This is the chapter where AWS Quick on desktop stops being a chat window and starts doing work while you're elsewhere. I'll cover what an agent is, how to build one that behaves, how routines run (and when they quietly don't), and how to use Mission Control to keep a handful of agents honest. Two full builds are at the end, ready to copy.

## What an agent is

An agent is a version of Quick with a job description. You give it instructions, the sources it may read, the tools it may use, and it keeps its own memory of how you like that job done. **Quick** itself is the built-in agent you talk to by default; everything you build sits next to it.

Two rules shape everything else:

- **An agent can only reach what you can reach.** It acts with your access, through the connectors and folders you've allowed, and within the tool permissions you've set (Chapter 5, coming soon).
- **Each agent learns separately.** A preference you teach your meeting-prep agent doesn't leak into your writing agent. The knowledge graph of people and projects is shared, though, so every agent knows who "Priya from finance" is.

::diagram D4

## Build your first agent

The fastest path is to describe it. In any chat, type something like "I want to create an agent that prepares me for meetings", or go to **Customize > Agents > Create > From chat**. Quick drafts a name, a description and instructions, and you refine them by talking or by editing the fields.

**From file** imports an agent definition that was exported to JSON, which is handy for moving a tested agent between accounts.

What to do in the first ten minutes:

1. Let Quick draft it, then **rewrite the instructions yourself** as plain steps. Short and specific beats long and general.
2. Attach one or two reference documents if the agent needs house style or a template.
3. Turn on only the capabilities it needs. Web search off unless the job needs the open web.
4. Test it in chat with three real requests, including one that should fail politely.
5. Only then publish.

You can also @-mention an agent in any chat to use it inline, which opens its editor in a session tab if you want to tweak it on the spot.

## What's inside an agent

The editor has two tabs.

**Instructions**
- **Name** and **Description.** The description is what people see when they browse shared agents, so write it for them.
- **Instructions.** Up to 50,000 characters with headings, lists and code. You'll rarely need a tenth of that.
- **Welcome message** with starter prompts, so someone opening the agent knows what to ask.

**Capabilities**
- **Web search** on or off.
- **Skills.** By default an agent can use every skill you have. Add specific skills and it's limited to those. Limiting the skills of an agent other people will use keeps it behaving the same for everyone.
- **Spaces.** The shared content the agent reads from.
- **Connections.** The connectors and tools it may use.

Each agent also gets a landing page with four tabs: **Overview** (what needs your input, plus an AI-written briefing of its recent work), **Activities** (filter by All, Needs input, Running, Routines), **Agent Files** (everything it has produced across runs) and **Settings**.

A run shows **Running** while it works and **Needs input** when it's waiting on you. When it ends it's **Completed**, **Interrupted** or **Failed**. The Agents list summarises the last run, for example "Last run failed", which is the first column worth scanning each morning.

## Draft, publish and share

Agents are versioned, and this trips people up:

- You edit a **draft**. Your changes don't affect anyone, or any routine, until you **publish**.
- **Routines only ever use the published version.** If you fix the instructions and the routine still misbehaves, check that you published.
- Agents are **private until you share them**, and you can't share one until it's published. Add release notes when you publish; your team sees them.
- When you share an agent, **share its sources too**. People only get answers from sources they can access themselves. You don't have to share everything, just what the agent needs.

The agent's menu lets you set it as the default for new chats, export it to JSON, duplicate it, switch versions, manage its routines, uninstall it (removes it from your list only) or delete it (gone for everyone, if you own it). Published agents can be used from Quick on the web as well.

## Routines: agents on a schedule

A routine wakes an agent at a set time with a set of instructions. Today the routine type on desktop is a **schedule**, for example "every weekday at 8:30 AM".

Create one in three ways: **Mission Control > Create**, the **Routines** tab on an agent's page, or just ask in chat: "every morning at 9, check my channels and summarise what I missed".

The routine form has two tabs. **Overview** holds the settings; **Activity** is the run history.

| Field | What goes there |
|---|---|
| **Repeats** | How often and at what time. The shortest gap allowed is 15 minutes. |
| **Custom time range** | Optional start, end and time zone. Useful for a routine that only matters during a launch. |
| **Triggers** | The agent to run. |
| **Uses** | The connectors and tools this routine may use. Nothing else is available to it. |
| **Instructions** | What to do on each run. Write it as if the agent has no memory of yesterday. |
| **Model details** | Model (Fast, Balanced, Smart), thinking effort, whether to include memory, and whether it may split work into parallel sub-tasks. |

::diagram D5

The behaviour to understand is in that diagram. **Routines run in the cloud**, so a morning brief built on email, calendar and messaging arrives even if your laptop is in a bag. **A run that needs your machine** (reading a local file, the browser or local code) only works if the computer is on with the app running and connected. Otherwise that run is skipped. If a routine needs a local file every day, either move the file into a Space or accept that it only runs on days you're at your desk.

Two more things to plan for:

- **Approvals pause the run.** If the routine wants to send an email and the tool is set to Ask each time, it waits. An approval you've given stays valid for 12 hours before Quick asks again.
- **Every run costs agent hours.** A routine every 15 minutes in Smart mode adds up fast. Start daily, in Balanced, and only tighten the schedule if the result earns it.

Quick also ships with built-in routines, such as the feed agent that fills your activity feed. You can change their schedule, tools, instructions and model like any other routine.

## Mission Control

Mission Control is the control room for all your agents. Click its icon in the top bar for a quick popover (runs, items waiting on you, routines), or open the full page.

::diagram D6

What it's best for, roughly in order of how often you'll need it:

1. **Unblocking.** Filter to agents that need input and approve, deny or reply in chat with a clarification.
2. **Checking last night's runs.** Open a finished run to see what it did, the files it made, a longer summary and the events of each sub-task, then chat to follow up.
3. **Stopping a runaway.** On a live run you can watch events as they happen, pause it or cancel it.
4. **Managing routines** for every agent in one list, instead of opening each agent.
5. **Usage.** The Runs this week tile opens a page with your runs and an **Agent hours** card showing how much runtime you've used. If you share agents or apps, **Creator analytics** shows how many people use them (refreshed hourly).

## Build 1: a meeting-prep agent

**Goal:** before each workday, a short brief on every meeting: who's in it, what was said last time, what's open, and one question worth asking.

**Before you start:** connect your calendar, email and messaging app (Customize > Connectors).

**Create the agent** with From chat, then replace the instructions with these:

```text
You prepare me for my meetings.

For each meeting on my calendar for the day:
1. Title, time and attendees. Mark anyone I haven't met before.
2. Context: the last email thread, chat thread or document that mentions this meeting or its topic in the past 30 days. Cite each one.
3. Open items: decisions or actions from earlier threads that are still open, with the owner if it's clear.
4. One question I should ask, based on the open items.

Rules:
- Skip meetings marked as focus time, personal or declined.
- If you can't find context for a meeting, say "No prior context found" instead of guessing.
- Keep each meeting under 120 words. Plain bullets, no tables.
- Never send, accept or decline anything. This is read-only.
```

**Capabilities:** web search off; connections to calendar, email and messaging only.

**Test it in chat** first: "Prepare me for tomorrow's meetings." Check that every claim has a citation and that a meeting with no history says so.

**Then add the routine:**

| Field | Value |
|---|---|
| Repeats | Every weekday at 7:30 AM, your time zone |
| Triggers | Meeting prep |
| Uses | Calendar, email, messaging |
| Instructions | "Prepare my brief for today's meetings and post it to my feed." |
| Model details | Balanced, thinking Low, include memory on, sub-tasks on |

Because it only uses cloud connectors, it runs whether your laptop is open or not.

## Build 2: a channel-digest routine

**Goal:** one end-of-day summary of the channels you can't keep up with, sorted by what needs you.

This one doesn't need a custom agent. Point a routine at the built-in **Quick** agent.

| Field | Value |
|---|---|
| Repeats | Every weekday at 5:30 PM |
| Triggers | Quick |
| Uses | Your messaging connector only |
| Model details | Fast or Balanced, thinking Off, include memory on |

**Instructions:**

```text
Summarise today's activity in these channels: [channel 1], [channel 2], [channel 3].

Group the summary into:
1. Needs me: direct questions to me, mentions, or decisions waiting on my team.
2. Worth knowing: launches, changes in plans, new documents.
3. Skip: everything else, as a single count.

For each item give one line, the channel, and a link to the message.
Don't reply to or react to anything.
If a channel had no activity, say so in one line.
```

Run it once with the play button before you switch it on, and compare it with what you'd have picked out yourself. If it misses things, tighten "Needs me" with names of people or projects.

## Mistakes to avoid

- **Scheduling before testing.** Run the agent by hand three times first. A routine just repeats whatever mistake it has.
- **Editing the draft and forgetting to publish.** The routine keeps running the old version.
- **A local step in an overnight routine.** It gets skipped while your computer sleeps. Use cloud sources for anything that must run every day.
- **Giving every agent every tool.** Narrow the Uses list. It's safer and the agent is easier to read.
- **One giant agent.** Two small agents with clear jobs beat one that does everything. If it's a method rather than a job, it should be a skill (Chapter 4).

## FAQ

**Do AWS Quick routines run when my laptop is closed?**
Yes, routines run in the cloud. A run that needs your computer (a local file, the browser or local code) only runs if the computer is on with the app running and connected; otherwise that run is skipped.

**How many routines can I have?**
On the check date, up to 20 scheduled tasks per user, with at least 15 minutes between runs. Chapter 8, coming soon, will have the full limits table.

**Why did my routine ignore my latest changes?**
Routines run the published version of an agent. Publish your draft.

**Can other people use my agent?**
Yes, after you publish and share it. Share the sources it needs too, or they'll get answers only from sources they can already see.

**Where do an agent's outputs go?**
Into its Agent Files, its Activities tab and Mission Control, and routines send their results to your feed or to a connected app.

**Which mode should a routine use?**
Start with Balanced. Use Fast for simple summaries and Smart only when accuracy really matters, because heavier modes use more agent hours.

## Sources
- [Agents](https://docs.aws.amazon.com/quick/latest/userguide/agents-desktop.html)
- [Mission Control](https://docs.aws.amazon.com/quick/latest/userguide/mission-control-desktop.html)
- [Activity feed](https://docs.aws.amazon.com/quick/latest/userguide/activity-feed-desktop.html)
- [Memories](https://docs.aws.amazon.com/quick/latest/userguide/memories-desktop.html)
- [AWS Quick desktop usage limits](https://docs.aws.amazon.com/quick/latest/userguide/usage-limits-desktop.html)
- [Troubleshooting](https://docs.aws.amazon.com/quick/latest/userguide/desktop-troubleshooting.html)
