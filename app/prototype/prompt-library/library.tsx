/* The prompt library, a wing of the bAI room of learning (Balram, Nov 13: "Approved, build it, but it should be a separate
   page, with a good header"; Nov 13: "Wing, copy approved, make new art"; Nov 14: "Go with A, grand hall").
   A full-width hero over the grand hall in the cave (copy left, the lit shelves right), then the shelf of 36 prompts.
   The header copy is his approved text word for word (COPY). The shelf is a client component, but every prompt is in the
   server HTML, so the page reads without JavaScript. */
import { SiteHeader } from '../masthead/site-header';
import { roomOfLearning } from '../bairam/content';
import { groups, prompts } from './prompts';
import { Shelf } from './shelf';

export const PATH = '/bai-room-of-learning/prompt-library';
export const ART = '/assets/prompt-library/grand-hall';
const sizes = (ext: string) => [960, 1600, 2400].map(w => `${ART}-${w}.${ext} ${w}w`).join(', ');

// APPROVED Nov 13 (Balram: "copy approved"). The counts are read from the data, and a test pins them to 36 and 8.
export const COPY = {
  eyebrow: roomOfLearning.name,
  title: 'The prompt library',
  lede: '36 prompts I use for meetings, writing, research, data, planning, people, code and learning. Pick one, fill in the [brackets], and paste it into ChatGPT, Claude or Gemini.',
  stats: [[prompts.length, 'prompts'], [groups.length, 'groups'], [3, 'assistants']] as const,
  steps: ['Pick a prompt', 'Fill the brackets', 'Paste and send'],
  own: 'Want to write your own?',
  framework: { label: 'Learn the CROFTC framework', href: '/prompting-framework' },
} as const;

function Forward() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>; }

export function PromptLibrary() {
  return <div className="bm-page pl-page">
    <SiteHeader page="learning" skipTo="pl-main" within />
    <main id="pl-main" tabIndex={-1}>
      <header className="pl-hero">
        <picture className="pl-hero-art">
          <source media="(max-width: 760px)" type="image/avif" srcSet={`${ART}-phone-900.avif`} />
          <source media="(max-width: 760px)" type="image/webp" srcSet={`${ART}-phone-900.webp`} />
          <source type="image/avif" srcSet={sizes('avif')} sizes="100vw" />
          <img src={`${ART}-1600.webp`} srcSet={sizes('webp')} sizes="100vw" alt="" width={1600} height={914} decoding="async" fetchPriority="high" />
        </picture>
        <div className="pl-hero-copy">
          <p className="pl-eyebrow"><a href={roomOfLearning.path}><span>b<span className="pl-ai">AI</span>{COPY.eyebrow.slice(3)}</span></a></p>
          <h1>{COPY.title}</h1>
          <p className="pl-lede">{COPY.lede}</p>
          <dl className="pl-stats">
            {COPY.stats.map(([n, label]) => <div key={label}><dt>{label}</dt><dd>{n}</dd></div>)}
          </dl>
          <ol className="pl-steps" aria-label="How to use a prompt">
            {COPY.steps.map(step => <li key={step}>{step}</li>)}
          </ol>
          <p className="pl-own">{COPY.own} <a href={COPY.framework.href}>{COPY.framework.label} <Forward /></a></p>
        </div>
      </header>
      <Shelf groups={groups} prompts={prompts} />
    </main>
  </div>;
}
