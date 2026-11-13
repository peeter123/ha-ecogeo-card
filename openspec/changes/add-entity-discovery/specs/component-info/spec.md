# Spec Delta

## MODIFIED Requirements

### Requirement: Tap a component
Tapping a drawn component that has an entity of its own SHALL open Home Assistant's more-info dialog for that
entity. The component's own entity is the one its value label shows (for example pump 15: the production pump
speed; probe 33: the production outlet temperature; compressor 11: the compressor speed in rpm). When the
compressor speed role has no entity (for example `none`, card-config), compressor 11's own entity SHALL be the
compressor percentage, else the compressor power, whichever is first present. A component without an entity of its own SHALL NOT be tappable
or focusable. The card SHALL NOT call any service or change any entity.

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
