import { ArticleCarousel } from "./components/ArticleCarousel";

const tips = [
  'Start with the decision you need, not the prompt you want to write.',
  'Give AI examples of taste. It follows patterns better than adjectives.',
  'Ask for options first, then ask it to argue against the comfortable one.',
  'Keep a personal swipe file of prompts, bad outputs, and corrections.',
];

const learningPaths = [
  ['Start', 'Understand what AI is good at, where it fails, and how to ask better questions.'],
  ['Think', 'Use AI to reason, compare options, pressure-test ideas, and organize messy context.'],
  ['Build', 'Turn prompts into workflows, reusable systems, assistants, and useful artifacts.'],
  ['Ship', 'Publish articles, lessons, visuals, and work that makes your thinking visible.'],
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
    'Make AI understandable for beginners, non-technical teams, and people who need confidence before tools.',
    'start here',
  ],
  [
    'Tools',
    'Teach people how to use AI assistants, product features, and daily work tools with clear judgment.',
    'hands-on',
  ],
  [
    'Workflows',
    'Turn scattered prompting into repeatable systems for research, writing, planning, review, and output.',
    'practice',
  ],
  [
    'Agents',
    'Help teams understand agentic work, context, skills, MCPs, and when AI should move work forward.',
    'next wave',
  ],
];

const trainingSignals = [
  '35,000+ people trained',
  'AI For All initiative',
  'Generative AI workshops',
  'Tool walkthroughs',
  'Non-technical enablement',
  'Prompting with context',
  'Agentic workflow learning',
];

const repoItems = [
  [
    'Agents',
    'Reusable AI teammates for research, writing, planning, review, and shipping.',
    'open soon',
  ],
  [
    'Skills',
    'Skill.md patterns that teach AI how Balram thinks, decides, and delivers.',
    'building',
  ],
  [
    'Templates',
    'Briefs, prompt systems, checklists, and operating rhythms people can reuse.',
    'coming',
  ],
  [
    'Experiments',
    'Small public tests with AI workflows, visual systems, and learning loops.',
    'view later',
  ],
];

const aiProjects = [
  {
    title: 'The Pinky Promise',
    type: 'relationship ritual',
    summary:
      'A tiny promise-making experience for turning intent into something people can feel, remember, and come back to.',
    href: 'https://pinky-promises.lovable.app/#',
    image: '/assets/projects/pinky-promise.png',
    action: 'Open project',
  },
  {
    title: 'Gulpy',
    type: 'daily hydration companion',
    summary:
      'An intelligent, friendly hydration companion with personalized goals, AI-powered health insights, smart reminders, and Google Drive cloud sync.',
    href: 'https://github.com/balram66-aiforall/Gulpy',
    image: '/assets/projects/gulpy.png',
    action: 'View GitHub',
  },
  {
    title: 'Keats',
    type: 'mindful communication companion',
    summary:
      'A conversation companion inspired by John Keats and Negative Capability, built to move people beyond autopilot small talk into curiosity and wonder.',
    href: 'https://github.com/balram66-aiforall/Keats',
    image: '/assets/projects/keats.png',
    action: 'View GitHub',
  },
];

