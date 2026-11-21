/* eslint-disable @next/next/no-html-link-for-pages -- Server-rendered guide pages; plain anchors keep router code off the page, like the shared nav. */
/* A page of the AWS Quick on desktop guide: the guide's rail (hub and eight chapters), the article, On this page, and the
   previous and next pages. Same reading layout as the Second Brain OS wing (its .sb- reader and prose styles), plus .gq- parts:
   the check date and disclosure under the title, the diagrams, the From my desk note and the hub's chapter list. */
import type { Metadata } from 'next';
import { SiteHeader } from '../masthead/site-header';
import { CopyCode } from '../second-brain-os/copy-code';
import { Back, Forward } from '../second-brain-os/parts';
import { JsonLd, personId, siteUrl } from '../../seo';
import { AUTHOR, CHAPTERS, DISCLOSURE, HUB, NAME, chapterPage, hub, isLive, labelOf, longDate, neighbours, urlOf, type GuidePage } from './guide';

export const ogImage = (p: GuidePage) => `/assets/aws-quick-guide/og-${p.slug || 'hub'}.jpg`;

export function guideMetadata(p: GuidePage): Metadata {
  const url = new URL(urlOf(p), siteUrl).href;
  return {
    title: p.title, description: p.description,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: { title: p.title, description: p.description, url, type: 'article', siteName: 'AI For All', publishedTime: p.published, modifiedTime: p.modified,
      authors: [`${siteUrl}/#who`], images: [{ url: `${siteUrl}${ogImage(p)}`, width: 1200, height: 630, alt: p.heading }] },
    twitter: { card: 'summary_large_image', title: p.title, description: p.description, images: [`${siteUrl}${ogImage(p)}`] },
  };
}

function structuredData(p: GuidePage) {
  const url = new URL(urlOf(p), siteUrl).href;
  const hubUrl = new URL(HUB, siteUrl).href;
  const crumbs = [{ name: 'Home', item: `${siteUrl}/` }, { name: 'Guides', item: `${siteUrl}/guides` }, { name: NAME, item: hubUrl },
    ...(p.chapter ? [{ name: labelOf(p), item: url }] : [])];
  return { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Article', '@id': `${url}#article`, headline: p.heading, description: p.description, url, mainEntityOfPage: url,
      datePublished: p.published, dateModified: p.modified, image: `${siteUrl}${ogImage(p)}`, inLanguage: 'en-IN', wordCount: p.words,
      author: { '@type': 'Person', '@id': personId, name: AUTHOR, url: siteUrl }, publisher: { '@id': personId },
      isPartOf: p.chapter ? [{ '@id': `${siteUrl}/#website` }, { '@id': `${hubUrl}#article` }] : { '@id': `${siteUrl}/#website` },
      about: { '@type': 'SoftwareApplication', name: 'AWS Quick', alternateName: 'Amazon Quick', operatingSystem: 'macOS, Windows', applicationCategory: 'BusinessApplication' } },
    { '@type': 'BreadcrumbList', '@id': `${url}#breadcrumb`, itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: c.item })) },
    { '@type': 'FAQPage', '@id': `${url}#faq`, url, mainEntity: p.faqs.map(f => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })) },
  ] };
}

function Rail({ current }: { current: GuidePage }) {
  return <nav className="sb-rail gq-rail" aria-label={`${NAME} guide`}>
    <p className="sb-rail-kicker">{NAME}</p>
    <ol className="sb-rail-top"><li><a href={HUB} aria-current={current === hub ? 'page' : undefined}>The complete guide</a></li></ol>
    <p className="sb-rail-kicker">Chapters</p>
    <ol>{CHAPTERS.map(c => {
      const page = chapterPage(c.slug);
      return <li key={c.slug}>{page
        ? <a href={urlOf(page)} aria-current={page === current ? 'page' : undefined}><span className="gq-n">{c.n}</span>{c.title}</a>
        : <span className="gq-soon"><span className="gq-n">{c.n}</span>{c.title}<em>Coming soon</em></span>}</li>;
    })}</ol>
  </nav>;
}

