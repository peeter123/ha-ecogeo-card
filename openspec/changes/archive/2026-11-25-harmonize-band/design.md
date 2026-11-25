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
- Use the lowest jog levels (one level wherever it avoids a crossing), with the planarity condition written down
  and tested, not tuned per configuration.
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
| ground collector | 126 | 176 | 120 until task 6.5 (D5) |
| hybrid | 328 | 176 | air unit, gap 12, collector |
| tank | 160 | 176 | |

The height stays 176 (schematic-drawing "One body height in the band"). The widest band, the emitter with the hybrid
and the tank, is 180 + 24 + 328 + 24 + 160 = 716 units. That fits the vertical layout's 720-unit frame, so neither
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

- port 3 at about x 682 and port 4 at about 821;
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

Amended 2026-11-24 during apply (decided by the user): one level for every pipe but the tank's cannot be met. The
check reports conflicts that the analysis above missed:

- **Vertical layout, the source left of ports 3 and 4:** port 3 feeds the source's left column and port 4 its right
  one, so port 4's span always contains port 3's riser. This follows from the hydraulics: two nested pipes on one
  level are planar only when the outer ports join the outer columns.
- **Horizontal layout, air unit with the tank:** the air unit's exit column lands just left of port 3 (x 676 against
  682), so the two source pipes overlap.
- **Hybrid, both layouts:** port 3's pipe to the air unit's feed passes under the link's start.

