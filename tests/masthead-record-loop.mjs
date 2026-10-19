import {chromium} from '@playwright/test';
const out=process.env.EVIDENCE_DIR+'shots/';const base=process.env.TEST_URL||'http://localhost:3199';
const b=await chromium.launch();
for(const [w,h,name,q,ms] of [[1440,900,'desktop','?intro=0',8000],[390,844,'phone','?intro=0',8000],[1440,900,'intro','',9000]]){const c=await b.newContext({viewport:{width:w,height:h},recordVideo:{dir:out,size:{width:w,height:h}}});const p=await c.newPage();await p.goto(base+'/prototype/masthead'+q);await p.waitForTimeout(ms);const v=p.video();await c.close();await v.saveAs(out+'wake-'+name+'.webm');await v.delete()}
await b.close();console.log('recorded');
