/* eslint-disable @next/next/no-img-element -- Vinext's next/image shim breaks hydration. */
import type { ReactNode } from 'react';
import { ArticleCarousel } from '../../components/ArticleCarousel';
import { simpleLearningCards } from '../../site-content';
import { about, titles, aiProjects, chapters, learningLinks, signal, startHere, tips, trainingLanes, trainingSignals } from './content';
import { SignalSky } from './signal';

/* Who is Balram? and chambers 01, 04, 05 and 06. Every visible line is Balram's live home-page copy or text he approved (content.ts); only the chapter names are new.
   Each chamber is a plain block in normal flow, so the page reads top to bottom without JavaScript. */

type Chapter = (typeof chapters)[number];
const chapter = (id: Chapter['id']) => chapters.find(c => c.id === id)!;

// AI-suit is one coined word: never let it break at its hyphen.
const keep = (text: string) => text.split('AI-suit').flatMap((part, i) => (i ? [<span key={i} className="bj-keep">AI-suit</span>, part] : [part]));

// A small play mark for the video, a stacked-pages mark for the courses (no embeds: a plain link out).
function StartMark({ kind }: { kind: 'video' | 'course' }) {
  return kind === 'video'
    ? <svg className="bj-start-mark" viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="5.5" width="19" height="13" rx="3.5" fill="currentColor" /><path d="M10 9.2v5.6l4.8-2.8Z" fill="#101216" /></svg>
    : <svg className="bj-start-mark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M4 6.5 12 3l8 3.5-8 3.5Z" /><path d="m4 11.5 8 3.5 8-3.5M4 16.5 12 20l8-3.5" /></svg>;
}

function Arrow() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" /></svg>; }

function Chamber({ id, tone, children }: { id: Chapter['id']; tone: string; children: ReactNode }) {
  const { n, name } = chapter(id);
  return <div className="bj-chamber bj-stone" data-chamber={id} data-tone={tone}>
    {/* Placeholder stone until the chamber's artwork is approved (Phase 2). */}
    <p className="bj-pending" aria-hidden="true">Art pending</p>
    <div className="bj-room">
      <p className="bj-chapter"><span className="bj-num">{n}</span><span>{name}</span></p>
      {children}
    </div>
  </div>;
}

function Block({ id, kicker, title, status, children }: { id: string; kicker: string; title: ReactNode; status?: string; children: ReactNode }) {
  return <section className="bj-block" id={id} aria-labelledby={`${id}-title`}>
    <header className="bj-block-head">
      <p className="bj-kicker">{kicker}</p>
      <h2 id={`${id}-title`}>{title}</h2>
      {status && <p className="bj-status">{status}</p>}
    </header>
    {children}
  </section>;
}

export function LearningDeck() {
  return <Chamber id="learn" tone="deck">
    <Block id="bj-paths" kicker="Learn AI simply" title="A clear path for people who want AI explained without the jargon.">
      <div className="bj-cards bj-cards-3">
        {simpleLearningCards.map((card, index) => <article className="bj-card" key={card.title}>
          <span className="bj-card-num">{String(index + 1).padStart(2, '0')}</span>
          <h3>{card.title}</h3>
          <p>{card.summary}</p>
          {learningLinks[index][0]
            ? <a className="bj-link" href={learningLinks[index][0]} target="_blank" rel="noopener noreferrer">{learningLinks[index][1]} <Arrow /><span className="bj-sr"> (opens in a new tab)</span></a>
            : <p className="bj-soon">{learningLinks[index][1]} <span>Coming soon</span></p>}
        </article>)}
      </div>
      <ul className="bj-start" aria-label="Where to start">
        {startHere.map(item => <li className="bj-card bj-start-card" key={item.href} data-kind={item.kind}>
          <p className="bj-start-label"><StartMark kind={item.kind} />{item.label}</p>
          <h3>{item.title}</h3>
          <p>{item.by}</p>
          <a className="bj-link" href={item.href} target="_blank" rel="noopener noreferrer">{item.action} <Arrow /><span className="bj-sr"> (opens in a new tab)</span></a>
        </li>)}
      </ul>
    </Block>
    <Block id="guides" kicker="Role guides" title="Your work. A more useful way to do it." status="Coming soon">{null}</Block>
    <Block id="articles" kicker="Articles and notes" title="Breakdowns that help people use AI in real work.">
      <div className="bj-carousel"><ArticleCarousel /></div>
    </Block>
    <Block id="tips" kicker="Tips and tricks" title="Small moves that make AI feel less like a tool and more like a useful teammate.">
      <ol className="bj-tips">
        {tips.map((tip, index) => <li key={tip}><span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><p>{tip}</p></li>)}
      </ol>
    </Block>
  </Chamber>;
}

