// Cave sound checks (/prototype/bairam-map). Browsers can't be heard in a test, so this checks behaviour:
// sound is on by default but nothing loads or plays until the browser allows it (first click, tap or key, or at once
// where autoplay is allowed); the button mutes and the mute is remembered; the bats' sound
// starts on the opening's own clock (in sync with the drawn bats); Skip, hidden tabs and reduced motion quiet it;
// other routes have no sound. Usage: TEST_URL=http://localhost:3199 node tests/sound-checks.mjs
import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir, writeFile} from 'node:fs/promises';
const base=process.env.TEST_URL||'http://localhost:3199';
const root=process.env.EVIDENCE_DIR||new URL('../../frontier-aimplify/work/builder/2026-10-18-cave-sound/',import.meta.url).pathname;
const label=process.env.EVIDENCE_LABEL||'dev';
await mkdir(root+'evidence',{recursive:true});
const browser=await chromium.launch({headless:true});
// Headless Chromium always allows audio (even with --autoplay-policy flags), so the real first-visit rule of Chrome,
// Safari and Firefox is reproduced in the page: until the visitor has clicked, tapped or pressed a key, an
// AudioContext stays suspended and media play() is refused. (navigator.userActivation can't be used: Playwright's
// navigation already marks the page active.) Escape does not count, as in Chrome.
const lockAudio=()=>{
  let pressed=false;const active=()=>pressed;const Real=window.AudioContext;
  for(const type of ['pointerdown','touchend','keydown'])addEventListener(type,e=>{if(e.isTrusted&&!(type==='keydown'&&e.key==='Escape'))pressed=true;},true);
  class Locked extends Real{
    constructor(o){super(o);this.__locked=!active();if(this.__locked)void super.suspend();}
    get state(){return this.__locked?'suspended':super.state;}
    resume(){if(!active())return Promise.resolve();if(this.__locked){this.__locked=false;return super.resume().then(()=>{this.dispatchEvent(new Event('statechange'));});}return super.resume();}
  }
  window.AudioContext=Locked;
  const play=HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play=function(){return active()?play.call(this):Promise.reject(new DOMException('play() needs a user gesture','NotAllowedError'));};
};
const results=[];let failed=0;
const check=async(name,fn)=>{try{await fn();results.push({name,pass:true});console.log('PASS',name);}catch(e){failed++;results.push({name,pass:false,error:String(e.message||e)});console.log('FAIL',name,'::',String(e.message||e).split('\n')[0]);}};
const state=p=>p.evaluate(()=>window.__caveSound||null);
const until=async(p,fn,ms=4000)=>{const t=Date.now();for(;;){const s=await state(p);if(s&&fn(s))return s;if(Date.now()-t>ms)return s;await p.waitForTimeout(50);}};
async function fresh({intro=false,remembered=null,reduced=false,viewport={width:1440,height:900},b=browser}={}){
  const ctx=await b.newContext({viewport,reducedMotion:reduced?'reduce':'no-preference'});
  if(b===browser)await ctx.addInitScript(lockAudio);
  if(remembered!==null)await ctx.addInitScript(v=>{try{localStorage.setItem('bairam:sound-v2',v);}catch{}},remembered);
  const p=await ctx.newPage();const soundReq=[],errors=[];
  p.on('request',r=>{if(r.url().includes('/assets/bairam-map/sound/'))soundReq.push(r.url().split('/').pop());});
  p.on('pageerror',e=>errors.push('page: '+e.message));p.on('console',m=>{if(m.type()==='error'&&!(m.text().includes('hydrated')&&m.text().includes('data-theme-phase')))errors.push('console: '+m.text());});
  await p.goto(base+'/prototype/bairam-map'+(intro?'':'?intro=0'),{waitUntil:'domcontentloaded'});
  return {ctx,p,soundReq,errors};
}
const allErrors=[];
// A click on a spot with nothing on it (the masthead title / the middle of the loading screen): the visitor's first gesture.
const firstClick=async p=>{if(await p.locator('.bairam-opening').count())await p.mouse.click(640,200);else await p.locator('.bm-title').click();};

