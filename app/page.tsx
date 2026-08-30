"use client";

/* eslint-disable @next/next/no-img-element -- Vinext's next/image shim breaks hydration. */
import { useEffect, useState, useSyncExternalStore } from "react";
import { ArticleCarousel } from "./components/ArticleCarousel";
import { AifaMascot } from "./components/AifaMascot";
import { communityExamples, roleGuides, simpleLearningCards } from "./site-content";
import { ShelfEmbed } from "./components/ShelfEmbed";

type ThemeMode = "dark" | "light";
type ThemePhase = "idle" | "to-light" | "to-dark";

const THEME_STORAGE_KEY = "aifa-theme";

function SunIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 2.8v2.7M12 18.5v2.7M4.2 4.2l1.9 1.9M17.9 17.9l1.9 1.9M2.8 12h2.7M18.5 12h2.7M4.2 19.8l1.9-1.9M17.9 6.1l1.9-1.9" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M15.5 3.8A8.8 8.8 0 1 0 20.2 15.5 8.2 8.2 0 1 1 15.5 3.8Z" />
    </svg>
  );
}

const tips = [
  'Start with the outcome you need, not the prompt you want to write.',
  'Show AI examples of good work. It learns taste faster than adjectives.',
  'Ask for options first, then have it pressure-test the safest answer.',
  'Keep a swipe file of prompts, bad outputs, and the fixes that worked.',
];

const learningPaths = [
  ['Start', 'Understand what AI does well, where it fails, and how to ask for useful help.'],
  ['Think', 'Use AI to compare options, organize context, and make better decisions faster.'],
  ['Build', 'Turn prompts into workflows, reusable systems, assistants, and working outputs.'],
  ['Ship', 'Publish articles, visuals, and learning loops that make your thinking visible.'],
];

const teammateLoops = [
  ['01', 'Frame', 'Turn messy intent into a sharp brief.'],
  ['02', 'Draft', 'Generate options, structures, and first passes.'],
  ['03', 'Judge', 'Compare output against taste, context, and truth.'],
  ['04', 'Ship', 'Package the work for LinkedIn, teams, or clients.'],
];

const trainingLanes = [
  [
    'Foundations',
    'Make AI understandable for beginners, non-technical teams, and anyone who wants confidence before tools.',
    'Start here',
  ],
  [
    'Tools',
    'Teach people how to use AI assistants, product features, and everyday work tools with clear judgment.',
    'Hands-on',
  ],
  [
    'Workflows',
    'Turn scattered prompting into repeatable systems for research, writing, planning, review, and output.',
    'Practice',
  ],
  [
    'Agents',
    'Help teams understand agentic work, context, skills, MCPs, and when AI should move work forward.',
    'Next wave',
  ],
];

const trainingSignals = [
  '35,000+ people trained',
  'AI For All initiative',
  'Generative AI workshops',
  'Tool walkthroughs',
  'Plain-language teaching',
  'Prompting with context',
  'Role-specific learning',
];

const repoItems = [
  [
    'Agents',
    'Reusable AI teammates for research, writing, planning, review, and delivery.',
    'Open soon',
  ],
  [
    'Skills',
    'Skill.md patterns that teach AI how I think, decide, and ship useful work.',
    'Building',
  ],
  [
    'Templates',
    'Briefs, prompt systems, checklists, and operating rhythms people can reuse.',
    'Coming',
  ],
  [
    'Experiments',
    'Small public tests with AI workflows, visual systems, and learning loops.',
    'View later',
  ],
];

function openAifaAssistant() {
  window.dispatchEvent(new Event("aifa-assistant-open"));
}

const aiProjects = [
  {
    title: 'The Pinky Promise',
    type: 'relationship ritual',
    summary:
      'A tiny promise-making experience for turning intent into something people can feel, remember, and come back to.',
    href: 'https://pinky-promises.lovable.app/#',
    image: '/assets/projects/pinky-promise.jpg',
    width: 1440,
    height: 2560,
    action: 'Open project',
  },
  {
    title: 'Gulpy',
    type: 'daily hydration companion',
    summary:
      'An intelligent, friendly hydration companion with personalized goals, AI-powered health insights, smart reminders, and Google Drive cloud sync.',
    href: 'https://github.com/balram66-aiforall/Gulpy',
    image: '/assets/projects/gulpy.jpg',
    width: 1122,
    height: 1402,
    action: 'View GitHub',
  },
  {
    title: 'Keats',
    type: 'mindful communication companion',
    summary:
      'A conversation companion inspired by John Keats and Negative Capability, built to move people beyond autopilot small talk into curiosity and wonder.',
    href: 'https://github.com/balram66-aiforall/Keats',
    image: '/assets/projects/keats.jpg',
    width: 1122,
    height: 1402,
    action: 'View GitHub',
  },
];