The rule is therefore the lowest level per arrangement. The levels are `jog` (24 above the cabinet's top edge), `second`
(34) and `third` (44; 28, 40 and 52 until the whole-change review, see below). `bandSegments` groups the band pipes:
port 1's, port 2's, port 3's, port 4's, the hybrid's link, and the tank's two pipes as one group. It tries the level
assignments ordered by the number of lifted pipes first (the tank's group counts as two), by the highest level used
second and by a fixed weight per group third (ties keep the generation order), all on `jog` first, and takes the first
one for which `jogSpans` reports no conflict (settled 2026-11-24 at the group 6 review, to match the spec's "fewer
lifted pipes"). If no assignment is conflict-free, it keeps all on `jog` and draws the crossing rather than fail the
card's render; the unit test over every band key rules that case out. Nothing is set per band key. The unit test asserts
no conflicts for every band key in both layouts, and it lists the keys and pipes that leave `jog` as an explicit
expected list, so a new lift cannot appear silently. On 2026-11-24 they are: horizontal air with the tank (port 4's pipe
on `second`), horizontal hybrid with or without the tank (the link on `second`), vertical air with the tank (port 4's on
`second`, the tank's on `third`), vertical air without the tank (port 4's on `second`), vertical ground with the tank
(port 4's on `second`, the tank's on `third`), vertical hybrid with the tank (the link and port 4's on `second`, the
tank's on `third`), and vertical hybrid without the tank (the link on `second`). The emitter does not change the
assignment. `jogSpans` counts only the sections below the band's bottom edge. The tank's supply rises 12 units left of
the coil (D8), so in the vertical layout its span covers port 4's riser; a supply at the coil's left side would avoid
the lift, but it runs through the helix's left turning points (tried in task 6.7 and rejected by the user).

Amended 2026-11-24 at the whole-change review (decided by the user): the tank's two pipes stay one group. In the
vertical layout lifting only the supply would also be free of conflicts, but the pair keeps the tank's two pipes
parallel on one level, and the spec now says the pair moves as one and counts as two. The levels moved down to 24, 34
and 44: at 52 the supply on `third` ran 4 units under the tank's flat bottom (0.2 units clear at 320 px), so pipe and
outline read as one doubled stroke. The highest level now leaves 12 units under the band's bottom edge (the join lane is
56), more than a pipe width plus the outline width from 320 px up, and a unit test asserts it. The order of the levels,
and so the list of lifted pipes, is unchanged.

Alternatives considered at the amendment: moving the air unit's exit column right and routing the hybrid's link
through the gap between its bodies, to cut the lifts; and the old fixed level per pipe. The user chose the plain
lowest-level rule.

### D4 The air unit

The air unit is a front view of an outdoor unit (proposal, from the user's photo of 2026-11-23). All of its parts are
offsets from its slot in `airUnitShape`:

- **Case:** the body rectangle (radius 6) from the top to 8 units above the band's bottom (the feet's height).
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
today's strip. There are no captions: the value labels carry no tooltip, so the positions tell the two
temperatures apart (outside at the air intake on top, Out at the outlet pipe); the case's and the fan's tooltips name
the parts.

The fan speed takes the role's unit. A percentage shows whole percent, as the pump speeds do (rework-layouts), and
rpm shows the rpm value. In the hybrid the air unit shows the outside temperature and the fan speed, but no Out: the
link pipe carries the air unit's outlet, and the source's Out is the collector's.

Applied 2026-11-23: none of the fallbacks. The fan ring keeps its radius of 40 and the speed stays below the fan: the
overlap tests at both layouts' thresholds and at 320 px pass with the three values in the boxes of `values`. The case
ends above the band's bottom and the two feet stand on it, as in the Case and Feet bullets above (decided by the user
2026-11-23 during apply, after a first version drew the feet inside a full-height case; the "Shared style" scenario
names the air unit's feet as its lowest edge). The columns moved left with the coil panel: the feed to 18 and the
exit to 60 units from the unit's left edge; the pipes still meet them and cross nothing in any band key.

Known limitation (accepted by the user 2026-11-23 during apply): a fan speed in rpm of four digits ("1450 rpm") is
wider than the room between the coil panel and the case wall in the vertical layout at 320 px, so it can touch the
coil panel there. Percentages, three-digit rpm values, the defrost values and both layouts at their thresholds fit.
Neither fallback above gains width. The docs name the limitation, and the browser test keeps the case as an expected
failure, so it turns red if a later change makes it fit.

### D5 The borehole collector

`collectorShape` becomes a borehole with a double-U probe drawn in series:

- the hatching along the top, as now: the surface;
- a feed riser up the left side from the bottom face to a header just under the hatching;
- the header runs right into U-loop 1, whose two legs go down to near the bottom and back up;
- a short top link joins it to U-loop 2, which goes down and back up the same way;
- a return riser runs from the top down the right side to the bottom face.

The risers sit at the margin from the walls. The feed is on the left, towards
port 3, and the return on the right, towards port 4, which keeps the jogs disjoint (D3).

The segments keep today's split in two halves for the colours:

| Half | Pipes | Colour, ground | Colour, hybrid |
|---|---|---|---|
| first | feed, header, U-loop 1 | brine outlet (BOUT) | air unit outlet (AIRO) |
| second | U-loop 2, return riser | brine inlet (BIN) | brine inlet (BIN) |

The Out (`brine.inlet_temperature`) sits at the bottom, left of the return riser and below the loops' bends: next to
the outlet, as at the air unit.

Amended 2026-11-24 during apply (task 6.5): the collector is 126 units wide, 6 more than the 120 of D2. The widest Out
("-12.3 °C" in defrost, about 95 units at 320 px) left 0.4 units to the feed riser's edge at 120 units, so the label
touched the feed riser (`src_gnd_down`, `src_hyb_down`) in the defrost cases of the vertical layout at 320 px, and the
threshold had measured 340 px. The extra 6 units go to the room between the risers: 6.4 units of clearance on the left,
the Out's right edge unchanged at 1.5 pipes left of the return riser. The risers stay at the band's margin, and the
loops and the runs stay as they were, so the link between the loops is 6 units longer. The hybrid becomes 328 and the
widest band key (emitter, hybrid, tank, with two gaps) 716 units, inside the 720-unit frame, with the gaps unchanged.

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
keeps its button for the DHW temperature. Tank 50 keeps its temperature above coil 51.

### D8 The external tank and its coil

- **Body:** the domed top, straight walls, and a flat bottom on the band's bottom edge with corners of the band
  radius. The rim (the top dome's lower arc) stays.
- **Coil:** `HelixShape` gains `fromLeft: true`. The helix starts at the top left with a back half and winds down in
  four and a half turns, so its end lies at the bottom right. Its last half arrives with a vertical tangent, as the
  others do, instead of flattening into a pipe that leaves sideways, so the return drops straight down. The coil's
  top line lies 94 units below the tank's top (90 before), which makes the pitch a whole 6 units.
- **Supply:** rises in the inlet column 12 units left of the coil's left side (`inX`), so it passes none of the
  helix's left turning points. The helix's first half starts at the top of that column (`HelixShape.startX`) and arcs
  over to the right side: it is the extra half turn, a little wider than the others on its left end.
  No straight pipe runs along the coil's top or bottom (decided by the user 2026-11-24, after a first version put the
  column at `cx - rx`, through every left turning point).
- **Return:** drops straight down from the helix's end at `cx + rx`, through the tank's bottom, to the jog level and
  on to port 6.

Amended 2026-11-24 after group 6 (decided by the user): group 6 first drew four whole turns starting at the top
right, with the supply running straight along the coil's top from the inlet column to the start. That line lay just
above the first turn and read as a doubled stroke. The helix now takes half a turn more and starts where the supply
rises (task 6.7).

The supply still enters at the top and the return leaves at the bottom (counterflow, as in a real tank). The front
and back halves keep `helixDrawOrder`. Coil 51 takes neither `fromLeft` nor `startX` (out of scope).

### D8a Body-placed labels in the place search

Added 2026-11-24 at the group 6 review (decided by the user). The values inside the band's bodies (the collector's Out,
the air unit's outside temperature, fan speed and Out) are placed by their shape's boxes, not by the search. The place
search checks them by their own rule: the label lies inside its body's box and touches no pipe, part or outline,
without the search's 2 px margin, as `measure-layout` measures. Its report is then empty for them, so the docs' rule
that a label without a place is a decision point holds without an exception.

### D9 The outside temperature leaves the footer with the air unit

`footerItems` drops the outside temperature when the drawn source has an air unit (`source` `air` or `hybrid`), and
keeps it for `ground`. This is a display rule over the config, so it is a pure function, unit-tested with the other
footer items.

### D10 The compressor

`COMPRESSOR_FILLS` and its paths go, and so does the browser test of the fill; its scenario now asserts that no part
is filled. Compressor 11 is drawn
with the circle and the two converging lines again, as before rework-layouts group 4.

## Risks / Trade-offs

- [The air unit's three values at 320 px in the vertical layout do not fit around the fan.] → The vertical layout's
  320 px overlap test is the gate. The first fallback is a smaller fan ring (radius 34). The second is the fan speed
  beside the fan rather than below it. Either is a geometry change, without a spec change.
- [The spiral reads as noise at phone width.] → At least 12 units of pitch and at most three inward turns. A subagent
  checks the emulator screenshot at 320 px in group 3.
- [Two bare temperatures in the air unit are confused.] → They sit at opposite ends (top and outlet); the value
  labels have no tooltip of their own. If the user finds them confusing at review, a caption is a later decision.
- [Pipes leave the first jog level.] → Only where `jogSpans` reports a conflict on it, with the fewest lifted pipes;
  the unit test lists the band keys and pipes, so a new lift cannot appear silently.
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
