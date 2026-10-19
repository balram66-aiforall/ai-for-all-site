"use client";
/* eslint-disable @next/next/no-html-link-for-pages -- Local prototype intentionally links to the untouched public-site routes. */
import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUpRight, RotateCcw, SkipForward } from "lucide-react";
import { aiProjects } from "./content";
import { installOpening, type OpeningController, type IntroState } from "./opening";

const agents = [
  { name: "Designer", role: "Shape the experience", text: "Visual direction, layout and motion.", glyph: "designer" },
  { name: "Builder", role: "Make it work", text: "Components, interactions and implementation.", glyph: "builder" },
  { name: "Verifier", role: "Check the details", text: "Review, accessibility and testing.", glyph: "verifier" },
];

function AgentGlyph({ kind }: { kind: string }) {
  return <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
    {kind === "designer" ? <><path d="m16 3 10 16-10 10L6 19 16 3Z"/><path d="M16 3v13m-10 3h7m6 0h7"/><circle cx="16" cy="19" r="3"/></>
      : kind === "builder" ? <><path d="M11 4H4v24h7m10-24h7v24h-7"/><path d="m16 9 7 7-7 7-7-7 7-7Z"/></>
      : <><path d="M7 5H4v22h3m18-22h3v22h-3"/><path d="m7 15 5 5L23 9m-7 13 8-8"/></>}
  </svg>;
}
function Signature() {
  return <svg viewBox="0 0 44 36" fill="none" aria-hidden="true"><path d="M5 29V7h15l7 7-7 5H5m15 0 9 10m-10 0V7h14l6 7-8 6 8 9" stroke="currentColor" strokeWidth="2" strokeLinejoin="bevel"/></svg>;
}

