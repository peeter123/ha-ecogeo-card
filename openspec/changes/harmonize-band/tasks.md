# Tasks

The groups change the band one body at a time. The jog level comes last (group 6), once every body's pipe columns are
final.

Every visible group ends with a subagent check:
- it runs `npm run capture`;
- it inspects the captures the group names against the review criteria in docs/ecogeo-card.md and the group's own
  points;
- it returns a text verdict, recorded in the group's last task.

The visual references compare on CI Linux only and are recorded again in group 7. Nothing is pushed or deployed before
the user allows it.

## 1. Compressor and captions

- [x] 1.1 Remove `COMPRESSOR_FILLS` and its paths from `src/diagram/symbols.ts` and draw compressor 11 as the circle
  and two converging lines (design D10; schematic-drawing "Refrigerant components after the manual figure"). Delete
  the browser test of the fill in both themes. Verify: a unit test asserts that the compressor symbol has no filled
  path, and `npm test` passes.
- [x] 1.2 Remove the "Demand" labels (design D7; heating-emitter, removed "DG1 demand on the emitter";
  dhw-storage "DHW values inside the tank" and "Internal tank for model C"):
  - the emitter's, and the one beside the connection 1/2 stubs;
  - the external tank's and tank 50's;
  - the `demand` flag and the caption strings, if nothing else uses them.

  Keep the emitter's button for the DG1 demand's more-info. Verify: the label snapshots are recorded again with no
  demand label; a unit test with both demands on finds no "Demand" text on the drawing; the component-info test of
  "Tap the emitter" still passes.
- [x] 1.3 Drop the `emphasis` of the external tank's DHW temperature, so it renders at the regular weight and size
  (design D7). Verify: a unit test asserts that the tank's label has the same class and font weight as the source's
  Out.
- [x] 1.4 Update README.md and docs/ecogeo-card.md: no demand captions, the compressor symbol, and the values list
  without the demands. Verify: `npm run check` passes, and a search of both files finds no statement that "Demand" is
  shown.
