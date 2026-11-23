# Design

## Context

See proposal.md for the motivation. The current state that shapes the approach:

- **The band** (`src/diagram/geometry.ts`):
  - `BAND` holds the sizes: body height 176, join lane 56, gap 24, air 130, collector 170, tank 160, emitter 200.
  - `planBand` places the slots over their port pairs.
  - `bandZonesFor` builds the shapes (`airUnitShape`, `collectorShape`, `emitterShape`, the tank and its
    `ExternalCoil`).
  - `bandSegments` authors the pipes.
  - Every body's bottom edge is the band's bottom.
- **The jogs** (`BAND_JOGS`): 22 for port 3 and the emitter, 34 for port 4, 46 for the hybrid link, and 28 or 40 for
  the tank, so that no vertical meets a horizontal. In the vertical layout the tank's slot (x 570-730) covers port 4
  (x 607), and the tank's pipe from port 5 runs left over port 4's riser to the coil's inlet column (x 600).
- **The bodies:**
  - `source.ts` draws the air unit (housing, divider, coil block, fins, fan) and the collector (strip, hatching).
  - `emitter.ts` draws the emitter body, its divider and the underfloor loop: one path stroked with a vertical
    gradient from the supply to the return colour.
  - `dhw.ts` draws the external tank: domed top and bottom, and a rim.
  - The coils and serpentines are segments, so `pipes.ts` colours and animates them.
  - The external coil is a `helix` shape (`helixCubics`, `mirror: true`, 4.5 turns). Its last half turn flattens
    along the bottom into the return stub.
- **The labels:**
  - `label-places.ts` `bodySpecs` places the band's values from the zones: the emitter's "Demand" in its strip, the
    source's Out in a middle strip, and the tank's temperature (`emphasis`) and "Demand".
  - `labels.ts` renders `demand: true` labels as "Demand" while the role is on.
  - The footer carries the outside temperature.
- **The compressor:** `symbols.ts` draws compressor 11 with `COMPRESSOR_FILLS`, added in rework-layouts group 4 with a
  browser test of the fill in both themes.
- **Tests:** the overlap browser tests check every label against every obstacle at the layouts' thresholds and at
  320 px. The visual references are compared on CI Linux only.

## Goals / Non-Goals

**Goals:**

- Write the band's common style once (radius, margin, outline, baseline) and use it in every body.
- Use one jog level, with the planarity condition written down and tested, not tuned per configuration.
- Keep every body a pure shape function of its slot, so that the arrangement snapshots and the integrity tests keep
  working as they do.

**Non-Goals:**

- No change to the cabinet's layout, its lanes or its label places, except that the "Demand" label goes from tank 50.
- No change to the slot planning (`planBand`) beyond the new widths.
- No new roles, no derived state.

## Decisions

### D1 One band style

`BAND` gains the shared style:

- `radius: 6`, which every body's outline uses (the collector's 4 goes);
- `margin: 8`, the inset of a body's inner parts and values;
- one outline class for every body, at the weight the bodies already share (`max(2.5, --outline-width)`).

There are no divider lines: the air unit's divider and the emitter's floor line are deleted, with their obstacles.
The collector's hatching stays: it is the surface, and it is what tells a ground collector apart. The surface line and
the external tank's rim (D8) run from wall to wall but are not dividers (settled 2026-11-23 during apply: the
"Shared style" scenario exempts them, and the one outline class is a shared class on all four bodies, next to any
class a body keeps for muting).

Alternative considered: keeping the dividers as faint lines. Rejected, because the dividers only existed to frame the
value strips, and the values move next to what they measure (D5, D6).

### D2 Widths and height

| Body | Width | Height | Note |
|---|---|---|---|
| emitter | 180 | 176 | |
| air unit | 190 | 176 | |
| ground collector | 120 | 176 | |
| hybrid | 322 | 176 | air unit, gap 12, collector |
| tank | 160 | 176 | |

The height stays 176 (schematic-drawing "One body height in the band"). The widest band, the emitter with the hybrid
and the tank, is 180 + 24 + 322 + 24 + 160 = 710 units. That fits the vertical layout's 720-unit frame, so neither
layout needs a new map.

The air unit is wide enough for its fan, its coil panel and three values at the vertical layout's 320 px. A 260-unit
unit, double the old width, was considered and rejected by the user on 2026-11-23: it does not fit the vertical frame.

### D3 One jog level, and when the tank needs its own

