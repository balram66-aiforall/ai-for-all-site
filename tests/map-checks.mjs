import {chromium,webkit,expect} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {CABLE,CABLE_CYCLE,DUST_F,NEAR_F,ROCKS,cableKeyframes,depthFade,layerTransform} from '../app/prototype/bairam-map/depth.ts';
import {CAVE,ENTRY_END,buildPath,cameraAt,cameraTransform,holdShot,smoothDamp,timeline,wideShot} from '../app/prototype/bairam-map/camera.ts';
const base=process.env.TEST_URL||'http://localhost:3199';const url=base+'/prototype/bairam-map?intro=0';const phase1=base+'/prototype/bairam?intro=0';
const root=process.env.EVIDENCE_DIR||new URL('../../frontier-aimplify/work/builder/2026-10-18-cave-map-art-step2/',import.meta.url).pathname;
const label=process.env.EVIDENCE_LABEL||'dev';
await mkdir(root+'shots',{recursive:true});await mkdir(root+'evidence',{recursive:true});
const results=[];const consoleErrors=[];
const check=async(name,fn)=>{try{await fn();results.push({name,ok:true});}catch(e){results.push({name,ok:false,error:String(e.message||e).slice(0,400)});}};
const CHAPTERS=['training','proving-wall','ai-suits','learn','projects','about'];
// Who is Balram?: its own stop after the masthead, held on the painted desk, before the reveal.
const COPY=['who',...CHAPTERS];

// ---- Unit: camera maths and zone data ----
await check('unit: the cave lists desk + the six chapters in order',()=>assert.deepEqual(CAVE.zones.map(z=>z.id),['desk',...CHAPTERS]));
await check('unit: every room fits inside the painting',()=>{for(const w of [CAVE])for(const z of w.zones){assert.ok(z.x-z.rx>=0&&z.x+z.rx<=w.width&&z.y-z.ry>=0&&z.y+z.ry<=w.height,z.id);}});
await check('unit: path passes through every key, swoop is a real midpoint',()=>{
  const a={x:0,y:0,w:100},b={x:100,y:50,w:100};
  const keys=[{s:0,shot:a,label:'a',lift:0},{s:10,shot:a,label:'a',lift:0},{s:20,shot:b,label:'b',lift:.4},{s:30,shot:b,label:'b',lift:0}];
  const p=buildPath(keys);
  for(const k of keys){const c=cameraAt(p,k.s);assert.ok(Math.abs(c.x-k.shot.x)<1e-9&&Math.abs(c.w-k.shot.w)<1e-9,'at '+k.s);}
  const mid=cameraAt(p,15);assert.equal(mid.phase,'travel');assert.ok(Math.abs(mid.w-140)<1e-6,'swoop '+mid.w);
  assert.equal(cameraAt(p,5).phase,'hold');assert.equal(cameraAt(p,-5).label,'a');assert.equal(cameraAt(p,99).label,'b');
  assert.equal(cameraAt(p,14).label,'a');assert.equal(cameraAt(p,16).label,'b');});

// A realistic layout (same rules as the engine's measure) to test the real timeline code.
const synth=(world,vw,vh,wide)=>{const ids=['masthead','who','reveal',...CHAPTERS];const hs=[vh,1500,vh,2400,1300,1000,2100,1800,2600];const pass=vh*1.1;let top=0;const boxes=ids.map((id,i)=>{const h=hs[i],stick=Math.min(0,vh-h),dwell=Math.min(pass*.3,Math.max(0,vh*.3-(h-vh)));const b={id,top,height:h,exit:top-stick+dwell,run:pass-dwell,settle:i===0?0:top-vh*ENTRY_END};top+=h+(i<ids.length-1?pass:0);return b;});const travel=top-vh;return {...timeline(boxes,world,vw,vh,wide,travel),travel,boxes};};
const velocity=(p,s)=>{const a=cameraAt(p,s-.5),b=cameraAt(p,s+.5);const w=(a.w+b.w)/2;return [(b.x-a.x)/w,(b.y-a.y)/w,Math.log(b.w/a.w)];};
const norm=v=>Math.hypot(...v);
for(const [name,world,vw,vh,wide] of [['desktop',CAVE,1440,900,true],['phone',CAVE,390,844,false]]){
  const t=synth(world,vw,vh,wide),p=buildPath(t.keys);
  let peak=0,jump=0,at=0;let prev=velocity(p,1);
  for(let s=2;s<t.travel-1;s+=1){const v=velocity(p,s);peak=Math.max(peak,norm(v));const j=norm(v.map((x,i)=>x-prev[i]));if(j>jump){jump=j;at=s;}prev=v;}
  await check(`unit ${name}: camera speed never jumps (continuous along the whole scroll)`,()=>assert.ok(jump<peak*.02,`largest 1px speed change ${(jump/peak*100).toFixed(2)}% of peak at s=${at}`));
  await check(`unit ${name}: camera never stops dead at a handoff`,()=>{const inner=t.keys.slice(2,-1);for(const k of inner){const sp=norm(velocity(p,k.s));assert.ok(sp>peak*.002,`speed ${(sp/peak*100).toFixed(3)}% of peak at ${k.label} s=${k.s}`);}});
  await check(`unit ${name}: no overshoot past a room (zoom stays within its keys)`,()=>{const ws=t.keys.map(k=>k.shot.w);const lo=Math.min(...ws)*.999;for(let s=0;s<t.travel;s+=7)assert.ok(cameraAt(p,s).w>=lo,'w below every key at '+s);});
  await check(`unit ${name}: copy gaps exist for every handoff and never overlap copy`,()=>{assert.equal(t.gaps.length,7);for(const g of t.gaps)assert.ok(g.b>g.a);assert.deepEqual(t.gaps.map(g=>g.flock),[true,false,false,false,false,false,true]);assert.deepEqual(t.gaps.map(g=>g.labels),[false,true,true,true,true,true,true]);});
}
await check('unit: smoothDamp glides to the target without overshoot',()=>{let x=0,v=0,max=0,prevV=0,dv=0;for(let i=0;i<120;i++){({value:x,velocity:v}=smoothDamp(x,100,v,.14,1/60));max=Math.max(max,x);if(i>0)dv=Math.max(dv,Math.abs(v-prevV));prevV=v;}assert.ok(Math.abs(x-100)<.5,'end '+x);assert.ok(max<=100.001,'overshoot '+max);
  const first=smoothDamp(0,100,0,.14,1/60).value;assert.ok(first<15,'first frame moves '+first+'% of a notch');});
