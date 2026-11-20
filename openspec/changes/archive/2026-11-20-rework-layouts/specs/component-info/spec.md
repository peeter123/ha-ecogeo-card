# Spec Delta

## MODIFIED Requirements

### Requirement: Component name on hover
Every drawn component SHALL carry a tooltip with its name from the manual's component list and its item number in
parentheses, for example "Production circulator pump (15)". The tooltip SHALL also be the component's accessible
name. Connections SHALL carry their name in the same way, for example "Production outlet (1)". A drawn part
without an item number in the manual (the external tank, the air unit's fan, the ground collector, the emitter) SHALL
carry its name alone, the emitter as "Underfloor heating" or "Radiator".

#### Scenario: Pump tooltip
- **WHEN** the card renders and the user hovers pump 15
- **THEN** the tooltip reads "Production circulator pump (15)"

#### Scenario: Every component named
- **WHEN** the card renders model B and model C with every feature `true`
- **THEN** every drawn component and connection has a non-empty tooltip, and every one with a manual item ends with
  its item number in parentheses

#### Scenario: Emitter tooltip
- **WHEN** the config sets `emitter: radiator` and the user hovers the radiator
- **THEN** the tooltip reads "Radiator"

## ADDED Requirements

### Requirement: Tap the emitter
The emitter's own entity SHALL be the DG1 demand: tapping the emitter SHALL open the more-info dialog of the DG1 demand
entity, and an emitter whose DG1 demand role has no entity SHALL NOT be tappable or focusable.

#### Scenario: Tap the underfloor loop
- **WHEN** the config sets a prefix and the user taps the underfloor loop
- **THEN** the more-info dialog of the DG1 demand entity opens

#### Scenario: No demand entity
- **WHEN** the config sets `entities: { heating: { demand: none } }` and the user taps the emitter
- **THEN** nothing opens, and the emitter has no button role and no tab stop
