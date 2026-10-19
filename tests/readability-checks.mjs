// Readability audit for the cave map: every visible piece of text, in every section, at desktop and phone sizes.
// For each text element on screen: its rendered size, and its contrast against what is really behind it (the page is
// shot a second time with all text hidden, so the background includes the painting, scrims and glass).
// Pass: no text under MIN px; no text covered by the fixed chapter list; contrast >= 4.5 (>= 3 for large text: 24px+, or 18.66px+ at weight 600+), measured
// against the worst 5% of the background behind it (display text 48px+, i.e. the wordmark, and the map's
// room labels, which carry their own dark outline, against the median).
import {chromium,webkit} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
const base=process.env.TEST_URL||'http://localhost:3199';const url=base+'/prototype/bairam-map?intro=0';
const root=process.env.EVIDENCE_DIR||new URL('../../frontier-aimplify/work/builder/2026-10-18-cave-map-type/',import.meta.url).pathname;
const label=process.env.EVIDENCE_LABEL||'dev';const MIN=+(process.env.MIN_PX||15);
await mkdir(root+'evidence',{recursive:true});await mkdir(root+'shots',{recursive:true});
const HIDE='*,*::before,*::after{color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important;transition:none!important;caret-color:transparent!important}.bmap-label,.bmap-label *{fill:transparent!important}';
// BROWSER=webkit runs the same checks in WebKit, the engine under Safari (an approximation, not Safari itself).
const browser=await (process.env.BROWSER==='webkit'?webkit:chromium).launch({headless:true,...(process.env.BROWSER==='webkit'&&process.env.WEBKIT_PATH?{executablePath:process.env.WEBKIT_PATH}:{})});
const report={url,min:MIN,viewports:{}};let failures=0;
for(const vp of [{n:'desktop',w:1440,h:900},{n:'laptop',w:1280,h:800},{n:'tablet',w:1024,h:768},{n:'tablet-portrait',w:820,h:1180},{n:'phone',w:390,h:844},{n:'small-phone',w:360,h:740}]){
  const page=await browser.newPage({viewport:{width:vp.w,height:vp.h}});
  await page.goto(url,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
  const stages=await page.evaluate(()=>[...document.querySelectorAll('main .bj-stage')].map(s=>{const c=s.firstElementChild;return {id:c.dataset.chamber,top:s.getBoundingClientRect().top+scrollY,height:c.offsetHeight};}));
  const items=new Map();
  for(const st of stages){
    // Walk down the chamber while it is held: from its top to its last screen.
    const stops=[];for(let y=st.top;y<=st.top+Math.max(0,st.height-vp.h)+1;y+=vp.h*.7)stops.push(y);
    for(const [k,y] of stops.entries()){
      await page.evaluate(y=>window.scrollTo({top:y,behavior:'instant'}),y);
      await page.waitForFunction(()=>document.querySelector('.bmap-world').dataset.settled==='true',null,{timeout:4000}).catch(()=>{});await page.waitForTimeout(450);
      const texts=await page.evaluate(()=>{const out=[];const vw=innerWidth,vh=innerHeight;
        const walker=document.createTreeWalker(document.querySelector('main'),NodeFilter.SHOW_TEXT);
        const seen=new Set();
        for(let t=walker.nextNode();t;t=walker.nextNode()){if(!t.textContent.trim())continue;const el=t.parentElement;if(!el||seen.has(el))continue;seen.add(el);
          if(el.closest('[aria-hidden="true"]:not(.bmap-world)')&&!el.closest('.bmap-svg'))continue;
          const cs=getComputedStyle(el);if(cs.visibility==='hidden'||cs.display==='none')continue;
          let op=1;for(let n=el;n;n=n.parentElement)op*=+getComputedStyle(n).opacity;if(op<.9)continue;
          const r=document.createRange();r.selectNodeContents(t);// Clip to scroll/overflow containers (the carousel track peeks the next slide): only the part a reader can see counts.
          let clip={left:0,top:0,right:vw,bottom:vh};for(let n=el.parentElement;n&&n!==document.body;n=n.parentElement){const o=getComputedStyle(n);if(o.overflowX!=='visible'||o.overflowY!=='visible'){const c=n.getBoundingClientRect();clip={left:Math.max(clip.left,c.left),top:Math.max(clip.top,c.top),right:Math.min(clip.right,c.right),bottom:Math.min(clip.bottom,c.bottom)};}}
          const rects=[...r.getClientRects()].map(b=>({left:Math.max(b.left,clip.left),top:Math.max(b.top,clip.top),right:Math.min(b.right,clip.right),bottom:Math.min(b.bottom,clip.bottom)})).filter(b=>b.right-b.left>2&&b.bottom-b.top>2);if(!rects.length)continue;
          const b=rects.reduce((a,c)=>({left:Math.min(a.left,c.left),top:Math.min(a.top,c.top),right:Math.max(a.right,c.right),bottom:Math.max(a.bottom,c.bottom)}),{left:1e9,top:1e9,right:-1e9,bottom:-1e9});
          const fill=el.closest('svg')?cs.fill:cs.color;
          const path=[];for(let n=el;n&&path.length<3&&n.tagName!=='MAIN';n=n.parentElement)path.unshift(n.tagName.toLowerCase()+(n.classList[0]?'.'+n.classList[0]:''));
          let px=parseFloat(cs.fontSize);if(el.closest('svg')){const m=el.closest('svg').getScreenCTM();px*=m?m.a:1;}
          out.push({svg:!!el.closest('svg'),inRail:!!el.closest('.bj-chapters'),text:t.textContent.trim().replace(/\s+/g,' ').slice(0,60),sel:path.join(' > '),px:+px.toFixed(1),weight:+cs.fontWeight||400,color:fill,box:[Math.max(0,b.left),Math.max(0,b.top),Math.min(vw,b.right),Math.min(vh,b.bottom)].map(Math.round)});}
        // Anything fixed on top of the copy (the chapter list) must not cover text.
        const rail=document.querySelector('.bj-chapters');const rs=rail&&getComputedStyle(rail);
        if(rail&&rs.display!=='none'&&rs.visibility!=='hidden'&&+rs.opacity>.5){// What it really paints: the numbers and their ticks, and any name that is showing (names hide until hover).
          const parts=[...rail.querySelectorAll('.bj-chapters-n, .bj-chapters-name')].filter(n=>+getComputedStyle(n).opacity>.1).map(n=>n.getBoundingClientRect());
          for(const o of out){if(o.inRail)continue;const [l,tp,rr,bt]=o.box;if(parts.some(rb=>l<rb.right+4&&rr>rb.left-4&&tp<rb.bottom&&bt>rb.top))o.covered='chapter list';}}
        return out;});
      if(!texts.length)continue;
      const shot=await page.screenshot();
      const hide=await page.addStyleTag({content:HIDE});await page.waitForTimeout(60);const bg=await page.screenshot();await hide.evaluate(n=>n.remove());
      if(k===0)await writeFile(`${root}shots/${label}-${vp.n}-${st.id}.png`,shot);
      const res=await page.evaluate(async({bg,texts})=>{const img=new Image();img.src='data:image/png;base64,'+bg;await img.decode();const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const x=c.getContext('2d');x.drawImage(img,0,0);
        const lin=v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;};const L=(r,g,b)=>.2126*lin(r)+.7152*lin(g)+.0722*lin(b);
        return texts.map(t=>{const [a,b2,cR,d]=t.box;const w=Math.max(1,cR-a),h=Math.max(1,d-b2);const data=x.getImageData(a,b2,w,h).data;const ls=[];const step=Math.max(1,Math.floor(Math.sqrt(w*h/4000)));
          for(let yy=0;yy<h;yy+=step)for(let xx=0;xx<w;xx+=step){const i=(yy*w+xx)*4;ls.push([data[i],data[i+1],data[i+2]]);}
          const m=t.color.match(/[\d.]+/g).map(Number);const al=m.length>3?m[3]:1;
          let worst=99;const sorted=ls.map(p=>({p,l:L(...p)})).sort((u,v)=>u.l-v.l);
          const qs=t.px>=48||t.svg?[sorted[Math.floor(sorted.length*.5)]]:[sorted[Math.floor(sorted.length*.05)],sorted[Math.floor(sorted.length*.95)]];for(const q of qs){if(!q)continue;const fg=[0,1,2].map(i=>m[i]*al+q.p[i]*(1-al));const l1=L(...fg),l2=q.l;const cr=(Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05);worst=Math.min(worst,cr);}
          return {...t,contrast:+worst.toFixed(2)};});},{bg:bg.toString('base64'),texts});
      for(const r of res){const key=st.id+'|'+r.sel+'|'+r.text;const prev=items.get(key);if(!prev||r.contrast<prev.contrast||r.px<prev.px||(r.covered&&!prev.covered))items.set(key,{section:st.id,...r,covered:r.covered||prev?.covered});}
    }
  }
  const all=[...items.values()];
  const bad=all.filter(t=>{const large=t.px>=24||(t.px>=18.66&&t.weight>=600);return t.px<MIN||t.contrast<(large?3:4.5)||!!t.covered;});
  failures+=bad.length;
  const bySection={};for(const t of all){const s=bySection[t.section]??={n:0,minPx:99,minContrast:99};s.n++;s.minPx=Math.min(s.minPx,t.px);s.minContrast=Math.min(s.minContrast,t.contrast);}
  report.viewports[vp.n]={checked:all.length,bySection,bad};
  console.log(`${vp.n}: ${all.length} text items, ${bad.length} below the bar`);
  for(const [s,v] of Object.entries(bySection))console.log(`  ${s.padEnd(13)} ${String(v.n).padStart(3)} items  smallest ${v.minPx}px  lowest contrast ${v.minContrast}`);
  for(const t of bad.slice(0,40))console.log(`  BAD ${t.section} ${t.px}px c${t.contrast}${t.covered?' covered by '+t.covered:''} ${t.sel} "${t.text}"`);
  await page.close();
}
await browser.close();
await writeFile(`${root}evidence/${label}-readability.json`,JSON.stringify(report,null,2));
console.log(failures?`FAIL ${failures} items below the bar`:'PASS every section readable');process.exit(failures?1:0);
