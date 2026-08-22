const shelfVolumes = [
  {
    roman: 'I',
    title: 'Context',
    label: 'what matters',
    note: 'Inputs, constraints, examples, and taste before the model writes.',
  },
  {
    roman: 'II',
    title: 'Prompts',
    label: 'clear asks',
    note: 'Reusable briefs for research, writing, planning, and critique.',
  },
  {
    roman: 'III',
    title: 'Research',
    label: 'useful signal',
    note: 'Ways to turn open tabs, notes, and sources into a clean position.',
  },
  {
    roman: 'IV',
    title: 'Drafts',
    label: 'rough output',
    note: 'First passes, outlines, article starts, and alternate angles.',
  },
  {
    roman: 'V',
    title: 'Systems',
    label: 'repeatable loops',
    note: 'Personal operating systems for creating with an AI teammate.',
  },
  {
    roman: 'VI',
    title: 'Voice',
    label: 'human taste',
    note: 'Corrections, examples, and judgment that keep the work yours.',
  },
  {
    roman: 'VII',
    title: 'Ship',
    label: 'public proof',
    note: 'LinkedIn articles, tips, visuals, and finished artifacts.',
  },
];

const tips = [
  'Start with the decision you need, not the prompt you want to write.',
  'Give AI examples of taste. It follows patterns better than adjectives.',
  'Ask for options first, then ask it to argue against the comfortable one.',
  'Keep a personal swipe file of prompts, bad outputs, and corrections.',
];

const teammateLoops = [
  ['01', 'Frame', 'Turn messy intent into a sharp brief.'],
  ['02', 'Draft', 'Generate options, structures, and first passes.'],
  ['03', 'Judge', 'Compare output against taste, context, and truth.'],
  ['04', 'Ship', 'Package the work for LinkedIn, teams, or clients.'],
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
          <a href="#writing">Writing</a>
          <a href="#tips">Tips</a>
          <a href="#lab">Lab</a>
          <a href="https://www.linkedin.com/newsletters/ai-for-all-weekly-newsletter-7401258096209088512/">
            LinkedIn
          </a>
        </div>
      </nav>

      <section id="top" className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow">AI teammate portfolio</p>
          <h1>Building public proof that AI can work like a teammate.</h1>
          <p className="hero-lede">
            A living home for articles, field notes, prompts, teaching systems,
            and the practical experiments behind AI for All.
          </p>
          <div className="hero-actions" aria-label="Primary actions">
            <a className="button primary" href="#writing">
              Read the latest
            </a>
            <a className="button secondary" href="#tips">
              Steal a useful tip
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
        <span>AI, made usable.</span>
        <span>LinkedIn essays</span>
        <span>teaching notes</span>
        <span>workflow recipes</span>
        <span>human judgment</span>
      </section>

      <section id="writing" className="content-section shelf-section">
        <div className="section-heading">
          <p className="eyebrow">Complete shelf</p>
          <h2>Seven working volumes for thinking with an AI teammate.</h2>
        </div>
        <div className="shelf-stage" aria-label="AIFA working volumes">
          <div className="shelf-rail" aria-hidden="true" />
          <div className="volume-row">
            {shelfVolumes.map((volume, index) => (
              <article
                className="volume-book"
                key={volume.title}
                data-volume={index + 1}
              >
                <span className="volume-number">Volume {volume.roman}</span>
                <h3>{volume.title}</h3>
                <p className="volume-label">{volume.label}</p>
                <p className="volume-note">{volume.note}</p>
                <span className="volume-mark" aria-hidden="true" />
              </article>
            ))}
          </div>
          <div className="shelf-caption">
            <span>open a volume</span>
            <span>collect the lesson</span>
            <span>ship the idea</span>
          </div>
        </div>
        <div className="article-grid compact-writing">
          <article className="article-card">
            <p>LinkedIn article</p>
            <h3>How I think with AI now</h3>
            <span>8 min read</span>
            <p>
              From prompt tricks to context, judgment, and repeatable output
              systems.
            </p>
          </article>
          <article className="article-card">
            <p>Field note</p>
            <h3>Human judgment, AI execution</h3>
            <span>Drafting</span>
            <p>
              What belongs with the person, what belongs with the model, and
              where the handoff gets interesting.
            </p>
          </article>
          <article className="article-card">
            <p>Workflow</p>
            <h3>The teammate brief</h3>
            <span>Template</span>
            <p>
              A reusable structure for role, context, taste, constraints, and
              exit criteria.
            </p>
          </article>
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
    </main>
  );
}
