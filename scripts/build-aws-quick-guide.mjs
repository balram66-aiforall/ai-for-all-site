// Builds the AWS Quick on desktop guide (/guides/aws-quick-desktop) from its markdown in content/aws-quick-desktop/.
// Usage: node scripts/build-aws-quick-guide.mjs   (writes app/prototype/aws-quick-guide/data/guide.json; never hand-edit that file)
// The words are Balram's own (written Nov 16 2026, checked against the AWS docs that day). Diagrams are HTML in diagrams/Dn.html,
// placed with a line "::diagram Dn"; the first line of each file is <!-- caption: ... -->.
import { readFile, readdir, writeFile, mkdir } from 'node:fs/promises';
import { Marked } from 'marked';

const SRC = new URL('../content/aws-quick-desktop/', import.meta.url);
const OUT = new URL('../app/prototype/aws-quick-guide/data/guide.json', import.meta.url);
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const plain = html => html.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
const slug = t => t.toLowerCase().replace(/<[^>]+>/g, '').replace(/&[a-z#0-9]+;/g, '').replace(/[^a-z0-9 -]/g, '').trim().replace(/\s+/g, '-');

function frontMatter(md) {
  const m = md.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) throw new Error('no front matter');
  const data = Object.fromEntries(m[1].split('\n').map(l => { const i = l.indexOf(':'); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }));
  data.chapter = Number(data.chapter);
  return [data, md.slice(m[0].length)];
}

async function diagram(id) {
  const raw = await readFile(new URL(`diagrams/${id}.html`, SRC), 'utf8');
  const cap = raw.match(/^<!-- caption: (.*?) -->\n/);
  if (!cap) throw new Error(`${id}: no caption line`);
  const n = id.slice(1);
  return `<figure class="gq-fig" id="diagram-${n}" data-diagram="${id}"><div class="gq-dia">${raw.slice(cap[0].length).trim()}</div>`
    + `<figcaption><span>Diagram ${n}</span> ${esc(cap[1])}</figcaption></figure>\n`;
}

async function convert(file) {
  const [meta, body] = frontMatter(await readFile(new URL(file, SRC), 'utf8'));
  // FAQ: "**Question?**" then its answer on the next line becomes ### Question + paragraph, and is kept for FAQPage data.
  const faqs = [];
  let md = body.replace(/(\n## FAQ\n)([\s\S]*?)(?=\n## |\s*$)/, (_, head, block) => '\n## Frequently asked questions\n' +
    block.replace(/^\*\*(.+?)\*\*\n(.+)$/gm, (__, q, a) => { faqs.push({ question: q, answer: a.replace(/\*\*|`/g, '') }); return `### ${q}\n\n${a}`; }));
  const ids = new Set(); const toc = []; let title = null;
  // Each table is a scrollable region named for its section ("Table: Skill or agent?"), numbered if a section has two.
  let section = ''; const tables = new Map();
  const marked = new Marked({ gfm: true });
  marked.use({ renderer: {
    heading({ tokens, depth }) {
      const text = this.parser.parseInline(tokens);
      if (depth === 1) { title = plain(text); return ''; }
      let id = slug(text); while (ids.has(id)) id += '-2'; ids.add(id);
      if (depth === 2) { toc.push({ id, text: plain(text) }); section = plain(text); }
      return `<h${depth} id="${id}">${text}</h${depth}>\n`;
    },
    code({ text, lang }) {
      const l = (lang || '').trim();
      return `<div class="sb-code gq-code"${l ? ` data-lang="${esc(l)}"` : ''}><div class="sb-code-bar"><span>${esc(l || 'text')}</span><button type="button" class="sb-copy" aria-label="Copy ${esc(l || 'text')}">Copy</button></div><pre tabindex="0"><code>${esc(text)}</code></pre></div>\n`;
    },
    table(token) {
      const n = (tables.get(section) || 0) + 1; tables.set(section, n);
      const label = `Table: ${section || title || 'overview'}${n > 1 ? ` (${n})` : ''}`;
      return `<div class="sb-table" role="region" aria-label="${esc(label)}" tabindex="0">${marked.Renderer.prototype.table.call(this, token)}</div>\n`;
    },
    blockquote({ tokens }) {
      const inner = this.parser.parse(tokens);
      return `<aside class="gq-tip" aria-label="From my desk">${inner}</aside>\n`;
    },
  } });
  const parts = await Promise.all(md.split(/^::diagram (D\d+)\s*$/m).map((chunk, i) => i % 2 ? diagram(chunk) : marked.parse(chunk)));
  const html = parts.join('');
  if (!title) throw new Error(`${file}: no # title`);
  const text = plain(html.replace(/<div class="sb-code[\s\S]*?<\/pre><\/div>/g, ' ')).replace(/\s+/g, ' ');
  return { ...meta, heading: title, html, toc, faqs, words: text.split(' ').length };
}

const files = (await readdir(SRC)).filter(f => f.endsWith('.md')).sort();
const pages = await Promise.all(files.map(convert));
pages.sort((a, b) => a.chapter - b.chapter);
for (const p of pages) {
  if (p.title.length > 60) throw new Error(`${p.slug}: title is ${p.title.length} characters`);
  if (p.description.length > 160) throw new Error(`${p.slug}: description is ${p.description.length} characters`);
  if (/[\u2014\u2013]/.test(p.html)) throw new Error(`${p.slug}: em or en dash in the text`);
  if (!p.faqs.length) throw new Error(`${p.slug}: no FAQ`);
}
const json = JSON.stringify({ note: 'Generated by scripts/build-aws-quick-guide.mjs from content/aws-quick-desktop/. Do not edit.', pages }, null, 1) + '\n';
// --check: build in memory and fail if data/guide.json is out of date with the markdown (the tests run this).
if (process.argv.includes('--check')) {
  const now = await readFile(OUT, 'utf8').catch(() => '');
  if (now !== json) { console.error('guide.json is out of date: run node scripts/build-aws-quick-guide.mjs'); process.exit(1); }
  console.log('guide.json is up to date'); process.exit(0);
}
await mkdir(new URL('.', OUT), { recursive: true });
await writeFile(OUT, json);
console.log(pages.map(p => `${p.slug || '(hub)'}: ${p.words} words, ${p.toc.length} sections, ${p.faqs.length} FAQs`).join('\n'));
