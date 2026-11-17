# Tasks

Each group is implemented by one Sonnet subagent, reviewed by Opus and committed alone (see
`openspec/config.yaml`). Every group ends with `npm run check` green. Groups 1-6 do not run `npm run release`.
Emulator screenshots are captured and judged by a subagent, which returns a text verdict.

## 1. Pipe- and caption-aware overlap check

- [x] 1.1 Extend `dev/overlaps.ts` with pipe samples and caption boxes (design D4): sample every `path.pipe` at 1 px
  steps of rendered length, inflated to its rendered stroke width; box `text.circuit-label`, `text.source-caption`
  and `text.tank-caption` like labels; report `label x pipe:<segment>`, `caption x label` and `caption x pipe`
  pairs; keep the `bare` exclusion for tank 50 and coil 51.
  Verify: a new browser test renders a card with a label moved onto a pipe, and one onto a caption, and the check
  reports exactly those pairs in Chromium and WebKit; a card with no such overlap reports none.
- [x] 1.2 Give `scripts/measure-layout.mjs` a `--pipes` flag that counts the new pairs (the guard in
  `test/card/overlaps.browser.test.ts` stays label-and-component only until group 4), and run it once on today's
  drawing.
  Verify: `npm run measure-layout -- --pipes` runs and prints the threshold with pipes counted and the most frequent
  pairs; the result is recorded as the baseline in `docs/ecogeo-card.md` ("The compact threshold"), next to an
  updated method paragraph that describes the pipe samples and captions.

## 2. The arrangement as a value (no visible change)

- [x] 2.1 Add the markup snapshot test before any refactor (design D8): render every configuration of
  `dev/captures.ts` with sample states in happy-dom and snapshot the SVG markup and the label positions.
  Verify: `npm test` records and passes the snapshot on the unchanged code.
- [x] 2.2 Introduce `Arrangement` and `arrangementFor(level, layout)` in `src/diagram/geometry.ts` (design D1) and move
  every consumer (`cabinet.ts`, `source.ts`, `dhw.ts`, `pipes.ts`, `labels.ts`, `component-info.ts`, the card's viewBox,
  `dev/` and `scripts/`) to read it from the draw context; both levels return today's coordinates.
  Verify: the snapshot of 2.1 passes unchanged, `npm run check` is green, and no module outside `geometry.ts` imports
  a coordinate constant directly (a grep in the review).
- [x] 2.3 Update the geometry section of `docs/ecogeo-card.md` to describe the arrangement value and how a level picks
  it.
  Verify: the section names `arrangementFor` and its inputs; `test/docs.test.ts` passes.

## 3. The simplified arrangement

- [x] 3.1 Give the simplified arrangement its own zone constants for the source (air unit, ground loop, hybrid) and
  the external tank at a uniform scale of about 0.8, with the housing top, ground line and tank dome on the cabinet's
  top line (design D3), and the source zone ending at about x 190 and the tank zone starting at about x 840.
  Verify: unit tests check the top-line rules of outer-loop-source and dhw-storage for the simplified arrangement,
  and that the source and tank pipes still meet their ports.
- [x] 3.2 Build the simplified cabinet contents from the full ones under the monotone maps `fx`, `fy` (design D2):
  cabinet about 620 wide, the bottom band cut to about 40 units under the lowest drawn part, viewBox height to match;
  pressure transducer 38 and its stub get an explicit place above the new bottom edge on the production return side;
  any other override is a named exception with its reason.
  Verify: new invariant tests on the simplified arrangement for every source, DHW storage and model: every part
  inside its zone, no two part boxes overlapping, ports 1-6 in order, every crossing inside the cabinet a hop, the
  crossing count at most `MAX_CROSSINGS`, no crossing outside the cabinet, the probe and HTR placement scenarios of
  schematic-drawing, and the schematic-drawing scenarios "Wider, shorter cabinet", "No empty band" and "Pressure 38
  inside the cabinet". The `detail: full` snapshots pass unchanged, and the simplified snapshots are updated on
  purpose. The compact layout still draws the full arrangement with the simplified filter (design D7), so its
  browser tests pass unchanged.
- [x] 3.3 Labels of the simplified arrangement follow the maps and zone constants (design D6, first half).
  Verify: the existing label-and-component guard (`test/card/overlaps.browser.test.ts`) passes at the current
  `COMPACT_BELOW`.
