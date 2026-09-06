"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AifaMascot } from "./AifaMascot";

type ChatMessage = {
  role: "assistant" | "user";
  content: string;
};

const QUICK_PROMPTS = [
  "Explain AI simply",
  "Show me a role guide",
  "How can I use AI at work?",
  "Help me build a site",
];

export function AifaAssistant({ initialOpen = false }: { initialOpen?: boolean }) {
  const [open, setOpen] = useState(initialOpen);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "I’m AIFA. I can help you learn AI simply, pick the right guide for your role, or think through a site or workflow.",
    },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOpen() {
      setOpen(true);
    }

    window.addEventListener("aifa-assistant-open", handleOpen as EventListener);

    return () => {
      window.removeEventListener(
        "aifa-assistant-open",
        handleOpen as EventListener,
      );
    };
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, open]);

  const recentMessages = useMemo(() => messages.slice(-10), [messages]);

  async function sendMessage(content: string) {
    const trimmed = content.trim();

    if (!trimmed || loading) {
      return;
    }

    setError("");
    setMessages((current) => [...current, { role: "user", content: trimmed }]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/aifa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...recentMessages, { role: "user", content: trimmed }],
          path: window.location.pathname,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { reply?: string; error?: string }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "AIFA is taking a short break.");
      }

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            payload?.reply ??
            "I’m here, but I couldn’t generate a response just now.",
        },
      ]);
    } catch (caught) {
      const message =
        caught instanceof Error
          ? caught.message
          : "AIFA is unavailable right now.";
      setError(message);
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            "I’m warming back up. Try again in a moment, or use the guides and contact section while I recover.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="aifa-assistant-shell">
      {open ? (
        <section
          className="aifa-assistant-panel"
          role="dialog"
          aria-label="AIFA chat helper"
        >
          <header className="aifa-assistant-header">
            <div className="aifa-assistant-header-copy">
              <AifaMascot className="aifa-assistant-mascot" />
              <div>
                <p>AIFA</p>
                <span>Ask about AI learning, role guides, or site building</span>
              </div>
            </div>
            <button
              type="button"
              className="aifa-assistant-close"
              aria-label="Close AIFA assistant"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
          </header>

          <div className="aifa-assistant-messages" role="log" aria-live="polite">
            {messages.map((message, index) => (
              <article
                key={`${message.role}-${index}-${message.content.slice(0, 12)}`}
                className={
                  message.role === "assistant"
                    ? "aifa-assistant-bubble assistant"
                    : "aifa-assistant-bubble user"
                }
              >
                {message.content}
              </article>
            ))}
            <div ref={endRef} />
          </div>

          <div className="aifa-assistant-prompts" aria-label="Quick prompts">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => sendMessage(prompt)}
              >
                {prompt}
              </button>
            ))}
          </div>

          <form
            className="aifa-assistant-form"
            onSubmit={(event) => {
              event.preventDefault();
              void sendMessage(input);
            }}
          >
            <label className="sr-only" htmlFor="aifa-assistant-input">
              Ask AIFA
            </label>
            <input
              id="aifa-assistant-input"
              type="text"
              value={input}
              placeholder="Ask AIFA something simple..."
              onChange={(event) => setInput(event.target.value)}
            />
            <button type="submit" disabled={loading}>
              {loading ? "Thinking" : "Send"}
            </button>
          </form>
          {error ? <p className="aifa-assistant-error">{error}</p> : null}
        </section>
      ) : (
        <button
          type="button"
          className="aifa-assistant-launcher"
          onClick={() => setOpen(true)}
        >
          <AifaMascot className="aifa-assistant-launcher-mascot" />
          Ask AIFA
        </button>
      )}
    </div>
  );
}
