# Tasks

Groups 2-7 work on the horizontal layout; group 7 re-authors the cabinet with value lanes (design D1, decided by
the user 2026-11-20 after the first group 7 attempt at the vertical arrangement stopped at a decision point). Until
group 8 builds the vertical arrangement, `layout: vertical` (and `auto` below the threshold) renders the horizontal
arrangement, and the phone-width overlap tests are absent; group 8 brings them back. Nothing is deployed before group
10. Every visible group ends with a subagent that runs
`npm run capture`, inspects the captures the group names against the review criteria (docs/ecogeo-card.md, from
group 1) and returns a text verdict.

Chromium on the development host (decided 2026-11-19, group 3 review): while the host runs an RDP session with font
smoothing off, the Chromium browser run stops at the preflight. A task whose browser verification ran in WebKit only
is checked with a note saying so; the Chromium runs (overlap tests, the place search and the threshold measurement)
are repeated once with font smoothing on before the release group (see Workflow follow-up), and any difference is
fixed there. Places and thresholds measured in the meantime use WebKit and the search's 2 px margin.

## 1. Browser preflight and screenshot review loop

- [x] 1.1 Add the browser preflight (design D11): a setup file of the `browser` Vitest project that measures two
  reference strings at 10.3 px Roboto and fails with a message naming font smoothing and remote desktop sessions when
  Chromium reports whole-number widths for both. Keep the detection a pure function with a unit test (whole widths
  fail, fractional pass). Verify: `npm test` passes on a host with font smoothing on; the user switches font
  smoothing off in an RDP session and confirms the browser run stops at the preflight with that message (record the
  result in this task's note).
  Note (2026-11-19, smoothing off, verified by the implementer on this RDP host, SPI_GETFONTSMOOTHING = 0): the
  Chromium run stops at the preflight, every browser test file fails in setup with "Browser preflight failed: Chromium
  measures text with whole-pixel widths ... (measured 55 and 98 px)" and no test runs; WebKit passes (1211 tests).
  The check is Windows-only (Chromium on Windows). Note (2026-11-19, smoothing on, SPI_GETFONTSMOOTHING = 1 after the
  user changed the session, observed during group 4): the preflight passes and the Chromium browser run passes its
  539 tests. The CI Linux confirmation moves to the Workflow follow-up (it needs a push).
- [x] 1.2 Add the review section to docs/ecogeo-card.md (dev-emulator "Screenshot review loop"): how to run
  `npm run capture`, where the PNGs land, and the criteria (no label on a pipe, part or outline; values inside their
  bodies; no crossing outside the cabinet; band order emitter, source, tank; text legible at the capture's width), and
  a paragraph on the RDP font-smoothing cause and its fix. Verify: `npm run lint:ha` passes and the section names
  every criterion.
- [x] 1.3 Make `npm run capture` print the list of PNGs it wrote with their capture names, so a reviewing subagent can
  pick the ones a group names. Verify: `npm run capture` lists one PNG per capture-list entry under `build/captures/`.

## 2. One drawing level and the new layout names

- [x] 2.1 Remove the full detail level (design D1, schematic-drawing "Detail level" removed): delete the full-only
  parts and their stub segments and crossings from `componentsFor`/`segmentsFor`, the `detail` field of components and
  segments, the full arrangement, `FULL_PLACES`, `FULL_ZONES`-only code paths, item-number rendering and
  `COMPACT_BELOW_FULL`. Verify: unit tests for schematic-drawing "Refrigerant components" and "Hydraulic components"
  (items drawn, no item numbers, 18-21, 23, 24, 39-41, 52, 53 absent) pass; the `detail-full-*`, `labels-full-*` and
  `threshold-full-*` snapshots are deleted.
  Note (2026-11-19): the frame's zones and lists stay exported as `FRAME` (geometry.ts) only so that the map tests in
  simplified.test.ts can compare the arrangement with it; no layout draws it. The unused symbol kinds (vessel, safety
  valve, pressure switch, service outlet), the `tag` field of components and the `captions` draw option went with the
  item numbers and the compact layout.
- [x] 2.2 Replace the options (card-config "Card type and options"): remove `detail` and `DETAIL_LEVELS`; `LAYOUTS`
  becomes `auto | horizontal | vertical`; `layout.ts` gets `VERTICAL_BELOW` (start at today's 600) and
  `nextVertical` with the 24 px hysteresis (responsive-layout "Layout choice", "Layout hysteresis"); the copied
  helper's header records the deviation. Until group 7, both layouts render the horizontal (today's simplified)
  arrangement with today's simplified-level labels. Verify: unit tests for `layout: full`, `compact`, `portrait` and
  `detail: full` as configuration errors, and for the hysteresis, pass.
- [x] 2.3 Remove the compact layout's own content: `COMPACT_PLACES`, `COMPACT_CAPTIONS`, `STACKED_CAPTIONS`,
  `ON_PIPE_COMPACT`, `Tier` and `KEY_LABELS`, the compact branches in labels.ts and the card, and the compact and
  phone-width browser tests (compact.browser, the phone cases of overlaps and overlaps-pipes); keep the stroke-width and
  footer-wrap checks for both layouts. Verify: `npm run check` passes with no reference to `compact` left in `src/`
  (grep). Note (2026-11-19): `grep -ri compact src/` finds nothing. Removing `Tier` and `KEY_LABELS` left the horizontal
  label set as it was, except that the two labels the simplified level hid (superheat, expansion valve opening) are not
  in the table until task 3.1 re-adds them. `sidePairs` and `pairOrderPairs` of dev/overlaps.ts went with the compact
  browser test; `LABEL_SIDES`, `OUT_IN_PAIRS` and `inOrder` stay for scripts/search-places.mjs until group 3 reworks it.
  The stroke, font-floor, footer-wrap and no-flip checks live on in `test/card/sizes.browser.test.ts` for both layouts
  (labels at the 8 px floor; the 10 px assertion returns in group 7).
- [x] 2.4 Update the editor (card-editor "Editor sections": no detail field, layout offers auto, horizontal,
  vertical) and the emulator (no detail control, `layout` values in the controls and URL, an old `detail=` ignored;
  dev-emulator "Card width and layout controls"), and the capture list (no full-level and compact captures yet; the
  horizontal layout at the threshold, 800 and 1000 px). Verify: editor and emulator URL-state tests pass.
- [x] 2.5 Update README.md and docs/ecogeo-card.md: options table (`layout` values, no `detail`), the layouts section
  (horizontal now, vertical following), threshold notes. Verify: `npm run check` passes (docs and README tests
  included); a capture subagent confirms the heating and DHW captures at 1000 px look as before minus item numbers
  and safety parts.
  Note (2026-11-19, implementer): the browser run on this RDP host stops at the preflight in Chromium by design, so the
  browser project was verified in WebKit only (542 tests pass); `npm run capture` writes 111 PNGs and the heating and
  DHW captures at 1000 px look as before minus the removed parts; the capture review by a separate subagent is the
  orchestrator's step.

## 3. One value set, one footer, no captions

- [x] 3.1 Reduce `labelPlacesFor` to the 19 values (live-values "Values on the drawing", "Refrigerant values",
  "Hydraulic values"): delete the compressor percentage and power, condensation and evaporation, fan, outside, air unit
  In, ground In, hybrid air unit In, DG1 setpoint and tank setpoint and start delta-T labels; show the superheat and
  expansion valve opening in the horizontal arrangement; give the production and brine values their Out and In
  captions and the tank its DHW caption. Verify: unit tests list exactly the 19 labels for the heating capture of model
  B, air, external tank, variant 4, both demands on. Note (group 2 review): the display-precision and °F tests in
  `test/diagram/labels.test.ts` were moved to `tank_external_start_delta` when the superheat label went; move them
  back to the superheat label when this task deletes the start delta-T label.
  Note (2026-11-19, implementer): done; the 19 labels are listed by a unit test (heating capture, model B, air, external
  tank, variant 4, both demands on), and the precision and degrees F tests moved back to `superheat`. The roles of the
  deleted labels, their more-info and their editor suggestions are untouched.
- [x] 3.2 Footer (live-values "Footer", "Power items in the footer"): one item list, no on/off or season; power items
  shown in both layouts. Verify: footer unit tests for heating, DHW, active cooling with HTR and passive cooling pass.
- [x] 3.3 Remove the in-drawing captions (responsive-layout "No in-drawing captions"): the circuit labels DG1, Outer
  loop, DHW and the source and tank captions, with their strings. Verify: a unit test finds none of those texts in the
  rendered drawing.
- [x] 3.4 Re-place the horizontal labels without any on-pipe exception: run
  `npm run search-places -- --layout=horizontal` (adapt the script, design D7) at the threshold, record the places
  with reasons, and re-measure `VERTICAL_BELOW` with `scripts/measure-layout.mjs` (responsive-layout "Vertical
  threshold"). Verify: the overlap browser tests for the horizontal layout at the threshold, 800 and 1000 px pass in
  Chromium and WebKit, and docs/ecogeo-card.md records the threshold, grid, label box and tolerance.
  Note (2026-11-19, implementer): verified in WebKit only, per the Chromium rule in the intro; the Chromium runs
  (overlap tests, place search, threshold measurement) are in the Workflow follow-up. `scripts/search-places.mjs` and
  `scripts/measure-layout.mjs` take `--browser=chromium|webkit`. The places were searched with
  `--layout=horizontal --browser=webkit --width=680` from each label's default place (the search prints why a default
  fails). `VERTICAL_BELOW` is 680: the narrowest grid width where the search places every label with its 2 px margin
  (at 660 px the external tank's temperature and demand meet and production Out moves to x 124); `measure-layout`
  without the margin is clean from 640 px. The overlap browser tests at 680, 800 and 1000 px pass in WebKit. Decision
  points for the user: production In sits 105 units from probe 34 (inside the cabinet under the DG1 stubs), and
  production Out sits next to the source's pipes.
- [x] 3.5 Update README.md and docs/ecogeo-card.md (the values shown, the footer). Verify: `npm run check` passes; a
  capture subagent checks the horizontal captures at the threshold and 1000 px against the review criteria.

## 4. Cabinet parts: transducers on their lines, probe pairs

- [x] 4.1 Move transducer 38 onto the production return riser under probe 34 and transducer 37 onto the brine inlet
  riser under probe 32 (design D6, schematic-drawing "Transducers on their lines"); delete `prod_tap_a`,
  `brine_tap_a`, their crossings and `SIMPLIFIED_EXCEPTIONS`. Verify: unit tests that 38 shares its pipe with 34 and 37
  with 32, with no stub segment, and the topology tests (no outside crossing, hops inside) pass.
  Note (2026-11-19, implementer): transducer 38 is at frame (296, 256) rotation 270 on `trunk` (riser x 312, under
  probe 34 at y 228) and 37 at (674, 256) rotation 270 on `ln4_a` (riser x 690, under probe 32); both stems end on the
  pipe, no stub. `prod_tap_a`, `brine_tap_a`, the crossing `prod_10_out x prod_tap_a`, `SIMPLIFIED_EXCEPTIONS`,
  `TRANSDUCER_38_Y` and the production-pressure special case are deleted; the arrangement is the frame under the maps
  with no exception (9 crossings). Unit tests: shared pipe with no part between, no stub segment, the map tests
  without exceptions.
- [x] 4.2 Draw the discharge pair (30 with 36 at x 452) and keep the suction pair (29 with 35), each pair's values as
  one two-row block (schematic-drawing "Refrigerant probe pairs", live-values "Probe pair values"). Verify: unit tests
  for adjacency and the value blocks pass.
  Note (2026-11-19, implementer): transducer 36 is at frame x 452 (arrangement x 446), 22 units from probe 30, like 35
  from 29. Each pair's values are a two-row block (temperature over pressure, 16 units apart, same x and alignment):
  discharge starts at frame x 450 (arrangement 444) under the line, suction ends at frame x 572 (arrangement 576),
  rows at y 260 and 276. They are the labels' default places (no `HORIZONTAL_PLACES` entry): the search, which places
  each label alone, finds all four free ("Default place meets: nothing"). Unit tests: adjacency, no part between,
  value blocks.
- [x] 4.3 Fill the compressor's two triangles (the parts of circle 11 outside its converging lines) solid in the
  outline colour, the part between the lines unfilled (schematic-drawing "Refrigerant components after the manual
  figure", scenarios "Compressor symbol" and "Compressor fill in the dark theme"; asked by the user 2026-11-19).
  Verify: a unit test finds two filled shapes in the outline colour inside the compressor symbol and the lines
  unchanged; light and dark captures show them.
  Note (2026-11-19, implementer): `symbols.ts` draws two closed paths `.compressor-fill` with `fill="currentColor"`
  (the outline colour: the symbol group's `color` is the primary text colour, the disabled colour while muted, so the
  fill follows the outline in light and dark and when muted): each runs along its line, on to the circle on the same
  slope at (-13.73, -/+2.75) and back along the arc to the line's start; the lines are unchanged. Unit test in
  cabinet.test.ts. The light and dark captures show the two parts solid and the wedge between the lines empty.
- [x] 4.4 Re-place the affected labels with the search, record the snapshots again. Verify: horizontal overlap browser
  tests pass; a capture subagent checks the heating, active cooling and defrost captures, light and dark, for the new
  transducer places, the pairs and the filled compressor.
  Note (2026-11-19, implementer): places from `npm run search-places -- --layout=horizontal --browser=webkit` at 680
  px: pressure 38 (284, 296, end; the default right of the riser meets valve 22 in 140 cases), pressure 37 (700, 256,
  end; the default meets the brine outlet label in 140), brine Out (644, 272, start; meets the pressure label in 140
  and transducer 37 in 98), brine pump (724, 320, end; meets pump 16 in 168), production In re-recorded (meets
  transducer 38 in 168 cases too); the four pair labels keep their default blocks. `measure-layout` (WebKit) is clean
  from 640 px as before; the search at 660 px still moves production Out to x 124 (and pressure 38 to x 240, y 212),
  so `VERTICAL_BELOW` stays 680. Snapshots re-recorded (111, diff checked on scenario-heating). The overlap browser
  tests pass in WebKit (539 tests) and, as the preflight passes on this host now, in Chromium (539); the Chromium
  search was not run. Open point for the user: label 38 ("1.2 bar") sits left of the riser under the transducer, next
  to thermostat 45, and can read as the thermostat's value.
  Round 2 (2026-11-19): the search's distance now counts from the centre of the default box, so it agrees with the
  recorded pair blocks; the places moved to pressure 38 (352, 232, start), pressure 37 (656, 256, start) and brine pump
  (668, 300, start); the production pressure is now right of the riser at the height of probe 34
  (the open point above is superseded; the place beside 38 is deferred),
  and the 660 px search still moves production Out only.
- [x] 4.5 Update docs/ecogeo-card.md (the drawing section: transducers and pairs, the simplification of the vessel
  tees, the compressor symbol's fill). Verify: `npm run check` passes.
  Note (2026-11-19, implementer): docs/ecogeo-card.md updated (transducers on their risers, the pairs, the compressor
  fill, no exceptions to the maps, 9 crossings, the places and values tables); `npm run check` passes (6311 tests,
  Chromium and WebKit).
## 5. Band arrangement: source and tank above the cabinet

- [x] 5.1 Implement the band model (design D3): remove the pipe run above the cabinet and the side zones; add the band,
  its slots and the join lane; give the horizontal arrangement its x stretch (design D2), with the map breakpoints
  recorded and reasoned. Verify: unit tests for schematic-drawing "Band arrangement" and "Arrangement keeps the
  topology" (band order, short joins, no outside crossings, every part in its zone) pass for every source and DHW
  storage.
  Note (2026-11-19, implementer): the band is 170 units high (top 6) over a join lane of 56; `planBand` places the three
  slots (centred over their ports, 24 units apart, least movement, an empty slot gives its space away; the emitter's
  width is 0 until it is drawn) and the arrangement is built per band key (source, tank drawn, emitter drawn), so
  `arrangementFor(layout, key)` and `arrangementOf(context)` replace the single arrangement. The x map stretches the
  cabinet to 980 units (viewBox 1000 x 647), breakpoints and reasons in `HORIZONTAL_MAP_X` (geometry.ts); the y map is a
  shift of 102. Jogs at 22, 28, 34 and 46 units over the top edge. Tests: `test/diagram/band.test.ts` and the updated
  simplified and geometry tests, for every source and DHW storage.
- [x] 5.2 Redraw the external tank above ports 5/6 with the DHW value and Demand inside its upper part (dhw-storage
  "External tank above connections 5/6", "DHW values inside the tank", "Muted coil visible on the tank"); model C's
  tank 50 shows temperature and Demand. Verify: dhw-storage unit tests pass.
  Note (2026-11-19, implementer): tank 160 x 170 on the band's bottom edge, mirrored helix (port 5 to the upper left
  end, port 6 to the lower right, no crossing), DHW temperature and Demand as bare labels at 38 and 56 units under its
  top, clear of the rim (registered as an obstacle) and the coil. Model C's tank 50 shows its two values in one row
  above coil 51.
- [x] 5.3 Redraw the air unit with its coil block towards the cabinet, the fan above, and its Out value
  inside the housing (outer-loop-source "Air unit with its value inside", "Fan follows its speed"); decide the value's
  strip with the screenshot loop (design Open Questions) and record it. The housing gets a tooltip (component-info
  "Component name on hover"; the "Air unit" caption is gone since group 3). Verify: outer-loop-source unit tests pass.
  Note (2026-11-19, implementer): decision: the Out value sits in a strip between the coil block and the fan, not above
  the fan (it is next to the coil's outlet and keeps the housing's top outline clear); recorded in docs/ecogeo-card.md
  (The band). Housing 130 x 168, coil block at the bottom with four vertical passes entering and leaving on its bottom
  face, six fins; tooltips "Air unit" and "Air unit fan".
- [x] 5.4 Draw the ground collector (hatched strip, flat serpentine, Out inside) and the hybrid side by side
  (outer-loop-source "Ground collector", "Hybrid side by side"); colour the collector's halves (temperature-coloring
  "Water segment temperatures"). The collector gets a tooltip (component-info "Component name on hover"). Verify: unit
  tests for the collector's passes, ends and halves' colours pass.
  Note (2026-11-19, implementer): collector 170 x 112: hatching 14 units, Out strip 24, four horizontal passes 14 apart,
  feed riser at the left and exit at the left end of the bottom pass; halves coloured as before (down: brine outlet, up:
  brine inlet; hybrid: air unit outlet then brine inlet); tooltip "Ground collector". Hybrid: air unit left, collector
  right, link in the lane.
- [x] 5.5 Re-place the labels, re-measure the threshold, record the snapshots again. Production In sits beside probe
  34 and production Out beside probe 33, not next to the source (live-values "Hydraulic values"; group 3 accepted
  both further away until the band frees the space); the production pressure sits beside transducer 38, with no other
  part (thermostat 45, the HTR column, exchanger 9) between them, and brine Out beside probe 31 (group 4 accepted both
  further away until the x stretch of design D2 widens the span between the riser and valve 22). Verify: horizontal
  overlap browser tests pass in Chromium and WebKit; a unit test bounds the distance of production In, Out and
  pressure from probes 34, 33 and transducer 38, and of brine Out from probe 31, so the search cannot drift a label
  across another part; a capture subagent checks air, ground and hybrid with external, internal, unused and no tank,
  light and dark, at the threshold and 1000 px, plus the panel view at 1280 x 800.
  Note (2026-11-19, implementer, Chromium with font smoothing on): an extra x stretch of 24 units between transducer 36
  and filter dryer 13 gives the discharge block room; `search-places` now also tries a free default place as a
  candidate, exempts a block's two rows from the margin between them and treats the superheat over the valve opening as
  a block. `VERTICAL_BELOW` is 560: the narrowest grid width where the search keeps the blocks at their pairs (it finds
  places down to 500 px, but from 540 the blocks move about 50 units off their pairs; at 480 the bodies' values find no
  place); `measure-layout` with the recorded places is clean from 520 px. Six places recorded (production Out, In,
  pressure 38, brine In, pressure 37, DG1 demand). Production In, Out, the pressure and brine Out are 6 to 13 units from
  their parts, bounded by a unit test. Browser project: 1514 tests pass in Chromium and WebKit. The capture check is in
  the group's report.
  Note (2026-11-19, group 5 review): the 560 px threshold is accepted and design D7 amended (a place must also be one
  its own spec allows); the review opened all 49 band and panel captures and found them clean.
- [x] 5.6 Update README.md (drawing description, screenshot if it shows the old layout) and
  docs/ecogeo-card.md (band model, bodies, threshold). Verify: `npm run check` passes.
  Note (2026-11-19, implementer): README.md, docs/ecogeo-card.md (arrangement, band, bodies, x map, threshold, places)
  and docs/images/heating.png regenerated; `docs/images/phone-heating.png` still shows the old compact layout (not
  referenced; the vertical layout is not built yet). `npm run check` passes.

## 6. The DG1 emitter

- [x] 6.1 Add the `emitter` option (`underfloor` default, `radiator`, `none`; card-config "Card type and options") to
  options, the editor's unit section (card-editor "Editor sections", default not written) and the emulator controls and
  URL (dev-emulator "Configuration switches"). Verify: config, editor and URL-state unit tests pass. Note (2026-11-19,
  implementer): `EMITTERS` and `EMITTER_OPTION` in `src/config/options.ts`, resolved as `resolved.emitter` (from
  `installationOf`); the editor's unit section has the field after the DHW storage (choices from
  `EDITOR.choices.emitter`, the default `underfloor` never written, a test for it); the emulator has an `emitter` select
  and `emitter=` in the URL, written to the card config explicitly like `fill` and `layout`. An invalid value is a
  configuration error naming `emitter` and `underfloor, radiator, none`.
- [x] 6.2 Draw the emitter in the band's first slot (design D5, heating-emitter "Emitter above connections 1/2",
  "Underfloor loop drawing", "Radiator drawing"), with `dg1_sup`/`dg1_ret` in the DG1 production circuit and the
  gradient colouring (heating-emitter "Emitter follows the DG1 production circuit", "Emitter colours from supply to
  return"; temperature-coloring "Water segment temperatures"); `emitter: none` keeps short stubs. Verify:
  heating-emitter unit tests for each scenario pass (heating, DHW muted, passive cooling active, radiator without fill).
  Note (2026-11-19, implementer): new `src/diagram/emitter.ts` (`renderEmitter`, `emitterStyles`); `BandKey.emitter` is
  now the kind (`underfloor`, `radiator`, `none`) and `BAND.emitter` is 200 x 124 for both kinds (`BAND.emitterWidth` is
  gone). Body: both kinds stand on the band's bottom face; pipes rise 34 units inside each side (frame ports 1/2 are 132
  apart, the body is centred over them: x 101 to 301). Underfloor: a divider 43 under the top, five passes 14 apart from
  50 under the top, one path with the vertical gradient from the first to the last pass (the loop's own, independent of
  `exchanger_fill`); the loop is the body's path, not a segment, so the integrity test counts the emitter's inlet and
  outlet as ports. Radiator: six columns 10 wide, 8 apart, 72 tall, supply meeting the first column 54 under the top,
  return leaving the last 106 under it, the body filled with the same gradient (opacity 0.5) only with `exchanger_fill:
  gradient`. `dg1_sup`/`dg1_ret` are in `production_dg1` with the production pump as speed role, so `p1_stub`/`p2_stub`
  moved from the cabinet's list into `bandSegments` and exist only with `none` (12 units). Tests:
  `test/diagram/emitter.test.ts` (heating, DHW muted, passive cooling, underfloor and radiator colours, radiator without
  fill, a missing probe), band and simplified tests over every emitter. The emitter cites no manual item (it is outside
  the unit), said in the comments of emitter.ts and geometry.ts.
- [x] 6.3 Show the DG1 demand inside the emitter (beside the stubs with `none`), add the tooltips and the tap entity
  (heating-emitter "DG1 demand on the emitter"; component-info "Component name on hover", "Tap the emitter"). Verify:
  component-info and label unit tests pass. Note (2026-11-19, implementer): two label ids for one role, like the
  source's per-kind ids: `emitter_demand` (a body label placed from the zones in the strip 24 high, 14 under the body's
  top; BODY_LABELS `emitter:body`) and `dg1_demand` (beside the stubs, a recorded place, only with `none`), so the
  search needs no contradictory feasibility. The 19-label test lists `emitter_demand`. Tooltips "Underfloor heating" and
  "Radiator" (`EMITTER_NAMES`), no item number; `EMITTER_ROLE` is `heating.demand`, and the body is neither a button nor
  a tab stop without that entity or in sample mode.
