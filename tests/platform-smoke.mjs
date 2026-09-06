import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

const base = process.env.TEST_URL || 'http://localhost:3001';
const output = process.env.TEST_OUTPUT || '/tmp/aifa-platform-checks';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const errors = [];
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, permissions: ['clipboard-read', 'clipboard-write'] });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Judge', exact: true }).click();
  assert.match(await page.locator('.teammate-result').innerText(), /Remove unsupported claims/);
  await page.getByRole('button', { name: 'Analyst', exact: true }).click();
  await page.getByRole('button', { name: 'Clear output', exact: true }).click();
  assert.match(await page.locator('.example-paper').innerText(), /Security review/);
  assert.equal(await page.locator('iframe').count(), 0, 'Shelf must not load until requested');
  await page.getByRole('button', { name: 'Switch to dark mode' }).click();
  await page.waitForFunction(() => document.documentElement.dataset.theme === 'dark');
  await page.goto(`${base}/guides/analysts`, { waitUntil: 'networkidle' });
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark', 'Theme must persist across pages');
  assert.equal(await page.getByRole('navigation', { name: 'Main navigation' }).count(), 1);
  await page.getByRole('button', { name: 'Copy prompt' }).click();
  assert.match(await page.evaluate(() => navigator.clipboard.readText()), /skeptical decision analyst/);
  await page.getByText('See a worked example', { exact: true }).click();
  for (const checkbox of await page.getByRole('checkbox').all()) await checkbox.check();
  assert.match(await page.locator('.review-checklist [role="status"]').innerText(), /4 of 4/);

  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const path of ['/', '/guides', '/guides/managers', '/guides/operations', '/guides/analysts', '/guides/client-teams', '/prompting-framework']) {
      await page.goto(`${base}${path}`, { waitUntil: 'networkidle' });
      assert.equal(await page.locator('h1').count(), 1, `One main heading: ${path}`);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `No page overflow: ${path} at ${width}`);
      const broken = await page.locator('img').evaluateAll(images => images.filter(img => img.complete && !img.naturalWidth).map(img => img.src));
      assert.deepEqual(broken, [], `Images load: ${path}`);
      if (path === '/') {
        await page.locator('.name-morph').evaluate(node => node.getAnimations({ subtree: true }).forEach(animation => animation.finish()));
        await page.screenshot({ path: `${output}/home-dark-${width}.png` });
        await page.getByRole('button', { name: 'Switch to light mode' }).click();
        await page.waitForFunction(() => document.documentElement.dataset.themePhase === 'idle');
        await page.screenshot({ path: `${output}/home-light-${width}.png` });
        await page.getByRole('button', { name: 'Switch to dark mode' }).click();
      }
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.locator('#site-navigation').getByRole('link', { name: 'Guides', exact: true }).click();
  assert.equal(await page.getByRole('button', { name: 'Open navigation' }).getAttribute('aria-expanded'), 'false');
  await page.getByRole('button', { name: 'Next articles' }).click();
  await page.getByRole('button', { name: /MCPs vs APIs/ }).click();
  assert.equal(await page.getByRole('dialog').count(), 1);
  await page.keyboard.press('Escape');
  assert.equal(await page.getByRole('dialog').count(), 0);

  await page.goto(`${base}/prompting-framework`, { waitUntil: 'networkidle' });
  await page.locator('#croftc-rewrite-input').fill('Draft a concise project update for a team lead. Do not invent dates.');
  await page.getByRole('button', { name: 'Rewrite prompt', exact: true }).click();
  assert.match(await page.locator('.croftc-combined').first().innerText(), /project update/i);
  const quizCards = page.locator('.croftc-quiz-card');
  assert.equal(await quizCards.count(), 7);
  for (const card of await quizCards.all()) await card.getByRole('button').first().click();
  await page.locator('.croftc-quiz-footer .primary').click();
  assert.equal(await page.locator('.croftc-quiz-card > p').count(), 7);
  await page.locator('.croftc-quiz-footer .secondary').click();
  assert.match(await page.locator('.croftc-quiz-score').innerText(), /0 of 7 answered/);

  await page.route('**/api/aifa', route => route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ error: 'AIFA is taking a break. Please use the guides.' }) }));
  await page.locator('.aifa-assistant-launcher').click();
  const chat = page.getByRole('dialog', { name: 'AIFA chat helper' });
  await chat.getByRole('textbox').fill('Help me choose a guide');
  await chat.getByRole('button', { name: 'Send', exact: true }).click();
  await page.locator('.aifa-assistant-error').waitFor();
  assert.match(await page.locator('.aifa-assistant-error').innerText(), /taking a break/);
  await page.keyboard.press('Escape');
  assert.equal(await page.getByRole('dialog', { name: 'AIFA chat helper' }).count(), 0);

  const reduced = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 390, height: 844 } });
  const reducedPage = await reduced.newPage();
  await reducedPage.goto(base, { waitUntil: 'networkidle' });
  assert.equal(await reducedPage.locator('.name-final').evaluate(node => getComputedStyle(node).opacity), '1');
  await reducedPage.getByRole('button', { name: 'Switch to dark mode' }).click();
  assert.equal(await reducedPage.locator('main').getAttribute('data-theme-phase'), 'idle');
  await reduced.close();
  assert.deepEqual(errors, [], 'No browser runtime errors');
  console.log(`PASS: role selector, hero loop, guide prompts, checklist, themes, navigation, article dialog, CROFTC organizer and quiz, assistant fallback, 7 routes at 3 widths, reduced motion. Screenshots: ${output}`);
} finally {
  await browser.close();
}
