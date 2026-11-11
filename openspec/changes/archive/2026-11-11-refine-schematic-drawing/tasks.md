# Tasks

Each group is implemented by one Sonnet subagent, reviewed by Opus and committed alone (see
`openspec/config.yaml`). Every group ends with `npm run check` green and, for visible changes, emulator captures
inspected by an agent that returns a written verdict. Groups 1-3 do not run `npm run release` and leave `dist/`
unchanged.

## 1. Detail level and component info

- [x] 1.1 Add the `detail` option (`simplified` default, `full`) to `src/config/options.ts` and `resolve.ts`, with
  its validation error. Mark the parts and stub pipes of design D1 with `detail: 'full'` in `geometry.ts` and hide
  them in `isDrawn` unless `full`. Render item numbers (components and ports) only with `full`. Run the geometry
  integrity tests at both detail levels.
  Verify: `npm test`, including the card-config "Invalid detail" and schematic-drawing "Simplified refrigerant",
  "Simplified hydraulics", "Default is simplified" and "Full detail" scenarios, and dhw-storage "Simplified model C".
- [x] 1.2 Add `COMPONENT_NAMES` to `src/strings.ts` (manual section 3.1 names, plus the nine connections 1-6 and 47-49) and give
  every component group a `<title>` and `aria-label` of `name (item)` (design D2). Add the component-to-role table
  and make components with a role tappable (`role="button"`, `tabindex="0"`, click/Enter/Space fire
  `hass-more-info`; not in sample mode).
  Verify: `npm test` covers the component-info scenarios: pump tooltip, every component named (model B and C,
  `detail: full`, every feature `true`), tap a pump, no entity (filter dryer 13), sample mode.
- [x] 1.3 Add the detail and exchanger-fill selects to the emulator (the fill select may only be wired in group
  2), mirrored in the URL (`detail=`, `fill=`), and add `detail=full` captures (heating, model C) to
  `dev/captures.ts`.
  Verify: `npm test` (emulator URL-state tests) and dev-emulator "Switch detail".
- [x] 1.4 Emulator verification: `npm run capture`. An agent inspects the default (simplified) heating, DHW,
  defrost, model C and dark captures and the two full-detail captures: no item numbers in simplified, the D1 parts
  gone without dangling pipe ends, full detail identical in parts to before.
  Verify: verdict with no blocking findings.
- [x] 1.5 Update `docs/ecogeo-card.md` (detail levels, the left-out parts table of D1, component tooltips and taps)
  and the README (`detail` option with both values).
  Verify: the sections exist and `test/readme.ts` passes.

## 2. Colours and line weights

- [x] 2.1 Change the default stops in `src/diagram/colors.ts` (design D3). Unit-test the temperature-coloring
  scenarios "Cold brine" (between blue and light blue, closer to blue), "Out of range" and "No green by default"
  (hue of each default stop).
  Verify: `npm test`.
- [x] 2.2 Add the `exchanger_fill` option (`gradient` default, `none`) and the exchanger side fills of design D4:
  `sides` data on exchangers 7, 8, 9, 10, gradients from the entering and leaving segments' states, reversal,
  muting, per-instance gradient ids. Wire the emulator's fill select.
  Verify: `npm test` covers "Condenser while heating", "Idle exchanger", "Fill off", the active-cooling reversal
  on condenser 8 and evaporator 7, the HTR side of exchanger 9, and two cards in one DOM with distinct gradient ids.
- [x] 2.3 Apply the line weights of design D7 (pipes, flow overlay, hops, symbols, cabinet, source and tank
  outlines).
  Verify: `npm test` covers the schematic-drawing "Pipe stroke" scenario from the rendered DOM.
- [x] 2.4 Emulator verification: `npm run capture`. An agent inspects every scenario in light and dark: colours
  follow the new scale, exchanger sides match their pipes (heating, DHW, active cooling, defrost, passive
  cooling), muted exchangers in idle circuits, amber legible on the light card, no label touched by the thicker
  lines, hops still visible.
  Verify: verdict with no blocking findings.
  Note (review round 1): the "Demand" label clears the 3-unit cabinet edge by about 1 unit (1.5 before) and the
  brine label beside `ln3` by about 3.5 units; accepted, no label moved. `add-compact-layout` reworks labels.
