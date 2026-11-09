/* A short narrated overview of a section (or of the wing), at the top of the section's first page (Nov 9, Balram: "lets update
   all of them to the site"). The film plays from /media/second-brain-os/<id>.mp4, which the worker serves with byte ranges
   (Safari will not play a video without them, and the static asset server ignores Range); the poster and captions are plain
   static files. Narration lines are summaries of the author's pages; the transcript sits under the film for anyone who
   would rather read. Nothing here needs JavaScript. */
import data from './data/films.json';

type FilmData = { seconds: number; bytes: number; v: string; transcript: string };
const films = data as Record<string, FilmData>;

export const hasFilm = (id: string) => Object.hasOwn(films, id);
// ?v= is a hash of the film, poster and captions (films.json), so a re-render is a new address and long caching is safe.
export const filmSrc = (id: string) => `/media/second-brain-os/${id}.mp4?v=${films[id].v}`;
const asset = (id: string, file: string) => `/assets/second-brain-os/films/${id}${file}?v=${films[id].v}`;
const clock = (seconds: number) => { const s = Math.round(seconds); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };

export function Film({ id, title }: { id: string; title: string }) {
  if (!hasFilm(id)) return null;
  const film = films[id];
  return <figure className="sb-film" data-film={id}>
    <video controls preload="none" playsInline poster={asset(id, '-poster.webp')} width={1920} height={1080} aria-label={`Video overview: ${title}`}>
      <source src={filmSrc(id)} type="video/mp4" />
      <track kind="captions" src={asset(id, '.vtt')} srcLang="en" label="English" />
    </video>
    <figcaption>
      <p className="sb-film-meta">Video overview <span aria-hidden="true">·</span> <time dateTime={`PT${Math.round(film.seconds)}S`}>{clock(film.seconds)}</time> <span aria-hidden="true">·</span> AI-narrated, with captions</p>
      <details className="sb-film-text">
        <summary>Read the transcript</summary>
        <p>{film.transcript}</p>
      </details>
    </figcaption>
  </figure>;
}
