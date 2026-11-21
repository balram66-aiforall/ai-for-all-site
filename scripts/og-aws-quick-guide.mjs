// The share images (Open Graph, 1200x630 JPEG) for the AWS Quick on desktop guide: one per live page, drawn as HTML in the
// cave's colours and rendered with Playwright. Diagram-style art only, no screenshots.
// Run: node scripts/og-aws-quick-guide.mjs  ->  public/assets/aws-quick-guide/og-<slug|hub>.jpg
import { chromium } from '@playwright/test';
import { mkdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const out = `${root}public/assets/aws-quick-guide/`;
const { pages } = JSON.parse(await readFile(`${root}app/prototype/aws-quick-guide/data/guide.json`, 'utf8'));
const font = (await readFile(`${root}public/fonts/loading/hanken-grotesk-latin-var.woff2`)).toString('base64');
const display = (await readFile(`${root}public/fonts/loading/cinzel-700.woff2`)).toString('base64');

const box = (x, y, w, label, accent) => `<div class="b${accent ? ' a' : ''}" style="left:${x}px;top:${y}px;width:${w}px">${label}</div>`;
const art = {
  // The six building blocks, from a one-off chat to a shared App.
  hub: `${box(0, 0, 150, 'Chat')}${box(190, 0, 150, 'Skill', 1)}${box(0, 96, 150, 'Agent', 1)}${box(190, 96, 150, 'Routine')}${box(0, 192, 150, 'Space')}${box(190, 192, 150, 'App')}
        <div class="l" style="left:150px;top:28px;width:40px"></div><div class="l v" style="left:74px;top:56px;height:40px"></div>
        <div class="l" style="left:150px;top:124px;width:40px"></div><div class="l v" style="left:74px;top:152px;height:40px"></div>`,
  // A routine wakes an agent; both show up in Mission Control.
  'agents-routines-mission-control': `${box(0, 0, 150, 'Routine')}${box(190, 0, 150, 'Agent', 1)}${box(0, 150, 340, 'Mission Control')}
        <div class="l" style="left:150px;top:28px;width:40px"></div><div class="l v" style="left:264px;top:56px;height:94px"></div>
        <div class="l v" style="left:74px;top:56px;height:94px"></div>`,
  // A SKILL.md file and its header fields.
  skills: `<div class="file"><p class="fn">SKILL.md</p><p><i>name:</i> weekly-status</p><p><i>display_name:</i> Weekly status</p><p><i>description:</i> ...</p><p><i>trigger:</i> weekly status</p><p><i>tools:</i> [...]</p><p class="rule"></p><p class="rule s"></p></div>`,
};

const html = p => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: T; src: url(data:font/woff2;base64,${font}) format('woff2'); font-weight: 400 500; }
@font-face { font-family: D; src: url(data:font/woff2;base64,${display}) format('woff2'); font-weight: 700; }
* { margin: 0; box-sizing: border-box; }
body { width: 1200px; height: 630px; overflow: hidden; background: #0b0d10; color: #eef1f1; font-family: T, sans-serif; position: relative; }
.glow { position: absolute; inset: 0; background: radial-gradient(55% 75% at 80% 0%, #e6b94f2b, #e6b94f00 70%), radial-gradient(40% 60% at 8% 100%, #4f8dff17, #4f8dff00 70%); }
.edge { position: absolute; left: 72px; top: 72px; bottom: 72px; width: 3px; background: #e6b94f; }
.text { position: absolute; left: 108px; top: 84px; width: 600px; }
.k { color: #e6b94f; font-size: 26px; font-weight: 500; letter-spacing: .04em; }
h1 { margin-top: 26px; font-size: ${p.heading.length > 34 ? 60 : 70}px; line-height: 1.04; font-weight: 500; letter-spacing: -.01em; text-wrap: balance; }
.s { margin-top: 26px; color: #c9ced1; font-size: 27px; line-height: 1.35; text-wrap: balance; }
.by { position: absolute; left: 108px; bottom: 76px; color: #a8afb3; font-size: 24px; }
.by b { font-family: D; color: #eef1f1; font-weight: 700; letter-spacing: .04em; }
.by span { color: #e6b94f; }
.art { position: absolute; right: 84px; top: 160px; width: 340px; height: 300px; }
.b { position: absolute; height: 56px; display: flex; align-items: center; justify-content: center; border: 2px solid #3a4046; background: #12161a; color: #d9dedf; font-size: 23px; font-weight: 500; border-radius: 10px; }
.b.a { border-color: #e6b94f; color: #eef1f1; box-shadow: 0 0 24px #e6b94f33; }
.l { position: absolute; height: 2px; background: #e6b94f99; }
.l.v { width: 2px; height: auto; }
.file { position: absolute; inset: 0; padding: 24px 26px; border: 2px solid #e6b94f; border-radius: 12px; background: #12161a; box-shadow: 0 0 28px #e6b94f26; font-size: 20px; line-height: 1.75; color: #d9dedf; }
.file i { font-style: normal; color: #e6b94f; }
.fn { font-weight: 500; color: #eef1f1; font-size: 23px; margin-bottom: 6px; }
.rule { height: 9px; margin-top: 14px; width: 86%; background: #2a3035; border-radius: 4px; }
.rule.s { width: 58%; margin-top: 10px; }
</style></head><body><div class="glow"></div><div class="edge"></div>
<div class="text"><p class="k">${p.chapter ? `AWS QUICK ON DESKTOP · CHAPTER ${p.chapter}` : 'THE COMPLETE GUIDE'}</p>
<h1>${p.chapter ? p.short : 'AWS Quick on desktop'}</h1>
<p class="s">${p.chapter ? 'Step-by-step, with diagrams and copyable examples.' : 'Agents, skills, routines and connectors, step by step.'}</p></div>
<div class="art">${art[p.slug || 'hub']}</div>
<p class="by"><b>b<span>AI</span>ram</b> &nbsp;·&nbsp; balramr.in &nbsp;·&nbsp; Balram R.</p>
</body></html>`;

await mkdir(out, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const p of pages) {
  if (!art[p.slug || 'hub']) throw new Error(`og: no art for ${p.slug}`);
  await page.setContent(html(p), { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  const file = `${out}og-${p.slug || 'hub'}.jpg`;
  await page.screenshot({ path: file, type: 'jpeg', quality: 88 });
  console.log('og:', file.slice(root.length));
}
await browser.close();
