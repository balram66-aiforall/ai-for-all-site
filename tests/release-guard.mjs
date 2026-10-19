// Run before any commit or deploy of the cave page. Fails while the proving wall still holds placeholder data.
import {readFile} from 'node:fs/promises';
import {certs} from '../app/prototype/proving-wall/certs.ts';
const problems=[];
if(!certs.length)problems.push('no certifications listed');
const seen=new Set();
for(const [i,c] of certs.entries()){
  const at=`certs[${i}] "${c.name}"`;
  if(c.sample)problems.push(`${at} is a sample (dummy) credential`);
  for(const k of ['name','issuer','year'])if(!String(c[k]??'').trim())problems.push(`${at} is missing ${k}`);
  if(c.year&&!/^\d{4}$/.test(c.year))problems.push(`${at} year "${c.year}" is not a 4-digit year`);
  if(c.url&&!/^https:\/\//.test(c.url))problems.push(`${at} url must be https`);
  if(c.url&&/credly\.com\/(go|earner)\//.test(c.url))problems.push(`${at} url is a Credly share or earner link; use the public /badges/<id>/public_url page`);
  if(/sample|issuer name|placeholder|lorem/i.test(`${c.name} ${c.issuer} ${c.credentialId??''}`))problems.push(`${at} still has placeholder text`);
  if(seen.has(c.name))problems.push(`${at} is listed twice`);seen.add(c.name);
}
if((await readFile(new URL('../app/prototype/proving-wall/wall.tsx',import.meta.url),'utf8')).includes('previewPlates'))problems.push('wall.tsx still has the preview-only ?plates layout hook');
if(problems.length){console.log('RELEASE GUARD: BLOCKED');for(const p of problems)console.log(' -',p);process.exitCode=1}else console.log('RELEASE GUARD: clear');
