// First-visit sound QA in real browsers (installed Chrome + Playwright WebKit), with the browser's real autoplay rule.
// Playwright's goto, evaluate, locators and waitForFunction each count as a user gesture and unlock audio, so here the
// page reports on itself (an init script logs its state to the console), it is reached through a self-redirecting
// stand-in page (no gesture on the new document), and the only input is a raw mouse click.
// Usage: TEST_URL=http://localhost:3202 node tests/sound-firstvisit.mjs
import {chromium,webkit} from '@playwright/test';
import assert from 'node:assert/strict';
const base=process.env.TEST_URL||'http://localhost:3202';
const CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const WEBKIT=process.env.WEBKIT_PATH||process.env.HOME+'/Library/Caches/ms-playwright/webkit-2370/pw_run.sh';
const browsers=[['Chrome',()=>chromium.launch({executablePath:CHROME,headless:true,ignoreDefaultArgs:['--autoplay-policy=no-user-gesture-required']})],['WebKit',()=>webkit.launch({executablePath:WEBKIT})]];
const cases=[['loading screen, click anywhere','/prototype/bairam-map','page',true],['loading screen, click the pulsing Sound button','/prototype/bairam-map','sound',true],['masthead, click anywhere','/prototype/bairam-map?intro=0','page',false]];
let passed=0,failed=0;
for(const [bn,launch] of browsers)for(const [name,path,target,bats] of cases){
  const b=await launch();
  try{
    const ctx=await b.newContext({viewport:{width:1280,height:720}});
    await ctx.addInitScript(()=>{setInterval(()=>{const s=window.__caveSound;const e=document.querySelector('.bairam-opening-controls [data-sound-toggle]')||document.querySelector('[data-sound-toggle]');const r=e?.getBoundingClientRect();
      console.log('STATE '+JSON.stringify({act:navigator.userActivation?.hasBeenActive,btn:e?.dataset.soundToggle,pressed:e?.getAttribute('aria-pressed'),running:s?.running,ctx:s?.context,musicPaused:s?.musicPaused,opening:s?.openingPlaying,box:r&&[r.x+r.width/2,r.y+r.height/2]}));},200);});
    const p=await ctx.newPage();const states=[],errors=[];
    p.on('console',m=>{const t=m.text();if(t.startsWith('STATE '))states.push(JSON.parse(t.slice(6)));else if(m.type()==='error'&&!t.includes('data-theme-phase'))errors.push(t.slice(0,160));});
    p.on('pageerror',e=>errors.push(e.message));
    await p.route(base+'/__go',r=>r.fulfill({contentType:'text/html',body:`<script>setTimeout(()=>location.replace(${JSON.stringify(path)}),200)</script>`}));
    await p.goto(base+'/__go');await p.waitForTimeout(2200);
    const before=states.at(-1);
    assert.ok(before,'page reported its state');assert.equal(before.act,false,'no user gesture yet');
    assert.equal(before.btn,'waiting');assert.equal(before.pressed,'true','shows on by default');assert.equal(before.running,false);assert.notEqual(before.ctx,'running','browser holds audio until a click');
    const [x,y]=target==='sound'?before.box:[640,200];await p.mouse.click(x,y);await p.waitForTimeout(2500);
    const after=states.at(-1);
    assert.equal(after.running,true,'sound running after the click');assert.equal(after.ctx,'running');assert.equal(after.musicPaused,false,'music playing');assert.equal(after.btn,'on');
    if(bats)assert.equal(after.opening,true,'opening bats playing');
    assert.deepEqual(errors,[]);
    passed++;console.log('PASS',bn,'|',name);
  }catch(e){failed++;console.log('FAIL',bn,'|',name,'::',String(e.message).split('\n')[0]);}
  await b.close();
}
console.log(`${passed}/${passed+failed}`);process.exit(failed?1:0);
