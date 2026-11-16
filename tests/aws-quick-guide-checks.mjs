// AWS Quick on desktop, the complete guide (/guides/aws-quick-desktop): the hub and its live chapters (Balram, Nov 16:
// "Ship the 3 pages first, build it"). Pages, words and dates come from app/prototype/aws-quick-guide/data/guide.json, built
// from content/aws-quick-desktop/*.md; this checks what the server actually sends.
// Usage: TEST_URL=http://localhost:3214 EVIDENCE_DIR=<dir>/ node tests/aws-quick-guide-checks.mjs
import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {tmpdir} from 'node:os';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {mkdir,readFile,readdir,writeFile} from 'node:fs/promises';
import guide from '../app/prototype/aws-quick-guide/data/guide.json' with {type:'json'};
import {CHAPTERS,DISCLOSURE,HUB,NAME} from '../app/prototype/aws-quick-guide/guide.ts';
const require=createRequire(import.meta.url);
const base=process.env.TEST_URL||'http://localhost:3214';
const SITE='https://balramr.in';
const root=process.env.EVIDENCE_DIR||`${tmpdir()}/aws-quick-guide-checks/`;
const label=process.env.EVIDENCE_LABEL||'prod';
await mkdir(root+'shots',{recursive:true});await mkdir(root+'evidence',{recursive:true});
const results=[],errors=[];
async function check(name,fn){try{await fn();results.push({name,pass:true});console.log('PASS',name)}catch(e){results.push({name,pass:false,error:e.message});console.log('FAIL',name,e.message)}}

const pages=[...guide.pages].sort((a,b)=>a.chapter-b.chapter);
const pathOf=p=>p.slug?`${HUB}/${p.slug}`:HUB;
const live=CHAPTERS.filter(c=>pages.some(p=>p.slug===c.slug));
const content=new URL('../content/aws-quick-desktop/',import.meta.url);
const sources={};
for(const f of await readdir(content))if(f.endsWith('.md'))sources[f]=await readFile(new URL(f,content),'utf8');
for(const f of await readdir(new URL('diagrams/',content)))sources['diagrams/'+f]=await readFile(new URL('diagrams/'+f,content),'utf8');
const mdOf=p=>sources[p.slug?`${p.slug}.md`:'index.md'];

// No internal names or hosts, in what the page shows, where it links, or in the sources it is built from.
// Names: the first 16 hex of sha256 of each lower-case word on a private list, so the list itself is not published here;
// every word on the page is hashed the same way. Hosts: any host naming amazon must be AWS (aws.amazon.com and its docs)
// or the press site (aboutamazon.com).
const NAMES=new Set(['1f403168ca8b3f38', '388f91ea04d6eaeb', '2a0abe451aede7f7', '20253cd8db8e4994', '87cb60d3f9cbfa1e', '283ab224f694f1c1', '7e5d4325a44714fc', '5f841bfb2b45656b', '19f4c684a3ff4f2d']);
const AMAZON_OK=new Set(['aws.amazon.com','docs.aws.amazon.com','aboutamazon.com','www.aboutamazon.com']);
const h16=w=>createHash('sha256').update(w).digest('hex').slice(0,16);
const leaksIn=t=>{const low=t.toLowerCase(),out=[];for(const w of new Set(low.match(/[a-z0-9]+/g)||[]))if(NAMES.has(h16(w)))out.push(`name #${h16(w)}`);for(const m of low.matchAll(/\b(?:[a-z0-9-]+\.)+(?:com|dev|net|org|io|aws|amazon|in|co)\b/g))if(m[0].includes('amazon')&&!AMAZON_OK.has(m[0]))out.push(`host ${m[0]}`);return out};

