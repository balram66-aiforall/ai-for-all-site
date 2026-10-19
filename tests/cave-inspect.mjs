import {chromium,expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
const root=new URL('../../frontier-aimplify/work/builder/2026-10-11-batcave/',import.meta.url).pathname;
await mkdir(root+'shots',{recursive:true});
const browser=await chromium.launch({headless:true});
try{
 for(const width of [1440,390]){
  const c=await browser.newContext({viewport:{width,height:width===1440?960:844},deviceScaleFactor:1,reducedMotion:'reduce'});
  const p=await c.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',e=>{if(e.type()==='error')errors.push(e.text())});
  await p.goto('http://localhost:3199/prototype/cave',{waitUntil:'networkidle'});
  await expect(p.locator('.cave')).toHaveAttribute('data-renderer','webgl',{timeout:20000});
  await p.evaluate(()=>document.fonts.ready);
  await p.screenshot({path:root+`shots/${width}-first.png`});
  await p.locator('.cave-webgl canvas').screenshot({path:root+`shots/${width}-environment.png`});
  const metrics=await p.evaluate(()=>({overflow:document.documentElement.scrollWidth-innerWidth,viewport:[innerWidth,innerHeight],scene:[...document.querySelectorAll('.cave-hotspot,.cave-identity,.cave-controls')].map(e=>({class:e.className,box:e.getBoundingClientRect().toJSON()}))}));
  await writeFile(root+`evidence/${width}-inspection.json`,JSON.stringify({metrics,errors},null,2));console.log(width,JSON.stringify({metrics,errors}));await c.close();
 }
}finally{await browser.close()}