- [x] 3.4 Emulator check of the drawing: every scenario at 1000 and 640 px in the full layout with no `detail`, for a
  ground loop, an air unit and model C.
  Verify: a subagent captures them and returns a verdict that the cabinet is wider and shorter, the source and tank
  smaller, no parts touch and no pipe is broken or detached; and that `detail: full` captures match the previous
  release.
- [x] 3.5 Document the simplified arrangement in `docs/ecogeo-card.md` (the maps' breakpoints, the zone scale, the
  overrides and why) and the detail level's effect in `README.md`.
  Verify: the docs state the final numbers used in code; `test/readme.test.ts` and `test/docs.test.ts` pass.

## 4. Simplified labels clear of pipes, and the threshold

- [x] 4.1 Show the superheat and the expansion valve opening only at the full detail level (design D5).
  Verify: `npm test` covers live-values "Superheat" and "Simplified leaves out item 12's values" (labels absent at
  the simplified level, valve 12's tap still opens the opening's entity); "Compact refrigerant values" still passes.
- [x] 4.2 Add `SIMPLIFIED_PLACES` for the labels the pipe-aware check still reports (design D6): at least the brine
  outlet and inlet, pump 16's speed, the heating demand and the DG1 setpoint; one reason per entry.
  Verify: `npm run measure-layout -- --pipes` reports zero pairs at the chosen widths in every installation and
  scenario.
  Note: the brine outlet and inlet, pump 16's speed and the DG1 setpoint report no pair from 600 px up on the wider
  cabinet, so they got no place (design D6, settled in group 4). Since 4.3, pipes are the measure script's default
  and `--pipes` is no longer needed.
- [x] 4.3 Switch the browser guard and the measure script's default to the pipe-aware check, re-measure the threshold
  and set `COMPACT_BELOW` (responsive-layout "Compact threshold").
  Verify: `test/card/overlaps.browser.test.ts` passes at the new `COMPACT_BELOW` in Chromium and WebKit, and the new
  value is at most 640 px. If it is not, stop and put the options of design D6 to the user before closing the group.
- [x] 4.4 Emulator check of the labels: the full layout at `COMPACT_BELOW`, 800 and 1000 px for the heating, DHW,
  defrost and passive cooling scenarios with a ground loop, an air unit and model C.
  Verify: a subagent captures them (`threshold-*` and new captures in `dev/captures.ts`) and returns a verdict that
  no value sits on a pipe, a component or another value, and that each value is readable next to its component.
- [x] 4.5 Update `docs/ecogeo-card.md` (the threshold, its measurement with pipes and captions, the simplified places,
  the item 12 values) and `README.md` (which values the simplified level shows).
  Verify: the documented threshold equals `COMPACT_BELOW`; `test/readme.test.ts` and `test/docs.test.ts` pass.

## 5. The compact layout on the simplified arrangement

- [x] 5.1 Add `scripts/search-places.mjs` (`npm run search-places`) on top of `dev/overlaps.ts` (design D7): searches
  the nearest place per key label at 320 px across every scenario and installation, with labels, components, pipes
  and the cabinet outline as obstacles, the `LABEL_SIDES` rule and about 2 px of margin.
  Verify: run on the current compact drawing, it finds places that pass the current compact browser test.
- [x] 5.2 Switch the compact layout to the simplified arrangement and set `COMPACT_PLACES` from the search; add pipes
  to the compact browser guard (responsive-layout "Compact labels clear of pipes").
  Verify: `test/card/overlaps.browser.test.ts` "No overlaps in the compact layout" passes with pipes at 320, 360, 480
  px and just under `COMPACT_BELOW`, and the side check passes; if a label has no place, stop and put the options of
  the design's risks to the user.
  Note: five labels had no place clear of pipes; the user chose to let them lie on a pipe over their plate (design
  D7, settled in group 5; responsive-layout "Compact labels clear of pipes" names them).
- [x] 5.3 Emulator check on phone widths: the `narrow-*` and `phone-*` captures and every scenario at 360 px.
  Verify: a subagent returns a verdict that the compact drawing uses the wider cabinet, no value other than the five
  of `ON_PIPE_COMPACT` sits on a pipe and those read cleanly over their plates, and each Out/In pair reads clearly.
- [x] 5.4 Update "Compact content" in `docs/ecogeo-card.md` (the new places, the search script and how to rerun it).
  Verify: the docs list the places used in code; `test/docs.test.ts` passes.

