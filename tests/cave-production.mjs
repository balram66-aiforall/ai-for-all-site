import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const out=new URL('../../frontier-aimplify/work/builder/2026-10-11-batcave/evidence/',import.meta.url).pathname;
const browser=await chromium.launch({headless:true});
const results=[],badResponses=[],pageErrors=[],resources=[];
const check=async(name,fn)=>{try{await fn();results.push({name,pass:true});console.log('PASS',name)}catch(e){results.push({name,pass:false,error:e.message});console.log('FAIL',name,e.message)}};
try{
 const c=await browser.newContext({viewport:{width:1440,height:960},reducedMotion:'reduce'});
 const p=await c.newPage();p.on('response',r=>{if(r.status()>=400)badResponses.push({url:r.url(),status:r.status()})});p.on('pageerror',e=>pageErrors.push(e.message));
 await p.goto('http://localhost:3200/prototype/cave',{waitUntil:'networkidle'});
 await check('production output renders real WebGL',()=>expect(p.locator('.cave')).toHaveAttribute('data-renderer','webgl',{timeout:20000}));
 await check('production project interaction works',async()=>{await p.getByRole('link',{name:'Inspect Keats',exact:true}).click();await expect(p.getByRole('dialog').getByRole('heading',{name:'Keats',exact:true})).toBeVisible();await p.keyboard.press('Escape');await expect(p.getByRole('link',{name:'Inspect Keats',exact:true})).toBeFocused()});
 await check('production cave has no failed HTTP resources',()=>assert.deepEqual(badResponses,[]));
 await check('production cave has no uncaught errors',()=>assert.deepEqual(pageErrors,[]));
 resources.push(...await p.evaluate(()=>performance.getEntriesByType('resource').map(r=>({name:r.name,bytes:r.transferSize,duration:Math.round(r.duration)}))));
 await check('root route does not load the cave 3D bundle',async()=>{await p.goto('http://localhost:3200/',{waitUntil:'networkidle'});assert.deepEqual(await p.evaluate(()=>performance.getEntriesByType('resource').filter(r=>/\/scene-[^/]+\.js/.test(r.name)).map(r=>r.name)),[])});
 await c.close();
}finally{await browser.close();await writeFile(out+'production.json',JSON.stringify({results,badResponses,pageErrors,resources},null,2))}
if(results.some(r=>!r.pass))process.exitCode=1;
