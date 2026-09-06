"use client";

import { lazy, Suspense, useEffect, useState } from "react";
import { AifaMascot } from "./AifaMascot";

const LazyAifaAssistant = lazy(() =>
  import("./AifaAssistant").then((module) => ({
    default: module.AifaAssistant,
  })),
);

export function AifaAssistantLoader() {
  const [loadAssistant, setLoadAssistant] = useState(false);
  const [openOnLoad, setOpenOnLoad] = useState(false);

  useEffect(() => {
    function handleOpen() {
      setOpenOnLoad(true);
      setLoadAssistant(true);
    }

    window.addEventListener("aifa-assistant-open", handleOpen);

    return () => {
      window.removeEventListener("aifa-assistant-open", handleOpen);
    };
  }, []);

  if (!loadAssistant) {
    return (
      <div className="aifa-assistant-shell">
        <button
          type="button"
          className="aifa-assistant-launcher"
          onClick={() => {
            setOpenOnLoad(true);
            setLoadAssistant(true);
          }}
        >
          <AifaMascot className="aifa-assistant-launcher-mascot" />
          Ask AIFA
        </button>
      </div>
    );
  }

  return (
    <Suspense fallback={null}>
      <LazyAifaAssistant initialOpen={openOnLoad} />
    </Suspense>
  );
}
