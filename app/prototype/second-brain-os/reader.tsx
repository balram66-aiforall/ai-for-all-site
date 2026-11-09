/* A reading page of Second Brain OS: the section rail (like the cave's chapter rail), the article, On this page, and the
   previous and next pages in the one reading order. The article is the author's text as synced: links
   pointed at this site or GitHub, figures recoloured, the title lifted into the heading, the author's TODO comments left out. */
import { SiteHeader } from '../masthead/site-header';
import { Connected } from './connected';
import { CopyCode } from './copy-code';
import { Film } from './film';
import { TrailMarks } from './trail-marks';
import { Back, Credit, Forward, Trail } from './parts';
import { WING, library, neighbours, placeOf, sourceAt, type Page } from './library';

function Rail({ current }: { current: string }) {
  const here = placeOf(current);
  const standalone = ['overview', 'guides', 'roadmap', 'license'].map(s => library.pages[`${WING}/${s}`]);
  return <nav className="sb-rail" aria-label="Second Brain OS">
    <ol className="sb-rail-top">
      {standalone.map(p => <li key={p.url}><a href={p.url} data-sb-url={p.url} aria-current={p.url === current ? 'page' : undefined}>{p.title}</a></li>)}
    </ol>
    {library.groups.map(group => <div className="sb-rail-group" key={group.id}>
      <p className="sb-rail-kicker">{group.title}</p>
      {group.sections.length === 1
        ? <ol>{group.sections[0].pages.map(url => <li key={url}><a href={url} data-sb-url={url} aria-current={url === current ? 'page' : undefined}>{library.pages[url].title}</a></li>)}</ol>
        : <ol>{group.sections.map(section => {
          const open = here?.section.id === section.id;
          return <li key={section.id}>
            <details open={open}>
              <summary className={open ? 'sb-here' : undefined}>{section.title}</summary>
              <ol>{section.pages.map(url => <li key={url}><a href={url} data-sb-url={url} aria-current={url === current ? 'page' : undefined}>{url === section.url ? 'Overview' : library.pages[url].title}</a></li>)}</ol>
            </details>
          </li>;
        })}</ol>}
    </div>)}
  </nav>;
}

function OnThisPage({ page }: { page: Page }) {
  if (page.toc.length < 2) return null;
  return <nav className="sb-toc" aria-labelledby="sb-toc-title">
    <p id="sb-toc-title" className="sb-rail-kicker">On this page</p>
    <ol>{page.toc.map(t => <li key={t.id} data-depth={t.depth}><a href={`#${t.id}`}>{t.text}</a></li>)}</ol>
  </nav>;
}

export function Reader({ page }: { page: Page }) {
  const place = placeOf(page.url);
  const { prev, next } = neighbours(page.url);
  const steps = place ? [{ label: place.group.title, href: `${WING}#${place.group.id}` },
    ...(place.section.url !== page.url && place.group.sections.length > 1 ? [{ label: place.section.title, href: place.section.url }] : [])] : [];
  return <div className="bm-page sb-page">
    <SiteHeader page="learning" skipTo="sb-main" within />
    <div className="sb-band" aria-hidden="true" />
    <div className="sb-reader">
      <details className="sb-contents">
        <summary>Contents</summary>
        <Rail current={page.url} />
      </details>
      <aside className="sb-side" aria-label="Contents"><Rail current={page.url} /></aside>
      <main className="sb-main" id="sb-main" tabIndex={-1}>
        <article className="sb-article" data-copy="off">
          <header className="sb-head">
            <Trail steps={steps} />
            <h1>{page.title}</h1>
            <Credit github={sourceAt(page.github)} />
            {place && place.section.url === page.url && <Film id={place.section.id} title={place.section.title} />}
          </header>
          <div className="sb-prose" dangerouslySetInnerHTML={{ __html: page.html }} />
          <CopyCode />
        </article>
        <Connected page={page} />
        <TrailMarks url={page.url} />
        <nav className="sb-turn" aria-label="Previous and next">
          {prev ? <a className="sb-turn-prev" href={prev.url} rel="prev"><span><Back />Previous</span><strong>{prev.title}</strong></a> : <span />}
          {next ? <a className="sb-turn-next" href={next.url} rel="next"><span>Next<Forward /></span><strong>{next.title}</strong></a> : <span />}
        </nav>
      </main>
      {page.toc.length > 1 && <aside className="sb-aside" aria-label="On this page"><OnThisPage page={page} /></aside>}
    </div>
  </div>;
}
