---
slug: 
chapter: 0
short: The complete guide
title: AWS Quick Desktop: The Complete Guide (2026) | Balram R.
description: How AWS Quick on desktop works, what it can reach on your machine, and how I set up agents, skills, routines and connectors. Checked against AWS docs.
published: 2026-11-16
modified: 2026-11-16
---

# AWS Quick on desktop: the complete guide

AWS Quick on desktop is the Mac and Windows app for AWS Quick (formerly Amazon Quick). It's an AI assistant for work that can read the folders you choose, drive your browser, run code in a sandbox, and keep agents running on a schedule after you close the lid. I teach AI to a lot of people, and this is the guide I'd hand anyone starting with it: what the app is, how the pieces fit, and the setups I'd copy first.

If you only have ten minutes, read [Your first hour](#your-first-hour) and the [building blocks](#the-building-blocks-chat-skill-agent-routine-space-app) table. Everything else goes deeper in eight chapters.

## What AWS Quick on desktop is

AWS Quick is AWS's AI workspace for work: chat, research, agents, automations, apps and dashboards in one place. The desktop app is one way into it. The others are the web app, the mobile app and browser or Microsoft 365 extensions. They all share one account, so a chat I start on my laptop is there on my phone.

What the desktop app adds is reach into my machine. It can:

- read, write, search and index folders I grant, and nothing outside them
- drive a browser, either a separate copy of my profile or my own running browser
- run Python or JavaScript in a sandbox to analyse files and build charts
- use MCP servers I run locally, plus coding agents like Kiro or Claude Code

**About the name.** The desktop app was announced in preview in April 2026 and became generally available on macOS and Windows in September 2026, as Amazon Quick. In November 2026 the service was renamed AWS Quick. Nothing changed in how it works, and older posts, videos and even the installer file name (Amazon-Quick.dmg) still say Amazon Quick. If you're searching, try both names.

::diagram D1

## Desktop, web and mobile: what lives where

This is the single idea that clears up most confusion. **Quick runs in the cloud.** Your history, memory, knowledge graph and anything agents produce are kept in your AWS Quick account. The desktop app is a very capable window plus a set of hands on your computer.

| Kept in your AWS Quick account (same on web, mobile and desktop) | Only on the desktop app |
|---|---|
| Conversations and folders of chats | Access to the folders you grant |
| Memory and the knowledge graph | Browser automation in your browser |
| Files agents produce (Agent Files, artifacts) | Local code execution in a sandbox |
| The search index of content you choose to upload | Local MCP servers |
| Agents, skills, Spaces, routines | Coding agents (Kiro, Claude Code) |
| Cloud connectors (Outlook, Slack, Jira and others) | The settings for all of the above, plus your sign-in |

Two consequences I plan around:

1. **Routines keep running when my laptop is off**, because they run in the cloud. A run that needs my machine (a local file, the browser or local code) is different: if my computer is asleep at that moment, the run is skipped and Mission Control says so.
2. **A local MCP server is mine alone.** If my team needs the same tools on web and mobile too, it has to be added as a cloud connector.

## A tour of the window

::diagram D2

What each area is for, in one line:

- **Chat** is where you'll spend most of your time. The composer is where you pick the agent, the mode and the thinking effort, attach files, folders or a Space, turn on web search, and type `/` for commands.
- **Feed** is a ranked list of what needs you across email, calendar and messaging, with Calendar and To-dos tabs. It shrinks as you clear it.
- **Library** holds everything you and Quick have made: documents, decks, sheets, apps, agents, skills, research.
- **Customize** is the workshop: Agents, Skills, Connectors, Knowledge (your folders) and Brand assets.
- **Apps** are small interactive tools you build by describing them.
- **Spaces** are curated shelves of team content you can chat against.
- **Mission Control** (top bar) is the one place to watch every agent, unblock the ones waiting on you, and manage routines.
- **My context** (from your profile) shows what Quick has learned: Memories and the Knowledge graph.

Three controls I'd learn on day one: `/goal` (give it a job to finish, and it keeps working and checks itself before handing back), **Cmd+B / Ctrl+B** (push the running task into the background and carry on in another chat), and **Incognito** (a chat that doesn't read or write memory and isn't saved; switch it on before the first message, because you can't once the chat has started).

