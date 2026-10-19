import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const base=process.env.TEST_URL||'http://localhost:3199';const url=base+'/prototype/bairam/mark';
const root=process.env.EVIDENCE_DIR||new URL('../../frontier-aimplify/work/designer/2026-10-18-bairam-mark-sketches/round2/',import.meta.url).pathname;
await mkdir(root+'shots',{recursive:true});await mkdir(root+'svg',{recursive:true});await mkdir(root+'evidence',{recursive:true});
const browser=await chromium.launch({headless:true});const results=[];const consoleErrors=[];
const check=async(name,fn)=>{try{await fn();results.push({name,ok:true});}catch(e){results.push({name,ok:false,error:String(e.message||e).slice(0,300)});}};
const ids=['wing','rise','roost'];
for(const vp of [{label:'desktop',width:1440,height:900},{label:'phone',width:390,height:844}]){
  const page=await browser.newPage({viewport:{width:vp.width,height:vp.height},deviceScaleFactor:2});
  page.on('console',m=>{if(m.type()==='error')consoleErrors.push(vp.label+': '+m.text());});
  page.on('pageerror',e=>consoleErrors.push(vp.label+': '+e.message));
  const res=await page.goto(url,{waitUntil:'networkidle'});
  await page.evaluate(()=>document.fonts.ready);
  await check(vp.label+' status 200',()=>assert.equal(res.status(),200));
  await check(vp.label+' three studies in order',async()=>assert.deepEqual(await page.$$eval('[data-study]',n=>n.map(x=>x.dataset.study)),ids));
  await check(vp.label+' lineup has three links',async()=>assert.equal(await page.locator('.bk-lineup a').count(),3));
  await check(vp.label+' each study renders 9 tiles',async()=>{for(const id of ids)assert.equal(await page.locator(`[data-study="${id}"] .bk-tile`).count(),9,id);});
  await check(vp.label+' exactly one recommended (bAI Wing)',async()=>{assert.equal(await page.locator('.bk-pick').count(),1);assert.equal(await page.locator('[data-study="wing"] .bk-pick').count(),1);});
  await check(vp.label+' every mark has drawn geometry',async()=>{const bad=await page.$$eval('svg.bk-mark',s=>s.filter(x=>{const b=x.getBBox();return !(b.width>40&&b.height>40);}).length);assert.equal(bad,0);});
  await check(vp.label+' actual-size marks are 16/32/96 px',async()=>{for(const id of ids){const w=await page.$$eval(`[data-study="${id}"] .bk-ladder svg`,s=>s.map(x=>Math.round(x.getBoundingClientRect().width)));assert.deepEqual(w,[16,32,96],id);}});
  await check(vp.label+' favicon mark is 16 px',async()=>{const w=await page.$$eval('.bk-tab .is-active svg',s=>s.map(x=>Math.round(x.getBoundingClientRect().width)));assert.deepEqual(w,[16,16,16]);});
  await check(vp.label+' marks fill gold on dark, dark on gold',async()=>{const c=await page.evaluate(()=>[getComputedStyle(document.querySelector('.bk-on-dark svg')).color,getComputedStyle(document.querySelector('.bk-on-gold svg')).color]);assert.deepEqual(c,['rgb(230, 185, 79)','rgb(8, 10, 12)']);});
  await check(vp.label+' Cinzel and Hanken loaded',async()=>{const f=await page.evaluate(()=>[document.fonts.check("700 20px 'Bairam Display'"),document.fonts.check("400 16px 'Bairam Text'")]);assert.deepEqual(f,[true,true]);});
  await check(vp.label+' wordmark gold AI',async()=>{const c=await page.evaluate(()=>getComputedStyle(document.querySelector('.bk-lockup .bk-word span')).color);assert.equal(c,'rgb(230, 185, 79)');});
  await check(vp.label+' no horizontal overflow',async()=>{const o=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);assert.ok(o<=0,'overflow '+o);});
  await check(vp.label+' single h1, labelled sections',async()=>{assert.equal(await page.locator('h1').count(),1);assert.equal(await page.locator('section[aria-labelledby]').count(),3);});
  await page.screenshot({path:`${root}shots/${vp.label}-full.png`,fullPage:true});
  await page.locator('.bk-lineup').screenshot({path:`${root}shots/${vp.label}-lineup.png`});
  if(vp.label==='desktop'){
    for(const id of ids){await page.locator(`[data-study="${id}"]`).screenshot({path:`${root}shots/study-${id}.png`});
      const svg=await page.$eval(`[data-study="${id}"] .bk-big svg`,s=>{const c=s.cloneNode(true);c.setAttribute('xmlns','http://www.w3.org/2000/svg');c.setAttribute('fill','#e6b94f');c.removeAttribute('class');c.removeAttribute('data-mark');c.removeAttribute('role');c.removeAttribute('aria-label');c.removeAttribute('focusable');return c.outerHTML;});
      await writeFile(`${root}svg/${id}.svg`,svg+'\n');}
  }
  await page.close();
}
await check('no console or page errors',()=>assert.deepEqual(consoleErrors.filter(e=>!(e.includes('hydrated')&&e.includes('data-theme-phase'))),[]));
await browser.close();
const passed=results.filter(r=>r.ok).length;
await writeFile(root+'evidence/mark-checks.json',JSON.stringify({url,passed,total:results.length,results,consoleErrors},null,2));
for(const r of results)console.log((r.ok?'PASS ':'FAIL ')+r.name+(r.ok?'':' :: '+r.error));
console.log(`${passed}/${results.length}`);process.exit(passed===results.length?0:1);
