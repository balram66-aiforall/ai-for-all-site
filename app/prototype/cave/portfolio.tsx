'use client';
/* eslint-disable @next/next/no-html-link-for-pages -- Isolated prototype links to unchanged public routes. */
/* eslint-disable @next/next/no-img-element -- Self-hosted Artifactory artwork, with an independent HTML fallback. */
import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUpRight, RotateCcw, SkipForward, Pause, Play, ArrowLeft } from 'lucide-react';
import { aiProjects, articles } from '../content';
import type { CaveController, CaveView } from './scene';

const sessionKey = 'bairam-workstation-arrival:v2';

export function CavePortfolio() {
  const host = useRef<HTMLDivElement>(null);
  const controller = useRef<CaveController | null>(null);
  const viewRef = useRef<CaveView>('workstation');
  const workstationButton = useRef<HTMLButtonElement>(null);
  const restoreFocus = useRef(false);
  const motionRef = useRef(true);
  const [renderer, setRenderer] = useState<'still'|'layered'|'unavailable'>('still');
  const [intro, setIntro] = useState<'playing'|'complete'>('complete');
  const [motion, setMotion] = useState(true);
  const [reduced, setReduced] = useState(false);
  const [enhanced, setEnhanced] = useState(false);
  const [view, setView] = useState<CaveView>('workstation');
  const [assetFailed, setAssetFailed] = useState(false);
  const [suitFailed, setSuitFailed] = useState(false);

  useEffect(() => {
    if (!host.current) return;
    let disposed = false, interrupted = false;
    const mq = matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => {
      setReduced(mq.matches);
      if (mq.matches) { motionRef.current=false; setMotion(false); controller.current?.setMotion(false); }
    };
    sync(); setEnhanced(true); mq.addEventListener('change', sync);
    let allowed = !mq.matches && !location.hash;
    try { allowed = allowed && sessionStorage.getItem(sessionKey) !== 'seen'; } catch { allowed=false; }
    const markSeen = () => { try { sessionStorage.setItem(sessionKey, 'seen'); } catch {} };
    const target = host.current;
    import('./scene').then(({createCaveScene}) => {
      if (disposed) return;
      controller.current = createCaveScene(target, {
        motion: motionRef.current && !mq.matches,
        intro: allowed && !interrupted && window.scrollY<40,
        onState: (state,remember) => { if(disposed)return; setIntro(state); if(remember)markSeen(); },
        onReady: () => { if(!disposed)setRenderer('layered'); },
        onError: () => { if(!disposed){setRenderer('unavailable');setIntro('complete');} },
      });
      if(viewRef.current!=='workstation')controller.current.setView(viewRef.current);
    }).catch(() => { if(!disposed)setRenderer('unavailable'); });
    const interrupt = () => { interrupted=true; controller.current?.finish(); };
    const key = (event: KeyboardEvent) => { if(event.key==='Escape')interrupt(); };
    const focus = (event: FocusEvent) => { if((event.target as HTMLElement)?.closest('.cave-nav,.cave-room-switch,.cave-skip,.cave-explore'))interrupt(); };
    window.addEventListener('keydown',key);
    window.addEventListener('wheel',interrupt,{passive:true});
    window.addEventListener('touchmove',interrupt,{passive:true});
    window.addEventListener('focusin',focus);
    return () => {
      disposed=true; mq.removeEventListener('change',sync);
      window.removeEventListener('keydown',key); window.removeEventListener('wheel',interrupt);
      window.removeEventListener('touchmove',interrupt); window.removeEventListener('focusin',focus);
      controller.current?.dispose(); controller.current=null;
    };
  }, []);

  function toggleMotion() { const next=!motion; motionRef.current=next;setMotion(next);controller.current?.setMotion(next); }
  useEffect(() => { if(view==='workstation'&&restoreFocus.current){restoreFocus.current=false;workstationButton.current?.focus({preventScroll:true});} }, [view]);
  function changeView(next: CaveView, restore=false) { restoreFocus.current=restore;viewRef.current=next;setView(next);controller.current?.setView(next); }
  function replay() { controller.current?.replay(); }

  return <div className="cave" data-renderer={renderer} data-intro={intro} data-view={view} data-motion={motion&&!reduced?'on':'off'}>
    <p className="cave-sr-status" role="status" aria-live="polite">{view==='suit'?'Suit bay selected.':'Workstation selected.'} {renderer==='unavailable'?'Animated scene unavailable. All portfolio links remain available.':''}</p>
    <a className="cave-skip" href="#work">Skip to projects</a>
    <section id="top" className="cave-stage" aria-label="Balram’s underground headquarters">
      <div className="cave-environment" aria-hidden="true">
        <picture className="cave-still" data-failed={assetFailed}>
          <img src="/assets/cave/workstation/original.webp" width="1344" height="768" alt="" fetchPriority="high" onError={()=>setAssetFailed(true)} />
        </picture>
        <div ref={host} className="cave-canvas" />
        <div className="cave-vignette" />
      </div>
      {assetFailed&&renderer!=='layered'&&view==='workstation'&&<p className="cave-art-failure">Workstation artwork unavailable. Projects and links remain available below.</p>}
      <header className="cave-header">
        <a className="cave-brand" href="#top" aria-label="Balram home"><span className="cave-monogram" aria-hidden="true">b<span>AI</span></span><span>BALRAM R.<small>PERSONAL HEADQUARTERS</small></span></a>
        <nav className="cave-nav" aria-label="Main navigation"><a href="#work">Work</a><a href="#agents">Agents</a><a href="#about">About</a><a href="#contact">Contact <ArrowUpRight size={12}/></a></nav>
      </header>
      <div className="cave-scene-caption"><span className="cave-line"/> THE CAVE <span className="cave-caption-separator">/</span> {view==='workstation'?'COMMAND DESK':'SUIT BAY'}</div>
      <div className="cave-controls" hidden={!enhanced||view==='suit'}>
        <button type="button" disabled={renderer!=='layered'||reduced||!motion} onClick={()=>intro==='playing'?controller.current?.finish():replay()} aria-label={intro==='playing'?'Skip arrival':'Replay arrival'}>{intro==='playing'?<SkipForward size={14}/>:<RotateCcw size={14}/>}<span>{intro==='playing'?'Skip arrival':'Replay arrival'}</span></button>
        <button type="button" disabled={reduced||renderer!=='layered'} onClick={toggleMotion} aria-pressed={!motion} aria-label={reduced?'Reduced motion enabled':motion?'Pause scene motion':'Enable scene motion'}>{motion&&!reduced?<Pause size={14}/>:<Play size={14}/>}<span>{reduced?'Reduced motion':motion?'Pause motion':'Motion paused'}</span></button>
      </div>
      <section id="cave-suit-panel" className="cave-suit-panel" hidden={view!=='suit'} aria-labelledby="cave-suit-title">
        <div className="cave-suit-art" data-failed={suitFailed}>
          <img src="/assets/cave/workstation/suit.webp" width="832" height="1180" alt="Original graphite and gold bAIram armour displayed in an illuminated equipment bay" loading="lazy" onError={()=>setSuitFailed(true)} />
          {suitFailed&&<p>Suit artwork unavailable.</p>}
        </div>
        <div className="cave-suit-label"><p className="cave-eyebrow">EQUIPMENT / 01</p><h2 id="cave-suit-title">The bAIram suit.</h2><p>Original graphite-and-gold armour concept.</p><button type="button" onClick={()=>changeView('workstation',true)}><ArrowLeft size={15}/> Back to the workstation</button></div>
      </section>
      <div className="cave-bottom">
        <div className="cave-identity"><p className="cave-eyebrow">AI MARKETING LEAD, AMAZON</p><h1 aria-label="Balram, bAIram"><span aria-hidden="true">b<span>AI</span>ram<span className="cave-dot">.</span></span></h1><p className="cave-introduction">I make AI accessible.<br/><span>Learn it simply. Put it to work.<br className="cave-mobile-break"/> Build something that matters.</span></p></div>
        <div className="cave-dock">
          <div className="cave-room-switch" role="group" aria-label="Explore the headquarters" hidden={!enhanced}>
            <button ref={workstationButton} type="button" aria-pressed={view==='workstation'} onClick={()=>changeView('workstation')}><span>01</span> Workstation</button>
            <button type="button" aria-pressed={view==='suit'} aria-controls="cave-suit-panel" onClick={()=>changeView('suit')}><span>02</span> bAIram suit <ArrowUpRight size={13}/></button>
          </div>
          <a className="cave-explore" href="#work"><span>EXPLORE THE WORK</span><ArrowDown size={19}/></a>
        </div>
      </div>
      <div className="cave-scene-footer"><span>ONE HUMAN. AGENTS ALONGSIDE.</span><span>{renderer==='unavailable'?'STILL VIEW · PROJECTS BELOW':'CHOREOGRAPHED SYSTEMS · NOT LIVE AGENTS'}</span><span>SOUND OFF</span></div>
    </section>
    <noscript><section className="cave-noscript-suit"><h2>The bAIram suit.</h2><img src="/assets/cave/workstation/suit.webp" width="832" height="1180" alt="Original graphite and gold bAIram armour concept" loading="lazy"/></section></noscript>
    <main id="work" className="cave-content" tabIndex={-1}>
      <div className="cave-section-head"><p className="cave-eyebrow">01 / SELECTED WORK</p><h2>From the command desk.</h2><p>Built by Balram, with agents.</p></div>
      <div className="cave-projects">
        {aiProjects.map((item,index)=><article id={`project-${index}`} className="cave-project" key={item.title}>
          <span className="cave-index">0{index+1}</span>
          <a className="cave-project-art" href={item.href}><img src={item.smallImage} alt={`${item.title} project artwork`} width={item.width} height={item.height} loading="lazy" /></a>
          <div className="cave-project-copy"><p className="cave-eyebrow">{item.type}</p><h3>{item.title}</h3><p>{item.summary}</p><a className="cave-text-link" href={item.href}>{item.action}<ArrowUpRight size={16}/></a></div>
        </article>)}
      </div>
      <section id="agents" className="cave-agents">
        <div className="cave-section-head"><p className="cave-eyebrow">02 / AGENTS ALONGSIDE</p><h2>Just me. And the agents.</h2><p>The mechanical assistants in the cave illustrate design, building and review. Their movement is choreographed. No agents are running live on this page.</p></div>
        <div className="cave-agent-roles">{[{name:'Design',text:'Visual direction, layout and motion.'},{name:'Build',text:'Components, interactions and implementation.'},{name:'Review',text:'Review, accessibility and testing.'}].map((agent,index)=><div key={agent.name}><span className="cave-eyebrow">STATION / 0{index+1}</span><h3>{agent.name}</h3><p>{agent.text}</p></div>)}</div>
      </section>
      <section id="about" className="cave-about"><div><p className="cave-eyebrow">03 / THE HUMAN</p><h2>Balram R.</h2></div><div><p>I am Balram, an AI lead, educator, and builder. I help people turn curiosity into confidence through practical training, clear explanations, and hands-on projects. AI For All brings those lessons together so you can find a useful starting point for your own work.</p><a className="cave-text-link" href="/#training">35,000+ people trained<ArrowUpRight size={16}/></a></div></section>
      <section className="cave-library" aria-labelledby="library-title"><div className="cave-section-head"><p className="cave-eyebrow">04 / THE ARCHIVE</p><h2 id="library-title">Ideas, put to work.</h2></div><div className="cave-article-list">{articles.map((article,index)=><a href={article.href} key={article.title}><span>0{index+1}</span><div><h3>{article.title}</h3><p>{article.summary}</p></div><ArrowUpRight size={18}/></a>)}</div><div className="cave-resource-links"><a href="/guides">Role guides <ArrowUpRight size={14}/></a><a href="/prompting-framework">CROFTC prompting school <ArrowUpRight size={14}/></a><a href="/">All AI For All resources <ArrowUpRight size={14}/></a></div></section>
      <footer id="contact" className="cave-contact"><p className="cave-eyebrow">05 / MAKE CONTACT</p><a className="cave-contact-title" href="https://wa.me/qr/3EZXUASKEW5RM1">Talk AI with me on WhatsApp <ArrowUpRight/></a><div><a href="https://in.linkedin.com/in/balramr66">LinkedIn <ArrowUpRight size={14}/></a><a href="https://github.com/balram66-aiforall">GitHub <ArrowUpRight size={14}/></a><a href="/">Current site <ArrowUpRight size={14}/></a></div><p className="cave-disclosure">Local design prototype. Not published. Additional resources remain on the current site.</p></footer>
    </main>
  </div>;
}