await check('masthead: Sound is on by default (pressed, waiting); nothing loaded or playing before a click',async()=>{
  const {ctx,p,soundReq,errors}=await fresh();const b=p.locator('.bm-controls [data-sound-toggle]');
  await b.waitFor({state:'visible'});assert.equal(await b.getAttribute('aria-pressed'),'true');assert.equal(await b.getAttribute('data-sound-toggle'),'waiting');assert.equal((await b.innerText()).trim(),'Sound');
  await p.waitForTimeout(2500);assert.deepEqual(soundReq,[]);const s=await state(p);assert.equal(s.running,false);assert.notEqual(s.context,'running');allErrors.push(...errors);await ctx.close();});

await check('the first click anywhere starts it; the Sound button mutes (remembered) and unmutes',async()=>{
  const {ctx,p,soundReq,errors}=await fresh();const b=p.locator('.bm-controls [data-sound-toggle]');await b.waitFor({state:'visible'});await firstClick(p);
  const s=await until(p,s=>s.running&&!s.musicPaused);assert.equal(await b.getAttribute('data-sound-toggle'),'on');assert.equal(await b.getAttribute('aria-pressed'),'true');
  assert.equal(s.context,'running');assert.equal(s.musicPaused,false);assert.ok(soundReq.includes('cave-theme.m4a'),'music requested: '+soundReq);
  await b.click();const off=await until(p,s=>!s.running&&s.musicPaused&&s.context==='suspended',2000);
  assert.equal(off.running,false);assert.equal(off.musicPaused,true);assert.equal(await b.getAttribute('aria-pressed'),'false');
  assert.equal(await p.evaluate(()=>localStorage.getItem('bairam:sound-v2')),'0');
  await b.click();const back=await until(p,s=>s.running&&!s.musicPaused);assert.equal(back.running,true);assert.equal(await p.evaluate(()=>localStorage.getItem('bairam:sound-v2')),'1');
  allErrors.push(...errors);await ctx.close();});

await check('where the browser allows autoplay, sound starts on load with no click',async()=>{
  const ab=await chromium.launch({headless:true,args:['--autoplay-policy=no-user-gesture-required']});
  const {ctx,p,soundReq,errors}=await fresh({b:ab,intro:true});const s=await until(p,s=>s.running&&!s.musicPaused,5000);
  assert.equal(s.running,true);assert.ok(soundReq.includes('cave-theme.m4a'));const o=await until(p,s=>s.openingPlaying,2000);assert.ok(o.openingPlaying,'opening bats playing');
  allErrors.push(...errors);await ctx.close();await ab.close();});

let sync=null;
await check('loading screen: Sound beside Skip; bats sound starts on the opening clock, in sync with the drawn fly-by',async()=>{
  const {ctx,p,errors}=await fresh({intro:true});const b=p.locator('.bairam-opening-controls [data-sound-toggle]');await b.waitFor({state:'visible'});
  // Measure, in the page, when the drawn animation reaches the fly-by phase (900 ms on its clock).
  await p.evaluate(()=>{const o=document.querySelector('.bairam-opening');window.__flyAt=null;new MutationObserver(()=>{if(o.dataset.phase==='flyby'&&window.__flyAt===null)window.__flyAt=performance.now();}).observe(o,{attributes:true,attributeFilter:['data-phase']});});
  assert.equal(await b.getAttribute('data-sound-toggle'),'waiting');await firstClick(p);const s=await until(p,s=>s.openingPlaying,3000);assert.ok(s.openingPlaying,'bats sound playing');assert.equal(await b.getAttribute('aria-pressed'),'true');
  const fly=await p.waitForFunction(()=>window.__flyAt,null,{timeout:4000}).then(h=>h.jsonValue());
  const st=await state(p);const soundClock=(fly-st.openingStart)/1000;
  sync={flybyOnSoundClock:+soundClock.toFixed(3),expected:0.9,startOffset:st.lastOpening.offset};
  // One frame (17 ms) of render/observer lag is allowed either side of 0.9 s.
  assert.ok(Math.abs(soundClock-0.9)<=0.034,`fly-by drawn at ${soundClock.toFixed(3)}s on the sound clock`);
  const b2=p.locator('.bairam-opening-controls [data-sound-toggle]');const r=await b2.boundingBox(),k=await p.locator('.bairam-opening-controls button[aria-label="Skip opening"]').boundingBox();
  assert.ok(r.x+r.width<=k.x&&k.x-(r.x+r.width)<40,'Sound sits just left of Skip');
  allErrors.push(...errors);await ctx.close();});

