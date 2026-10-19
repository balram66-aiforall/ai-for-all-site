import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const b=await chromium.launch({headless:true});const results=[];
async function test(name,fn){try{await fn();results.push({name,pass:true});console.log('PASS',name)}catch(e){results.push({name,pass:false,error:e.message});console.log('FAIL',name,e.message)}}
const base='http://localhost:3199';
try{
for(const size of [{width:390,height:844},{width:1440,height:1000}]){
 const c=await b.newContext({viewport:size});const p=await c.newPage();
 await p.addInitScript(()=>{window.transitions=[];new MutationObserver(()=>{const g=document.querySelector('.gotham');if(g)window.transitions.push({t:performance.now(),state:g.dataset.intro})}).observe(document,{subtree:true,attributes:true,attributeFilter:['data-intro']})});
 await p.goto(base+'/prototype',{waitUntil:'networkidle'});
 await test(`${size.width}: automatic opening runs for full duration`,async()=>{await expect(p.getByRole('button',{name:'Replay intro',exact:true})).toBeVisible();const s=await p.evaluate(()=>window.transitions);const a=s.find(x=>x.state==='playing');const z=s.find(x=>x.state==='complete'&&x.t>a?.t);assert(a&&z&&z.t-a.t>=2900,JSON.stringify(s))});
 await p.getByRole('button',{name:'Replay intro',exact:true}).click();
 await p.evaluate(()=>document.getAnimations().forEach(a=>{a.pause();a.currentTime=1350}));
 await test(`${size.width}: building marker avoids identity and project title area`,async()=>{const r=await p.evaluate(()=>{const a=document.querySelector('.g-flying-builder').getBoundingClientRect();const i=document.querySelector('.g-identity').getBoundingClientRect();const f=document.querySelector('.g-project-frame').getBoundingClientRect();return{agent:a.toJSON(),identity:i.toJSON(),frame:f.toJSON()}});assert(r.agent.bottom<=r.frame.top+17,JSON.stringify(r));assert(r.agent.top>r.identity.bottom||r.agent.left>=r.identity.right)});
 await p.keyboard.press('Escape');await c.close();
}
const c=await b.newContext();const p=await c.newPage();let releaseFont;const gate=new Promise(r=>releaseFont=r);
await p.route('**/fonts/gotham/**',async r=>{await gate;await r.continue()});
await p.goto(base+'/prototype',{waitUntil:'domcontentloaded'});
await test('slow fonts do not withhold readable content or completion',async()=>{await expect(p.locator('h1')).toBeVisible();await expect(p.getByRole('button',{name:'Replay intro',exact:true})).toBeVisible();assert.equal(await p.locator('.g-project-caption').evaluate(e=>getComputedStyle(e).opacity),'1')});
releaseFont();await p.unrouteAll({behavior:'wait'});await p.evaluate(()=>document.fonts.ready);await c.close();
const late=await b.newContext();const lp=await late.newPage();let releaseJS;const jsGate=new Promise(r=>releaseJS=r);
await lp.route(/\.(tsx?|jsx?)(\?|$)|\/@vite\//,async r=>{await jsGate;await r.continue()});
await lp.goto(base+'/prototype',{waitUntil:'commit'});
await expect(lp.locator('h1')).toBeVisible();
await lp.evaluate(()=>new Promise(resolve=>setTimeout(resolve,2400)));
releaseJS();await lp.unrouteAll({behavior:'wait'});
await test('late hydration leaves already-visible page intact',async()=>{await expect(lp.getByRole('button',{name:'Replay intro',exact:true})).toBeVisible();assert.equal(await lp.locator('.gotham').getAttribute('data-intro'),'complete')});await late.close();
const w=await b.newContext();const wp=await w.newPage();const notes=[];wp.on('console',m=>{if(m.type()==='error')notes.push(m.text())});await wp.goto(base,{waitUntil:'networkidle'});
await test('root theme hydration warning also exists on unchanged homepage',async()=>assert(notes.some(x=>x.includes('hydrated')&&x.includes('data-theme'))));await w.close();
}finally{await b.close();await writeFile(new URL('../../frontier-aimplify/work/builder/2026-10-11-gotham-opening/evidence/resilience.json',import.meta.url),JSON.stringify(results,null,2))}
if(results.some(x=>!x.pass))process.exitCode=1;
