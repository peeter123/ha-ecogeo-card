## MODIFIED Requirements

### Requirement: Compact threshold
The compact threshold SHALL be the narrowest card width, on a grid of 20 px steps from 320 to 800 px, at which the
full layout, at the simplified detail level, shows no overlapping labels in any emulator scenario, and no wider
width on that grid does. Overlapping counts a label with another label, with a component, or with a pipe at its
rendered stroke width, and an in-drawing caption with a label or a pipe. It SHALL be recorded in the docs with how it
was measured, including the label box and tolerance the result depends on.

#### Scenario: No overlaps above the threshold
- **WHEN** the emulator captures every scenario in the full layout at the threshold width
- **THEN** no two labels overlap, no label overlaps a component or a pipe, and no caption overlaps a label or a pipe

#### Scenario: Not wider than before
- **WHEN** the threshold is measured after this change
- **THEN** it is at most 640 px, the threshold before pipes were counted

### Requirement: Compact captions and label sides
The compact layout SHALL draw no in-drawing captions (such as "DG1", "Outer loop", "Air unit", "Ground loop" or
"DHW tank"), every value label SHALL stay on the side of the cabinet outline where its component is, and the
production and brine values SHALL carry short Out and In captions, like the source ports, so each pair can be told
apart. The DHW tank's value SHALL carry a short "DHW" caption, so it cannot be read as a brine value. No compact
label SHALL overlap another label, a component or a pipe.

#### Scenario: Compact without captions
- **WHEN** the card shows the compact layout
- **THEN** no in-drawing caption is drawn, the production and brine values sit inside the cabinet outline with Out
  and In captions, the DHW tank's value carries a DHW caption, and the source's Out value sits outside it

#### Scenario: Compact labels clear of pipes
- **WHEN** the card shows the compact layout at 320, 360, 480 px or just under the threshold, in any emulator
  scenario
- **THEN** no label overlaps another label, a component or a pipe

## ADDED Requirements

### Requirement: Panel view fits the screen
In a panel view the card SHALL keep its drawing and footer within the screen's height below Home Assistant's
header: when the card's width would make the drawing taller than that, the drawing SHALL be narrower and centred,
and the layout and line widths SHALL follow the drawing's own width. Outside a panel view the drawing SHALL fill the
card's width as before.

#### Scenario: Desktop panel
- **WHEN** the card is in a panel view in a 1280 x 800 px window
- **THEN** the footer is within the window without scrolling, and the drawing is centred

#### Scenario: Not a panel
- **WHEN** the card is in a sections or masonry view 1000 px wide
- **THEN** the drawing is 1000 px wide