await check('Skip silences the bats; the music keeps playing',async()=>{
  const {ctx,p,errors}=await fresh({intro:true});const b=p.locator('.bairam-opening-controls [data-sound-toggle]');await b.waitFor({state:'visible'});await firstClick(p);
  await until(p,s=>s.openingPlaying,3000);await p.locator('.bairam-opening-controls button[aria-label="Skip opening"]').click();
  const s=await until(p,s=>!s.openingPlaying,1500);assert.equal(s.openingPlaying,false);assert.equal(s.running,true);assert.equal(s.musicPaused,false);
  allErrors.push(...errors);await ctx.close();});

await check('Replay opening with Sound on plays the bats again',async()=>{
  const {ctx,p,errors}=await fresh();await p.locator('.bm-controls [data-sound-toggle]').waitFor({state:'visible'});await firstClick(p);await until(p,s=>s.running);
  await p.locator('.bm-replay').click();const s=await until(p,s=>s.openingPlaying,3000);assert.ok(s.openingPlaying);allErrors.push(...errors);await ctx.close();});

await check('a mute saved while sound was opt-in (old key) is forgotten: on by default',async()=>{
  const ctx=await browser.newContext();await ctx.addInitScript(lockAudio);await ctx.addInitScript(()=>{try{localStorage.setItem('bairam:sound','0');}catch{}});
  const p=await ctx.newPage();await p.goto(base+'/prototype/bairam-map?intro=0',{waitUntil:'domcontentloaded'});const b=p.locator('.bm-controls [data-sound-toggle]');await b.waitFor({state:'visible'});
  assert.equal(await b.getAttribute('aria-pressed'),'true');await ctx.close();});

await check('muted last time: stays muted; clicks start nothing and load nothing',async()=>{
  const {ctx,p,soundReq,errors}=await fresh({remembered:'0'});const b=p.locator('.bm-controls [data-sound-toggle]');await b.waitFor({state:'visible'});
  assert.equal(await b.getAttribute('aria-pressed'),'false');assert.equal(await b.getAttribute('data-sound-toggle'),'off');await firstClick(p);await p.waitForTimeout(1500);
  const s=await state(p);assert.equal(s.running,false);assert.equal(s.context,'none');assert.deepEqual(soundReq,[]);allErrors.push(...errors);await ctx.close();});

await check('loading screen: clicking Sound while it waits starts the sound and the bats (does not mute)',async()=>{
  const {ctx,p,errors}=await fresh({intro:true});const b=p.locator('.bairam-opening-controls [data-sound-toggle]');await b.waitFor({state:'visible'});
  assert.equal(await b.getAttribute('data-sound-toggle'),'waiting');assert.equal(await b.getAttribute('aria-pressed'),'true');await b.click();
  const s=await until(p,s=>s.openingPlaying,3000);assert.equal(s.on,true);assert.equal(s.running,true);assert.ok(s.openingPlaying,'bats playing');
  assert.equal(await b.getAttribute('aria-pressed'),'true');assert.equal(await p.evaluate(()=>localStorage.getItem('bairam:sound-v2')),'1');
  // Once it plays, the same button mutes.
  await b.click();const m=await until(p,s=>!s.running,1500);assert.equal(m.on,false);assert.equal(m.openingPlaying,false);allErrors.push(...errors);await ctx.close();});

await check('hidden tab: music pauses; back on the tab it resumes',async()=>{
  const {ctx,p,errors}=await fresh();await p.locator('.bm-controls [data-sound-toggle]').waitFor({state:'visible'});await firstClick(p);await until(p,s=>s.running&&!s.musicPaused);
  const vis=h=>p.evaluate(h=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>h});Object.defineProperty(document,'visibilityState',{configurable:true,get:()=>h?'hidden':'visible'});document.dispatchEvent(new Event('visibilitychange'));},h);
  await vis(true);const h=await until(p,s=>!s.running&&s.musicPaused,1500);assert.equal(h.musicPaused,true);
  await vis(false);const v=await until(p,s=>s.running&&!s.musicPaused,2500);assert.equal(v.running,true);assert.equal(v.musicPaused,false);allErrors.push(...errors);await ctx.close();});

