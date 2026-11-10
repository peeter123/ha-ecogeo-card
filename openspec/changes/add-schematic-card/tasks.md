# Tasks

Each group is implemented by one Sonnet subagent, reviewed by Opus and committed alone (see
`openspec/config.yaml`). From group 1 on, every group ends with `npm run check` green. Every group that changes
something visible also ends with emulator screenshots, which an agent inspects and turns into a written verdict.

## 1. Scaffold and copied helpers

- [ ] 1.1 Create `package.json` (name `ecogeo-card`, scripts dev/build/release/test/typecheck/lint/format/
  format:check/check as in hrv-ventilation, minus the browser and `check:ids` scripts), `vite.config.ts` (lib build
  into `build/`, `ecogeo-card.js`, `codeSplitting: false`, unit test project only), `tsconfig.json`,
  `tsconfig.node.json` and `eslint.config.js` copied from hrv-ventilation, and `scripts/check-release.mjs`
  (copies `build/ecogeo-card.js` to `dist/` after checking that `custom:ecogeo-card` registers). Run
  `npm install`. Verify: `npm run typecheck` exits 0.
- [ ] 1.2 Copy these helpers from the hrv-ventilation repo's `src/lib/` (local path in `private/installation.md`)
  with their unit tests, each with a header
  comment naming its source file:
  - `define`
  - `availability` (add the sentinel: a value at or below -999 counts as unavailable, with a test)
  - `units` (temperature and power only)
  - `hass`
  - `render`
  - `config`
  - `options`
  - `format`
  Also copy `src/strings.ts` (NBSP pattern), `test/nbsp.ts` and the strings test.
  Verify: `npm test` passes.
- [ ] 1.3 Add `src/index.ts` and a skeleton `src/card/ecogeo-card.ts`. The skeleton is a LitElement registered with
  `defineOnce`, plus a `window.customCards` entry. It accepts any config for now and renders an empty `<svg>`
  with the viewBox from design D5. Add a unit test that the element registers and renders an svg.
  Verify: `npm run check` exits 0 and `npm run release` writes `dist/ecogeo-card.js`.
- [ ] 1.4 Add a minimal `dev/` page (`index.html`, `preview.ts`, `mock-hass.ts`, `ha-stubs.ts` after hrv) that
  mounts the card with an empty mock `hass`.
  Verify: `npm run dev` serves the page without console errors (agent check).
- [ ] 1.5 Replace the README stub with the project's purpose, development commands and status, and create
  `docs/ecogeo-card.md` with a skeleton (purpose, sources of truth, sections to fill).
  Verify: both files exist and contain no installation-specific ids.

## 2. Configuration, readings and operating mode

- [ ] 2.1 Determine the B1-B3 variant presets from the manual figures (section 3.1, page 34). The manual's local
  path is in `private/installation.md`. Render the page, for example with
  `uvx --from pymupdf python -c ...`, into `build/` and inspect it.
  Record per variant which of items 14, 10/27/28, 9/17/22/25 and 44/45 are drawn, in
  `docs/ecogeo-card.md` with the citation.
  If a figure is ambiguous, stop and report a decision point.
  Verify: table in the doc, every variant cited.
- [ ] 2.2 Implement `src/config/options.ts`, `roles.ts`, `variants.ts` and `resolve.ts` per design D2/D3 and the
  card-config spec:
  - option validation with the error messages the spec requires
  - the dhw default and mismatch rule
  - feature merge
  - entity resolution (override, then prefix, then none)
  - sample-mode detection
  Unit-test every card-config scenario.
  Verify: `npm test`.
- [ ] 2.3 Implement `src/config/sample.ts` (sample states for every role, from the heating snapshot in
  `private/installation.md` as rounded numbers) and the "Sample values" note in the card.
  Unit-test the empty-config and no-mixing scenarios.
  Verify: `npm test`.
- [ ] 2.4 Implement `src/calc/readings.ts`:
  - role to numeric value, with unit conversion
  - unavailable, unknown, non-numeric and sentinel values become no value
  - text and binary inputs
  Unit-test it.
  Verify: `npm test`.
- [ ] 2.5 Implement `src/calc/mode.ts` and `src/calc/circuits.ts` per design D4. Unit-test every operating-mode
  scenario, including Emergency, unavailable compressor, bridge offline, passive cooling unused, and the
  active-circuits table per mode.
  Verify: `npm test`.