export function GothamPrototype() {
  const root = useRef<HTMLDivElement>(null);
  const controller = useRef<OpeningController | null>(null);
  const [intro, setIntro] = useState<IntroState>("complete");
  const [ready, setReady] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [available, setAvailable] = useState(true);
  const project = aiProjects[0];
  useEffect(() => {
    if (!root.current) return;
    controller.current = installOpening(root.current, (state, reduce) => {
      setIntro(state); setReduced(reduce); setReady(true);
      setAvailable(typeof Element.prototype.animate === "function");
    });
    return () => { controller.current?.dispose(); controller.current = null; };
  }, []);

  return <div className="gotham" ref={root} data-intro="complete">
    <a className="g-skip" href="#main">Skip to content</a>
    <div className="g-preview-note">LOCAL OPENING PROTOTYPE <span>NOT PUBLISHED</span></div>
    <header className="g-header g-wrap">
      <a href="#top" className="g-signature" aria-label="Balram home"><Signature/><span>BALRAM R.</span></a>
      <nav aria-label="Main navigation"><a href="#work">Work</a><a href="#agents">Agents</a><a href="#about">About</a><a href="#contact">Contact <ArrowUpRight size={13}/></a></nav>
      <button type="button" className="g-intro-control" hidden={!ready} disabled={reduced || !available} onClick={() => controller.current?.replay()}>
        {intro === "playing" ? <SkipForward size={13} aria-hidden="true"/> : <RotateCcw size={13} aria-hidden="true"/>}
        {intro === "playing" ? "Skip intro" : reduced ? "Motion reduced" : !available ? "Motion unavailable" : "Replay intro"}
      </button>
    </header>
    <main id="main" tabIndex={-1}>
      <section id="top" className="g-stage g-wrap" aria-labelledby="g-name">
        <svg className="g-architecture" viewBox="0 0 1320 760" preserveAspectRatio="none" aria-hidden="true">
          <path d="M850 0h260L600 760H360Z" fill="#c5b477" fillOpacity=".028"/>
          <path d="m1230 0-350 760M910 0 390 760M780 0 250 760M1318 0v760" stroke="#b5b3a6" strokeOpacity=".08"/>
          <path d="M1030 0h200L770 760H590Z" fill="#e6dfc2" fillOpacity=".025"/>
        </svg>
        <div className="g-hero-grid">
          <div className="g-identity">
            <p className="g-kicker"><span className="g-signal"/> PERSONAL PORTFOLIO</p>
            <h1 id="g-name" aria-label="Balram, bAIram"><span aria-hidden="true">b<span className="g-ai">AI</span>ram<span className="g-name-dot">.</span></span></h1>
            <p className="g-role">AI Marketing Lead, Amazon</p>
            <div className="g-intro-copy"><p>I make AI accessible.</p><p>Learn it simply. Put it to work.<br/>Build something that matters.</p></div>
            <a className="g-work-link" href="#work"><span>Explore my work</span><ArrowUpRight size={20} aria-hidden="true"/></a>
            <div className="g-personal-caption"><span className="g-short-rule"/> ONE HUMAN. AGENTS ALONGSIDE.</div>
          </div>
          <article id="work" className="g-featured" aria-labelledby="g-project-title">
            <div className="g-project-top"><span>SELECTED WORK</span><span>PROJECT / 01</span></div>
            <a className="g-project-frame" href={project.href} aria-label={`Open project: ${project.title}`}>
              <div className="g-project-border"/>
              <div className="g-art" role="img" aria-label="The Pinky Promise promotional artwork: a phone with a pink promise-making interface">
                {[0, 1, 2].map(i => <span className={`g-art-strip g-art-${i}`} key={i}/>)}
              </div>
              <div className="g-screen-shade"/>
              <span className="g-frame-index" aria-hidden="true">01</span>
              <span className="g-open-project" aria-hidden="true"><ArrowUpRight size={24}/></span>
              <div className="g-scaffold" aria-hidden="true"><span className="g-scaffold-line line-a"/><span className="g-scaffold-line line-b"/><span className="g-scaffold-line line-c"/><span className="g-cross cross-a"/><span className="g-cross cross-b"/></div>
              <div className="g-review-bracket" aria-hidden="true"/>
            </a>
            <div className="g-project-caption"><p>{project.type}</p><a href={project.href}><h2 id="g-project-title">{project.title}<ArrowUpRight size={20} aria-hidden="true"/></h2></a><p className="g-project-summary">{project.summary}</p></div>
          </article>
        </div>
        <div className="g-stage-foot">
          <a className="g-down" href="#agents"><ArrowDown size={15} aria-hidden="true"/><span>THE PEOPLE BEHIND IT?<br/><strong>Just me. And the agents.</strong></span></a>
          <a href="#agents" className="g-agent-dock"><span className="g-dock-icons" aria-hidden="true">{agents.map(a => <span key={a.glyph}><AgentGlyph kind={a.glyph}/></span>)}</span><span>Meet the agents</span><ArrowUpRight size={16} aria-hidden="true"/></a>
        </div>
        <div className="g-flight-layer" aria-hidden="true">{agents.map(a => <div className={`g-flying-agent g-flying-${a.glyph}`} key={a.name}><AgentGlyph kind={a.glyph}/><span>{a.name}</span></div>)}</div>
      </section>
      <section id="agents" className="g-agents-section g-wrap" aria-labelledby="agents-title">
        <div className="g-section-heading"><p className="g-kicker">THE WORKSHOP / AGENT ROLES</p><h2 id="agents-title">Human direction.<br/><span>Agent execution.</span></h2><p className="g-disclosure">The opening is a choreographed illustration of how we work. No agents are running live on this page.</p></div>
        <div className="g-agents-list">{agents.map((a, i) => <article className="g-agent-row" key={a.name}><span className="g-agent-number">0{i + 1}</span><div className="g-agent-symbol"><AgentGlyph kind={a.glyph}/></div><div><h3>{a.name}</h3><p>{a.text}</p></div><span className="g-agent-duty">{a.role}</span></article>)}</div>
      </section>
      <section id="about" className="g-about g-wrap" aria-labelledby="about-title"><div><p className="g-kicker">WHO IS BALRAM?</p><h2 id="about-title">The human behind<br/>AI For All.</h2></div><div><p>I am Balram, an AI lead, educator, and builder. I help people turn curiosity into confidence through practical training, clear explanations, and hands-on projects. AI For All brings those lessons together so you can find a useful starting point for your own work.</p><a className="g-inline-link" href="/#training">35,000+ people trained <ArrowUpRight size={16} aria-hidden="true"/></a></div></section>
      <footer id="contact" className="g-footer g-wrap"><div><p className="g-kicker">CONTACT ME</p><a href="https://wa.me/qr/3EZXUASKEW5RM1" className="g-contact">Talk AI with me on WhatsApp <ArrowUpRight aria-hidden="true"/></a></div><div className="g-footer-links"><a href="https://in.linkedin.com/in/balramr66">LinkedIn <ArrowUpRight size={14}/></a><a href="https://github.com/balram66-aiforall">GitHub <ArrowUpRight size={14}/></a><a href="/">Current site <ArrowUpRight size={14}/></a></div><p className="g-prototype-foot">Opening prototype only. Additional projects and learning resources remain on the current site.</p></footer>
    </main>
  </div>;
}