await check('unit: cameraTransform centres the shot',()=>{const {k,transform}=cameraTransform({x:500,y:300,w:800},1600,900);assert.equal(k,2);assert.ok(transform.startsWith('translate3d(-200.0px, -150.0px, 0) scale(2'),transform);});
await check('unit: wide shot contains the whole world',()=>{for(const [w,asp] of [[CAVE,1.6],[CAVE,390/844]]){const s=wideShot(w,asp);assert.ok(s.w>=w.width&&s.w/asp>=w.height,JSON.stringify(s));}});

await check('unit: desktop holds keep each room right of the copy and the view inside the painting on the right',()=>{for(const [vw,vh] of [[1280,800],[1440,900],[1920,1080],[2560,1080]]){const asp=vw/vh;for(const z of CAVE.zones){const s=holdShot(CAVE,z.id,true,asp);const k=vw/s.w,sx=(z.x-s.x)*k+vw/2,sy=(z.y-s.y)*k+vh/2;assert.ok(sx>vw*.55&&sx<vw,`${z.id} at ${vw}x${vh}: room centre x ${sx.toFixed(0)}`);assert.ok(sy>0&&sy<vh,`${z.id} at ${vw}x${vh}: room centre y ${sy.toFixed(0)}`);assert.ok(s.x+s.w/2<=CAVE.width+.5,`${z.id} at ${vw}x${vh}: view runs past the right edge`);}}});
await check('unit: phone holds fill the painting top to bottom and centre the room',()=>{for(const [vw,vh] of [[360,740],[390,844],[430,932],[600,900]]){const asp=vw/vh;for(const z of CAVE.zones){const s=holdShot(CAVE,z.id,false,asp);for(const f of [.985,1.015]){const h=s.w*f/asp;assert.ok(s.y-h/2>=0&&s.y+h/2<=CAVE.height,`${z.id} at ${vw}x${vh} (drift ${f}): ${(s.y-h/2).toFixed(0)}..${(s.y+h/2).toFixed(0)}`);}const sx=(z.x-s.x)*vw/s.w+vw/2;assert.ok(sx>vw*.2&&sx<vw*.8,`${z.id} at ${vw}x${vh}: room centre x ${sx.toFixed(0)}`);}}});
await check('unit: the bio holds on the desk (framed for reading) and leaves the masthead without a swoop',()=>{for(const [vw,vh,wide] of [[1440,900,true],[390,844,false]]){const t=synth(CAVE,vw,vh,wide),p=buildPath(t.keys);const who=t.boxes[1],want=holdShot(CAVE,'desk',wide,vw/vh);const c=cameraAt(p,(who.settle+who.exit)/2);assert.equal(c.label,'who');assert.equal(c.phase,'hold');assert.ok(Math.hypot(c.x-want.x,c.y-want.y)<want.w*.04&&Math.abs(c.w/want.w-1)<.03,JSON.stringify({c,want}));const mast=holdShot(CAVE,'desk',false,vw/vh);for(let s=t.boxes[0].exit;s<who.settle;s+=5){const k=cameraAt(p,s);assert.ok(k.w<=Math.max(mast.w,want.w)*1.05,`swoop out of the masthead: w ${k.w.toFixed(0)} at ${s}`);}}});
await check('unit: phones never swoop (no flight zooms out past the painting)',()=>{const t=synth(CAVE,390,844,false),p=buildPath(t.keys);const reveal=t.boxes[2],learn=t.boxes[3];const h0=CAVE.height;for(let s=learn.settle;s<t.travel;s+=5){const c=cameraAt(p,s);assert.ok(c.w*844/390<=h0+1,`view ${(c.w*844/390).toFixed(0)} tall at s=${s} (${c.label})`);}assert.ok(reveal.exit>0);});

