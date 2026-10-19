// Demo recording of the cave with Sound on. Browser screen recordings carry no audio, so the page's own Web Audio
// output (whatever the engine sends to the speakers) is tapped into a MediaRecorder and saved beside the video;
// ffmpeg then lines the two up (offset logged here) and muxes them. The mix is the real one, not a reconstruction.
// Usage: TEST_URL=http://localhost:3202 node tests/sound-record.mjs  -> <evidence>/video/{screen.webm,audio.webm,offset.json}
import {chromium} from '@playwright/test';
import {mkdir,rename,readdir,writeFile} from 'node:fs/promises';
const base=process.env.TEST_URL||'http://localhost:3202';
const out=(process.env.EVIDENCE_DIR||new URL('../../frontier-aimplify/work/builder/2026-10-18-cave-sound/',import.meta.url).pathname)+'video/';
const vp={width:1280,height:720};
await mkdir(out+'raw/',{recursive:true});
const browser=await chromium.launch({headless:true});
const ctx=await browser.newContext({viewport:vp,recordVideo:{dir:out+'raw/',size:vp}});
await ctx.addInitScript(()=>{
  // Anything connected to the speakers is also connected to a recording tap (one per audio context).
  const connect=AudioNode.prototype.connect;
  AudioNode.prototype.connect=function(dest,...rest){
    const r=connect.call(this,dest,...rest);
    if(dest instanceof AudioDestinationNode){
      if(!window.__rec){
        const tap=this.context.createMediaStreamDestination();
        const rec=new MediaRecorder(tap.stream,{mimeType:'audio/webm;codecs=opus',audioBitsPerSecond:192000});
        const parts=[];rec.ondataavailable=e=>{if(e.data.size)parts.push(e.data);};rec.start(250);
        window.__rec={tap,rec,parts,start:Date.now()};
      }
      connect.call(this,window.__rec.tap);
    }
    return r;
  };
});
const page=await ctx.newPage();const pageStart=Date.now();
await page.goto(base+'/prototype/bairam-map',{waitUntil:'domcontentloaded'});
// The loading screen: Sound is on by default; a first click on the screen lets the browser play it (bats in sync).
const btn=page.locator('.bairam-opening-controls [data-sound-toggle]');await btn.waitFor({state:'visible'});await page.waitForTimeout(300);
await page.mouse.click(640,200);
await page.waitForFunction(()=>!document.querySelector('.bairam-opening'),null,{timeout:15000}).catch(()=>{});
await page.waitForTimeout(2500);
// Scroll like a reader: glide to each room, hold there, move on. Pick a suit in the vault; end at the cave mouth.
const tops=await page.evaluate(()=>[...document.querySelectorAll('.bj-stage > [data-chamber]')].map(n=>({id:n.dataset.chamber,top:n.parentElement.getBoundingClientRect().top+scrollY})));
const glide=(to,ms)=>page.evaluate(([to,ms])=>new Promise(r=>{const from=scrollY,t0=performance.now();const e=t=>t*t*(3-2*t);const step=t=>{const p=Math.min(1,(t-t0)/ms);scrollTo({top:from+(to-from)*e(p),behavior:'instant'});if(p<1)requestAnimationFrame(step);else r();};requestAnimationFrame(step);}),[to,ms]);
const log=[];
for(const {id,top} of tops.slice(1)){
  await glide(top+60,id==='reveal'?3200:2600);await page.waitForTimeout(id==='about'?6000:2200);
  if(id==='ai-suits'){await page.locator('.bmap button.bv-bay').nth(1).click();await page.waitForTimeout(2600);}
  log.push({id,atMs:Date.now()-pageStart,sound:await page.evaluate(()=>window.__caveSound)});
}
// Stop the tap and pull the audio out of the page.
const {b64,start}=await page.evaluate(()=>new Promise(res=>{const s=window.__rec;s.rec.onstop=async()=>{const buf=new Uint8Array(await new Blob(s.parts,{type:'audio/webm'}).arrayBuffer());let bin='';for(let i=0;i<buf.length;i+=32768)bin+=String.fromCharCode(...buf.subarray(i,i+32768));res({b64:btoa(bin),start:s.start});};s.rec.stop();}));
await writeFile(out+'audio.webm',Buffer.from(b64,'base64'));
await writeFile(out+'offset.json',JSON.stringify({audioStartMs:start-pageStart,log},null,1));
await ctx.close();
const f=(await readdir(out+'raw/')).find(n=>n.endsWith('.webm'));await rename(out+'raw/'+f,out+'screen.webm');
await browser.close();console.log('recorded; audio starts',start-pageStart,'ms into the video');
