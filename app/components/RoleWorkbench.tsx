"use client";

import { useState } from "react";
import Link from "next/link";
import { guideWorkflows } from "../guide-workflows";

export function RoleWorkbench() {
  const [role, setRole] = useState("managers");
  const [view, setView] = useState<"input" | "output">("input");
  const workflow = guideWorkflows[role];

  return (
    <div className="role-workbench">
      <div className="role-picker" role="group" aria-label="Choose your role">
        {Object.entries(guideWorkflows).map(([slug, item]) => (
          <button key={slug} type="button" aria-pressed={role === slug} onClick={() => setRole(slug)}>{item.role}</button>
        ))}
      </div>
      <div className="workbench-body">
        <div className="workbench-brief">
          <p className="eyebrow">A {workflow.minutes}-minute starting point</p>
          <h3>{workflow.task}</h3>
          <p>{workflow.steps[0].body}</p>
          <a className="button primary" href={`/guides/${role}`}>Try this workflow</a>
          <Link className="workbench-all" href="/guides">Explore all role guides</Link>
        </div>
        <div className="workbench-example">
          <div className="example-toolbar">
            <span>Illustrative example</span>
            <div role="group" aria-label="Example view">
              <button type="button" aria-pressed={view === "input"} onClick={() => setView("input")}>Rough notes</button>
              <button type="button" aria-pressed={view === "output"} onClick={() => setView("output")}>Clear output</button>
            </div>
          </div>
          <div className="example-paper" key={`${role}-${view}`}>
            <p className="eyebrow">{view === "input" ? "Start with context" : "Review before using"}</p>
            <pre>{view === "input" ? workflow.input : workflow.output}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
