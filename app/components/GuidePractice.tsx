"use client";

import { useState } from "react";
import type { GuideWorkflow } from "../guide-workflows";

export function GuidePractice({ workflow }: { workflow: GuideWorkflow }) {
  const [copied, setCopied] = useState("");
  const [checked, setChecked] = useState<string[]>([]);
  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(workflow.prompt);
      setCopied("Prompt copied. Replace the placeholder with your approved notes.");
    } catch {
      setCopied("Copy is unavailable in this browser. You can select the prompt below.");
    }
  }
  return (
    <>
      <section className="content-section practice-section" id="practice">
        <div className="practice-heading"><p className="eyebrow">Your starting prompt</p><button className="button secondary" type="button" onClick={copyPrompt}>Copy prompt</button></div>
        <pre className="prompt-document">{workflow.prompt}</pre>
        <p role="status">{copied}</p>
        <details className="worked-example">
          <summary>See a worked example</summary>
          <p className="eyebrow">Sample input</p><p>{workflow.input}</p>
          <p className="eyebrow">Illustrative output</p><pre>{workflow.output}</pre>
          <p>Example for learning. Your AI tool may produce a different draft; check it against your source.</p>
        </details>
      </section>
      <section className="content-section review-checklist">
        <p className="eyebrow">Keep the judgment human</p>
        <h2>Before this leaves your desk.</h2>
        <p>Use this checklist after trying the workflow.</p>
        {workflow.checks.map(check => <label key={check}><input type="checkbox" checked={checked.includes(check)} onChange={event => setChecked(current => event.target.checked ? [...current, check] : current.filter(item => item !== check))} /><span>{check}</span></label>)}
        <p role="status">{checked.length} of {workflow.checks.length} checks complete{checked.length === workflow.checks.length ? ". Ready for your final review." : "."}</p>
        <p>{workflow.next}</p>
      </section>
    </>
  );
}
