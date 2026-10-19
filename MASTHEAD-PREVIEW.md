# bAIram masthead, local preview

Direct review: `http://localhost:3199/prototype/masthead`

Loading screen into masthead (default): `http://localhost:3199/prototype/masthead`. Straight to the masthead: `?intro=0`.

## Scope

Only the masthead is new: identity/navigation, introduction, original faceted vector bat-wing decoration, two existing content actions and social links. This does not rebuild the cave, create the library or replace the original homepage. No public deployment, PR or push.

The loader was approved by Balram before this section. Its font, sizes, CSS, bat vectors, animation timing and controller remain unchanged. `LoadingOpening` gained only an optional `onComplete` callback so the new preview can dismiss it and reveal the masthead. The standalone `/prototype/loading` retains its previous behavior.

## Design and copy

- Typography: Cinzel Bold for the name (same as the loader). Hanken Grotesk 400/500 for every reading line, chosen 2026-10-17, in five size steps (14, 17, 19-22, 30-46 px and the name). The statement is sentence case at 500 with tight tracking. Both faces self-hosted; Manrope and Oxanium are not loaded on this page.
- Steel/black/gold palette as the approved loader.
- Identity: **Balram R. / AI Marketing Lead, Amazon**, no implied Amazon sponsorship or invented team members.
- Introduction preserved exactly: **I make AI accessible. Learn it simply. Put it to work. Build something that matters.**
- Decorative SVG wing sculpture is authored locally. No concept-image wallpaper, WebGL, video, third-party image, copied film frame or sound.
- No invented adoption numbers, agent status or additional marketing claims.
- Navigation: Home, Learn, Work, About. The broader Library/Search/Cave navigation remains deferred, rather than pretending those new sections exist.

## Working destinations

- Home / logo / skip link: `#masthead`.
- Learn / Learn AI simply: original `/#learn`.
- Work: original `/#projects`.
- About / AI For All: original `/#about`.
- Find your workflow: existing `/guides`.
- Contact me / LinkedIn: existing `https://in.linkedin.com/in/balramr66`.
- GitHub: existing `https://github.com/balram66-aiforall`.

These leave the isolated preview for existing content. They will be rewired only as the corresponding redesigned sections are built.

## Interaction

- Every plain visit plays the loading screen, then hands off into the waking cave (Skip or Escape ends it at once). `?intro=0` or a `#masthead` deep link goes straight to the masthead; `?intro=1` still works.
- Replay opening uses the approved loader in a native dialog. Skip, Escape or natural completion dismisses it. Forward/reverse Tab wrap within the dialog; replay returns focus to its trigger, automatic intro returns focus to the masthead title.
- Mobile navigation uses native `details`/`summary`, so opening it and following links work even with JavaScript disabled. Enhanced behavior adds Escape, outside-click/focus-out dismissal and desktop-resize reset.
- Reduced motion is inherited from the loader: crossfade, no bats. The masthead itself is static, so there is no background animation loop or pointer-tracking cost.
- No-JS and failed-font views retain real HTML introduction and usable links. Replay is hidden without JS.

## Files and validation

New section: `app/prototype/masthead/{page.tsx,masthead.tsx,masthead.css}`.

Browser tests: `tests/masthead-checks.mjs`, with `TEST_URL` and `EVIDENCE_LABEL` overrides for the compiled preview.

Evidence: `../frontier-aimplify/work/builder/2026-10-11-bairam-masthead/RESULT.json`, logs and screenshots alongside it. Loader unit and full standalone-loader browser checks rerun after the optional callback addition.

Known inherited limitation: root theme bootstrap produces a development hydration warning for `data-theme`/`data-theme-phase`; it is recorded, not suppressed. Shared root layout is untouched. Safari, physical devices and manual screen-reader testing remain unverified. Passing technical checks does not establish user visual approval of the masthead.
