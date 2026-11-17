# responsive-layout Specification

## Purpose
How the card adapts to the width it is given: a full layout for wide cards and a compact layout with fewer, larger
labels for phones and narrow sections, with lines and text that never render too thin or too small.

## Requirements

### Requirement: Layout option
The card SHALL accept a `layout` option: `auto` (the default), `full` or `compact`. With `full` or `compact` the
card SHALL use that layout at any width. With `auto` it SHALL use compact while the card is narrower than the
compact threshold and full otherwise; before the card's width is known it SHALL use full.

#### Scenario: Auto on a phone
- **WHEN** the config sets no `layout` and the card is 360 px wide
- **THEN** the card shows the compact layout

#### Scenario: Auto on a wide card
- **WHEN** the config sets no `layout` and the card is 1000 px wide
- **THEN** the card shows the full layout

#### Scenario: Forced full
- **WHEN** the config sets `layout: full` and the card is 360 px wide
- **THEN** the card shows the full layout

### Requirement: Layout hysteresis
With `auto`, a card that `auto` put in compact SHALL return to full only once it is at least 24 px wider than the
compact threshold, so a page scrollbar that appears or disappears with the layout's height cannot make the layout flip
back and forth. A compact layout forced by `layout: compact` SHALL NOT count: after a switch to `auto` the card
shows what a newly loaded card of that width shows.

#### Scenario: No flip at the threshold
- **WHEN** the config sets no `layout`, the card is compact, and it widens to 10 px above the threshold
- **THEN** it stays compact, and it shows the full layout once it is 24 px or more above the threshold

### Requirement: Compact threshold
The compact threshold SHALL be set per detail level. For each level it SHALL be the narrowest card width, on a grid
of 20 px steps from 320 to 800 px, at which the full layout at that level shows no overlapping labels in any
emulator scenario, and no wider width on that grid does. Overlapping counts a label with another label, with a
component, with a pipe at its rendered stroke width, or with the cabinet outline (a label that crosses it), and an
in-drawing caption with a label or a pipe. The card SHALL use the threshold of its configured `detail` level. Each
threshold SHALL be recorded in the docs with how it was measured, including the label box and tolerance the result
depends on.

#### Scenario: No overlaps above the threshold
- **WHEN** the emulator captures every scenario in the full layout at the threshold width of a detail level, at that
  level
- **THEN** no two labels overlap, no label overlaps a component or a pipe or crosses the cabinet outline, and no
  caption overlaps a label or a pipe

#### Scenario: Simplified threshold
- **WHEN** the threshold of the simplified level is measured
- **THEN** it is at most 640 px

#### Scenario: Full detail switches earlier
- **WHEN** the config sets `detail: full` and no `layout`, and the card is wider than the simplified level's
  threshold but narrower than the full level's
- **THEN** the card shows the compact layout, and with no `detail` at the same width it shows the full layout

### Requirement: Compact content
The compact layout SHALL draw the schematic at the simplified detail level whatever `detail` says, and SHALL show
only these value labels: production outlet and return, brine outlet and inlet, compressor speed in rpm, the DHW
temperature, and the source's outlet temperature (the air unit's Out, or the ground loop's Out, which is the heat
pump's brine inlet). The
footer SHALL show the mode, the COP and the outside temperature, plus the alarm and offline indications.

#### Scenario: Compact labels
- **WHEN** the card shows the compact layout in heating mode
- **THEN** the pressures, the superheat, the expansion valve opening, the pump speeds, the compressor percentage
  and power, the DG1 setpoint and the tank setpoint and start delta-T are not shown, and the seven key values are

#### Scenario: Compact footer
- **WHEN** the card shows the compact layout
- **THEN** the footer shows the mode, the COP and the outside temperature, and not the capacities, on/off or season

#### Scenario: Compact ignores full detail
- **WHEN** the config sets `detail: full` and `layout: compact`
- **THEN** no item number and no safety valve is drawn

### Requirement: Compact captions and label sides
The compact layout SHALL draw no in-drawing captions (such as "DG1", "Outer loop", "Air unit", "Ground loop" or
"DHW tank"), every value label SHALL stay on the side of the cabinet outline where its component is, and the
production and brine values SHALL carry short Out and In captions, like the source ports, so each pair can be told
apart. The DHW tank's value SHALL carry a short "DHW" caption, so it cannot be read as a brine value. The compact
layout SHALL draw the simplified arrangement. No compact label SHALL overlap another label, a component or the
drawing's edge, and no compact label SHALL overlap a pipe, except the production and brine values (Out and In) and
the compressor speed: the cabinet at phone width has no room between its pipes for them, so they may lie on a pipe,
over their background plate.

#### Scenario: Compact without captions
- **WHEN** the card shows the compact layout
- **THEN** no in-drawing caption is drawn, the production and brine values sit inside the cabinet outline with Out
  and In captions, the DHW tank's value carries a DHW caption, and the source's Out value sits outside it

#### Scenario: Compact labels clear of pipes
- **WHEN** the card shows the compact layout at 320, 360, 480 px or just under either detail level's threshold, in
  any emulator scenario
- **THEN** no label overlaps another label, a component or the drawing's edge, and no label other than the
  production and brine values and the compressor speed overlaps a pipe

### Requirement: Minimum rendered sizes
At any card width, pipes SHALL render at least 2 px wide and component outlines at least 1.25 px wide. Value
labels SHALL render at least 10 px high in the compact layout and at least 8 px in the full layout. The footer
SHALL wrap onto further lines rather than overflow the card.

#### Scenario: Thin card
- **WHEN** the card is 360 px wide
- **THEN** every pipe's rendered stroke is at least 2 px and every label's font size at least 10 px

#### Scenario: Footer wraps
- **WHEN** the card is 320 px wide
- **THEN** the footer's items wrap within the card and none is cut off

### Requirement: Panel view fits the screen
In a panel view the card SHALL keep its drawing and footer within the screen's height below Home Assistant's
header: when the card's width would make the drawing taller than that, the drawing SHALL be narrower and centred,
and the layout and line widths SHALL follow the drawing's own width. The drawing SHALL NOT get narrower than 320 px,
the narrowest verified compact width; in a window too short for that, the view scrolls. Outside a panel view the
drawing SHALL fill the card's width.

#### Scenario: Desktop panel
- **WHEN** the card is in a panel view in a 1280 x 800 px window
- **THEN** the footer is within the window without scrolling, and the drawing is centred

#### Scenario: Not a panel
- **WHEN** the card is in a sections or masonry view 1000 px wide
- **THEN** the drawing is 1000 px wide