await check('reduced motion: no bats, so no bats sound; music still available',async()=>{
  const {ctx,p,errors}=await fresh({intro:true,reduced:true});const b=p.locator('.bairam-opening-controls [data-sound-toggle]');await b.waitFor({state:'visible'});await firstClick(p);
  await p.waitForTimeout(1800);const s=await state(p);assert.equal(s.running,true);assert.equal(s.openingPlaying,false);assert.equal(s.lastOpening,null);allErrors.push(...errors);await ctx.close();});

await check('phone: Sound button fits in the masthead controls and the loading screen, no overflow',async()=>{
  const {ctx,p,errors}=await fresh({intro:true,viewport:{width:360,height:740}});const o=p.locator('.bairam-opening-controls [data-sound-toggle]');await o.waitFor({state:'visible'});
  const ob=await o.boundingBox();assert.ok(ob.x>=0&&ob.x+ob.width<=360&&ob.height>=44,'opening button in view and 44px tall');
  await p.locator('.bairam-opening-controls button[aria-label="Skip opening"]').click();await p.waitForTimeout(800);
  const m=p.locator('.bm-controls [data-sound-toggle]');await m.scrollIntoViewIfNeeded();const mb=await m.boundingBox();assert.ok(mb.x>=0&&mb.x+mb.width<=360&&mb.height>=44,'masthead button in view and 44px tall');
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);allErrors.push(...errors);await ctx.close();});

// Steps 3-4: scroll like a reader (wheel), then read what the engine played.
const stageTop=(p,id)=>p.evaluate(id=>{const c=document.querySelector(`[data-chamber="${id}"]`).closest('.bj-stage');return c.getBoundingClientRect().top+scrollY;},id);
const wheelTo=async(p,y,step=60)=>{await p.mouse.move(700,450);for(;;){const at=await p.evaluate(()=>scrollY);if(Math.abs(at-y)<step)break;await p.mouse.wheel(0,Math.sign(y-at)*step);await p.waitForTimeout(16);}await p.waitForTimeout(900);};
const soundOn=async p=>{const b=p.locator('.bm-controls [data-sound-toggle]');await b.waitFor({state:'visible'});await firstClick(p);await until(p,s=>s.running&&!s.musicPaused);await p.waitForTimeout(600);};

await check('scroll cuts: masthead to map, and the cave mouth, each play the cut bats with the cover flock',async()=>{
  // Start the reader at the very top, then wheel through the cut.
  const {ctx,p,errors}=await fresh();await soundOn(p);
  await p.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await p.waitForTimeout(900);
  await wheelTo(p,await stageTop(p,'reveal'),80);
  const ran=await p.evaluate(()=>document.querySelector('.bmap-flock').dataset.run??'ended');const s=await state(p);
  assert.ok((s.played.cutBats||0)>=1,'cut bats played: '+JSON.stringify(s.played)+' flock '+ran);
  // The second cut: arriving at the cave mouth.
  await p.evaluate(y=>scrollTo({top:y,behavior:'instant'}),await stageTop(p,'projects')+100);await p.waitForTimeout(1200);
  const n=(await state(p)).played.cutBats;await wheelTo(p,await stageTop(p,'about'),80);
  const m=await state(p);assert.equal(m.played.cutBats,n+1,'cave-mouth cut: '+JSON.stringify(m.played));allErrors.push(...errors);await ctx.close();});

await check('flights: a take-off plays a whoosh; landing fades it; holds are silent',async()=>{
  const {ctx,p,errors}=await fresh();await soundOn(p);
  await wheelTo(p,await stageTop(p,'learn')+300,80);const before=await state(p);const n0=(before.played.whooshGentle||0)+(before.played.whooshFast||0);
  await wheelTo(p,await stageTop(p,'ai-suits')+100,40);
  await p.waitForFunction(()=>document.querySelector('.bmap-world').dataset.phase==='hold',null,{timeout:4000});
  const s=await until(p,s=>!s.whooshPlaying,3000);const n1=(s.played.whooshGentle||0)+(s.played.whooshFast||0);
  assert.ok(n1>n0,`whooshes ${n0} -> ${n1}`);assert.equal(s.whooshPlaying,false,'quiet once the camera holds');
  const phase=await p.evaluate(()=>document.querySelector('.bmap-world').dataset.phase);assert.equal(phase,'hold');allErrors.push(...errors);await ctx.close();});

