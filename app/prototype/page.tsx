import type { Metadata } from "next";
import { GothamPrototype } from "./gotham";
import "./gotham.css";

export const metadata: Metadata = {
  title: "Balram | Built with agents · Opening prototype",
  description: "Balram’s personal portfolio. A local, Gotham-inspired opening prototype featuring a choreographed agent assembly.",
  robots: { index: false, follow: false },
};
export default function PrototypePage() { return <><link rel="preload" href="/fonts/gotham/barlow-condensed-700.woff2" as="font" type="font/woff2" crossOrigin="anonymous"/><link rel="preload" href="/fonts/gotham/manrope-400.woff2" as="font" type="font/woff2" crossOrigin="anonymous"/><GothamPrototype /></>; }
