"use client";

import { useState } from "react";

export function ShelfEmbed() {
  const [active, setActive] = useState(false);

  return (
    <div className={active ? "complete-shelf-window is-active" : "complete-shelf-window"}>
      <iframe
        className="complete-shelf-frame"
        title="Working Volumes — Seven Tools for Making"
        src="/landing-pages/complete-shelf-v2.html"
        sandbox="allow-downloads allow-forms allow-modals allow-popups allow-same-origin allow-scripts"
        loading="lazy"
      />
      {active ? (
        <button
          type="button"
          className="shelf-exit"
          onClick={() => setActive(false)}
        >
          Return to page
        </button>
      ) : (
        <button
          type="button"
          className="shelf-activate"
          onClick={() => setActive(true)}
        >
          Explore shelf
        </button>
      )}
    </div>
  );
}