`BAND_JOGS` becomes one level per layout, `jog`, which every band pipe uses for its horizontal section. The condition
that keeps the pipes planar on one level: the horizontal sections of the different pipes must have disjoint x spans,
and no pipe's vertical may fall inside another pipe's span. The verticals are the riser below the level, from the
port, and the leg above it, into the body.

A pure helper, `jogSpans(arrangement)`, lists the spans. A unit test asserts the condition for every band key in both
layouts. In the horizontal layout every configuration meets it:

- port 3 at about x 682 and port 4 at about 827;
- the source's feed and exit columns lie outside the other pipes' spans;
- the tank's spans lie right of port 4.

In the vertical layout the tank's slot is pushed over port 4 whenever the source and the tank crowd the right edge.
The tank's supply column then lies left of port 4, and its span covers port 4's riser. In exactly that case
`jogSpans` reports the overlap and the tank's pipes use a second level, `tankJog`, above the others (as today), so no
crossing arises. The unit test lists the band keys where the second level is used. The user accepted this fallback
on 2026-11-23, through the proposal. If implementation finds a tank entry that avoids it, the fallback goes and the
test asserts one level everywhere.

Alternative considered: shifting the tank's coil off the tank's centre line. Rejected, because dhw-storage requires
the tank to be centred on the coil.

### D4 The air unit

The air unit is a front view of an outdoor unit (proposal, from the user's photo of 2026-11-23). All of its parts are
offsets from its slot in `airUnitShape`:

- **Case:** the body rectangle (radius 6) from the top to 10 units above the band's bottom.
- **Feet:** two small feet under the case, standing on the band's bottom. They sit clear of the brine pipes' columns.
- **Coil panel:** on the case's left, inset by the margin, about 64 units wide and nearly the case's height. It holds
  the horizontal fins and the brine serpentine of four vertical passes. The serpentine enters and leaves on the
  panel's bottom face as today: the feed at the first pass, the exit at the last.
- **Fan:** right of the coil panel, its centre at about 62 % of the width. The ring has a radius of about 40. The guard
  is three concentric rings and four spokes in an X, drawn over the five swept blades, which keep rotating as today.
  The guard is static and drawn in the fin style, so the blades stay visible through it.

The values, all bare and at the regular size (D7):

- the outside temperature, centred above the fan;
- the fan speed, centred below the fan;
- the Out, at the case's bottom right of the coil panel, beside the exit pass where the brine leaves the unit.

Each value sits in an obstacle-free box from the shape, so the overlap check and the place search treat them like
today's strip. There are no captions: the tooltips name the values, and the positions tell the two temperatures apart
(outside at the air intake on top, Out at the outlet pipe).

The fan speed takes the role's unit. A percentage shows whole percent, as the pump speeds do (rework-layouts), and
rpm shows the rpm value. In the hybrid the air unit shows the outside temperature and the fan speed, but no Out: the
link pipe carries the air unit's outlet, and the source's Out is the collector's.

### D5 The borehole collector

`collectorShape` becomes a borehole with a double-U probe drawn in series:

- the hatching along the top, as now: the surface;
- a feed riser up the left side from the bottom face to a header just under the hatching;
- the header runs right into U-loop 1, whose two legs go down to near the bottom and back up;
- a short top link joins it to U-loop 2, which goes down and back up the same way;
- a return riser runs from the top down the right side to the bottom face.

The legs are spaced evenly inside the 120-unit body, at the margin from the walls. The feed is on the left, towards
port 3, and the return on the right, towards port 4, which keeps the jogs disjoint (D3).

The segments keep today's split in two halves for the colours:

| Half | Pipes | Colour, ground | Colour, hybrid |
|---|---|---|---|
| first | feed, header, U-loop 1 | brine outlet (BOUT) | air unit outlet (AIRO) |
| second | U-loop 2, return riser | brine inlet (BIN) | brine inlet (BIN) |

The Out (`brine.inlet_temperature`) sits at the bottom, left of the return riser and below the loops' bends: next to
the outlet, as at the air unit.

A real double-U probe runs its two loops in parallel from a split at the top. Drawing them in series keeps one pipe
path, so the colouring and the flow animation stay one segment chain. This simplification is recorded here and in the
collector's code comment. Alternative considered: drawing the loops in parallel, with a split and a merge. Rejected,
because it needs two parallel flow paths in the segment model for no extra information.

### D6 The spiral emitter

`emitterShape('underfloor', ...)` builds a rectangular bifilar spiral with rounded bends:

- The inward run starts at the feed column on the bottom face and winds clockwise towards the centre in at least two
  turns.
- It reverses in the centre.
- The outward run winds back out between the inward turns and leaves on the bottom face at the exit column.
- The pitch between adjacent runs is at least 12 units, so the turns stay apart at 320 px.
- With the demand strip gone, the spiral uses the whole body inside the margin.
- The feed and exit columns lie side by side at the body's centre, one pitch apart (settled 2026-11-23 during
  apply): the runs open towards them, so the bottom-right corner stays free. The connection pipes from ports 1/2
  keep separate horizontal spans on the jog level (port 1 < feed < exit < port 2 in every band key); group 6's
  `jogSpans` starts from these columns. The radiator keeps its columns 34 units inside each edge.