// ---- Unit: depth (step 4) ----
await check('unit: near rocks never cover the room being read, and never fill more than a quarter of the screen',()=>{
  for(const [vw,vh,wide] of [[1280,800,true],[1440,900,true],[1920,1080,true],[2560,1080,true],[390,844,false],[820,1180,false]]){const t=synth(CAVE,vw,vh,wide),p=buildPath(t.keys);
    for(let s=0;s<t.travel;s+=6){const c=cameraAt(p,s),k=vw/c.w,kk=k*NEAR_F,f=depthFade(c.w);if(f<.01)continue;let area=0;
      const hold=c.phase==='hold'&&wide?CAVE.zones.find(z=>z.id===c.label):null;
      for(const r of ROCKS){const x0=vw/2+(r.x-r.rx-c.x)*kk,x1=vw/2+(r.x+r.rx-c.x)*kk,y0=vh/2+(r.y-r.ry-c.y)*kk,y1=vh/2+(r.y+r.ry-c.y)*kk;
        area+=Math.max(0,Math.min(vw,x1)-Math.max(0,x0))*Math.max(0,Math.min(vh,y1)-Math.max(0,y0))*.7;
        if(hold){const zx0=vw/2+(hold.x-hold.rx-c.x)*k,zx1=vw/2+(hold.x+hold.rx-c.x)*k,zy0=vh/2+(hold.y-hold.ry-c.y)*k,zy1=vh/2+(hold.y+hold.ry-c.y)*k;
          const o=Math.max(0,Math.min(x1,zx1,vw)-Math.max(x0,zx0,0))*Math.max(0,Math.min(y1,zy1,vh)-Math.max(y0,zy0,0))*.7/((zx1-zx0)*(zy1-zy0));assert.ok(o*f<.02,`rock over ${hold.id} (${(o*100).toFixed(1)}%) at ${vw}x${vh} s=${s}`);}}
      assert.ok(area/(vw*vh)*f<.26,`rocks cover ${(area/(vw*vh)*f*100).toFixed(0)}% at ${vw}x${vh} s=${s}`);}}});
await check('unit: depth layers ride the camera at their own depth (painting = depth 1)',()=>{const shot={x:1200,y:600,w:1000};const m=v=>+v.match(/scale\(([\d.]+)\)/)[1];
  assert.ok(Math.abs(m(layerTransform(shot,1440,900,NEAR_F))/(1440/1000)-NEAR_F)<1e-4);assert.ok(Math.abs(m(layerTransform(shot,1440,900,DUST_F))/(1440/1000)-DUST_F)<1e-4);
  assert.equal(depthFade(1500),1);assert.equal(depthFade(3231),0);});
await check('unit: cable light starts and ends on the trace and fits inside one cycle',()=>{for(const run of CABLE){const {span,css}=cableKeyframes(run);const a=run.pts[0],b=run.pts[run.pts.length-1];
  assert.ok(span>5&&run.at/CABLE_CYCLE*100+span<100,`${run.id} span ${span.toFixed(1)}% from ${run.at}s`);assert.ok(css.includes(`0.00%{transform:translate3d(${a[0]}px,${a[1]}px,0);opacity:0.00}`),run.id+' start');assert.ok(css.includes(`translate3d(${b[0]}px,${b[1]}px,0);opacity:0}`),run.id+' end');
  for(const [x,y] of run.pts)assert.ok(x>=0&&x<=CAVE.width&&y>=0&&y<=CAVE.height,run.id);}});

// ---- Browser ----
// BROWSER=webkit runs the same checks in WebKit, the engine under Safari (an approximation, not Safari itself).
const browser=await (process.env.BROWSER==='webkit'?webkit:chromium).launch({headless:true,...(process.env.BROWSER==='webkit'&&process.env.WEBKIT_PATH?{executablePath:process.env.WEBKIT_PATH}:{})});
// Frame budget: Chromium 20ms slow / 50ms max. Headless WebKit paints at 30fps even on a blank page (33ms), so
// there the bar is relative to that page's own frame: slow = blank frame + 4ms, max = 1.5x blank frame.
const blankFrame=process.env.BROWSER==='webkit'?await (async()=>{const p=await browser.newPage();await p.setContent('<p>blank</p>');const v=await p.evaluate(()=>new Promise(r=>{const o=[];let l=performance.now();const f=t=>{o.push(t-l);l=t;if(o.length<60)requestAnimationFrame(f);else r(o.slice(5).sort((a,b)=>a-b)[27]);};requestAnimationFrame(f);}));await p.close();return v;})():0;
const FRAME_SLOW=blankFrame?blankFrame+4:20,FRAME_MAX=blankFrame?blankFrame*1.5:50;
const ignore=e=>e.includes('hydrated')&&e.includes('data-theme-phase');
const go=async(page,s)=>{await page.evaluate(y=>window.scrollTo({top:y,behavior:'instant'}),s);await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>requestAnimationFrame(r)))));await page.waitForFunction(()=>document.querySelector('.bmap-world').dataset.settled==='true',null,{timeout:4000});};
const state=page=>page.evaluate(()=>{const w=document.querySelector('.bmap-world'),c=document.querySelector('.bmap-camera');const m=new DOMMatrix(getComputedStyle(c).transform);return {shot:w.dataset.shot,phase:w.dataset.phase,layout:w.dataset.layout,ready:w.dataset.ready,k:m.a,tx:m.e,ty:m.f,opacity:getComputedStyle(w).opacity,label:+(w.style.getPropertyValue('--bmap-label')||0)};});
const geometry=page=>page.evaluate(()=>{const vh=innerHeight;return {vh,vw:innerWidth,max:document.documentElement.scrollHeight-vh,st:[...document.querySelectorAll('main .bj-stage')].map(s=>{const c=s.firstElementChild,p=s.querySelector(':scope > .bj-passage');return {id:c.dataset.chamber,top:s.getBoundingClientRect().top+scrollY,height:c.offsetHeight,pass:p?p.offsetHeight:0};})};});
const holdAt=g=>g.st.map(st=>st.top+10);
const I=(g,id)=>g.st.findIndex(s=>s.id===id);
const midAt=(g,i)=>{const a=g.st[i],b=g.st[i+1];const exit=a.top+Math.max(0,a.height-g.vh);const settle=b.top-.2*g.vh;return (exit+settle)/2;};

