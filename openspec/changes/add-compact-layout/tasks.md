# Tasks

Each group is implemented by one Sonnet subagent, reviewed by Opus and committed alone (see
`openspec/config.yaml`). Every group ends with `npm run check` green and, for visible changes, emulator captures
inspected by an agent that returns a written verdict. Groups 1-2 do not run `npm run release`.

Before group 1: `refine-schematic-drawing` must be archived (this change's `card-config` delta builds on its
version of "Card type and options"). If that requirement changed during its apply, the orchestrator updates this
delta first.

## 1. Layout option, widths and measurement

- [x] 1.1 Add the `layout` option (`auto` default, `full`, `compact`) with validation; copy hrv's `isCompact`
  into `src/lib/layout.ts` (design D1, header naming the source); observe the card width with a ResizeObserver and
  derive the layout.
  Verify: `npm test` covers card-config "Invalid layout" and "Minimal valid config", and responsive-layout "Auto
  on a phone", "Auto on a wide card" and "Forced full" (with a mocked width), plus unknown width -> full.
- [x] 1.2 Add the emulator width control and layout select (URL `width=`, `layout=`) and phone-width captures for
  every scenario in `dev/captures.ts` (design D6).
  Verify: `npm test` (URL-state tests) and dev-emulator "Phone width".
- [x] 1.3 Add the overlap measurement script (design D6) and run it; set the threshold constant from its result.
  Verify: the script's report lists zero overlaps at the chosen threshold for every scenario, and the threshold is
  in `src/lib/layout.ts`.
- [x] 1.4 Record the threshold and the method in `docs/ecogeo-card.md`; README `layout` option with all three
  values, replacing the "use a full-width or panel view" note with when compact applies.
  Verify: the sections exist and `test/readme.ts` passes.
- [x] 1.5 Add the Vitest browser project (design D7): `@vitest/browser-playwright`, a `browser` project for
  `test/**/*.browser.test.ts` in headless Chromium beside the happy-dom `unit` project, `test:unit` and
  `test:browser` scripts, and the README development notes. Browser tests: "Auto on a phone", "Auto on a wide card"
  and "Forced full" with a real ResizeObserver (the card in a 360 px and a 1000 px wrapper, and a resize between
  them switching the layout), and "No overlaps above the threshold" (every emulator scenario in the full layout at
  the threshold width: no two value labels overlap and no label overlaps a component, the same boxes as the
  measurement script).
  Verify: `npm test` runs both projects and passes; `npm run test:browser` alone passes.

## 2. Compact content and minimum sizes

- [x] 2.1 Give every label and footer item a tier (design D2); render only key items in compact; force the
  simplified detail level in compact (D3). Add the layout hysteresis of D1 (a compact card returns to full only at
  the threshold plus 24 px) and re-render on a stroke-scale change.
  Verify: `npm test` covers responsive-layout "Compact labels", "Compact footer", "Compact ignores full detail" and
  "No flip at the threshold" (unit test of the pure decision, and a browser test widening a compact card).
