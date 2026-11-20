# Spec Delta

## MODIFIED Requirements

### Requirement: Layout hysteresis
With `auto`, a card that `auto` put in vertical SHALL return to horizontal only once it is at least 24 px wider than
the vertical threshold, so a page scrollbar that appears or disappears with the layout's height cannot make the layout
flip back and forth. A vertical layout forced by `layout: vertical` SHALL NOT count: after a switch to `auto` the card
shows what a newly loaded card of that width shows.

#### Scenario: No flip at the threshold
- **WHEN** the config sets no `layout`, the card is vertical, and it widens to 10 px above the threshold
- **THEN** it stays vertical, and it shows the horizontal layout once it is 24 px or more above the threshold

### Requirement: Minimum rendered sizes
At any card width, pipes SHALL render at least 2 px wide and component outlines at least 1.25 px wide. Value labels
SHALL render at least 10 px high in both layouts. The footer SHALL wrap onto further lines rather than overflow the
card.

#### Scenario: Thin card
- **WHEN** the card is 360 px wide, in either layout
- **THEN** every pipe's rendered stroke is at least 2 px and every label's font size at least 10 px

#### Scenario: Wide card
- **WHEN** the card is 1000 px wide in the horizontal layout
- **THEN** every label's font size is at least 10 px

#### Scenario: Footer wraps
- **WHEN** the card is 320 px wide
- **THEN** the footer's items wrap within the card and none is cut off

### Requirement: Panel view fits the screen
In a panel view the card SHALL keep its drawing and footer within the screen's height below Home Assistant's
header: when the card's width would make the drawing taller than that, the drawing SHALL be narrower and centred,
and the layout and line widths SHALL follow the drawing's own width. The drawing SHALL NOT get narrower than 320 px,
the narrowest verified width of the vertical layout; in a window too short for that, the view scrolls. Outside a
panel view the drawing SHALL fill the card's width.

#### Scenario: Desktop panel
- **WHEN** the card is in a panel view in a 1280 x 800 px window
- **THEN** the footer is within the window without scrolling, and the drawing is centred

#### Scenario: Not a panel
- **WHEN** the card is in a sections or masonry view 1000 px wide
- **THEN** the drawing is 1000 px wide

## ADDED Requirements

### Requirement: Layout choice
The card SHALL accept a `layout` option: `auto` (the default), `horizontal` or `vertical`. With `horizontal` or
`vertical` the card SHALL use that layout at any width. With `auto` it SHALL use vertical while the card is narrower
than the vertical threshold and horizontal otherwise; before the card's width is known it SHALL use horizontal.

#### Scenario: Auto on a phone
- **WHEN** the config sets no `layout` and the card is 360 px wide
- **THEN** the card shows the vertical layout

#### Scenario: Auto on a wide card
- **WHEN** the config sets no `layout` and the card is 1000 px wide
- **THEN** the card shows the horizontal layout

#### Scenario: Forced horizontal
- **WHEN** the config sets `layout: horizontal` and the card is 360 px wide
- **THEN** the card shows the horizontal layout

#### Scenario: Forced vertical
- **WHEN** the config sets `layout: vertical` and the card is 1000 px wide
- **THEN** the card shows the vertical layout

### Requirement: Vertical threshold
The vertical threshold SHALL be the narrowest card width, on a grid of 20 px steps from 320 to 800 px, at which the
horizontal layout shows no overlap (see "Labels clear of everything") in any emulator scenario with every label
keeping the place search's margin of 2 px, which covers the text width difference between the browser engines, and
at a place its own requirement allows (a probe pair's values at their pair, a hydraulic value beside its part, a
body's value inside its body), and no wider width on that grid falls short of it. It SHALL be recorded in the docs
with how it was measured, including the label box, the margin and the tolerance the result depends on.

#### Scenario: No overlaps above the threshold
- **WHEN** the emulator captures every scenario in the horizontal layout at the threshold width, at 800 px and at
  1000 px
- **THEN** no overlap is found

#### Scenario: Threshold recorded
- **WHEN** the docs' layout section is read
- **THEN** it names the threshold in px, the grid it was searched on, and the label box and tolerance used

### Requirement: Same values in both layouts
Both layouts SHALL draw the same parts and show the same value labels (live-values "Values on the drawing") and the
same footer (live-values "Footer"). They SHALL differ only in the arrangement: the vertical layout's cabinet is taller
relative to its width, so the drawing is taller than the horizontal one at the same width.

#### Scenario: Same labels
- **WHEN** the same configuration and states are rendered once with `layout: horizontal` and once with
  `layout: vertical`
- **THEN** both show the same set of value labels with the same texts, and the same footer items

#### Scenario: Vertical is taller
- **WHEN** the same configuration is rendered 400 px wide once with `layout: horizontal` and once with
  `layout: vertical`
- **THEN** the vertical drawing's height-to-width ratio is larger than the horizontal one's

### Requirement: Labels clear of everything
In a layout's verified range no value label SHALL overlap another label, a component, a pipe at its rendered stroke
width or the drawing's edge, and no label SHALL cross the cabinet outline or the outline of the body it sits in (the
emitter, the air unit, the ground collector or the external tank). The verified range of the vertical layout SHALL be
every width from 320 px to the vertical threshold, and that of the horizontal layout every width from the threshold up.

#### Scenario: Vertical on phones
- **WHEN** the card shows the vertical layout at 320, 360, 412 px or 1 px under the threshold, in any emulator
  scenario
- **THEN** no label overlaps another label, a component, a pipe or the drawing's edge, and none crosses an outline

#### Scenario: Forced horizontal on a phone
- **WHEN** the config sets `layout: horizontal` and the card is 320 px wide
- **THEN** the card renders without an error; overlaps are allowed, as the width is outside the horizontal layout's
  verified range

### Requirement: No in-drawing captions
Neither layout SHALL draw in-drawing captions that name a group or part, such as "DG1", "Outer loop", "DHW", "Air
unit", "Ground loop" or "DHW tank". The tooltips (component-info) name the parts. The Out and In captions of the
cabinet's probes 31-34 stay; a value inside a body (the air unit, the ground collector, a tank or the emitter) has no
caption.

#### Scenario: No captions
- **WHEN** the card renders in either layout
- **THEN** no "DG1", "Outer loop", "DHW", "Air unit", "Ground loop" or "DHW tank" caption is drawn

## REMOVED Requirements

### Requirement: Layout option
**Reason**: The layouts are now horizontal and vertical; `full` and `compact` are no longer accepted.
**Migration**: See "Layout choice". Replace `layout: full` or `layout: compact` with `horizontal`, `vertical` or no
`layout`.

### Requirement: Compact threshold
**Reason**: There is one drawing level and the compact layout is gone; the threshold now decides between horizontal
and vertical.
**Migration**: See "Vertical threshold".

### Requirement: Compact content
**Reason**: Both layouts show the same values and footer; the reduced compact set is replaced.
**Migration**: See "Same values in both layouts" and live-values "Values on the drawing".

### Requirement: Compact captions and label sides
**Reason**: No layout draws in-drawing captions any more, and no value may lie on a pipe in either layout; the side
rule is replaced by the band arrangement, where each value sits at or inside its own part.
**Migration**: See "Labels clear of everything".
