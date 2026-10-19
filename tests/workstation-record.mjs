import {chromium,expect} from '@playwright/test';
import {rename} from 'node:fs/promises';
const out=new URL('../../frontier-aimplify/work/builder/2026-10-11-bairam-workstation/shots/',import.meta.url).pathname;
const browser=await chromium.launch({headless:true});
try{
 const c=await browser.newContext({viewport:{width:1440,height:900},recordVideo:{dir:out,size:{width:1440,height:900}}});const p=await c.newPage();const video=p.video();
 await p.goto('http://localhost:3199/prototype/cave',{waitUntil:'networkidle'});await expect(p.locator('.cave')).toHaveAttribute('data-renderer','layered');await expect(p.locator('.cave')).toHaveAttribute('data-intro','complete',{timeout:10000});
 await p.evaluate(()=>new Promise(r=>{let n=0;const f=()=>{if(++n===120)r();else requestAnimationFrame(f)};requestAnimationFrame(f)}));
 await p.getByRole('button',{name:'02 bAIram suit'}).click();await p.locator('.cave-suit-art').evaluate(async e=>Promise.all(e.getAnimations({subtree:true}).map(a=>a.finished)));
 await p.evaluate(()=>new Promise(r=>{let n=0;const f=()=>{if(++n===60)r();else requestAnimationFrame(f)};requestAnimationFrame(f)}));
 await p.getByRole('button',{name:'Back to the workstation'}).click();await c.close();await rename(await video.path(),out+'workstation-walkthrough.webm');
}finally{await browser.close()}
