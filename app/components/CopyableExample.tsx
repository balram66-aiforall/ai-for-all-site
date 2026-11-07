"use client";

import { useState } from "react";

export function CopyableExample({
  label,
  text,
  buttonLabel = "Copy prompt",
  success = "Copied.",
}: { label: string; text: string; buttonLabel?: string; success?: string }) {
  const [status, setStatus] = useState("");

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setStatus(success);
    } catch {
      setStatus("Copy is unavailable in this browser. You can select the text below.");
    }
  }

  return <>
    <div className="practice-heading">
      <p className="eyebrow">{label}</p>
      <button className="button secondary" type="button" onClick={copy} aria-label={`${buttonLabel}: ${label}`}>{buttonLabel}</button>
    </div>
    <pre className="prompt-document">{text}</pre>
    <p role="status">{status}</p>
  </>;
}
