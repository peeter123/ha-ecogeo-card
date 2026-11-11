# Tasks

Each group is implemented by one Sonnet subagent, reviewed by Opus and committed alone (see
`openspec/config.yaml`). Every group ends with `npm run check` green and, for visible changes, emulator captures
inspected by an agent that returns a written verdict. Groups 1-2 do not run `npm run release`.

Before group 1: `refine-schematic-drawing` must be archived (this change's `card-config` delta builds on its
version of "Card type and options"). If that requirement changed during its apply, the orchestrator updates this
delta first.

## 1. Layout option, widths and measurement

- [ ] 1.1 Add the `layout` option (`auto` default, `full`, `compact`) with validation; copy hrv's `isCompact`
  into `src/lib/layout.ts` (design D1, header naming the source); observe the card width with a ResizeObserver and
  derive the layout.
  Verify: `npm test` covers card-config "Invalid layout" and "Minimal valid config", and responsive-layout "Auto
  on a phone", "Auto on a wide card" and "Forced full" (with a mocked width), plus unknown width -> full.
- [ ] 1.2 Add the emulator width control and layout select (URL `width=`, `layout=`) and phone-width captures for
  every scenario in `dev/captures.ts` (design D6).
  Verify: `npm test` (URL-state tests) and dev-emulator "Phone width".
- [ ] 1.3 Add the overlap measurement script (design D6) and run it; set the threshold constant from its result.
  Verify: the script's report lists zero overlaps at the chosen threshold for every scenario, and the threshold is
  in `src/lib/layout.ts`.
- [ ] 1.4 Record the threshold and the method in `docs/ecogeo-card.md`; README `layout` option with all three
  values, replacing the "use a full-width or panel view" note with when compact applies.
  Verify: the sections exist and `test/readme.ts` passes.

## 2. Compact content and minimum sizes

- [ ] 2.1 Give every label and footer item a tier (design D2); render only key items in compact; force the
  simplified detail level in compact (D3).
  Verify: `npm test` covers responsive-layout "Compact labels", "Compact footer" and "Compact ignores full detail".
- [ ] 2.2 Drive pipe, outline, overlay dash and hop sizes from `--pipe-width` and `--outline-width` (D4), and the
  compact font floor and wrapping footer (D5).
  Verify: `npm test` covers "Thin card" (computed custom properties at 360 px give at least 2 px pipes and 1.25 px
  outlines; compact label font at least 10 px) and "Footer wraps".
- [ ] 2.3 Emulator verification: `npm run capture`. An agent inspects every scenario at 360 px (compact) and at
  the threshold width (full), light and dark: no overlaps, legible lines and labels, the footer inside the card.
  Verify: verdict with no blocking findings.
- [ ] 2.4 Update `docs/ecogeo-card.md` (compact content, tiers, minimum sizes) and add a phone capture to
  `docs/images/` referenced from the README.
  Verify: the sections and image exist.

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
