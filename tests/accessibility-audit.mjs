import { chromium } from '@playwright/test';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';

const require = createRequire(import.meta.url);
const browser = await chromium.launch();
const base = process.env.TEST_URL || 'http://localhost:3002';
const reports = [];
try {
  for (const theme of ['light', 'dark']) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    await context.addInitScript(theme => localStorage.setItem('aifa-theme', theme), theme);
    const page = await context.newPage();
    for (const path of ['/', '/guides', '/guides/managers', '/guides/operations', '/guides/analysts', '/guides/client-teams', '/prompting-framework']) {
      await page.goto(base + path, { waitUntil: 'networkidle' });
      await page.addStyleTag({ content: '* { content-visibility: visible !important; animation: none !important; transition: none !important; } [data-reveal] { opacity: 1 !important; transform: none !important; }' });
      await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
      const result = await page.evaluate(() => window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } }));
      const report = { theme, path, violations: result.violations.map(item => ({ id: item.id, impact: item.impact, nodes: item.nodes.map(node => ({ target: node.target, summary: node.failureSummary })) })) };
      reports.push(report);
      console.log(JSON.stringify(report));
    }
    await context.close();
  }
  await mkdir('/tmp/aifa-platform-checks', { recursive: true });
  await writeFile('/tmp/aifa-platform-checks/accessibility.json', JSON.stringify(reports, null, 2));
  if (reports.some(report => report.violations.length)) process.exitCode = 1;
} finally { await browser.close(); }
