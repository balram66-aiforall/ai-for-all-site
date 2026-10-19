// Records a scroll-through of /prototype/bairam for review. VIEW=desktop|phone. Not a test.
import {chromium} from '@playwright/test';
import {mkdir,rename,readdir} from 'node:fs/promises';
const base=process.env.TEST_URL||'http://localhost:3199';
const out=process.env.OUT||new URL('../../frontier-aimplify/work/builder/2026-10-17-cave-journey/videos/',import.meta.url).pathname;
const view=process.env.VIEW||'desktop';const phone=view==='phone';
const size=phone?{width:390,height:844}:{width:1440,height:900};
const tmp=out+'raw-'+view+'/';await mkdir(tmp,{recursive:true});
const b=await chromium.launch();
const c=await b.newContext({viewport:size,deviceScaleFactor:phone?2:1,isMobile:phone,hasTouch:phone,recordVideo:{dir:tmp,size}});
const p=await c.newPage();
await p.goto(base+'/prototype/bairam?intro=0',{waitUntil:'networkidle'});
// Warm every image so the recording shows the motion, not first decode.
const H=await p.evaluate(()=>document.documentElement.scrollHeight);
for(let y=0;y<H;y+=600){await p.evaluate(y=>{document.documentElement.style.scrollBehavior='auto';scrollTo(0,y)},y);await p.waitForTimeout(40)}
await p.evaluate(()=>scrollTo(0,0));await p.waitForTimeout(1500);
const g=await p.evaluate(()=>{const top=n=>{let y=0;for(;n;n=n.offsetParent)y+=n.offsetTop;return y};const vh=innerHeight;return [...document.querySelectorAll('.bj-stage')].map(s=>{const h=s.firstElementChild.offsetHeight,t=top(s),pass=s.querySelector(':scope > .bj-passage')?.offsetHeight||0;return {t,h,exit:t+Math.max(0,h-vh)}})});
// Glide: eased scroll between two points over ms, frame by frame, like a trackpad flick.
const glide=(from,to,ms)=>p.evaluate(([from,to,ms])=>new Promise(done=>{const t0=performance.now();const step=t=>{const k=Math.min(1,(t-t0)/ms),e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;scrollTo(0,from+(to-from)*e);if(k<1)requestAnimationFrame(step);else done()};requestAnimationFrame(step)}),[from,to,ms]);
let y=0;const vh=size.height;
for(let i=0;i<g.length;i++){
  const s=g[i];
  // Read the chamber: glide through its content a screen at a time, with a pause.
  const readEnd=s.exit;
  while(y<readEnd-10){const n=Math.min(readEnd,y+vh*.9);await glide(y,n,900);y=n;await p.waitForTimeout(500)}
  if(i===g.length-1)break;
  // The passage: one slow continuous move to the next chamber's settled point.
  const next=g[i+1].t-vh*.2+2;await glide(y,next,2600);y=next;await p.waitForTimeout(900);
  y=g[i+1].t;await glide(next,y,500);await p.waitForTimeout(600);
}
await p.waitForTimeout(1200);
// Then a chapter jump back to the vault via the marker, to show a jump landing settled.
await p.evaluate(()=>{document.documentElement.style.scrollBehavior=''});
await p.locator('.bj-chapters a[href="#ai-suits"]').click();await p.waitForTimeout(2600);
await c.close();await b.close();
const [f]=(await readdir(tmp)).filter(n=>n.endsWith('.webm'));await rename(tmp+f,out+`cave-journey-${view}.webm`);
console.log(out+`cave-journey-${view}.webm`);
