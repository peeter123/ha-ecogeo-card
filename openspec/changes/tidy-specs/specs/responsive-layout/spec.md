# Spec Delta

## MODIFIED Requirements

### Requirement: Panel view fits the screen
In a panel view the card SHALL keep its drawing and footer within the screen's height below Home Assistant's
header: when the card's width would make the drawing taller than that, the drawing SHALL be narrower and centred,
and the layout and line widths SHALL follow the drawing's own width. Outside a panel view the drawing SHALL fill the
card's width.

#### Scenario: Desktop panel
- **WHEN** the card is in a panel view in a 1280 x 800 px window
- **THEN** the footer is within the window without scrolling, and the drawing is centred

#### Scenario: Not a panel
- **WHEN** the card is in a sections or masonry view 1000 px wide
- **THEN** the drawing is 1000 px wide

### Requirement: Vertical threshold
The vertical threshold SHALL be the narrowest card width, on a grid of 20 px steps from 320 to 800 px, at which the
horizontal layout shows no overlap (see "Labels clear of everything") in any emulator scenario, and no wider width on
that grid falls short of it. It SHALL be measured as in "Threshold measurement conditions".

#### Scenario: No overlaps above the threshold
- **WHEN** the emulator captures every scenario in the horizontal layout at the threshold width, at 800 px and at
  1000 px
- **THEN** no overlap is found

#### Scenario: Threshold recorded
- **WHEN** the docs' layout section is read
- **THEN** it names the threshold in px, the grid it was searched on, and the label box and tolerance used

## ADDED Requirements

### Requirement: Narrowest drawing in a panel view
In a panel view the drawing SHALL NOT get narrower than 320 px, the narrowest verified width of the vertical layout;
in a window too short for that, the view scrolls.

#### Scenario: Short window
- **WHEN** the card is in a panel view in a window so short that the drawing would need a width below 320 px
- **THEN** the drawing is 320 px wide and the view scrolls

### Requirement: Threshold measurement conditions
The vertical threshold SHALL be measured with every label keeping the place search's margin of 2 px, which covers the
text width difference between the browser engines, and at a place its own requirement allows (a probe pair's values at
their pair, a hydraulic value beside its part, a body's value inside its body).

#### Scenario: Margin and places
- **WHEN** the measurement runs at the threshold width
- **THEN** every label keeps a margin of 2 px to everything else and sits at a place its own requirement allows

### Requirement: Threshold documented
The vertical threshold SHALL be recorded in the docs with how it was measured, including the label box, the margin
and the tolerance the result depends on.

#### Scenario: Measurement recorded
- **WHEN** the docs are read for the vertical threshold
- **THEN** they state how it was measured, with the label box, the margin and the tolerance
