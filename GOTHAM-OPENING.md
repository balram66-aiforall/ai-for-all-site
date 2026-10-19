# Balram: Gotham-inspired opening prototype

Local only: http://localhost:3199/prototype
Branch: prototype/gotham-opening
Base: d45135f (previous Playground prototype preserved). Original public site: d55a913.
No push, PR or deployment.

## Scope

Personal identity, one featured project (The Pinky Promise), choreographed agent assembly, role descriptions, compact About and contact. This is the opening slice, not a completed site redesign. All original routes and public content files remain untouched. Old prototype components remain available in git and are not imported by the current prototype.

- Roughly three-second first-session opening: Designer traces the frame, Builder resolves artwork, Verifier closes a review bracket. Agent markers converge toward Meet the agents.
- Identity, role, intro prose and navigation never disappear. Geometry is stable before animation starts. On mobile, the agent handoff sits before the project to remain visible sooner.
- Skip/replay control, Escape, wheel/touch/scroll, navigation, focus entry and viewport changes finish the sequence. Space on the skip control activates only once.
- Session storage limits auto-play. Storage denial does not crash. Replay returns to the top if the header is partly scrolled.
- Reduced motion, no Web Animations API, direct links and late hydration render the static page. No JavaScript still leaves semantic content and normal links. Exceptions cancel effects and fail open.
- Resizing/reflow cancels rather than flying to obsolete coordinates. Two small WOFF2 fonts are preloaded and self-hosted with OFL licences.
- No AI requests, real agents, live status, backend work, WebGL, copied Batman assets, sound or video dependencies.
- Existing project description, hero sentences and About copy are unchanged. Agent-role descriptions and interface labels are proposed prototype copy. Role labels identify illustrative responsibilities, not verified contributions to Pinky Promise.

## Files

- app/prototype/page.tsx: noindex route, local font preloads
- app/prototype/gotham.tsx: semantic portfolio and SVG agent glyphs
- app/prototype/gotham.css: scoped graphite/silver/signal palette and responsive layouts
- app/prototype/opening.ts: disposable Web Animations API controller
- public/fonts/gotham/: fonts plus licences
- tests/gotham-checks.mjs: core browser suite
- tests/gotham-resilience.mjs: autoplay, delayed fonts and hydration checks
- tests/gotham-inspect.mjs: screenshot and accessibility captures
- tests/gotham-record.mjs: actual browser motion recording

## Verification (2026-10-11)

- 58/58 core browser checks; 7/7 supplemental resilience checks.
- Axe WCAG A/AA violations: 0 at 320, 390, 768, 1024, 1440 pixels.
- No document overflow or out-of-viewport text/link boxes at those widths; 200% CSS zoom passes.
- Fresh desktop and mobile auto-play duration verified at >=2.9 seconds, with completion <=3.3 seconds in the main duration test.
- JS-disabled, missing animation API, animation exception, blocked storage, slow/missing image, delayed fonts, late hydration, reduced motion and direct-link fallbacks verified.
- Chromium tests only. Firefox and WebKit runtimes are not installed; Safari/device testing remains before production release. Mobile emulation is not physical-device verification.
- App-scoped TypeScript passes. Production Vinext/Cloudflare build passes.
- ESLint: zero errors; one existing SiteTopbar warning.
- Known existing root theme-bootstrap development hydration warning reproduced on the unchanged homepage. It is not suppressed or fixed in this prototype.
- Independent read-only reviewer examined lifecycle/accessibility; concrete findings addressed and verified by primary browser tests/screenshots.

Evidence: ../frontier-aimplify/work/builder/2026-10-11-gotham-opening/

## Run checks

Use real Node 24.13.1 on this machine, not the shell's bun-backed node alias:

    "$HOME/.local/share/mise/installs/node/24.13.1/bin/node" tests/gotham-checks.mjs
    "$HOME/.local/share/mise/installs/node/24.13.1/bin/node" tests/gotham-resilience.mjs

The production build does not deploy. Publishing requires separate explicit approval.
