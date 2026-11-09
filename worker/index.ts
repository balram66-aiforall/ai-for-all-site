/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";
import films from "../app/prototype/second-brain-os/data/films.json";

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

// Second Brain OS films (app/prototype/second-brain-os/film.tsx). The files live in the static assets, but the asset server
// answers every request with the whole file and ignores Range, and Safari will not play a video without byte ranges (and
// seeking needs them everywhere). So the player asks /media/second-brain-os/<id>.mp4, and this serves the same file in
// slices: only names in films.json, only GET and HEAD (others 405), never buffered (the requested bytes are streamed
// through, so memory stays flat however many people watch), one range per request (RFC 9110: anything else gets the
// whole file), If-Range honoured. Film URLs carry ?v=<content hash>, so a re-render is a new URL and caching is safe.

const FILM = /^\/media\/second-brain-os\/([a-z0-9]+(?:-[a-z0-9]+)*)\.mp4$/;
const FILMS = films as Record<string, { bytes: number; v: string }>;

function sliceStream(src: ReadableStream<Uint8Array>, start: number, end: number): ReadableStream<Uint8Array> {
  let pos = 0;
  return src.pipeThrough(new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, out) {
      const a = Math.max(start - pos, 0), b = Math.min(end + 1 - pos, chunk.byteLength);
      pos += chunk.byteLength;
      if (b > a) out.enqueue(chunk.subarray(a, b));
      if (pos > end) out.terminate();
    },
  }));
}

// One "bytes=a-b", "bytes=a-" or "bytes=-n" range. null = not one usable range (serve the whole file); "unsatisfiable" = 416.
function parseRange(header: string, size: number): { start: number; end: number } | null | "unsatisfiable" {
  const m = /^bytes=(\d*)-(\d*)$/i.exec(header.trim());
  if (!m || (!m[1] && !m[2])) return null;
  if (!m[1]) {
    const n = Number(m[2]);
    return n === 0 ? "unsatisfiable" : { start: Math.max(0, size - n), end: size - 1 };
  }
  const start = Number(m[1]);
  if (m[2] && Number(m[2]) < start) return null;
  if (start >= size) return "unsatisfiable";
  return { start, end: m[2] ? Math.min(Number(m[2]), size - 1) : size - 1 };
}

async function serveFilm(request: Request, env: Partial<Pick<Env, "ASSETS">> | undefined, id: string): Promise<Response> {
  const film = Object.hasOwn(FILMS, id) ? FILMS[id] : undefined;
  if (!film) return new Response("Not found", { status: 404 });
  if (request.method !== "GET" && request.method !== "HEAD") return new Response("Method not allowed", { status: 405, headers: { allow: "GET, HEAD" } });
  const size = film.bytes;
  const etag = `"${film.v}"`;
  const headers = new Headers({ "content-type": "video/mp4", "accept-ranges": "bytes", etag, "cache-control": "public, max-age=31536000, immutable", "x-content-type-options": "nosniff" });
  const ifRange = request.headers.get("if-range");
  const header = request.headers.get("range");
  const range = header && (!ifRange || ifRange === etag) ? parseRange(header, size) : null;
  if (range === "unsatisfiable") {
    headers.set("content-range", `bytes */${size}`);
    return new Response(null, { status: 416, headers });
  }
  const status = range ? 206 : 200;
  const { start, end } = range ?? { start: 0, end: size - 1 };
  if (range) headers.set("content-range", `bytes ${start}-${end}/${size}`);
  headers.set("content-length", String(end - start + 1));
  if (request.method === "HEAD") return new Response(null, { status, headers });
  // On Cloudflare the bytes come from the ASSETS binding. The local Node server (vinext start) has no bindings, so there they
  // come from its own static path on localhost only (never an address taken from the request's Host).
  const path = `/assets/second-brain-os/films/${id}.mp4`;
  let asset: Response;
  if (env?.ASSETS) asset = await env.ASSETS.fetch(new Request(new URL(path, request.url)));
  else {
    const here = new URL(request.url);
    if (!["localhost", "127.0.0.1", "[::1]"].includes(here.hostname)) return new Response("Not found", { status: 404 });
    asset = await fetch(new URL(path, here.origin));
  }
  if (!asset.ok || !asset.body || /^text\//.test(asset.headers.get("content-type") ?? "")) return new Response("Not found", { status: 404 });
  const body = range ? sliceStream(asset.body, start, end) : asset.body;
  // Workers drop Content-Length on a streamed body unless it runs through a FixedLengthStream; Node keeps the header as set.
  const Fixed = (globalThis as { FixedLengthStream?: new (n: number) => TransformStream<Uint8Array, Uint8Array> }).FixedLengthStream;
  if (!Fixed) return new Response(body, { status, headers });
  const fixed = new Fixed(end - start + 1);
  body.pipeTo(fixed.writable).catch(() => {});
  return new Response(fixed.readable, { status, headers });
}

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    const film = FILM.exec(url.pathname);
    if (film) return serveFilm(request, env, film[1]);

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
    }

    return handler.fetch(request, env, ctx);
  },
};

export default worker;
