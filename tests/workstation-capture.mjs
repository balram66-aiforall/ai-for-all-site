import {chromium,expect} from '@playwright/test';
const browser=await chromium.launch({headless:true});
const out=new URL('../../frontier-aimplify/work/builder/2026-10-11-bairam-workstation/shots/',import.meta.url).pathname;
try{for(const [width,height] of [[1440,960],[390,844]]){
 const c=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'});const p=await c.newPage();await p.goto('http://localhost:3199/prototype/cave',{waitUntil:'networkidle'});await expect(p.locator('.cave')).toHaveAttribute('data-renderer','layered');await p.evaluate(()=>document.fonts.ready);await p.screenshot({path:out+`review-${width}.png`});await p.getByRole('button',{name:'02 bAIram suit'}).click();await expect(p.locator('.cave-suit-art img')).toHaveJSProperty('complete',true);await p.screenshot({path:out+`review-${width}-suit.png`});await c.close();
}}finally{await browser.close()}
