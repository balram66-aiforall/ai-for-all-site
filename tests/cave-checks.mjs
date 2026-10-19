import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
const require=createRequire(import.meta.url);
const base=process.env.TEST_URL||'http://localhost:3199';
const out=new URL('../../frontier-aimplify/work/builder/2026-10-11-batcave/evidence/',import.meta.url).pathname;
await mkdir(out,{recursive:true});
const shots=new URL('../shots/',`file://${out}`).pathname;
await mkdir(shots,{recursive:true});
const results=[],errors=[],requests=[],consoleErrors=[];
const browser=await chromium.launch({headless:true});
async function check(name,fn){try{await fn();results.push({name,pass:true});console.log('PASS',name)}catch(e){results.push({name,pass:false,error:e.message});console.log('FAIL',name,e.message)}}
async function fresh(options={},init){const ctx=await browser.newContext({viewport:{width:1440,height:960},...options});if(init)await ctx.addInitScript(init);const page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/\/api\/aifa/.test(r.url()))requests.push(r.url())});page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text())});return {ctx,page}}
const go=p=>p.goto(base+'/prototype/cave',{waitUntil:'networkidle'});
const complete=p=>expect(p.locator('.cave')).toHaveAttribute('data-intro','complete',{timeout:15000});
const ready=p=>expect(p.locator('.cave')).toHaveAttribute('data-renderer','webgl',{timeout:20000});
const seen=()=>sessionStorage.setItem('balram-cave-arrival:v1','seen');
async function axe(p){await p.addScriptTag({path:require.resolve('axe-core/axe.min.js')});return p.evaluate(()=>window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}}).then(r=>r.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,reason:n.failureSummary}))}))))}
try{
 const {ctx,page}=await fresh({},()=>{window.caveStates=[];new MutationObserver(()=>{const c=document.querySelector('.cave');if(c)window.caveStates.push({state:c.dataset.intro,at:performance.now()})}).observe(document,{subtree:true,attributes:true,attributeFilter:['data-intro']})});
 await go(page);
 await check('real WebGL scene renders',()=>ready(page));
 await check('arrival plays on first visit',async()=>{await complete(page);assert((await page.evaluate(()=>window.caveStates)).some(s=>s.state==='playing'))});
 await check('identity and exact introduction available',async()=>{await expect(page.getByRole('heading',{name:'Balram, bAIram'})).toBeVisible();assert.equal((await page.locator('.cave-introduction').innerText()).replace(/\s+/g,' ').trim(),'I make AI accessible. Learn it simply. Put it to work. Build something that matters.')});
 await check('all three project stations visible',async()=>{for(const name of ['The Pinky Promise','Gulpy','Keats'])await expect(page.getByRole('link',{name:`Inspect ${name}`,exact:true})).toBeVisible()});
 await check('opening completion marks session seen',async()=>assert.equal(await page.evaluate(()=>sessionStorage.getItem('balram-cave-arrival:v1')),'seen'));
 await check('reload does not replay arrival',async()=>{await page.reload({waitUntil:'networkidle'});await ready(page);await complete(page);assert(!(await page.evaluate(()=>window.caveStates)).some(s=>s.state==='playing'))});
 await check('replay and skip work',async()=>{await page.getByRole('button',{name:'Replay arrival',exact:true}).click();await expect(page.locator('.cave')).toHaveAttribute('data-intro','playing');await page.getByRole('button',{name:'Skip arrival',exact:true}).click();await complete(page)});
 await check('Escape interrupts camera travel',async()=>{await page.getByRole('button',{name:'Replay arrival',exact:true}).click();await page.keyboard.press('Escape');await complete(page)});
 await check('pause stops motion and disables replay',async()=>{await page.getByRole('button',{name:'Pause scene motion'}).click();await expect(page.locator('.cave')).toHaveAttribute('data-motion','off');await expect(page.getByRole('button',{name:'Replay arrival'})).toBeDisabled();await page.getByRole('button',{name:'Enable scene motion'}).click();await expect(page.locator('.cave')).toHaveAttribute('data-motion','on')});
 for(const [i,name,href] of [[0,'The Pinky Promise','https://pinky-promises.lovable.app/#'],[1,'Gulpy','https://github.com/balram66-aiforall/Gulpy'],[2,'Keats','https://github.com/balram66-aiforall/Keats']]){
  await check(`${name}: station opens accurate project detail`,async()=>{await page.getByRole('link',{name:`Inspect ${name}`,exact:true}).click();await expect(page.getByRole('dialog')).toBeVisible();await expect(page.getByRole('dialog').getByRole('heading',{name,exact:true})).toBeVisible();assert.equal(await page.locator('.cave-dialog .cave-text-link').getAttribute('href'),href);assert.equal(await page.locator('.cave-dialog-copy>p:not(.cave-eyebrow)').innerText(),await page.locator(`#project-${i} .cave-project-copy>p:not(.cave-eyebrow)`).innerText())});
  await check(`${name}: Escape closes dialog and restores focus`,async()=>{await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toBeHidden();await expect(page.getByRole('link',{name:`Inspect ${name}`,exact:true})).toBeFocused()});
 }
 await check('dialog traps keyboard focus and passes accessibility audit',async()=>{await page.getByRole('link',{name:'Inspect Gulpy',exact:true}).click();try{for(const key of ['Shift+Tab','Tab','Tab','Tab','Tab','Tab']){await page.keyboard.press(key);assert(await page.evaluate(()=>Boolean(document.activeElement.closest('dialog'))),`focus escaped after ${key}`)}assert.deepEqual(await axe(page),[])}finally{await page.getByRole('button',{name:'Close project'}).click()}});
 await check('dynamic reduced motion cancels active arrival',async()=>{await page.getByRole('button',{name:'Replay arrival',exact:true}).click();await page.emulateMedia({reducedMotion:'reduce'});await complete(page);await expect(page.locator('.cave')).toHaveAttribute('data-motion','off');await expect(page.getByRole('button',{name:'Reduced motion enabled'})).toBeDisabled();await page.emulateMedia({reducedMotion:'no-preference'});await page.getByRole('button',{name:'Enable scene motion'}).click()});
 await check('direct navigation reaches content without scroll hijacking',async()=>{await page.getByRole('navigation').getByRole('link',{name:'Agents',exact:true}).click();assert.equal(new URL(page.url()).hash,'#agents');const y=await page.locator('#agents').evaluate(e=>e.getBoundingClientRect().top);assert(y>=0&&y<60)});
 await check('all original project links and articles retained',async()=>{assert.equal(await page.locator('.cave-project').count(),3);assert.equal(await page.locator('.cave-article-list>a').count(),4);assert.equal(await page.locator('.cave-resource-links a').count(),3)});
 await check('local anchors resolve',async()=>{assert.deepEqual(await page.locator('.cave a[href^="#"]').evaluateAll(links=>links.filter(a=>!document.getElementById(a.getAttribute('href').slice(1))).map(a=>a.getAttribute('href'))),[])});
 await check('noindex and no global AI launcher',async()=>{assert.match(await page.locator('meta[name="robots"]').getAttribute('content'),/noindex/);await expect(page.locator('.aifa-assistant-shell')).toBeHidden()});
 await ctx.close();
 for(const width of [320,390,768,1440,1920]){
  const c=await fresh({viewport:{width,height:width<700?844:960},reducedMotion:'reduce'},seen);await go(c.page);await ready(c.page);await complete(c.page);await c.page.evaluate(()=>document.fonts.ready);
  await check(`${width}px: no horizontal overflow`,async()=>assert.equal(await c.page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false));
  await check(`${width}px: all station targets fit and do not overlap`,async()=>{const boxes=await c.page.locator('.cave-hotspot').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,visible:getComputedStyle(e).visibility}}));for(const b of boxes){assert.equal(b.visible,'visible');assert(b.x>=0&&b.x+b.w<=width);assert(b.w>=44&&b.h>=44)}for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){const a=boxes[i],b=boxes[j];assert(a.x+a.w<=b.x||b.x+b.w<=a.x||a.y+a.h<=b.y||b.y+b.h<=a.y,JSON.stringify(boxes))}});
  await check(`${width}px: WCAG A/AA audit clean`,async()=>assert.deepEqual(await axe(c.page),[]));
  await check(`${width}px: no broken project artwork`,async()=>{for(const image of await c.page.locator('.cave-project-art img').all()){await image.scrollIntoViewIfNeeded();await expect(image).toHaveJSProperty('complete',true);assert(await image.evaluate(i=>i.naturalWidth>0));}await c.page.evaluate(()=>scrollTo(0,0));});
  await c.page.screenshot({path:shots+`${width}-cave.png`});
  if(width===390||width===1440){await c.page.getByRole('link',{name:'Inspect The Pinky Promise',exact:true}).click();await c.page.screenshot({path:shots+`${width}-project.png`});await c.page.keyboard.press('Escape');await c.page.screenshot({path:shots+`${width}-full.png`,fullPage:true});}
  await c.ctx.close();
 }
 for(const [name,options,init,hash] of [
  ['reduced motion',{reducedMotion:'reduce'},null,''],
  ['deep link',{},null,'#agents'],
  ['storage denied',{},()=>{Storage.prototype.getItem=()=>{throw Error('denied')};Storage.prototype.setItem=()=>{throw Error('denied')}},''],
  ['WebGL unavailable',{},()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return /webgl/.test(type)?null:original.call(this,type,...args)}},''],
 ]){const c=await fresh(options,init);await c.page.goto(base+'/prototype/cave'+hash,{waitUntil:'networkidle'});await check(`${name}: content and navigation remain usable`,async()=>{await complete(c.page);await expect(c.page.locator('h1')).toBeVisible();assert.equal(await c.page.locator('.cave-project').count(),3);if(name==='WebGL unavailable')await expect(c.page.locator('.cave')).toHaveAttribute('data-renderer','unavailable')});await c.ctx.close();}
 const nojs=await fresh({javaScriptEnabled:false});await go(nojs.page);await check('no JavaScript: content, station anchors and real links usable',async()=>{await expect(nojs.page.locator('h1')).toBeVisible();await expect(nojs.page.locator('.cave-controls')).toBeHidden();await nojs.page.getByRole('link',{name:'Inspect Gulpy',exact:true}).click();assert.equal(new URL(nojs.page.url()).hash,'#project-1');assert.equal(await nojs.page.locator('.cave-project').count(),3)});await nojs.ctx.close();
 const failed=await fresh({reducedMotion:'reduce'});await failed.page.route('**/assets/cave/**',r=>r.abort());await failed.page.route('**/assets/projects/**',r=>r.abort());await go(failed.page);await check('asset failure: project names and actions remain usable',async()=>{await complete(failed.page);for(const name of ['The Pinky Promise','Gulpy','Keats'])await expect(failed.page.locator('.cave-project').getByRole('heading',{name,exact:true})).toBeVisible()});await failed.ctx.close();
 const loss=await fresh({reducedMotion:'reduce'});await go(loss.page);await ready(loss.page);await check('WebGL context loss falls back without losing content',async()=>{await loss.page.locator('canvas').evaluate(c=>c.dispatchEvent(new Event('webglcontextlost',{cancelable:true})));await expect(loss.page.locator('.cave')).toHaveAttribute('data-renderer','unavailable');assert.equal(await loss.page.locator('.cave-project').count(),3)});await loss.ctx.close();
 const zoom=await fresh({viewport:{width:1280,height:960},reducedMotion:'reduce'},seen);await go(zoom.page);await zoom.page.evaluate(()=>document.documentElement.style.zoom='2');await check('200% zoom: no document overflow',async()=>assert.equal(await zoom.page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false));await zoom.ctx.close();
 const req=await browser.newContext();for(const path of ['/','/prototype','/guides','/guides/managers','/prompting-framework'])await check(`existing route ${path} remains HTTP 200`,async()=>assert.equal((await req.request.get(base+path)).status(),200));await req.close();
 await check('zero uncaught page errors',()=>assert.deepEqual(errors,[]));await check('zero AI API calls',()=>assert.deepEqual(requests,[]));
}finally{await browser.close();await writeFile(out+'browser-checks.json',JSON.stringify({results,errors,requests,consoleErrors},null,2))}
const failed=results.filter(r=>!r.pass);console.log(`${results.length-failed.length} passed; ${failed.length} failed`);if(failed.length)process.exitCode=1;