await check('waterfall: loud at the cave mouth, faint or silent far from it, silent on the masthead',async()=>{
  const {ctx,p,errors}=await fresh();await soundOn(p);
  assert.equal((await state(p)).waterTarget,0,'masthead');
  await p.evaluate(y=>scrollTo({top:y,behavior:'instant'}),await stageTop(p,'about')+200);await p.waitForTimeout(2500);
  const far=await state(p);assert.ok(far.waterTarget>=0.9&&far.waterfall>=0.8,'at the cave mouth: '+JSON.stringify({t:far.waterTarget,l:far.waterfall}));
  await p.evaluate(y=>scrollTo({top:y,behavior:'instant'}),await stageTop(p,'reveal')+100);await p.waitForTimeout(2500);
  const map=await state(p);assert.ok(map.waterTarget>0.1&&map.waterTarget<0.6,'whole map, heard from a distance: '+map.waterTarget);
  await p.evaluate(y=>scrollTo({top:y,behavior:'instant'}),await stageTop(p,'learn')+200);await p.waitForTimeout(2500);
  const near=await state(p);assert.ok(near.waterTarget<=0.1,'at the learning deck: '+near.waterTarget);allErrors.push(...errors);await ctx.close();});

await check('vault: picking a suit plays the power-up once; un-picking is silent',async()=>{
  const {ctx,p,errors}=await fresh();await soundOn(p);
  await p.evaluate(y=>scrollTo({top:y,behavior:'instant'}),await stageTop(p,'ai-suits')+200);await p.waitForTimeout(1800);
  const suit=p.locator(".bmap button.bv-bay").first();
  await suit.click();await p.waitForTimeout(300);const a=await state(p);assert.equal(a.played.suitHum,1,'after pick: '+JSON.stringify(a.played));
  await suit.click();await p.waitForTimeout(300);const b=await state(p);assert.equal(b.played.suitHum,1,'after un-pick');allErrors.push(...errors);await ctx.close();});

await check('reduced motion: no cut bats and no whoosh while scrolling (no flock, no flights)',async()=>{
  const {ctx,p,errors}=await fresh({reduced:true});await soundOn(p);
  await wheelTo(p,await stageTop(p,'ai-suits')+300,120);const s=await state(p);
  assert.equal(s.played.cutBats||0,0);assert.equal((s.played.whooshGentle||0)+(s.played.whooshFast||0),0);allErrors.push(...errors);await ctx.close();});

await check('muted: scrolling the journey plays nothing and loads nothing',async()=>{
  const {ctx,p,soundReq,errors}=await fresh({remembered:'0'});await p.locator('.bm-controls [data-sound-toggle]').waitFor({state:'visible'});
  await wheelTo(p,await stageTop(p,'ai-suits')+300,120);const s=await state(p);
  assert.deepEqual(s.played,{});assert.deepEqual(soundReq,[]);assert.equal(s.context,'none');allErrors.push(...errors);await ctx.close();});

for(const route of ['/prototype/bairam','/prototype/masthead']){
  await check(`${route}: no Sound button, no sound requests`,async()=>{const ctx=await browser.newContext();const p=await ctx.newPage();const req=[];p.on('request',r=>{if(r.url().includes('/assets/bairam-map/sound/'))req.push(r.url());});
    await p.goto(base+route,{waitUntil:'networkidle'});await p.waitForTimeout(1500);assert.equal(await p.locator('[data-sound-toggle]').count(),0);assert.deepEqual(req,[]);await ctx.close();});
}
await check('no console or page errors (apart from the inherited root theme warning)',async()=>{assert.deepEqual(allErrors,[]);});
await writeFile(`${root}evidence/${label}-sound-checks.json`,JSON.stringify({url:base,sync,results},null,1));
await browser.close();
console.log(`${results.length-failed}/${results.length}`);process.exit(failed?1:0);