- [ ] 2.6 Wire the resolved config, readings and mode into the card. The card shows the mode label, the alarm
  and offline indications, and the configuration errors through HA's error card (`setConfig` throws).
  Unit-test that an invalid config throws with the option name.
  Verify: `npm run check`.
- [ ] 2.7 Update the README (configuration reference: options, feature states, role paths with firmware suffixes,
  sample mode) and `docs/ecogeo-card.md` (mode derivation table with its inputs, the variant table).
  Verify: every option and role in the code appears in the README (a unit test like hrv's `test/readme.ts`).

## 3. Dev emulator

- [ ] 3.1 Add `dev/scenarios.ts` with the eight scenarios from the dev-emulator spec. Each is a full state map by
  role path, resolved through the demo prefix `demo_ecogeo`. Unit-test that each scenario derives the mode its
  name says.
  Verify: `npm test`.
- [ ] 3.2 Add the emulator controls:
  - selects for model, variant, source, dhw, each feature and the theme
  - sliders for production out/in, brine out/in, DHW temperature, discharge, suction, both pumps, compressor %
    and fan speed
  - all state mirrored in the URL query string per design D9
  Verify: agent check that changing a control re-renders the card and updates the URL, and that loading a URL
  restores the state.
- [ ] 3.3 Add `scripts/capture.mjs` (Playwright as a dev dependency for capture only). It walks a fixed URL list
  covering:
  - every scenario with the default config
  - each source
  - each dhw value
  - model C
  - each feature `false` and `unused`
  - dark theme
  It writes PNGs to `build/captures/`. Add the `capture` npm script.
  Verify: `npm run capture` writes one PNG per URL.
- [ ] 3.4 Document the emulator (start, controls, URL parameters, capture) in the README.
  Verify: the README section exists.

## 4. Cabinet drawing

- [ ] 4.1 Implement `src/diagram/geometry.ts` per design D5 for the cabinet:
  - ports 1-6 on the top edge
  - every component listed in the schematic-drawing spec, with item number and feature
  - every internal segment, with circuit, temperature role, speed role and direction
  - model C variant: no 5/6, internal tank slot
  Add the integrity tests from D5.
  Verify: `npm test`.
- [ ] 4.2 Implement `src/diagram/symbols.ts`: pump, 3-way valve with a position, probe T, transducer P,
  mini-pressure switch, plate exchanger, compressor, expansion vessel, safety valve, drain valve, resistor,
  filter dryer, expansion valve and service outlet. All use theme colours and `currentColor`.
  Verify: unit test that each symbol renders an svg group.
- [ ] 4.3 Implement `src/diagram/cabinet.ts`:
  - the cabinet outline, ports with item numbers, and circuit labels DG1, outer loop and DHW
  - components and segments in the neutral colour (colouring is group 6)
  - valve positions from `circuits.ts`
  - feature visibility: `false` removes the part, `unused` draws it muted
  Unit-test the schematic-drawing scenarios that can be checked in the DOM: port order, no DHW, without
  passive cooling, unused HTR, model C ports, no img or background-image.
  Verify: `npm test`.
- [ ] 4.4 Emulator verification: run `npm run capture`. A subagent inspects the B4 heating capture against the
  manual's B4 figure (topology, item positions, probe placement), plus the captures with features off and
  unused, and dark theme. It returns a verdict.
  Verify: verdict with no topology errors (findings go back to 4.1-4.3).
- [ ] 4.5 Update `docs/ecogeo-card.md` with the drawing section: which items are drawn, the item-to-symbol table,
  feature behaviour, and how the B4 topology was re-laid out.
  Verify: the section exists.

## 5. Outer-loop source and DHW storage

- [ ] 5.1 Implement `src/diagram/source.ts` per the outer-loop-source spec:
  - pipes from ports 3/4 up and to the right zone
  - air unit (housing, coil, fan rotating with speed, stopped at 0 or unknown)
  - ground loop
  - hybrid, with both on one brine loop and their labels
  Unit-test the source scenarios in the DOM.
  Verify: `npm test`.
- [ ] 5.2 Implement `src/diagram/dhw.ts` per the dhw-storage spec:
  - external tank with coil left of the cabinet, pipes from 5/6 over the run above the cabinet with hops where
    they cross other pipes
  - internal tank for model C (50, 51, 54, stubs 47/48/49, 52, 53)
  - none
  Unit-test the dhw scenarios in the DOM.
  Verify: `npm test`.
- [ ] 5.3 Emulator verification: run `npm run capture`. A subagent inspects the air, ground and hybrid captures,
  external, internal and none, and model C. It checks that the pipes leave from the top connections and that the
  crossings are readable.
  Verify: verdict. Clutter at the crossings is a decision point (design risk 5), not an ad-hoc reroute.
- [ ] 5.4 Update `docs/ecogeo-card.md` (source and DHW sections) and the README (source and dhw options with an
  example per value).
  Verify: sections exist.

## 6. Colour, animation and live values

- [ ] 6.1 Implement `src/diagram/colors.ts` per design D7 and the `colors` option validation. Unit-test the
  temperature-coloring scale scenarios: cold brine, out of range, custom stops, invalid stops.
  Verify: `npm test`.
- [ ] 6.2 Implement `src/diagram/pipes.ts`:
  - each segment coloured by its temperature role
  - muted when its circuit is inactive, its feature is `unused` or its probe is missing
  - the dash overlay animated in its direction, at a speed from its speed role
  - refrigerant reversed in active cooling
  - reduced motion respected
  - the tank body coloured by the DHW temperature
  Unit-test the segment, muted, animation and reduced-motion scenarios.
  Verify: `npm test`.
- [ ] 6.3 Implement `src/diagram/labels.ts`:
  - HTML value labels at the positions in the live-values spec
  - formatting through `hass.formatEntityState` when it exists, otherwise one decimal
  - NBSP between a number and its unit
  - a muted dash for missing values
  - tap opens more-info
  Wire `shouldUpdate` to the resolved entity ids.
  Unit-test the live-values scenarios: compressor label, part not drawn, locale, Fahrenheit, sentinel, tap,
  unrelated entity.
  Verify: `npm run check`.
- [ ] 6.4 Emulator verification: run `npm run capture`. A subagent inspects every scenario. It checks colours
  against the scale, that active and muted circuits match the mode, that labels do not overlap at the default
  width, and that the dark theme is legible. It returns a verdict.
  Verify: verdict with no blocking findings.
- [ ] 6.5 Update `docs/ecogeo-card.md` (colour scale, segment-to-probe table, animation) and the README (features
  list, `colors` option, a screenshot from `build/captures/` copied to `docs/images/`).
  Verify: sections and image exist.

## 7. Release and live installation

- [ ] 7.1 Run `npm run release`.
  Verify: `dist/ecogeo-card.js` is committed-ready and registers the card (check-release).
- [ ] 7.2 In the private workspace (path in `private/installation.md`):
  - add `$EcogeoRepo` and the mapping `dist/` to `www/custom/ecogeo-card/` to `scripts/deploy.ps1` (design D10)
  - update `docs/deploy.md`
  - run `deploy.ps1 -Status`, then deploy `dist/ecogeo-card.js` explicitly
  Verify: the deploy output shows UPLOAD with no CONFLICT.
- [ ] 7.3 Add the dashboard resource `/local/custom/ecogeo-card/ecogeo-card.js?v=1` (module) and append the view
  `schematic` (panel, the card config from `private/installation.md`) to the heat pump dashboard with a
  python_transform. Existing views stay untouched. Record the resource id, `?v=` and the view path in
  `private/installation.md`.
  Verify: the dashboard config shows the new view, and the other views' config hash is unchanged apart from the
  appended view.
- [ ] 7.4 Live verification: a subagent takes a dashboard screenshot of the new view, reads the mapped entities'
  states, and checks that the drawn mode, valve 26 position, active circuits and the key labels (production
  out/in, brine out/in, compressor rpm, DHW temperature) match. Check the HA logs for errors mentioning
  `ecogeo-card`.
  Verify: verdict with no mismatches, and no log errors.
- [ ] 7.5 Add a topic-index line for the card to the workspace AGENTS.md (source repo, read-only, the doc to read).
  Update `docs/ecogeo-card.md` with the installation section (generic: how to add the resource and the view).
  Verify: both updated, and no installation ids in tracked files of this repo (grep for the live prefix outside
  `private/`).

## Workflow follow-up

- Before archive: one fresh Opus review of the whole change (constitution), then `/opsx:archive add-schematic-card`.
- Follow-ups named in the proposal: `add-card-editor`, `add-hacs-release`, `add-browser-tests`,
  `add-extra-circuits`. Firmware: expose registers 5024, 5143, 59, 126 in esphome-ecoforest-ecogeo.
- Check DHW mode on the live card during the next DHW run, and confirm the passive cooling `unused` choice with the
  user.
