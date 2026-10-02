"use client";

/* eslint-disable @next/next/no-img-element -- Vinext's next/image shim breaks hydration. */
import { motion } from "framer-motion";
import { AgentCursor } from "./components/AgentCursor";
import { ArticleCarousel } from "./components/ArticleCarousel";
import { AifaOpenButton } from "./components/AifaOpenButton";
import { AifaMascot } from "./components/AifaMascot";
import { ThemeShell } from "./components/ThemeShell";
import { simpleLearningCards } from "./site-content";
import { ShelfEmbed } from "./components/ShelfEmbed";
import { RoleWorkbench } from "./components/RoleWorkbench";
import { TeammateLoop } from "./components/TeammateLoop";

const tips = [
  'Start with the outcome you need, not the prompt you want to write.',
  'Show AI examples of good work. It learns taste faster than adjectives.',
  'Ask for options first, then have it pressure-test the safest answer.',
  'Keep a swipe file of prompts, bad outputs, and the fixes that worked.',
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

const aiProjects = [
  {
    title: 'The Pinky Promise',
    type: 'relationship ritual',
    summary:
      'A tiny promise-making experience for turning intent into something people can feel, remember, and come back to.',
    href: 'https://pinky-promises.lovable.app/#',
    image: '/assets/projects/pinky-promise-1000.webp',
    smallImage: '/assets/projects/pinky-promise-640.webp',
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
    image: '/assets/projects/gulpy-1000.webp',
    smallImage: '/assets/projects/gulpy-640.webp',
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
    image: '/assets/projects/keats-1000.webp',
    smallImage: '/assets/projects/keats-640.webp',
    width: 1122,
    height: 1402,
    action: 'View GitHub',
  },
];

export default function Home() {
  return (
    <ThemeShell>
      <section id="top" className="hero-section" style={{ position: 'relative', overflow: 'hidden' }}>
        <AgentCursor
          name="Agent Copy"
          color="var(--orange)"
          initial={{ x: -100, y: 50, opacity: 0 }}
          animate={{
            x: ["-10vw", "10vw", "40vw", "80vw", "120vw"],
            y: [50, 150, 200, 200, -200],
            opacity: [0, 1, 1, 1, 0]
          }}
          transition={{ duration: 4, times: [0, 0.2, 0.5, 0.8, 1], ease: "easeInOut", delay: 0.5 }}
        />
        <AgentCursor
          name="Agent Design"
          color="var(--blue)"
          initial={{ x: "120vw", y: 300, opacity: 0 }}
          animate={{
            x: ["120vw", "60vw", "20vw", "-10vw"],
            y: [300, 300, 400, 600],
            opacity: [0, 1, 1, 0]
          }}
          transition={{ duration: 3.5, times: [0, 0.3, 0.7, 1], ease: "easeInOut", delay: 2 }}
        />
        <div className="hero-copy">
          <motion.p
            className="eyebrow"
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            transition={{ duration: 0.5, delay: 1 }}
            style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}
          >
            Balram / AI lead, educator, builder
          </motion.p>
          <motion.h1
            className="identity-headline"
            aria-label="Balram becomes bAIram"
            initial={{ opacity: 0, filter: "blur(10px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.8, delay: 1.5 }}
          >
            <span className="name-morph" aria-hidden="true">
              <span className="name-base">Balram</span>
              <span className="name-final">
                b<span>AI</span>ram
              </span>
            </span>
          </motion.h1>
          <motion.p
            className="hero-lede"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 2 }}
          >
            I make AI accessible. Learn it simply. Put it to work.
            Build something that matters.
          </motion.p>
          <motion.div
            className="hero-actions"
            aria-label="Primary actions"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 3, type: "spring" }}
          >
            <a className="button primary" href="#learn">
              Learn AI simply
            </a>
            <a className="button secondary" href="#guides">
              Find your workflow
            </a>
            <AifaOpenButton className="button secondary">
              Ask AIFA
            </AifaOpenButton>
          </motion.div>
          <p className="hero-note">
            35,000+ people trained. Practical lessons from teaching and building with AI.
          </p>
        </div>

        <div className="hero-board" aria-label="AI teammate sketch board">
          <div className="board-header">
            <span>The teammate loop</span>
            <span className="live-dot">Human + AI</span>
          </div>
          <div className="sketch-scene">
            <picture>
              <source
                media="(max-width: 640px)"
                srcSet="/assets/aifa-teammate-charcoal-hero-mobile.webp"
              />
              <img
                className="hero-sketch-image"
                src="/assets/aifa-teammate-charcoal-hero.webp"
                width="1680"
                height="945"
                alt="Charcoal sketch of a human guide pointing at a planning board while AI For All sorts drafts into a shipped output."
                decoding="async"
                fetchPriority="high"
              />
            </picture>
          </div>
          <TeammateLoop />
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
            <motion.article
              className="learning-card"
              key={card.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true, margin: "-50px" }}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{card.title}</h3>
              <p>{card.summary}</p>
              <a className="learning-action" href={["/prompting-framework#deepdive", "/prompting-framework#builder", "/guides"][index]}>{["Learn the fundamentals", "Build a better prompt", "Find a role guide"][index]}</a>
            </motion.article>
          ))}
        </div>
      </section>

      <section id="guides" className="content-section guide-hub-section">
        <div className="section-heading">
          <p className="eyebrow">Role guides</p>
          <h2>Your work. A more useful way to do it.</h2>
        </div>
        <RoleWorkbench />
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
                media="(max-width: 640px)"
                srcSet="/assets/aifa-training-charcoal-mobile.webp"
              />
              <img
                src="/assets/aifa-training-charcoal-premium.webp"
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
          {trainingLanes.map(([title, text, status], index) => (
            <motion.article
              className="training-card"
              key={title}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
            >
              <span>{status}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </motion.article>
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
        <div className="training-actions"><a className="button primary" href="#contact">Plan a training session</a><a className="learning-action" href="https://in.linkedin.com/in/balramr66">Follow my teaching and work</a></div>
      </section>

      <section id="community" className="content-section community-section">
        <div className="section-heading">
          <p className="eyebrow">Examples from others</p>
          <h2>Good work deserves company.</h2>
          <span className="section-status">Inviting first submissions</span>
        </div>
        <div className="community-invitation"><p>Built a useful AI workflow, a small product, or a lesson others can learn from? Share the problem, what you made, and a link. Selected work will appear here with its creator credited.</p><a className="button secondary" href="https://wa.me/qr/3EZXUASKEW5RM1">Share your work with Balram</a></div>
      </section>

      <section
        id="shelf"
        className="content-section complete-shelf-section"
        aria-label="Working Volumes complete shelf"
      >
        <div className="shelf-copy">
          <p className="eyebrow">Working shelf</p>
          <h2>Seven tools. One working shelf.</h2>
          <p>
            Explore an interactive bookshelf of tools for design, writing, and
            building. A little space for the craft behind the work.
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

      <section id="school-of-aifa" className="content-section framework-section">
        <div className="section-heading">
          <p className="eyebrow">The School of AIFA</p>
          <h2>Better prompts start with clearer thinking.</h2>
          <span className="section-status">Learning path</span>
        </div>
        <div className="framework-card">
          <div className="framework-copy">
            <p className="framework-intro">
              Context, Role, Objective, Format, Tone, and Constraints, wrapped
              into an interactive learning page with a rewriter, a builder, a
              quiz, and practical examples.
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
              Start with a rough prompt. Leave with a brief you can actually use.
            </p>
          </div>
          <div className="framework-panel">
            <span>school</span>
            <strong>aifa</strong>
            <span>learn</span>
            <span>ship</span>
          </div>
        </div>
      </section>

      <section id="projects" className="content-section projects-section">
        <div className="section-heading">
          <p className="eyebrow">AI projects</p>
          <h2>Small products where AI becomes something people actually use.</h2>
          <span className="section-status">Try the app / explore the code</span>
        </div>
        <div className="project-grid">
          {aiProjects.map((project) => (
            <motion.article
              className={project.image ? 'project-card' : 'project-card text-led'}
              key={project.title}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              {project.image ? (
                <figure>
                  <img
                    src={project.image}
                    srcSet={`${project.smallImage} 640w, ${project.image} 1000w`}
                    sizes="(max-width: 640px) calc(100vw - 36px), (max-width: 920px) 40vw, 360px"
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
            </motion.article>
          ))}
        </div>
      </section>

      <section id="repos" className="content-section repo-section">
        <div className="section-heading">
          <p className="eyebrow">The resource bench</p>
          <h2>Take a useful starting point with you.</h2>
        </div>
        <div className="resource-links">
          <article><p className="eyebrow">Prompt templates</p><h3>A clearer brief</h3><p>Build a prompt around context, role, objective, format, tone, and constraints.</p><a href="/prompting-framework#builder">Open the prompt builder</a></article>
          <article><p className="eyebrow">Agents and skills</p><h3>Tools need direction</h3><p>Understand how MCP connects tools and how skill.md guides their use before designing your own assistant.</p><a href="https://www.linkedin.com/pulse/mcp-vs-skillmd-whats-difference-why-you-need-both-balram-r-42l0c">Read the practical breakdown</a></article>
          <article><p className="eyebrow">Open source</p><h3>Look under the hood</h3><p>Explore the code behind Gulpy and Keats, plus the projects I share as I build.</p><a href="https://github.com/balram66-aiforall">Explore my repositories</a></article>
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
                <AifaOpenButton className="button primary">
                  Open AIFA
                </AifaOpenButton>
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
            I am Balram, an AI lead, educator, and builder. I help people turn
            curiosity into confidence through practical training, clear explanations,
            and hands-on projects. AI For All brings those lessons together so
            you can find a useful starting point for your own work.
          </p>
        </div>
        <div className="proof-list" aria-label="Balram proof points">
          <span>AI learning leader</span>
          <span>Role-based guides</span>
          <span>Community examples</span>
          <span>Human judgment first</span>
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
    </ThemeShell>
  );
}
