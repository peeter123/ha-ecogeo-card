# Proposal

## Why

The drawing is 1000 x 620 units. On a phone (about 360 px wide) it scales to about a third: pipes thinner than
1 px, labels at their 8 px floor colliding with each other and with the drawing, and a footer that runs off the
card. The README now tells people to use a full-width or panel view. The hrv-ventilation cards solved the same
problem with a layout option that drops to a compact set of labels on narrow cards; this card needs the same, so
it can sit on the mobile dashboard.

## What Changes

- A new option `layout`: `auto` (default), `full` or `compact`. With `auto`, the card picks compact below a width
  measured on the emulator captures, and full above it.
- Compact shows the drawing at the simplified detail level, whatever `detail` says, and only the key labels:
  production outlet and return, brine outlet and inlet, compressor speed in rpm, the DHW temperature and the
  source's outlet temperature. The footer shrinks to the mode, the COP and the outside temperature, wrapping onto
  two lines when needed.
- Line widths never render thinner than a minimum in pixels, at any card width: on small cards the strokes grow in
  drawing units.
- Labels in compact use a larger minimum font size.
- Docs and README updated; release, deploy and resource bump.

## Capabilities

### New Capabilities

- `responsive-layout`: how the card adapts to its width: the `layout` option, the automatic choice, what compact
  shows and leaves out, and the minimum rendered line width and font size.

### Modified Capabilities

- `card-config`: the option `layout` (builds on `refine-schematic-drawing`, which must be archived first).
- `dev-emulator`: a card-width control and a layout select, and captures at phone widths.
- `live-values`, `schematic-drawing`, `dhw-storage`, `outer-loop-source`: the requirements that list values,
  captions or the detail level apply in full to the full layout and name what the compact layout keeps (added
  before archiving, from the whole-change review).

The layout the card shows is a derived state: its inputs are the `layout` option, the card's measured width and
the layout shown so far (the hysteresis); it is a pure, unit-tested function (`nextCompact`).

## Out of scope

- A portrait re-layout of the drawing (source above, DHW below): only if compact proves too cramped, as a later
  change.
- Hover tooltips on touch devices beyond what `refine-schematic-drawing` gives (tap opens more-info).
- The visual editor: `add-card-editor` (it will expose `layout`).

## Impact

- Code: `src/card/ecogeo-card.ts` (ResizeObserver, layout state), `src/diagram/labels.ts` (a tier per label),
  `cabinet.ts`/`source.ts`/`dhw.ts` (stroke width from a CSS variable), `src/config/options.ts`, the emulator
  (`dev/`, viewport widths in `dev/captures.ts` and `dev/url-state.ts`). A copy of hrv-ventilation's compact-layout helper
  (`isCompact`, from its `src/diagram/labels.ts`), with a header naming the source.
- Live installation: yes. Release, explicit deploy, resource `?v=` bump. The existing panel view keeps `full` by
  width; the change is visible on the phone app.