export default function Home() {
  return (
    <main className="site-shell">
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
          <p className="eyebrow">Balram / AI For All</p>
          <h1 className="identity-headline" aria-label="Balram becomes bAIram">
            <span className="name-morph" aria-hidden="true">
              <span className="name-base">Balram</span>
              <span className="name-final">
                b<span>AI</span>ram
              </span>
            </span>
          </h1>
          <p className="hero-lede">
            I help people turn AI from a tool they try into a teammate they can
            use with judgment, taste, and confidence.
          </p>
          <div className="hero-actions" aria-label="Primary actions">
            <a className="button primary" href="https://www.linkedin.com/newsletters/ai-for-all-weekly-newsletter-7401258096209088512/">
              Read AI For All
            </a>
            <a className="button secondary" href="#articles">
              Browse articles
            </a>
          </div>
        </div>

        <div className="hero-board" aria-label="AI teammate sketch board">
          <div className="board-header">
            <span>teammate loop</span>
            <span className="live-dot">live</span>
          </div>
          <div className="sketch-scene">
            <img
              className="hero-sketch-image"
              src="/assets/aifa-teammate-charcoal-hero.png"
              width="1680"
              height="945"
              alt="Charcoal sketch of a human guide pointing at a planning board while AIFA sorts drafts into a shipped output."
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
        <span>Balram to bAIram</span>
        <span>AI, made usable.</span>
        <span>AI For All</span>
        <span>human judgment</span>
        <span>AI execution</span>
      </section>

      <section id="training" className="content-section training-section">
        <div className="training-showcase">
          <div className="training-lead">
            <p className="eyebrow">AI training</p>
            <h2>Training people to use AI with clarity, judgment, and confidence.</h2>
            <p>
              AIFA is not just content. It is a practical learning system for
              helping people understand AI, use the right tools, and build habits
              they can carry into real work.
            </p>
            <div className="training-stat" aria-label="More than thirty five thousand people trained">
              <strong>35,000+</strong>
              <span>people trained through AI For All sessions, masterclasses, tool walkthroughs, and hands-on learning loops.</span>
            </div>
          </div>
          <figure className="training-visual" aria-label="Charcoal sketch of Balram training people in a class">
            <svg viewBox="0 0 760 520" role="img" aria-labelledby="trainingVisualTitle">
              <title id="trainingVisualTitle">Balram teaching an AI training class with AIFA helping at the board</title>
              <rect className="tv-bg" x="0" y="0" width="760" height="520" />
              <path className="tv-frame" d="M33 34 H728 V484 H34 Z" />
              <path className="tv-board" d="M248 92 H694 V324 H250 Z" />
              <path className="tv-line" d="M286 138 H470 M286 180 H610 M286 222 H550" />
              <path className="tv-blue" d="M524 135 h95 M524 176 h108 M524 217 h74" />
              <path className="tv-orange" d="M296 280 C366 250 445 252 516 279 S617 303 666 272" />
              <text className="tv-label" x="283" y="72">AI training</text>
              <text className="tv-label tv-orange-text" x="548" y="306">practice</text>
              <text className="tv-label tv-blue-text" x="555" y="119">context</text>

              <path className="tv-human" d="M144 153 c24 -34 70 -23 78 14 c8 37 -21 61 -52 55 c-32 -5 -47 -39 -26 -69 Z" />
              <path className="tv-human" d="M170 222 c-30 22 -48 60 -47 105 l2 92 M174 232 c45 20 70 55 76 103 M152 287 c-27 17 -52 39 -76 67 M224 291 c35 -8 72 -25 112 -51" />
              <path className="tv-human" d="M125 419 c-14 21 -27 37 -40 50 M205 419 c10 22 27 38 50 50" />
              <path className="tv-face" d="M158 177 h1 M186 176 h1 M164 199 c10 7 22 7 35 0" />

              <path className="tv-desk" d="M50 405 H710" />
              <path className="tv-aifa" d="M610 354 c-34 0 -55 20 -58 59 c-4 45 21 70 66 70 c42 0 65 -24 62 -69 c-3 -38 -29 -60 -70 -60 Z" />
              <path className="tv-aifa-leg" d="M594 482 v18 M641 482 v18" />
              <circle className="tv-eye" cx="600" cy="404" r="4" />
              <circle className="tv-eye" cx="627" cy="404" r="4" />
              <path className="tv-aifa-arm" d="M554 425 c-24 -13 -46 -26 -69 -36 M676 424 c18 -11 33 -24 46 -41" />
              <text className="tv-label" x="590" y="345">AIFA</text>

              <path className="tv-student" d="M93 365 c4 -31 48 -31 52 0 M84 399 c22 -20 50 -19 73 0" />
              <path className="tv-student" d="M244 367 c4 -32 50 -32 54 0 M236 401 c24 -20 55 -20 78 0" />
              <path className="tv-student" d="M371 371 c4 -30 46 -30 51 0 M362 403 c22 -19 50 -19 70 0" />
              <path className="tv-small-line" d="M72 456 h103 M221 456 h112 M352 456 h101" />
              <text className="tv-label tv-blue-text" x="78" y="446">teams</text>
              <text className="tv-label tv-orange-text" x="231" y="446">tools</text>
              <text className="tv-label" x="363" y="446">workflows</text>
            </svg>
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
          <p className="eyebrow">Working volumes</p>
          <h2>A living shelf for the tools and ideas that shape the work.</h2>
          <p>
            Browse the authored bookshelf inside the portfolio, then keep
            moving through the page when you are done exploring.
          </p>
        </div>
        <div className="complete-shelf-window">
          <iframe
            className="complete-shelf-frame"
            title="Working Volumes — Seven Tools for Making"
            src="/landing-pages/complete-shelf-v2.html"
            sandbox="allow-downloads allow-forms allow-modals allow-popups allow-same-origin allow-scripts"
            loading="eager"
          />
        </div>
      </section>

      <section id="articles" className="content-section articles-section">
        <div className="section-heading">
          <p className="eyebrow">Articles and notes</p>
          <h2>LinkedIn writing for people learning to think with AI.</h2>
        </div>
        <ArticleCarousel />
      </section>

      <section id="learn" className="content-section learning-section">
        <div className="section-heading">
          <p className="eyebrow">Learn AI</p>
          <h2>A practical path from curiosity to confident AI work.</h2>
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
          <h2>Small products where AI becomes a daily companion.</h2>
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
                    alt={`${project.title} project artwork`}
                    loading="lazy"
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
            capable collaborator.
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
            I build learning systems, explain AI in plain language, and help
            people use AI with more confidence at work. This site is the home
            for my writing, experiments, workflows, and lessons from building
            with AI in public.
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
          <h2>What this portfolio will keep collecting.</h2>
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
        <h2>Follow the public notebook where bAIram keeps learning out loud.</h2>
        <div className="final-actions">
          <a className="button primary" href="https://www.linkedin.com/newsletters/ai-for-all-weekly-newsletter-7401258096209088512/">
            Open the newsletter
          </a>
        </div>
        <p className="contact-note">
          Read the articles, follow the weekly notes, and come back when you
          want practical AI patterns you can actually use.
        </p>
      </section>
    </main>
  );
}
