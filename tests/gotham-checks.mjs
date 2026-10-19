import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
const require = createRequire(import.meta.url);
const base = process.env.TEST_URL || 'http://localhost:3199';
const output = new URL('../../frontier-aimplify/work/builder/2026-10-11-gotham-opening/evidence/',import.meta.url).pathname;
await mkdir(output,{recursive:true});
const results=[]; const errors=[]; const aiRequests=[]; const warnings=[];
const browser=await chromium.launch({headless:true});
async function check(name,fn){try{await fn();results.push({name,pass:true});console.log('PASS',name)}catch(e){results.push({name,pass:false,error:e.message});console.log('FAIL',name,e.message)}}
async function fresh(options={},init){
 const ctx=await browser.newContext({viewport:{width:1440,height:1000},...options});
 if(init)await ctx.addInitScript(init);
 const page=await ctx.newPage();
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>{if(r.url().includes('/api/aifa'))aiRequests.push(r.url())});
 page.on('console',msg=>{if(msg.type()==='error')warnings.push(msg.text())});
 return {ctx,page};
}
const go=page=>page.goto(base+'/prototype',{waitUntil:'networkidle'});
const done=page=>expect(page.locator('.gotham')).toHaveAttribute('data-intro','complete');
const replay=async page=>{await page.getByRole('button',{name:'Replay intro',exact:true}).click();await expect(page.locator('.gotham')).toHaveAttribute('data-intro','playing')};
async function noEffects(page){assert.equal(await page.evaluate(()=>document.getAnimations().filter(a=>a.effect?.target?.closest?.('.gotham')).length),0)}
try{
 const {ctx,page}=await fresh({},()=>{
  window.states=[];window.shifts=[];
  new MutationObserver(()=>{const r=document.querySelector('.gotham');if(r)window.states.push({at:performance.now(),state:r.dataset.intro})}).observe(document,{subtree:true,attributes:true,attributeFilter:['data-intro']});
  new PerformanceObserver(list=>window.shifts.push(...list.getEntries().filter(e=>!e.hadRecentInput).map(e=>({value:e.value,sources:e.sources?.map(s=>s.node?.className)})))).observe({type:'layout-shift',buffered:true});
 });
 await go(page);
 await check('fresh visit automatically starts intro',async()=>assert((await page.evaluate(()=>window.states)).some(s=>s.state==='playing')));
 await check('identity readable during assembly',async()=>{await expect(page.locator('h1')).toBeVisible();assert.equal(await page.locator('h1').evaluate(e=>getComputedStyle(e).opacity),'1');await expect(page.getByText('AI Marketing Lead, Amazon',{exact:true})).toBeVisible()});
 await check('one accessible main heading and static disclosure',async()=>{assert.equal(await page.locator('h1').count(),1);await expect(page.getByRole('heading',{name:'Balram, bAIram',exact:true})).toBeVisible();await expect(page.getByText(/No agents are running live/)).toBeVisible()});
 await check('completes within 3.3 seconds of playing',async()=>{await done(page);const s=await page.evaluate(()=>window.states);const start=s.find(e=>e.state==='playing');const end=s.find(e=>e.state==='complete'&&e.at>start.at);assert(end&&end.at-start.at>=2900&&end.at-start.at<=3300,JSON.stringify(s))});
 await check('no animation remains after completion',()=>noEffects(page));
 await check('first-load layout shifts below 0.01',async()=>{const shifts=await page.evaluate(()=>window.shifts);assert(shifts.reduce((n,s)=>n+s.value,0)<.01,JSON.stringify(shifts))});
 await check('reload does not replay this session',async()=>{await page.reload({waitUntil:'networkidle'});await done(page);assert(!(await page.evaluate(()=>window.states)).some(s=>s.state==='playing'))});
 await check('Replay works and Skip keeps focus on control',async()=>{await replay(page);await page.getByRole('button',{name:'Skip intro',exact:true}).click();await done(page);await expect(page.getByRole('button',{name:'Replay intro',exact:true})).toBeFocused();await noEffects(page)});
 for(const [name,action] of [
  ['Escape',p=>p.keyboard.press('Escape')],
  ['wheel',p=>p.mouse.wheel(0,1)],
  ['touch movement',p=>p.evaluate(()=>window.dispatchEvent(new Event('touchmove')))],
  ['keyboard focus enters content',p=>p.locator('.g-work-link').focus()],
 ])await check(`${name} finishes intro`,async()=>{await page.evaluate(()=>scrollTo(0,0));await replay(page);await action(page);await done(page);await noEffects(page)});
 await check('navigation cancels then reaches Agents',async()=>{await page.evaluate(()=>scrollTo(0,0));await replay(page);await page.getByRole('navigation').getByRole('link',{name:'Agents',exact:true}).click();await done(page);assert.equal(new URL(page.url()).hash,'#agents');const y=await page.locator('#agents').evaluate(e=>e.getBoundingClientRect().top);assert(y>=0&&y<100)});
 await check('Meet the agents reaches real role descriptions',async()=>{await page.locator('.g-agent-dock').click();assert.equal(await page.locator('.g-agent-row').count(),3);for(const name of ['Designer','Builder','Verifier'])await expect(page.getByRole('heading',{name,exact:true})).toBeVisible()});
 await check('repeated replay/skip leaves no stale animation or timer effects',async()=>{await page.evaluate(()=>{history.replaceState(null,'',location.pathname);scrollTo(0,0)});for(let i=0;i<3;i++){await replay(page);await page.keyboard.press('Escape')}await done(page);await noEffects(page)});
 await check('Replay from partially scrolled header returns to top and plays',async()=>{await page.evaluate(()=>scrollTo(0,45));await replay(page);assert.equal(await page.evaluate(()=>scrollY),0);await page.keyboard.press('Escape')});
 await check('viewport change safely ends intro',async()=>{await replay(page);await page.setViewportSize({width:1200,height:900});await done(page);await noEffects(page)});
 await check('reduced-motion change ends an active intro',async()=>{await replay(page);await page.emulateMedia({reducedMotion:'reduce'});await done(page);await expect(page.getByRole('button',{name:'Motion reduced',exact:true})).toBeDisabled();await noEffects(page);await page.emulateMedia({reducedMotion:'no-preference'})});
 await check('reduced-motion change on completed page updates control',async()=>{await done(page);await page.emulateMedia({reducedMotion:'reduce'});await expect(page.getByRole('button',{name:'Motion reduced',exact:true})).toBeDisabled();await page.emulateMedia({reducedMotion:'no-preference'});await expect(page.getByRole('button',{name:'Replay intro',exact:true})).toBeEnabled()});
 await check('Space on Skip control does not accidentally replay',async()=>{await replay(page);await page.keyboard.press('Space');await done(page);await noEffects(page)});
 await check('project link and text match existing content',async()=>{assert.equal(await page.locator('.g-project-frame').getAttribute('href'),'https://pinky-promises.lovable.app/#');assert.equal(await page.locator('.g-project-summary').textContent(),'A tiny promise-making experience for turning intent into something people can feel, remember, and come back to.')});
 await check('noindex metadata',async()=>assert.match(await page.locator('meta[name="robots"]').getAttribute('content'),/noindex/));
 await check('global AI chat remains hidden',async()=>await expect(page.locator('.aifa-assistant-shell')).toBeHidden());
 await check('local anchor targets all exist',async()=>{const bad=await page.locator('.gotham a[href^="#"]').evaluateAll(els=>els.map(a=>a.getAttribute('href')).filter(h=>!document.getElementById(h.slice(1))));assert.deepEqual(bad,[])});
 await ctx.close();
 for(const width of [320,390,768,1024,1440]){
  const c=await fresh({viewport:{width,height:900}},()=>sessionStorage.setItem('balram-opening:v1','seen'));await go(c.page);await c.page.evaluate(()=>document.fonts.ready);
  await check(`${width}px: no horizontal document overflow`,async()=>assert.equal(await c.page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false));
  await check(`${width}px: text and link boxes not clipped`,async()=>{const bad=await c.page.locator('.gotham h1,.gotham h2,.gotham h3,.gotham p,.gotham a,.gotham button').evaluateAll(els=>els.filter(e=>e.getBoundingClientRect().width&&getComputedStyle(e).visibility!=='hidden').filter(e=>{const r=e.getBoundingClientRect();return r.left<-.5||r.right>innerWidth+.5}).map(e=>e.className));assert.deepEqual(bad,[])});
  await check(`${width}px: zero axe WCAG A/AA violations`,async()=>{await c.page.addScriptTag({path:require.resolve('axe-core/axe.min.js')});const violations=await c.page.evaluate(()=>window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}}).then(r=>r.violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)}))));assert.deepEqual(violations,[])});
  if(width===390)await check('mobile: Meet the agents visible in first viewport',async()=>{const r=await c.page.locator('.g-agent-dock').boundingBox();assert(r.y+r.height<900)});
  await c.ctx.close();
 }
 for(const [name,opts,init,hash] of [
  ['reduced-motion preference',{reducedMotion:'reduce'},null,''],
  ['direct Agents link',{},null,'#agents'],
  ['WAAPI unavailable',{},()=>Object.defineProperty(Element.prototype,'animate',{value:undefined,configurable:true}),''],
  ['WAAPI throws midway',{},()=>{const original=Element.prototype.animate;let calls=0;Element.prototype.animate=function(...args){if(++calls===5)throw new Error('simulated animation failure');return original.apply(this,args)}} ,''],
  ['session storage blocked',{},()=>{Storage.prototype.getItem=()=>{throw new Error('storage denied')};Storage.prototype.setItem=()=>{throw new Error('storage denied')}} ,''],
 ]){
  const c=await fresh(opts,init);await c.page.goto(base+'/prototype'+hash,{waitUntil:'networkidle'});
  await check(`${name}: final content available and effects cleared`,async()=>{await done(c.page);await expect(c.page.locator('h1')).toBeVisible();await expect(c.page.locator('.g-project-caption')).toBeVisible();await noEffects(c.page)});
  await c.ctx.close();
 }
 const nojs=await fresh({javaScriptEnabled:false});await go(nojs.page);
 await check('JavaScript disabled: complete semantic portfolio',async()=>{await expect(nojs.page.locator('h1')).toBeVisible();await expect(nojs.page.locator('.g-project-caption')).toBeVisible();await expect(nojs.page.locator('.g-intro-control')).toBeHidden();assert.equal(await nojs.page.locator('.g-agent-row').count(),3)});await nojs.ctx.close();
 const slow=await fresh();let release;const gate=new Promise(r=>release=r);await slow.page.route('**/assets/projects/pinky-promise-640.webp',async route=>{await gate;await route.continue()});
 await slow.page.goto(base+'/prototype',{waitUntil:'domcontentloaded'});
 await check('delayed image: intro finishes without waiting',async()=>{await done(slow.page);await expect(slow.page.locator('h1')).toBeVisible();await expect(slow.page.locator('.g-project-caption')).toBeVisible();await noEffects(slow.page)});
 release();await slow.page.unrouteAll({behavior:'wait'});await slow.ctx.close();
 const missing=await fresh();await missing.page.route('**/assets/projects/pinky-promise-640.webp',r=>r.abort());await go(missing.page);
 await check('failed image: stable frame, project title and link remain',async()=>{await done(missing.page);assert((await missing.page.locator('.g-project-frame').boundingBox()).height>300);await expect(missing.page.getByRole('heading',{name:'The Pinky Promise',exact:true})).toBeVisible()});await missing.ctx.close();
 const zoom=await fresh({viewport:{width:1280,height:1000}},()=>sessionStorage.setItem('balram-opening:v1','seen'));await go(zoom.page);await zoom.page.evaluate(()=>document.documentElement.style.zoom='2');
 await check('200% zoom: no clipped document width',async()=>assert.equal(await zoom.page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false));
 await zoom.ctx.close();
 const checkRoutes=await browser.newContext();for(const path of ['/','/guides','/guides/managers','/guides/operations','/guides/analysts','/guides/client-teams','/prompting-framework'])await check(`unchanged route ${path}: HTTP 200`,async()=>assert.equal((await checkRoutes.request.get(base+path)).status(),200));await checkRoutes.close();
 await check('zero page errors',async()=>assert.deepEqual(errors,[]));await check('zero AI API requests',async()=>assert.deepEqual(aiRequests,[]));
}finally{await browser.close();await writeFile(output+'browser-checks.json',JSON.stringify({results,errors,aiRequests,consoleWarnings:warnings},null,2))}
const failed=results.filter(r=>!r.pass).length;console.log(`${results.length-failed} passed; ${failed} failed`);if(failed)process.exitCode=1;
