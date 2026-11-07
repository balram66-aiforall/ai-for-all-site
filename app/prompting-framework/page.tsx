import { PromptingFrameworkClient } from "./prompting-framework-client";
import { pageMetadata } from "../seo";
import "./framework.css";

export const metadata = pageMetadata(
  "CROFTC Prompt Engineering Framework: Interactive Builder for Amazon AI, Kiro & LLMs",
  "Master structured prompt engineering with CROFTC: Context, Role, Objective, Format, Tone, and Constraints. Includes an interactive builder and templates.",
  "/prompting-framework",
);

export default function PromptingFrameworkPage() {
  return <PromptingFrameworkClient />;
}