export function MissionRoom() {
  return <Chamber id="training" tone="mission">
    <Block id="bj-training" kicker="AI training" title="Training people to use AI with clarity, judgment, and confidence.">
      <div className="bj-mission">
        <p className="bj-lead">AI For All is a practical learning system for people who want AI that fits the work they actually do. I teach the tools, explain the thinking, and show the workflow that makes it usable.</p>
        <div className="bj-stat" aria-label="More than fifty thousand people trained">
          <strong>50,000+</strong>
          <span>people trained through AI For All sessions, masterclasses, tool walkthroughs, and hands-on learning loops.</span>
        </div>
      </div>
      <div className="bj-cards bj-cards-4">
        {trainingLanes.map(([title, text, status]) => <article className="bj-card" key={title}>
          <span className="bj-chip">{status}</span>
          <h3>{title}</h3>
          <p>{text}</p>
        </article>)}
      </div>
      <div className="bj-signals">
        <p>Training signals from the work</p>
        <ul>{trainingSignals.map(signal => <li key={signal}>{signal}</li>)}</ul>
      </div>
      <div className="bj-actions"><a className="bj-button" href="#contact">Plan a training session <Arrow /></a><a className="bj-link" href="https://in.linkedin.com/in/balramr66">Follow my teaching and work <Arrow /></a></div>
    </Block>
  </Chamber>;
}

export function Workshop() {
  return <Chamber id="projects" tone="workshop">
    <Block id="bj-projects" kicker="AI projects" title="Small products where AI becomes something people actually use." status="Try the app / explore the code">
      <div className="bj-projects">
        {aiProjects.map(project => <article className="bj-project" key={project.title}>
          <figure>
            <img src={project.image} srcSet={`${project.smallImage} 640w, ${project.image} 1000w`} sizes="(max-width: 760px) calc(100vw - 48px), 360px"
              width={project.width} height={project.height} alt={`${project.title} project artwork`} loading="lazy" decoding="async" />
          </figure>
          <div className="bj-project-copy">
            <p>{project.type}</p>
            <h3>{project.title}</h3>
            <span>{project.summary}</span>
            <a className="bj-link" href={project.href}>{project.action} <Arrow /></a>
          </div>
        </article>)}
      </div>
    </Block>
  </Chamber>;
}

/* Who is Balram? Its own stop straight after the masthead, before the map (Balram, Oct 19: "who is balram section should
   come to the top after the desk"). Not a numbered chapter: on the cave map the camera stays on the painted desk while it reads. */
export function WhoIsBalram() {
  return <div className="bj-chamber bj-stone" data-chamber="who" data-tone="desk">
    <div className="bj-room">
      <Block id="bj-about" kicker="Who is Balram?" title="The human behind AI For All.">
        {/* His two titles (Oct 20). The AWS one points at the proving wall, where the verified AWS badges hang. */}
        <ul className="bj-titles" aria-label="Titles">
          <li><a href="#proving-wall">{titles.aws}<span className="bj-sr"> (see the proving wall)</span></a></li>
          <li>{titles.champion}</li>
        </ul>
        <p className="bj-lead">{about.lead}</p>
        <p className="bj-lead bj-suit">{keep(about.suit)}</p>
        <h3 className="bj-sub">What I do</h3>
        <ul className="bj-do">{about.doing.map(([lead, text]) => <li key={lead}><strong>{lead}</strong> {text}</li>)}</ul>
        <h3 className="bj-sub">What I master</h3>
        <ul className="bj-proof" aria-label="What I master">{about.mastery.map(point => <li key={point}>{point}</li>)}</ul>
      </Block>
    </div>
  </div>;
}

