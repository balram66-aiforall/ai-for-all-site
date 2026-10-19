# Balram → bAIram opening

Isolated local preview: `/prototype/loading`. This is a loading-screen study only, not a homepage integration. No changes to the cave, library, original homepage, shared layout or existing content. No push, PR or deployment.

## Design

- Batman-inspired near-black, steel-white Oxanium Bold with a subtle embossed edge, gold AI (`#e6b94f`) and static armour-like background facets. Licensed alternative, not the official Batman wordmark/font. Manrope retained for controls only.
- Responsive display type fills about 72% of the stage width (336px font cap); stage-relative sizing keeps browser zoom within bounds. Large size retained after the initial 92px cap was rejected.
- Real HTML letters: B → b, a → A, l → uppercase I. The final `ram` and the letter slots stay fixed.
- 22 original vector bats emerge from measured letter positions, unfold/flap, spread out and fade. Three closer bats grow toward the viewer; others recede.
- The name fades as the flock leaves. The normal sequence ends at 3.27 seconds, leaving an empty stage and Replay because the next section is intentionally not built here.
- Replay restarts immediately. Skip or Escape ends the opening immediately. No audio, artificial progress or navigation gate.
- Reduced motion: gentle letter crossfade, no bats, rests on bAIram after 1.4 seconds. No JavaScript: readable static Balram with no unusable controls.

## Implementation

- `app/prototype/loading/page.tsx`: isolated noindex route, self-hosted font preload.
- `opening.tsx`: real HTML, decorative original SVG bats and accessible controls.
- `motion.ts`: deterministic motion math, one requestAnimationFrame loop, cleanup on Skip/unmount/hidden tab, responsive letter-origin measurements.
- `loading.css`: scoped styling and reduced-motion rules. The global AIFA launcher is hidden only while this route is present; its source is unchanged.
- `public/fonts/loading/`: Oxanium Bold and Manrope Medium with their SIL OFL licenses/provenance. No new package dependency and no runtime external requests.

The opening is choreography, not a network loading indicator. Future integration should allow content to be reached immediately, invoke the actual next section on Skip/completion, and not force a wait for branding. That integration is outside this task.

## Verification

From the repository root, using Node 24:

```sh
node tests/loading-unit.mjs
TEST_URL=http://localhost:3199 node tests/loading-checks.mjs
```

The same browser suite supports the compiled production server with `TEST_URL`. Evidence, screenshots, recordings, app-only TypeScript configuration and build runner are under `../frontier-aimplify/work/builder/2026-10-11-bairam-loading/`.

Browser coverage: desktop/mobile/landscape, exact letter sequence, stable positioning, bats originating in the name, flapping/depth, real-time playback, rapid replay, keyboard/focus, reduced motion, no-JavaScript fallback, font failure, 200% zoom, automated WCAG checks and existing-route HTTP smoke checks. Unit tests cover animation-loop cancellation and listener cleanup.

Known inherited limitation: the root layout's theme bootstrap emits a development hydration warning about `data-theme`/`data-theme-phase`. It is recorded separately, not suppressed or attributed to this opening. Shared layout changes are out of scope. Safari and physical-device testing have not been performed. Automated accessibility checks do not substitute for a screen-reader audit or user visual acceptance.
