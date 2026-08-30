import type { Metadata } from "next";
import { PromptingFrameworkClient } from "./prompting-framework-client";

export const metadata: Metadata = {
  title: "CROFTC | Prompt Framework",
  description:
    "An interactive CROFTC prompt framework for Context, Role, Objective, Format, Tone, and Constraints with local rewriting, metrics, builder tools, and quizzes.",
};

export default function PromptingFrameworkPage() {
  return <PromptingFrameworkClient />;
}