- [x] 2.2 Drive pipe, outline, overlay dash and hop sizes from `--pipe-width` and `--outline-width` (D4), and the
  compact font floor and wrapping footer (D5).
  Verify: unit tests for the computed custom properties, and browser tests (D7) for "Thin card" (at 360 px every
  pipe's rendered stroke at least 2 px, outlines at least 1.25 px, compact label font at least 10 px, measured in
  Chromium) and "Footer wraps" (at 320 px every footer item inside the card's box).
- [x] 2.3 Emulator verification: `npm run capture`. An agent inspects every scenario at 360 px (compact) and at
  the threshold width (full), light and dark: no overlaps, legible lines and labels, the footer inside the card,
  and in the threshold captures the compressor's speed, percentage and power rows visibly apart.
  Verify: verdict with no blocking findings.
- [x] 2.4 Update `docs/ecogeo-card.md` (compact content, tiers, minimum sizes) and add a phone capture to
  `docs/images/` referenced from the README.
  Verify: the sections and image exist.
- [x] 2.5 Fix the compact overlap found by group 3's release run (added 2026-11-12, user decision): at 320 px in
  Chromium, in the ground source, model C, internal-tank installation, the compact `tank_internal_temperature`
  label overlaps the item 50 symbol group in every scenario with a value (9 of 11), and `brine_in` does in the
  three cooling scenarios, where its value is widest (WebKit passes). Find why the group 2 check did not catch it,
  and move the colliding compact places (D8: labels move, geometry does not; each value stays on its component's
  side of the cabinet wall). Committed on its own, as a group 2 fix.
  Cause (established 2026-11-12): the committed tree passed `npm run check` in Chromium at 2026-11-11 20:51 UTC,
  just before the group 2 commit, and fails deterministically on 2026-11-12 with the same tree, browser builds and
  package versions; no font file changed overnight. Chromium rounds label widths to whole pixels and now measures
  them about 1 px wider than WebKit, and the two places had cleared tank 50 by less than 1 px, so a change in the
  environment that was not identified decided the result. Hence the margin rule in D8.
  Round 1 review decisions (2026-11-12, user): add an air source, model C, internal-tank installation to
  `INSTALLATIONS` and a scenario value with a two-digit negative brine inlet (for example -12.3) so the overlap
  tests cover the widest brine value, and place `brine_in` to clear tank 50 with it; give the compact tank value
  (internal and external tank) a short "DHW" caption, like the Out and In captions, and re-place it with the
  captioned width. The remaining thin compact places are left as they are (their clearance does not depend on text
  width). The place comment in `src/diagram/labels.ts` and the compact places section in `docs/ecogeo-card.md`
  state the margin rule.
  Round 2 decisions (2026-11-12, user): the defrost scenario carries the widest brine value (brine inlet and air
  unit outlet -12.3, outside -14), and an `air-C-internal` installation is added. The captioned internal tank value
  fits nowhere in the cabinet on one line at 320 px, and `brine_in` with -12.3 does not fit near probe 32 on one
  line, so in compact these two labels may render their caption on its own line above the value (a two-line
  label): the internal tank's beside tank 50, `brine_in` near probe 32 again. If `brine_in` still does not fit
  there with the margin, it keeps the low place beside pressure 37.
  Verify: `npm run check` passes, including "No overlaps in the compact layout" in Chromium and WebKit for the new
  installation and scenario value.
- [x] 2.6 Fix the live failure found by group 3's live verification (added 2026-11-12, user decision): Home
  Assistant assigns a `layout` property to every card element (hui-card), and the card's read-only `layout` getter
  from 1.1 makes that assignment throw ("Cannot set property layout of [object HTMLElement] which has only a
  getter", logged by the frontend), so HA cannot build the card: blank on the Android app, "Configuration error" in
  the screenshot engine. Rename the getter so the card defines no `layout` property of its own (D1), and keep
  HA's assigned value harmless. Committed on its own, as a group 1 fix.
  Verify: `npm test` covers assigning `card.layout` (for example "panel", "grid", undefined) before and after
  `setConfig` without an error and without changing the layout the card shows; `npm run check` passes.

## 3. Release and live installation

- [ ] 3.1 Run `npm run release`.
  Verify: check-release reports `custom:ecogeo-card` registered.
- [ ] 3.2 Deploy `dist/ecogeo-card.js` explicitly, bump the dashboard resource `?v=` and record it in
  `private/installation.md`.
  Verify: UPLOAD with no CONFLICT; the resource reads the new `?v=`.
- [ ] 3.3 Live verification: an agent takes dashboard screenshots of the schematic view at a phone viewport
  (about 390 x 844) and at desktop width, reads the key entities' states, and checks compact at the phone width,
  full on the desktop, the key labels against the states, and the HA logs for errors mentioning `ecogeo`.
  Verify: verdict with no mismatches and no log errors.

## Workflow follow-up

- Before archive: one fresh Opus review of the whole change, then `/opsx:archive add-compact-layout`.
- Then `/opsx:apply add-card-editor`.
