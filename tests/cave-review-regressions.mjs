import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const out=new URL('../../frontier-aimplify/work/builder/2026-10-11-batcave/evidence/review-regressions.json',import.meta.url).pathname;
const browser=await chromium.launch({headless:true});const results=[];
const check=async(name,fn)=>{try{await fn();results.push({name,pass:true});console.log('PASS',name)}catch(e){results.push({name,pass:false,error:e.message});console.log('FAIL',name,e.message)}};
try{
 // Bound test-clock frame deltas so software WebGL cannot skip the whole 700ms transition.
 const c=await browser.newContext({viewport:{width:1440,height:960}});await c.addInitScript(()=>{sessionStorage.setItem('balram-cave-arrival:v1','seen');const native=requestAnimationFrame;let real=0,clock=0;window.requestAnimationFrame=fn=>native(t=>{if(t!==real){clock+=real?Math.min(100,t-real):0;real=t}fn(clock)});});const p=await c.newPage();
 await p.goto('http://localhost:3199/prototype/cave',{waitUntil:'networkidle'});await expect(p.locator('.cave')).toHaveAttribute('data-renderer','webgl');
 await p.getByRole('link',{name:'Inspect Gulpy',exact:true}).click();
 await p.evaluate(()=>new Promise(resolve=>{let remaining=12;function tick(){if(--remaining===0)resolve();else requestAnimationFrame(tick)}requestAnimationFrame(tick)}));
 await check('closing dialog animates overview return while restoring focus',async()=>{
 const samples=await p.evaluate(()=>new Promise(resolve=>{const target=document.querySelector('.cave-hotspot-0'),samples=[];const observer=new MutationObserver(()=>samples.push(target.getAttribute('style')));observer.observe(target,{attributes:true,attributeFilter:['style']});document.querySelector('.cave-dialog-close').click();let remaining=12;function tick(){if(--remaining===0){observer.disconnect();resolve(samples)}else requestAnimationFrame(tick)}requestAnimationFrame(tick)}));
 assert(new Set(samples).size>=3,`only ${new Set(samples).size} camera positions during return`);await expect(p.getByRole('link',{name:'Inspect Gulpy',exact:true})).toBeFocused();
 });await c.close();
 const ctx=await browser.newContext({reducedMotion:'reduce'}),page=await ctx.newPage();await page.goto('http://localhost:3199/prototype/cave',{waitUntil:'networkidle'});await expect(page.locator('.cave')).toHaveAttribute('data-renderer','webgl');
 const direct=await page.evaluate(async()=>{
 const {createCaveScene}=await import('/app/prototype/cave/scene.ts');
 const host=document.createElement('div');host.style.cssText='position:fixed;inset:0;width:800px;height:600px;z-index:500';document.body.append(host);
 let positions=0;const states=[];const frames=(n)=>new Promise(resolve=>{function frame(){if(--n===0)resolve();else requestAnimationFrame(frame)}requestAnimationFrame(frame)});
 const controller=await createCaveScene(host,{motion:false,intro:false,onState:(state,remember)=>states.push({state,remember:!!remember}),onReady(){},onError(){},onProject(){},onPositions(){positions++}});
 await frames(4);const initial=positions;controller.setMotion(true);await frames(8);const armUpdates=positions-initial;
 host.querySelector('canvas').dispatchEvent(new Event('webglcontextlost',{cancelable:true}));controller.dispose();host.remove();return {armUpdates,states};
 });
 await check('arm-only animation does not publish unchanged hotspot positions',()=>assert.equal(direct.armUpdates,0));
 await check('initial settlement and context loss do not mark arrival seen',()=>assert(direct.states.length>0&&direct.states.every(s=>!s.remember)));
 await check('reduced-motion visit does not suppress a later full arrival',()=>page.evaluate(()=>sessionStorage.getItem('balram-cave-arrival:v1')).then(v=>assert.equal(v,null)));await ctx.close();
}finally{await browser.close();await writeFile(out,JSON.stringify({results},null,2))}
if(results.some(r=>!r.pass))process.exitCode=1;