## 6. Panel view fits the screen

- [x] 6.1 Add `isPanel` as a plain reactive property and the pure drawing-width function (design D9); the card sets the
  `.diagram`'s `max-width`, centres it, recomputes on window resize, and feeds the drawing width to `nextCompact`
  and `strokeWidths`.
  Verify: unit tests cover the width function (panel off; panel with a tall window; panel with a short window;
  unset `--header-height`) and that a card assigned `isPanel` by Home Assistant does not throw; responsive-layout
  "Not a panel" passes in the browser project.
- [x] 6.2 Add `panel=1` to the emulator (URL, control, slot at the window's width) and a panel capture at 1280 x 800
  to `dev/captures.ts` (dev-emulator "Panel view").
  Verify: `dev/url-state` unit tests cover `panel`; a browser test renders the panel card in a 1280 x 800 viewport
  and finds the footer inside it (responsive-layout "Desktop panel").
- [x] 6.3 Emulator check: the panel capture at 1280 x 800 and at 1280 x 1000.
  Verify: a subagent returns a verdict that the footer is on screen and the drawing centred.
- [x] 6.4 Document the panel fit in `docs/ecogeo-card.md` and `README.md` (panel views fit the screen); in the README's
  planned follow-ups, drop `add-extra-circuits` and note extra circuits (DG2, DG3, pool) as a long-term idea, since
  they are external and need their own valves. Refresh the README's images (`docs/images/heating.png`,
  `docs/images/phone-heating.png`) from the emulator, since both show the drawing from before this change.
  Verify: `test/readme.test.ts` and `test/docs.test.ts` pass; the README no longer lists `add-extra-circuits` as planned;
  the images show the simplified arrangement and the new compact places.

## 7. Release and live check

- [x] 7.1 Run `npm run release` and deploy `dist/ecogeo-card.js` with the workspace's deploy command, then bump the
  dashboard resource's `?v=` (ids and current value in `private/installation.md`) and record the deploy there.
  Verify: `check-release` reports the card and editor registered; the deploy reports the upload; the resource shows
  the new `?v=`.
- [x] 7.2 Live check: light screenshots of the Schematic view at desktop (1280 x 800), tablet (768) and phone (390)
  width, and a state check.
  Verify: a subagent returns a verdict that the footer is on screen at desktop width, no value sits on a pipe at any
  width (except, in the compact layout, the five of `ON_PIPE_COMPACT` over their plates), the superheat and expansion valve opening are not shown; no new ecogeo or frontend errors in the system log;
  the dashboard config is unchanged (its hash in `private/installation.md`).

## 8. Label places and a compact threshold for the full level

- [x] 8.1 Give `scripts/measure-layout.mjs` a `--detail=full|simplified` flag (design D11; default simplified) and
  measure the full level with pipes and captions counted.
  Verify: `npm run measure-layout` with no flag still reports 600 px; with `--detail=full` it reports the full level's
  overlaps per width and its most frequent pairs.
  Note: measured in group 8: no threshold up to 800 px; two place conflicts remain at 1000 and 1400 px (design D11).
- [x] 8.2 Add `FULL_PLACES` to `src/diagram/label-places.ts` (design D11), applied to the full arrangement only, one
  reason per entry: first the evaporation temperature clear of exchanger 10 and model C's tank start delta clear of
  tank 54, then the labels the pipe-aware check reports at the narrower widths, until the full level has a threshold at
  most 800 px, as low as the places allow with each value still next to its part. Parts, pipes and crossings of the
  full arrangement do not move. If no place set reaches 800 px, stop and put it to the user.
  Verify: `npm run measure-layout -- --detail=full` reports a threshold at most 800 px and no pair at 1000 px; the
  `detail-full-*` markup snapshots are updated on purpose and differ from the previous ones in value label positions
  only (schematic-drawing "Full level unchanged"); the simplified snapshots pass unchanged.
  Note: 14 places in `FULL_PLACES`; the full level's threshold is 640 px (`COMPACT_BELOW_FULL`), clean from 640 px up to 1400 px; the air unit's Out value against the feed pipe (defrost) keeps 620 px from it.
