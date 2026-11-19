# Tasks

Groups 2-6 work on the horizontal layout. Until group 7 builds the vertical arrangement, `layout: vertical` (and
`auto` below the threshold) renders the horizontal arrangement, and the phone-width overlap tests are absent; group 7
brings them back. Nothing is deployed before group 9. Every visible group ends with a subagent that runs
`npm run capture`, inspects the captures the group names against the review criteria (docs/ecogeo-card.md, from
group 1) and returns a text verdict.

## 1. Browser preflight and screenshot review loop

- [ ] 1.1 Add the browser preflight (design D11): a setup file of the `browser` Vitest project that measures two
  reference strings at 10.3 px Roboto and fails with a message naming font smoothing and remote desktop sessions when
  Chromium reports whole-number widths for both. Keep the detection a pure function with a unit test (whole widths
  fail, fractional pass). Verify: `npm test` passes on a host with font smoothing on; the user switches font
  smoothing off in an RDP session and confirms the browser run stops at the preflight with that message (record the
  result in this task's note).
  Note (2026-11-19, smoothing off, verified by the implementer on this RDP host, SPI_GETFONTSMOOTHING = 0): the
  Chromium run stops at the preflight, every browser test file fails in setup with "Browser preflight failed: Chromium
  measures text with whole-pixel widths ... (measured 55 and 98 px)" and no test runs; WebKit passes (1211 tests).
  The check is Windows-only (Chromium on Windows). Still open: the user's smoothing-on confirmation and a CI Linux
  run showing the preflight passes.
- [x] 1.2 Add the review section to docs/ecogeo-card.md (dev-emulator "Screenshot review loop"): how to run
  `npm run capture`, where the PNGs land, and the criteria (no label on a pipe, part or outline; values inside their
  bodies; no crossing outside the cabinet; band order emitter, source, tank; text legible at the capture's width), and
  a paragraph on the RDP font-smoothing cause and its fix. Verify: `npm run lint:ha` passes and the section names
  every criterion.
- [x] 1.3 Make `npm run capture` print the list of PNGs it wrote with their capture names, so a reviewing subagent can
  pick the ones a group names. Verify: `npm run capture` lists one PNG per capture-list entry under `build/captures/`.

## 2. One drawing level and the new layout names

- [ ] 2.1 Remove the full detail level (design D1, schematic-drawing "Detail level" removed): delete the full-only
  parts and their stub segments and crossings from `componentsFor`/`segmentsFor`, the `detail` field of components and
  segments, the full arrangement, `FULL_PLACES`, `FULL_ZONES`-only code paths, item-number rendering and
  `COMPACT_BELOW_FULL`. Verify: unit tests for schematic-drawing "Refrigerant components" and "Hydraulic components"
  (items drawn, no item numbers, 18-21, 23, 24, 39-41, 52, 53 absent) pass; the `detail-full-*`, `labels-full-*` and
  `threshold-full-*` snapshots are deleted.
- [ ] 2.2 Replace the options (card-config "Card type and options"): remove `detail` and `DETAIL_LEVELS`; `LAYOUTS`
  becomes `auto | horizontal | vertical`; `layout.ts` gets `VERTICAL_BELOW` (start at today's 600) and
  `nextVertical` with the 24 px hysteresis (responsive-layout "Layout choice", "Layout hysteresis"); the copied
  helper's header records the deviation. Until group 7, both layouts render the horizontal (today's simplified)
  arrangement with today's simplified-level labels. Verify: unit tests for `layout: full`, `compact`, `portrait` and
  `detail: full` as configuration errors, and for the hysteresis, pass.
- [ ] 2.3 Remove the compact layout's own content: `COMPACT_PLACES`, `COMPACT_CAPTIONS`, `STACKED_CAPTIONS`,
  `ON_PIPE_COMPACT`, `Tier` and `KEY_LABELS`, the compact branches in labels.ts and the card, and the compact and
  phone-width browser tests (compact.browser, the phone cases of overlaps and overlaps-pipes); keep the stroke-width and
  footer-wrap checks for both layouts. Verify: `npm run check` passes with no reference to `compact` left in `src/`
  (grep).
- [ ] 2.4 Update the editor (card-editor "Editor sections": no detail field, layout offers auto, horizontal,
  vertical) and the emulator (no detail control, `layout` values in the controls and URL, an old `detail=` ignored;
  dev-emulator "Card width and layout controls"), and the capture list (no full-level and compact captures yet; the
  horizontal layout at the threshold, 800 and 1000 px). Verify: editor and emulator URL-state tests pass.
- [ ] 2.5 Update README.md and docs/ecogeo-card.md: options table (`layout` values, no `detail`), the layouts section
  (horizontal now, vertical following), threshold notes. Verify: `npm run check` passes (docs and README tests
  included); a capture subagent confirms the heating and DHW captures at 1000 px look as before minus item numbers
  and safety parts.

## 3. One value set, one footer, no captions

- [ ] 3.1 Reduce `labelPlacesFor` to the 19 values (live-values "Values on the drawing", "Refrigerant values",
  "Hydraulic values"): delete the compressor percentage and power, condensation and evaporation, fan, outside, air unit
  In, ground In, hybrid air unit In, DG1 setpoint and tank setpoint and start delta-T labels; show the superheat and
  expansion valve opening in the horizontal arrangement; give the production and brine values their Out and In
  captions and the tank its DHW caption. Verify: unit tests list exactly the 19 labels for the heating capture of model
  B, air, external tank, variant 4, both demands on.
- [ ] 3.2 Footer (live-values "Footer", "Power items in the footer"): one item list, no on/off or season; power items
  shown in both layouts. Verify: footer unit tests for heating, DHW, active cooling with HTR and passive cooling pass.
- [ ] 3.3 Remove the in-drawing captions (responsive-layout "No in-drawing captions"): the circuit labels DG1, Outer
  loop, DHW and the source and tank captions, with their strings. Verify: a unit test finds none of those texts in the
  rendered drawing.
- [ ] 3.4 Re-place the horizontal labels without any on-pipe exception: run
  `npm run search-places -- --layout=horizontal` (adapt the script, design D7) at the threshold, record the places
  with reasons, and re-measure `VERTICAL_BELOW` with `scripts/measure-layout.mjs` (responsive-layout "Vertical
  threshold"). Verify: the overlap browser tests for the horizontal layout at the threshold, 800 and 1000 px pass in
  Chromium and WebKit, and docs/ecogeo-card.md records the threshold, grid, label box and tolerance.
- [ ] 3.5 Update README.md and docs/ecogeo-card.md (the values shown, the footer). Verify: `npm run check` passes; a
  capture subagent checks the horizontal captures at the threshold and 1000 px against the review criteria.

## 4. Cabinet parts: transducers on their lines, probe pairs

- [ ] 4.1 Move transducer 38 onto the production return riser under probe 34 and transducer 37 onto the brine inlet
  riser under probe 32 (design D6, schematic-drawing "Transducers on their lines"); delete `prod_tap_a`,
  `brine_tap_a`, their crossings and `SIMPLIFIED_EXCEPTIONS`. Verify: unit tests that 38 shares its pipe with 34 and 37
  with 32, with no stub segment, and the topology tests (no outside crossing, hops inside) pass.
- [ ] 4.2 Draw the discharge pair (30 with 36 at x 452) and keep the suction pair (29 with 35), each pair's values as
  one two-row block (schematic-drawing "Refrigerant probe pairs", live-values "Probe pair values"). Verify: unit tests
  for adjacency and the value blocks pass.
- [ ] 4.3 Re-place the affected labels with the search, record the snapshots again. Verify: horizontal overlap browser
  tests pass; a capture subagent checks the heating, active cooling and defrost captures for the new transducer places
  and the pairs.
- [ ] 4.4 Update docs/ecogeo-card.md (the drawing section: transducers and pairs, the simplification of the vessel
  tees). Verify: `npm run check` passes.

## 5. Band arrangement: source and tank above the cabinet

- [ ] 5.1 Implement the band model (design D3): remove the pipe run above the cabinet and the side zones; add the band,
  its slots and the join lane; give the horizontal arrangement its x stretch (design D2), with the map breakpoints
  recorded and reasoned. Verify: unit tests for schematic-drawing "Band arrangement" and "Arrangement keeps the
  topology" (band order, short joins, no outside crossings, every part in its zone) pass for every source and DHW
  storage.
- [ ] 5.2 Redraw the external tank above ports 5/6 with the DHW value and Demand inside its upper part (dhw-storage
  "External tank above connections 5/6", "DHW values inside the tank", "Muted coil visible on the tank"); model C's
  tank 50 shows temperature and Demand. Verify: dhw-storage unit tests pass.
- [ ] 5.3 Redraw the air unit with its coil block towards the cabinet, the fan above, and its Out value inside the
  housing (outer-loop-source "Air unit with its value inside", "Fan follows its speed"); decide the value's strip with
  the screenshot loop (design Open Questions) and record it. Verify: outer-loop-source unit tests pass.
- [ ] 5.4 Draw the ground collector (hatched strip, flat serpentine, Out inside) and the hybrid side by side
  (outer-loop-source "Ground collector", "Hybrid side by side"); colour the collector's halves (temperature-coloring
  "Water segment temperatures"). Verify: unit tests for the collector's passes, ends and halves' colours pass.
- [ ] 5.5 Re-place the labels, re-measure the threshold, record the snapshots again. Verify: horizontal overlap
  browser tests pass in Chromium and WebKit; a capture subagent checks air, ground and hybrid with external, internal,
  unused and no tank, light and dark, at the threshold and 1000 px, plus the panel view at 1280 x 800.
- [ ] 5.6 Update README.md (drawing description, screenshot if it shows the old layout) and docs/ecogeo-card.md (band
  model, bodies, threshold). Verify: `npm run check` passes.

## 6. The DG1 emitter

- [ ] 6.1 Add the `emitter` option (`underfloor` default, `radiator`, `none`; card-config "Card type and options") to
  options, the editor's unit section (card-editor "Editor sections", default not written) and the emulator controls and
  URL (dev-emulator "Configuration switches"). Verify: config, editor and URL-state unit tests pass.
- [ ] 6.2 Draw the emitter in the band's first slot (design D5, heating-emitter "Emitter above connections 1/2",
  "Underfloor loop drawing", "Radiator drawing"), with `dg1_sup`/`dg1_ret` in the DG1 production circuit and the
  gradient colouring (heating-emitter "Emitter follows the DG1 production circuit", "Emitter colours from supply to
  return"; temperature-coloring "Water segment temperatures"); `emitter: none` keeps short stubs. Verify:
  heating-emitter unit tests for each scenario pass (heating, DHW muted, passive cooling active, radiator without
  fill).
- [ ] 6.3 Show the DG1 demand inside the emitter (beside the stubs with `none`), add the tooltips and the tap entity
  (heating-emitter "DG1 demand on the emitter"; component-info "Component name on hover", "Tap the emitter"). Verify:
  component-info and label unit tests pass.
- [ ] 6.4 Re-place the labels, re-measure the threshold, record the snapshots again. Verify: horizontal overlap
  browser tests pass; a capture subagent checks underfloor, radiator and none with every source at the threshold and
  1000 px.
- [ ] 6.5 Update README.md (the `emitter` option) and docs/ecogeo-card.md (the emitter, its colouring and why it is not
  a manual item). Verify: `npm run check` passes.

## 7. The vertical arrangement

- [ ] 7.1 Build the vertical arrangement (design D2): today's simplified x map and a y map that adds rows between the
  parts; `arrangementFor('vertical')` returns it; the band spans its width. Verify: unit tests for schematic-drawing
  "Vertical arrangement" (taller ratio, same parts and pipes) and responsive-layout "Same values in both layouts" pass.
- [ ] 7.2 Set the label fonts per layout (design D8, responsive-layout "Minimum rendered sizes") and place the vertical
  labels with `npm run search-places -- --layout=vertical --width=320`, recording `VERTICAL_PLACES` with reasons. A
  label without a place is a decision point for the user (design Risks), not a pipe exception. Verify: the search
  reports a place for all 19 labels.
- [ ] 7.3 Restore the phone-width browser tests for the vertical layout (responsive-layout "Labels clear of
  everything": 320, 360, 412 px and 1 px under the threshold, every scenario; stroke and font minimums; footer wrap) and
  the auto switch at the threshold with hysteresis. Verify: they pass in Chromium and WebKit.
- [ ] 7.4 Extend the capture list (dev-emulator "Card width and layout controls": every scenario at 360 px auto, every
  scenario vertical at 320 px) and record the snapshots. Verify: a capture subagent checks the vertical captures at 320
  and 360 px, light and dark, every source, DHW storage and emitter, against the review criteria.
- [ ] 7.5 Update README.md (the two layouts, a phone screenshot) and docs/ecogeo-card.md (vertical arrangement,
  fonts, threshold and how it was measured). Verify: `npm run check` passes.

## 8. Visual references on Linux

- [ ] 8.1 Add the `visual` Vitest project (design D12; dev-emulator "Visual references on Linux"): Chromium only,
  reduced motion, `test.skipIf(process.platform !== 'linux')`, renders of both layouts in light and dark covering
  every source, DHW storage and emitter. Verify: on Windows the run reports these tests as skipped.
- [ ] 8.2 Extend `.github/workflows/check.yml`: run the visual project after `npm run check`, and a `workflow_dispatch`
  input that runs it with `--update` and uploads the reference folder as an artifact. Verify: `npm run lint:ha`
  (workflow schema, yamllint) passes.
- [ ] 8.3 Record the references through that workflow input once the user allows a push of the branch, and commit
  them. Verify: the next CI run passes the visual project, and a deliberately moved part in a scratch branch fails it
  naming the render (checked by the review, then discarded).
- [ ] 8.4 Document the visual references in docs/ecogeo-card.md (what they cover, how to record them again). Verify:
  `npm run check` passes.

## 9. Release 1.0.0 again

- [ ] 9.1 Rewrite the 1.0.0 section of CHANGELOG.md for the reworked card (layouts, emitter, values, band); keep
  `package.json` at 1.0.0 (design D13); run `npm run release`. Verify: `npm run release` passes and
  `npm run verify-dist` passes.
- [ ] 9.2 Deploy `dist/ecogeo-card.js` explicitly, bump the dashboard resource's `?v=` (id and value in
  `private/installation.md`) and record the deploy there. Verify: a subagent takes light screenshots of the schematic
  view at 1170 px with zoom 3 (vertical) and at 1280 x 800 (horizontal), returns a verdict against the review criteria,
  and the system log shows no `ecogeo` errors.

## Workflow follow-up

- One fresh Opus review of the whole change before archiving.
- At archive, edit the Purpose sections of the main specs that still describe the old layouts and side zones
  (responsive-layout, schematic-drawing, outer-loop-source, dhw-storage), and name the change in AGENTS.md.
- Replacing the GitHub release and the `v1.0.0` tag (delete and recreate with the new `dist/ecogeo-card.js`) only on
  the user's explicit request.
- The three local commits from 2026-11-19 (`1e14829`, `b55e5bf`, `4f88461`) are pushed only on the user's
  request; task 8.3 needs a push of this change's branch to run the workflow input.
