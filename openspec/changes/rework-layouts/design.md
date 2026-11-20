# Design

## Context

See proposal.md for the motivation. The current state that shapes the approach:

- `src/diagram/geometry.ts` defines every component and pipe once, in the coordinates of the full arrangement (the
  manual-figure frame: cabinet x 240-760, y 130-605), in `componentsFor` and `segmentsFor`. The simplified arrangement
  is derived from it by two monotone piecewise-linear maps (`SIMPLIFIED_MAP_X`, `SIMPLIFIED_MAP_Y`, slope 1 over every
  span a component's ports cover) plus a short list of exceptions (`SIMPLIFIED_EXCEPTIONS`, transducer 38). Source and
  tank zones come from `ZoneBase` constants, scaled by `SIMPLIFIED_ZONE_SCALE`. This model (refine-simplified-layout
  D1-D3) is sound and stays.
- `arrangementFor(level, layout)` returns the full or the simplified arrangement; the compact layout always gets the
  simplified one with `COMPACT_PLACES`. Labels are HTML overlays positioned in percent of the viewBox
  (`labels.ts` `cssPosition`), sized `max(8px, 0.95cqw)` in the full layout and `max(10px, 1.6cqw)` in compact.
- Label places are hand-recorded per arrangement (`FULL_PLACES`, `SIMPLIFIED_PLACES`, `COMPACT_PLACES`), found with
  `npm run search-places` (a raster search over the measured obstacles, dev/overlaps.ts) and checked by the overlap
  browser tests. `ON_PIPE_COMPACT` exempts five compact labels from the pipe check.
- `src/lib/layout.ts` (copied from hrv-ventilation `src/lib/layout.ts`, deviations recorded in its header) holds the
  per-detail thresholds `COMPACT_BELOW` (600) and `COMPACT_BELOW_FULL` (640) and the 24 px hysteresis.
- The 13 local Chromium failures are an RDP session with font smoothing off: Chromium then lays text out with
  whole-pixel advances (10 px Roboto "Out -12.3 °C": 58.000 px against WebKit's 56.04), which eats the 2 px margin
  rule. No Chromium flag changes it (verified 2026-11-19).

## Goals / Non-Goals

**Goals:**

- One component and pipe list in one cabinet layout with value lanes, two arrangements (horizontal, vertical) derived
  from it by maps, and one band model for the parts outside the cabinet.
- Label places per arrangement that keep every label off pipes, found by the existing search, not by exceptions.
- A feedback loop that a subagent can run on every visible step, and visual references that CI can hold.

**Non-Goals:**

- No new derived state: the emitter follows the existing DG1 production circuit (operating-mode).
- No change to colouring rules beyond the emitter's and the collector's segments, no change to flow animation.
- No automatic layout engine: places stay recorded constants with reasons, as now.

## Decisions

### D1 One cabinet layout with value lanes

Groups 2-6 kept `componentsFor` and `segmentsFor` in the manual-figure frame. The parts that only the full level drew
(items 18-21, 23, 24, 39, 40, 41, 52, 53, their stub segments `prod_tap_b`, `brine_tap_b`, `brine_drain` and the
like, and their crossings) are deleted from the lists rather than filtered, the `detail` field of `Component` and
`Segment` goes and the full arrangement is no longer built.

The cabinet's coordinates are then re-authored once in a new cabinet frame (decided by the user 2026-11-20, after the
group 7 experiment showed that the manual-figure frame leaves no y range free in every column: every symbol keeps its
size, the union of their port spans covers y 214-428 without a gap, and at 320 px the cabinet values landed 100-166
units from their parts). The new frame keeps the topology of the B4 and C figures (port order, the order of the parts
along every pipe, the probe and HTR placements, the pairs, the transducers on their lines, the crossings as hops, no
more crossings than the manual figure) and every component still cites its item number in the code; only the
coordinates change. The parts sit in rows and columns with lanes between them (schematic-drawing "Cabinet layout with
value lanes"): a row lane is a horizontal strip across the whole cabinet that no symbol enters and only vertical pipes
cross, a column lane the same vertically. The lanes are where the cabinet's values sit, and where the maps (D2) add
room. The frame is 720 units wide, the width of the widest band (emitter 200, hybrid 312, tank 160, two gaps of 24),
so the vertical layout needs no x map. Alternatives considered: keep the manual-figure frame and stretch symbols in
the vertical layout (rejected: it changes symbol proportions per layout and still leaves the rows short), or two
hand-made cabinets, one per layout (rejected: twice the geometry to keep in step and to test for topology).

Decided 2026-11-20 in the group 7 review: "every value in the cabinet sits in a lane" is checked by a unit test (each
cabinet label's box lies in a row lane or a column lane, in the frame and mapped), so a value that lands in a row of
parts, as the compressor speed first did, fails the build rather than the vertical layout later (the vertical
layout's rotated values and its pump 15 value are checked for no part and no pipe instead, D7). A part keeps its
neighbours as well as its order: safety thermostat 45 stands next to resistor 44 on riser 1, with no other part
between them (schematic-drawing "outlet resistor 44 with safety thermostat 45"), not only in the right order.

Refinements of the frame (decided by the user 2026-11-20), in both layouts:

- The HTR system discharge valve 25 (`drain_valve`, manual-figure, under the HTR column) and its stub segment
  `htr_drain` are deleted, like the drain valves 23/24 of the full level: no live value. The HTR group is exchanger 9,
  pump 17 and valve 22.
- Compressor 11 (today at frame x 372) and the passive cooling and defrosting exchanger 10 (today at x 405) are centred
  on the frame's vertical centre line, x 360, so they read as the middle of the drawing. Their rows and the topology
  rules (the order along every pipe, the pairs, no more crossings) stay; the parts and pipes around them move as far as
  that needs, and the lanes are recorded again. "Centred" means the symbol's centre lies within 2 units of the centre
  line, in the frame and in both arrangements: the vertical x map is the identity, and the horizontal x map (D2)
  splits its widening so that the frame's centre line lands on the horizontal cabinet's centre.
- The expansion valve opening sits alone, centred under valve 12, in the row lane under the valve row (the superheat
  is no longer drawn, D14).

### D2 Two arrangements by maps: horizontal stretches x, vertical stretches y

`arrangementFor(layout)` returns `HORIZONTAL` or `VERTICAL` (the `Detail` parameter goes). Both are
`buildArrangement(maps, zones, places)` with their own axis maps:

- Horizontal: an x map that widens the column lanes (slope 1 over every column of parts) so the cabinet is about
  980 units wide and the values sit beside their parts, and a y map that may narrow the row lanes so the drawing stays
  wide. Without the widening the band arrangement would make the horizontal drawing almost square.
- Horizontal, centring (decided by the user 2026-11-20): the lanes left of the frame's centre line gain as much as the
  lanes right of it, so compressor 11 and exchanger 10 (D1) stay centred in the stretched cabinet; if that balance
  costs the threshold (D7), it is a decision point for the user.
- Vertical: the identity x map (the frame is already the band's width, D1) and a y map that heightens the row lanes,
  so the values get rows of their own between the parts at phone width.
- Vertical, tank 50 (decided by the user 2026-11-20): the y map adds 28 units of height in row A above coil 51 (the
  user's "about 26"; at 26 the Demand missed its margin by 1 px, so 28 was measured), at a breakpoint inside the row
  where only tank 50's wall and vertical pipes run, so tank 50's temperature and Demand stack above the coil
  (dhw-storage "Model C tank values"). This breakpoint is not a value lane: it is the one allowed vertical y-map
  breakpoint inside a body. Tank 50's wall stretches with it; the breakpoint crosses no other symbol, so coil 51, probe
  54 and every other part keep their size. The stretch applies only where tank 50 is drawn (model C with internal
  storage): elsewhere the same range holds only vertical pipes, and growing it would leave an empty strip in the cabinet
  (decided 2026-11-20 when the plan was reviewed). The vertical arrangement is built per configuration key, so the key
  carries whether tank 50 is drawn. The horizontal layout does not change.

Groups 4-6 found the horizontal breakpoints on the manual-figure frame (the x stretch of group 5, `HORIZONTAL_MAP_X`).
After the cabinet is re-authored (D1), both maps are found again with the screenshot loop and the place search, and
recorded in `geometry.ts` with their reasons. Alternative considered: one arrangement scaled differently per layout.
Rejected: a uniform scale cannot make room in only one direction.

### D3 The band model

`ZoneBase` loses the pipe run above the cabinet (`run`), the ground line on the cabinet's top line and the air unit
and tank positions beside the cabinet. It gains a band: a strip above the cabinet's top edge with three slots, left to
right the emitter (over ports 1/2), the source (over 3/4) and the external tank (over 5/6), and a join lane between the
band's bottom and the cabinet's top edge. Each slot is centred over its port pair where its width allows, and shifted
to keep the order and a minimum gap otherwise; ports 3/4 and 5/6 lie close together (x 638-728 and 768-800 in today's
simplified frame), so the source slot usually shifts left of its ports. A pipe from a port rises straight into the join
lane, takes at most one horizontal jog there, and rises into its part. The viewBox spans the cabinet plus a small
margin, so the cabinet fills almost the whole width (the goal of the change). The emitter, the source's bodies (the
air unit, the ground collector, both of the hybrid) and the external tank share one body height of 176 units, which is
the band's height, in both layouts (decided by the user 2026-11-20; the band was 170, the tank's height, with lower
emitter, air unit and collector bodies). The 6 units more let the external tank's temperature and Demand stack inside
it at 320 px in the vertical layout; the horizontal drawing grows about 6 units, and the bound of the horizontal
aspect test (viewBox height over width) goes from 0.75 to 0.76. Empty slots (`emitter: none`, `dhw: none` or `unused`
internal tank on model C, which draws tank 50 inside) leave their space to the others. Model C's stubs 47-49 on the
top edge stay below the join lane.

### D4 Bodies hold their values

- External tank (not a manual item; the "DHW inter-accumulator" of ports 5/6): the coil already sits in the tank's
  lower part; the DHW temperature and "Demand" go in the upper part, as bare labels on the tinted body, the style of
  tank 50's values today (`bare`).
- Air unit (not a manual item): drawn with its coil block at the bottom, facing the cabinet, so the brine enters and
  leaves the coil on its bottom face, and the fan above it. The Out value sits inside the housing in a free strip
  between the coil block and the fan, or above the fan, whichever the screenshot loop shows clearer; the fan keeps
  rotating by its speed.
- Ground collector (not a manual item): a strip hatched along its top, the serpentine in its lower part, the Out value
  between the hatching and the serpentine.
- Emitter (not a manual item; the heating installation on ports 1/2): the underfloor strip or the radiator, "Demand"
  inside.

A value inside a body has no caption (no Out, no DHW; decided by the user 2026-11-20, after the group 7 experiment
found "Out -12.3 °C" wider than the air unit and "DHW 48.2 °C" about as wide as the tank at 320 px): the body and its
tooltip name it. "Demand" stays, as it is the value itself. A label inside a body counts the body's outline, coil, fins
and fan as obstacles, so the existing overlap measure covers it once the bodies are registered as components
(dev/overlaps.ts).

With the one body height of D3 (decided by the user 2026-11-20) every body is 176 units tall; the external tank's two
values stack (temperature over Demand) in its upper part at every width, and how the emitter, the air unit and the
collector use their added height (taller housing, deeper strip) is recorded in the code with its reason, keeping the
drawings' rules (outer-loop-source, heating-emitter) and the body values inside their bodies.

### D5 The emitter

New module `src/diagram/emitter.ts` with the drawing and `emitterStyles`. Segments `dg1_sup` (port 1 to the emitter
inlet, production outlet 33) and `dg1_ret` (emitter outlet to port 2, production return 34), both in the existing
`production_dg1` circuit, so activity and animation follow the DG1 production circuit of operating-mode without new
logic. The underfloor serpentine is one path stroked with a vertical linear gradient from the supply colour (top pass,
inlet) to the return colour (bottom pass, outlet); the radiator body gets the same gradient as a fill when
`exchanger_fill` is `gradient`, none otherwise, like the exchangers. With `emitter: none`, ports 1/2 keep short stubs
(today's DG1 stubs, shortened) and the DG1 demand sits beside them. Tooltip names "Underfloor heating" and "Radiator"
go in `src/strings.ts`; the emitter's tap entity is `heating.demand` (component-info).

### D6 Transducers on their lines, probe pairs

- Transducer 38 moves onto the production return riser of port 2 (x 312 in the manual-figure frame), drawn like probe
  34 (stem rotated 270, body at x 296), under 34 and above the row of thermostat 45 (x 286, y 282), at about y 255.
  The stubs `prod_tap_a`/`prod_tap_b`, the crossing `prod_10_in x prod_tap_a` and `SIMPLIFIED_EXCEPTIONS` go.
- Transducer 37 moves onto the brine inlet riser of port 4 (x 690), under probe 32 (y 228) and above pump 16 (y 300),
  at about y 256. The stubs `brine_tap_a`/`brine_tap_b` go.
- In the manual figure both transducers sit on tees towards the vessel and safety-valve groups (18/20, 19/21); with
  those groups gone, drawing them on the line they measure is the faithful simplification (same water, same side of
  the pump).
- Discharge pair: transducer 36 moves from x 474 to x 452 (the former place of switch 40), 22 units from probe 30
  (x 430), the spacing of the suction pair (29 at x 542, 35 at x 564), which stays. Each pair's two values form one
  two-row block (temperature over pressure) under the pair.

### D7 One label set, places per arrangement

`Tier` and `KEY_LABELS` go: every label in `labelPlacesFor` is one of the 18 (live-values "Values on the drawing"); the
rest are deleted, and their roles stay in the config (proposal, Out of scope). `FULL_PLACES`, `SIMPLIFIED_PLACES`,
`COMPACT_PLACES`, `COMPACT_CAPTIONS`, `STACKED_CAPTIONS` and `ON_PIPE_COMPACT` are replaced by `HORIZONTAL_PLACES` and
`VERTICAL_PLACES`, each place with its reason, and the Out and In captions of probes 31-34 belong to the label spec in
both layouts (values inside bodies have none, D4). Body labels are placed by functions of the zones (they follow the
body). `scripts/search-places.mjs` loses `--no-pipes` and the on-pipe set, gains `--layout=horizontal|vertical` and the
rule that a body label stays inside its body, and searches at the layout's narrowest verified width (vertical: 320 px;
horizontal: its threshold). The search measures distance from each label's default place (its probe or component), never
from a recorded place. The horizontal threshold is the narrowest width on the 20 px grid at which the search finds a
place for every label with its 2 px margin and at a place its own spec allows (the probe pair blocks at their pairs, the
hydraulic values beside their parts, the body values inside their bodies), not only the narrowest width without overlap.
Decided 2026-11-19: in the group 3 review production Out cleared its neighbours by less than the margin at 640 and 660
px, which gave 680; after the band and the x stretch (group 5) the search places every label down to 500 px, but from
540 px it moves the discharge and suction blocks about 50 units off their pairs, so the threshold is 560. The search
treats each refrigerant probe pair's two values as one two-row block (temperature over pressure), as it treats the
Out/In pairs, so a pasted result keeps the blocks of live-values "Probe pair values" (decided 2026-11-19 in the group 4
review). A block's row pitch follows the layout's label height (D8), so its rows never overlap at the font floor. After
the cabinet is re-authored (D1) the horizontal places and the threshold are found again by this rule. Decided
2026-11-20 in the group 7 review: the rule is read as written, so a width counts when the search finds an allowed place
for every label, not only when every label is free at its default place. A body label gets no recorded place, so when
the search finds its zone place blocked but a free place inside the body, the zone constants move to that place; the
search reports a blocked zone place (and exits non-zero) instead of listing it as placed from the zones.

The cabinet refinements of D1 and D14 (decided by the user 2026-11-20: no superheat, whole-percent pumps, no valve 25,
compressor 11 and exchanger 10 centred, the opening centred under valve 12) and the body height of D3 change the
horizontal obstacles, so the horizontal places and the threshold are found again by this rule, in Chromium and WebKit,
before the vertical places.

Rotated values in the vertical layout (decided by the user 2026-11-20, after the first vertical search at 320 px
found no place beside their probes for the production and brine values, and a prototype with rotated labels found a
place for every label at 320 px, with no overlap at 320, 360, 412, 480 and 559 px in Chromium and WebKit):

- Rotated -90° (reading bottom to top), each along its vertical pipe next to its probe or part: production Out, In
  and pressure 38; brine Out, In and pressure 37; the pump 16 value. Their texts are the horizontal layout's (the Out
  and In captions included); only the orientation differs. A place records its rotation (`rotate: -90`), and
  `labels.ts` turns the label about its anchor.
- Horizontal: the probe pair blocks (30/36, 29/35), the compressor speed, the expansion valve opening, the body values
  and the pump 15 value. The pump 15 value sits above pump 15, as it is short with whole percentages (D14); with no
  allowed place there, the implementer reports a decision point rather than rotating it.
- On each side the Out and In readings sit side by side at the same height (the shorter one's vertical extent lies
  within the longer one's), with the pressure next to them: brine Out, In, pressure from left to right (the prototype's
  Out, pressure, In is swapped, as the user asked: "swap the pressure and in reading such that they align
  vertically"); on the production side Out and In likewise share their vertical extent, with the pressure beside them.
- Lane exception: a rotated value may sit in a gap between vertical pipes beside its part, even where that gap is not
  a lane through the whole cabinet, as long as it touches no part and no pipe (schematic-drawing "Gap places in the
  vertical layout"). The pump 15 value above pump 15 takes the same exception, as the user named its place. The lanes
  unit test checks these labels for no part, no pipe and a bounded distance from their part instead of for a lane.
- The search (`search-places.mjs`) and the overlap measure (dev/overlaps.ts) measure a rotated label by its rotated
  box (width and height swapped about the anchor); `VERTICAL_PLACES` records the rotation with each place and its
  reason. The horizontal layout rotates nothing.

### D8 Fonts and threshold

Labels get one rule per layout: `max(10px, k cqw)`, `k` chosen per layout so the labels' height in viewBox units is
about the same in both arrangements at the threshold; the 8 px floor goes. `layout.ts` keeps one constant,
`VERTICAL_BELOW`, measured by `scripts/measure-layout.mjs` on the horizontal layout over the 20 px grid (a target, not
a promise: about 600 px), plus `nextVertical(layout, width, current)` with the 24 px hysteresis. Before the width is
known the card renders horizontal, as it rendered full before. The per-layout font comes with the re-authored cabinet
(D1), so the horizontal places and threshold are measured once, with both. A rotated label (D7, vertical layout only,
decided by the user 2026-11-20) takes the same font rule as the others: its text height, now across the pipe, is the
label height the lanes and gaps are sized by, and its length runs along the pipe.

### D9 Captions and footer

`FULL_CIRCUIT_LABELS` (DG1, Outer loop, DHW) and the source and tank captions are removed with their strings. The
footer has one item list (mode, outside temperature, efficiency, power items, alarm, offline); `footerItems` loses its
compact parameter and the on/off and season items.

### D10 Config, editor, emulator

`detail` and `DETAIL_LEVELS` go from `src/config/options.ts`, the editor schema and the emulator controls and URL
state (an old `detail=` in a URL is ignored). `LAYOUTS` becomes `auto | horizontal | vertical`. `emitter`
(`EMITTERS = underfloor | radiator | none`, default `underfloor`) joins the unit options next to `dhw`, in the editor's
unit section and as an emulator control mirrored in the URL. The live installation's config sets neither `layout` nor
`detail`, so it stays valid.

### D11 Browser preflight

A setup file of the browser test project renders two reference strings (10.3 px Roboto, different lengths) and
fails the run with a message about font smoothing and remote desktop sessions when, in Chromium on Windows, both
widths are whole numbers. On Windows, Chromium uses subpixel positioning only while system font smoothing is on
(`font_render_params_win.cc`, SPI_GETFONTSMOOTHING), so at a fractional font size at least one width is fractional;
with smoothing off every advance is whole. On Linux at device scale factor 1, Chromium never uses subpixel
positioning (`font_render_params_linux.cc`), so whole widths are its normal state there, CI's references and overlap
runs included; the check therefore applies to Chromium on Windows only (decided 2026-11-19 in the group 1 review).
The check is verified on this machine both ways in group 1 (the user switches font smoothing; the orchestrator does
not change system settings), and on CI Linux by the next workflow run.

### D12 Screenshot loop and visual references

- Loop: `npm run capture` (scripts/capture.mjs, dev/captures.ts) produces the PNGs; docs/ecogeo-card.md gets a review
  section with the criteria of dev-emulator "Screenshot review loop". Every visible group ends with a subagent that runs
  the capture, inspects the relevant PNGs against the criteria and returns a text verdict.
- References: a third Vitest project `visual` (Chromium only, `test/**/*.visual.test.ts`) uses `toMatchScreenshot`,
  whose reference names carry browser and platform (`<name>-chromium-linux.png`, Vitest 5 docs). Its tests use
  `test.skipIf(process.platform !== 'linux')`, so they report as skipped on Windows. The renders run with reduced
  motion (no flow or fan animation). CI runs them after `npm run check`. References are recorded by a
  `workflow_dispatch` input of check.yml that runs the project with `--update` and uploads the reference folder as an
  artifact; the developer commits it. Alternative considered: Playwright's Docker image locally. Rejected: Docker is
  not part of the toolchain here, and CI's Linux with Roboto is the environment the references must match.

### D13 Release as 1.0.0 again

The release group does not bump `package.json` (still 1.0.0): it rewrites the CHANGELOG's 1.0.0 section (the
date is set when it is published) and runs `npm run release`. This deviates from the release rule in
openspec/config.yaml by the user's decision of 2026-11-19 (nobody uses 1.0.0 yet). Replacing the GitHub release and
the `v1.0.0` tag is not a task; it happens only on the user's explicit request.

### D14 No superheat, whole-percent pumps

Decided by the user 2026-11-20: the superheat adds little to the schematic, so its label goes from `labelPlacesFor`
in both layouts and the cabinet shows 18 values. The `refrigerant.superheat` role (firmware-entity) stays configurable
with its suggestions and more-info behaviour, like the other roles that lost their label (proposal, Out of scope).
The `difference` quantity and its °F rule in `src/lib/units.ts` stay: `dhw.start_delta` and `refrigerant.superheat`
still have the quantity, the editor's suggestions (`src/suggest/suggest.ts`) use it to accept K, °C and °F entities,
and the readings (`src/calc/readings.ts`) still convert every role, which `test/calc/readings.test.ts` checks. What
goes are the superheat label's tests in `test/diagram/labels.test.ts`: the °F label test is deleted, and the
display-precision tests that use the superheat label move to a label that is still drawn.

The pump speeds (`production.pump`, `brine.pump`) show whole percentages in both layouts, "100 %" instead of
"99.9 %", with the no-break space before % kept: their role default goes from 1 decimal to 0, and a pump value in %
takes 0 decimals even when its entity has a display precision (live-values "Locale and precision"), so the label is
short enough to sit horizontally above pump 15 in the vertical layout (D7). A pump bound to an on/off entity still
reads "On" or "Off", and one in another unit (such as rpm) keeps that unit's decimals.

## Risks / Trade-offs

- [18 values do not fit the vertical layout at 320 px] -> The cabinet's row lanes (D1) and the vertical y map (D2)
  give the values their rows, body values have no captions (D4), and the hydraulic values beside vertical pipes are
  rotated along them (D7, decided by the user 2026-11-20). If the search still reports a label without a place, that
  is a decision point for the user (a larger minimum width, or a value fewer), not a reason to put a label on a pipe.
- [Rotated values read less easily] -> Only the vertical layout's hydraulic values along vertical pipes turn, all the
  same way (bottom to top), with unchanged texts; the refrigerant blocks, the compressor speed, the opening, the pump
  15 value and the body values stay horizontal.
- [The re-authored cabinet loses a topology rule of the manual figure] -> The topology unit tests (port order, the
  order along every pipe, probe and HTR placements, pairs, transducers, crossings and hops) stay and must pass
  unchanged in what they assert; only coordinates in tests change.
- [The horizontal drawing becomes too tall for a desktop panel view] -> The x stretch (D2) keeps it wide; the panel
  fit (responsive-layout) still narrows the drawing to the window's height. The panel capture at 1280 x 800 checks it.
- [The band gets crowded with hybrid, radiator and tank together] -> The hybrid is the widest case and is captured in
  both layouts; the slot rules (D3) give empty slots' space away, and the hybrid's collector may be narrower than the
  ground source's.
- [All arrangement snapshots change at once] -> They are recorded again in the groups that change the drawing, each
  backed by a screenshot verdict; the snapshot diff is not reviewed line by line.
- [Text widths differ between hosts] -> The 2 px margin rule stays, the preflight (D11) stops runs on a host that
  breaks it, and pixel references live on CI Linux only.
- [Visual references flake on anti-aliasing] -> Reduced motion, Roboto installed in CI, and a small comparator
  tolerance; references recorded by the same CI image.
- [Users relied on item numbers or the full drawing] -> Accepted by the user: 1.0.0 has no users yet.

## Migration Plan

1. Groups 1-9 change the repository only; nothing is deployed in between.
2. The release group runs `npm run release`, deploys `dist/ecogeo-card.js` explicitly, bumps the dashboard resource's
   `?v=` (id and value in `private/installation.md`) and checks the schematic view at phone width (1170 px at zoom 3)
   and on the desktop (1280 x 800) through a subagent's screenshot verdict, plus the system log for card errors.
   The live config sets no `emitter`, so the card draws the default underfloor loop, which is what the installation
   has (confirmed by the user 2026-11-19 after the group 6 review); the config needs no change.
3. Rollback: deploy the previous `dist/ecogeo-card.js` from commit 85b5fe7 and bump `?v=` again; the live config
   needs no change either way.

## Open Questions

- The cabinet frame's rows, columns and lane widths, the map breakpoints, the font factors `k` and the threshold
  value: measured with the place search and the screenshot loop when the cabinet is re-authored and when the vertical
  arrangement is built, recorded with reasons; they do not change the specs or the task breakdown.
- Whether the air unit's Out value sits between coil block and fan or above the fan (D4): decided in group 5, between
  the coil block and the fan.
