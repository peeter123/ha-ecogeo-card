# Spec Delta

## MODIFIED Requirements

### Requirement: Visual editor available
The card SHALL provide a visual editor through Home Assistant's card editor hook, built only from Home Assistant's
`ha-form` and no other Home Assistant element. Adding the card from the card picker SHALL fill the stub config from
the firmware naming when exactly one device carries it (at least half of the roles found as
`<domain>.<prefix>_<suffix>` with one prefix): the stub then sets that `prefix`. Otherwise the stub SHALL be empty and
show the sample preview.

#### Scenario: Editor element
- **WHEN** Home Assistant asks the card for its config element
- **THEN** it receives an `ecogeo-card-editor` element

#### Scenario: Picker preview
- **WHEN** the card is added from the card picker and no device carries the firmware naming
- **THEN** the stub config renders the sample-value schematic

#### Scenario: One firmware device
- **WHEN** the card is added from the card picker and exactly one device has the firmware's entities under the
  prefix `hp_basement`
- **THEN** the stub config is `{ prefix: hp_basement }` and the preview shows that device's live values

#### Scenario: Firmware device with helpers
- **WHEN** the card is added from the card picker and the only firmware device also carries entities with other ids
  (for example a template sensor `sensor.heatpump_cop_dhw`)
- **THEN** the stub config is `{ prefix: <the firmware prefix> }`

#### Scenario: Two firmware devices
- **WHEN** the card is added from the card picker and two devices carry the firmware naming
- **THEN** the stub config renders the sample-value schematic

### Requirement: Editor sections
The editor SHALL show, in this order: the unit (model, variant, source, DHW storage), the entities (a device picker
and the entity prefix), the four features (each `true`, `false`, `unused` or empty for the variant default), and the
appearance (detail level, exchanger fill, layout and colour stops). Below the form it SHALL show the "Suggest
entities" button, the suggestion report and the binding check warnings. Each field SHALL
show the option's current value from the config, or its default when the config leaves it out. The picked device
SHALL be editor state only and SHALL never be written to the config.

#### Scenario: Existing config opens
- **WHEN** the editor opens a config with `model: B`, `variant: 4`, `source: air`, `dhw: external`, a prefix and
  `features: { passive_cooling: unused }`
- **THEN** every field shows that value, and the other features show the variant default

#### Scenario: Device not written
- **WHEN** the user picks a device and does not press "Suggest entities"
- **THEN** the config is unchanged

### Requirement: Advanced entity pickers
Behind an "Advanced settings" switch the editor SHALL show one entity picker per role, grouped in collapsible
sections like the role table, each filtered to the domains the role accepts. A role set to `none` SHALL show no
picker. The switch SHALL be editor state only and SHALL never be written to the config. A config that already has
`entities` or `states` SHALL open with the switch on.

#### Scenario: Override a role
- **WHEN** the user turns the switch on and picks `sensor.boiler_top` for the DHW temperature
- **THEN** the config gains `entities: { dhw: { temperature: sensor.boiler_top } }` and nothing else changes

#### Scenario: Switch not written
- **WHEN** the user turns the switch on and off
- **THEN** the config is unchanged

## ADDED Requirements

### Requirement: Entity suggestions from a device
Pressing "Suggest entities" with a device picked SHALL bind roles to that device's entities and write them as
explicit `entities`. It SHALL fill only roles that are empty or bound to an entity Home Assistant does not know. It
SHALL NOT change a role bound to a known entity or set to `none`, and SHALL use each entity for one role at most.
Without a picked device the button SHALL be disabled.

#### Scenario: Empty roles filled
- **WHEN** the config has no `entities` and the user picks a device with the firmware's entities under the prefix
  `hp_basement` and presses "Suggest entities"
- **THEN** every role whose entity exists on that device is written under `entities` with its entity id