- [x] 6.4 Re-place the labels, re-measure the threshold, record the snapshots again. Verify: horizontal overlap browser
  tests pass; a capture subagent checks underfloor, radiator and none with every source at the threshold and 1000 px.
  Note (2026-11-19, implementer, Chromium with font smoothing on and WebKit): `INSTALLATIONS` got three emitter cases
  (ground with a radiator, air without an emitter, hybrid on model C without an emitter: 13 installations, 312 search
  cases). Review fix: WebKit's search at 560 px reported the external tank's temperature meeting its demand within the
  margin in 10 of 312 cases (its boxes are 15 units tall against 14), so the tank's rows are now 22 apart (the demand 60
  under the top instead of 56); both engines then report no margin hit for any body label (the emitter's strip and tank
  50 included). The search at 560 px finds the same six places in Chromium and WebKit (no new entry: `emitter_demand` is
  placed from the zones and finds 606 places in its strip; `dg1_demand` keeps 336, 220, end, 12 cases meet the cabinet
  edge); at 540 px both engines move the discharge and suction blocks 50 and 53 units off their pairs, so
  `VERTICAL_BELOW` stays 560 (layout.ts and the size estimates of simplified.test.ts are unchanged; the widest boxes are
  still 74, 65, 48 and 74 units). `measure-layout` is clean from 500 px in both engines (6 overlaps at 480, 3353 at
  320). Capture list: `emitter-<kind>-<source>-<theme>-<width>` for underfloor, radiator and none with air, ground and
  hybrid, light and dark, at 560 and 1000 px in heating (36), plus the radiator with `fill=none` at 1000 px; the muted
  emitters are in the band captures (DHW mode). All 37 opened at full size (verdicts in the report). Snapshots
  re-recorded (196).