function OnThisPage({ page, inline }: { page: GuidePage; inline?: boolean }) {
  const toc = page.chapter ? page.toc : [...page.toc.slice(0, -1), { id: 'the-chapters', text: 'The chapters' }, ...page.toc.slice(-1)];
  const id = inline ? 'gq-toc-inline' : 'gq-toc-title';
  return <nav className={inline ? 'gq-toc-inline' : 'sb-toc'} aria-labelledby={id}>
    <p id={id} className="sb-rail-kicker">On this page</p>
    <ol>{toc.map(t => <li key={t.id}><a href={`#${t.id}`}>{t.text}</a></li>)}</ol>
  </nav>;
}

function ChapterList() {
  return <section className="gq-chapters" aria-labelledby="the-chapters">
    <h2 id="the-chapters">The chapters</h2>
    <ol>{CHAPTERS.map(c => {
      const live = isLive(c.slug);
      const inner = <><span className="gq-chapter-n">Chapter {c.n}</span><strong>{c.title}</strong><span className="gq-chapter-blurb">{c.blurb}</span>
        {!live && <em className="gq-chapter-soon">Coming soon</em>}</>;
      return <li key={c.slug} className={live ? 'gq-live' : 'gq-later'}>{live ? <a href={`${HUB}/${c.slug}`}>{inner}</a> : <div>{inner}</div>}</li>;
    })}</ol>
  </section>;
}

export function GuideReader({ page }: { page: GuidePage }) {
  const { prev, next } = neighbours(page);
  const isHub = page === hub;
  // The hub's chapter list sits just before its Sources.
  const cut = isHub ? page.html.indexOf('<h2 id="sources">') : -1;
  return <div className="bm-page sb-page gq-page">
    <SiteHeader page="learning" skipTo="gq-main" within />
    <div className="gq-band" aria-hidden="true" />
    <div className="sb-reader">
      <details className="sb-contents"><summary>Contents</summary><Rail current={page} /></details>
      <aside className="sb-side" aria-label="Guide contents"><Rail current={page} /></aside>
      <main className="sb-main" id="gq-main" tabIndex={-1}>
        <article className="sb-article gq-article" data-copy="off">
          <header className="sb-head gq-head">
            <nav className="sb-trail" aria-label="You are here">
              <ol><li><a href="/">Home</a></li><li><a href="/guides">Guides</a></li>{!isHub && <li><a href={HUB}>{NAME}</a></li>}</ol>
            </nav>
            <p className="gq-kicker">{page.chapter ? `Chapter ${page.chapter} of ${CHAPTERS.length}` : `The complete guide · ${CHAPTERS.length} chapters`}</p>
            <h1>{page.heading}</h1>
            <p className="gq-meta">By <a href="/#who">{AUTHOR}</a><span aria-hidden="true">·</span>Last checked against AWS docs on <time dateTime={page.modified}>{longDate(page.modified)}</time></p>
            <p className="gq-disclosure">{DISCLOSURE}</p>
            <OnThisPage page={page} inline />
          </header>
          <div className="sb-prose gq-prose" dangerouslySetInnerHTML={{ __html: cut > 0 ? page.html.slice(0, cut) : page.html }} />
          {cut > 0 && <><ChapterList /><div className="sb-prose gq-prose" dangerouslySetInnerHTML={{ __html: page.html.slice(cut) }} /></>}
          <CopyCode />
        </article>
        <nav className="sb-turn" aria-label="Previous and next">
          {prev ? <a className="sb-turn-prev" href={urlOf(prev)} rel="prev"><span><Back />Previous</span><strong>{labelOf(prev)}</strong></a> : <span />}
          {next ? <a className="sb-turn-next" href={urlOf(next)} rel="next"><span>Next<Forward /></span><strong>{labelOf(next)}</strong></a> : <span />}
        </nav>
      </main>
      <aside className="sb-aside" aria-label="On this page"><OnThisPage page={page} /></aside>
    </div>
    <JsonLd data={structuredData(page)} />
  </div>;
}