// Phase 1 copy, chamber by chamber: the map must not change a word.
const ref={};
{const page=await browser.newPage({viewport:{width:1440,height:900}});await page.goto(phase1,{waitUntil:'networkidle'});
 for(const id of COPY)ref[id]=await page.$eval(`#${id} > [data-chamber]`,n=>n.textContent.replace(/\s+/g,' ').trim());await page.close();}

for(const vp of [{label:'desktop',width:1440,height:900,world:CAVE,wide:true},{label:'phone',width:390,height:844,world:CAVE,wide:false}]){
  const page=await browser.newPage({viewport:{width:vp.width,height:vp.height},deviceScaleFactor:vp.label==='phone'?2:1});
  page.on('console',m=>{if(m.type()==='error'&&!ignore(m.text()))consoleErrors.push(vp.label+': '+m.text());});
  page.on('pageerror',e=>consoleErrors.push(vp.label+': '+e.message));
  const res=await page.goto(url,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);await go(page,0);
  const g=await geometry(page);
  await check(vp.label+' status 200 and world ready',async()=>{assert.equal(res.status(),200);const s=await state(page);assert.equal(s.ready,'true');assert.equal(s.layout,vp.label);assert.equal(s.opacity,'0','world must stay hidden behind the masthead');});
  await check(vp.label+' stage order: masthead, Who is Balram?, reveal, six chapters',()=>assert.deepEqual(g.st.map(s=>s.id),['masthead','who','reveal',...CHAPTERS]));
  await check(vp.label+' the painted cave loads once, full size, as AVIF',async()=>{const imgs=await page.$$eval('.bmap-art-img',a=>a.map(i=>({ok:i.complete,w:i.naturalWidth,h:i.naturalHeight,src:i.currentSrc})));assert.equal(imgs.length,1);assert.ok(imgs[0].ok&&imgs[0].w===3168&&imgs[0].h===1344,JSON.stringify(imgs[0]));assert.ok(imgs[0].src.endsWith('.avif'),imgs[0].src);});
  await check(vp.label+' every room sits on a lit part of the painting',async()=>{const r=await page.evaluate(async zones=>{const img=document.querySelector('.bmap-art-img');await img.decode();const c=document.createElement('canvas');c.width=img.naturalWidth;c.height=img.naturalHeight;const x=c.getContext('2d');x.drawImage(img,0,0);const lum=(a,b,w,h)=>{const d=x.getImageData(a,b,w,h).data;let s=0;for(let i=0;i<d.length;i+=4)s+=.2126*d[i]+.7152*d[i+1]+.0722*d[i+2];return s/(d.length/4);};const all=lum(0,0,c.width,c.height);return {all,rooms:zones.map(z=>({id:z.id,l:lum(Math.round(z.x-z.rx*.5),Math.round(z.y-z.ry*.5),Math.round(z.rx),Math.round(z.ry))}))};},vp.world.zones);for(const z of r.rooms)assert.ok(z.l>r.all*1.15,`${z.id} centre luminance ${z.l.toFixed(1)} vs painting ${r.all.toFixed(1)}`);});
  await check(vp.label+' top of page parks the hidden camera on the desk',async()=>{const s=await state(page);assert.equal(s.shot,'masthead');const want=vp.width/holdShot(vp.world,'desk',false,vp.width/vp.height).w;assert.ok(Math.abs(s.k-want)/want<.035,`k ${s.k} want ${want}`);});
  await page.screenshot({path:`${root}shots/${vp.label}-00-masthead.png`});
  const holds=holdAt(g);
  await check(vp.label+' masthead stays clean: world hidden while its copy shows, fully in once it has gone',async()=>{const at=async y=>{await go(page,y);await page.waitForTimeout(320);return page.evaluate(()=>({w:+getComputedStyle(document.querySelector('.bmap-world')).opacity,m:+getComputedStyle(document.querySelector('#masthead')).opacity}));};
    for(const f of [0,.1,.2,.3]){const r=await at(g.vh*f);if(r.m>.02)assert.equal(r.w,0,`world ${r.w} under masthead ${r.m} at ${f}vh`);}for(const i of [1,2]){const r=await at(holds[i]);assert.equal(r.w,1,`world at ${g.st[i].id} `+r.w);}});
  await go(page,holds[1]);
  await check(vp.label+' Who is Balram? holds on the painted desk, copy readable, no chapter marked',async()=>{const s=await state(page);assert.equal(s.shot,'who');assert.equal(s.phase,'hold');const want=vp.width/holdShot(vp.world,'desk',vp.wide,vp.width/vp.height).w;assert.ok(Math.abs(s.k-want)/want<.03,`k ${s.k} want ${want}`);const z=vp.world.zones.find(z=>z.id==='desk');const sx=z.x*s.k+s.tx,sy=z.y*s.k+s.ty;assert.ok(sx>0&&sx<vp.width&&sy>0&&sy<vp.height,`desk centre ${sx},${sy}`);if(vp.wide)assert.ok(sx>vp.width*.55,'desk sits right of the copy '+sx);const o=await page.$eval('#who > [data-chamber]',n=>+getComputedStyle(n).opacity);assert.ok(o>.95,'opacity '+o);assert.equal(await page.$$eval('.bj-chapters a[aria-current]',a=>a.length),0);await expect(page.getByRole('heading',{name:'The human behind AI For All.'})).toBeInViewport();});
  await page.screenshot({path:`${root}shots/${vp.label}-00b-who.png`});
  await go(page,holds[2]);
  await check(vp.label+' reveal shows the whole map',async()=>{const s=await state(page);assert.equal(s.shot,'reveal');const w=wideShot(vp.world,vp.width/vp.height).w;assert.ok(Math.abs(s.k-vp.width/w)/s.k<.02,`k ${s.k} want ${vp.width/w}`);});
  await page.screenshot({path:`${root}shots/${vp.label}-01-reveal.png`});
  for(let i=3;i<g.st.length;i++){const id=g.st[i].id;await go(page,holds[i]);
    await check(`${vp.label} hold on ${id}: right room, right zoom, room on screen`,async()=>{const s=await state(page);assert.equal(s.shot,id);assert.equal(s.phase,'hold');const z=vp.world.zones.find(z=>z.id===id);const want=vp.width/holdShot(vp.world,id,vp.wide,vp.width/vp.height).w;assert.ok(Math.abs(s.k-want)/want<.03,`k ${s.k} want ${want}`);const sx=z.x*s.k+s.tx,sy=z.y*s.k+s.ty;assert.ok(sx>0&&sx<vp.width&&sy>0&&sy<vp.height,`room centre ${sx},${sy}`);if(vp.wide)assert.ok(sx>vp.width*.55,'room sits right of the copy '+sx);else{const top=-s.ty/s.k,bottom=(vp.height-s.ty)/s.k;assert.ok(top>=-1&&bottom<=vp.world.height+1,`view ${top.toFixed(0)}..${bottom.toFixed(0)} past the painting`);}});
    await check(`${vp.label} chapter marker on ${id}`,async()=>assert.equal(await page.$eval('.bj-chapters a[aria-current]',a=>a.hash),'#'+id));
    await check(`${vp.label} ${id} copy readable while held`,async()=>{const o=await page.$eval(`#${id} > [data-chamber]`,n=>+getComputedStyle(n).opacity);assert.ok(o>.95,'opacity '+o);});
    await page.screenshot({path:`${root}shots/${vp.label}-${String(i).padStart(2,'0')}-${id}.png`});}
  for(let i=1;i<g.st.length-1;i++){const a=g.st[i].id,b=g.st[i+1].id;const s0=midAt(g,i);await go(page,s0);
    await check(`${vp.label} flight ${a} -> ${b}: travelling, copy cleared${i>2?(vp.wide?', camera swoops back':', painting fills the screen top to bottom'):''}`,async()=>{const s=await state(page);assert.equal(s.phase,'travel');
      const op=await page.evaluate(([a,b])=>[a,b].map(id=>+getComputedStyle(document.querySelector(`[data-chamber="${id}"]`)).opacity),[a,b]);assert.ok(op[0]<.15&&op[1]<.15,'copy opacity '+op);
      if(i>2&&vp.wide){const asp=vp.width/vp.height,ka=vp.width/holdShot(vp.world,a,true,asp).w,kb=vp.width/holdShot(vp.world,b,true,asp).w;assert.ok(s.k<Math.min(ka,kb)*.95,`k ${s.k} vs ${ka},${kb}`);}
      if(i>2&&!vp.wide){const top=-s.ty/s.k,bottom=(vp.height-s.ty)/s.k,left=-s.tx/s.k,right=(vp.width-s.tx)/s.k;assert.ok(top>=-1&&bottom<=vp.world.height+1&&left>=-1&&right<=vp.world.width+1,`view ${left.toFixed(0)},${top.toFixed(0)} .. ${right.toFixed(0)},${bottom.toFixed(0)} past the painting`);}});
    if(i===1||i===3||i===5)await page.screenshot({path:`${root}shots/${vp.label}-flight-${a}-to-${b}.png`});}
  for(const id of COPY)await check(`${vp.label} ${id} copy matches Phase 1 word for word`,async()=>{const t=await page.$eval(`#${id} > [data-chamber]`,n=>n.textContent.replace(/\s+/g,' ').trim());assert.equal(t,ref[id]);});
  await check(vp.label+' legend link flies to the mission room',async()=>{await go(page,holds[2]);await page.click('.bmap-legend a[href="#training"]');await page.waitForFunction(()=>document.querySelector('.bmap-world').dataset.shot==='training'&&document.querySelector('.bmap-world').dataset.phase==='hold',null,{timeout:8000});assert.equal(await page.evaluate(()=>location.hash),'#training');});
  await check(vp.label+' room labels never share the screen with chamber copy',async()=>{let both=0,seen=0;for(let i=0;i<g.st.length-1;i++){const a=g.st[i],bb=g.st[i+1];const s0=a.top+Math.max(0,a.height-g.vh),s1=bb.top;for(let k=0;k<=30;k++){const y=s0+(s1-s0)*k/30;await page.evaluate(y=>window.scrollTo({top:y,behavior:'instant'}),y);await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
      const r=await page.evaluate(()=>{const lab=+(document.querySelector('.bmap-world').style.getPropertyValue('--bmap-label')||0);const copy=Math.max(...[...document.querySelectorAll('.bj-stage > [data-chamber]')].filter(n=>n.dataset.chamber!=='reveal').map(n=>+getComputedStyle(n).opacity));return {lab,copy};});if(r.lab>.01)seen++;if(r.lab>.01&&r.copy>.01)both++;}}
    assert.equal(both,0,both+' samples with labels over copy');assert.ok(seen>20,'labels shown in only '+seen+' samples');});
  await check(vp.label+' bats sweep the masthead-to-desk cut, with no room names',async()=>{await go(page,0);const gap0=g.st[0].height+g.vh*.05;await page.evaluate(y=>window.scrollTo({top:y,behavior:'instant'}),gap0);await page.waitForFunction(()=>document.querySelector('.bmap-flock').hasAttribute('data-run'),null,{timeout:3000});await page.waitForTimeout(500);assert.equal(+(await state(page)).label,0,'no room names on the way to the bio');await page.screenshot({path:`${root}shots/${vp.label}-flock.png`});});
  if(vp.label==='desktop')await check('desktop wheel notches glide: camera moves over many frames, no single-frame jump',async()=>{await go(page,midAt(g,4)-g.vh*.45);await page.mouse.move(vp.width/2,vp.height/2);
    const run=page.evaluate(()=>new Promise(r=>{const c=document.querySelector('.bmap-camera');const out=[];const t0=performance.now();const step=()=>{const m=new DOMMatrix(getComputedStyle(c).transform);out.push({t:performance.now()-t0,cx:(innerWidth/2-m.e)/m.a,cy:(innerHeight/2-m.f)/m.a,k:m.a});if(performance.now()-t0<1600)requestAnimationFrame(step);else r(out);};requestAnimationFrame(step);}));
    for(let n=0;n<5;n++){await page.mouse.wheel(0,100);await page.waitForTimeout(110);}
    const out=await run;const d=[];for(let i=1;i<out.length;i++){const a=out[i-1],b=out[i];d.push(Math.hypot((b.cx-a.cx)*a.k,(b.cy-a.cy)*a.k)+Math.abs(Math.log(b.k/a.k))*vp.width);}
    const total=d.reduce((x,y)=>x+y,0),moving=d.filter(x=>x>.25).length,max=Math.max(...d);
    await writeFile(`${root}evidence/${label}-wheel.json`,JSON.stringify({total,moving,max,d}));
    assert.ok(total>20,'camera barely moved '+total);assert.ok(moving>=20,'moved on only '+moving+' frames');assert.ok(max<=total/5*.45,`max frame ${max.toFixed(1)}px vs ${(total/5).toFixed(1)}px per notch`);});
  // Step 4: depth layers and loops.
  const fx=()=>page.evaluate(()=>{const names=a=>a.animationName||'';const all=document.getAnimations().filter(a=>/^bmap-(fall|mist|flicker|cable-|drift)/.test(names(a)));const near=document.querySelector('.bmap-near'),dust=document.querySelector('.bmap-dust'),cam=document.querySelector('.bmap-camera');const k=e=>new DOMMatrix(getComputedStyle(e).transform).a;
    return {running:all.filter(a=>a.playState==='running').length,paused:all.filter(a=>a.playState==='paused').length,kinds:[...new Set(all.map(a=>names(a).replace(/^bmap-cable-.*/,'bmap-cable')))].sort(),nearOp:+getComputedStyle(near).opacity,nearK:k(near)/k(cam),dustK:k(dust)/k(cam),rocks:[...document.querySelectorAll('.bmap-rock')].map(r=>getComputedStyle(r).backgroundImage)};});
  await check(vp.label+' step 4: loops run on the painting (waterfall, mist, screens, cable, dust)',async()=>{await go(page,holds[I(g,'training')]);const f=await fx();assert.deepEqual(f.kinds,['bmap-cable','bmap-drift','bmap-fall','bmap-flicker','bmap-mist']);assert.ok(f.running>=20,'running '+f.running);});
  await check(vp.label+' step 4: near rock and dust ride the camera at their depth, shown close in, gone on the whole map',async()=>{await go(page,midAt(g,4));const f=await fx();assert.ok(Math.abs(f.nearK-NEAR_F)<.01&&Math.abs(f.dustK-DUST_F)<.01,`depth ${f.nearK} ${f.dustK}`);assert.equal(f.nearOp,1);assert.equal(f.rocks.length,5);assert.ok(f.rocks.every(b=>b.includes('near-rock-')),'sprites');
    await go(page,holds[2]);const w=await fx();assert.equal(w.nearOp,0,'near layer on the whole map');});
  await check(vp.label+' step 4: rock sprites load',async()=>{const r=await page.evaluate(async()=>Promise.all([0,1,2,3,4].map(i=>fetch(`/assets/bairam-map/near-rock-${i}.webp`).then(r=>r.ok&&r.headers.get('content-type')))));assert.ok(r.every(t=>t&&t.includes('webp')),JSON.stringify(r));});
  await check(vp.label+' step 4: loops rest under the masthead',async()=>{await go(page,0);const f=await fx();assert.equal(f.running,0,'running '+f.running);});
  await go(page,midAt(g,5)-g.vh*.1);await page.screenshot({path:`${root}shots/${vp.label}-step4-rock.png`});
  await check(vp.label+' no horizontal overflow',async()=>{const o=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);assert.ok(o<=0,'overflow '+o);});
  await check(vp.label+' frame budget through two flights',async()=>{await go(page,midAt(g,3)-g.vh);const d=await page.evaluate(()=>new Promise(r=>{const out=[];let last=performance.now(),n=0;const step=t=>{out.push(t-last);last=t;window.scrollBy({top:24,behavior:'instant'});if(++n<160)requestAnimationFrame(step);else r(out.slice(2));};requestAnimationFrame(step);}));const over=d.filter(x=>x>FRAME_SLOW).length,max=Math.max(...d);
    await writeFile(`${root}evidence/${label}-${vp.label}-frames.json`,JSON.stringify({max,over,n:d.length,d}));assert.ok(max<FRAME_MAX&&over<=d.length/8,`max ${max.toFixed(1)}ms, ${over}/${d.length} over ${FRAME_SLOW.toFixed(1)}ms`);});
  await page.close();
}