// Originality: no run of 7 words shared with the AWS docs and vendor pages captured for the guide. The fixture is a Bloom
// filter of their runs (hashes only; built by the work folder's src/make_grams.py, same word split as below); the probes are
// hashes of real capture runs, so the lookup must find every one. Sources lists and URLs are left out (they cite page titles).
const bloom=JSON.parse(await readFile(new URL('./fixtures/aws-quick-guide-originality.json',import.meta.url),'utf8'));const bits=Buffer.from(bloom.bits,'base64');
const has=hex=>{const d=Buffer.from(hex,'hex');for(let j=0;j<bloom.k;j++){const p=d.readUInt32BE(4*j)%bloom.m;if(!(bits[p>>3]&(1<<(p&7))))return false}return true};
const sha=t=>createHash('sha512').update(t).digest('hex');
const words=t=>(t.toLowerCase().replace(/https?:\/\/\S+/g,' ').match(/[a-z0-9']+/g)||[]).map(w=>w.replaceAll("'",'')).filter(Boolean);
const shared=t=>{const w=words(t),hits=[];for(let i=0;i+bloom.n<=w.length;i++){const run=w.slice(i,i+bloom.n).join(' ');if(has(sha(run)))hits.push(run)}return hits};

// ---- The sources themselves: no browser needed ----
await check('the data: the hub plus chapters 3 and 4, titles 60 characters or fewer, descriptions 160 or fewer, dates set, FAQs and diagrams in each',async()=>{assert.deepEqual(pages.map(p=>[p.chapter,p.slug]),[[0,''],[3,'agents-routines-mission-control'],[4,'skills']]);for(const p of pages){assert(p.title.length<=60,`${p.slug} title ${p.title.length}`);assert(p.description.length<=160,`${p.slug} description ${p.description.length}`);assert.match(p.published,/^\d{4}-\d{2}-\d{2}$/);assert.match(p.modified,/^\d{4}-\d{2}-\d{2}$/);assert(p.faqs.length>=5,`${p.slug} FAQs`);assert.equal((mdOf(p).match(/^::diagram D\d+$/gm)||[]).length,3,`${p.slug} diagrams`)}});
await check('data/guide.json is up to date with the markdown (a fresh build in memory matches it)',async()=>{execFileSync(process.execPath,[fileURLToPath(new URL('../scripts/build-aws-quick-guide.mjs',import.meta.url)),'--check'],{stdio:'pipe'})});
await check('the sources: no em or en dash, no internal names or hosts in any markdown or diagram file (the guard flags a planted host and passes the AWS ones)',async()=>{assert.deepEqual(leaksIn('see www.amazon.com, docs.aws.amazon.com and aboutamazon.com'),['host www.amazon.com']);const bad=[];for(const [f,t] of Object.entries(sources)){if(/[\u2014\u2013]/.test(t))bad.push(`${f}: dash`);for(const l of leaksIn(t))bad.push(`${f}: ${l}`)}assert.deepEqual(bad,[])});
await check('a mention of an unwritten chapter says it is coming soon; a written one never does',async()=>{const bad=[];for(const [f,t] of Object.entries(sources))for(const m of t.matchAll(/Chapter (\d)\b[^.\n]{0,90}/g)){const c=CHAPTERS[+m[1]-1];const on=live.includes(c);const soon=/coming soon/i.test(m[0]);if(on===soon)bad.push(`${f}: ${m[0]}`)}assert.deepEqual(bad,[])});
await check(`originality: no ${bloom.n}-word run shared with the ${bloom.note.match(/from (\d+)/)[1]} captured AWS and vendor pages (and the lookup finds every planted capture run)`,async()=>{assert.equal(bloom.n,7);assert(bloom.probes.every(has),'positive control: a capture run was not found');assert(!has(sha('a run of seven words that is not')),'negative control');const hits=[];for(const [f,t] of Object.entries(sources)){const body=t.split(/^## Sources/m)[0].replace(/^---[\s\S]*?\n---/,'').replace(/<!--[\s\S]*?-->/g,' ').replace(/<[^>]+>/g,' ').replace(/\]\([^)]*\)/g,'] ');for(const h of shared(body))hits.push(`${f}: ${h}`)}assert.deepEqual(hits,[])});

const browser=await chromium.launch({headless:true});
async function fresh(options={}){const c=await browser.newContext({viewport:{width:1440,height:900},...options});const p=await c.newPage();p.on('pageerror',e=>errors.push(`${p.url()}: ${e.message}`));p.on('console',m=>{if(m.type()==='error')errors.push(`${p.url()}: ${m.text()}`)});return {c,p}}
const ld=p=>p.locator('script[type="application/ld+json"]').evaluateAll(es=>es.map(e=>JSON.parse(e.textContent)));
try{
 const d=await fresh();await d.c.grantPermissions(['clipboard-read','clipboard-write'],{origin:base});
 const internal=new Set(),external=new Set();
 for(const [i,pg] of pages.entries()){
  const url=base+pathOf(pg),tag=pg.slug||'hub';
  const res=await d.p.goto(url,{waitUntil:'networkidle'});
  await check(`${tag}: 200, its own title and description, indexable, canonical to itself, article Open Graph with its 1200x630 share image`,async()=>{assert.equal(res.status(),200);assert.equal(await d.p.title(),pg.title);assert.equal(await d.p.locator('meta[name="description"]').getAttribute('content'),pg.description);assert.equal(await d.p.locator('link[rel="canonical"]').getAttribute('href'),SITE+pathOf(pg));assert.equal(await d.p.locator('meta[name="robots"]').getAttribute('content'),'index, follow');assert.equal(await d.p.locator('meta[property="og:type"]').getAttribute('content'),'article');const og=await d.p.locator('meta[property="og:image"]').getAttribute('content');assert.equal(og,`${SITE}/assets/aws-quick-guide/og-${tag}.jpg`);assert.equal(await d.p.locator('meta[name="twitter:card"]').getAttribute('content'),'summary_large_image');const local=og.replace(SITE,base);const r=await d.p.request.get(local);assert.equal(r.status(),200);assert.match(r.headers()['content-type'],/image\/jpeg/);const size=await d.p.evaluate(src=>new Promise((ok,no)=>{const im=new Image();im.onload=()=>ok([im.naturalWidth,im.naturalHeight]);im.onerror=no;im.src=src}),local);assert.deepEqual(size,[1200,630])});
  await check(`${tag}: structured data parses: an Article by Balram R. with both dates, a breadcrumb of ${pg.chapter?4:3}, and an FAQPage matching the ${pg.faqs.length} questions on the page`,async()=>{const graph=(await ld(d.p)).flatMap(x=>x['@graph']||[x]);const art=graph.find(x=>x['@type']==='Article');assert(art,'Article');assert.equal(art.headline,pg.heading);assert.equal(art.author.name,'Balram R.');assert.equal(art.author['@id'],`${SITE}/#balram`);assert.equal(art.datePublished,pg.published);assert.equal(art.dateModified,pg.modified);assert.equal(art.mainEntityOfPage,SITE+pathOf(pg));assert.equal(art.about.name,'AWS Quick');const bc=graph.find(x=>x['@type']==='BreadcrumbList');assert.deepEqual(bc.itemListElement.map(x=>x.position),pg.chapter?[1,2,3,4]:[1,2,3]);assert.equal(bc.itemListElement.at(-1).item,SITE+pathOf(pg));const faq=graph.find(x=>x['@type']==='FAQPage');const qs=await d.p.locator('h2#frequently-asked-questions ~ h3').allTextContents();assert.equal(faq.mainEntity.length,pg.faqs.length);assert.deepEqual(faq.mainEntity.map(q=>q.name),qs);for(const q of faq.mainEntity)assert(q.acceptedAnswer.text.length>20)});
  await check(`${tag}: one h1 (${pg.heading}); the kicker, the byline with the check date, and the disclosure word for word; breadcrumb trail`,async()=>{await expect(d.p.locator('h1')).toHaveCount(1);assert.equal(await d.p.locator('h1').textContent(),pg.heading);assert.equal(await d.p.locator('.gq-kicker').textContent(),pg.chapter?`Chapter ${pg.chapter} of 8`:'The complete guide · 8 chapters');assert.match((await d.p.locator('.gq-meta').innerText()).replace(/\s+/g,' '),/^By Balram R\. ?· ?Last checked against AWS docs on \d{1,2} [A-Z][a-z]+ \d{4}$/);assert.equal(await d.p.locator('.gq-meta time').getAttribute('datetime'),pg.modified);assert.equal(await d.p.locator('.gq-disclosure').textContent(),DISCLOSURE);assert.deepEqual(await d.p.locator('.sb-trail a').evaluateAll(es=>es.map(e=>e.getAttribute('href'))),pg.chapter?['/','/guides',HUB]:['/','/guides'])});
  await check(`${tag}: the rail lists the hub and all 8 chapters; only the ${live.length} written ones are links, the rest say Coming soon; this page is marked current`,async()=>{const rail=d.p.locator('.sb-side .gq-rail');assert.deepEqual(await rail.locator('ol').nth(1).locator('li').evaluateAll(es=>es.map(e=>[e.querySelector('a')?.getAttribute('href')??null,/Coming soon/.test(e.textContent)])),CHAPTERS.map(c=>{const on=live.includes(c);return [on?`${HUB}/${c.slug}`:null,!on]}));assert.deepEqual(await rail.locator('a[aria-current="page"]').evaluateAll(es=>es.map(e=>e.getAttribute('href'))),[pathOf(pg)])});
  await check(`${tag}: previous and next follow the reading order (hub, then the written chapters)`,async()=>{const prev=pages[i-1],next=pages[i+1];assert.equal(await d.p.locator('.sb-turn a[rel="prev"]').count(),prev?1:0);assert.equal(await d.p.locator('.sb-turn a[rel="next"]').count(),next?1:0);if(prev)assert.equal(await d.p.locator('.sb-turn a[rel="prev"]').getAttribute('href'),pathOf(prev));if(next)assert.equal(await d.p.locator('.sb-turn a[rel="next"]').getAttribute('href'),pathOf(next))});
  await check(`${tag}: the three diagrams are real text in numbered figures with captions, no pictures, no headings or landmarks inside`,async()=>{const figs=await d.p.locator('figure.gq-fig').evaluateAll(fs=>fs.map(f=>({id:f.id,cap:f.querySelector('figcaption')?.textContent||'',text:f.innerText.length,img:f.querySelectorAll('img,svg image,picture,canvas').length,inner:f.querySelectorAll('h1,h2,h3,h4,h5,h6,nav,main,section,aside,header,footer').length})));assert.equal(figs.length,3);for(const f of figs){assert.match(f.cap,/^Diagram \d+\b/);assert(f.text>40,`${f.id} has little text`);assert.equal(f.img,0);assert.equal(f.inner,0)}});
  await check(`${tag}: On this page lists every section in order and each link lands on a heading`,async()=>{const toc=await d.p.locator('.sb-aside .sb-toc a').evaluateAll(es=>es.map(e=>e.getAttribute('href')));const want=pg.chapter?pg.toc.map(t=>'#'+t.id):[...pg.toc.slice(0,-1).map(t=>'#'+t.id),'#the-chapters','#'+pg.toc.at(-1).id];assert.deepEqual(toc,want);for(const h of toc)assert.equal(await d.p.locator(`h2${h}`).count(),1,h)});
  if(!pg.chapter)await check('hub: the chapter list shows all 8; the written ones link to their pages, the rest are plain and say Coming soon',async()=>{assert.deepEqual(await d.p.locator('.gq-chapters li').evaluateAll(es=>es.map(e=>[e.querySelector('a')?.getAttribute('href')??null,/Coming soon/.test(e.textContent)])),CHAPTERS.map(c=>{const on=live.includes(c);return [on?`${HUB}/${c.slug}`:null,!on]}))});
  if(!pg.chapter)await check('hub: links to the two related guides on the site (AWS Quick Flows; MCP and SKILL.md)',async()=>{const hrefs=await d.p.locator('.gq-prose a').evaluateAll(es=>es.map(e=>e.getAttribute('href')));for(const h of ['/guides/amazon-quick','/guides/mcp-vs-skill-orchestration'])assert(hrefs.includes(h),h)});
  await check(`${tag}: what the page shows and links to has no internal names or hosts, and no em or en dash`,async()=>{const t=await d.p.locator('body').innerText();const hrefs=(await d.p.locator('a[href]').evaluateAll(es=>es.map(e=>e.href))).join(' ');assert.deepEqual(leaksIn(t+' '+hrefs+' '+await d.p.title()),[]);assert(!/[\u2014\u2013]/.test(t+await d.p.title()),'dash on the page')});
  if(pg.html.includes('sb-code'))await check(`${tag}: Copy on a code block puts its exact text on the clipboard and says Copied`,async()=>{const btn=d.p.locator('.sb-code .sb-copy').first();await expect(btn).toBeVisible();const code=await d.p.locator('.sb-code').first().locator('code').textContent();await btn.click();assert.equal(await d.p.evaluate(()=>navigator.clipboard.readText()),code);await expect(btn).toHaveText('Copied')});
  for(const h of await d.p.locator('a[href]').evaluateAll(es=>es.map(e=>e.getAttribute('href'))))(h.startsWith('/')?internal:/^https?:/.test(h)?external:new Set()).add(h.split('#')[0]||'/');
  await check(`${tag}: no accessibility violations (axe, WCAG 2.1 AA, plus unique landmark names and no empty table headers)`,async()=>{await d.p.addScriptTag({path:require.resolve('axe-core/axe.min.js')});const v=await d.p.evaluate(()=>window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}}).then(r=>r.violations.map(v=>({id:v.id,n:v.nodes.length,t:v.nodes[0].target}))));assert.deepEqual(v,[]);const bp=await d.p.evaluate(()=>window.axe.run(document,{runOnly:{type:'rule',values:['landmark-unique','empty-table-header','duplicate-id-aria']}}).then(r=>r.violations.map(v=>({id:v.id,t:v.nodes.map(n=>n.target)}))));assert.deepEqual(bp,[],'unique landmark names, no empty table headers')});
  await d.p.screenshot({path:root+`shots/gq-${tag}-1440.png`});
 }
 await check(`every internal link on the guide's pages answers 200 (${internal.size} paths); every outside link is https`,async()=>{const bad=[];for(const h of internal){const r=await d.p.request.get(base+h,{maxRedirects:0});if(r.status()!==200)bad.push(`${h} ${r.status()}`)}for(const h of external)if(!h.startsWith('https://'))bad.push(h);assert.deepEqual(bad,[])});
 await check('an unwritten chapter has no page yet (404), so search engines never see an empty one',async()=>{for(const c of CHAPTERS.filter(c=>!live.includes(c)))assert.equal((await d.p.request.get(`${base}${HUB}/${c.slug}`)).status(),404,c.slug)});
 await check('the guides index shows the guide as a card, and the AWS Quick Flows and MCP guides point to it under Keep learning',async()=>{await d.p.goto(base+'/guides');const card=d.p.locator('.guide-card',{has:d.p.locator('h2',{hasText:NAME})});await expect(card).toHaveCount(1);assert.equal(await card.locator('a').getAttribute('href'),HUB);for(const s of ['amazon-quick','mcp-vs-skill-orchestration']){await d.p.goto(`${base}/guides/${s}`);await expect(d.p.locator(`.guide-page-footer a[href="${HUB}"]`)).toHaveCount(1);assert.doesNotMatch(await d.p.locator('h1').textContent(),/Amazon Quick/)}});
 await check('the sitemap lists the guide pages with their dates, every listed page answers 200 here, and it leaves out previews and the Second Brain OS copy; robots.txt points at it',async()=>{const xml=await (await d.p.request.get(base+'/sitemap.xml')).text();const locs=[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);for(const pg of pages)assert(xml.includes(`<loc>${SITE}${pathOf(pg)}</loc><lastmod>${pg.modified}</lastmod>`),pathOf(pg));assert.equal(new Set(locs).size,locs.length,'duplicate');assert(!locs.some(l=>/\/prototype|second-brain-os/.test(l)));for(const l of locs){const r=await d.p.request.get(l.replace(SITE,base),{maxRedirects:0});assert.equal(r.status(),200,l)}assert.match(await (await d.p.request.get(base+'/robots.txt')).text(),new RegExp(`Sitemap: ${SITE}/sitemap.xml`))});
 await d.c.close();

 // Widths: nothing spills sideways; at 760px and below every diagram grid is one column.
 const STACK='.gq-zones, .gq-stages, .gq-agent, .gq-mc-body, .gq-win-body';
 for(const w of [1440,1024,390,320]){
  const m=await fresh({viewport:{width:w,height:900}});
  for(const pg of pages){
   const tag=pg.slug||'hub';await m.p.goto(base+pathOf(pg),{waitUntil:'networkidle'});
   await check(`${w}px ${tag}: nothing spills sideways, no diagram is wider than the column${w<=760?', and the diagram grids stack to one column':''}`,async()=>{const r=await m.p.evaluate(s=>({doc:document.documentElement.scrollWidth-document.documentElement.clientWidth,figs:[...document.querySelectorAll('figure.gq-fig')].map(f=>f.scrollWidth-f.clientWidth),tracks:[...document.querySelectorAll(s)].map(e=>getComputedStyle(e).gridTemplateColumns.split(' ').length)}),STACK);assert(r.doc<=0,`page is ${r.doc}px too wide`);assert(r.figs.every(x=>x<=1),`figure overflow ${r.figs}`);if(w<=760)assert(r.tracks.every(n=>n===1),`tracks ${r.tracks}`)});
   if(w===390||w===1024)await m.p.screenshot({path:root+`shots/gq-${tag}-${w}-full.png`,fullPage:true});
  }
  await m.c.close();
 }
 const nojs=await fresh({javaScriptEnabled:false,viewport:{width:390,height:844}});
 for(const pg of pages){const tag=pg.slug||'hub';await nojs.p.goto(base+pathOf(pg));await check(`no JavaScript, ${tag}: the title, every section, the diagrams and the FAQs are all in the page; no dead Copy buttons`,async()=>{assert.equal(await nojs.p.locator('h1').textContent(),pg.heading);for(const t of pg.toc)assert.equal(await nojs.p.locator(`h2#${t.id}`).count(),1,t.id);await expect(nojs.p.locator('figure.gq-fig')).toHaveCount(3);assert.equal(await nojs.p.locator('h2#frequently-asked-questions ~ h3').count(),pg.faqs.length);for(const b of await nojs.p.locator('.sb-copy').all())await expect(b).toBeHidden()})}
 await nojs.c.close();
 await check('no page or console errors anywhere above',async()=>assert.deepEqual(errors,[]));
}finally{await browser.close()}
const failed=results.filter(r=>!r.pass).length;
await writeFile(root+`evidence/${label}-aws-quick-guide-checks.json`,JSON.stringify({base,results,errors},null,2));
console.log(`${results.length-failed}/${results.length} passed`);process.exitCode=failed?1:0;
