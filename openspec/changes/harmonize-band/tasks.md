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

- [ ] 1.1 Remove `COMPRESSOR_FILLS` and its paths from `src/diagram/symbols.ts` and draw compressor 11 as the circle
  and two converging lines (design D10; schematic-drawing "Refrigerant components after the manual figure"). Delete
  the browser test of the fill in both themes. Verify: a unit test asserts that the compressor symbol has no filled
  path, and `npm test` passes.
- [ ] 1.2 Remove the "Demand" labels (design D7; heating-emitter, removed "DG1 demand on the emitter";
  dhw-storage "DHW values inside the tank" and "Internal tank for model C"):
  - the emitter's, and the one beside the connection 1/2 stubs;
  - the external tank's and tank 50's;
  - the `demand` flag and the caption strings, if nothing else uses them.

  Keep the emitter's button for the DG1 demand's more-info. Verify: the label snapshots are recorded again with no
  demand label; a unit test with both demands on finds no "Demand" text on the drawing; the component-info test of
  "Tap the emitter" still passes.
- [ ] 1.3 Drop the `emphasis` of the external tank's DHW temperature, so it renders at the regular weight and size
  (design D7). Verify: a unit test asserts that the tank's label has the same class and font weight as the source's
  Out.
- [ ] 1.4 Update README.md and docs/ecogeo-card.md: no demand captions, the compressor symbol, and the values list
  without the demands. Verify: `npm run check` passes, and a search of both files finds no statement that "Demand" is
  shown.
- [ ] 1.5 Emulator check: a subagent inspects the horizontal captures with model B external and model C, with both
  demands on. Pass when the compressor is open, there is no "Demand" anywhere, and the tank value is regular weight.
  Record the verdict here.

## 2. One band style and the new widths

- [ ] 2.1 Add the shared style to `BAND` (radius 6, margin 8) and use it for every band body's outline (design D1).
  Remove the air unit's divider and the emitter's floor line, with their obstacles. Verify: a unit test asserts that
  every band body's outline uses the band radius, and that the arrangement has no `air-divider` or `emitter-divider`
  obstacle.
- [ ] 2.2 Set the widths: emitter 180, air unit 190, collector 120, tank 160 (design D2). Keep the current inner
  parts, scaled into the new widths, until groups 3-5 redraw them. Verify: the band test asserts that the widest key
  (hybrid, tank, emitter) fits the vertical layout's 720 units with gaps of at least 24, and the arrangement snapshots
  are recorded again.
- [ ] 2.3 Give the external tank a flat bottom on the band's bottom edge, with the band radius at its corners. Keep the
  domed top and the rim (design D8; dhw-storage "External tank above connections 5/6"). Verify: a unit test asserts
  that the tank's outline reaches the band's bottom at both walls; the schematic-drawing "One band style" scenario is
  a unit test over every band body.
