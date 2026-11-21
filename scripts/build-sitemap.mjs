// Writes public/sitemap.xml from the site's own route lists, so a new guide page can't be left out.
// Run: node scripts/build-sitemap.mjs (Node 24 reads the .ts files directly).
// In: the home page, the guides (role guides, tool guides, AWS Quick on desktop and its live chapters), the prompting
// framework, the room of learning, the prompt library and the loop. Out: /prototype/* (previews) and the Second Brain OS
// copy, whose pages are canonical to the author's GitHub repo.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { roleGuides } from '../app/site-content.ts';
import { pillarGuides } from '../app/pillar-guides.ts';
import guide from '../app/prototype/aws-quick-guide/data/guide.json' with { type: 'json' };

const SITE = 'https://balramr.in';
const HUB = '/guides/aws-quick-desktop';
const entries = [
  { path: '/' },
  { path: '/guides' },
  ...roleGuides.map(g => ({ path: `/guides/${g.slug}` })),
  ...pillarGuides.map(g => ({ path: `/guides/${g.slug}` })),
  ...[...guide.pages].sort((a, b) => a.chapter - b.chapter)
    .map(p => ({ path: p.slug ? `${HUB}/${p.slug}` : HUB, lastmod: p.modified })),
  { path: '/prompting-framework' },
  { path: '/bai-room-of-learning' },
  { path: '/bai-room-of-learning/prompt-library' },
  { path: '/loop' },
];

const seen = new Set();
for (const e of entries) {
  if (seen.has(e.path)) throw new Error(`sitemap: ${e.path} listed twice`);
  if (e.path.startsWith('/prototype') || e.path.includes('second-brain-os')) throw new Error(`sitemap: ${e.path} must stay out`);
  seen.add(e.path);
}

const url = e => `  <url><loc>${SITE}${e.path}</loc>${e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : ''}</url>`;
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.map(url).join('\n')}\n</urlset>\n`;
writeFileSync(fileURLToPath(new URL('../public/sitemap.xml', import.meta.url)), xml);
console.log(`sitemap: ${entries.length} URLs`);
