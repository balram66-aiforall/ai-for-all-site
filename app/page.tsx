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

export default function Home() {
  return (
    <main className="site-shell">
      <nav className="topbar" aria-label="Main navigation">
        <a className="brand" href="#top" aria-label="AIFA home">
          <span className="aifa-mark" aria-hidden="true">
            <span />
          </span>
          <span>AIFA</span>
        </a>
        <div className="nav-links">
          <a href="#shelf">Shelf</a>
          <a href="#articles">Articles</a>
          <a href="#learn">Learn</a>
          <a href="#repos">Repos</a>
          <a href="#about">About</a>
          <a href="#lab">Lab</a>
          <a href="https://www.linkedin.com/newsletters/ai-for-all-weekly-newsletter-7401258096209088512/">
            LinkedIn
          </a>
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

      <section className="newsletter-section" aria-label="AI For All newsletter">
        <p className="eyebrow">AI For All weekly</p>
        <h2>Follow the public notebook where bAIram keeps learning out loud.</h2>
        <div className="final-actions">
          <a className="button primary" href="https://www.linkedin.com/newsletters/ai-for-all-weekly-newsletter-7401258096209088512/">
            Open the newsletter
          </a>
          <a className="button secondary" href="https://wa.me/qr/3EZXUASKEW5RM1">
            Talk AI with me on WhatsApp
          </a>
        </div>
        <p className="contact-note">
          Have a question about AI learning, workflows, agents, skills, or
          training? Send a note and we can start with the messy version.
        </p>
      </section>
    </main>
  );
}
