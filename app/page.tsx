/* eslint-disable @next/next/no-img-element -- Vinext's next/image shim breaks hydration. */
import { ArticleCarousel } from "./components/ArticleCarousel";
import { ShelfEmbed } from "./components/ShelfEmbed";

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

export default function Home() {
  return (
    <main className="site-shell">
      <div className="scroll-progress" aria-hidden="true" />
      <nav className="topbar" aria-label="Main navigation">
        <a className="brand" href="#top" aria-label="AI For All home">
          <span className="aifa-mark" aria-hidden="true">
            <span />
          </span>
          <span>AI For All</span>
        </a>
        <div className="nav-links">
          <a href="#shelf">Shelf</a>
          <a href="#articles">Articles</a>
          <a href="#training">Training</a>
          <a href="#learn">Learn</a>
          <a href="#projects">Projects</a>
          <a href="#repos">Repos</a>
          <a href="#about">About</a>
          <a href="#lab">Lab</a>
          <a href="#contact">Contact</a>
        </div>
      </nav>

      <section id="top" className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow">AI For All / Treasure AI</p>
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
            the ideas first so other people do not have to.
          </p>
          <div className="hero-actions" aria-label="Primary actions">
            <a
              className="button primary"
              href="https://www.linkedin.com/newsletters/ai-for-all-weekly-newsletter-7401258096209088512/"
            >
              Read the notebook
            </a>
            <a className="button secondary" href="#articles">
              See what works
            </a>
          </div>
        </div>

        <div className="hero-board" aria-label="AI teammate sketch board">
          <div className="board-header">
            <span>tested loop</span>
            <span className="live-dot">live</span>
          </div>
          <div className="sketch-scene">
            <img
              className="hero-sketch-image"
              src="/assets/aifa-teammate-charcoal-hero.jpg"
              width="1680"
              height="945"
              alt="Charcoal sketch of a human guide pointing at a planning board while AI For All sorts drafts into a shipped output."
              decoding="async"
              fetchPriority="high"
            />
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
        <span>Treasure AI</span>
        <span>AI, made usable.</span>
        <span>human judgment</span>
        <span>AI execution</span>
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
            <img
              src="/assets/aifa-training-charcoal-premium.jpg"
              width="1672"
              height="941"
              alt="Premium charcoal sketch of Balram teaching an AI training class with AI For All organizing context, examples, and output."
              loading="lazy"
              decoding="async"
            />
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

      <section
        id="shelf"
        className="content-section complete-shelf-section"
        aria-label="Working Volumes complete shelf"
      >
          <div className="shelf-copy">
          <p className="eyebrow">Treasure AI shelf</p>
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

      <section id="learn" className="content-section learning-section">
        <div className="section-heading">
          <p className="eyebrow">Learn AI</p>
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
            the home for my writing, experiments, workflows, and the lessons I
            keep learning from building with AI in public.
          </p>
        </div>
        <div className="proof-list" aria-label="Balram proof points">
          <span>AI learning leader</span>
          <span>AI For All newsletter</span>
          <span>Practical workflows</span>
          <span>Human judgment first</span>
        </div>
      </section>

      <section id="lab" className="content-section lab-section">
        <div className="lab-panel">
          <p className="eyebrow">The lab</p>
          <h2>What Treasure AI keeps collecting.</h2>
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
          <h2>Want to talk about AI training, workflows, agents, or skills?</h2>
          <p>
            Send a note when you want help making AI practical for yourself,
            your team, or a learning program. We can start with the messy
            version and turn it into something usable.
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