// The sharp painting: loads after the page, swaps in only while the camera holds, and really is sharper on a 2x screen.
const watchArt=()=>{window.__artLog=[];new MutationObserver(ms=>{for(const m of ms){const w=m.target;if(w.classList&&w.classList.contains('bmap-world')&&m.attributeName==='data-art')window.__artLog.push({art:w.dataset.art,phase:w.dataset.phase,settled:w.dataset.settled});}}).observe(document,{attributes:true,subtree:true,attributeFilter:['data-art']});};
for(const vp of [{label:'desktop',width:1440,height:900,dsf:1,file:'cave-map-6336.avif',w:6336},{label:'phone',width:390,height:844,dsf:3,file:'cave-map-4752.avif',w:4752}]){
  const ctx=await browser.newContext({viewport:{width:vp.width,height:vp.height},deviceScaleFactor:vp.dsf});await ctx.addInitScript(watchArt);
  // Hold the sharp file back until the camera is mid-flight, so it arrives at the worst moment.
  let release;const gate=new Promise(r=>{release=r;});await ctx.route(/cave-map-(6336|4752)\./,async r=>{await gate;await r.continue();});
  const page=await ctx.newPage();
  page.on('pageerror',e=>consoleErrors.push('art '+vp.label+': '+e.message));
  await page.goto(url,{waitUntil:'load'});
  await check(`${vp.label} sharp painting (${vp.file}) swaps in during a hold, never mid-flight`,async()=>{
    await page.evaluate(()=>document.fonts.ready);await go(page,0);
    const g=await geometry(page);const s0=midAt(g,3);await go(page,s0);
    assert.equal((await state(page)).phase,'travel','precondition: camera mid-flight');
    await page.waitForFunction(()=>document.querySelector('.bmap-world').dataset.art==='loading',null,{timeout:6000});
    release();
    await page.waitForFunction(()=>document.querySelector('.bmap-world').dataset.art==='ready',null,{timeout:15000});
    await page.waitForTimeout(800);
    const mid=await page.evaluate(()=>{const w=document.querySelector('.bmap-world');return w.dataset.art+'/'+w.dataset.phase;});assert.equal(mid,'ready/travel','mid-flight state '+mid);
    await go(page,holdAt(g)[5]);
    await page.waitForFunction(()=>document.querySelector('.bmap-world').dataset.art==='hi',null,{timeout:15000});
    const r=await page.evaluate(()=>{const i=document.querySelector('.bmap-art-hi');return {src:i.currentSrc||i.src,w:i.naturalWidth,hidden:i.hidden,log:window.__artLog};});
    assert.ok(r.src.endsWith(vp.file)&&r.w===vp.w&&!r.hidden,JSON.stringify(r).slice(0,300));
    const sw=r.log.find(x=>x.art==='hi');assert.ok(sw&&sw.phase==='hold'&&sw.settled==='true','swap happened at '+JSON.stringify(sw));});
  await ctx.close();
}
await check('desktop at 2x density: a held room is visibly sharper with the sharp painting',async()=>{
  // The mission room (04): its chamber is glass on the right, so the painting itself is on screen there.
  const edge=async(page)=>{await page.evaluate(()=>document.fonts.ready);const g=await geometry(page);await go(page,holdAt(g)[I(g,'training')]);
    // Measure the painting alone: hide the copy, chapter list and cable (identical in both, and they dominate edges).
    await page.addStyleTag({content:'main .bj-stage > [data-chamber], .bj-chapters, .bj-cable { visibility: hidden !important; }'});await page.waitForTimeout(300);const s=await state(page);const z=CAVE.zones.find(z=>z.id==='training');const cx=z.x*s.k+s.tx,cy=z.y*s.k+s.ty;
    const buf=await page.screenshot({clip:{x:Math.min(1440-420,Math.max(0,cx-210)),y:Math.max(0,Math.min(900-360,cy-180)),width:420,height:360}});
    return page.evaluate(async b64=>{const im=new Image();im.src='data:image/png;base64,'+b64;await im.decode();const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const x=c.getContext('2d');x.drawImage(im,0,0);const d=x.getImageData(0,0,c.width,c.height).data,W=c.width,H=c.height;const L=(i)=>.2126*d[i]+.7152*d[i+1]+.0722*d[i+2];let sum=0,sq=0,n=0;for(let y=1;y<H-1;y++)for(let X=1;X<W-1;X++){const i=(y*W+X)*4;const v=4*L(i)-L(i-4)-L(i+4)-L(i-W*4)-L(i+W*4);sum+=v;sq+=v*v;n++;}return sq/n-(sum/n)**2;},buf.toString('base64'));};
  const a=await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:2});await a.route(/cave-map-(6336|4752)\./,r=>r.abort());const pa=await a.newPage();await pa.goto(url,{waitUntil:'load'});await pa.waitForFunction(()=>document.querySelector('.bmap-world').dataset.art==='lo'&&document.querySelector('.bmap-world').dataset.ready,null,{timeout:8000});await pa.waitForTimeout(1500);
  assert.equal(await pa.evaluate(()=>document.querySelector('.bmap-world').dataset.art),'lo','blocked sharp file should leave the first painting');
  const lo=await edge(pa);await pa.screenshot({path:`${root}shots/desktop-2x-lo.png`});await a.close();
  const b=await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:2});const pb=await b.newPage();await pb.goto(url,{waitUntil:'load'});await pb.waitForFunction(()=>document.querySelector('.bmap-world').dataset.art==='hi',null,{timeout:15000});
  const hi=await edge(pb);await pb.screenshot({path:`${root}shots/desktop-2x-hi.png`});await b.close();
  await writeFile(`${root}evidence/${label}-sharpness.json`,JSON.stringify({lo,hi,ratio:hi/lo}));
  assert.ok(hi>lo*1.15,`edge detail ${hi.toFixed(1)} vs ${lo.toFixed(1)} (x${(hi/lo).toFixed(2)})`);});

