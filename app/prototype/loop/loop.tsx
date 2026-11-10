/* Loop inside bAIram (/loop, Balram Nov 9: "I want to embedd this into bAIram"). Loop is one of his builds, so the page sits
   under Work: the site's top bar, a slim bar with Loop's name, tagline and the way out to the original, then Loop itself on a
   screen that fills the rest of the window. Every word is Loop's own (content.ts loop). */
import { loop } from '../bairam/content';
import { SiteHeader } from '../masthead/site-header';
import { LoopScreen, OpenLoop } from './frame';

export function LoopPage() {
  return <div className="bm-page lp-page">
    <SiteHeader page="work" skipTo="loop" />
    <main className="lp-main" id="loop" tabIndex={-1}>
      <header className="lp-bar">
        <h1 className="lp-title">{loop.name} <span className="lp-tagline">{loop.tagline}</span></h1>
        <OpenLoop className="bj-link lp-open" />
      </header>
      <LoopScreen />
    </main>
  </div>;
}
