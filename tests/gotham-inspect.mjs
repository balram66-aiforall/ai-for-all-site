import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
const out=new URL('../../frontier-aimplify/work/builder/2026-10-11-gotham-opening/screenshots/',import.meta.url).pathname;
await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true});
try {
for(const width of [1440,390,320,768]) {
 const context=await browser.newContext({viewport:{width,height:width===1440?1000:844},deviceScaleFactor:1});
 const page=await context.newPage();
 page.on('pageerror', e=>console.log('PAGEERROR',e.message));
 await page.goto('http://localhost:3199/prototype',{waitUntil:'networkidle'});
 await page.evaluate(()=>document.fonts.ready);
 await page.getByRole('button',{name:'Replay intro',exact:true}).waitFor({timeout:12000});
 await page.screenshot({path:out+`${width}-final.png`});
 await page.screenshot({path:out+`${width}-full.png`,fullPage:true});
 const metrics=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth-innerWidth, fonts:[...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family), sizes:[...document.querySelectorAll('.g-identity,.g-project-frame,.g-stage')].map(e=>({class:e.className,rect:e.getBoundingClientRect().toJSON()}))}));
 await page.addScriptTag({path:require.resolve('axe-core/axe.min.js')});
 const axe=await page.evaluate(()=>window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}}).then(r=>r.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))));
 console.log(width,JSON.stringify({metrics,axe}));
 if(width===1440||width===390){
  await page.getByRole('button',{name:'Replay intro',exact:true}).click();
  await page.evaluate(()=>document.getAnimations().forEach(a=>{a.pause();a.currentTime=1350}));
  await page.screenshot({path:out+`${width}-assembly.png`});
  await page.keyboard.press('Escape');
 }
 await context.close();
}
} finally { await browser.close(); }