#### Scenario: Own choice kept
- **WHEN** the config binds the DHW temperature to `sensor.boiler_top` and the user presses "Suggest entities"
- **THEN** the DHW temperature stays `sensor.boiler_top`

#### Scenario: Broken binding replaced
- **WHEN** the config binds the brine inlet to `sensor.old_name`, which Home Assistant does not know, and the device
  has a matching entity
- **THEN** the brine inlet is rebound to the device's entity

### Requirement: Suggestion matching
For each role, only entities whose domain and unit fit the role SHALL be candidates. Candidates SHALL be ranked:
first the firmware entity id with the prefix inferred from the device, then an object id ending in the role's
firmware suffix, then keywords per role (EN, NL, ES, DE) found in the object id or friendly name. A candidate with
the opposite direction (inlet against outlet), a tie for the top, or a weak match SHALL leave the role empty.

#### Scenario: Renamed device
- **WHEN** the device's entities are the firmware's under the prefix `hp_basement`
- **THEN** the production outlet is `sensor.hp_basement_production_out`

#### Scenario: Foreign names
- **WHEN** the device has `sensor.knx_1_2_3` named "Brine outlet temperature" in °C and `sensor.knx_1_2_4` named
  "Brine inlet temperature" in °C
- **THEN** the brine outlet is `sensor.knx_1_2_3` and the brine inlet is `sensor.knx_1_2_4`

#### Scenario: Unit must fit
- **WHEN** the only entity named like the production pressure reports %
- **THEN** the production pressure is left empty

#### Scenario: Tie left empty
- **WHEN** two temperature entities of the device are both named "Production supply temperature"
- **THEN** the production outlet is left empty

#### Scenario: Weak match left empty
- **WHEN** the only temperature entity of the device that could fit the production outlet is named "Supply
  temperature"
- **THEN** the production outlet is left empty

#### Scenario: Prefix binding kept
- **WHEN** the config sets a prefix whose production outlet entity exists, and the user suggests from another device
- **THEN** the production outlet is not written under `entities`

### Requirement: Suggestion report
After a suggestion, the editor SHALL show how many roles it filled and name the roles it left empty, until the next
edit.

#### Scenario: Report
- **WHEN** a suggestion fills 31 roles and leaves the fan speed, the COP and the DG1 setpoint empty
- **THEN** the editor shows that 31 roles were filled and names the three empty roles

### Requirement: Roles not present choice
Behind the advanced switch the editor SHALL offer a "Not present" choice of roles. Choosing a role SHALL write
`none` for it; removing it SHALL remove the role's key.

#### Scenario: Mark the fan speed
- **WHEN** the user adds the fan speed to "Not present"
- **THEN** the config gains `entities: { source: { fan_speed: none } }` and the fan speed picker is gone

### Requirement: Binding check
The editor SHALL warn about each role bound to an entity Home Assistant does not know, and each role bound to an
entity whose unit or domain does not fit the role. A warning SHALL name the role and the entity. It SHALL NOT change the config.

#### Scenario: Unknown entity
- **WHEN** the config binds the brine inlet to `sensor.old_name`, which Home Assistant does not know
- **THEN** the editor warns that the brine inlet's `sensor.old_name` does not exist

#### Scenario: Wrong unit
- **WHEN** the config binds the production outlet to an entity that reports %
- **THEN** the editor warns that the production outlet's entity has a unit that does not fit

### Requirement: State value choices
Behind the advanced switch the editor SHALL show the `states.off` and `states.defrost` lists. Each SHALL offer the
values of the bound entity when it lists its options (an enum entity), and accept typed values. A list equal to its
default SHALL NOT be written.

#### Scenario: Enum options offered
- **WHEN** the compressor mode is bound to an enum sensor with the options `Uit`, `Verwarmen`, `Ontdooien`
- **THEN** the defrost list offers those three values

#### Scenario: Default not written
- **WHEN** the user sets the off list to `OFF`
- **THEN** the config has no `states` key