- [ ] 2.4 Update docs/ecogeo-card.md (the band's style and widths). Verify: `npm run check` passes.
- [ ] 2.5 Emulator check: a subagent inspects the captures of every source with the external tank, in both layouts.
  Pass when the bodies share their corners and outline, have no divider, and every body's bottom lies on one line.
  Record the verdict here.

## 3. The spiral emitter

- [ ] 3.1 Build the underfloor emitter as a bifilar spiral in `emitterShape` (design D6; heating-emitter "Underfloor
  loop drawing"):
  - at least two inward turns, at most three;
  - a pitch of at least 12 units;
  - rounded bends;
  - feed and exit on the bottom face.

  Verify: unit tests assert the turn count, the pitch, no self-crossing, and both ends on the bottom face.
- [ ] 3.2 Split the loop into the segments `dg1_loop_in` (production outlet 33) and `dg1_loop_out` (production return
  34), both animated with the DG1 circuit. Keep the emitter's gradient for the radiator only (heating-emitter "Emitter
  colours from supply to return"). Verify: the heating-emitter scenarios "Underfloor colours" and "Spiral without
  crossings" are unit tests; the radiator tests pass unchanged.
- [ ] 3.3 Update README.md and docs/ecogeo-card.md (the underfloor spiral and its colours). Verify: `npm run check`
  passes.
- [ ] 3.4 Emulator check: a subagent inspects the underfloor captures in heating, in both layouts and at 320 px. Pass
  when the turns alternate warm and cool, stay apart, and the flow runs in and back out. Record the verdict here.

## 4. The air unit

- [ ] 4.1 Redraw the air unit in `airUnitShape` and `source.ts` (design D4; outer-loop-source "Air unit with its
  value inside"):
  - the case on two feet;
  - the coil panel on the left, with the fins and the four-pass serpentine entering and leaving on its bottom face;
  - the fan right of it, with the static guard of three rings and an X of spokes over the rotating blades.

  Verify: unit tests assert the feet, at least six fins, four passes and the guard's rings and spokes. The fan
  rotation tests pass unchanged.
- [ ] 4.2 Show the outside temperature above the fan, the fan speed below it (whole percent for %, the unit
  otherwise) and the Out beside the exit pass, all bare. In the hybrid, show the outside temperature and the fan speed
  and no Out (outer-loop-source "Fan follows its speed" and "Hybrid side by side"). Verify: the scenarios "Air unit
  values inside", "Running fan", "Fan speed in rpm" and "Hybrid" are unit tests.
- [ ] 4.3 Drop the outside temperature from the footer when the source is `air` or `hybrid`, as a pure function with
  its unit test (design D9; live-values "Footer" and "Values on the drawing"). Verify: the live-values scenarios
  "Footer while heating", "Footer with an air unit", "Heating with every part" and "Ground source" are unit tests.
- [ ] 4.4 Extend the overlap browser tests to the air unit's three values at both layouts' thresholds and at 320 px
  (outer-loop-source "Air unit values at phone width"). If they do not fit, apply design D4's fallbacks in order and
  record which one was used. Then run `npm run measure-layout` and confirm the vertical threshold is unchanged.
  Verify: `npm test` passes in WebKit; Chromium runs per the Workflow follow-up.
- [ ] 4.5 Update README.md (the air unit's values, the footer) and docs/ecogeo-card.md (the air unit, the footer
  rule). Verify: `npm run check` passes.
- [ ] 4.6 Emulator check: a subagent inspects the air and hybrid captures, in both layouts and at 320 px, with the fan
  running and still. Pass when the unit reads as an outdoor unit, the three values are legible and apart, and the
  footer has no outside temperature. Record the verdict here.

## 5. The borehole collector

- [ ] 5.1 Redraw the collector in `collectorShape` and `bandSegments` as a borehole (design D5; outer-loop-source
  "Ground collector"):
  - the hatched surface;
  - the feed riser on the left to the header;
  - two U-loops in series;
  - the return riser on the right.

  Keep the two colour halves, with AIRO for the hybrid's first half. Record the series simplification in the code
  comment. Verify: the scenarios "Collector drawing" and "Hybrid" are unit tests, and the colour tests of the halves
  pass.
- [ ] 5.2 Place the collector's Out at the bottom, beside the return riser (outer-loop-source "Collector Out").
  Extend the overlap browser tests to it at 320 px. Verify: `npm test` passes in WebKit.
- [ ] 5.3 Update README.md and docs/ecogeo-card.md (the ground collector). Verify: `npm run check` passes.
- [ ] 5.4 Emulator check: a subagent inspects the ground and hybrid captures in both layouts. Pass when the two
  U-loops hang from the surface, the risers run up the sides, and the Out sits by the outlet. Record the verdict here.

## 6. The tank's coil and one jog level

- [ ] 6.1 Add `flip` to `HelixShape` and draw the external coil flipped, with both ends on its right (design D8;
  dhw-storage "External tank above connections 5/6"):
  - the supply up the inlet column and straight along the coil's top to the helix's start;
  - the helix winding down in whole turns;
  - the return straight down from the helix's end.

  Coil 51 is unchanged. Verify: the dhw-storage scenarios "Helical coil" and "Tank geometry" are unit tests, and the
  coil 51 snapshot is unchanged.
- [ ] 6.2 Replace `BAND_JOGS` with one jog level per layout and add `jogSpans` with its planarity check (design D3).
  The tank's pipes use the second level only for the band keys the check reports. Verify:
  - the schematic-drawing "One jog level" scenarios are unit tests over every band key in both layouts;
  - the test lists the keys that use the tank's level;
  - the existing no-crossing tests pass.
- [ ] 6.3 Run the place search and `npm run measure-layout` for both layouts in WebKit. Re-record any cabinet place
  or threshold that moved, with its reason. Verify: `npm test` passes in WebKit.
- [ ] 6.4 Update docs/ecogeo-card.md (the join lane and the tank's coil). Verify: `npm run check` passes.
- [ ] 6.5 Emulator check: a subagent inspects the captures of every source with the external tank, in both layouts.
  Pass when the horizontal pipe sections line up, the coil's straight pipe runs on top, and no pipe crosses. Record
  the verdict, and the band keys with a second tank level, here.

## 7. Visual references

- [ ] 7.1 With the user's go for a push, record the visual references again through the `update_references` input of
  the Check workflow, and commit them. Verify: the next CI run passes the visual project 16 of 16.
- [ ] 7.2 Run the Chromium checks of the Workflow follow-up, with font smoothing on. Verify: the browser project
  passes in Chromium, and the place search and `measure-layout` agree with WebKit.

## 8. Release

- [ ] 8.1 Bump the minor version with `npm version minor --no-git-tag-version`, add its CHANGELOG.md section (the band
  style, the spiral, the air unit and its values, the borehole collector, the tank's coil, no demand captions, the
  open compressor) and run `npm run release`. Verify: `npm run release` and `npm run verify-dist` pass.

## 9. Live installation (each step needs the user's explicit go)

- [ ] 9.1 Deploy `dist/ecogeo-card.js` explicitly, bump the dashboard resource's `?v=` (id and value in
  `private/installation.md`) and record the deploy there. Verify:
  - a subagent takes light screenshots of the schematic view at phone width (vertical) and at 1280 x 800
    (horizontal), and returns a verdict against the review criteria;
  - the air unit shows the outside temperature, the fan speed and its Out;
  - the system log shows no `ecogeo` errors.

## Workflow follow-up

- Chromium on the development host: while an RDP session runs with font smoothing off, the Chromium browser run stops
  at the preflight. Browser checks run in WebKit until then, and group 7 repeats them in Chromium.
- One fresh review of the whole change before archiving.
- At archive, update the Purpose of outer-loop-source (the air unit's values, the borehole) and heating-emitter (no
  DG1 demand caption), and name the change in AGENTS.md.
- The GitHub release and tag of the new version only on the user's explicit request.
