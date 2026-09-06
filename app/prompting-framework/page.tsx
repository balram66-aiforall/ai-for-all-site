import type { Metadata } from "next";
import { PromptingFrameworkClient } from "./prompting-framework-client";
import "./framework.css";

export const metadata: Metadata = {
  title: "CROFTC | Prompt Framework",
  description:
    "Learn Context, Role, Objective, Format, Tone, and Constraints with a local prompt organizer, a builder, worked examples, and a quiz at the School of AIFA.",
};

export default function PromptingFrameworkPage() {
  return <PromptingFrameworkClient />;
}
