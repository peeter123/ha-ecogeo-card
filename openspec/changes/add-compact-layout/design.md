# Design

## Context

The card renders one `<svg viewBox="0 0 1000 620">` scaled to the card width, with HTML value labels overlaid at
percentage positions; label font sizes follow the card width through container units (`max(8px, 0.95cqw)`), and
`getGridOptions()` asks for the full section width. After `refine-schematic-drawing`, pipes are 3 units and
outlines 2 units, and the drawing has a simplified detail level. hrv-ventilation solved narrow cards with
`layout: auto | full | compact`, a ResizeObserver on the card and `isCompact(layout, width)` in its
`src/diagram/labels.ts`. See proposal.md for the motivation.

## Goals / Non-Goals

**Goals:**
- Legible on a 360 px phone without changing the drawing's topology or geometry.
- One threshold, measured rather than guessed, and recorded.

**Non-Goals:**
- A second geometry (portrait layout).
- Per-label hiding rules beyond two tiers.

## Decisions

### D1. Layout state from a ResizeObserver
Copy hrv's `isCompact(layout, width)` (header naming `src/diagram/labels.ts` of hrv-ventilation; deviation: the
threshold constant is this card's own) into `src/lib/layout.ts`. The card observes its own width with a
ResizeObserver (connected in `connectedCallback`, disconnected in `disconnectedCallback`), stores the width in a
`@state`, and re-renders only when the computed layout or the stroke scale changes, so `shouldUpdate`'s
entity-based gating stays intact for state updates. Unknown width (0 or before the first observation) means full.
Hysteresis (from the group 1 review): once group 2 makes compact shorter than full, the page scrollbar can appear
and disappear as the layout flips, changing the card's width by about 15-17 px near the threshold; the
unchanged-width guard does not stop that. With `auto`, a compact card returns to full only at the threshold plus
24 px (`COMPACT_HYSTERESIS` in `src/lib/layout.ts`); going compact still happens below the threshold. The decision
takes the current layout as an input and stays a pure, unit-tested function. Only a compact layout that `auto`
chose counts (group 2 review): after a switch from `layout: compact` to `auto` the card shows what a newly loaded
card of that width shows. The width-only branch of
`shouldUpdate` also re-renders when the stroke scale of D4 changes, not only on a layout flip.

### D2. Two label tiers
Each label spec in `labels.ts` gets `tier: 'key' | 'detail'`. Key: `production.outlet_temperature`,
`production.return_temperature`, `brine.outlet_temperature`, `brine.inlet_temperature`, `compressor.speed`,
`dhw.temperature`, and the source's Out port label (since refine-schematic-drawing D14: `air_unit_out` with
`source: air`, `ground_out` with `source: ground`, `hybrid_ground_out` in the hybrid, which shows no air unit Out).
Everything else is `detail`, including the "Demand" captions. Compact renders
key labels only. Footer items get the same tier: COP and outside temperature are key; the mode, alarm and offline
indications are card texts that always show, in both layouts. In-drawing captions (SVG text such as "DG1",
"Outer loop", "Air unit", "Ground loop", "DHW tank") are not drawn in compact: at 360 px they would render at
about 4 px (user decision, group 2 review).

### D3. Detail forced to simplified in compact
The resolved config keeps the user's `detail`; the render context passes `simplified` when the layout is compact.
No geometry change.

### D4. Stroke scale
`scale = width / 1000`. The card sets CSS custom properties on the svg: `--pipe-width: max(3, 2 / scale)` and
`--outline-width: max(2, 1.25 / scale)` (in drawing units, computed in TypeScript, rounded to 0.1), which the
stroke rules of `refine-schematic-drawing` read instead of their constants. The dash pattern of the flow overlay
scales with `--pipe-width`. Hop gaps scale too.
Alternative considered: `vector-effect: non-scaling-stroke` with px widths. Rejected: it also keeps strokes thin on
large screens, and hop gaps and dash patterns are in drawing units.

### D5. Label font floor
In compact the label font becomes `max(10px, 1.6cqw)` (key labels are few, so they can be larger); full keeps
`max(8px, 0.95cqw)`. In compact the external tank's emphasised temperature uses `max(11px, 1.9cqw)` and value
captions (In, Out) render at 1em instead of 0.85em, so no caption falls under 10 px. The footer becomes a wrapping flex row (`flex-wrap: wrap`, row and column gaps), in both
layouts.

### D6. Measuring the threshold
The emulator gains a width control and a layout select (URL `width=`, `layout=`). A measurement task captures every
scenario in the forced full layout at widths from 320 to 800 px in 20 px steps and, per width, checks label
overlaps in the DOM (bounding boxes of the label elements against each other and against the component groups'
boxes), with Playwright in `scripts/`. The threshold is the narrowest width with zero overlaps in every scenario,
on the 20 px grid (with every wider grid width also clean); it becomes the constant in `src/lib/layout.ts` and is
recorded in the docs with the date and method. First measured 2026-11-11: 700 px, limited by the compressor's
speed, percentage and power rows (pitch 11 units) touching at the 8 px font floor. After the group 2 review the
user chose to space those rows further apart (pitch 12); re-measured 2026-11-11: 640 px (every case fails at
620 px), so compact returns to full at 664 px. Labels are compared by their em boxes (the half-leading trimmed, since the stacked compressor rows' line
boxes overlap at every width) with a 0.5 px tolerance; with no tolerance the threshold would be about 740 px at pitch 11 and 680 px at
pitch 12. The
docs say both choices decide the result.

