import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const output=new URL('../../frontier-aimplify/work/builder/2026-10-11-batcave/evidence/lifecycle.json',import.meta.url).pathname;
const browser=await chromium.launch({headless:true});
const results=[];
try{
 const context=await browser.newContext({viewport:{width:1440,height:960},reducedMotion:'reduce'});
 await context.addInitScript(()=>{
  window.caveRafCount=0;const original=requestAnimationFrame;
  window.requestAnimationFrame=function(fn){return original.call(window,t=>{window.caveRafCount++;fn(t)})};
 });
 const page=await context.newPage();await page.goto('http://localhost:3199/prototype/cave',{waitUntil:'networkidle'});await expect(page.locator('.cave')).toHaveAttribute('data-renderer','webgl',{timeout:20000});
 async function check(name,fn){try{await fn();results.push({name,pass:true});console.log('PASS',name)}catch(e){results.push({name,pass:false,error:e.message});console.log('FAIL',name,e.message)}}
 const twoFrames=()=>page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
 await check('reduced motion leaves no continuous animation loop',async()=>{await twoFrames();const a=await page.evaluate(()=>window.caveRafCount);await twoFrames();const b=await page.evaluate(()=>window.caveRafCount);assert(b-a<=3,`${b-a} callbacks across two frames`)});
 await check('canvas has bounded resolution',async()=>{const sizes=await page.locator('canvas').evaluate(c=>({width:c.width,height:c.height,css:c.getBoundingClientRect().toJSON()}));assert(sizes.width<=sizes.css.width*1.5+1);assert(sizes.height<=sizes.css.height*1.5+1)});
 await page.emulateMedia({reducedMotion:'no-preference'});await page.getByRole('button',{name:'Enable scene motion'}).click();
 await page.getByRole('button',{name:'Replay arrival'}).click();await expect(page.locator('.cave')).toHaveAttribute('data-intro','playing');
 await check('scrolling away interrupts arrival',async()=>{await page.mouse.wheel(0,1200);await expect(page.locator('.cave')).toHaveAttribute('data-intro','complete')});
 await check('offscreen scene has no continuous animation loop',async()=>{await page.locator('#agents').scrollIntoViewIfNeeded();await twoFrames();const a=await page.evaluate(()=>window.caveRafCount);await twoFrames();const b=await page.evaluate(()=>window.caveRafCount);assert(b-a<=3,`${b-a} callbacks across two frames`)});
 await page.evaluate(()=>scrollTo(0,0));await page.getByRole('button',{name:'Pause scene motion'}).click();
 await check('paused camera remains paused across project interaction',async()=>{await page.getByRole('link',{name:'Inspect Gulpy'}).click();await expect(page.getByRole('dialog')).toBeVisible();await page.keyboard.press('Escape');await twoFrames();const a=await page.evaluate(()=>window.caveRafCount);await twoFrames();const b=await page.evaluate(()=>window.caveRafCount);assert(b-a<=3);await expect(page.locator('.cave')).toHaveAttribute('data-motion','off')});
 await context.close();
 const slow=await browser.newContext({viewport:{width:1440,height:960}});const p=await slow.newPage();let release;const gate=new Promise(r=>release=r);await p.route('**/app/prototype/cave/scene.ts*',async route=>{await gate;await route.continue()});
 await p.goto('http://localhost:3199/prototype/cave',{waitUntil:'domcontentloaded'});await p.getByRole('heading',{name:'Balram, bAIram'}).waitFor();await p.getByRole('navigation').getByRole('link',{name:'Agents',exact:true}).click();release();
 await check('slow scene initialization respects earlier navigation',async()=>{await expect(p.locator('.cave')).toHaveAttribute('data-renderer','webgl',{timeout:20000});await expect(p.locator('.cave')).toHaveAttribute('data-intro','complete');assert.equal(new URL(p.url()).hash,'#agents');assert((await p.evaluate(()=>scrollY))>500)});
 await slow.close();
}finally{await browser.close();await writeFile(output,JSON.stringify({results},null,2))}
if(results.some(r=>!r.pass))process.exitCode=1;
