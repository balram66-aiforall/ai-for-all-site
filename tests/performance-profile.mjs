import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
const browser = await chromium.launch();
const base = process.env.TEST_URL || 'http://localhost:3002';
const results = [];
try {
  for (const path of ['/', '/prompting-framework', '/guides/managers']) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
    const page = await context.newPage();
    const client = await context.newCDPSession(page);
    await client.send('Network.enable');
    await client.send('Network.setCacheDisabled', { cacheDisabled: true });
    await client.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 200000, uploadThroughput: 93750 });
    await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await page.addInitScript(() => {
      window.__measurements = { lcp: 0, cls: 0, longTaskMs: 0 };
      new PerformanceObserver(list => { for (const item of list.getEntries()) window.__measurements.lcp = item.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
      new PerformanceObserver(list => { for (const item of list.getEntries()) if (!item.hadRecentInput) window.__measurements.cls += item.value; }).observe({ type: 'layout-shift', buffered: true });
      new PerformanceObserver(list => { for (const item of list.getEntries()) window.__measurements.longTaskMs += Math.max(0, item.duration - 50); }).observe({ type: 'longtask', buffered: true });
    });
    await page.goto(base + path, { waitUntil: 'networkidle' });
    const result = await page.evaluate(() => ({ ...window.__measurements, navigation: performance.getEntriesByType('navigation').map(n => ({ ttfb: n.responseStart, domReady: n.domContentLoadedEventEnd })), resources: performance.getEntriesByType('resource').map(r => ({ name: new URL(r.name).pathname, bytes: r.transferSize, kind: r.initiatorType })) }));
    results.push({ path, ...result });
    console.log(JSON.stringify({ path, ...result }));
    await context.close();
  }
  await writeFile('/tmp/aifa-performance.json', JSON.stringify(results, null, 2));
} finally { await browser.close(); }
