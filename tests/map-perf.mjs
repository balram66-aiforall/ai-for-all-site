// Step 5: smoothness in real Google Chrome (GPU on), scrolling the whole cave journey with the wheel like a person.
// Records every frame interval (rAF) plus Chrome's long-animation-frame reports, per scenario, and a Chrome trace
// for the desktop run. Pass: p95 frame <= 20ms, dropped frames (> 25ms, ie a missed 60Hz vsync) <= 5%, no frame
// over 100ms. CPU-throttled runs approximate slower machines; they are reported, and use a looser bar (p95 <= 34ms).
// Usage: TEST_URL=http://localhost:3202 EVIDENCE_DIR=<dir>/ node tests/map-perf.mjs
import {chromium} from '@playwright/test';
import {mkdir, writeFile} from 'node:fs/promises';
import {gzipSync} from 'node:zlib';
import {readFile, unlink} from 'node:fs/promises';
const base=process.env.TEST_URL||'http://localhost:3202';
const root=process.env.EVIDENCE_DIR||new URL('../../frontier-aimplify/work/builder/2026-10-18-cave-map-step5/',import.meta.url).pathname;
await mkdir(root+'evidence',{recursive:true});
const scenarios=[
  {n:'desktop-retina',vp:{width:1440,height:900},dpr:2,cpu:1,trace:true,strict:true},
  {n:'desktop-cpu4x',vp:{width:1440,height:900},dpr:2,cpu:4,strict:false},
  {n:'phone-cpu4x',vp:{width:390,height:844},dpr:3,cpu:4,mobile:true,strict:false},
];
// Each scenario gets its own browser: a real device never inherits another run's GPU memory.
const launch=()=>chromium.launch({channel:'chrome',headless:true});
let browser=await launch();
const pct=(a,q)=>a[Math.min(a.length-1,Math.floor(q*a.length))];
const report={url:base,chrome:browser.version(),scenarios:{}};let fail=0;
for(const sc of scenarios){
  if(sc!==scenarios[0]){await browser.close();browser=await launch();}
  const ctx=await browser.newContext({viewport:sc.vp,deviceScaleFactor:sc.dpr,isMobile:!!sc.mobile,hasTouch:!!sc.mobile});
  const page=await ctx.newPage();const cdp=await ctx.newCDPSession(page);
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/prototype/bairam-map?intro=0',{waitUntil:'networkidle'});
  await page.waitForFunction(()=>document.querySelector('.bmap-world')?.dataset.ready==='true');
  await page.waitForTimeout(1500);
  if(sc.cpu>1)await cdp.send('Emulation.setCPUThrottlingRate',{rate:sc.cpu});
  await page.evaluate(()=>{const w=window;w.__f=[];w.__loaf=[];w.__shot=[];let l=performance.now();
    const f=t=>{w.__f.push([t-l,scrollY,document.querySelector('.bmap-world').dataset.shot]);l=t;w.__raf=requestAnimationFrame(f);};w.__raf=requestAnimationFrame(f);
    try{new PerformanceObserver(list=>{for(const e of list.getEntries())w.__loaf.push([Math.round(e.duration),Math.round(e.blockingDuration||0),scrollY]);}).observe({type:'long-animation-frame',buffered:false});}catch{}});
  const tracePath=root+`evidence/${sc.n}-trace.json`;
  if(sc.trace)await browser.startTracing(page,{path:tracePath,screenshots:false});
  const total=await page.evaluate(()=>document.documentElement.scrollHeight-innerHeight);
  await page.mouse.move(sc.vp.width/2,sc.vp.height/2);
  // ~2400 px/s of wheel: a steady, brisk read-through. Then a fast flick back up through the last two flights.
  const t0=Date.now();
  for(let y=0;y<total;y+=40){await page.mouse.wheel(0,40);await page.waitForTimeout(16);}
  await page.waitForTimeout(1200);
  for(let i=0;i<40;i++){await page.mouse.wheel(0,-160);await page.waitForTimeout(16);}
  await page.waitForTimeout(1200);
  const secs=(Date.now()-t0)/1000;
  if(sc.trace){await browser.stopTracing();const raw=await readFile(tracePath);await writeFile(tracePath+'.gz',gzipSync(raw));await unlink(tracePath);}
  const {f,loaf}=await page.evaluate(()=>{cancelAnimationFrame(window.__raf);return {f:window.__f.slice(3),loaf:window.__loaf};});
  if(sc.cpu>1)await cdp.send('Emulation.setCPUThrottlingRate',{rate:1});
  const d=f.map(x=>x[0]).sort((a,b)=>a-b);
  const dropped=d.filter(x=>x>25).length;
  // Where the slow frames happen: by the camera shot at that moment.
  const byShot={};for(const [ms,,shot] of f){const k=shot||'?';byShot[k]??={n:0,slow:0,max:0};byShot[k].n++;if(ms>25)byShot[k].slow++;byShot[k].max=Math.max(byShot[k].max,Math.round(ms));}
  const r={secs:+secs.toFixed(1),scrolled:total,frames:d.length,p50:+pct(d,.5).toFixed(1),p95:+pct(d,.95).toFixed(1),p99:+pct(d,.99).toFixed(1),max:+d[d.length-1].toFixed(1),droppedPct:+(100*dropped/d.length).toFixed(1),longFrames:loaf.length,longFramesOver100:loaf.filter(x=>x[0]>100).length,worstLong:loaf.sort((a,b)=>b[0]-a[0]).slice(0,5),byShot,errors};
  const ok=sc.strict?(r.p95<=20&&r.droppedPct<=5&&r.max<=100):(r.p95<=34&&r.max<=150);
  if(!ok)fail++;
  report.scenarios[sc.n]={...sc,...r,pass:ok};
  console.log(`${ok?'PASS':'FAIL'} ${sc.n}: ${r.frames} frames in ${r.secs}s, p50 ${r.p50} p95 ${r.p95} p99 ${r.p99} max ${r.max}ms, dropped ${r.droppedPct}%, long frames ${r.longFrames} (${r.longFramesOver100} over 100ms)${errors.length?' ERRORS '+errors.join(' | '):''}`);
  await ctx.close();
}
await writeFile(root+'evidence/chrome-perf.json',JSON.stringify(report,null,1));
await browser.close();
console.log(fail?`FAIL ${fail} scenario(s)`:'PASS smooth in Chrome');
process.exit(fail?1:0);
