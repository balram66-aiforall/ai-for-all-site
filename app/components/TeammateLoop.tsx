"use client";

import { useState } from "react";
import { FilePenLine, ListChecks, ScanLine, Send } from "lucide-react";

const stages = [
  { name: "Frame", icon: ScanLine, owner: "You set the direction", text: "A team needs a launch update. Give AI the confirmed facts, the audience, and the decision the update should support." },
  { name: "Draft", icon: FilePenLine, owner: "AI creates a first pass", text: "Ask for a short update: what changed, what is blocked, and what happens next. Keep unknown dates visible." },
  { name: "Judge", icon: ListChecks, owner: "You check the work", text: "Compare the draft with the notes. Remove unsupported claims. Confirm owners and dates. Make it sound like you." },
  { name: "Ship", icon: Send, owner: "You decide what leaves", text: "Share the approved update with the team. Keep the useful structure for next time, and refresh the facts." },
];

export function TeammateLoop() {
  const [stage, setStage] = useState(0);
  return <div className="teammate-demo">
    <div className="teammate-stages" role="group" aria-label="Explore the human and AI workflow">
      {stages.map((item, index) => <button key={item.name} type="button" aria-pressed={stage === index} onClick={() => setStage(index)}><item.icon size={18} aria-hidden="true" /><span>{item.name}</span></button>)}
    </div>
    <div className="teammate-progress" aria-hidden="true"><span style={{ transform: `translateX(${stage * 100}%)` }} /></div>
    <div className="teammate-result" key={stage}>
      <p className="eyebrow">0{stage + 1} / {stages[stage].owner}</p>
      <p>{stages[stage].text}</p>
    </div>
  </div>;
}
