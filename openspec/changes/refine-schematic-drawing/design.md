# Design

## Context

The drawing is built from data: `src/diagram/geometry.ts` holds components `{ item, kind, x, y, rotation, tag,
feature?, dhw?, source? }` and segments `{ id, circuit, points, temperatureRole, speedRole?, direction, stub?,
through?, bypass?, onlyWhen?, reversible? }` in a 1000 x 620 viewBox. `isDrawn` decides visibility from the
context (model, dhw, source, features); integrity tests check endpoints, crossings and feature removal for every
combination. `pipes.ts` turns each segment into a state (colour, muted, animated, `--flow-duration`, reversed);
`cabinet.ts`, `source.ts` and `dhw.ts` render; `symbols.ts` draws each kind at the origin. Item numbers are drawn
from each component's `tag` offset. See proposal.md for the motivation.

## Goals / Non-Goals

**Goals:**
- Every visual change stays data-driven and covered by the existing integrity tests at both detail levels.
- The live card changes look without a dashboard edit (new options default to the new look).

**Non-Goals:**
- No change to label positions, roles, operating-mode logic or segment roles.
- No change to the scale behaviour beyond the default stops (no adaptive scale).
- Narrow-card behaviour (`add-compact-layout`).

## Decisions

### D1. Detail as a mark on parts and stubs
Components and segments get an optional `detail: 'full'`. `isDrawn` hides them unless the resolved
`detail` is `full`. Marked (manual-figure, section 3.1):

| Items | Part | Why left out in simplified |
|---|---|---|
| 18, 19 | brine and production expansion vessels | no live value, service hardware |
| 20, 21 | brine and production safety valves | over-pressure protection, no live value |
| 23, 24 | brine drain and production discharge valves | service only |
| 39, 40 | suction and discharge mini-pressure switches | safety trip, no entity |
| 41 | service outlets (both) | service only |
| 52, 53 | model C manual trap and tank drain valve | service only |

Each marked part's stub pipes carry the same mark. Kept in simplified: transducers 35-38 (they carry the pressure
labels), valves 22/25 (they define the HTR loop), thermostat 45 (it belongs to resistor 44).
The integrity tests run over every combination twice, once per detail level: after removal, every remaining
endpoint still touches a port or a segment, and no T-junction is left dangling.
Item-number texts (components and ports) render only when `detail` is `full`.
Alternative considered: deleting the parts outright. Rejected: the full figure stays useful for service work and
keeps the manual citation visible on demand.

### D2. Component names and taps
- `COMPONENT_NAMES` in `src/strings.ts`, keyed by item number, holds the manual's names (section 3.1 legend,
  manual-figure), plus the nine connection names (1-6, and 47-49 on model C). The tooltip text is
  `${name} (${item})`. The two drawn parts without an item number in the manual, the external tank and the air
  unit's fan, carry their name alone.
- Each component group gets an SVG `<title>` (native tooltip in browsers) and the same text as `aria-label`.
- A component's own entity comes from one table in `src/diagram/` (component item -> role path), filled from the
  role table's `item` field where one role belongs to the item, and chosen by hand where several do:
  11 -> `compressor.speed` (rpm), 12 -> `refrigerant.expansion_valve`, 8 ->
  `refrigerant.condensation_temperature`, 7 -> `refrigerant.evaporation_temperature`, 15 -> `production.pump`,
  16 -> `brine.pump`, 29/30 -> `compressor.suction_temperature`/`discharge_temperature`, 31/32 -> `brine.outlet_temperature`/
  `inlet_temperature`, 33/34 -> `production.outlet_temperature`/`return_temperature`, 35/36 ->
  `compressor.suction_pressure`/`discharge_pressure`, 37 -> `brine.pressure`, 38 -> `production.pressure`, 26 ->
  `dhw.demand`, the air unit's fan -> `source.fan_speed`, the tanks (external, and 50/54 on model C) ->
  `dhw.temperature`. Items without a role (9, 10, 13, 14, 17, 22, 25, 27, 28, 44, 45 and the parts of D1) get no
  entry. Connections (1-6, 47-49) get no entry either: the DG1 setpoint label near port 1 shows a setpoint of the
  circuit, not a value of the connection, and stays tappable on its own.
- A component with an entry gets `role="button"`, `tabindex="0"`, pointer cursor, and fires `hass-more-info`
  on click, Enter and Space, through the same helper as the value labels. Not in sample mode.
Alternative considered: a custom HTML tooltip overlay. Rejected for now: `<title>` is free, accessible and works
in every browser; touch devices get the tap instead (and `add-compact-layout` decides more for phones).

