# Spec Delta

## Purpose

How the card adapts to the width it is given: a full layout for wide cards and a compact layout with fewer, larger
labels for phones and narrow sections, with lines and text that never render too thin or too small.

## ADDED Requirements

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

### Requirement: Compact threshold
The compact threshold SHALL be the narrowest card width at which the full layout, at the simplified detail level,
shows no overlapping labels in any emulator scenario, rounded up to the next 10 px. It SHALL be recorded in the
docs with how it was measured.

#### Scenario: No overlaps above the threshold
- **WHEN** the emulator captures every scenario in the full layout at the threshold width
- **THEN** no two labels overlap and no label overlaps a component

### Requirement: Compact content
The compact layout SHALL draw the schematic at the simplified detail level whatever `detail` says, and SHALL show
only these value labels: production outlet and return, brine outlet and inlet, compressor speed in rpm, the DHW
temperature, and the source's outlet temperature (the air unit outlet, or the brine outlet at a ground loop). The
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
