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

- One component and pipe list, two arrangements (horizontal, vertical) derived from it by maps, and one band model for
  the parts outside the cabinet.
- Label places per arrangement that keep every label off pipes, found by the existing search, not by exceptions.
- A feedback loop that a subagent can run on every visible step, and visual references that CI can hold.

**Non-Goals:**

- No new derived state: the emitter follows the existing DG1 production circuit (operating-mode).
- No change to colouring rules beyond the emitter's and the collector's segments, no change to flow animation.
- No automatic layout engine: places stay recorded constants with reasons, as now.

## Decisions

### D1 The manual-figure frame stays the authoring frame

`componentsFor` and `segmentsFor` keep their coordinates in the manual-figure frame, so every component keeps citing
its item and its place in the B4 and C figures. The parts that only the full level drew (items 18-21, 23, 24, 39, 40,
41, 52, 53, their stub segments `prod_tap_b`, `brine_tap_b`, `brine_drain` and the like, and their crossings) are
deleted from the lists rather than filtered, and the `detail` field of `Component` and `Segment` goes. The full
arrangement is no longer built. Alternative considered: re-author everything in a new frame. Rejected: it would
re-open every topology decision of three changes for no gain; the maps already encode the slope-1 spans.

### D2 Two arrangements by maps: horizontal stretches x, vertical stretches y

`arrangementFor(layout)` returns `HORIZONTAL` or `VERTICAL` (the `Detail` parameter goes). Both are
`buildArrangement(maps, zones, places)` with their own axis maps:

- Horizontal: an x map that widens the cabinet beyond today's 620 units (into the lanes between the slope-1 spans, as
  `SIMPLIFIED_MAP_X` does) so the values sit beside the pipes, and the identity-with-cut y map of today's simplified
  arrangement. Without that widening the band arrangement would make the horizontal drawing almost square (the cabinet
  is 620 x 400 units and the band adds about 200 in height).
- Vertical: today's simplified x map (cabinet 620 units) and a y map that adds height between the rows of parts (the
  probe row at y 228-234, the compressor and exchanger 9 rows at y 250-300, the exchanger and pump row at y 382-416,
  exchanger 10 at y 448-492), so the values get rows of their own between the pipes at phone width.

The exact breakpoints are found in groups 4 and 6 with the screenshot loop and the place search, and recorded in
`geometry.ts` with their reasons, like `SIMPLIFIED_MAP_X` today. Alternative considered: one arrangement scaled
differently per layout. Rejected: a uniform scale cannot make room in only one direction.

### D3 The band model

`ZoneBase` loses the pipe run above the cabinet (`run`), the ground line on the cabinet's top line and the air unit
and tank positions beside the cabinet. It gains a band: a strip above the cabinet's top edge with three slots, left to
right the emitter (over ports 1/2), the source (over 3/4) and the external tank (over 5/6), and a join lane between the
band's bottom and the cabinet's top edge. Each slot is centred over its port pair where its width allows, and shifted
to keep the order and a minimum gap otherwise; ports 3/4 and 5/6 lie close together (x 638-728 and 768-800 in today's
simplified frame), so the source slot usually shifts left of its ports. A pipe from a port rises straight into the join
lane, takes at most one horizontal jog there, and rises into its part. The viewBox spans the cabinet plus a small
margin, so the cabinet fills almost the whole width (the goal of the change). The band's height is the tallest body's
(the tank's, or the air unit's) at the arrangement's scale. Empty slots (`emitter: none`, `dhw: none` or `unused`
internal tank on model C, which draws tank 50 inside) leave their space to the others. Model C's stubs 47-49 on the
top edge stay below the join lane.

### D4 Bodies hold their values

- External tank (not a manual item; the "DHW inter-accumulator" of ports 5/6): the coil already sits in the tank's
  lower part; the DHW temperature (with its DHW caption) and "Demand" go in the upper part, as bare labels on the
  tinted body, the style of tank 50's values today (`bare`).
