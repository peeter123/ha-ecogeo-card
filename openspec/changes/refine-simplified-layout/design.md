# Design

## Context

See proposal.md (Why). Current state that shapes the approach:

- `src/diagram/geometry.ts` is one hand-placed arrangement in a 1000 x 620 viewBox: source zone x 0-240, cabinet
  `{ x: 240, y: 130, width: 520, height: 475 }`, tank zone x 790-1000, the pipe run above the cabinet at y 0-110.
  `COMPONENTS`, `SEGMENTS` and `CROSSINGS` hold literal coordinates. The source and tank are placed from a few zone
  constants (`AIR_UNIT`, `GROUND_LOOP`, `GROUND_LINE_*`, `EXTERNAL_TANK`, `SRC_*`), and their pipes are generated from
  them. `detail: 'full'` marks parts and stubs that `simplified` filters out; nothing else differs.
- `src/diagram/labels.ts` holds a fixed table of label placements in viewBox units (`LABEL_SPECS`), plus
  `COMPACT_PLACES` for the compact layout. Label text is `max(8px, 0.95cqw)`: one drawing unit is 1 cqw / 10, which
  relies on the viewBox being 1000 wide.
- The compact layout renders `detail: 'simplified'` (`ecogeo-card.ts` overrides it), so any change to the simplified
  drawing moves the compact drawing too.
