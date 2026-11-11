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

- [ ] 4.1 Run `npm run release`.
  Verify: check-release reports `custom:ecogeo-card` registered and `dist/ecogeo-card.js` is updated.
- [ ] 4.2 Deploy `dist/ecogeo-card.js` explicitly (command in `private/installation.md`), then bump the dashboard
  resource to the next `?v=` and record it in `private/installation.md`.
  Verify: the deploy prints UPLOAD with no CONFLICT, and the resource reads the new `?v=`.
- [ ] 4.3 Live verification: an agent takes a dashboard screenshot of the schematic view and reads the mapped
  entities' states. It checks the simplified drawing (no item numbers, no safety valves), the exchanger fills
  against the current mode, the tank helix and the air unit, and the HA logs for errors mentioning `ecogeo`.
  Verify: verdict with no mismatches and no log errors.

## Workflow follow-up

- Before archive: one fresh Opus review of the whole change, then `/opsx:archive refine-schematic-drawing`.
- Then `/opsx:apply add-compact-layout`; its `card-config` delta builds on this change's archived spec.
