// Sync Second Brain OS (github.com/undefined-ui/second-brain-os, MIT) into the bAI room of learning.
// Downloads the repo at one pinned commit, converts its reading content (docs/ and resources/ markdown, the README, the
// license) to sanitised HTML, recolours its figures for the dark cave, and writes:
//   app/prototype/second-brain-os/data/library.json   every page, the reading order and the shelves
//   public/assets/second-brain-os/figs/*.svg            the figures
// Nothing is fetched while visitors browse. The tool files (commands, skills, agents, plugins, scripts, vault template)
// are meant to be installed, not read, so links to them go to GitHub.
// Usage: node scripts/sync-second-brain-os.mjs [--commit <sha>]   (default: the commit already pinned in library.json)
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, posix, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

const REPO = 'undefined-ui/second-brain-os';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
// Copy buttons are plain markup; the page shows them only once its copy script runs (no JavaScript, no dead buttons).
const OUT = join(ROOT, 'app/prototype/second-brain-os/data/library.json');
const FIGS = join(ROOT, 'public/assets/second-brain-os/figs');
const BASE = '/bai-room-of-learning/second-brain-os';
const FIG_URL = '/assets/second-brain-os/figs';

// ---- 1. The source, at one commit ----
const arg = process.argv.indexOf('--commit');
const pinned = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')).source.commit : null;
const commit = arg > 0 ? process.argv[arg + 1] : pinned;
if (!/^[0-9a-f]{40}$/.test(commit ?? '')) throw new Error('Pass --commit <40-char sha> (no pinned commit yet).');
const work = mkdtempSync(join(tmpdir(), 'sbos-'));
process.on('exit', () => rmSync(work, { recursive: true, force: true }));
const tgz = join(work, 'src.tgz');
execFileSync('curl', ['-sfL', '-o', tgz, `https://codeload.github.com/${REPO}/tar.gz/${commit}`]);
execFileSync('tar', ['-xzf', tgz, '-C', work]);
const src = join(work, readdirSync(work).find(d => d.startsWith('second-brain-os-')));
const read = p => readFileSync(join(src, p), 'utf8');
const walk = dir => readdirSync(join(src, dir)).flatMap(f => statSync(join(src, dir, f)).isDirectory() ? walk(posix.join(dir, f)) : [posix.join(dir, f)]);
const blob = p => `https://github.com/${REPO}/blob/main/${p}`;
const tree = p => `https://github.com/${REPO}/tree/main/${p.replace(/\/$/, '')}`;