- `dev/overlaps.ts` (shared by `scripts/measure-layout.mjs` and `test/card/overlaps.browser.test.ts`) compares label
  boxes with label boxes and with component group boxes. Pipes are `path.pipe[data-segment]` (and the helix halves
  of coils 51 and the external tank's coil); the captions are `text.circuit-label`, `text.source-caption` and
  `text.tank-caption`.
- Home Assistant sets `isPanel` on a card in a panel view (it also sets `layout`, `preview` and `editMode`; a getter
  without a setter for such a name broke the card in `add-compact-layout` ?v=6).

## Goals / Non-Goals

**Goals:**

- One measuring stick for "overlaps the drawing" that includes pipes and captions, used for the threshold, the
  compact places and the browser guard.
- A simplified arrangement whose topology is the full one's by construction, so the existing topology rules hold
  without re-proving them by hand.
- `detail: full` renders byte-for-byte as today.

**Non-Goals:**

- Changing label font sizes or the 8 px and 10 px floors.
- Measuring pipe overlaps at `detail: full`.
- A height fit outside panel views (sections and masonry views size cards themselves).

## Decisions

### D1. The arrangement is a value

`geometry.ts` gains an `Arrangement` value: viewBox, cabinet, zone constants (source, tank, internal tank 50), components,
segments, crossings, circuit-label positions, label placements and compact places. `arrangementFor(level)` returns the
`full` arrangement (today's constants, unchanged) or the `simplified` one. Every consumer (`cabinet.ts`, `source.ts`,
`dhw.ts`, `pipes.ts`, `labels.ts`, `component-info.ts`, the card's viewBox, the emulator and the overlap tools) reads
the arrangement from the draw context instead of module constants. The choice of arrangement is a pure function of
the shown layout and the detail level (D7 says when compact switches).

Alternative: keep module constants and branch on `detail` at each use. Rejected: dozens of call sites, and nothing
stops a consumer from mixing the two arrangements.

The refactor lands first with both levels returning today's coordinates, guarded by a markup snapshot test (D8), so
it is provably a no-op before any coordinate changes.

Settled in group 2: the zones are a `ZoneBase` of primary values from which `deriveZones` computes the dependent
ones; components and segments are factories of the zones. The label placements live in `src/diagram/label-places.ts`
(imported by `geometry.ts`, which avoids a cycle with `labels.ts`), and the arrangement carries their result as
`labels`. `DrawContext.arrangement` is optional, with `arrangementOf(context)` falling back to
`arrangementFor(context.detail, 'full')`. Coil 51's local port frame (`COIL_LOCAL_PORTS`) stays a shared constant,
since symbols keep their size. Every arrangement keeps the viewBox 1000 wide (label text is sized in cqw); only the
height changes. The run's y values (85, 50) in the paths of ports 5/6 (`dhw_ext_in`, `dhw_ext_out`) are taken from
the zones' `run`, like the source's run, so the two cannot diverge. `arrangementFor` has direct unit tests (the
compact rule of D7, purity, the context fallback).

### D2. The simplified cabinet is the full one under a monotone map

The simplified arrangement's cabinet contents (component anchor points of items 7-17, 22, 25-38, 44, 45, the
segments' points, the crossings, internal tank 50 and coil 51 on model C, the circuit-label positions) are the full
arrangement's points under a pair of monotone piecewise-linear maps `fx`, `fy`. Symbols keep their size; only
positions move.

Why: a monotone map per axis keeps every horizontal pipe horizontal and every vertical pipe vertical, and keeps the
left-right and top-bottom order of all points. So the port order of connections 1-6, the probe placements (33, 34,
31, 32, 30, 29 on their lines), the HTR placement (exchanger 9 between compressor 11 and valve 14), the crossings and
their hops, and "no crossing outside the cabinet" carry over by construction. What a map can break is clearance: a
compressed interval can push two symbols, or a symbol and a pipe, into each other. So the maps only stretch, except
for the empty bottom band.

Starting values (tuned with the D4 check, recorded in the docs when final):

- `fx`: cabinet x 240-760 maps to about 200-820 (width about 620). The extra width goes mostly to the lanes the labels
  use: the probe lane at the left (probes 33, 34, about x 240-300), the core between valve 14 and evaporator 7, and the
  brine lane at the right (probes 31, 32, pump 16, pressure 37, about x 610-760).
- `fy`: identity down to the lowest part the simplified level draws in the cabinet (exchanger 10's bypass loop, about
  y 500); the band below it is cut, and the cabinet's bottom edge moves up to about 40 units under that part. The
  viewBox height shrinks by the same amount (about 620 to 530).
- Overrides: pressure transducer 38 (manual item 38, on the production return's stub) and its stub, which sit in the
  cut band, get an explicit place above the new bottom edge on the production return side. Any other override is a
  named exception in the simplified table, with its reason.

Alternatives: a second hand-placed table (doubles about 400 lines of coordinates, and every topology rule must be
re-checked by hand); an SVG transform of the whole drawing (scales symbols and text with it, so labels and pipes
keep the same ratio and nothing gets less cramped).

### D3. Smaller source and tank through their zone constants

The source zone (air unit, ground loop, hybrid) and the external tank are not mapped point by point: they have inner
shapes (coil passes, fins, slats, the loop's U, the tank's dome and helix) that a non-uniform map would distort. The
simplified arrangement instead has its own zone constants: the same shapes at a uniform scale (about 0.8) with the
top of the air unit's housing, the ground line and the tank's dome still on the cabinet's top line
(outer-loop-source, dhw-storage). The pipes of the source (`coilPath`, `loopHalf`, the run above the cabinet at
`SRC_OUT_Y`/`SRC_IN_Y`) and the coil pipes of ports 5/6 are already generated from these constants, so they stay
connected. The source zone ends at about x 190 and the tank zone starts at about x 840, which gives the cabinet its
width. Labels placed from these constants (fan, outside, the air unit's ports, the ground legs, the tank's stack)
follow them.

Settled in group 3 (D2 and D3): `fx` has slope 1 over every span a component's ports cover (symbols keep their size,
so the pipes on their ports keep their distance); the extra 100 units go only into the gaps between those spans.
`fy` is the identity down to y 505 and only cuts below it: rows y 214-428 are covered by ports throughout, and
stretching the remaining gaps would only make the cabinet taller, against the goal. The cabinet is x 200-820,
y 130-530 (exchanger 10 ends at y 501, so the bottom edge stays 29 units under it), and the viewBox 1000 x 545.
Overrides: pressure transducer 38 at y 470 between exchanger 10's production lines, its stub `prod_tap_a` ending
there, and the crossing of that stub with `prod_10_in` removed since the stub no longer reaches that line. The source
departs from a pure 0.8 scale (air unit 6 units left, ground legs about 5 left, run columns at x 187 and 169, a few
units right of their scaled 180.8 and 164.8, and the hybrid return at x 6) so the port labels clear the cabinet and
the feed pipe; the tank's sizes are rounded to whole units (134 x 144, dome 11) so the
helix ends stay inside its box.

### D4. Pipe- and caption-aware overlap check

`dev/overlaps.ts` gains two inputs, read in the page like the label boxes:

- Pipes: every `path.pipe` in the drawing is sampled along its length (`getTotalLength`, `getPointAtLength`, mapped
  to page px with `getScreenCTM`) at 1 px steps of rendered length, each sample inflated to a square of the path's
  rendered stroke width. A label overlaps a pipe when a sample square shares more than `TOLERANCE` px with its box in
  both directions. Hops are gaps in the path data, so a label over a hop's gap does not count.
- Captions: the `text.circuit-label`, `text.source-caption` and `text.tank-caption` elements, boxed like labels
  (em box, half-leading trimmed). A caption overlapping a label or a pipe counts.

`overlapPairs` reports `label x pipe:<segment id>`, `caption:<text> x label` and so on, so failures name the pipe.
The labels inside tank 50 (`bare`) stay excluded from tank 50 and also from coil 51's pipes, which they sit above by
design. Coil 51 is a symbol, not a `path.pipe`, so the rule is by place: a `bare` label ignores pipe samples that lie
wholly inside tank 50's box (settled in group 1). The helix halves (`path.pipe[data-half]`) take the segment id of
their `g.helix[data-segment]`. A caption inside a part's group (ground loop, air unit, tank) is already checked
against labels as that part, so it is checked only against pipes, not again against labels. Samples at a pipe's ends
reach half a stroke width past a butt cap; that overshoot is accepted as part of the measure. Measured in group 1 on today's drawing, the threshold with pipes and captions counted
is 700 px (640 px without them).

Alternative: compute pipe rectangles from the geometry data. Rejected: the check would have to rebuild the card's
draw context from the URL, and would test the data instead of what renders (stroke widths grow on small cards).

### D5. Superheat and expansion valve opening at the full level only

The two label specs get the same `detail: 'full'` visibility mark the parts have, decided by the same `partState`
rule. Valve 12 keeps its tap target (`component-info.ts`, `refrigerant.expansion_valve`), so the opening stays one
tap away. The compact layout's key set is unchanged.

### D6. Simplified label placements

The simplified arrangement's label placements start as the full placements under the same maps (D2) or zone
constants (D3), and then labels that the D4 check still reports get a hand-picked place, listed in a
`SIMPLIFIED_PLACES` table with a one-line reason each (like `COMPACT_PLACES`). Known ones from the live screenshot:
brine outlet and inlet (probes 31, 32) and pump 16's speed clear of pipes 3/4, the heating demand text clear of the
cabinet's top edge, the DG1 setpoint clear of the run pipes. The threshold is then re-measured with the D4 check
(`npm run measure-layout`). The target is the spec's: at most 640 px. If the arrangement cannot reach it, that is a
decision point for the user before the group closes, not a silent higher threshold.

Settled in group 4: the wider cabinet already clears the brine outlet and inlet, pump 16's speed and the DG1 setpoint
of every pipe from 600 px up, so they get no simplified place (a place would be an exception with no reason). The
places are the air unit's Out value, the fan and outside values, the compressor stack (pitch 14 instead of 12) and
the DG1 demand text. To reach 600 px the simplified air unit moved 6 more units left (12 in all) and the run's feed and
return columns 3 units right (x 190 and 172), changing the group 3 values. The threshold with pipes and captions
counted is 600 px (`COMPACT_BELOW`). At 580 px the only pairs are the air unit's Out value against its feed pipe in
defrost; from 560 px down they are vertical row conflicts (probe temperatures against pressures, fan against outside,
tank 50's setpoint against its demand) that no further place was sought for. The superheat and valve opening specs
stay in the simplified arrangement, hidden by `partState`. The check also counts a label whose box leaves the
drawing (`label x edge`), since the ground loop's Out value crossed the left edge at 600 px and no other pair saw it;
the ground and hybrid Out values get simplified places to stay inside. The Out value (about 77 units) did not fit
between the drawing's edge and the up leg (about 80), so the simplified ground loop's legs moved right (up leg x 84,
down leg x 130, 46 apart), and the In value got a place of its own to still end left of the cabinet.

### D7. Compact switches in its own step

Until the compact places are searched again, the compact layout keeps drawing the full arrangement with the simplified
filter (today's compact drawing): `arrangementFor` takes the shown layout. A later group switches compact to the
simplified arrangement and searches the compact places again, at 320 px, with pipes as obstacles, using a committed
script (`scripts/search-places.mjs`, `npm run search-places`) built on `dev/overlaps.ts`, so the search can be
repeated. The rules of the first search stay: the label stays on its side of the cabinet outline (`LABEL_SIDES`), a
place nearer its own probe wins, and about 2 px of margin at 320 px for the Chromium-WebKit text-width difference.

Settled in group 5 (the user's choice): with pipes as obstacles, five compact labels have no joint place at 320 px on
the simplified arrangement (production Out and In, brine Out and In, the compressor speed). Every free spot for them
lies in one pocket at the cabinet's bottom right, one label wide; the full arrangement already failed for three of
them. These five may lie on a pipe, over their background plate (`ON_PIPE_COMPACT`, a named set): the search places
them with pipes ignored for them, and the compact guard checks them against labels, components and the drawing edge,
and every other compact label against pipes too. The compact layout draws the simplified arrangement. The DHW
values keep clear of pipes, so the nearest free places are some way from their tanks (the external tank's value
above the run at the top right, tank 50's at the cabinet's bottom right on model C); their "DHW" caption is what
names them, so they stay out of `ON_PIPE_COMPACT`. A pair of Out and In values must read in probe order at every
compact width, not only at 320 px: the search keeps each Out and In label's home alignment, and requires, for both
pairs, that the Out box lies left of the In box or, where the two boxes overlap horizontally (they form a column),
that the Out box lies above the In box. Both pairs' probes sit side by side (Out on the left), but at phone width the
production values only fit in the free rows well below their probes, where a column reads naturally; a plain
left-right rule pulled production In next to the compressor. A browser test checks the order at the guard widths.
The five on-pipe labels search with a 2 px vertical margin, so their plates clear the probes.

### D8. Markup snapshot as the no-change guard

A unit test renders the card (happy-dom) for every capture configuration in `dev/captures.ts` with sample states and
compares the SVG markup and the label positions with a stored snapshot. Recorded before the refactor of D1, it must
pass unchanged after it. When the simplified arrangement lands, only the simplified snapshots are updated, on
purpose; the `detail: full` snapshots must still pass, which is the "full level unchanged" scenario.

Settled in group 2: one snapshot file per capture (`toMatchFileSnapshot`), so `git diff --stat` shows which captures
changed and that the `detail: full` ones did not. Since only two captures used `detail: full`, the capture list gains
`detail: full` captures for an air unit, a hybrid source, `dhw: none` and variant 1, recorded on the code before the
D1 refactor.

### D9. Panel fit

`isPanel` becomes a plain reactive property of the card (no getter-only accessor). In a panel view the drawing's
width is `min(card width, (window height - header height - footer allowance) * viewBox width / viewBox height)`,
with the header height read from Home Assistant's `--header-height` (56 px if unset) and a fixed footer allowance
sized for one footer line plus padding. The width is a pure, unit-tested function of those inputs and the
arrangement's ratio; the card sets it as the `.diagram`'s `max-width`, centred, and recomputes it on the window's
`resize`. The layout choice (`nextCompact`) and the stroke widths take this drawing width instead of the card's
width, so the labels (cqw of `.diagram`) and lines stay consistent with what is drawn. Derived state: inputs
`isPanel`, the card width, `window.innerHeight`, `--header-height` and the arrangement.

Note from group 4: the footer wraps to two lines for longer modes (Passive cooling) at drawing widths of 600-620 px.
A panel's drawing width only gets that narrow in a very short window; the footer allowance should cover two lines
there, or the fit accepts a wrapped footer slightly below the fold at such heights.

Settled in group 6: `drawingWidth({ isPanel, cardWidth, windowHeight, headerHeight, viewBox })` returns the card
width outside a panel, else `min(cardWidth, max(floor((windowHeight - header - safeAreaTop - 64) * vbW / vbH), 320))`
(the floor is the narrowest verified compact width; `safeAreaTop` per the next paragraph); the footer
allowance of 64 px covers two footer lines, so a wrapped footer still fits. The layout is decided on the width
computed with the configured detail level's full-layout viewBox; the shown arrangement's ratio then sets the final
width (compact uses the simplified ratio, which is never narrower, so the choice cannot depend on itself). The
`.diagram` gets `max-width` and auto margins only when the fitted width is below the card width. The emulator's
panel mode sets `--header-height: 56px` and draws a mock header bar of that height. No helper was copied (D10).

Also settled in group 6, after review: Home Assistant's panel view sets `layout = "panel"` on the card element, but
`isPanel` only in `hui-card`'s update and not when it rebuilds the card (a late-loading resource, every edit in the
editor). So the card is in a panel when `isPanel === true` or its element property `layout === 'panel'`; `layout` is
declared as a plain reactive property (no accessor), separate from the config's `layout` option. The header offset is
`--header-height` plus `--safe-area-inset-top` (0 if unset), matching the padding of Home Assistant's view container
on devices with a top inset. A mobile browser's address bar changes `innerHeight` while scrolling; the fitted width
then follows, which is accepted (the layout choice keeps its hysteresis). Outside a panel the card reads no styles and
ignores window resizes.

Alternative: CSS only (`aspect-ratio` with `max-height`). Rejected: a block's auto width does not shrink from a
max-height through its aspect ratio in every engine, and the layout decision needs the width in JS anyway.

The emulator gets `panel=1` (URL and a control), which sets `isPanel` and gives the card slot the window's width,
so a 1280 x 800 capture shows the fit.

### D10. Helpers from hrv-ventilation

None are copied in this change. If an implementer finds one worth copying (for example for the panel fit), the copy
names its source file and deviations in a header comment and in this design before the group closes.

## Risks / Trade-offs

- [Clearance lost where a map or an override moves a symbol] → invariant tests on the simplified arrangement: every
  part inside its zone, no two part boxes overlapping, every crossing a hop, the crossing count at most
  `MAX_CROSSINGS`, no crossing outside the cabinet; plus the D4 check in the browser guard.
- [The ≤ 640 px threshold may not be reachable with pipes counted] → stop and ask the user (D6); options then are
  more width for the cabinet, fewer simplified labels, or a higher threshold.
- [The compact places may not all fit with pipes as obstacles at 320 px] → the search reports which label has no
  place; a decision point for the user (move it to the footer, or allow it on a pipe with its background plate).
- [Sampling makes the check slower] → 1 px steps on about 60 paths per card is a few thousand points; the browser
  guard runs one width per case. If the measure script becomes too slow, sample at 2 px with the tolerance unchanged.
- [Panel fit and layout flips] → the drawing width in panel views changes with the window height, so resizing a
  window can cross the threshold; the existing 24 px hysteresis applies to the drawing width the same way.
- [Snapshots are brittle] → they cover only the capture list, and the test names the capture that changed, so an
  intended change updates one known set.

## Migration Plan

No config migration: `detail` keeps its values and default; the live card's config and dashboard stay as they are.
Rollout as before: `npm run release`, deploy `dist/ecogeo-card.js`, bump the resource's `?v=`, hard-refresh, light
screenshots at phone, tablet and desktop width. Rollback: redeploy the previous `dist/ecogeo-card.js` from git and bump
`?v=` again.
