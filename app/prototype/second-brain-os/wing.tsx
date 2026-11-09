/* The Second Brain OS wing of the bAI room of learning: the live map beside the title, over the classroom in the cave (Nov 8,
   Balram: "lets bring the map to the header"), then the learning path from human to superhuman (path.ts), then the
   four shelves (the course, the handbooks, the second brain, the resources), each a row of stone tablets strung on the gold
   cable from the cave map. Titles and summaries are the author's own, from the synced indexes. */
import { SiteHeader } from '../masthead/site-header';
import { roomOfLearning } from '../bairam/content';
import { Arrow, Credit, Trail } from './parts';
import { WING, library, totals, type Group } from './library';
import { LiveMap } from './live-map';
import { Film } from './film';
import { mapData } from './map-data';
import { LearningPath } from './learning-path';
import { learningPath, pathInfo } from './path';

const tablets = (group: Group) => group.sections.length === 1
  ? group.sections[0].pages.slice(1).map(url => { const p = library.pages[url]; return { key: url, title: p.title, summary: p.summary, url, pages: 0 }; })
  : group.sections.map(s => ({ key: s.id, title: s.title, summary: s.summary, url: s.url, pages: s.pages.length }));

const TOOLS = [
  ['Commands, skills and agents', `${library.source.repo}/tree/main/commands`],
  ['Vault template', `${library.source.repo}/tree/main/vault-template`],
  ['Knowledge graph', library.source.site],
] as const;

export function Wing() {
  const t = totals();
  const overview = library.pages[`${WING}/overview`];
  const card = roomOfLearning.cards[0];
  const github = card.links.find(l => l.href.startsWith(library.source.repo))!;
  return <div className="bm-page sb-page sb-wing">
    <SiteHeader page="learning" skipTo="sb-main" within />
    <main id="sb-main" tabIndex={-1}>
      <header className="sb-hero">
        <picture className="sb-hero-art">
          <source media="(max-width: 760px)" type="image/avif" srcSet="/assets/room-of-learning/classroom-phone-900.avif" />
          <source media="(max-width: 760px)" type="image/webp" srcSet="/assets/room-of-learning/classroom-phone-900.webp" />
          <source type="image/avif" srcSet="/assets/room-of-learning/classroom-960.avif 960w, /assets/room-of-learning/classroom-1600.avif 1600w, /assets/room-of-learning/classroom-2400.avif 2400w" sizes="100vw" />
          <img src="/assets/room-of-learning/classroom-1600.webp" srcSet="/assets/room-of-learning/classroom-960.webp 960w, /assets/room-of-learning/classroom-1600.webp 1600w, /assets/room-of-learning/classroom-2400.webp 2400w" sizes="100vw" alt="" width={1600} height={914} decoding="async" fetchPriority="high" />
        </picture>
        <div className="sb-hero-copy">
          <Trail steps={[]} atWing />
          <h1>{card.title}</h1>
          <p className="sb-lede">{card.summary}</p>
          <Credit />
          <div className="sb-actions">
            <a className="sb-button" href={overview.url}>Start reading <Arrow /></a>
            <a className="sb-link" href={github.href} target="_blank" rel="noopener noreferrer">{github.label} <Arrow /><span className="sb-sr"> (opens in a new tab)</span></a>
          </div>
          <dl className="sb-stats">
            <div><dt>Pages</dt><dd>{t.pages}</dd></div>
            {library.groups.slice(0, 3).map(g => <div key={g.id}><dt>{g.title}</dt><dd>{g.sections.length}</dd></div>)}
          </dl>
        </div>
        <div className="sb-hero-map">
          <p className="sb-map-cap"><span className="sb-shelf-n">{t.pages} pages · {mapData.edges.length} links</span> Every page is a point; every link between two pages is a thread. The pages you read to the end stay lit.</p>
          <LiveMap data={mapData} />
        </div>
      </header>

      <section className="sb-filmsec" aria-label="The wing in a minute">
        <Film id="wing-intro" title={card.title} />
      </section>

      <LearningPath stages={learningPath} info={pathInfo} />

      {library.groups.map((group, gi) => <section className="sb-shelf" id={group.id} key={group.id} aria-labelledby={`${group.id}-title`}>
        <header className="sb-shelf-head">
          <p className="sb-shelf-n">{String(gi + 1).padStart(2, '0')}</p>
          <h2 id={`${group.id}-title`}><a href={group.sections[0].url}>{group.title}</a></h2>
          <p>{group.summary}</p>
        </header>
        <ol className="sb-cable">
          {tablets(group).map(tab => <li key={tab.key} className="sb-tablet">
            <span className="sb-node" aria-hidden="true" />
            <a href={tab.url}>
              <h3>{tab.title}</h3>
              <p>{tab.summary}</p>
              {tab.pages > 0 && <span className="sb-count">{tab.pages} pages</span>}
            </a>
          </li>)}
        </ol>
      </section>)}

      <footer className="sb-foot">
        <div>
          <p className="sb-shelf-n">Also in the repo</p>
          <ul>{TOOLS.map(([label, href]) => <li key={href}><a className="sb-link" href={href} target="_blank" rel="noopener noreferrer">{label} <Arrow /><span className="sb-sr"> (opens in a new tab)</span></a></li>)}</ul>
        </div>
        <Credit />
        <p className="sb-synced">Synced from commit <a href={`${library.source.repo}/tree/${library.source.commit}`} target="_blank" rel="noopener noreferrer"><code>{library.source.commit.slice(0, 7)}</code><span className="sb-sr"> (opens in a new tab)</span></a>{library.source.date && <>, {new Date(library.source.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })}</>}</p>
      </footer>
    </main>
  </div>;
}