- [x] 6.5 Update README.md (the `emitter` option) and docs/ecogeo-card.md (the emitter, its colouring and why it is not
  a manual item). Verify: `npm run check` passes. Note (2026-11-19, implementer): README (options table, the emitter
  table and paragraph, the emulator URL table, the features line), docs (The band, the new section The emitter,
  component taps, colours and muted pipes, live values, threshold and place numbers: 13 installations, 312 cases, WebKit
  searched) and `docs/images/heating.png` from `scenario-heating`; `docs/images/phone-heating.png` is unchanged (group
  7).

## 7. The cabinet layout with value lanes

- [ ] 7.1 Re-author the cabinet's coordinates once in the new cabinet frame (design D1; schematic-drawing "Cabinet
  layout with value lanes"): `componentsFor`, `segmentsFor`, the crossings and model C's parts (47-51, 54) laid out in
  rows and columns with row and column lanes between them, 720 units wide, with the lanes recorded (their ranges and
  which values they hold) and every component still citing its item number. Keep the topology of the manual figures:
  port order, the order along every pipe, probe and HTR placements, the pairs, transducers on their lines, hops, no more
  crossings than the manual figure. Verify: the existing topology unit tests pass unchanged in what they assert (only
  coordinates in tests change); new unit tests for "Lanes free of parts" pass for every source, DHW storage and emitter.