export function CaveMouth() {
  return <Chamber id="about" tone="mouth">
    <section className="bj-block bj-signal" id="signal" aria-labelledby="signal-title">
      <SignalSky />
      <div className="bj-signal-grid">
        <div className="bj-signal-copy">
          <header className="bj-block-head">
            <p className="bj-kicker">{signal.kicker}</p>
            <h2 id="signal-title">{keep(signal.title)}</h2>
          </header>
          <p className="bj-lead">{signal.lead}</p>
          <div className="bj-actions">
            <a className="bj-button bj-signal-send" href={signal.href} target="_blank" rel="noopener noreferrer">{signal.action} <Arrow /><span className="bj-sr"> (opens in a new tab)</span></a>
          </div>
        </div>
        <div className="bj-signal-topics">
          <h3>{signal.topicsLabel}</h3>
          <ul>{signal.topics.map(topic => <li key={topic}>{topic}</li>)}</ul>
        </div>
      </div>
    </section>
    <Block id="community" kicker="Examples from others" title="Good work deserves company." status="Inviting first submissions">
      <div className="bj-invite"><p>Built a useful AI workflow, a small product, or a lesson others can learn from? Share the problem, what you made, and a link. Selected work will appear here with its creator credited.</p><a className="bj-button bj-button-quiet" href="https://wa.me/qr/3EZXUASKEW5RM1">Share your work with Balram <Arrow /></a></div>
    </Block>
    <Block id="contact" kicker="Contact me" title="Want to build a site or talk about practical AI help?">
      <p className="bj-lead">Send a note when you want help making AI practical for yourself, your team, or a learning program. If you want a site built or a guide shaped, we can start there.</p>
      <div className="bj-contact" aria-label="Contact links">
        <a className="bj-contact-link" href="https://wa.me/qr/3EZXUASKEW5RM1">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.3a8.4 8.4 0 0 0-7.2 12.7l-1 4 4.1-1A8.4 8.4 0 1 0 12 3.3Z" /><path d="M8.7 8.2c.2-.5.4-.5.7-.5h.6c.2 0 .4.1.5.4l.7 1.7c.1.2.1.4-.1.6l-.4.5c-.1.1-.2.3 0 .5.5.9 1.4 1.8 2.4 2.3.2.1.4.1.5-.1l.6-.7c.2-.2.4-.2.6-.1l1.7.8c.3.1.4.3.4.5 0 .8-.6 1.7-1.4 1.8-1.4.2-3.3-.5-5-2.2-1.7-1.7-2.6-3.5-2.5-4.8 0-.2 0-.4.1-.7Z" /></svg>
          <span>Talk AI with me on WhatsApp</span>
        </a>
        <a className="bj-contact-link" href="https://in.linkedin.com/in/balramr66">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8.8h3.3V19H5V8.8Zm1.7-4.9a1.9 1.9 0 1 1 0 3.8 1.9 1.9 0 0 1 0-3.8ZM10.1 8.8h3.1v1.4h.1c.4-.8 1.5-1.7 3.1-1.7 3.3 0 3.9 2.2 3.9 5V19H17v-4.9c0-1.2 0-2.7-1.6-2.7s-1.9 1.3-1.9 2.6v5h-3.3V8.8Z" /></svg>
          <span>Connect with me on LinkedIn</span>
        </a>
      </div>
    </Block>
    <Block id="newsletter" kicker="AI For All weekly" title="Follow the public notebook where tested AI ideas land first.">
      <div className="bj-actions"><a className="bj-button" href="https://www.linkedin.com/newsletters/ai-for-all-weekly-newsletter-7401258096209088512/">Open the newsletter <Arrow /></a></div>
      <p className="bj-note">I try the ideas first, then I share the ones that are worth your time.</p>
    </Block>
  </Chamber>;
}
