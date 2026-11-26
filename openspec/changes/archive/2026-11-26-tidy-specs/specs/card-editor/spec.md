# Spec Delta

## MODIFIED Requirements

### Requirement: Editor sections
The editor SHALL show, in this order: the unit (model, variant, source, DHW storage, emitter), the entities (a device
picker and the entity prefix), the four features (each `true`, `false`, `unused` or empty for the variant default),
and the appearance (exchanger fill, layout and colour stops). Below the form it SHALL show the "Suggest entities"
button, the suggestion report and the binding check warnings.

#### Scenario: Existing config opens
- **WHEN** the editor opens a config with `model: B`, `variant: 4`, `source: air`, `dhw: external`,
  `emitter: radiator`, a prefix and `features: { passive_cooling: unused }`
- **THEN** every field shows that value, and the other features show the variant default

#### Scenario: Device not written
- **WHEN** the user picks a device and does not press "Suggest entities"
- **THEN** the config is unchanged

#### Scenario: Layout choices
- **WHEN** the user opens the layout field
- **THEN** it offers `auto`, `horizontal` and `vertical`, and the editor shows no detail level field

#### Scenario: Default emitter not written
- **WHEN** the config has no `emitter` and the user sets the emitter field to underfloor
- **THEN** the config still has no `emitter` key

## ADDED Requirements

### Requirement: Editor field values
Each editor field SHALL show the option's current value from the config, or its default when the config leaves it
out.

#### Scenario: Defaults shown
- **WHEN** the editor opens a config with only `type` and `prefix`
- **THEN** the model field shows `B`, the variant field 4, the source field `ground` and the layout field `auto`

### Requirement: Picked device is editor state
The picked device SHALL be editor state only and SHALL never be written to the config.

#### Scenario: Device never in the config
- **WHEN** the user picks a device and then changes any other field
- **THEN** the emitted config has no key that holds the device
