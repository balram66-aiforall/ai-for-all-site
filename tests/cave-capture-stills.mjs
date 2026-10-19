import {chromium,expect} from '@playwright/test';
const browser=await chromium.launch({headless:true});
const dir=new URL('../../frontier-aimplify/work/builder/2026-10-11-batcave/shots/',import.meta.url).pathname;
try{
 for(const [name,width,height] of [['desktop',1920,1080],['mobile',780,1688]]){
  const context=await browser.newContext({viewport:{width:name==='mobile'?390:width,height:name==='mobile'?844:height},deviceScaleFactor:name==='mobile'?2:1,reducedMotion:'reduce'});
  const page=await context.newPage();await page.goto('http://localhost:3199/prototype/cave',{waitUntil:'networkidle'});await expect(page.locator('.cave')).toHaveAttribute('data-renderer','webgl',{timeout:20000});
  await page.addStyleTag({content:'.cave-header,.cave-scene-caption,.cave-controls,.cave-stations,.cave-bottom,.cave-scene-footer,.cave-vignette{visibility:hidden!important}'});
  await page.locator('.cave-webgl canvas').screenshot({path:dir+`still-${name}.png`});await context.close();
 }
}finally{await browser.close()}