- Air unit (not a manual item): drawn with its coil block at the bottom, facing the cabinet, so the brine enters and
  leaves the coil on its bottom face, and the fan above it. The Out value sits inside the housing in a free strip
  between the coil block and the fan, or above the fan, whichever the screenshot loop shows clearer; the fan keeps
  rotating by its speed.
- Ground collector (not a manual item): a strip hatched along its top, the serpentine in its lower part, the Out value
  between the hatching and the serpentine.
- Emitter (not a manual item; the heating installation on ports 1/2): the underfloor strip or the radiator, "Demand"
  inside.

A label inside a body counts the body's outline, coil, fins and fan as obstacles, so the existing overlap measure
covers it once the bodies are registered as components (dev/overlaps.ts).

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

`Tier` and `KEY_LABELS` go: every label in `labelPlacesFor` is one of the 19 (live-values "Values on the drawing");
the rest are deleted, and their roles stay in the config (proposal, Out of scope). `FULL_PLACES`, `SIMPLIFIED_PLACES`,
`COMPACT_PLACES`, `COMPACT_CAPTIONS`, `STACKED_CAPTIONS` and `ON_PIPE_COMPACT` are replaced by `HORIZONTAL_PLACES`
and `VERTICAL_PLACES`, each place with its reason, and the captions (Out, In, DHW) belong to the label spec in both
layouts. Body labels are placed by functions of the zones (they follow the body). `scripts/search-places.mjs` loses
`--no-pipes` and the on-pipe set, gains `--layout=horizontal|vertical` and the rule that a body label stays inside
its body, and searches at the layout's narrowest verified width (vertical: 320 px; horizontal: its threshold).
The search measures distance from each label's default place (its probe or component), never from a recorded
place. The horizontal threshold is the narrowest width on the 20 px grid at which the search finds a place for every
label with its 2 px margin and at a place its own spec allows (the probe pair blocks at their pairs, the hydraulic
values beside their parts, the body values inside their bodies), not only the narrowest width without overlap. Decided
2026-11-19: in the group 3 review production Out cleared its neighbours by less than the margin at 640 and 660 px,
which gave 680; after the band and the x stretch (group 5) the search places every label down to 500 px, but from
540 px it moves the discharge and suction blocks about 50 units off their pairs, so the threshold is 560.
The search treats each refrigerant probe pair's two values as one two-row block (temperature over pressure), as it
treats the Out/In pairs, so a pasted result keeps the blocks of live-values "Probe pair values" (decided 2026-11-19
in the group 4 review).

### D8 Fonts and threshold

Labels get one rule per layout: `max(10px, k cqw)`, `k` chosen per layout so the labels' height in viewBox units is
about the same in both arrangements at the threshold; the 8 px floor goes. `layout.ts` keeps one constant,
`VERTICAL_BELOW`, measured by `scripts/measure-layout.mjs` on the horizontal layout over the 20 px grid (a target, not
a promise: about 600 px), plus `nextVertical(layout, width, current)` with the 24 px hysteresis. Before the width is
known the card renders horizontal, as it rendered full before.

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

## Risks / Trade-offs

- [19 values do not fit the vertical layout at 320 px] -> The y map is a free parameter (D2): add height first. If the
  search still reports a label without a place, that is a decision point for the user (shorter captions, a smaller
  minimum width, or a value fewer), not a reason to put a label on a pipe.
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

1. Groups 1-7 change the repository only; nothing is deployed in between.
2. The release group runs `npm run release`, deploys `dist/ecogeo-card.js` explicitly, bumps the dashboard resource's
   `?v=` (id and value in `private/installation.md`) and checks the schematic view at phone width (1170 px at zoom 3)
   and on the desktop (1280 x 800) through a subagent's screenshot verdict, plus the system log for card errors.
3. Rollback: deploy the previous `dist/ecogeo-card.js` from commit 85b5fe7 and bump `?v=` again; the live config
   needs no change either way.

## Open Questions

- The exact map breakpoints, band height, slot widths, font factors `k` and the threshold value: measured in groups 4
  and 6, recorded with reasons; they do not change the specs or the task breakdown.
- Whether the air unit's Out value sits between coil block and fan or above the fan (D4): decided by the screenshot
  loop in group 4.