// Reduced motion: no flights, a cut per chapter.
{const ctx=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'});const page=await ctx.newPage();
 page.on('pageerror',e=>consoleErrors.push('calm: '+e.message));
 await page.goto(url,{waitUntil:'networkidle'});const g=await geometry(page);const holds=holdAt(g);
 await check('reduced motion: holds cut to each room (the bio holds on the desk)',async()=>{for(let i=1;i<g.st.length;i++){await go(page,holds[i]);await page.waitForTimeout(320);const s=await state(page);assert.equal(s.shot,g.st[i].id);assert.equal(s.phase,'hold');}});
 await check('reduced motion: no bats',async()=>{await go(page,g.st[0].height+g.vh*.55);await page.waitForTimeout(300);assert.equal(await page.$eval('.bmap-flock',f=>getComputedStyle(f).display),'none');});
 await check('reduced motion: never a flight',async()=>{for(let i=1;i<g.st.length-1;i++){await go(page,midAt(g,i));await page.waitForTimeout(320);const s=await state(page);assert.equal(s.phase,'hold');}});
 await check('reduced motion: no depth layers or loops',async()=>{await go(page,holds[I(g,'training')]);const r=await page.evaluate(()=>({d:['.bmap-fx','.bmap-near','.bmap-dust'].map(q=>getComputedStyle(document.querySelector(q)).display),a:document.getAnimations().filter(a=>/^bmap-/.test(a.animationName||'')).length}));assert.deepEqual(r.d,['none','none','none']);assert.equal(r.a,0,'animations '+r.a);});
 await page.screenshot({path:`${root}shots/calm-hold.png`});await ctx.close();}

