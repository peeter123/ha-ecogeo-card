# Tasks

Groups 2-7 work on the horizontal layout; group 7 re-authors the cabinet with value lanes (design D1, decided by
the user 2026-11-20 after the first group 7 attempt at the vertical arrangement stopped at a decision point). Until
group 8 builds the vertical arrangement, `layout: vertical` (and `auto` below the threshold) renders the horizontal
arrangement, and the phone-width overlap tests are absent; group 8 brings them back. Group 8 also changes the
horizontal layout: one band body height and the cabinet refinements in both layouts (tasks 8.2 and 8.3, decided by
the user 2026-11-20 after the first vertical place search, then task 8.2, stopped at a decision point). Nothing is
deployed before group 10. Every visible group ends with a subagent that runs
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
  return leaving the last 106 under it, the body filled with the same gradient (opacity 0.5) only with
  `exchanger_fill: gradient`. `dg1_sup`/`dg1_ret` are in `production_dg1` with the production pump as speed role, so
  `p1_stub`/`p2_stub` moved from the cabinet's list into `bandSegments` and exist only with `none` (12 units). Tests:
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

- [x] 7.1 Re-author the cabinet's coordinates once in the new cabinet frame (design D1; schematic-drawing "Cabinet
  layout with value lanes"): `componentsFor`, `segmentsFor`, the crossings and model C's parts (47-51, 54) laid out in
  rows and columns with row and column lanes between them, 720 units wide, with the lanes recorded (their ranges and
  which values they hold) and every component still citing its item number. Keep the topology of the manual figures:
  port order, the order along every pipe, probe and HTR placements, the pairs, transducers on their lines, hops, no more
  crossings than the manual figure. Verify: the existing topology unit tests pass unchanged in what they assert (only
  coordinates in tests change); new unit tests for "Lanes free of parts" pass for every source, DHW storage and emitter.
  Note (2026-11-20, implementer, rewritten after the round 1 review): the cabinet frame is 720 x 520 (top edge y 0) in
  `geometry.ts` (`COL`, `ROW`, `ROW_LANES`, `COLUMN_LANES`, each lane with range and contents). Rows: A 8-74 (DHW
  lines, valve 26, model C tank 50/coil 51/probe 54), B 100-156 (probe row y 112, transducer and compressor row y 142,
  pairs at y 126), D 228-408 (exchanger 9, valve 14, thermostat 45 over resistor 44, pump 16, exchangers 8 and 7, the
  line at y 396), F 444-506 (exchanger 10). Row lanes 76-100, 156-228 (blocks in two rows, the compressor speed in a
  third), 408-444; column lanes 0-40, 77-117, 142-160, 229-269, 318-358, 542-572, 609-667 (ports 5 and 6 at x 667 and
  707). Thermostat 45 stands directly above resistor 44 on riser 1 (a unit test checks adjacency on the same pipe with
  no part between, for all 216 contexts). The topology tests pass with only coordinates changed; `lanes.test.ts`
  checks the lanes for 216 contexts in the frame and mapped, and that every cabinet label lies in a lane (its anchor
  in the frame, its whole box mapped; body labels and the DG1 demand above the top edge are not cabinet labels). No
  topology rule had to be dropped; 9 crossings.
- [x] 7.2 Derive the horizontal arrangement from the new frame (design D2: an x map that widens the column lanes to a
  cabinet of about 980 units, a y map that may narrow the row lanes), keeping the band model, the bodies and the joins.
  Verify: the band, topology and integrity unit tests pass for the horizontal arrangement.
  Note (2026-11-20, implementer): `laneMap` builds `HORIZONTAL_MAP_X` from `HORIZONTAL_LANE_EXTRA` (+64, +48, +30,
  +78, +40 = 260 over the lanes at 0-40, 77-117, 229-269, 542-572, 609-667; knots 0/10, 40/114, 77/151, 117/239,
  229/351, 269/421, 542/694, 572/802, 609/839, 667/937, 720/990) and `HORIZONTAL_MAP_Y` from `HORIZONTAL_LANE_SHRINK`
  (the lane 76-100 narrows by 18; knots 0/232, 76/308, 100/314, 520/734; the cabinet is 502 tall, the viewBox 1000 x
  749). Port 4 lands at x 827, left of the tank slot. A unit test covers the override path of `buildArrangement` with
  a synthetic place.