## Your first hour

Here's the order I'd follow. Each step takes about ten minutes.

1. **Install and sign in.** Apple Silicon Mac (macOS 12 or later) or 64-bit Windows 10 or later, 8 GB RAM. Use the work sign-in your admin gave you, or a personal sign-in for the Free plan. Chapter 1, coming soon, will cover the first-launch security prompts.
2. **Connect three things only:** calendar, email and one messaging app. The first-run screen offers exactly these. Skip the rest for now.
3. **Grant one folder, not your whole drive.** Pick a project folder. Leave indexing off until you know what you want searchable from your phone. Chapter 6, coming soon, will explain what each indexing switch uploads.
4. **Ask three real questions** about today: "What do I need to prepare for my meetings today?", "What did I miss in [channel] since Friday?", "Summarise the files in [folder] and list open decisions." Check the citations on each answer.
5. **Save one skill.** Finish a small multi-step task in chat (a status update is perfect) and accept the offer to save the steps as a skill, or ask it to. Chapter 4 has a ready-made one.
6. **Put one agent on a routine.** A morning meeting-prep agent on weekdays is the easiest win. Chapter 3 has the full build.

At the end of the hour you've seen the three things that make the desktop app worth installing: it knows your day, it can use your files, and it keeps working when you don't.

## The building blocks: chat, skill, agent, routine, Space, App

People mix these up constantly, and the wrong choice makes the right result much harder. Here's how I decide.

::diagram D3

| You want... | Use | Why |
|---|---|---|
| An answer or a draft, once | **Chat** | Nothing to set up. Use `/goal` if it's a job, not a question. |
| The same task done the same way every time, by anyone | **Skill** | A skill is a written method. Any agent can pick it up when the task comes up. |
| A specialist with its own instructions, sources, tools and memory | **Agent** | An agent is who does the work and what it's allowed to touch. |
| Work to happen without you asking | **Routine** | A routine is a schedule that wakes an agent with instructions. It runs in the cloud. |
| Answers grounded only in an agreed set of documents | **Space** | While attached, Quick answers from the Space and tells you when the answer isn't there. |
| A reusable interactive tool for other people | **App** | For a form, a calculator or a dashboard people click, not chat with. |

My rule of thumb: **start in chat, turn the method into a skill, give it to an agent when it needs its own tools or memory, and add a routine only after a manual run works.** Most people jump straight to an agent with a routine and then can't tell which part went wrong.

Two other guides on this site go deeper on single pieces: the [AWS Quick Flows guide](/guides/amazon-quick) builds a scheduled weekly report step by step, and [Combining AWS Quick, Kiro, MCP and SKILL.md](/guides/mcp-vs-skill-orchestration) covers when you need a connector and when a skill is enough.

## Modes, thinking effort and agent hours

Every chat and every routine runs on one of three modes, plus a thinking effort:

- **Fast** for lookups and simple tasks. No extended thinking.
- **Balanced** for most work: writing, summaries, everyday analysis.
- **Smart** for hard analysis and anything where accuracy matters most.
- **Thinking effort** (Off, Low, Medium, High) is a separate dial on Balanced and Smart.

Usage is measured in agent hours: time Quick spends actively working, metered per second, at a higher rate in heavier modes and higher thinking levels. Idle time between your messages doesn't count. A routine uses hours every time it runs, so ten small routines add up. Plans and allowances change, so check the [AWS Quick pricing page](https://aws.amazon.com/quick/pricing/) rather than any number in a blog post, including this one. On the check date, the Free plan includes the desktop app.

> **From my desk.** I run a heavy custom agent with a long, detailed set of instructions. On Fast it ran out of context partway through, and on Smart it got throttled at busy times. **Balanced** was the mode that finished reliably. If a big agent keeps failing, try Balanced before you rewrite the prompt.