### D3. Default palette
`DEFAULT_STOPS` becomes `-10 #1e5aa8` (blue), `10 #5fa8e0` (light blue), `20 #8ecae6` (pale blue), `30 #e8a317`
(amber), `50 #f2711c` (orange), `70 #d7263d` (red). Hues: about 214, 206, 199, 40, 24 and 352 degrees, none between
75 and 165. The unit test computes the hue of each default stop, and samples the scale in 1 K steps from -10 to
70 °C: no sample may have a hue between 75 and 165 at a saturation above 20 %. Interpolation (`color-mix` in
srgb) and clamping are unchanged.
The 20 °C stop was added after the group 2 review: blue and amber are near complements, so the straight srgb mix
from light blue to amber crossed a low-saturation grey-green at 15-20 °C, exactly where passive-cooling water and
cooling returns sit, and read close to the muted grey. The pale blue stop keeps 10-20 °C clearly blue and narrows
the neutral band to about 22-24 °C. If `#8ecae6` is too pale on the light card at 3 units, a slightly darker blue
of the same hue replaces it (recorded here).
Alternatives considered: a blue-purple-red scale (rejected: purple reads as neither warm nor cold); oklab
interpolation (rejected: the middle gets greyer, closer to the muted colour); oklch (rejected: the short hue arc
from blue to amber runs through saturated green); a warm sand stop at 20 °C (rejected: cooling water would read
warm).

### D4. Exchanger fill from the neighbouring segments
- Each exchanger component (7, 8, 9, 10) gets in `geometry.ts` a `sides` entry: for each side, the ids of the
  segment that enters and the segment that leaves it in normal flow, and which half of the symbol it fills
  (`left`/`right`).
- At render time the side takes the two segments' states from `pipes.ts`: their colours, mode-dependent roles and
  reversal. A reversed side (active cooling on the refrigerant legs) swaps start and end. A side is muted when
  both its segments are muted (or not drawn).
- Rendering: two rectangles inside the exchanger outline, under the plate lines and ports, each filled with an SVG
  `linearGradient` (vertical, from the entering end to the leaving end) at `fill-opacity` 0.55, so the plate lines
  stay readable. Gradient ids carry a per-card-instance prefix, so two cards on one page do not share ids.
- Exchanger 9's refrigerant side has one temperature (the discharge) at both ends; its water side takes the HTR
  water colour while HTR is active and is muted otherwise.
- `exchanger_fill: none` renders no rectangles.
Alternative considered: one fill per exchanger (average). Rejected: the two media are the point of the drawing.

### D5. Helical DHW coil
- The coil stays the segment `dhw_ext_coil` (circuit, role, direction, colour, animation are unchanged); it gets
  `shape: { kind: 'helix', cx, top, bottom, rx, turns }`. Its `points` keep the two end points only, so the
  endpoint integrity test still applies.
- `pipes.ts`/`dhw.ts` render a helix segment as one path per half-turn: front halves (lower ellipse arcs) with
  the base stroke, back halves at opacity 0.35. The flow overlay runs on the front halves only, in the segment's
  direction.
- The tank becomes a rounded cylinder: straight walls with elliptical domed caps; its body fill keeps
  `--dhw-tank-color` (the DHW temperature).
- The crossing tests skip a helix segment's self-overlap (by design) but still check it against every other
  segment; only its own pipes may enter the tank (existing test).
- Model C coil 51 (`kind: 'coil'` symbol) is drawn by the same helix function, smaller, keeping its
  `coilColor` from D7 of add-schematic-card.

### D6. Air unit
- Housing with a slatted front. Coil block: a frame with 12 or more thin vertical fins (from `AIR_UNIT.fins`).
  The brine serpentine `src_air_coil` keeps its three passes, with rounded U-bends (arc joints), drawn over the
  fins.
- The fan: a ring, a hub and five swept blades, the existing rotor animation and `fanDuration` unchanged.

### D7. Line weights
- Pipe base stroke 3 units (was 2); the flow overlay 3 units with dash and gap scaled by 1.5; hop gaps widened
  to match.
- Symbol outlines 2 units (was 1.5); cabinet outline 3 units; source and tank outlines 2.5 units.
- A unit test reads the stroke widths from the rendered DOM and styles.

## Risks / Trade-offs

- [Thicker strokes touch labels or close the gaps between parallel pipes] -> the emulator captures of every
  scenario are inspected for overlaps in each group; parallel pipes that touch get spaced in geometry.
- [Removing stubs leaves a T-junction dangling] -> the integrity tests run at both detail levels (D1).
- [Gradient ids collide between cards] -> per-instance id prefix (D4), unit-tested with two cards in one DOM.
- [Helix breaks the crossing tests] -> explicit, narrow exemption for the helix's self-overlap only (D5).
- [Amber on a white card has low contrast] -> pipes are 3 units thick and inspected in the light-theme captures;
  if a stop is too pale, darken that stop, not the whole palette.

## Migration Plan

The live view needs no edit: `detail` and `exchanger_fill` default to the new look. After the release: deploy
`dist/ecogeo-card.js`, bump the dashboard resource `?v=`, hard-refresh. Rollback: revert the release commit,
redeploy, bump `?v=` again.