- [x] 7.3 Drop the captions of the values inside bodies (outer-loop-source "Air unit with its value inside", "Ground
  collector"; dhw-storage "DHW values inside the tank", "Model C tank values"; responsive-layout "No in-drawing
  captions"); set the label fonts per layout (design D8: `max(10px, k cqw)`, the 8 px floor goes; responsive-layout
  "Minimum rendered sizes") and the pair blocks' row pitch from the label height (design D7). Verify: label and source
  and tank unit tests pass; the 10 px font assertion is back in `test/card/sizes.browser.test.ts`.
  Note (2026-11-20, implementer): the bodies' values are bare numbers (only "Demand" stays); `LABEL_FONT_K` in
  `label-places.ts` holds `k` per layout (horizontal 1.3, vertical 1.3 until group 8) and the font is
  `max(10px, k cqw)` (tank temperature `max(11px, 1.2 k cqw)`); `PAIR_ROW_GAP` = label height at the threshold (12 px
  / 0.56 + 1) rounded up to the search grid = 24, read by `dev/overlaps.ts` and the search. The superheat and the
  opening are no block: they stand beside each other under valve 12. The 10 px assertions are back in
  `sizes.browser.test.ts`.
- [x] 7.4 Re-place the horizontal labels in the lanes and re-measure the threshold by design D7 in Chromium and WebKit;
  record the snapshots again. Verify: horizontal overlap browser tests pass in both engines; the bound tests (values
  beside their parts, pressures beside their transducers) pass; the search's paste output equals `HORIZONTAL_PLACES`; a
  capture subagent checks the band, emitter and panel captures at the threshold and 1000 px against the review
  criteria.
  Note (2026-11-20, implementer, after the round 1 review): the rule is read as written (a width counts when the
  search finds an allowed place for every label). `search-places` now reports a body label whose zone place is blocked
  as BLOCKED, prints the free place it found and exits non-zero. At 560 px it had found free in-tank places for the
  tank 50 values in both engines; the zone constants now are those places (temperature end-aligned 70 units from the
  tank's left wall, demand end-aligned 150 units from it and 4 units higher). Re-measured by D7 in Chromium and
  WebKit, identical: 560 px holds (all 19 labels free at their default places in all 312 cases, empty paste output, so
  `HORIZONTAL_PLACES` is empty); at 540 px no place for the two tank 50 values in either engine. `VERTICAL_BELOW` is
  560 (return at 584). `measure-layout` is clean from 520 px in Chromium and from 540 px in WebKit. Snapshots
  re-recorded (the 580 ones removed), browser project passes in both engines. Captures of the final build opened by
  the implementer: `panel-heating`, `band-hybrid-internal-light-560`, `emitter-none-hybrid-light-560`,
  `labels-modelC-560-heating` and `emitter-underfloor-hybrid-dark-1000`, all clean. The round 0 subagents had opened
  all 48 `band-*` and 39 `emitter-*`, panel and scenario captures of the earlier 580 px build (all PASS); the final
  build's `band-*` and `emitter-*` captures were regenerated but not all re-opened.
- [x] 7.5 Update README.md and docs/ecogeo-card.md (the cabinet frame and its lanes, why it no longer uses the manual
  figure's coordinates, the map breakpoints, the fonts, the body values without captions, the threshold and how it was
  measured), and regenerate docs/images/heating.png. Verify: `npm run check` passes.
  Note (2026-11-20, implementer): README.md and docs/ecogeo-card.md (The cabinet frame with its rows and lanes, the
  maps, the fonts, captionless body values, the threshold and its measurement, the default places, the panel numbers)
  updated and docs/images/heating.png regenerated from `scenario-heating`. `npm run check` passes.

## 8. The vertical arrangement

- [x] 8.1 Build the vertical arrangement from the cabinet frame (design D2): the identity x map and a y map that
  heightens the row lanes; `arrangementFor('vertical', key)` returns it; the band spans its width. Verify: unit tests
  for schematic-drawing "Vertical arrangement" (taller ratio, same parts and pipes), "Same order in both layouts" and
  responsive-layout "Same values in both layouts" pass, and the band, topology and integrity tests cover both layouts.
  Note (2026-11-20, implementer): `arrangementFor('vertical', key)` is its own arrangement (`id: 'vertical'`, built per
  layout and key) from `VERTICAL_MAP_X` (identity, the cabinet at x 10-730) and `VERTICAL_MAP_Y`; the viewBox is 740
  wide, not 1000 (the cabinet and 10 units of margin at each side; 791 high with the widest band), so a unit renders
  `width / 740` px: `strokeWidths(width, viewBoxWidth)` takes the viewBox width (default 1000) and the card passes its
  arrangement's, and the label font factor is `LABEL_FONT_K.vertical` = 2.4 (D8: a 10 px label is 12 px * 1000 / 560 =
  21.4 units tall at the horizontal threshold; 1.2 * k * 7.4 = 21.4; at 320 px it is 28 units tall, the 10 px floor
  holds up to 417 px). `VERTICAL_LANE_EXTRA` (geometry.ts) has one entry so far: the lane under the compressor row
  gains 24 units (three rows at the 32 unit pitch of `PAIR_ROW_GAP.vertical`, found with the search at 320 px); the lane
  over the probe row and the one under the valve row gain nothing. The tank's pipe from port 5 runs left over port 4's
  riser (the tank slot covers x 570-730, port 4 is at 607), so `BAND_JOGS.vertical` jogs the tank's pipe at 40 units
  over the top edge, above port 4's jog (34): no crossing. `labelPlacesFor`, `defaultLabelPlaces`, `arrangementOf` and
  `arrangementWithPlaces` take the layout; `measure-layout` has `--layout=vertical`. Tests: the band, simplified
  (invariants, pairs, thermostat 45), geometry (integrity, taller ratio, same parts and pipes, same order, y map) and
  lanes tests run for both layouts; layout-switch has "Same values in both layouts"; layout.test.ts has the 740 unit
  stroke widths.