- [ ] 7.2 Derive the horizontal arrangement from the new frame (design D2: an x map that widens the column lanes to a
  cabinet of about 980 units, a y map that may narrow the row lanes), keeping the band model, the bodies and the joins.
  Verify: the band, topology and integrity unit tests pass for the horizontal arrangement.
- [ ] 7.3 Drop the captions of the values inside bodies (outer-loop-source "Air unit with its value inside", "Ground
  collector"; dhw-storage "DHW values inside the tank", "Model C tank values"; responsive-layout "No in-drawing
  captions"); set the label fonts per layout (design D8: `max(10px, k cqw)`, the 8 px floor goes; responsive-layout
  "Minimum rendered sizes") and the pair blocks' row pitch from the label height (design D7). Verify: label and source
  and tank unit tests pass; the 10 px font assertion is back in `test/card/sizes.browser.test.ts`.
- [ ] 7.4 Re-place the horizontal labels in the lanes and re-measure the threshold by design D7 in Chromium and WebKit;
  record the snapshots again. Verify: horizontal overlap browser tests pass in both engines; the bound tests (values
  beside their parts, pressures beside their transducers) pass; the search's paste output equals `HORIZONTAL_PLACES`; a
  capture subagent checks the band, emitter and panel captures at the threshold and 1000 px against the review
  criteria.
