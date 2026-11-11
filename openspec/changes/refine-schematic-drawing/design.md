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
- No change to roles, operating-mode logic or segment roles. No change to label positions, except the labels that
  follow the moved tank and sources and the new source port labels of D14 (follow-up fixes, groups 5-6).
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
  segment; only its own pipes may enter the tank (existing test). The integrity tests check the helix as the
  bounding box of its drawn curve (sampled from the half-turns, so the bulge of the front halves is inside it);
  other segments may end only on its two true end points, not anywhere on that box.
- Model C's tank 50 keeps its rounded rectangle: the cylinder applies to the external tank only.
- Model C coil 51 (`kind: 'coil'` symbol) is drawn by the same helix function, smaller, keeping its
  `coilColor` from D7 of add-schematic-card.

### D6. Air unit
- Housing with a slatted front. Coil block: a frame with 12 or more thin vertical fins (from `AIR_UNIT.fins`).
  The brine serpentine `src_air_coil` keeps its three passes (four since D13), with rounded U-bends (arc joints), drawn over the
  fins.
- The fan: a ring, a hub and five swept blades, the existing rotor animation and `fanDuration` unchanged.

### D7. Line weights
- Pipe base stroke 3 units (was 2); the flow overlay 3 units with dash and gap scaled by 1.5; hop gaps widened
  to match.
- Symbol outlines 2 units (was 1.5); cabinet outline 3 units; source and tank outlines 2.5 units.
- A unit test reads the stroke widths from the rendered DOM and styles.

## Follow-up fixes (after the live release, 2026-11-11)

The user reviewed the live card after group 4 and asked for seven fixes inside this change. D8-D10 are group 5,
D11-D14 group 6; group 7 releases them.

### D8. Idle coil stroke
A muted helix (the external coil and model C's coil 51) is drawn in a darker grey than the other muted pipes in
the light theme, so it stays visible on the tinted tank body: a dedicated custom property (for example
`--ecogeo-coil-muted`, about `#8a8a8a` in light), falling back to the normal muted colour in the dark theme, where
the muted grey already reads on the dark tint. It stays a neutral grey, never a temperature colour; the back
halves keep their 0.35 opacity on top of it. Only the muted state changes; an active coil keeps its temperature
colour.
The coil's own pipes (`dhw_ext_in`, `dhw_ext_out`) take the same darker grey where they run inside the tank, so
the grey changes at the tank wall, not at the joint between the coil and its pipes (which looked broken). This is
done by drawing the muted pipes' inside part again, clipped to the tank body (a clip path with a per-card-instance
id, like the gradient ids of D4), in the coil's muted grey. Outside the tank they keep the normal muted grey.

### D8a. Helix turns and joints (added at the user's request, group 5)
- Front and back halves join cleanly at the coil's sides: all back halves are drawn first, under all front halves,
  with butt line caps, and the front halves keep round caps, so each joint is covered by the solid front half and
  no faint cap or overlap shows. This applies to both helices (the external coil and coil 51).
- Coil 51 (model C) reads as a compact, round coil: its turns sit closer together (a smaller pitch, adjacent front
  halves separated by about one stroke width) and each half-turn bulges visibly (the half-ellipse's minor radius
  at least about a third of its major radius), within the space of tank 50 and without touching probe 54, the
  tank wall or its labels. The turn count may change to fit.
- Coil 51's port stubs reach tank 50's inner wall, so that the symbol (drawn after the tank body) covers the DHW
  lines from the wall inwards and the colour changes at the wall, idle and active, as on the external tank. The
  segment ends and ports stay where they are; the coil's position is one exported constant used by the component
  and the symbol.

