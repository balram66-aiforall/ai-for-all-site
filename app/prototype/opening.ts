/** Choreographed illustration only. This never makes AI calls or reports build status. */
export const INTRO_KEY = "balram-opening:v1";
export const INTRO_DURATION = 3000;
export type IntroState = "playing" | "complete";
export type OpeningController = { replay: () => void; dispose: () => void };

export function installOpening(root: HTMLElement, report: (state: IntroState, reduced: boolean) => void): OpeningController {
  const stage = root.querySelector<HTMLElement>(".g-stage")!;
  const control = root.querySelector<HTMLButtonElement>(".g-intro-control")!;
  const dock = root.querySelector<HTMLElement>(".g-agent-dock")!;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  let animations: Animation[] = [];
  let timer: ReturnType<typeof setTimeout> | undefined;
  let running = false;
  let disposed = false;
  let generation = 0;
  let sessionSeen = false;
  let reported = false;
  let lastReduced = reduced.matches;
  let frameRequest: number | undefined;
  const removers: (() => void)[] = [];

  function remember() {
    sessionSeen = true;
    try { sessionStorage.setItem(INTRO_KEY, "seen"); } catch { /* Storage can be unavailable. */ }
  }
  function finish() {
    if (disposed) return;
    const shouldReport = running || !reported || lastReduced !== reduced.matches;
    running = false;
    generation++;
    clearTimeout(timer);
    // Underlying CSS is always the final visible page. Cancel removes all effects.
    animations.forEach(animation => animation.cancel());
    animations = [];
    root.dataset.intro = "complete";
    remember();
    if (shouldReport) { report("complete", reduced.matches); reported = true; lastReduced = reduced.matches; }
  }
  function animate(el: Element | null, frames: Keyframe[], duration: number, delay = 0, linear = false) {
    if (!el) return;
    const animation = el.animate(frames, {
      duration, delay, fill: "both", easing: linear ? "linear" : "cubic-bezier(.16,1,.3,1)",
    });
    animations.push(animation);
    return animation;
  }
  function play() {
    if (running) finish();
    if (reduced.matches || typeof Element.prototype.animate !== "function" || document.hidden) { finish(); return; }
    const current = ++generation;
    running = true;
    root.dataset.intro = "playing";
    reported = true;
    report("playing", false);
    try {
      const bounds = stage.getBoundingClientRect();
      const target = dock.getBoundingClientRect();
      const x = Math.max(8, Math.min(bounds.width - 126, target.left - bounds.left + 16));
      const y = target.top - bounds.top + 8;
      const screen = root.querySelector<HTMLElement>(".g-project-frame")!.getBoundingClientRect();
      const left = screen.left - bounds.left;
      const top = screen.top - bounds.top;
      const width = screen.width;
      const height = screen.height;
      const points = [
        [[left + 8, top - 19], [left + width - 128, top - 19], [left + width - 128, top + height - 15]],
        [[left + 12, top - 19], [left + width * .38, top - 19], [left + width - 128, top - 19]],
        [[left + width - 128, top + height - 15], [left + 12, top + height - 15], [left + width * .32, top + height - 15]],
      ];
      const windows = [[0, .1, .3, .37, .83], [0, .29, .43, .63, .84], [0, .63, .72, .84, .87]];
      root.querySelectorAll(".g-flying-agent").forEach((el, i) => {
        const [p0, p1, p2] = points[i];
        const [start, appear, move, hold, collect] = windows[i];
        const at = (p: number[]) => `translate(${Math.round(p[0])}px, ${Math.round(p[1])}px)`;
        animate(el, [
          { offset: start, opacity: 0, transform: at(p0) },
          { offset: appear, opacity: 0, transform: at(p0) },
          { offset: Math.min(appear + .025, move), opacity: 1, transform: at(p0) },
          { offset: move, opacity: 1, transform: at(p1) },
          { offset: hold, opacity: 1, transform: at(p2) },
          { offset: collect, opacity: 1, transform: at(p2) },
          { offset: .97, opacity: 0, transform: at([x + i * 20, y]) },
          { offset: 1, opacity: 0, transform: at([x + i * 20, y]) },
        ], INTRO_DURATION, 0, true);
      });
      animate(root.querySelector(".g-scaffold"), [
        { offset: 0, opacity: 0 }, { offset: .12, opacity: 1 },
        { offset: .76, opacity: 1 }, { offset: 1, opacity: 0 },
      ], INTRO_DURATION, 0, true);
      root.querySelectorAll(".g-scaffold-line").forEach((el, i) => {
        animate(el, [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], 650, 300 + i * 110);
      });
      animate(root.querySelector(".g-project-border"), [{ opacity: 0, transform: "scale(.93)" }, { opacity: 1, transform: "scale(1)" }], 600, 500);
      root.querySelectorAll(".g-art-strip").forEach((el, i) => {
        animate(el, [{ opacity: 0, transform: `translateY(${i % 2 ? -32 : 32}px)` }, { opacity: 1, transform: "translateY(0)" }], 650, 900 + i * 140);
      });
      animate(root.querySelector(".g-project-caption"), [{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "translateY(0)" }], 500, 1450);
      animate(root.querySelector(".g-review-bracket"), [
        { opacity: 0, transform: "scale(1.035)" }, { opacity: 1, offset: .4, transform: "scale(1)" },
        { opacity: 0, transform: "scale(1)" },
      ], 650, 1900);
      animate(root.querySelector(".g-dock-icons"), [{ opacity: .22 }, { opacity: 1 }], 350, 2600);
      // Name, role, prose and navigation are intentionally never hidden.
      const clock = animate(stage, [{ offset: 0 }, { offset: 1 }], INTRO_DURATION);
      if (clock) clock.onfinish = () => { if (current === generation) finish(); };
      timer = setTimeout(finish, INTRO_DURATION + 150); // Fail open even if onfinish never fires.
    } catch { finish(); }
  }
  function listen(target: EventTarget, name: string, fn: EventListener, options?: AddEventListenerOptions) {
    target.addEventListener(name, fn, options);
    removers.push(() => target.removeEventListener(name, fn, options));
  }
  const interrupt = () => { if (running) finish(); };
  listen(window, "wheel", interrupt, { passive: true });
  listen(window, "touchmove", interrupt, { passive: true });
  listen(window, "scroll", interrupt, { passive: true });
  listen(window, "resize", interrupt, { passive: true });
  listen(window, "hashchange", interrupt);
  listen(window, "pagehide", interrupt);
  listen(document, "visibilitychange", () => { if (document.hidden) interrupt(); });
  listen(reduced, "change", () => { if (reduced.matches) finish(); else { lastReduced = false; report(running ? "playing" : "complete", false); } });
  listen(root, "click", event => { if ((event.target as Element).closest("a")) interrupt(); });
  listen(root, "focusin", event => { if (event.target !== control) interrupt(); });
  listen(document, "keydown", event => {
    const e = event as KeyboardEvent;
    if (e.key === " " && e.target === control) return;
    if (["Escape", "PageDown", "PageUp", "Home", "End", "ArrowDown", "ArrowUp", " "].includes(e.key)) interrupt();
  });
  try { sessionSeen = sessionStorage.getItem(INTRO_KEY) === "seen"; } catch { /* In-memory fallback. */ }
  // Static-first, including deep links, back navigation, slow hydration and reduced motion.
  const paintedAt = performance.getEntriesByName("first-contentful-paint")[0]?.startTime;
  const late = paintedAt !== undefined ? performance.now() - paintedAt > 2200 : performance.now() > 4000;
  if (sessionSeen || reduced.matches || window.location.hash || window.scrollY > 20 || late || (document.activeElement && document.activeElement !== document.body)) finish();
  else play();
  // Font swaps or responsive reflow cannot leave agents flying to stale coordinates.
  const initialBox = stage.getBoundingClientRect();
  const observer = typeof ResizeObserver === "function" ? new ResizeObserver(() => {
    const box = stage.getBoundingClientRect();
    if (Math.abs(box.width - initialBox.width) > 1 || Math.abs(box.height - initialBox.height) > 1) interrupt();
  }) : null;
  observer?.observe(stage);

  return {
    replay() {
      if (running) finish();
      else {
        if (window.scrollY > 20) {
          window.scrollTo({ top: 0, behavior: "instant" });
          frameRequest = requestAnimationFrame(() => { if (!disposed) play(); });
        } else play();
      }
    },
    dispose() {
      disposed = true;
      clearTimeout(timer);
      if (frameRequest !== undefined) cancelAnimationFrame(frameRequest);
      animations.forEach(animation => animation.cancel());
      animations = [];
      observer?.disconnect();
      removers.forEach(remove => remove());
    },
  };
}