- [x] 8.3 Add `COMPACT_BELOW_FULL` (the measured value) and `compactBelow(detail)` to `src/lib/layout.ts`; `isCompact`
  and `nextCompact` take the configured detail level, and every caller passes it (the card, the panel fit, the
  emulator, the scripts, the tests).
  Verify: unit tests cover responsive-layout "Full detail switches earlier" and the hysteresis at both thresholds ("No
  flip at the threshold"); `test/card/overlaps.browser.test.ts` runs the full-layout guard at each level's threshold at
  that level, with pipes, in Chromium and WebKit.
- [x] 8.4 Emulator check of the full level: add `threshold-full-*` captures to `dev/captures.ts` (the full layout with
  `detail=full` at `COMPACT_BELOW_FULL`) for the heating, DHW, defrost and passive cooling scenarios with a ground loop,
  an air unit and model C, a `detail=full` capture at 1000 px for the same, and one just under `COMPACT_BELOW_FULL`.
  Verify: a subagent captures them and returns a verdict that at the threshold and at 1000 px no value sits on a pipe,
  a component or another value, each value reads next to its part, and just under the threshold the card is compact.
- [x] 8.5 Document the full level's places and the per-level threshold in `docs/ecogeo-card.md` ("The compact
  threshold": both values, how each is measured, the `--detail` flag; the label places table) and `README.md` (the
  full layout from 600 px, or from `COMPACT_BELOW_FULL` with `detail: full`).
  Verify: the documented thresholds equal `COMPACT_BELOW` and `COMPACT_BELOW_FULL`, and the documented places those in
  code; `test/readme.test.ts` and `test/docs.test.ts` pass.

- [x] 8.6 Fix the group 8 review (design D11, last paragraph): the cabinet outline in `dev/overlaps.ts` for the full
  layout at both levels (`label x cabinet`); at `detail: full` the production Out/In column outside the cabinet's left
  wall with Out and In captions; re-measure both thresholds and update `COMPACT_BELOW_FULL` (and stop if `COMPACT_BELOW`
  would move); a `FULL_PLACES` consistency test like the simplified one; the item numbers in the place reasons; the
  `expansion_valve` place clear of evaporator 7's item number; the docs' account of what remains below the full
  threshold, the Live values table's places per level, the tank 50 row's width, and `src/lib/layout.ts`'s copy note
  naming the `detail` parameter as a deviation.
  Verify: live-values "Full-level production column" has a test; `npm run measure-layout` and
  `npm run measure-layout -- --detail=full` report the documented thresholds with the outline counted; the browser
  guard counts the outline; the `threshold-full-*` and `labels-full-*` captures are checked again by a subagent verdict;
  `npm run check` is green.

## 9. The pre-archive review's findings

- [ ] 9.1 Fix the pre-archive review's findings: `docs/ecogeo-card.md` names `src/diagram/label-places.ts` as where the
  positions live (`labels.ts` renders them); the label "under pressure probe 38" is marked as the full level's (the
  simplified level puts it right of transducer 38); the ground loop's leg columns (x 166 / x 106) are marked as the
  full level's, next to the simplified ones; the tank 50 row's "about 560 px" is marked as measured on the full
  arrangement or re-measured; `src/diagram/source.ts` reads the fan radius from the arrangement instead of its own
  `FAN_RADIUS`; the exports used only in their own module (`Rect`, `ZoneBase`, `deriveZones`, `ArrangementId`, `AxisMap`
  in `geometry.ts`; `PointMap`, `SimplifiedPlace` in `label-places.ts`) are no longer exported.
  Verify: `npm run check` is green and the markup snapshots pass unchanged. Re-check each doc finding against the text as group 8 left it.

## 10. Release the full level's places and threshold

- [ ] 10.1 Run `npm run release`, deploy `dist/ecogeo-card.js` with the workspace's deploy command, bump the dashboard
  resource's `?v=` and record the deploy in `private/installation.md`.
  Verify: `check-release` reports the card and editor registered; the deploy reports the upload; the resource shows
  the new `?v=`.
- [ ] 10.2 Live check: light screenshots of the Schematic view at desktop (1280 x 800) and phone (390) width, and a state
  check.
  Verify: a subagent returns a verdict that the drawing matches the group 7 release (the live card uses the default
  level); no new ecogeo or frontend errors in the system log; the dashboard config is unchanged (its hash in
  `private/installation.md`).

## Workflow follow-up

- Before archiving, one fresh Opus review of the whole change (`openspec/config.yaml`).
- Archive the change and accept its specs.