// The masthead's Pause scene also stills the cave's loops (the choice is remembered, so set it before load).
{const ctx=await browser.newContext({viewport:{width:1440,height:900}});await ctx.addInitScript(()=>{try{localStorage.setItem('bairam:scene-paused','1');}catch{}});const page=await ctx.newPage();
 page.on('pageerror',e=>consoleErrors.push('paused: '+e.message));await page.goto(url,{waitUntil:'networkidle'});const g=await geometry(page);
 await check('paused scene: the cave loops are paused too',async()=>{await go(page,holdAt(g)[I(g,'training')]);const r=await page.evaluate(()=>({scene:document.querySelector('.bm-scene')?.dataset.motion,a:document.getAnimations().filter(a=>/^bmap-(fall|mist|flicker|cable-|drift)/.test(a.animationName||'')).map(a=>a.playState)}));
   assert.equal(r.scene,'paused','scene state '+r.scene);assert.ok(r.a.length>=20&&r.a.every(s=>s==='paused'),JSON.stringify(r.a.slice(0,5)));});
 await ctx.close();}

// No JavaScript: a plain dark page, no world, every chapter readable.
{const ctx=await browser.newContext({viewport:{width:1440,height:900},javaScriptEnabled:false});const page=await ctx.newPage();
 await page.goto(url,{waitUntil:'load'});
 await check('no JS: world hidden, every chapter present',async()=>{assert.equal(await page.$eval('.bmap-world',w=>getComputedStyle(w).opacity),'0');for(const id of COPY)assert.ok(await page.$(`#${id}`),id);assert.equal(await page.$$eval('.bmap-legend a',a=>a.length),6);});
 await page.screenshot({path:`${root}shots/nojs-top.png`});await ctx.close();}

await check('no console or page errors',()=>assert.deepEqual(consoleErrors,[]));
await browser.close();
const passed=results.filter(r=>r.ok).length;
await writeFile(`${root}evidence/${label}-map-checks.json`,JSON.stringify({url,passed,total:results.length,results,consoleErrors},null,2));
for(const r of results)console.log((r.ok?'PASS ':'FAIL ')+r.name+(r.ok?'':' :: '+r.error));
console.log(`${passed}/${results.length}`);process.exit(passed===results.length?0:1);
