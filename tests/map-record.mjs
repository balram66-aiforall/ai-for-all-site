import {chromium} from '@playwright/test';
import {mkdir,rename,readdir} from 'node:fs/promises';
const base=process.env.TEST_URL||'http://localhost:3199';const url=base+'/prototype/bairam-map?intro=0';
const out=(process.env.EVIDENCE_DIR||new URL('../../frontier-aimplify/work/builder/2026-10-18-cave-map-art-step2/',import.meta.url).pathname)+'videos/';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true});
for(const vp of [{label:'desktop',width:1280,height:720,seconds:50},{label:'phone',width:390,height:844,seconds:45}]){
  const dir=out+vp.label+'-raw/';
  const ctx=await browser.newContext({viewport:{width:vp.width,height:vp.height},recordVideo:{dir,size:{width:vp.width,height:vp.height}}});
  const page=await ctx.newPage();await page.goto(url,{waitUntil:'networkidle'});await page.waitForTimeout(1200);
  // A steady scroll from top to bottom: every flight and hold at the same pace a reader would see.
  await page.evaluate(seconds=>new Promise(r=>{const max=document.documentElement.scrollHeight-innerHeight;const t0=performance.now();const step=t=>{const p=Math.min(1,(t-t0)/(seconds*1000));window.scrollTo({top:max*p,behavior:'instant'});if(p<1)requestAnimationFrame(step);else setTimeout(r,800);};requestAnimationFrame(step);}),vp.seconds);
  await ctx.close();
  const f=(await readdir(dir)).find(n=>n.endsWith('.webm'));await rename(dir+f,out+`cave-map-${vp.label}.webm`);
}
await browser.close();console.log('recorded');