- [ ] 7.5 Update README.md and docs/ecogeo-card.md (the cabinet frame and its lanes, why it no longer uses the manual
  figure's coordinates, the map breakpoints, the fonts, the body values without captions, the threshold and how it was
  measured), and regenerate docs/images/heating.png. Verify: `npm run check` passes.

## 8. The vertical arrangement

- [ ] 8.1 Build the vertical arrangement from the cabinet frame (design D2): the identity x map and a y map that
  heightens the row lanes; `arrangementFor('vertical', key)` returns it; the band spans its width. Verify: unit tests
  for schematic-drawing "Vertical arrangement" (taller ratio, same parts and pipes), "Same order in both layouts" and
  responsive-layout "Same values in both layouts" pass, and the band, topology and integrity tests cover both layouts.
- [ ] 8.2 Place the vertical labels with `npm run search-places -- --layout=vertical --width=320` in Chromium and
  WebKit, recording `VERTICAL_PLACES` with reasons. A label without a place is a decision point for the user (design
  Risks), not a pipe exception. Verify: the search reports a place for all 19 labels in both engines, and the vertical
  layout is clean up to 1 px under the threshold.
- [ ] 8.3 Restore the phone-width browser tests for the vertical layout (responsive-layout "Labels clear of
  everything": 320, 360, 412 px and 1 px under the threshold, every scenario; stroke and font minimums; footer wrap) and
  the auto switch at the threshold with hysteresis. Verify: they pass in Chromium and WebKit.
- [ ] 8.4 Extend the capture list (dev-emulator "Card width and layout controls": every scenario at 360 px auto, every
  scenario vertical at 320 px) and record the snapshots. Verify: a capture subagent checks the vertical captures at 320
  and 360 px, light and dark, every source, DHW storage and emitter, against the review criteria.
- [ ] 8.5 Update README.md (the two layouts, a phone screenshot: regenerate docs/images/phone-heating.png) and
  docs/ecogeo-card.md (vertical arrangement, its y map, fonts). Verify: `npm run check` passes.

## 9. Visual references on Linux

- [ ] 9.1 Add the `visual` Vitest project (design D12; dev-emulator "Visual references on Linux"): Chromium only,
  reduced motion, `test.skipIf(process.platform !== 'linux')`, renders of both layouts in light and dark covering
  every source, DHW storage and emitter. Verify: on Windows the run reports these tests as skipped.
- [ ] 9.2 Extend `.github/workflows/check.yml`: run the visual project after `npm run check`, and a `workflow_dispatch`
  input that runs it with `--update` and uploads the reference folder as an artifact. Verify: `npm run lint:ha`
  (workflow schema, yamllint) passes.
- [ ] 9.3 Record the references through that workflow input once the user allows a push of the branch, and commit
  them. Verify: the next CI run passes the visual project, and a deliberately moved part in a scratch branch fails it
  naming the render (checked by the review, then discarded).
- [ ] 9.4 Document the visual references in docs/ecogeo-card.md (what they cover, how to record them again). Verify:
  `npm run check` passes.

## 10. Release 1.0.0 again

- [ ] 10.1 Rewrite the 1.0.0 section of CHANGELOG.md for the reworked card (layouts, emitter, values, band, cabinet
  layout); keep `package.json` at 1.0.0 (design D13); run `npm run release`. Verify: `npm run release` passes and
  `npm run verify-dist` passes.
- [ ] 10.2 The live installation's emitter is underfloor (confirmed by the user 2026-11-19, recorded in
  `private/installation.md`), the default, so the dashboard config needs no `emitter`. Deploy `dist/ecogeo-card.js`
  explicitly, bump the dashboard resource's `?v=` (id and value in `private/installation.md`) and record the deploy
  there. Verify: a subagent takes light screenshots of the schematic view at 1170 px with zoom 3 (vertical) and at
  1280 x 800 (horizontal), returns a verdict against the review criteria, and the system log shows no `ecogeo` errors.

