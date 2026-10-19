import { chromium,expect } from '@playwright/test';
import {mkdir,rename} from 'node:fs/promises';
const dir=new URL('../../frontier-aimplify/work/builder/2026-10-11-gotham-opening/',import.meta.url).pathname;
await mkdir(dir+'video',{recursive:true});
const browser=await chromium.launch({headless:true});
try{
 const c=await browser.newContext({viewport:{width:1440,height:1000},recordVideo:{dir:dir+'video',size:{width:1440,height:1000}}});
 await c.addInitScript(()=>sessionStorage.setItem('balram-opening:v1','seen'));
 const p=await c.newPage();await p.goto('http://localhost:3199/prototype',{waitUntil:'networkidle'});await p.evaluate(()=>document.fonts.ready);
 await expect(p.getByRole('button',{name:'Replay intro',exact:true})).toBeVisible();
 await p.getByRole('button',{name:'Replay intro',exact:true}).click();await p.mouse.move(5,5);
 await expect(p.getByRole('button',{name:'Replay intro',exact:true})).toBeVisible();
 await p.evaluate(()=>new Promise(resolve=>setTimeout(resolve,1100)));
 const path=await p.video().path();await c.close();await rename(path,dir+'video/opening-desktop.webm');
 console.log(dir+'video/opening-desktop.webm');
}finally{await browser.close()}