- [x] 2.5 Update `docs/ecogeo-card.md` (colour scale table with the new stops, exchanger fills, line weights) and
  the README (`exchanger_fill` option, the default `colors`). Remove the README wording from group 1 that says the
  emulator's fill select takes effect only once the card has the option.
  Verify: the sections exist and `test/readme.ts` passes.

## 3. DHW tank and air unit drawing

- [x] 3.1 Redraw the external tank as a domed cylinder and the coil `dhw_ext_coil` as a helix (design D5: `shape`
  data, front and back halves, overlay on front halves only, crossing-test exemption for the helix's self-overlap
  only). Draw model C's coil 51 with the same helix function.
  Verify: `npm test` covers dhw-storage "External tank", "Helical coil" (at least four turns, front solid, back
  faint, ends on the 5/6 pipes) and "Internal tank", and the existing coil colour, animation and muting tests stay
  green.
- [x] 3.2 Redraw the air unit (design D6): slatted housing, finned coil block (12 or more fins), rounded U-bends on
  the serpentine, a five-bladed fan with ring and hub.
  Verify: `npm test` covers outer-loop-source "Air unit drawing", "Running fan" and "Stopped fan".
- [x] 3.3 Emulator verification: `npm run capture`. An agent inspects the air, hybrid and ground captures, the
  external tank in heating, DHW and HTR recovery, and model C: the helix reads as a coil, its colour and flow
  follow the mode, the air unit reads as a finned coil with a fan, nothing overlaps.
  Verify: verdict with no blocking findings.
- [x] 3.4 Update `docs/ecogeo-card.md` (tank and air unit drawing) and replace `docs/images/heating.png` with the
  new heating capture from `build/captures/`.
  Verify: the section exists and the image shows the new drawing.

## 4. Release and live installation

- [x] 4.1 Run `npm run release`.
  Verify: check-release reports `custom:ecogeo-card` registered and `dist/ecogeo-card.js` is updated.
- [x] 4.2 Deploy `dist/ecogeo-card.js` explicitly (command in `private/installation.md`), then bump the dashboard
  resource to the next `?v=` and record it in `private/installation.md`.
  Verify: the deploy prints UPLOAD with no CONFLICT, and the resource reads the new `?v=`.
- [x] 4.3 Live verification: an agent takes a dashboard screenshot of the schematic view and reads the mapped
  entities' states. It checks the simplified drawing (no item numbers, no safety valves), the exchanger fills
  against the current mode, the tank helix and the air unit, and the HA logs for errors mentioning `ecogeo`.
  Verify: verdict with no mismatches and no log errors.

## 5. Follow-up: tank and compressor

Added 2026-11-11 after the live release, at the user's request (design D8-D10).

- [x] 5.1 Idle coil stroke (D8): a darker muted grey for a muted helix (external coil and coil 51) in the light
  theme only, through a custom property; dark theme unchanged.
  Verify: `npm test` covers dhw-storage "Idle coil in the light theme" (the muted helix stroke differs from and is
  darker than the muted pipe colour in light; equal in dark), and the existing coil colour and muting tests stay
  green.
- [x] 5.2 Tank geometry (D9): right wall inwards so the tank is centred on the coil (width 168), dome apex on
  `CABINET.y`; the coil, the 5/6 pipes and the tank labels follow.
  Verify: `npm test` covers dhw-storage "Tank geometry", and the integrity tests stay green at both detail levels.
