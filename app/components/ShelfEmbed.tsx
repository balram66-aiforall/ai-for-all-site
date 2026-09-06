"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

const shelfVolumes = [
  ["Framer", "#d45c42", "#111111"],
  ["Xcode", "#9cb2c1", "#111111"],
  ["Codex", "#263652", "#ffffff"],
  ["Claude", "#bd5939", "#ffffff"],
  ["Cursor", "#d0d842", "#111111"],
  ["Figma", "#c84b3f", "#ffffff"],
  ["Craft", "#6972ae", "#000000"],
];

export function ShelfEmbed() {
  const [active, setActive] = useState(false);
  const windowRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!active || !windowRef.current) return;
    let visible = true;
    const notifyFrame = () => frameRef.current?.contentWindow?.postMessage({ type: "aifa-shelf-visibility", visible: visible && !document.hidden }, window.location.origin);
    const observer = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      notifyFrame();
    });
    observer.observe(windowRef.current);
    const onReady = (event: MessageEvent) => {
      if (event.origin === window.location.origin && event.source === frameRef.current?.contentWindow && event.data?.type === "aifa-shelf-ready") notifyFrame();
    };
    window.addEventListener("message", onReady);
    document.addEventListener("visibilitychange", notifyFrame);
    return () => {
      observer.disconnect();
      window.removeEventListener("message", onReady);
      document.removeEventListener("visibilitychange", notifyFrame);
    };
  }, [active]);

  return (
    <div ref={windowRef} className={active ? "complete-shelf-window is-active" : "complete-shelf-window"}>
      {active ? (
        <>
          <iframe
            ref={frameRef}
            className="complete-shelf-frame"
            title="Working Volumes — Seven Tools for Making"
            src="/landing-pages/complete-shelf-v2.html"
            sandbox="allow-downloads allow-forms allow-modals allow-popups allow-same-origin allow-scripts"
          />
          <button
            type="button"
            className="shelf-exit"
            onClick={() => setActive(false)}
          >
            Return to page
          </button>
        </>
      ) : (
        <>
          <div className="shelf-poster" aria-hidden="true">
            <div className="shelf-poster-heading">
              <strong>Working Volumes</strong>
              <span>Seven field guides for making</span>
            </div>
            <div className="shelf-poster-volumes">
              {shelfVolumes.map(([title, color, ink], index) => (
                <span
                  key={title}
                  style={{
                    "--volume-color": color,
                    color: ink,
                    "--volume-height": `${230 + index * 10}px`,
                  } as CSSProperties}
                >
                  {title}
                </span>
              ))}
            </div>
          </div>
          <button
            type="button"
            className="shelf-activate"
            onClick={() => setActive(true)}
          >
            Explore shelf
          </button>
        </>
      )}
    </div>
  );
}
