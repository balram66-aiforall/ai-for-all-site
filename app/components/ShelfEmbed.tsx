"use client";

import { useState, type CSSProperties } from "react";

const shelfVolumes = [
  ["Framer", "#d45c42"],
  ["Xcode", "#9cb2c1"],
  ["Codex", "#263652"],
  ["Claude", "#bd5939"],
  ["Cursor", "#d0d842"],
  ["Figma", "#c84b3f"],
  ["Craft", "#6972ae"],
];

export function ShelfEmbed() {
  const [active, setActive] = useState(false);

  return (
    <div className={active ? "complete-shelf-window is-active" : "complete-shelf-window"}>
      {active ? (
        <>
          <iframe
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
              {shelfVolumes.map(([title, color], index) => (
                <span
                  key={title}
                  style={{
                    "--volume-color": color,
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