function useThemeMode() {
  return useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener("storage", onStoreChange);
      window.addEventListener("aifa-theme-change", onStoreChange);

      return () => {
        window.removeEventListener("storage", onStoreChange);
        window.removeEventListener("aifa-theme-change", onStoreChange);
      };
    },
    () => (window.localStorage.getItem(THEME_STORAGE_KEY) === "dark" ? "dark" : "light"),
    () => "light",
  ) as ThemeMode;
}

export default function Home() {
  const theme = useThemeMode();
  const [themePhase, setThemePhase] = useState<ThemePhase>("idle");

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.dataset.themePhase = themePhase;
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    window.dispatchEvent(new Event("aifa-theme-change"));

    const motionReduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (themePhase === "idle" || motionReduce) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setThemePhase("idle");
    }, 760);

    return () => window.clearTimeout(timeout);
  }, [theme, themePhase]);

  function toggleTheme() {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const nextTheme: ThemeMode = theme === "dark" ? "light" : "dark";

    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    window.dispatchEvent(new Event("aifa-theme-change"));

    if (reducedMotion) {
      setThemePhase("idle");
      return;
    }

    setThemePhase(nextTheme === "light" ? "to-light" : "to-dark");
  }

  return (
    <main className="site-shell" data-theme={theme} data-theme-phase={themePhase}>
      <div className="theme-wash" aria-hidden="true" />
      <div className="scroll-progress" aria-hidden="true" />
      <nav className="topbar" aria-label="Main navigation">
        <a className="brand" href="#top" aria-label="AI For All home">
          <span className="aifa-mark" aria-hidden="true">
            <span />
          </span>
          <span>AI For All</span>
        </a>
        <div className="nav-tools">
          <div className="nav-links">
            <a href="#learn">Learn</a>
            <a href="#guides">Guides</a>
            <a href="#community">Examples</a>
            <a href="#articles">Articles</a>
            <a href="#prompting-framework">CROFTC</a>
            <a href="#projects">Projects</a>
            <a href="#agent">AIFA</a>
            <a href="#contact">Contact</a>
          </div>
          <button
            type="button"
            className="theme-toggle"
            aria-pressed={theme === "light"}
            onClick={toggleTheme}
          >
            <span className="theme-toggle-icon" aria-hidden="true">
              {theme === "dark" ? <SunIcon /> : <MoonIcon />}
            </span>
            <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
          </button>
        </div>
      </nav>

      <section id="top" className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow">AI For All</p>
          <h1 className="identity-headline" aria-label="Balram becomes bAIram">
            <span className="name-morph" aria-hidden="true">
              <span className="name-base">Balram</span>
              <span className="name-final">
                b<span>AI</span>ram
              </span>
            </span>
          </h1>
          <p className="hero-lede">
            I make AI accessible. I break down useful AI for real work. I test
            the ideas first so others do not have to.
          </p>
          <div className="hero-actions" aria-label="Primary actions">
            <a className="button primary" href="#learn">
              Learn AI simply
            </a>
            <a className="button secondary" href="#guides">
              Browse guide previews
            </a>
            <button type="button" className="button secondary" onClick={openAifaAssistant}>
              Ask AIFA
            </button>
          </div>
          <p className="hero-note">
            Guide pages are still being built, so this section is a preview for
            now.
          </p>
        </div>

        <div className="hero-board" aria-label="AI teammate sketch board">
          <div className="board-header">
            <span>tested loop</span>
            <span className="live-dot">live</span>
          </div>
          <div className="sketch-scene">
            <picture>
              <source
                media="(max-width: 920px)"
                srcSet="/assets/aifa-teammate-charcoal-hero-mobile.png"
              />
              <img
                className="hero-sketch-image"
                src="/assets/aifa-teammate-charcoal-hero.jpg"
                width="1680"
                height="945"
                alt="Charcoal sketch of a human guide pointing at a planning board while AI For All sorts drafts into a shipped output."
                decoding="async"
                fetchPriority="high"
              />
            </picture>
          </div>
          <div className="board-grid">
            {teammateLoops.map(([number, title, text]) => (
              <article key={number} className="loop-card">
                <span>{number}</span>
                <h2>{title}</h2>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="ticker" aria-label="Portfolio themes">
        <span>AI For All</span>
        <span>Simple AI learning</span>
        <span>Role guides</span>
        <span>Community examples</span>
        <span>Practical AI help</span>
      </section>

      <section id="learn" className="content-section learning-section">
        <div className="section-heading">
          <p className="eyebrow">Learn AI simply</p>
          <h2>A clear path for people who want AI explained without the jargon.</h2>
        </div>
        <div className="learning-grid">
          {simpleLearningCards.map((card, index) => (
            <article className="learning-card" key={card.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{card.title}</h3>
              <p>{card.summary}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="guides" className="content-section guide-hub-section">
        <div className="section-heading">
          <p className="eyebrow">Role guides</p>
          <h2>Practical AI guides for the way corporate teams already work.</h2>
          <span className="section-status">Preview / coming soon</span>
        </div>
        <div className="guide-grid">
          {roleGuides.map((guide) => (
            <article className="guide-card" key={guide.slug}>
              <span>guide</span>
              <h3>{guide.title}</h3>
              <p>{guide.summary}</p>
              <ul>
                {guide.outcomes.map((outcome) => (
                  <li key={outcome}>{outcome}</li>
                ))}
              </ul>
              <a href={`/guides/${guide.slug}`}>Preview guide</a>
            </article>
          ))}
        </div>
        <p className="section-status-note">
          These role guides are live as previews while the fuller library gets
          built.
        </p>
      </section>

      <section id="training" className="content-section training-section">
        <div className="training-showcase">
          <div className="training-lead">
            <p className="eyebrow">AI training</p>
            <h2>Training people to use AI with clarity, judgment, and confidence.</h2>
            <p>
              AI For All is a practical learning system for people who want AI
              that fits the work they actually do. I teach the tools, explain
              the thinking, and show the workflow that makes it usable.
            </p>
            <div className="training-stat" aria-label="More than thirty five thousand people trained">
              <strong>35,000+</strong>
              <span>people trained through AI For All sessions, masterclasses, tool walkthroughs, and hands-on learning loops.</span>
            </div>
          </div>
          <figure className="training-visual">
            <picture>
              <source
                media="(max-width: 920px)"
                srcSet="/assets/aifa-training-charcoal-mobile.png"
              />
              <img
                src="/assets/aifa-training-charcoal-premium.jpg"
                width="1672"
                height="941"
                alt="Premium charcoal sketch of Balram teaching an AI training class with AI For All organizing context, examples, and output."
                loading="lazy"
                decoding="async"
              />
            </picture>
          </figure>
        </div>
        <div className="training-grid">
          {trainingLanes.map(([title, text, status]) => (
            <article className="training-card" key={title}>
              <span>{status}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
        <div className="training-proof">
          <p>Training signals from the work</p>
          <div>
            {trainingSignals.map((signal) => (
              <span key={signal}>{signal}</span>
            ))}
          </div>
        </div>
      </section>

      <section id="community" className="content-section community-section">
        <div className="section-heading">
          <p className="eyebrow">Examples from others</p>
          <h2>Curated work from the community, with a path to submit more later.</h2>
          <span className="section-status">Curated now</span>
        </div>
        <div className="community-grid">
          {communityExamples.map((example) => (
            <article className="community-card" key={example.title}>
              <span>{example.tag}</span>
              <h3>{example.title}</h3>
              <p>{example.summary}</p>
              <a href={example.href}>{example.byline}</a>
            </article>
          ))}
        </div>
      </section>

      <section
        id="shelf"
        className="content-section complete-shelf-section"
        aria-label="Working Volumes complete shelf"
      >
        <div className="shelf-copy">
          <p className="eyebrow">Working shelf</p>
          <h2>A shelf of the best tools, ideas, and patterns I have tested.</h2>
          <p>
            This is where the useful things land after I have tried them in
            real work. If it stays here, it earned its place.
          </p>
        </div>
        <ShelfEmbed />
      </section>

      <section id="articles" className="content-section articles-section">
        <div className="section-heading">
          <p className="eyebrow">Articles and notes</p>
          <h2>Breakdowns that help people use AI in real work.</h2>
        </div>
        <ArticleCarousel />
      </section>

      <section id="prompting-framework" className="content-section framework-section">
        <div className="section-heading">
          <p className="eyebrow">Prompting framework</p>
          <h2>CROFTC turns rough prompts into prompts that people can actually use.</h2>
          <span className="section-status">Live page</span>
        </div>
        <div className="framework-card">
          <div className="framework-copy">
            <p className="framework-intro">
              Context, Role, Objective, Format, Tone, and Constraints, wrapped
              into an interactive learning page with metrics, a rewriter, a
              builder, a quiz, and bilingual support.
            </p>
            <div className="framework-pills" aria-label="CROFTC letters">
              <span><strong>C</strong> Context</span>
              <span><strong>R</strong> Role</span>
              <span><strong>O</strong> Objective</span>
              <span><strong>F</strong> Format</span>
              <span><strong>T</strong> Tone</span>
              <span><strong>C</strong> Constraints</span>
            </div>
            <a className="button primary" href="/prompting-framework">
              Open CROFTC
            </a>
            <p className="section-status-note">
              This is the live learning page for anyone who wants a better
              prompting system without the fluff.
            </p>
          </div>
          <div className="framework-panel">
            <span>interactive</span>
            <strong>learn</strong>
            <span>build</span>
            <span>test</span>
          </div>
        </div>
      </section>

      <section id="path" className="content-section learning-section">
        <div className="section-heading">
          <p className="eyebrow">Learning path</p>
          <h2>A simple path from curious to capable.</h2>
        </div>
        <div className="learning-grid">
          {learningPaths.map(([title, text], index) => (
            <article className="learning-card" key={title}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="projects" className="content-section projects-section">
        <div className="section-heading">
          <p className="eyebrow">AI projects</p>
          <h2>Small products where AI becomes something people actually use.</h2>
          <span className="section-status">Live projects</span>
        </div>
        <div className="project-grid">
          {aiProjects.map((project) => (
            <article
              className={project.image ? 'project-card' : 'project-card text-led'}
              key={project.title}
            >
              {project.image ? (
                <figure>
                  <img
                    src={project.image}
                    width={project.width}
                    height={project.height}
                    alt={`${project.title} project artwork`}
                    loading="lazy"
                    decoding="async"
                  />
                </figure>
              ) : (
                <div className="project-placeholder" aria-hidden="true">
                  <span>promise</span>
                  <strong>pink</strong>
                  <span>ship</span>
                </div>
              )}
              <div className="project-copy">
                <p>{project.type}</p>
                <h3>{project.title}</h3>
                <span>{project.summary}</span>
                <a href={project.href}>{project.action}</a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="repos" className="content-section repo-section">
        <div className="section-heading">
          <p className="eyebrow">Agents and skills repo</p>
          <h2>Reusable pieces from the way I think and build with AI.</h2>
          <span className="section-status">In progress</span>
        </div>
        <div className="repo-grid">
          {repoItems.map(([title, text, status]) => (
            <article className="repo-card" key={title}>
              <span>{status}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="agent" className="content-section agent-section">
        <div className="section-heading">
          <p className="eyebrow">AIFA agent</p>
          <h2>A small assistant for AI questions, guide finding, and site help.</h2>
          <span className="section-status">Live beta</span>
        </div>
        <div className="agent-grid">
          <article className="agent-visual">
            <AifaMascot className="agent-mascot" />
            <div className="agent-visual-copy">
              <p>AIFA</p>
              <h3>Ask me about AI learning, role workflows, or the site.</h3>
              <span>
                I can answer simply, point you to the right section, or help you
                think through a practical next step.
              </span>
              <div className="agent-actions">
                <button type="button" className="button primary" onClick={openAifaAssistant}>
                  Open AIFA
                </button>
                <span>Public beta</span>
              </div>
            </div>
          </article>
          <div className="agent-notes">
            <article className="agent-note">
              <span>What it does</span>
              <p>Explains the site, points visitors to guides, and helps with simple AI questions.</p>
            </article>
            <article className="agent-note">
              <span>What it is not</span>
              <p>AIFA is not a full autonomous bot. It is a helpful public starting point with guardrails.</p>
            </article>
            <article className="agent-note">
              <span>Best use</span>
              <p>Ask for a clear next step, a guide recommendation, or help shaping practical AI work.</p>
            </article>
          </div>
        </div>
      </section>

      <section id="tips" className="content-section split-section">
        <div>
          <p className="eyebrow">Tips and tricks</p>
          <h2>
            Small moves that make AI feel less like a tool and more like a
            useful teammate.
          </h2>
        </div>
        <div className="tips-list">
          {tips.map((tip, index) => (
            <article key={tip} className="tip-row">
              <span>{String(index + 1).padStart(2, '0')}</span>
              <p>{tip}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="about" className="content-section about-section">
        <div className="about-copy">
          <p className="eyebrow">Who is Balram?</p>
          <h2>The human behind AI For All.</h2>
          <p>
            I make AI understandable, practical, and worth using. This site is
            the home for simple learning, role guides, real examples, workflows,
            and the lessons I keep learning from building with AI in public.
          </p>
        </div>
        <div className="proof-list" aria-label="Balram proof points">
          <span>AI learning leader</span>
          <span>Role-based guides</span>
          <span>Community examples</span>
          <span>Human judgment first</span>
        </div>
      </section>

      <section id="lab" className="content-section lab-section">
        <div className="lab-panel">
          <p className="eyebrow">The lab</p>
          <h2>What I keep collecting while I test and learn.</h2>
          <div className="lab-tags">
            <span>prompt systems</span>
            <span>AI teaching assets</span>
            <span>newsletter links</span>
            <span>article banners</span>
            <span>client-ready workflows</span>
            <span>usable templates</span>
          </div>
          <div className="collection-map" aria-label="Portfolio collection map">
            <span>articles</span>
            <span>tips</span>
            <span>workflows</span>
            <span>experiments</span>
          </div>
        </div>
        <div className="note-panel">
          <p>Next drop</p>
          <h3>The AI teammate brief</h3>
          <p>
            A simple pattern for turning a task into a repeatable collaboration
            between human taste and AI execution.
          </p>
          <a href="https://www.linkedin.com/newsletters/ai-for-all-weekly-newsletter-7401258096209088512/">
            Follow on LinkedIn
          </a>
        </div>
      </section>

      <section id="contact" className="content-section contact-section">
        <div className="contact-copy">
          <p className="eyebrow">Contact me</p>
          <h2>Want to build a site or talk about practical AI help?</h2>
          <p>
            Send a note when you want help making AI practical for yourself,
            your team, or a learning program. If you want a site built, a guide
            shaped, or AIFA adapted for your workflow, we can start there.
          </p>
        </div>
        <div className="contact-actions" aria-label="Contact links">
          <a className="contact-button whatsapp" href="https://wa.me/qr/3EZXUASKEW5RM1">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 3.3a8.4 8.4 0 0 0-7.2 12.7l-1 4 4.1-1A8.4 8.4 0 1 0 12 3.3Z" />
              <path d="M8.7 8.2c.2-.5.4-.5.7-.5h.6c.2 0 .4.1.5.4l.7 1.7c.1.2.1.4-.1.6l-.4.5c-.1.1-.2.3 0 .5.5.9 1.4 1.8 2.4 2.3.2.1.4.1.5-.1l.6-.7c.2-.2.4-.2.6-.1l1.7.8c.3.1.4.3.4.5 0 .8-.6 1.7-1.4 1.8-1.4.2-3.3-.5-5-2.2-1.7-1.7-2.6-3.5-2.5-4.8 0-.2 0-.4.1-.7Z" />
            </svg>
            <span>Talk AI with me on WhatsApp</span>
          </a>
          <a className="contact-button linkedin" href="https://in.linkedin.com/in/balramr66">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 8.8h3.3V19H5V8.8Zm1.7-4.9a1.9 1.9 0 1 1 0 3.8 1.9 1.9 0 0 1 0-3.8ZM10.1 8.8h3.1v1.4h.1c.4-.8 1.5-1.7 3.1-1.7 3.3 0 3.9 2.2 3.9 5V19H17v-4.9c0-1.2 0-2.7-1.6-2.7s-1.9 1.3-1.9 2.6v5h-3.3V8.8Z" />
            </svg>
            <span>Connect with me on LinkedIn</span>
          </a>
        </div>
      </section>

      <section className="newsletter-section" aria-label="AI For All newsletter">
        <p className="eyebrow">AI For All weekly</p>
        <h2>Follow the public notebook where tested AI ideas land first.</h2>
        <div className="final-actions">
          <a
            className="button primary"
            href="https://www.linkedin.com/newsletters/ai-for-all-weekly-newsletter-7401258096209088512/"
          >
            Open the newsletter
          </a>
        </div>
        <p className="contact-note">
          I try the ideas first, then I share the ones that are worth your
          time.
        </p>
      </section>
    </main>
  );
}