// ---- 2. Which files are pages, and their addresses ----
const mdFiles = [...walk('docs'), ...walk('resources')].filter(p => p.endsWith('.md')).concat('README.md').sort();
function slugOf(p) {
  if (p === 'README.md') return ['overview'];
  if (p === 'docs/README.md') return ['guides'];
  if (p === 'docs/ROADMAP.md') return ['roadmap'];
  const parts = p.replace(/^docs\//, '').replace(/\.md$/, '').split('/');
  return parts.at(-1) === 'README' ? parts.slice(0, -1) : parts;
}
const pageBySource = new Map(mdFiles.map(p => [p, { source: p, slug: slugOf(p) }]));
pageBySource.set('LICENSE', { source: 'LICENSE', slug: ['license'] });
const urlOf = page => `${BASE}/${page.slug.join('/')}`;

// ---- 3. GitHub-style heading ids, so #anchors in the source still work ----
const slugger = () => { const seen = new Map(); return text => {
  const base = text.toLowerCase().trim().replace(/[^\p{L}\p{M}\p{N}\p{Pc} -]/gu, '').replace(/ /g, '-');
  const n = seen.get(base) ?? 0; seen.set(base, n + 1); return n ? `${base}-${n}` : base;
}; };
const plain = html => html.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

// ---- 4. Markdown to HTML ----
const report = { links: { page: 0, anchor: 0, external: 0, github: 0 }, missingAnchors: [], unresolved: [], figures: new Set(), stripped: [] };
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function resolveHref(href, from) {
  if (/^(https?:)?\/\//.test(href)) { report.links.external++; return { href, external: true }; }
  if (/^mailto:/.test(href)) return { href, external: true };
  if (href.startsWith('#')) { report.links.anchor++; return { href }; }
  const [path, hash = ''] = href.split('#');
  let target = posix.normalize(posix.join(posix.dirname(from), decodeURI(path)));
  if (target.endsWith('/')) target = target.slice(0, -1);
  const asPage = pageBySource.get(target) ?? pageBySource.get(`${target}/README.md`);
  if (asPage) { report.links.page++; return { href: urlOf(asPage) + (hash ? `#${hash}` : ''), check: hash && { page: asPage.source, id: hash, from } }; }
  if (/\.svg$/.test(target)) return { href: `${FIG_URL}/${posix.basename(target)}` };
  if (existsSync(join(src, target))) { report.links.github++; return { href: statSync(join(src, target)).isDirectory() ? tree(target) : blob(target), external: true }; }
  report.unresolved.push(`${from}: ${href}`);
  return { href: blob(target), external: true };
}

const anchorChecks = [];
const SANITIZE = {
  allowedTags: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'em', 'strong', 'del', 'hr', 'br',
  'table', 'thead', 'tbody', 'tr', 'th', 'td', 'img', 'input', 'div', 'span', 'button', 'details', 'summary', 'sub', 'b'],
  allowedAttributes: { a: ['href', 'target', 'rel', 'title'], img: ['src', 'alt', 'loading', 'decoding'], input: ['type', 'checked', 'disabled', 'aria-label'],
  div: ['class', 'data-lang', 'role', 'aria-label', 'tabindex'], pre: ['tabindex'], span: ['class'], button: ['type', 'class', 'aria-label'],
  th: ['align'], td: ['align'], ...Object.fromEntries(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].map(h => [h, ['id']])) },
  // Only the site's own markup classes, and the link, region and tab rules the converter writes; anything else the author's
  // raw HTML might carry is dropped.
  allowedClasses: { div: ['sb-code', 'sb-code-bar', 'sb-table'], span: ['sb-sr'], button: ['sb-copy'] },
  transformTags: {
    a: (tag, a) => ({ tagName: tag, attribs: a.target ? { ...a, target: '_blank', rel: 'noopener noreferrer' } : Object.fromEntries(Object.entries(a).filter(([k]) => k !== 'target' && k !== 'rel')) }),
    div: (tag, a) => ({ tagName: tag, attribs: Object.fromEntries(Object.entries(a).filter(([k, v]) => !(k === 'role' && v !== 'region') && !(k === 'tabindex' && v !== '0') && !(k === 'aria-label' && a.role !== 'region'))) }),
    pre: (tag, a) => ({ tagName: tag, attribs: a.tabindex === '0' ? { tabindex: '0' } : {} }),
  },
  allowedSchemes: ['https', 'http', 'mailto'],
  allowProtocolRelative: false,
  exclusiveFilter: f => (f.tag === 'img' && !String(f.attribs.src).startsWith(FIG_URL + '/')) || (f.tag === 'input' && f.attribs.type !== 'checkbox'),
};
// The diagrams have no alt text in the source; their own labels, in drawing order, describe them.
const unent = t => t.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
function figureAlt(file) {
  const labels = [...read(file).matchAll(/<text[^>]*>([\s\S]*?)<\/text>/g)].map(m => unent(m[1].replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim()).filter(Boolean);
  if (!labels.length) throw new Error(`${file} has no alt text and no labels to describe it`);
  return `Diagram: ${labels.join(', ')}`;
}
function convert(source, md = read(source)) {
  const id = slugger();
  const toc = [];
  let title = null;
  const marked = new Marked({ gfm: true });
  marked.use({
    walkTokens(token) { if (token.type === 'heading' && token.depth === 1 && title === null) { title = plain(marked.parseInline(token.text)); token.type = 'space'; token.raw = ''; } },
    renderer: {
      heading({ tokens, depth }) {
        const inner = this.parser.parseInline(tokens), text = plain(inner).trim(), hid = id(text);
        if (depth === 2 || depth === 3) toc.push({ id: hid, text, depth });
        return `<h${depth} id="${hid}">${inner}</h${depth}>\n`;
      },
      link({ href, title: t, tokens }) {
        const r = resolveHref(href, source); if (r.check) anchorChecks.push(r.check);
        const inner = this.parser.parseInline(tokens);
        return r.external ? `<a href="${esc(r.href)}" target="_blank" rel="noopener noreferrer">${inner}<span class="sb-sr"> (opens in a new tab)</span></a>` : `<a href="${esc(r.href)}"${t ? ` title="${esc(t)}"` : ''}>${inner}</a>`;
      },
      image({ href, text }) {
        const r = resolveHref(href, source); report.figures.add(posix.basename(href));
        return `<img src="${esc(r.href)}" alt="${esc(text || figureAlt(posix.join(posix.dirname(source), href)))}" loading="lazy" decoding="async">`;
      },
      // Task lists (the roadmap): each box says whether it is done, so a screen reader has a name for it.
      checkbox({ checked }) { return `<input type="checkbox" disabled${checked ? ' checked' : ''} aria-label="${checked ? 'Done' : 'Not done'}"> `; },
      code({ text, lang }) {
        const l = (lang || '').trim().split(/\s/)[0];
        return `<div class="sb-code"${l ? ` data-lang="${esc(l)}"` : ''}><div class="sb-code-bar"><span>${esc(l)}</span><button type="button" class="sb-copy"${l ? ` aria-label="Copy ${esc(l)} code"` : ''}>Copy</button></div><pre tabindex="0"><code>${esc(text)}</code></pre></div>\n`;
      },
      table(token) {
        const html = marked.Renderer.prototype.table.call(this, token);
        return `<div class="sb-table" role="region" aria-label="Table" tabindex="0">${html}</div>\n`;
      },
      // Raw HTML: the few layout tags the README uses pass on to the sanitiser (which still allows only those); comments
      // (the author's own TODO notes) and anything else are dropped and listed in the report.
      html({ text }) {
        const t = text.trim(); if (!t) return text;
        if (/^(<\/?(details|summary|sub|b|br)\s*\/?>\s*)+$/i.test(t.replace(/<summary>((?:[^<]|<\/?b>)*)<\/summary>/i, '<summary></summary>').replace(/<b>[^<]*<\/b>/gi, ''))) return text;
        report.stripped.push(`${source}: ${t.slice(0, 60).replace(/\n/g, ' ')}`); return '';
      },
    },
  });
  const raw = marked.parse(md);
  const html = sanitizeHtml(raw, SANITIZE);
  // The first paragraph is the page's own summary (used on the shelves and as the meta description).
  const first = md.replace(/^# .*$/m, '').split(/\n\s*\n/).map(s => s.trim()).find(s => s && !/^(#|\||-|\d+\.|```|>|!\[|\[Back)/.test(s)) ?? '';
  const summary = plain(new Marked().parseInline(first.replace(/\n/g, ' '))).trim();
  if (!title) throw new Error(`${source} has no # title`);
  const clash = [...html.matchAll(/ id="((?:sb|bm)-[^"]*)"/g)].map(m => m[1]);
  if (clash.length) throw new Error(`${source}: heading ids in the page's own namespace: ${clash.join(', ')}`);
  return { title, summary, html, toc, words: md.split(/\s+/).length, ids: [...html.matchAll(/ id="([^"]+)"/g)].map(m => m[1]) };
}

// ---- 4b. The sanitiser, proved on hostile input every run (the pinned content is harmless; a future commit may not be) ----
{
  const md = ['# Probe', '<script>alert(1)</script>', '<img src=x onerror=alert(1)>', '<iframe src="https://e.example"></iframe>',
    '<details><summary><img src=x onerror=alert(1)></summary>text</details>', '<details>\n<summary><button class="sb-copy">fake</button></summary>\n\ntext\n\n</details>', '<div class="sb-copy x" onclick="x" style="color:red" role="button" tabindex="5">d</div>',
    '[a](javascript:alert(1)) [b](data:text/html,x) [c](https://e.example) <a href="https://e.example" target="_blank">raw</a>',
    '![x](https://e.example/x.png)', '<style>body{}</style><form action="https://e.example"><input type="text"></form><base href="https://e.example">', '<svg onload=alert(1)></svg>'].join('\n\n');
  const raw = ['<div class="sb-copy evil" role="button" tabindex="5" aria-label="x" onclick="x">d</div>', '<a href="https://e.example" target="_top">t</a>',
    '<a href="javascript:alert(1)">j</a>', '<img src="https://e.example/x.png">', '<span class="sb-sr x" style="x">s</span>', '<svg onload="x"></svg>', '<input type="text">',
    '<pre tabindex="3" onfocus="x">p</pre>', '<button class="sb-copy" onclick="x">b</button>'].join('');
  const saved = JSON.stringify({ ...report, figures: [...report.figures] });
  const outs = [convert('docs/probe.md', md).html, sanitizeHtml(raw, SANITIZE)];
  Object.assign(report, JSON.parse(saved), { figures: new Set(JSON.parse(saved).figures) }); anchorChecks.length = 0;
  const CLASSES = new Set(['sb-code', 'sb-code-bar', 'sb-table', 'sb-sr', 'sb-copy']);
  if (/<button/.test(outs[0])) throw new Error(`Raw HTML put a button on the page:\n${outs[0]}`);
  for (const out of outs) {
    const bad = [
      ...out.match(/<\/?(script|iframe|style|form|base|svg|object|embed|link|meta)\b/gi) ?? [],
      ...out.match(/\son\w+\s*=|\sstyle\s*=/gi) ?? [],
      ...out.match(/(href|src)="\s*(javascript|data|vbscript):/gi) ?? [],
      ...[...out.matchAll(/<img [^>]*src="([^"]*)"/g)].map(m => m[1]).filter(u => !u.startsWith(FIG_URL + '/')),
      ...[...out.matchAll(/ class="([^"]*)"/g)].flatMap(m => m[1].split(/\s+/)).filter(c => !CLASSES.has(c)),
      ...[...out.matchAll(/<a [^>]*>/g)].map(m => m[0]).filter(a => / target=/.test(a) && !(/ target="_blank"/.test(a) && / rel="noopener noreferrer"/.test(a))),
      ...out.match(/ role="(?!region")[^"]*"| tabindex="(?!0")[^"]*"|<input (?![^>]*type="checkbox")[^>]*>/g) ?? [],
    ];
    if (bad.length) throw new Error(`Sanitiser let through: ${bad.join(' | ')}\n${out}`);
  }
}

// ---- 5. Every page ----
const pages = new Map();
for (const [source, page] of pageBySource) {
  if (source === 'LICENSE') continue;
  pages.set(source, { ...page, url: urlOf(page), github: blob(source), ...convert(source) });
}
const license = read('LICENSE');
pages.set('LICENSE', { source: 'LICENSE', slug: ['license'], url: `${BASE}/license`, github: blob('LICENSE'), title: 'License', summary: 'MIT License', toc: [], words: license.split(/\s+/).length, ids: [],
  html: `<div class="sb-code"><div class="sb-code-bar"><span></span><button type="button" class="sb-copy">Copy</button></div><pre tabindex="0"><code>${esc(license)}</code></pre></div>` });
for (const c of anchorChecks) if (!pages.get(c.page)?.ids.includes(c.id)) report.missingAnchors.push(`${c.from} -> ${c.page}#${c.id}`);
if (report.missingAnchors.length || report.unresolved.length) throw new Error(`Broken links in the source:\n  ${[...report.missingAnchors, ...report.unresolved].join('\n  ')}`);

// ---- 6. Shelves and reading order, from the source's own indexes ----
const linksIn = source => [...read(source).matchAll(/\]\(([^)#\s]+)(?:#[^)]*)?\)/g)].map(m => posix.normalize(posix.join(posix.dirname(source), m[1])));
function section(folder) {
  const index = `${folder}/README.md`;
  const listed = linksIn(index).filter(p => posix.dirname(p) === folder && pages.has(p) && p !== index);
  const rest = [...pages.keys()].filter(p => posix.dirname(p) === folder && p !== index && !listed.includes(p)).sort();
  const order = [index, ...new Set(listed), ...rest];
  const head = pages.get(index);
  return { id: posix.basename(folder), title: head.title, summary: head.summary, url: head.url, pages: order.map(p => pages.get(p).url) };
}
const guides = read('docs/README.md');
const groupBlock = heading => guides.split(/^## /m).find(b => b.startsWith(heading));
const foldersIn = block => [...new Set([...block.matchAll(/\]\(([\w-]+)\/README\.md\)/g)].map(m => `docs/${m[1]}`))].filter(f => pages.has(`${f}/README.md`));
const groupOf = (id, heading, folders) => { const block = groupBlock(heading); const summary = plain(new Marked().parseInline(block.split(/\n\s*\n/)[1].replace(/\n/g, ' '))).trim();
  return { id, title: heading, summary, sections: folders.map(section) }; };
const groups = [
  groupOf('course', 'The agents course', foldersIn(groupBlock('The agents course'))),
  groupOf('handbooks', 'The handbooks', foldersIn(groupBlock('The handbooks'))),
  groupOf('second-brain', 'Second brain', foldersIn(groupBlock('Second brain'))),
  { id: 'resources', title: pages.get('resources/README.md').title, summary: pages.get('resources/README.md').summary, sections: [section('resources')] },
];
// One reading order through everything: the overview, the guides, each shelf in turn, the roadmap with the second brain, then the license.
const order = [pages.get('README.md').url, pages.get('docs/README.md').url];
for (const g of groups) { if (g.id === 'second-brain') order.push(pages.get('docs/ROADMAP.md').url); for (const s of g.sections) order.push(...s.pages); }
order.push(pages.get('LICENSE').url);
const missing = [...pages.values()].filter(p => !order.includes(p.url)).map(p => p.source);
if (missing.length) throw new Error(`Pages outside the reading order: ${missing.join(', ')}`);
if (new Set(order).size !== order.length) throw new Error('A page appears twice in the reading order');

// ---- 7. Figures, recoloured from the source's light palette to the cave's ----
const PALETTE = { '#F7F9F6': '#14181c', '#D2DACF': '#3a4046', '#4B5A52': '#c9ced1', '#7C8A82': '#959ca0', '#1F6B52': '#e6b94f', '#8A6B23': '#8fc1d4' };
// A figure may hold only drawing elements and attributes (it is served from this site, so it must not be able to run anything).
const SVG_TAGS = new Set(['svg', 'defs', 'marker', 'g', 'path', 'rect', 'line', 'polyline', 'polygon', 'circle', 'ellipse', 'text', 'tspan', 'title', 'desc']);
const SVG_ATTRS = new Set(['xmlns', 'viewBox', 'width', 'height', 'id', 'x', 'y', 'x1', 'x2', 'y1', 'y2', 'cx', 'cy', 'r', 'rx', 'ry', 'd', 'points', 'fill', 'stroke',
  'stroke-width', 'stroke-dasharray', 'stroke-linecap', 'stroke-linejoin', 'opacity', 'fill-opacity', 'stroke-opacity', 'font-family', 'font-size', 'font-weight',
  'font-style', 'text-anchor', 'dominant-baseline', 'letter-spacing', 'transform', 'marker-end', 'marker-start', 'markerWidth', 'markerHeight', 'refX', 'refY',
  'orient', 'markerUnits', 'role', 'aria-label']);
const figs = walk('docs').filter(p => p.endsWith('.svg'));
const recoloured = figs.map(p => {
  let svg = read(p);
  const body = svg.replace(/^\s*<\?xml[^>]*\?>/, '');
  const tags = [...body.matchAll(/<\/?\s*([^\s/>!]+)/g)].map(m => m[1]).filter(t => !SVG_TAGS.has(t));
  const attrs = [...body.matchAll(/<\s*[^\s/>!]+((?:\s+[^\s=>]+\s*=\s*(?:"[^"]*"|'[^']*'))*)\s*\/?>/g)].flatMap(m => [...m[1].matchAll(/([^\s=]+)\s*=\s*(["'])(.*?)\2/g)])
    .filter(([, k, , v]) => !SVG_ATTRS.has(k) || (/^marker-(end|start)$/.test(k) && !/^url\(#[\w-]+\)$/.test(v))).map(([, k]) => k);
  const unparsed = body.replace(/<\s*[^\s/>!]+(?:\s+[^\s=>]+\s*=\s*(?:"[^"]*"|'[^']*'))*\s*\/?>|<\/\s*[^\s>]+\s*>/g, '');
  if (tags.length || attrs.length || /[<>]/.test(unparsed)) throw new Error(`${p}: not a plain drawing (${[...tags, ...attrs].join(' ') || 'markup it could not read'})`);
  for (const [from, to] of Object.entries(PALETTE)) svg = svg.replaceAll(from, to).replaceAll(from.toLowerCase(), to);
  const left = [...new Set(svg.match(/#[0-9A-Fa-f]{6}\b/g) ?? [])].filter(c => !Object.values(PALETTE).includes(c));
  if (left.length) throw new Error(`${p}: colours outside the palette map: ${left.join(' ')}`);
  return [posix.basename(p), svg];
});
rmSync(FIGS, { recursive: true, force: true }); mkdirSync(FIGS, { recursive: true });
for (const [name, svg] of recoloured) writeFileSync(join(FIGS, name), svg);
const unknownFigs = [...report.figures].filter(f => !figs.some(p => posix.basename(p) === f));
if (unknownFigs.length) throw new Error(`Figures referenced but not found: ${unknownFigs.join(', ')}`);

// ---- 8. Write ----
const date = execFileSync('curl', ['-sf', `https://api.github.com/repos/${REPO}/commits/${commit}`]).toString().match(/"date":\s*"([^"]+)"/)?.[1] ?? null;
const library = {
  source: { repo: `https://github.com/${REPO}`, site: 'https://secondbrainos.dev/', author: 'undefined-ui', license: 'MIT', commit, date, synced: new Date().toISOString().slice(0, 10) },
  groups, order,
  pages: Object.fromEntries([...pages.values()].map(p => { const { ids: _ids, ...page } = p; void _ids; return [page.url, page]; })),
};
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(library) + '\n');
console.log(`Second Brain OS @ ${commit.slice(0, 7)} (${date})`);
console.log(`pages ${pages.size}  words ${[...pages.values()].reduce((n, p) => n + p.words, 0)}  figures ${figs.length}  bytes ${statSync(OUT).size}`);
console.log(`shelves ${groups.map(g => `${g.title}: ${g.sections.length}`).join(' | ')}`);
console.log(`links: ${JSON.stringify(report.links)}`);
for (const [k, label] of [['missingAnchors', 'anchors not found'], ['unresolved', 'links not resolved'], ['stripped', 'raw HTML dropped']]) console.log(`${label}: ${report[k].length}${report[k].length ? '\n  ' + report[k].join('\n  ') : ''}`);
console.log(`wrote ${relative(ROOT, OUT)} and ${relative(ROOT, FIGS)}/`);
// The live map is laid out from the library, so it follows every sync.
execFileSync(process.execPath, [join(ROOT, 'scripts/second-brain-os-map.mjs')], { stdio: 'inherit' });
