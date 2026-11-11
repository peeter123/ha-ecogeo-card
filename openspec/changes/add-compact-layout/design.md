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

### D2. Two label tiers
Each label spec in `labels.ts` gets `tier: 'key' | 'detail'`. Key: `production.outlet_temperature`,
`production.return_temperature`, `brine.outlet_temperature`, `brine.inlet_temperature`, `compressor.speed`,
`dhw.temperature`, and the source's outlet (`source.air_unit_outlet_temperature` at the air unit, the ground
loop's outlet label at a ground loop). Everything else is `detail`, including the "Demand" captions. Compact renders
key labels only. Footer items get the same tier: mode, COP, outside temperature, alarm and offline are key.

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
`max(8px, 0.95cqw)`. The footer becomes a wrapping flex row (`flex-wrap: wrap`, row and column gaps), in both
layouts.

### D6. Measuring the threshold
The emulator gains a width control and a layout select (URL `width=`, `layout=`). A measurement task captures every
scenario in the forced full layout at widths from 320 to 800 px in 20 px steps and, per width, checks label
overlaps in the DOM (bounding boxes of the label elements against each other and against the component groups'
boxes), with Playwright in `scripts/`. The threshold is the narrowest width with zero overlaps in every scenario,
rounded up to 10 px; it becomes the constant in `src/lib/layout.ts` and is recorded in the docs with the date and
method.

## Risks / Trade-offs

- [The threshold is above typical tablet widths, so tablets get compact] -> acceptable; `layout: full` forces it.
- [ResizeObserver loops (re-render changes size)] -> the card's height follows the width through the aspect ratio
  only; the footer wrap can change height but not width, so no loop. Guard: ignore observations whose width did
  not change.
- [Overlap check misses visual overlaps with pipes] -> the agent's screenshot inspection at 360 px and at the
  threshold covers what the bounding-box check cannot.

## Migration Plan

The live panel view is wider than the threshold, so it stays full; the phone app gets compact automatically.
Release, deploy, bump `?v=`. Rollback: revert, redeploy, bump `?v=`.
