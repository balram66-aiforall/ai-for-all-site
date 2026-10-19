# bAIram workstation, local prototype

## Current scope, 2026-10-11

Balram selected the Artifactory `precision-deck.jpg` workstation and said “i like it, lets build it”. The authorized implementation is local at `/prototype/cave` on `prototype/batcave`. No push, PR, merge or deployment. The original live site and Vinext/Cloudflare configuration remain unchanged.

## Experience

- The approved Artifactory scene is the visual foundation: one seated human stand-in for Balram, a wraparound workstation and non-humanoid machinery. No claim of photographic likeness.
- A 2.8-second bat-flight arrival and gentle camera settle. Skip, Escape, wheel/touch navigation, reduced-motion and session memory prevent it becoming a content gate.
- A lightweight Canvas 2D layered-artwork renderer, not a navigable 3D reconstruction or generated video. Local screen traces and layered machinery are choreographed, not real agents or live telemetry. No sound.
- A separate bAIram suit view uses the earlier Artifactory graphite/gold costume concept. It remains a concept identity, not a finalized custom helmet/chest mark.
- The original projects, artwork, descriptions, destinations, introduction and four LinkedIn articles remain in semantic HTML below the environment. Screens no longer display portfolio cards. Existing learning resources are linked.
- New interface labels are prototype proposals; existing public prose is not rewritten.

## Resilience

The Artifactory still is server-rendered independently of the optional scene code. No JavaScript retains portfolio links and an additional suit image. Canvas/code failure keeps matching still artwork. Image failures leave a usable text/navigation page. The animated layer has an eight-second artwork deadline and degrades once rather than repeatedly fetching on a poor connection; reload can retry. A late HTML still may appear independently.

Motion stops when paused, reduced motion is requested, the page is hidden, the scene is offscreen or the suit bay is selected. Teardown cancels frames, image timers and listeners. Display resolution is capped. Keyboard focus returns to the workstation control after the suit's Back button; a polite status announces room/fallback changes.

## Artwork

Artifactory now works; initial authentication failures belong to the earlier prototype only. Sources, edit prompts, full-resolution originals and hashes are in:

- `../frontier-aimplify/work/designer/2026-10-11-autonomous-workstation/`
- `../frontier-aimplify/work/designer/2026-10-11-bairam-concepts/`
- `../frontier-aimplify/work/builder/2026-10-11-bairam-workstation/assets-prep/`

New assets are scoped to `public/assets/cave/workstation/`. No artifact upload/sharing. Old procedural cave textures and stills are retained but no longer used on this route.

## Verification

Current checks:

- `tests/workstation-unit.mjs`: deterministic renderer lifecycle, asynchronous failures, reduced motion, cleanup and resolution bounds.
- `tests/workstation-checks.mjs`: Chromium browser, keyboard, content equality, accessibility audits at five widths, no-JS, no-Canvas, code/image failures, zoom and old-route smoke checks.
- `tests/workstation-production.mjs`: compiled arrival, controls, suit, failed chunk fallback and root-route isolation.
- `tests/workstation-capture.mjs`: desktop and mobile visual review captures.

Current evidence: `../frontier-aimplify/work/builder/2026-10-11-bairam-workstation/RESULT.json`. Consult actual executed results there. Prior `cave-*.mjs` checks target the superseded WebGL/project-station prototype and their old pass counts do not certify this build.

The original cave is preserved in the current work directory's `source/previous-cave/`. Existing root-theme hydration and SiteTopbar lint warnings predate this work. App-only TypeScript excludes known baseline worker/config type issues. Physical-device performance and Safari/Firefox validation are not established. No publication is authorized.
