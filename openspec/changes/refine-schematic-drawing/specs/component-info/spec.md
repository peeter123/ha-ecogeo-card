# Spec Delta

## Purpose

What the card tells about a drawn component itself, without item numbers on the drawing: its name and item number on
hover, and the more-info dialog of its own entity on a tap.

## ADDED Requirements

### Requirement: Component name on hover
Every drawn component SHALL carry a tooltip with its name from the manual's component list and its item number in
parentheses, for example "Production circulator pump (15)". The tooltip SHALL also be the component's accessible
name. Connections SHALL carry their name in the same way, for example "Production outlet (1)".

#### Scenario: Pump tooltip
- **WHEN** the card renders and the user hovers pump 15
- **THEN** the tooltip reads "Production circulator pump (15)"

#### Scenario: Every component named
- **WHEN** the card renders model B and model C with `detail: full` and every feature `true`
- **THEN** every drawn component and connection has a non-empty tooltip that ends with its item number in
  parentheses

### Requirement: Tap a component
Tapping a drawn component that has an entity of its own SHALL open Home Assistant's more-info dialog for that
entity. The component's own entity is the one its value label shows (for example pump 15: the production pump
speed; probe 33: the production outlet temperature; compressor 11: the compressor speed in rpm). A component
without an entity of its own SHALL NOT be tappable or focusable. The card SHALL NOT call any service or change any
entity.

#### Scenario: Tap a pump
- **WHEN** the user taps pump 16
- **THEN** the more-info dialog of the brine pump speed entity opens

#### Scenario: No entity
- **WHEN** the user taps filter dryer 13
- **THEN** nothing opens, and the dryer has no button role and no tab stop

#### Scenario: Sample mode
- **WHEN** the card shows sample values
- **THEN** no component is tappable