## Workflow follow-up

- Before group 10: with font smoothing on (the user switches it), run the browser project in Chromium, the place
  search for both layouts and `scripts/measure-layout.mjs` in Chromium; fix any difference from the WebKit results.
  Done for the horizontal layout on 2026-11-19 (group 4 review, smoothing on): the browser project passes in both
  engines, and the Chromium search at 680 and 660 px and `measure-layout` agree with WebKit (places and threshold
  680). Repeat after groups 5-8 change the drawing, and for the vertical search. Done after groups 5 and 6
  (2026-11-19, smoothing on): the horizontal search at 560 px gives the same places in both engines and
  `measure-layout` is clean from 500 px in both.
- The first CI run on Linux after a push confirms the browser preflight passes there (design D11).
- One fresh Opus review of the whole change before archiving.
- At archive, edit the Purpose sections of the main specs that still describe the old layouts and side zones
  (responsive-layout, schematic-drawing, outer-loop-source, dhw-storage), and name the change in AGENTS.md.
- Replacing the GitHub release and the `v1.0.0` tag (delete and recreate with the new `dist/ecogeo-card.js`) only on
  the user's explicit request.
- The three local commits from 2026-11-19 (`1e14829`, `b55e5bf`, `4f88461`) are pushed only on the user's
  request; task 9.3 needs a push of this change's branch to run the workflow input.