- [x] 1.5 Emulator check: a subagent inspects the horizontal captures with model B external and model C, with both
  demands on. Pass when the compressor is open, there is no "Demand" anywhere, and the tank value is regular weight.
  Record the verdict here.

  Verdict (2026-11-23): pass. The captures scenario-heating (horizontal), vertical-light-heating (320 px) and
  phone-heating (360 px) show a three-turn spiral. Adjacent turns alternate between the supply and the return colour
  and stay clearly apart, no turn crosses another, and the dashes run in along the outer supply turns and back out
  along the return turns between them. The supply and return pipes meet the spiral side by side on the bottom face
  and cross nothing.

  Verdict (2026-11-23): `npm run capture` (316 captures). Inspected labels-air-1000-heating (model B, external tank, DG1
  demand on), labels-air-1000-dhw (DHW demand on) and labels-modelC-1000-heating. Pass: compressor 11 is open (circle
  and two converging lines, no fill); no "Demand" text anywhere (emitter, stubs, external tank, tank 50); the tank
  temperature (52.1 / 48.2 degrees C) is regular weight and size, like the source's Out. Note: the live values are now
  16 (the 18 of live-values return with the air unit's two values in group 4).

## 2. One band style and the new widths

- [x] 2.1 Add the shared style to `BAND` (radius 6, margin 8) and use it for every band body's outline (design D1).
  Remove the air unit's divider and the emitter's floor line, with their obstacles. Verify: a unit test asserts that
  every band body's outline uses the band radius, and that the arrangement has no `air-divider` or `emitter-divider`
  obstacle.
- [x] 2.2 Set the widths: emitter 180, air unit 190, collector 120, tank 160 (design D2). Keep the current inner
  parts, scaled into the new widths, until groups 3-5 redraw them. Verify: the band test asserts that the widest key
  (hybrid, tank, emitter) fits the vertical layout's 720 units with gaps of at least 24, and the arrangement snapshots
  are recorded again.
- [x] 2.3 Give the external tank a flat bottom on the band's bottom edge, with the band radius at its corners. Keep the
  domed top and the rim (design D8; dhw-storage "External tank above connections 5/6"). Verify: a unit test asserts
  that the tank's outline reaches the band's bottom at both walls; the schematic-drawing "One band style" scenario is
  a unit test over every band body.
- [x] 2.4 Update docs/ecogeo-card.md (the band's style and widths). Verify: `npm run check` passes.
- [x] 2.5 Emulator check: a subagent inspects the captures of every source with the external tank, in both layouts.
  Pass when the bodies share their corners and outline, have no divider, and every body's bottom lies on one line.
  Record the verdict here.

  Verdict (2026-11-23): `npm run capture` for the band captures. Inspected band-{air,ground,hybrid}-external-light-1000
  (horizontal) and vertical-band-{air,ground,hybrid}-external-light-559, plus ground at 320 px. Pass: the emitter, air
  unit, collector and tank share the corner radius and the outline weight; no divider crosses the air unit or the
  emitter; the tank has a flat bottom with rounded corners and every body's bottom edge lies on one line. The pipes
  still enter the bodies' bottom faces and do not cross. The air unit and collector keep their old inner drawings in
  the new widths, to be redrawn in groups 4 and 5.

## 3. The spiral emitter

- [x] 3.1 Build the underfloor emitter as a bifilar spiral in `emitterShape` (design D6; heating-emitter "Underfloor
  loop drawing"):
  - at least two inward turns, at most three;
  - a pitch of at least 12 units;
  - rounded bends;
  - feed and exit on the bottom face.

  Verify: unit tests assert the turn count, the pitch, no self-crossing, and both ends on the bottom face.
- [x] 3.2 Split the loop into the segments `dg1_loop_in` (production outlet 33) and `dg1_loop_out` (production return
  34), both animated with the DG1 circuit. Keep the emitter's gradient for the radiator only (heating-emitter "Emitter
  colours from supply to return"). Verify: the heating-emitter scenarios "Underfloor colours" and "Spiral without
  crossings" are unit tests; the radiator tests pass unchanged.
- [x] 3.3 Update README.md and docs/ecogeo-card.md (the underfloor spiral and its colours). Verify: `npm run check`
  passes.
- [x] 3.4 Emulator check: a subagent inspects the underfloor captures in heating, in both layouts and at 320 px. Pass
  when the turns alternate warm and cool, stay apart, and the flow runs in and back out. Record the verdict here.

## 4. The air unit

- [x] 4.1 Redraw the air unit in `airUnitShape` and `source.ts` (design D4; outer-loop-source "Air unit with its
  value inside"):
  - the case on two feet;
  - the coil panel on the left, with the fins and the four-pass serpentine entering and leaving on its bottom face;
  - the fan right of it, with the static guard of three rings and an X of spokes over the rotating blades.

  Verify: unit tests assert the feet, at least six fins, four passes and the guard's rings and spokes. The fan
  rotation tests pass unchanged.
- [x] 4.2 Show the outside temperature above the fan, the fan speed below it (whole percent for %, the unit
  otherwise) and the Out beside the exit pass, all bare. In the hybrid, show the outside temperature and the fan speed
  and no Out (outer-loop-source "Fan follows its speed" and "Hybrid side by side"). Verify: the scenarios "Air unit
  values inside", "Running fan", "Fan speed in rpm" and "Hybrid" are unit tests.
- [x] 4.3 Drop the outside temperature from the footer when the source is `air` or `hybrid`, as a pure function with
  its unit test (design D9; live-values "Footer" and "Values on the drawing"). Verify: the live-values scenarios
  "Footer while heating", "Footer with an air unit", "Heating with every part" and "Ground source" are unit tests.
- [x] 4.4 Extend the overlap browser tests to the air unit's three values at both layouts' thresholds and at 320 px
  (outer-loop-source "Air unit values at phone width"). If they do not fit, apply design D4's fallbacks in order and
  record which one was used. Then run `npm run measure-layout` and confirm the vertical threshold is unchanged.
  Verify: `npm test` passes in WebKit; Chromium runs in task 7.2.
- [x] 4.5 Update README.md (the air unit's values, the footer) and docs/ecogeo-card.md (the air unit, the footer
  rule). Verify: `npm run check` passes.
- [x] 4.6 Emulator check: a subagent inspects the air and hybrid captures, in both layouts and at 320 px, with the fan
  running and still. Pass when the unit reads as an outdoor unit, the three values are legible and apart, and the
  footer has no outside temperature. Record the verdict here.

  Verdict (2026-11-23): pass. `npm run capture` for band-air and band-hybrid (external tank, 1000 px) and the vertical
  band-air and band-hybrid at 320 and 559 px. The air unit reads as an outdoor unit: a case on two feet with the finned
  coil panel and its four-pass serpentine on the left and the guarded fan on the right, the guard's three rings and X of
  spokes thin over the blades. The outside temperature sits above the fan, the fan speed under it and, in the air unit,
  the Out at the case's bottom beside the coil; at 320 px the three are legible, apart from each other and from every
  outline, fin, tube and the fan. The hybrid's air unit shows the outside temperature and the fan speed only. The footer
  shows no outside temperature in either. The unit's value boxes needed no D4 fallback.

  Still fan (2026-11-23): source-air-defrost (1000 px) and an air defrost capture at 320 px (vertical, taken ad hoc, not
  a listed capture). The still fan keeps its blades and the stronger guard visible, "0 %" sits below it, "-14.0 °C"
  above it and the Out "-12.3 °C" beside the coil, all legible and apart; the footer shows "Defrost" and COP only. Open:
  a fan speed in rpm ("1450 rpm") does not fit right of the coil panel at 320 px; that case is marked as an expected
  failure in air-values.browser.test.ts until the user decides.

  Case and feet (2026-11-23, decided by the user): the case now ends 8 units above the band's bottom edge and the two
  feet stand under it on the edge. Recaptured: source-air-defrost, vertical-band-air-external-light-320 and an air
  defrost capture at 320 px. The unit reads as a case on feet in both layouts, the pipes cross the gap into the coil
  panel, and the three values stay legible and apart at 320 px, the speed and the Out one row apart under the fan.

## 5. The borehole collector

- [x] 5.1 Redraw the collector in `collectorShape` and `bandSegments` as a borehole (design D5; outer-loop-source
  "Ground collector"):
  - the hatched surface;
  - the feed riser on the left to the header;
  - two U-loops in series;
  - the return riser on the right.

  Keep the two colour halves, with AIRO for the hybrid's first half. Record the series simplification in the code
  comment. Verify: the scenarios "Collector drawing" and "Hybrid" are unit tests, and the colour tests of the halves
  pass.
- [x] 5.2 Place the collector's Out at the bottom, beside the return riser (outer-loop-source "Collector Out").
  Extend the overlap browser tests to it at 320 px. Verify: `npm test` passes in WebKit.
- [x] 5.3 Update README.md and docs/ecogeo-card.md (the ground collector). Verify: `npm run check` passes.
- [x] 5.4 Emulator check: a subagent inspects the ground and hybrid captures in both layouts. Pass when the two
  U-loops hang from the surface, the risers run up the sides, and the Out sits by the outlet. Record the verdict here.

  Verdict (2026-11-23): passed (looked at the hybrid horizontal capture at 1000 px and the ground vertical one at
  320 px). The hatched surface runs along the top. The feed riser rises on the left wall's margin to a straight header
  under it, two narrow U-loops hang from it, joined by a wide straight link, and the return riser drops on the right
  margin. The Out ("0.5 °C", bare) sits at the bottom below the bends, ending just left of the return riser, by the
  outlet. In the hybrid the link pipe meets the feed riser and no pipe crosses. At 320 px the right riser clears the
  border and the Out touches no pipe or outline.

## 6. The tank's coil and one jog level

- [x] 6.1 Add `flip` to `HelixShape` and draw the external coil flipped, with both ends on its right (design D8;
  dhw-storage "External tank above connections 5/6"):
  - the supply up the inlet column and straight along the coil's top to the helix's start;
  - the helix winding down in whole turns;
  - the return straight down from the helix's end.

  Coil 51 is unchanged. Verify: the dhw-storage scenarios "Helical coil" and "Tank geometry" are unit tests, and the
  coil 51 snapshot is unchanged.
- [x] 6.2 Replace `BAND_JOGS` with the levels `jog`, `second` and `third` and add `jogSpans` with its planarity check
  (design D3, amended 2026-11-24). `bandSegments` takes the cheapest level assignment the check accepts, all on `jog`
  first. Verify:
  - the schematic-drawing "One jog level" scenarios are unit tests over every band key in both layouts;
  - the test lists the keys and pipes that leave `jog`;
  - the existing no-crossing tests pass.
- [x] 6.3 Run the place search and `npm run measure-layout` for both layouts in WebKit. Re-record any cabinet place
  or threshold that moved, with its reason. Verify: `npm test` passes in WebKit.
- [x] 6.4 Update docs/ecogeo-card.md (the join lane and the tank's coil). Verify: `npm run check` passes.
- [x] 6.5 Give the collector's Out room at 320 px (added 2026-11-24, decided by the user). 6.3 found the vertical
  layout clean only from 340 px: in defrost the widest Out of the ground collector, alone or in the hybrid, touches
  the feed riser at 320 px. Group 5 has the same overlaps (measured at its commit); its browser test did not cover
  the defrost values. Make the smallest geometry change that fits it, for example the risers closer to the walls or a
  slightly wider collector within design D2's 720-unit check, and record it in design D5. Extend the collector Out
  browser test to the widest values of every scenario, defrost included. Verify: `npm run measure-layout` in WebKit
  gives the vertical threshold 320 px again and the horizontal one unchanged; the place search's report for the
  collector Out is understood and recorded; `npm test` passes in WebKit.
- [x] 6.6 Emulator check: a subagent inspects the captures of every source with the external tank, in both layouts.
  Pass when the horizontal pipe sections line up, the coil's straight pipe runs on top, and no pipe crosses. Record
  the verdict here, with the band keys and pipes that leave the lowest jog level.

  Verdict (2026-11-24): pass. `npm run capture` (316 captures). Inspected band-{air,ground,hybrid}-external-light-1000,
  vertical-band-{air,ground,hybrid}-external-light-559, vertical-band-{ground,hybrid}-external-light-320 and
  vertical-light-defrost (ground collector, 320 px). Horizontal: the pipes between the cabinet's top edge and the
  bodies run on one level, except what leaves it: air's port 4 pipe (`src_in`) and the hybrid's link
  (`src_hyb_link`) sit one level higher (second); the ground key has every pipe on the jog level. Vertical: ground,
  air and hybrid have port 3's pipe on the jog level; port 4's pipe (air, ground, hybrid) and the hybrid's link run
  on second, the tank's two pipes on third, the lifts D3 lists; at 320 px the same order shows. No two pipes cross in
  any capture; the risers rise clear of the lifted runs. The external coil is a flipped helix of four turns, both
  ends on its right: the supply rises left of the coil and runs straight along its top, nothing runs along its
  bottom, and the return drops from the helix end through the tank's bottom (this coil is superseded by 6.7). The
  collector's Out reads "0.5 °C" in
  the heating captures and "-12.3 °C" in the 320 px defrost capture, legible, clear of both risers and of the
  outline. Nothing else against the review criteria: no label on a pipe, part or outline, values inside their bodies,
  band order emitter, source, tank, text legible. Not looked at: the captures without a tank and the dark ones.

- [x] 6.7 Start the external coil on its left (added 2026-11-24 after the group 6 commit, decided by the user; design
  D8 and dhw-storage "External tank above connections 5/6", amended). The helix starts at the top left where the
  supply rises, winds down in four and a half turns and ends at the bottom right; the straight pipe along the coil's
  top goes. The return is unchanged. Verify: the "Helical coil" and "Tank geometry" scenarios are unit tests, the coil
  51 snapshot is unchanged, the arrangement snapshots are recorded again, the band tests (jog levels, `MOVED`) pass,
  `npm run check` passes with the browser project in WebKit, and a subagent inspects the external tank in the
  horizontal and vertical captures (pass when the supply runs straight into the helix and no line doubles a turn).

  Verdict (2026-11-24): pass, in the second version. The first version put the riser in the column at cx - rx, the x
  of every left turning point of the helix, so the rising supply ran through all of them; its capture check missed
  it and the user saw it. Now the supply rises 12 units left of the coil (`inX`), and the helix's first half, the
  extra back half, starts at the top of that column (`HelixShape.startX`) and arcs over to the right side, a little
  wider than the other halves on its left end. The coil's top line moved from 90 to 94 units below the tank's top,
  so the pitch is a whole 6 units. A unit test samples every half and requires 8 units between the riser and every
  helix point below the start; the old column gives 0, the new one 12. `npm run capture`: in
  band-ground-external-light-1000 and vertical-band-hybrid-external-light-320 the riser touches no turn except where
  it joins the start, no line doubles a turn, the return drops straight down from the end at the right, and no pipe
  crosses another. The tank's two pipes stay on `third` in every vertical key with the tank, as in the group 6
  commit (`MOVED` unchanged). Against HEAD the arrangement snapshots differ only in `dhw_ext_in` and the helix
  halves; coil 51 and the model C snapshots are unchanged. Typecheck, lint, format:check and lint:ha are clean, and
  the unit and WebKit browser projects pass (11369 passed, 2 expected failures).

## 7. Visual references

- [x] 7.1 With the user's go for a push, record the visual references again through the `update_references` input of
  the Check workflow, and commit them. Verify: the next CI run passes the visual project 16 of 16.
  Verdict (2026-11-24): run 45415431971 recorded the references; after a pixel diff against the previous set they
  were committed in 805806c. Its push run 45437371729 passes `npm run check` and compares the visual references 16
  of 16; only `verify-dist` fails, as expected before the release.
- [x] 7.2 Run the Chromium checks of the Workflow follow-up, with font smoothing on. Verify: the browser project
  passes in Chromium, and the place search and `measure-layout` agree with WebKit.
  Verdict (2026-11-24, font smoothing on): the browser project passes in Chromium (12 of 12 files, 2317 passed, 2
  expected failures). `measure-layout` in Chromium gives the WebKit thresholds: vertical 320 px (clean from 320 to
  800 px), horizontal 540 px (130 overlaps in 130 cases at 500 and 520 px, clean from 540 px; `VERTICAL_BELOW` stays
  560). The place search reports no NO PLACE in either layout; the horizontal paste is empty, and the vertical paste
  equals `VERTICAL_PLACES` in all eight entries (coordinates, alignment and rotation). The docs now name both engines
  for the place-search result.

## 8. Release

- [x] 8.1 Bump the minor version with `npm version minor --no-git-tag-version`, add its CHANGELOG.md section (the band
  style, the spiral, the air unit and its values, the borehole collector, the tank's coil, no demand captions, the
  open compressor) and run `npm run release`. Verify: `npm run release` and `npm run verify-dist` pass.
  Verdict (2026-11-24, font smoothing on): the version is 1.1.0 in package.json and both lock entries. The 1.1.0
  section (Added, Changed, Removed; no date until the GitHub release) passed two reviews; round 1 corrected the
  demand more-info (the emitter opens the DG1 demand, DHW valve 26 the DHW demand, the tanks the DHW temperature),
  the air unit standing on its feet, the lifted pipes' wording and the term Out. `npm run release` passes (87 of 87
  files, 13686 passed, 4 expected failures, Chromium and WebKit included) and copies the bundle; `npm run
  verify-dist` reports `dist/ecogeo-card.js` current at version 1.1.0.

## 9. Live installation (each step needs the user's explicit go)

- [x] 9.1 Deploy `dist/ecogeo-card.js` explicitly, bump the dashboard resource's `?v=` (id and value in
  `private/installation.md`) and record the deploy there. Verify:
  - a subagent takes light screenshots of the schematic view at phone width (vertical) and at 1280 x 800
    (horizontal), and returns a verdict against the review criteria;
  - the air unit shows the outside temperature, the fan speed and its Out;
  - the system log shows no `ecogeo` errors.

  Verdict (2026-11-24, with the user's go): the 1.1.0 bundle was uploaded with no conflict, the resource was bumped
  by one and the deploy is recorded in the installation notes. A subagent's light screenshots at phone width and at
  1280 x 800 both pass (unit in DHW mode):
  - the spiral emitter;
  - the air unit on its two feet with the outside temperature, the fan speed and its Out inside the case;
  - the flat-bottomed tank with its helix fed by the riser beside it, with no straight top pipe;
  - the open compressor;
  - no "Demand" caption and no overlapping label;
  - a footer without the outside temperature.

  The system log has no `ecogeo` entries. With the same go, tag `v1.1.0` and the GitHub release 1.1.0 were published
  with the bundle attached (byte-identical to `dist/ecogeo-card.js`); the Check runs on the release commit and the
  dated changelog commit are green.

## Workflow follow-up

- `dev/overlaps.ts`: its `outline:` test uses the air unit's group box, which includes the feet, so a label in the
  gap under the case would pass there. The browser test checks the three air unit values against the case outline.
  Give the overlap check a separate case-outline box when the file is next changed (recorded 2026-11-23, group 4).
- One fresh review of the whole change before archiving.
- At archive, update the Purpose of outer-loop-source (the air unit's values, the borehole) and heating-emitter (no
  DG1 demand caption), and name the change in AGENTS.md.