The loop becomes two segments, `dg1_loop_in` (production outlet 33) and `dg1_loop_out` (production return 34),
instead of one path with a vertical gradient. Two segments because:

- each run is a single colour, so adjacent turns alternate between the supply and the return colour;
- both runs get the flow overlay through `pipes.ts`, like every other pipe;
- the emitter's `<linearGradient>` is kept for the radiator only.

The radiator is unchanged apart from the body width (six columns of 10 with gaps of 8 fit in 180).

Alternative considered: a gradient along the path. Rejected: SVG has no stroke gradient that follows a path, and
alternating runs is what a spiral layout is for.

### D7 Values inside bodies

Every value inside a band body is regular weight at the label size, and bare:

- the external tank's DHW temperature loses `emphasis`;
- the "Demand" labels go from the emitter, from the connection 1/2 stubs, from the external tank and from tank 50;
- the `demand` flag of `LabelSpec`, and the `HEATING_LABELS` and `DHW_LABELS.demand` strings, go if nothing else uses
  them.

The editor's role names ("Demand" in its role list) are a different string and stay.

The emitter keeps its button for the DG1 demand's more-info (component-info "Tap the emitter"), and the external tank
keeps its button for the DHW temperature. Tank 50 keeps its temperature, centred above coil 51.

### D8 The external tank and its coil

- **Body:** the domed top, straight walls, and a flat bottom on the band's bottom edge with corners of the band
  radius. The rim (the top dome's lower arc) stays.
- **Coil:** `HelixShape` gains `flip: true`, which mirrors the helix vertically: its start is at the top right and it
  winds down to its end at the bottom right, in four whole turns, so that both ends lie on the same side.
- **Supply:** rises in the inlet column left of the coil (`inX`) to the coil's top and runs straight along the top to
  the helix's start. That top line is the straight pipe the user asked to have on top.
- **Return:** drops straight down from the helix's end at `cx + rx`, through the tank's bottom, to the jog level and
  on to port 6.

The supply still enters at the top and the return leaves at the bottom (counterflow, as in a real tank). The front
and back halves keep `helixDrawOrder`. Coil 51 does not take `flip` (out of scope).

### D9 The outside temperature leaves the footer with the air unit

`footerItems` drops the outside temperature when the drawn source has an air unit (`source` `air` or `hybrid`), and
keeps it for `ground`. This is a display rule over the config, so it is a pure function, unit-tested with the other
footer items.

### D10 The compressor

`COMPRESSOR_FILLS` and its paths go, and so do the browser test of the fill and its scenario. Compressor 11 is drawn
with the circle and the two converging lines again, as before rework-layouts group 4.

## Risks / Trade-offs

- [The air unit's three values at 320 px in the vertical layout do not fit around the fan.] → The vertical layout's
  320 px overlap test is the gate. The first fallback is a smaller fan ring (radius 34). The second is the fan speed
  beside the fan rather than below it. Either is a geometry change, without a spec change.
- [The spiral reads as noise at phone width.] → At least 12 units of pitch and at most three inward turns. A subagent
  checks the emulator screenshot at 320 px in group 3.
- [Two bare temperatures in the air unit are confused.] → They sit at opposite ends (top and outlet), and the
  tooltips name them. If the user finds them confusing at review, a caption is a later decision.
- [The second jog level for the tank returns in the vertical layout.] → It is limited to the band keys `jogSpans`
  reports, and the test lists them, so it cannot spread silently.
- [The visual references can only be recorded on CI Linux.] → The release group records them through the CI workflow,
  as in rework-layouts.

## Migration Plan

Nothing in the config changes, so the live installation's card config stays valid. At the end, each step with the
user's go:

1. Run `npm run release`.
2. Deploy `dist/ecogeo-card.js` explicitly.
3. Bump the dashboard resource's `?v=` (`private/installation.md`).
4. A subagent checks a phone-width and a desktop screenshot of the schematic view.

Rollback: deploy the previous `dist/ecogeo-card.js` from git and bump `?v=` again.