- [x] 8.2 Give the band's bodies one height and stretch tank 50's head in the vertical layout (decided by the user
  2026-11-20): the emitter, the air unit, the ground collector, the hybrid and the external tank share one body height
  of 176 units in both layouts (design D3, D4; schematic-drawing "One body height in the band"), and the vertical y
  map adds 28 units in row A above coil 51 at a breakpoint where only tank 50's wall and vertical pipes run
  (design D2; schematic-drawing "Vertical arrangement", dhw-storage "Model C tank values stacked"), recorded with its
  reason as the allowed breakpoint inside a body, not a value lane, and applied only where tank 50 is drawn. The
  horizontal layout keeps its y map. Verify: the band, source, tank and emitter unit tests pass (equal body heights,
  the taller tank 50 in the vertical layout only, row A unchanged where tank 50 is not drawn),
  and the horizontal aspect test passes with its bound raised from 0.75 to 0.76.
  Note (2026-11-20, implementer): `BAND.height` and the heights of the emitter, air unit, collector and external tank
  are 176 (the cabinet's top edge is at y 238, the horizontal viewBox 1000 x 755, aspect 0.755). The extra height goes
  where it does least harm: the external tank's coil is 6 units lower (the two values stack in the 62 unit strip above
  it, rows 44 and 74 under its top); the air unit's divider, strip and coil block are 8 lower (the fan is 4 lower); the
  collector's four passes are 30 apart instead of 14; the underfloor loop's five passes 26 apart instead of 14; the
  radiator's columns reach y 168 (outlet 158). `VERTICAL_TANK_HEAD` (geometry.ts) stretches the frame's y 10-24 by 28
  in the vertical layout where tank 50 is drawn (`BandKey.internal`, set by `bandKeyOf` from `drawnStorage`; the
  arrangement is built per key): 24 leaves no place for the two values in Chromium and WebKit, 26 leaves the Demand
  blocked by 1 px of margin in the one scenario that shows it, 28 puts both free at their zone places (temperature
  18 and Demand 46 under the tank's top, both start-aligned 24 from its left wall); `axisMapsOf(layout, key)` gives the
  maps. The tank zone's height is `mapY(74) - mapY(8)`, so the horizontal tank stays 66. Tests: one body height for
  every layout and key (band), the taller tank 50 only in the vertical layout and only with `internal`, the head range
  free of symbols (geometry), the lanes test with the key's own y map, the aspect bound 0.76.
- [x] 8.3 Refine the cabinet in both layouts (decided by the user 2026-11-20; design D1, D14): the superheat label is
  gone (live-values "Values on the drawing", "Refrigerant values"; its role stays), the pump speeds show whole
  percentages (live-values "Hydraulic values", "Locale and precision", "The card's own units"), valve 25 and its stub
  `htr_drain` are gone (schematic-drawing "Hydraulic components after the manual figure", "Optional parts follow their
  feature state"), compressor 11 and exchanger 10 are centred on the cabinet's centre line with the horizontal x map
  balanced around it (schematic-drawing "Compressor and exchanger 10 centred"), and the expansion valve opening is
  centred under valve 12. Move or delete the superheat label tests as design D14 says. Then re-place the horizontal
  labels and re-measure the horizontal threshold by design D7 in Chromium and WebKit, and record the snapshots again.
  Verify: the unit tests pass (18 labels, whole-percent pumps, no valve 25, the centring within 2 units, lanes and
  topology); the horizontal overlap browser tests pass in both engines; the search's paste output equals
  `HORIZONTAL_PLACES`; a capture subagent checks the horizontal band, emitter and model C captures at the threshold
  and at 1000 px against the review criteria.
  Note (2026-11-20, implementer, Chromium with font smoothing on and
  WebKit): the superheat label is gone (18 labels; the role, the `difference` quantity and the readings stay; the
  label tests are deleted, the display-precision test moved to the valve opening); the pump roles default to 0
  decimals and `formatReading` ignores the display precision of a pump in % (an on/off pump still reads On or Off, a
  pump in rpm keeps its decimals); valve 25, its `htr_drain` stub and the `drain_valve` kind are gone; `CENTRE` (frame
  x 360) is where compressor 11, filter dryer 13 and exchanger 10 stand (the frame lane at x 318-358 is deleted, as
  the compressor stands in its range); the horizontal x map is balanced: 130 units left of the centre line (62, 46 and
  22 in the lanes at 0-40, 77-117 and 229-269) and 130 right of it (84 and 46 at 542-572 and 609-667), so frame x 360
  lands on x 500; the opening is centred under valve 12 (the row lane under the valve row holds it alone). The first
  balance (56, 44, 30) put production Out 0.8 unit over the cabinet's edge at 560 px, so the left-edge lane got 62.
  Search at 560 px in Chromium and WebKit: every label free at its default place in all 312 cases, empty paste output,
  so `HORIZONTAL_PLACES` is empty; at 540 px no place for the two tank 50 values in either engine, and production Out
  needs a moved place (112, 312, end), so the threshold stays 560 (balancing cost nothing). `measure-layout` (520, 540,
  560, 580, 600, 640, 700, 800 px) is clean from 540
  px in both engines (130 overlaps in 130 cases at 520). Unit tests: 18 labels, whole-percent pumps (display precision
  ignored, rpm and on/off kept), no valve 25 and no stub, centring within 2 units in the frame and both layouts, the
  balanced x map, lanes and topology; the snapshots are recorded again (16 stale ones for the old label widths
  removed). Captures: I opened `band-hybrid-internal-light-560` and `labels-modelC-560-heating`; six subagents opened
  the 75 emitter, threshold, panel and model C captures (all PASS, tight notes only) and the 48 `band-*` ones (36
  PASS; 12 internal ones were flagged because tank 50's two values are 4 units apart in height, the offset the 560 px
  search found free in the group before, not a regression).
- [x] 8.4 Rotate the vertical layout's hydraulic values and place the vertical labels (decided by the user 2026-11-20;
  design D7, D8; responsive-layout "Rotated values in the vertical layout", "Out and In side by side in the vertical
  layout", "Same values in both layouts"; schematic-drawing "Gap places in the vertical layout"): production Out, In
  and pressure 38, brine Out, In and pressure 37 and the pump 16 value turned -90° along their pipes, Out and In side
  by side at the same height with the pressure next to them (brine: Out, In, pressure), the pump 15 value horizontal
  above pump 15; teach the search and the overlap measure the rotated box. Search with
  `npm run search-places -- --layout=vertical --width=320` in Chromium and WebKit and record `VERTICAL_PLACES` with
  reasons and rotations. A label without an allowed place (the pump 15 value included) is a decision point for the
  user (design Risks), not a pipe exception or a silent rotation. Verify: the search reports an allowed place for all
  18 labels in both engines; the lanes unit test checks the rotated values and the pump 15 value for no part, no pipe
  and beside their part; the vertical layout is clean from 320 px up to 1 px under the threshold.
  Note (2026-11-20, implementer, as task 8.2 before the decisions above): DECISION POINT, stopped here;
  `VERTICAL_PLACES` is empty and the tasks after it are open. Search at 320 px, Chromium and WebKit (identical,
  312 cases): no joint place for the
  external tank's two values (92 x 26 and 94 x 23 units; the strip between its rim and its coil is 56 units, they need
  58) nor for model C's tank 50 values (82 and 94 wide in a tank 174 wide and a strip about 30 high). The production
  Out, In and pressure (120, 105 and 79 units wide) cannot sit beside probes 33, 34 and 38 (the vertical pipes in the
  rows beside them are 65, 77, 30 and 21 units apart; the nearest free places are 271, 165 and 168 units away), and
  the brine values land 112 to 246 units from their parts. The numbers and the options are in the group report. The
  user then decided the band body height and the tank 50 stretch (8.2), the cabinet refinements (8.3) and the rotated
  values (8.4) on 2026-11-20.
  Note (2026-11-20, implementer, after the decisions): `rotate: -90` is on the label spec
  and `Placement`; `labels.ts` turns the label (`.label.rotated`: `translate(-50%, -50%) rotate(-90deg)`, centred on
  its place); `dev/overlaps.ts` trims the half-leading at the sides of a turned label and exports `ROW_GROUPS`; the
  search lets a turned label be centred only, finds the Out, In and pressure of a side together (left to right, Out
  and In nested in height, no neighbour closer than the margins), keeps the pump 15 value above its pump, measures
  every case in the frame of the arrangement without tank 50's head (`headShift`, the same rows for every case) and
  prints `rotate`. Both engines find the same places for all 18 labels at 320 px (recorded in `VERTICAL_PLACES` with
  reasons): production Out, In and pressure at y 424-432 in the left strip and the gap beside riser 1/the trunk, brine
  Out in the gap before riser 3 and In and pressure right of riser 4, pump 16 turned right of riser 4, pump 15
  horizontal at x 192 above the pump (valve 27 meets its default place). Tank 50's values are stacked at their zone
  places once the head is 28 (see 8.2). Tests: the lanes test checks every rotated value and the pump 15 value for no
  part, no pipe (at the 320 px pipe width) and at most 60 units from their part for every source, DHW storage and
  emitter, and the row order and shared height of both rows; the vertical arrangement turns exactly seven values, the
  horizontal one none. `measure-layout --layout=vertical` (320, 360, 412, 480, 520, 559 px): 0 overlaps in 156 cases
  at each width, in Chromium and WebKit.
- [x] 8.5 Restore the phone-width browser tests for the vertical layout (responsive-layout "Labels clear of
  everything": 320, 360, 412 px and 1 px under the threshold, every scenario, rotated labels measured by their rotated
  box; stroke and font minimums; footer wrap) and the auto switch at the threshold with hysteresis. Verify: they pass
  in Chromium and WebKit.
  Note (2026-11-20, implementer): `overlaps.browser.test.ts` runs the horizontal range (560,
  800, 1000 px) and the vertical one (320, 360, 412 and 559 px) for every scenario, installation and naming;
  `rotated.browser.test.ts` checks the seven turned values (taller than wide, at least 10 px, at 320 to 559 px) and
  that the horizontal layout turns none; `sizes.browser.test.ts` adds 412 px to the stroke and font minimums;
  `layout.browser.test.ts` checks a fresh card at 559 (vertical) and 560 (horizontal) and the hysteresis up to 584;
  the footer wrap tests were already there. All pass in Chromium and WebKit.
- [x] 8.6 Extend the capture list (dev-emulator "Card width and layout controls": every scenario at 360 px auto, every
  scenario vertical at 320 px) and record the snapshots. Verify: a capture subagent checks the vertical captures at
  320 and 360 px, light and dark, every source, DHW storage and emitter, against the review criteria, including the 18
  values and the rotated values beside their parts.
  Note (2026-11-20, implementer): the list has `phone-<scenario>`
  (360 px auto), `vertical-<theme>-<scenario>` (320 px), `vertical-band-*` and `vertical-emitter-*` (every source,
  storage and emitter, light and dark, 320 and 559 px); 316 captures, 316 snapshots. I opened
  `vertical-light-heating`, `vertical-dark-heating`, `vertical-band-ground-internal-light-320` (model C),
  `vertical-band-hybrid-external-dark-320`, `vertical-emitter-none-hybrid-light-320` and
  `vertical-emitter-radiator-air-light-320`. Four subagents opened the full vertical set: the 36 scenario captures
  (all PASS), the 32 air and ground band captures (all PASS), the 28 hybrid band and emitter none captures (all PASS)
  and the 24 underfloor and radiator emitter captures. The last reported the six radiator captures at 320 px as
  failing because "Demand" sits on the column tops; I opened one, the label sits 6 units above the columns, and
  `measure-layout` (the radiator installation is in it) finds no overlap at 320 px in either engine, so I did not
  count it as a finding (the review then asked for more room: the radiator's columns now start 52 units under the top,
  inlet 62, so the plate clears them visibly). Tight spots the reviewers named, none touching: the rotated brine Out
  and In 5 to 10 px from their pipes, the DG1 demand 5 px over the cabinet outline with no emitter.
- [x] 8.7 Update README.md (the two layouts, the 18 values, whole-percent pumps, a phone screenshot: regenerate
  docs/images/phone-heating.png) and docs/ecogeo-card.md (vertical arrangement, its y map with the tank 50 stretch,
  fonts, the rotated values; and the refinements in both layouts: one band body height, no superheat, whole-percent
  pumps, no valve 25, compressor 11 and exchanger 10 centred, the opening under valve 12, the re-measured threshold).
  Verify: `npm run check` passes.
  Note (2026-11-20, implementer): README.md (two layouts, the 18 values, whole-percent
  pumps, the capture list, the phone screenshot) and docs/ecogeo-card.md (a section The vertical arrangement with its
  y map, tank 50's head, the fonts, the rotated values, the gap places and the vertical places; the one band height;
  no superheat, whole-percent pumps, no valve 25; the centred compressor and exchanger 10 and the balanced x map; the
  re-measured threshold; the review criteria) updated; `docs/images/heating.png` (from `scenario-heating`) and
  `docs/images/phone-heating.png` (from `phone-heating`, 360 px) regenerated. `npm run check` passes: 83 test files,
  13406 tests, in Chromium and WebKit.

## 9. Visual references on Linux

- [x] 9.1 Add the `visual` Vitest project (design D12; dev-emulator "Visual references on Linux"): Chromium only,
  reduced motion, `test.skipIf(process.platform !== 'linux')`, renders of both layouts in light and dark covering
  every source, DHW storage and emitter. Verify: on Windows the run reports these tests as skipped.
  Done (2026-11-20): `test/visual/renders.visual.test.ts` renders 16 references (two layouts, light and dark, four
  installations); `npm run test:visual` reports 16 skipped on Windows. `npm test` runs only unit and browser, as the
  visual project would fail on missing references on Linux. The skip reads `server.platform` of
  `vitest/browser`, the Node platform that also names the reference files; the comparison allows 20 pixels.
- [x] 9.2 Extend `.github/workflows/check.yml`: run the visual project after `npm run check`, and a `workflow_dispatch`
  input that runs it with `--update` and uploads the reference folder as an artifact. Verify: `npm run lint:ha`
  (workflow schema, yamllint) passes.
  Done (2026-11-20): the step was skipped until a PNG existed (until task 9.3 removed that guard): on CI (`CI=true`)
  Vitest fails a missing reference and writes the image only to the attachments folder. The input `update_references`
  runs `--update` and uploads `visual-references`. After any failed step another step uploads `.vitest/attachments/` as
  `visual-diffs`, which holds files only when a comparison failed or a reference was missing. Both use
  `actions/upload-artifact@v7`.
- [x] 9.3 Record the references through that workflow input once the user allows a push of the branch, commit them, and
  remove the compare step's guard that skips it while no reference exists (design D12). Verify: the next CI run passes
  the visual project, and a deliberately moved part in a scratch branch fails it naming the render (checked by the
  review, then discarded).
  Done so far (2026-11-20): recorded on Linux by Check run 44796692252 (`update_references=true`), the 16 references
  committed in test/visual/references/, and the compare step's guard removed from check.yml.
  Done (2026-11-20): Check run 44799380087 on that commit ran the comparison and passed 16 of 16 (its first attempt
  timed out installing the Playwright system packages from a slow mirror, before any test). A scratch branch that moved
  the vertical pump 15 value by 5 units failed it in run 44804517434 on the 8 vertical renders, each named (120 px
  light, 147 px dark), with the `visual-diffs` artifact uploaded; the review opened two diff images (only that label
  differs), and the branch was deleted.
- [x] 9.4 Document the visual references in docs/ecogeo-card.md (what they cover, how to record them again). Verify:
  `npm run check` passes.
  Done (2026-11-20): section Visual references of docs/ecogeo-card.md, and the script in README.md.

## 10. Release 1.0.0 again

- [x] 10.1 Rewrite the 1.0.0 section of CHANGELOG.md for the reworked card (layouts, emitter, values, band, cabinet
  layout); keep `package.json` at 1.0.0 (design D13); run `npm run release`. Verify: `npm run release` passes and
  `npm run verify-dist` passes.
  Done (2026-11-20): the 1.0.0 section of CHANGELOG.md describes the reworked card (layouts, band, emitter, 18
  values, cabinet layout, footer, removed options); its heading has no date until the release is replaced;
  `package.json` stays at 1.0.0; `npm run release` and `npm run verify-dist` pass (dist 163088 bytes).
- [x] 10.2 The live installation's emitter is underfloor (confirmed by the user 2026-11-19, recorded in
  `private/installation.md`), the default, so the dashboard config needs no `emitter`. Deploy `dist/ecogeo-card.js`
  explicitly, bump the dashboard resource's `?v=` (id and value in `private/installation.md`) and record the deploy
  there. Verify: a subagent takes light screenshots of the schematic view at 1170 px with zoom 3 (vertical) and at
  1280 x 800 (horizontal), returns a verdict against the review criteria, and the system log shows no `ecogeo` errors.
  Done (2026-11-20): `dist/ecogeo-card.js` uploaded (no conflict), resource `?v=15` -> `?v=16`, dashboard config hash
  unchanged (in `private/installation.md`); the subagent's light screenshots of both widths pass the review
  criteria; no `ecogeo` or `frontend.js` entries in system_log. Details in `private/installation.md`.

