import type { Metadata } from "next";
import { PlaygroundPrototype } from "./playground";
import "./playground.css";

export const metadata: Metadata = {
  title: "AI For All | Playground Prototype",
  robots: { index: false, follow: false },
};

export default function PrototypePage() {
  return <PlaygroundPrototype />;
}
