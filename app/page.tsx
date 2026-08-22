const featuredArticles = [
  {
    label: 'LinkedIn article',
    title: 'How I think with AI now',
    excerpt:
      'A practical look at moving from prompt tricks to context, judgment, and repeatable output systems.',
    meta: '8 min read',
  },
  {
    label: 'Field note',
    title: 'Human judgment, AI execution',
    excerpt:
      'What belongs with the person, what belongs with the model, and where the handoff gets interesting.',
    meta: 'Drafting',
  },
  {
    label: 'Workflow',
    title: 'The teammate brief',
    excerpt:
      'A reusable structure for giving AI enough role, context, taste, constraints, and exit criteria.',
    meta: 'Template',
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

      <section id="writing" className="content-section writing-section">
        <div className="section-heading">
          <p className="eyebrow">Publishing stream</p>
          <h2>Articles, notes, and ideas worth returning to.</h2>
        </div>
        <div className="article-grid">
          {featuredArticles.map((article) => (
            <article className="article-card" key={article.title}>
              <p>{article.label}</p>
              <h3>{article.title}</h3>
              <span>{article.meta}</span>
              <p>{article.excerpt}</p>
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