### D8b. Model C tank values beside tank 50 (added at the user's request, group 5)
With `dhw: internal` the DHW values (temperature, setpoint, start delta-T) no longer sit in the empty zone right of
the cabinet: they move into tank 50's body, as one row in the strip above coil 51, positioned from
`INTERNAL_TANK`, so the values read with the tank they belong to. No free spot beside the tank fits the stacked
labels (about 55 x 43 units; the gaps beside the tank are 30 to 56 units wide); the user chose the row inside the
tank over keeping them outside, a temperature-only label or rerouting the outer-loop pipes. The row touches no
pipe, component, the tank wall or another label; with `detail: full` the item numbers 50, 51 and 54 move out of
that strip. The DHW demand label (shown only while on) does not fit the row and sits centred on a second line just
under it, still above the coil. The labels inside the tank draw no background plate (the tank's tint is their
background) and all use the same text size as the other value labels in the cabinet: no emphasised, larger
temperature (user's review of the first version). The row uses short captions, "Set" for the setpoint and "ΔT"
for the start delta-T (in `src/strings.ts`, this row only; the external tank keeps its full captions), so it stays
apart down to a card of about 560 px while the demand line shows (about 510 px for the three values alone,
measured); the labels have a minimum font size and grow relative to the drawing on
narrower cards, which `add-compact-layout` handles. Item tag 51 (`detail: full`) sits inside the tank between the
two port stubs, left of the loops, not in the refrigerant tag row below the tank.

### D9. External tank centred on the coil and aligned to the cabinet top
- The tank's right wall moves inwards so that the tank is centred on the coil: the left wall stays at x 806, the
  coil's `cx` (890) becomes the tank's centre, so the width becomes 168 (right wall at x 974).
- The top of the tank (the apex of its top dome) sits on the cabinet's top line (`CABINET.y`, y 130), derived from
  `CABINET`, not a literal. The tank keeps its height; the coil keeps its place in the lower part of the tank and
  moves with it; the 5/6 pipes and the tank's labels follow (labels stay under the tank, centred on it).

### D10. Compressor symbol
Compressor 11 uses the standard compressor symbol (ISO 10628 / DIN 2481 style): a circle with two straight lines
that start on the circle at the suction side and converge towards the discharge side, so the symbol narrows in the
flow direction. The symbol is rotated so that its wide side faces the suction pipe and its narrow side the
discharge pipe, as drawn in geometry. It replaces the arc-and-tick drawing, which did not read as a compressor.

### D11. Sources aligned to the cabinet top
The air unit housing's top (`AIR_UNIT.y`) and the ground loop's ground line (`GROUND_LINE_Y.ground`) sit on the
cabinet's top line (`CABINET.y`, y 130), derived from `CABINET`. In the hybrid the air unit sits there and the
ground loop stays below it, moved by the same offset. The captions keep their places relative to their device
(the air unit caption above the housing, the ground caption below the loop).

### D12. Ground loop as one U-loop
The ground loop becomes a single vertical loop (a borehole U-tube): one leg down from the ground line, a half
circle at the bottom, one leg up to the ground line. It is drawn with the rounded-bend mechanism of D6 (`bend`
equal to half the leg spacing, so the bottom is a half circle), which keeps the segment orthogonal for the
integrity tests. Both ends are at the ground line; the down leg carries the brine to the ground (role
`brine.outlet_temperature`), the up leg brings it back (`brine.inlet_temperature`). The same loop is drawn in the
hybrid, below the air unit. The `CROSSINGS` test of group 3 (no hop under a `bend` segment) still applies.

### D13. Air unit ports on one side
The brine serpentine gets an even number of passes (four), so that it enters and leaves the coil block on the
same side: the right side, facing the cabinet. Both pipes leave the housing through its right wall and run up to
the brine lines; they are routed without crossing any pipe. A declared hop is allowed only where no crossing-free
route exists, and is then listed in `CROSSINGS`. In the hybrid the link to the ground loop leaves from that same
outlet port. Fins, slats and fan stay as D6, the coil block may grow to fit the four passes.

### D14. Source port labels
Each source device shows the temperature of the brine entering and leaving it next to its ports, so the outer
loop reads at a glance without looking into the cabinet; the probe labels 31/32 inside the cabinet stay.
- Captions are from the device's point of view: "In" where the brine enters the device, "Out" where it leaves.
- Air unit: In = `brine.outlet_temperature` (the heat pump's brine outlet feeds the unit), Out =
  `source.air_unit_outlet_temperature`. The outlet value moves from under the housing to the outlet port; fan
  speed and outside temperature stay under the housing.
- Ground loop: In = `brine.outlet_temperature` at the down leg, Out = `brine.inlet_temperature` at the up leg,
  both at the ground line. The ground captions change meaning accordingly (they were the heat pump's point of
  view).
- Hybrid: the air unit's In and Out, and the ground loop's Out. The ground loop's In is the air unit's Out on the
  same link pipe, so it is shown once.
- The labels are ordinary value labels: NBSP between number and unit, tappable for more-info, no label touching a
  pipe or another label (checked in the captures).

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
