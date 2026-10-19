import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const root=new URL('../../frontier-aimplify/work/builder/2026-10-11-batcave/',import.meta.url).pathname;
const browser=await chromium.launch({headless:true});const results=[];
const check=async(name,fn)=>{try{await fn();results.push({name,pass:true});console.log('PASS',name)}catch(e){results.push({name,pass:false,error:e.message});console.log('FAIL',name,e.message)}};
try{
 for(const width of [390,1440]){
 const c=await browser.newContext({viewport:{width,height:width===390?844:960}});const p=await c.newPage();
 await p.route('**/app/prototype/cave/scene.ts*',r=>r.abort());await p.goto('http://localhost:3199/prototype/cave',{waitUntil:'networkidle'});
 await check(`${width}px: failed 3D import leaves matching still and real links`,async()=>{await expect(p.locator('.cave')).toHaveAttribute('data-renderer','unavailable');await expect(p.locator('.cave-still')).toBeVisible();assert(await p.locator('.cave-still img').evaluate(i=>i.complete&&i.naturalWidth>0));await expect(p.getByRole('button',{name:'Replay arrival'})).toBeDisabled();await p.getByRole('link',{name:'Inspect Gulpy',exact:true}).click();await expect(p.getByRole('dialog')).toBeVisible();await p.keyboard.press('Escape')});
 await p.screenshot({path:root+`shots/${width}-fallback.png`});await c.close();
 }
}finally{await browser.close();await writeFile(root+'evidence/fallback.json',JSON.stringify({results},null,2))}
if(results.some(r=>!r.pass))process.exitCode=1;