## How it compares with other desktop AI apps

All of these products ship changes every month, so treat this as a snapshot on the check date and follow the links.

The difference that matters most in practice is what happens to scheduled work when you shut the laptop:

| App | Scheduled work while your computer is off |
|---|---|
| AWS Quick on desktop | Routines run in the cloud. A run that needs your machine (local files, the browser, local code) is skipped if it's off. |
| Claude desktop | Cloud scheduled tasks keep running. Local scheduled tasks only fire while the app is open and the computer is awake. |

Where Quick stands out for me is that it isn't tied to one vendor's suite: the same assistant reads Outlook or Gmail, Slack or Teams, Jira or Asana, and your local folders, and routines keep going after the laptop closes. If your whole company lives in one suite and you only need help inside it, that suite's own assistant may be the simpler choice.

## Limits worth knowing

The ones people hit first, on the check date: 3 chat sessions running at once, 20 scheduled tasks per user with at least 15 minutes between runs, 50 MB per attached file, 50,000 characters of agent instructions, and approvals that expire after 12 hours. The full, dated table will be in Chapter 8, Troubleshooting and limits (coming soon).

## FAQ

**Is AWS Quick the same as Amazon Quick?**
Yes. Amazon Quick was renamed AWS Quick in November 2026. The product, your data and your settings didn't change. Amazon Quick Sight is now AWS Quick Sight.

**Is the AWS Quick desktop app free?**
There's a Free plan for individuals that includes the desktop app, and paid plans for teams and organisations with more usage. Check the pricing page for current plans.

**Does it run on Intel Macs or Linux?**
The documented minimum is an Apple Silicon Mac (M1 or later) on macOS 12 or later, or 64-bit Windows 10 or later. Linux isn't listed.

**Does it keep working when my laptop is closed?**
Routines and the feed do, because they run in the cloud. A run that needs your computer (a local file, the browser, local code) only runs when the computer is on with the app running and connected.

**Does AWS use my conversations to train models?**
No. AWS's desktop security page says your conversations, files and personal context aren't used for model training. Chapter 6, coming soon, will cover memory, the knowledge graph, Incognito and how to delete things.

**Can I connect my own MCP servers?**
Yes. On desktop, add a local connector for a server that runs on your computer or at a URL. To share a server across web, mobile and desktop, set it up as a cloud connector. Chapter 5, coming soon, will walk through both.

**Can it use Kiro or Claude Code?**
Yes, as coding agents. Quick hands the coding task over and reports back. Its own code sandbox blocks common coding commands, so real development goes to the coding agent.

**What's the difference between a skill and an agent?**
A skill is a method (how to do a task). An agent is a worker (instructions, sources, tools and its own memory). Agents use skills.

## Sources
- [What is AWS Quick on desktop?](https://docs.aws.amazon.com/quick/latest/userguide/what-is-desktop.html)
- [Understanding the desktop interface](https://docs.aws.amazon.com/quick/latest/userguide/desktop-interface.html)
- [Working with chat](https://docs.aws.amazon.com/quick/latest/userguide/working-with-chat-desktop.html)
- [AWS Quick desktop usage limits](https://docs.aws.amazon.com/quick/latest/userguide/usage-limits-desktop.html)
- [AWS Quick pricing](https://aws.amazon.com/quick/pricing/)
- [Amazon Quick is now AWS Quick](https://aws.amazon.com/about-aws/whats-new/2026/11/amazon-quick-aws-quick/)
- [Amazon Quick desktop app is now generally available on macOS and Windows](https://aws.amazon.com/about-aws/whats-new/2026/09/amazon-quick-desktop-app-generally-available-macos-windows/)
- Comparison sources: [Claude Code Desktop scheduled tasks](https://code.claude.com/docs/en/desktop-scheduled-tasks), [Local MCP servers on Claude Desktop](https://support.claude.com/en/articles/10949351-getting-started-with-local-mcp-servers-on-claude-desktop)