### D7. Browser tests
happy-dom has no layout: no ResizeObserver callbacks from real sizes, no container units, no wrapping, no rendered
stroke widths. Copy hrv-ventilation's setup: a second Vitest project `browser` (`@vitest/browser-playwright`,
headless Chromium, files `test/**/*.browser.test.ts`) beside the happy-dom `unit` project, which excludes them;
`npm test` runs both, `test:unit` and `test:browser` run one. The scenarios that depend on layout are browser tests:
the automatic layout at real widths, no overlaps at the threshold (the measurement script's boxes, as a regression
guard), the rendered minimum stroke and font sizes, and the wrapping footer. Pure logic (`isCompact`, the stroke
scale, the tiers) stays in unit tests. Chromium is installed once per machine with `npx playwright install chromium`.
After the group 2 review the browser project runs in WebKit as well as Chromium (the iOS companion app is
WebKit), because the stroke rules use CSS math in SVG properties and keyframes.
Alternative considered: mocking ResizeObserver and computed styles in happy-dom. Rejected: it tests the mock, not
the rendered sizes the spec names.

### D8. Compact label places
At 320-360 px the compact labels (at their 10 px floor) collide with each other and with components in their
full-layout places. Key labels that collide get a second place used only in compact (`COMPACT_PLACES` in
`src/diagram/labels.ts`), chosen by a search at 320 px over every scenario and installation. Labels move; the
drawing's geometry does not. A browser test checks no overlaps in the compact layout at 320, 360, 480 and 639 px (just below the threshold),
with the same overlap definition as D6. 320 px is the narrowest supported card width. After the group 2 review
(user decision) the search also treats the cabinet outline as an obstacle in compact: every value label stays on
the side of the wall where its component is (production and brine values inside the cabinet, source values
outside it). In compact the production and brine values carry short Out and In captions (the port captions'
strings), because their compact places do not show which of a pair is which (user decision, group 2 round 2); the
place search runs with the captioned label widths and prefers a place nearer the label's own probe than its pair's.
The brine outlet gets that; the brine inlet did too until task 2.5 (see the end of D8: with the widest value it
sits low beside pressure 37). The production pair does not fit near probes 33 and 34 at 320 px (a strip of about 27
units against a label about 31 units tall), so both production values sit in the cabinet's lower left and are told
apart by their captions. The browser test checks the side as well.
Margin rule (task 2.5, 2026-11-12): where a place's clearance depends on the label's text width (an edge that
moves with the width: the far edge of a start or end aligned label, either edge of a middle aligned one), the
place keeps at least about 2 px of clearance at 320 px in both Chromium and WebKit, with the widest value the
scenarios produce, because Chromium rounds text widths to whole pixels and its widths differ from WebKit's by
1-2 px and between environments. Clearances set by the em box or an anchored edge are the same in both engines and
need no extra margin. In compact the tank value (internal and external tank) carries a short "DHW" caption (user
decision, task 2.5 round 1), since its compact place beside the internal tank sits on the brine pipe above the
brine inlet value; the internal tank's value sits right of tank 50, beside its probe. Two-line labels (task 2.5
round 2, user decision): where a captioned compact value does not fit on one line with the margin, its caption
renders on its own line above the value. This applies to the internal tank's value (beside tank 50) and to the
brine inlet (near probe 32, with the widest value the scenarios produce, -12.3; if it does not fit there, it sits
low in the cabinet beside pressure 37). Other compact labels keep one line.
Alternative considered: fewer key labels in compact. Rejected: the seven key values are the point of compact.

## Risks / Trade-offs

- [The threshold is above typical tablet widths, so tablets get compact] -> acceptable; `layout: full` forces it.
- [ResizeObserver loops (re-render changes size)] -> the card's height follows the width through the aspect ratio
  only; the footer wrap can change height but not width, so no loop. Guard: ignore observations whose width did
  not change. The browser's occasional "ResizeObserver loop completed with undelivered notifications" is that
  height change delivered a frame later and ignored by the guard, not a loop; the page scrollbar case is covered
  by the hysteresis (D1).
- [Overlap check misses visual overlaps with pipes] -> the agent's screenshot inspection at 360 px and at the
  threshold covers what the bounding-box check cannot.

## Migration Plan

The live panel view is wider than the threshold, so it stays full; the phone app gets compact automatically.
Release, deploy, bump `?v=`. Rollback: revert, redeploy, bump `?v=`.
