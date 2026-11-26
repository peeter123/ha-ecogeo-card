# Spec Delta

## MODIFIED Requirements

### Requirement: Component name on hover
Every drawn component SHALL carry a tooltip with its name from the manual's component list and its item number in
parentheses, for example "Production circulator pump (15)". The tooltip SHALL also be the component's accessible
name.

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

### Requirement: Tap a component
Tapping a drawn component that has an entity of its own SHALL open Home Assistant's more-info dialog for that entity.
A component without an entity of its own SHALL NOT be tappable or focusable. The card SHALL NOT call any service or
change any entity.

#### Scenario: Tap a pump
- **WHEN** the user taps pump 16
- **THEN** the more-info dialog of the brine pump speed entity opens

#### Scenario: No entity
- **WHEN** the user taps filter dryer 13
- **THEN** nothing opens, and the dryer has no button role and no tab stop

#### Scenario: Sample mode
- **WHEN** the card shows sample values
- **THEN** no component is tappable

#### Scenario: Compressor without a speed role
- **WHEN** the compressor speed role is `none` and the percentage role has an entity
- **THEN** tapping compressor 11 opens the more-info dialog of the percentage entity

## ADDED Requirements

### Requirement: Connection names on hover
Connections SHALL carry their name in the same way as components: the name from the manual and the item number in
parentheses.

#### Scenario: Connection tooltip
- **WHEN** the card renders and the user hovers connection 1
- **THEN** the tooltip reads "Production outlet (1)"

### Requirement: Names of parts without an item number
A drawn part without an item number in the manual (the external tank, the air unit's fan, the ground collector, the
emitter) SHALL carry its name alone, the emitter as "Underfloor heating" or "Radiator".

#### Scenario: Underfloor emitter tooltip
- **WHEN** the config sets `emitter: underfloor` and the user hovers the emitter
- **THEN** the tooltip reads "Underfloor heating"

#### Scenario: Other parts without a number
- **WHEN** the card renders an air source with an external DHW tank, and a ground source
- **THEN** the tooltips of the external tank, the air unit's fan and the ground collector hold their name and no
  item number

### Requirement: A component's own entity
The component's own entity SHALL be the one its value label shows, except for evaporator 7, whose own entity is the
evaporating temperature (role `refrigerant.evaporation_temperature`), and condenser 8, whose own entity is the
condensing temperature (role `refrigerant.condensation_temperature`). No value label shows these two entities; they
colour the refrigerant pipes (derived: `COMPONENT_ROLES` in `src/diagram/component-info.ts`).

#### Scenario: Pump 15
- **WHEN** the user taps pump 15
- **THEN** the more-info dialog of the production pump speed entity opens

#### Scenario: Probe 33
- **WHEN** the user taps probe 33
- **THEN** the more-info dialog of the production outlet temperature entity opens

#### Scenario: Compressor 11
- **WHEN** the user taps compressor 11 and the compressor speed role has an entity
- **THEN** the more-info dialog of the compressor speed in rpm opens

#### Scenario: Evaporator 7
- **WHEN** the user taps evaporator 7
- **THEN** the more-info dialog of the evaporating temperature entity opens

#### Scenario: Condenser 8
- **WHEN** the user taps condenser 8
- **THEN** the more-info dialog of the condensing temperature entity opens

### Requirement: Compressor entity fallback
When the compressor speed role has no entity (for example `none`, card-config), compressor 11's own entity SHALL be
the compressor percentage, else the compressor power, whichever is first present.

#### Scenario: Power as the last fallback
- **WHEN** the compressor speed role is `none`, the percentage role has no entity and the power role has an entity
- **THEN** tapping compressor 11 opens the more-info dialog of the power entity