- [x] 5.3 Compressor symbol (D10): circle with two straight converging lines, wide at the suction pipe, narrow at
  the discharge pipe, rotated from the geometry.
  Verify: `npm test` covers schematic-drawing "Compressor symbol" (the orientation checked against the suction and
  discharge segments' ends at item 11).
- [x] 5.4 Emulator verification: `npm run capture`. An agent inspects heating (idle coil, light), DHW, dark DHW,
  model C and a full-detail capture: the coil reads on the tank in light, the tank is centred and aligned to the
  cabinet top, the compressor reads as a compressor, nothing overlaps.
  Verify: verdict with no blocking findings.
- [x] 5.5 Update `docs/ecogeo-card.md` (tank, idle coil, compressor symbol) and `docs/images/heating.png`.
  Verify: the sections match the drawing and `test/readme.ts` passes.
- [x] 5.6 Coil-to-pipe joint (D8, added at the user's request after the round 1 review): while muted, the parts of
  `dhw_ext_in` and `dhw_ext_out` inside the tank are drawn again in the coil's muted grey, clipped to the tank body
  (per-card-instance clip-path id), so the grey changes at the tank wall and the joint with the coil is seamless.
  Verify: `npm test` covers the extended "Idle coil in the light theme" scenario (the clipped overlay exists only
  while muted, uses the coil grey and the tank shape, distinct clip ids for two cards); a capture of heating in
  light shows no tone change at the coil's ends; docs updated.
- [x] 5.7 Helix turns and joints (D8a, added at the user's request): back halves drawn first with butt caps, front
  halves on top with round caps, on both helices; coil 51 with closer, rounder turns that fit tank 50.
  Verify: `npm test` covers the draw order and caps on both helices and coil 51's pitch and bulge (geometry data);
  model C captures (DHW active and heating idle, light) and the external tank show clean joints and a compact
  round coil 51 touching nothing.
- [x] 5.8 Model C tank values beside tank 50 (D8b, added at the user's request): with `dhw: internal` the DHW
  labels move from the zone right of the cabinet into tank 50's body, one row above coil 51 (user's choice); with
  `detail: full` the item numbers 50, 51 and 54 move out of that strip.
  Verify: `npm test` covers the label positions (inside the cabinet, next to tank 50, no overlap with drawn parts
  or other labels at both detail levels); model C captures (simplified and full) show them clear of everything.

## 6. Follow-up: outer-loop sources

Added 2026-11-11 after the live release, at the user's request (design D11-D14).

- [x] 6.1 Align the air unit and the ground line to `CABINET.y` (D11); in the hybrid the ground loop moves down
  with the air unit.
  Verify: `npm test` covers outer-loop-source "Source aligned to the cabinet" for air, ground and hybrid.
- [x] 6.2 Ground loop as one U-loop (D12) with a half-circle bottom via `bend`, in ground and hybrid.
  Verify: `npm test` covers outer-loop-source "Single loop" and "Ground source"; integrity and `CROSSINGS` tests
  stay green.
- [x] 6.3 Air unit ports on one side (D13): four passes, inlet and outlet on the coil block's right side, both
  pipes leaving the housing's right wall, routed without crossings (or a declared hop only if unavoidable); the
  hybrid link leaves from the outlet port.
  Verify: `npm test` covers outer-loop-source "Air unit drawing" (even passes, at least four) and "Air unit ports"
  (geometry part), "Running fan", "Stopped fan"; integrity tests green.
- [x] 6.4 Source port labels (D14): In and Out at the air unit's ports and at the ground loop's legs, captions from
  the device's point of view; the hybrid shows only the air unit's In and the ground loop's Out (no air unit Out,
  user's decision); the air unit outlet label leaves the housing's label stack.
  Verify: `npm test` covers outer-loop-source "Air unit ports" (labels), "Single loop" (labels) and "Hybrid".
- [x] 6.5 Emulator verification: `npm run capture`. An agent inspects the air, ground and hybrid captures (light and
  dark, heating and passive cooling or defrost): sources aligned to the cabinet top, the U-loop, the air unit ports
  on one side, the port labels legible and touching nothing.
  Verify: verdict with no blocking findings.
- [x] 6.6 Update `docs/ecogeo-card.md` (sources: alignment, U-loop, air unit ports, port labels) and the README
  where it describes the sources' labels.
  Verify: the sections match the drawing and `test/readme.ts` passes.

## 7. Release the follow-up fixes

- [x] 7.1 Run `npm run release`.
  Verify: check-release reports `custom:ecogeo-card` registered and `dist/ecogeo-card.js` is updated.
- [x] 7.2 Deploy `dist/ecogeo-card.js` explicitly (command in `private/installation.md`), then bump the dashboard
  resource to the next `?v=` and record it in `private/installation.md`.
  Verify: the deploy prints UPLOAD with no CONFLICT, and the resource reads the new `?v=`.
- [x] 7.3 Live verification (light screenshots only: a dark-mode screenshot changes the account's saved theme): the
  idle coil, the centred and aligned tank, the compressor symbol, the air unit ports and port labels against the
  entity states, and the HA logs for errors mentioning `ecogeo`.
  Verify: verdict with no mismatches and no log errors.

## Workflow follow-up

- Before archive: one fresh Opus review of the whole change, then `/opsx:archive refine-schematic-drawing`.
- Then `/opsx:apply add-compact-layout`; its `card-config` delta builds on this change's archived spec.
