/* The bAI room of learning: its own page (Balram, Nov 7), in the cave's styling, linked from the top menu and the learning deck.
   Nov 8 (Balram: "make the room background like a classroom in the cave"): a classroom carved into the cave stands behind the
   heading, its board a constellation; a card with art spans the room and shows its resource's own picture.
   Every card is someone else's resource, linked to its original and described in its own words (content.ts). Server-rendered,
   so it reads without JavaScript; only the shared top bar is a client component. */
import { roomOfLearning } from '../bairam/content';
import { SiteHeader } from '../masthead/site-header';
import { Constellation } from './constellation';

function Arrow() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" /></svg>; }

// "bAI": the AI in gold, as in the bAIram wordmark.
function Name() { return <>b<span>AI</span>{roomOfLearning.name.slice(3)}</>; }

const ART = '/assets/room-of-learning/classroom';
const sizes = (ext: string) => [960, 1600, 2400].map(w => `${ART}-${w}.${ext} ${w}w`).join(', ');

// The classroom in the cave: rows of desks by candlelight before a board of gold stars. Decorative, so hidden from screen readers.
function Classroom() {
  return <div className="bl-scene" aria-hidden="true">
    <picture>
      <source media="(max-width: 760px)" type="image/avif" srcSet={`${ART}-phone-900.avif`} />
      <source media="(max-width: 760px)" type="image/webp" srcSet={`${ART}-phone-900.webp`} />
      <source type="image/avif" srcSet={sizes('avif')} sizes="100vw" />
      <img src={`${ART}-1600.webp`} srcSet={sizes('webp')} sizes="100vw" alt="" fetchPriority="high" />
    </picture>
  </div>;
}

export function RoomOfLearning() {
  return <div className="bm-page bl-page">
    <Classroom />
    <SiteHeader page="learning" skipTo="room" />
    <main className="bl-main" id="room" tabIndex={-1}>
      <header className="bl-head">
        <h1 className="bl-title" aria-label={roomOfLearning.name}><Name /></h1>
        <p className="bl-intro">{roomOfLearning.intro}</p>
      </header>
      <ul className="bl-cards">
        {roomOfLearning.cards.map(card => <li className={`bj-card bl-card${card.art ? ' bl-card-art' : ''}`} key={card.title}>
          <div className="bl-card-words">
            <h2>{card.title}</h2>
            <p>{card.summary}</p>
            <div className="bl-links">
              <a className="bj-link bl-read" href={card.read.href}>{card.read.label} <Arrow /></a>
              {card.links.map(link => <a className="bj-link" key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">{link.label} <Arrow /><span className="bj-sr"> (opens in a new tab)</span></a>)}
            </div>
          </div>
          {card.art === 'constellation' && <div className="bl-card-pic"><Constellation /></div>}
        </li>)}
      </ul>
    </main>
  </div>;
}
