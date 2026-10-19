import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
const require=createRequire(import.meta.url);
const base=process.env.TEST_URL||'http://localhost:3199';
const root=process.env.EVIDENCE_DIR||new URL('../../frontier-aimplify/work/builder/2026-10-11-bairam-loading/',import.meta.url).pathname;
const label=process.env.EVIDENCE_LABEL||'browser';
await mkdir(root+'shots',{recursive:true});await mkdir(root+'evidence',{recursive:true});
const browser=await chromium.launch({headless:true});
const results=[],errors=[],bad=[],consoleErrors=[],requests=[];
async function check(name,fn){try{await fn();results.push({name,pass:true});console.log('PASS',name)}catch(e){results.push({name,pass:false,error:e.message});console.log('FAIL',name,e.message)}}
function manualFrames(){
 let id=0;const pending=new Map();
 window.requestAnimationFrame=fn=>{pending.set(++id,fn);return id};
 window.cancelAnimationFrame=id=>pending.delete(id);
 window.__frame=t=>{const callbacks=[...pending.values()];pending.clear();callbacks.forEach(fn=>fn(t));return pending.size};
 window.__pending=()=>pending.size;
}
async function fresh(options={},manual=true){
 const c=await browser.newContext({viewport:{width:1440,height:900},...options});if(manual)await c.addInitScript(manualFrames);
 const p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text())});
 return {c,p};
}
const go=p=>p.goto(base+'/prototype/loading',{waitUntil:'networkidle'});
const ready=p=>expect(p.locator('main')).toHaveAttribute('data-ready','true');
const step=(p,t)=>p.evaluate(t=>window.__frame(t),t);
const replay=p=>p.getByRole('button',{name:'Replay opening'}).click();
const phase=(p,v)=>expect(p.locator('main')).toHaveAttribute('data-phase',v);
const batState=p=>p.locator('.bairam-opening-bat').evaluateAll(es=>es.map(e=>({opacity:Number(e.style.opacity),transform:e.style.transform,wings:[...e.querySelectorAll('[data-wing]')].map(w=>w.getAttribute('transform'))})));
async function axe(p){await p.addScriptTag({path:require.resolve('axe-core/axe.min.js')});return p.evaluate(()=>window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}}).then(r=>r.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.failureSummary)}))))}
try{
 const {c,p}=await fresh();p.on('response',r=>{if(r.status()>=400)bad.push({url:r.url(),status:r.status()})});p.on('request',r=>requests.push(r.url()));
 await go(p);await ready(p);await step(p,0);await step(p,350);
 await check('angular title font is actually loaded, bold and preserves mixed case',async()=>{const style=await p.locator('h1').evaluate(e=>({font:getComputedStyle(e).fontFamily,weight:getComputedStyle(e).fontWeight,case:getComputedStyle(e).textTransform,loaded:document.fonts.check('700 80px "Bairam Display"'),faces:[...document.fonts].filter(f=>f.family.includes('Bairam Display')).map(f=>f.status)}));assert.match(style.font,/Bairam Display/);assert.equal(style.weight,'700');assert.equal(style.case,'none');assert(style.loaded&&style.faces.includes('loaded'));assert(requests.some(u=>u.endsWith('/cinzel-700.woff2')))});
 await check('Batman-inspired black steel gold palette without added image or sound',async()=>{assert.equal(await p.locator('main').evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(8, 10, 12)');assert.equal(await p.locator('.bairam-opening-gold').first().evaluate(e=>getComputedStyle(e).color),'rgb(230, 185, 79)');assert.equal(await p.locator('audio,img,video,canvas').count(),0)});

 const stable=await p.locator('.bairam-opening-slot').evaluateAll(es=>es.map(e=>e.getBoundingClientRect().toJSON()));
 await check('starts with exact Balram, real HTML not an image',async()=>{await phase(p,'balram');assert.equal(await p.locator('[data-from]').allTextContents().then(t=>t.join('')),'Bal');assert.equal(await p.locator('[data-letter="3"],[data-letter="4"],[data-letter="5"]').allTextContents().then(t=>t.join('')),'ram');assert.equal(await p.locator('img,canvas,video').count(),0);assert(await p.locator('[data-from]').evaluateAll(es=>es.every(e=>getComputedStyle(e).opacity==='1')))});
 await p.screenshot({path:root+'shots/'+label+'-01-balram.png'});
 const passState=p=>p.locator('.bairam-opening-pass').evaluateAll(es=>es.map(e=>({opacity:Number(e.style.opacity),box:e.getBoundingClientRect().toJSON()})));
 await step(p,1150);await check('bats fly by while Balram is still Balram',async()=>{await phase(p,'flyby');assert(await p.locator('[data-from]').evaluateAll(es=>es.every(e=>e.style.opacity==='1')));const word=await p.locator('h1').boundingBox();const live=(await passState(p)).filter(b=>b.opacity>.3);assert(live.length>=4,`${live.length} bats in the fly-by`);assert(live.some(b=>b.box.x+b.box.width>word.x&&b.box.x<word.x+word.width),'no bat crossing the name')});
 await step(p,1450);await p.screenshot({path:root+'shots/'+label+'-01b-flyby.png'});
 await step(p,1520);await check('only B, a, l change in place, one at a time',async()=>{await phase(p,'transforming');assert.deepEqual(await p.locator('[data-to]').evaluateAll(es=>es.map(e=>{const o=Number(e.style.opacity);return o===1?'done':o===0?'waiting':'changing'})),['done','changing','waiting']);assert.deepEqual(await p.locator('.bairam-opening-slot').evaluateAll(es=>es.map(e=>e.getBoundingClientRect().toJSON())),stable)});
 await step(p,2300);await check('bAIram is correctly cased and only AI is gold, held clean after the fly-by',async()=>{await phase(p,'bairam');assert((await passState(p)).every(b=>b.opacity===0));assert.equal(await p.locator('[data-to]').allTextContents().then(t=>t.join('')),'bAI');assert.equal(await p.locator('.bairam-opening-gold').allTextContents().then(t=>t.join('')),'AI');assert(await p.locator('[data-to]').evaluateAll(es=>es.every(e=>e.style.opacity==='1')))});
 await p.screenshot({path:root+'shots/'+label+'-02-bairam.png'});
 await step(p,2520);await check('first bat starts within the word, not at the viewport edge',async()=>{const word=await p.locator('h1').boundingBox();const b=await p.locator('.bairam-opening-bat').first().boundingBox();assert(b.x>=word.x&&b.x+b.width<=word.x+word.width);assert(b.y>=word.y&&b.y<=word.y+word.height)});
 await step(p,2960);await p.screenshot({path:root+'shots/'+label+'-03-emerging.png'});
 await check('bats emerge while name is still readable',async()=>{await phase(p,'flight');assert.equal(await p.locator('h1').evaluate(e=>e.style.opacity),'1');assert((await batState(p)).filter(b=>b.opacity>.1).length>=15)});
 const wings=(await batState(p))[0].wings;await step(p,3340);
 await check('flapping flock spreads outward with foreground and distance layers',async()=>{const bats=await batState(p);assert.notDeepEqual(bats[0].wings,wings);const boxes=await p.locator('.bairam-opening-bat').evaluateAll(es=>es.filter(e=>Number(e.style.opacity)>.1).map(e=>e.getBoundingClientRect().toJSON()));assert(Math.max(...boxes.map(b=>b.width))>Math.min(...boxes.map(b=>b.width))*2);assert(Math.max(...boxes.map(b=>b.x))-Math.min(...boxes.map(b=>b.x))>300);assert(Number(await p.locator('h1').evaluate(e=>e.style.opacity))<.5)});
 await p.screenshot({path:root+'shots/'+label+'-04-flight.png'});
 await step(p,4400);await check('completion stops rendering and leaves Replay, no forced navigation',async()=>{await phase(p,'complete');assert.equal(await p.evaluate(()=>window.__pending()),0);assert((await batState(p)).every(b=>b.opacity===0));assert.equal(await p.locator('h1').evaluate(e=>e.style.opacity),'0');await expect(p.getByRole('button',{name:'Replay opening'})).toBeVisible();await expect(p.getByRole('button',{name:'Skip opening'})).toBeHidden();assert.equal(new URL(p.url()).pathname,'/prototype/loading')});
 await check('keyboard Replay and Skip preserve focus',async()=>{await p.getByRole('button',{name:'Replay opening'}).focus();await p.keyboard.press('Enter');await phase(p,'balram');await p.keyboard.press('Tab');await expect(p.getByRole('button',{name:'Skip opening'})).toBeFocused();await p.keyboard.press('Enter');await phase(p,'complete');await expect(p.getByRole('button',{name:'Replay opening'})).toBeFocused()});
 await check('Escape works without focusing controls',async()=>{await replay(p);await p.evaluate(()=>document.activeElement.blur());await p.keyboard.press('Escape');await phase(p,'complete')});
 await check('replay rapidly restarts with one animation frame',async()=>{for(let i=0;i<8;i++)await replay(p);assert.equal(await p.evaluate(()=>window.__pending()),1);await step(p,0);await step(p,350);assert.deepEqual(await p.locator('.bairam-opening-slot').evaluateAll(es=>es.map(e=>e.getBoundingClientRect().toJSON())),stable)});
 await check('dynamic reduced motion removes bats and cancels the frame loop',async()=>{await step(p,3100);await p.emulateMedia({reducedMotion:'reduce'});await phase(p,'complete');assert.equal(await p.evaluate(()=>window.__pending()),0);await expect(p.locator('.bairam-opening-flock')).toBeHidden()});
 await check('isolated prototype has no sound, progress fiction, cave, chat or external calls',async()=>{assert.match(await p.locator('meta[name="robots"]').getAttribute('content'),/noindex/);await expect(p.locator('.aifa-assistant-shell')).toBeHidden();assert.equal(await p.locator('audio,video,progress,[role="progressbar"],.cave').count(),0);assert.deepEqual(requests.filter(u=>!u.startsWith(base)&&!u.startsWith('data:')),[]);assert(!requests.some(u=>u.includes('/assets/cave/')||u.includes('/api/')))});
 await check('no failed code/font requests',()=>assert.deepEqual(bad,[]));await c.close();
 for(const [width,height] of [[320,568],[390,844],[768,1024],[1440,900],[1920,1080],[2560,1440],[844,390]]){
  const {c,p}=await fresh({viewport:{width,height}});await go(p);await ready(p);await step(p,0);await step(p,2300);
  await check(`${width}x${height}: centred readable name, controls fit, no overflow`,async()=>{const box=await p.locator('h1').boundingBox();assert(Math.abs(box.x+box.width/2-width/2)<1);assert(Math.abs(box.y+box.height/2-height/2)<1);assert(box.width<width-32);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth||document.documentElement.scrollHeight>innerHeight),false);for(const b of await p.locator('.bairam-opening-controls button').all()){const rect=await b.boundingBox();assert(rect.height>=44&&rect.x>=0&&rect.x+rect.width<=width&&rect.y+rect.height<=height)}});
  await check(`${width}x${height}: opening name has display-scale presence`,async()=>{const box=await p.locator('h1').boundingBox();assert(box.width/width>=(width>1920?.45:.56),`Name only fills ${(box.width/width*100).toFixed(1)}% of viewport`);assert(box.width/width<.8,'Name needs safe side margins');const slots=await p.locator('[data-letter]').evaluateAll(es=>es.map(e=>e.getBoundingClientRect().toJSON()));assert(Math.abs(slots[0].x-box.x)<1);assert(Math.abs(slots[5].right-(box.x+box.width))<1,'Actual letters must fit the centred heading, not overflow an inherited width cap')});
  await check(`${width}x${height}: WCAG automated audit`,async()=>assert.deepEqual(await axe(p),[]));
  if(width===390){await p.screenshot({path:root+'shots/'+label+'-mobile-name.png'});await step(p,3340);await p.screenshot({path:root+'shots/'+label+'-mobile-flight.png'})}
  await c.close();
 }
 const reduce=await fresh({reducedMotion:'reduce'});await go(reduce.p);await ready(reduce.p);await step(reduce.p,0);await step(reduce.p,1100);
 await check('reduced motion retains the gentle name crossfade',async()=>{await phase(reduce.p,'transforming');await expect(reduce.p.locator('.bairam-opening-flock')).toBeHidden();assert((await batState(reduce.p)).every(b=>!b.opacity))});await step(reduce.p,1800);
 await check('reduced motion rests on bAIram with no active RAF',async()=>{await phase(reduce.p,'complete');assert.equal(await reduce.p.locator('h1').evaluate(e=>e.style.opacity),'1');assert.equal(await reduce.p.evaluate(()=>window.__pending()),0)});await reduce.c.close();
 const nojs=await fresh({javaScriptEnabled:false},false);await go(nojs.p);await check('no JavaScript leaves readable Balram, no broken controls',async()=>{await expect(nojs.p.locator('h1')).toBeVisible();await expect(nojs.p.locator('.bairam-opening-controls')).toBeHidden();assert.equal(await nojs.p.locator('[data-from]').allTextContents().then(t=>t.join('')),'Bal')});await nojs.c.close();
 const failure=await fresh();await failure.p.route('**/fonts/loading/**',r=>r.abort());await go(failure.p);await ready(failure.p);await step(failure.p,0);await step(failure.p,4400);await check('font failure cannot trap opening or disable replay',async()=>{await phase(failure.p,'complete');await replay(failure.p);await phase(failure.p,'balram')});await failure.c.close();
 const live=await fresh({recordVideo:{dir:root+'shots',size:{width:1440,height:900}}},false);await go(live.p);await ready(live.p);
 await check('real-time playback completes without a synthetic test clock',()=>phase(live.p,'complete'));await replay(live.p);await check('real-time replay completes',()=>phase(live.p,'complete'));
 const video=live.p.video();await live.c.close();await video.saveAs(root+'shots/'+label+'-opening.webm');await video.delete();
 const zoom=await fresh();await go(zoom.p);await ready(zoom.p);await zoom.p.evaluate(()=>document.documentElement.style.zoom='2');await step(zoom.p,0);await step(zoom.p,1300);await check('200% zoom retains name and controls without horizontal overflow',async()=>assert.equal(await zoom.p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false));await zoom.c.close();
 const routes=await browser.newContext();for(const route of ['/','/prototype/cave','/guides','/prompting-framework'])await check(`existing route ${route} still returns 200`,async()=>assert.equal((await routes.request.get(base+route)).status(),200));await routes.close();
 await check('no uncaught browser exceptions',()=>assert.deepEqual(errors,[]));
 await check('no unexpected console errors (known root theme warning recorded separately)',()=>assert.deepEqual(consoleErrors.filter(e=>!e.includes('net::ERR_FAILED')&&!(e.includes('hydrated')&&e.includes('data-theme-phase'))),[]));
 // The font failure test deliberately logs a failed fetch; root layout's known hydration warning is recorded, not hidden.
 await writeFile(root+'evidence/'+label+'-console.json',JSON.stringify(consoleErrors,null,2)+'\n');
}finally{await browser.close();await writeFile(root+'evidence/'+label+'.json',JSON.stringify({results,errors,bad,requests},null,2)+'\n')}
const failed=results.filter(r=>!r.pass);console.log(`${results.length-failed.length} passed; ${failed.length} failed`);if(failed.length)process.exitCode=1;
