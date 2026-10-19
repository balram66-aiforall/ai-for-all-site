import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const base=process.env.TEST_URL||'http://localhost:3201';
const root=new URL('../../frontier-aimplify/work/builder/2026-10-11-bairam-workstation/',import.meta.url).pathname;
const browser=await chromium.launch({headless:true}),results=[],bad=[],errors=[],resources=[];
async function check(name,fn){try{await fn();results.push({name,pass:true});console.log('PASS',name)}catch(e){results.push({name,pass:false,error:e.message});console.log('FAIL',name,e.message)}}
try{
 const c=await browser.newContext({viewport:{width:1440,height:960}});const p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400)bad.push(r.url())});
 await p.goto(base+'/prototype/cave',{waitUntil:'networkidle'});
 await check('compiled scene renders and completes arrival',async()=>{await expect(p.locator('.cave')).toHaveAttribute('data-renderer','layered');await expect(p.locator('.cave')).toHaveAttribute('data-intro','complete',{timeout:10000})});
 await check('compiled suit bay navigation and focus restoration',async()=>{await p.getByRole('button',{name:'02 bAIram suit'}).click();await expect(p.locator('.cave-suit-art img')).toHaveJSProperty('complete',true);assert(await p.locator('.cave-suit-art img').evaluate(i=>i.naturalWidth>0));await p.getByRole('button',{name:'Back to the workstation'}).click();await expect(p.getByRole('button',{name:'01 Workstation'})).toBeFocused()});
 await check('compiled pause and replay work',async()=>{await p.getByRole('button',{name:'Pause scene motion'}).click();await expect(p.getByRole('button',{name:'Replay arrival'})).toBeDisabled();await p.getByRole('button',{name:'Enable scene motion'}).click();await p.getByRole('button',{name:'Replay arrival'}).click();await p.getByRole('button',{name:'Skip arrival'}).click();await expect(p.locator('.cave')).toHaveAttribute('data-intro','complete')});
 resources.push(...await p.evaluate(()=>performance.getEntriesByType('resource').map(r=>({name:r.name,bytes:r.transferSize,duration:r.duration}))));
 await check('compiled assets have no HTTP failures',()=>assert.deepEqual(bad,[]));await check('compiled route has no uncaught errors',()=>assert.deepEqual(errors,[]));
 await check('original homepage loads no cave assets or scene code',async()=>{await p.goto(base+'/',{waitUntil:'networkidle'});assert.deepEqual(await p.evaluate(()=>performance.getEntriesByType('resource').filter(r=>/\/assets\/cave\/|\/scene-[^/]+\.js/.test(r.name)).map(r=>r.name)),[])});await c.close();
 const failure=await browser.newContext();const f=await failure.newPage();await f.route('**/scene-*.js',r=>r.abort());await f.goto(base+'/prototype/cave',{waitUntil:'networkidle'});await check('failed compiled scene chunk retains matching still and navigation',async()=>{await expect(f.locator('.cave')).toHaveAttribute('data-renderer','unavailable');await expect(f.locator('.cave-still')).toBeVisible();await f.getByRole('link',{name:'Work',exact:true}).click();assert.equal(new URL(f.url()).hash,'#work')});await failure.close();
}finally{await browser.close();await writeFile(root+'evidence/production.json',JSON.stringify({results,bad,errors,resources},null,2)+'\n')}
if(results.some(r=>!r.pass))process.exitCode=1;