## Workflow follow-up

- Before group 10: with font smoothing on (the user switches it), run the browser project in Chromium, the place
  search for both layouts and `scripts/measure-layout.mjs` in Chromium; fix any difference from the WebKit results.
  Done for the horizontal layout on 2026-11-19 (group 4 review, smoothing on): the browser project passes in both
  engines, and the Chromium search at 680 and 660 px and `measure-layout` agree with WebKit (places and threshold
  680). Repeat after groups 5-8 change the drawing (in group 8 the horizontal search and threshold of task 8.3 too),
  and for the vertical search with its rotated labels (task 8.4). Done after groups 5 and 6
  (2026-11-19, smoothing on): the horizontal search at 560 px gives the same places in both engines and
  `measure-layout` is clean from 500 px in both. Done after group 7 (2026-11-20, smoothing on): the horizontal search
  places every label at its default at 560 px and finds no place for the tank 50 values at 540 px in both engines;
  `measure-layout` is clean from 520 px in Chromium and from 540 px in WebKit. Done after group 8 (2026-11-20,
  smoothing on): the horizontal search places every label at its default at 560 px in both engines, the vertical
  search at 320 px gives the same nine places in both, `measure-layout` is clean from 540 px horizontally and from 320
  to 559 px vertically in both.
- Before archiving, drop the task and group numbers that earlier changes left in test comments
  (test/card/layout.test.ts, test/diagram/pipes.test.ts, test/editor/advanced-entities.test.ts,
  test/editor/color-rows.test.ts, test/editor/entity-discovery.test.ts, test/suggest/suggest.test.ts), found in the
  group 7 review.
- The first CI run on Linux after a push confirms the browser preflight passes there (design D11).
- One fresh Opus review of the whole change before archiving.
- At archive, edit the Purpose sections of the main specs that still describe the old layouts and side zones
  (responsive-layout, schematic-drawing, outer-loop-source, dhw-storage), and name the change in AGENTS.md.
- Replacing the GitHub release and the `v1.0.0` tag (delete and recreate with the new `dist/ecogeo-card.js`) only on
  the user's explicit request.
- The three local commits from 2026-11-19 (`1e14829`, `b55e5bf`, `4f88461`) are pushed only on the user's
  request; task 9.3 needs a push of this change's branch to run the workflow input.
