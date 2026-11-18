# card-editor Specification

## Purpose
The card's visual editor in Home Assistant's dashboard UI: which fields it offers in which sections, how they map
to the YAML config, and what it writes, clears and keeps.

## Requirements

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
  (for example a template sensor `sensor.template_cop_dhw`)
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

### Requirement: Minimal writes
The editor SHALL write only the keys the user set. A field set to its default value SHALL NOT be written, a cleared
field SHALL remove its key (and an emptied `features`, `entities` or `states` object SHALL be removed), and keys the
editor does not show SHALL be kept unchanged.

#### Scenario: Clear the variant
- **WHEN** the config has `variant: 3` and the user clears the variant field
- **THEN** the config no longer has a `variant` key

#### Scenario: Unshown keys kept
- **WHEN** the config has a `grid_options` key and the user changes the source
- **THEN** `grid_options` is kept unchanged in the new config

#### Scenario: Round trip
- **WHEN** the editor opens a valid config and the user saves without changing anything
- **THEN** the saved config equals the original

### Requirement: Colour stop rows
The appearance section SHALL show one row per configured colour stop (a temperature and a colour) plus one empty
row to add a stop. A row with no temperature SHALL be dropped. When the rows equal the default stops, the `colors`
key SHALL be removed. Rows SHALL be written in ascending temperature order, and a list the card would reject
(fewer than 2 or more than 8 stops, or two equal temperatures) SHALL show the card's configuration error message in
the editor.

#### Scenario: Add a stop
- **WHEN** the config has no `colors` and the user fills the empty row with 40 °C and a purple colour
- **THEN** the config gains `colors` with the default stops plus the new one, in ascending order

#### Scenario: Back to default
- **WHEN** the user edits the rows back to the default stops
- **THEN** the config has no `colors` key

### Requirement: Editor is read-only towards Home Assistant
The editor SHALL change only the card config, through Home Assistant's `config-changed` event. It SHALL NOT call
any service or change any entity.

#### Scenario: No service calls
- **WHEN** the user changes any field
- **THEN** the editor fires `config-changed` with the new config and makes no service call

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
firmware suffix, then keywords per role (EN, NL, ES, DE) found in the object id or friendly name. A tie for the top
or a weak match SHALL leave the role empty (see also "Suggestion exclusions").

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

### Requirement: Suggestion exclusions
A keyword candidate with the opposite direction (inlet against outlet), or a paired role's candidate without a
direction word, SHALL be excluded from that role. A candidate named as a setpoint SHALL fit only a setpoint role.

#### Scenario: Opposite direction excluded
- **WHEN** the only temperature entity named for the brine is "Brine inlet temperature"
- **THEN** the brine outlet is left empty

#### Scenario: Setpoint kept apart
- **WHEN** the device has "DHW temperature" and "DHW set temperature"
- **THEN** the DHW temperature is the first and the DHW setpoint the second

### Requirement: Suggestion report
After a suggestion, the editor SHALL show how many roles it filled and name the roles it left empty, until the next
edit.

#### Scenario: Report
- **WHEN** a suggestion fills 34 roles and leaves the fan speed, the COP and the DG1 setpoint empty
- **THEN** the editor shows that 34 roles were filled and names the three empty roles

### Requirement: Roles not present choice
Behind the advanced switch the editor SHALL offer a "Not present" choice of roles. Choosing a role SHALL write
`none` for it; removing it SHALL remove the role's key.

#### Scenario: Mark the fan speed
- **WHEN** the user adds the fan speed to "Not present"
- **THEN** the config gains `entities: { source: { fan_speed: none } }` and the fan speed picker is gone

### Requirement: Binding check
The editor SHALL warn about each role bound to an entity Home Assistant does not know, and each role bound to an
entity whose unit or domain does not fit the role. An optional role (card-config) whose entity comes from the prefix
default SHALL NOT be warned about when Home Assistant does not know that entity. A warning SHALL name the role and the
entity. It SHALL NOT change the config.

#### Scenario: Unknown entity
- **WHEN** the config binds the brine inlet to `sensor.old_name`, which Home Assistant does not know
- **THEN** the editor warns that the brine inlet's `sensor.old_name` does not exist

#### Scenario: Wrong unit
- **WHEN** the config binds the production outlet to an entity that reports %
- **THEN** the editor warns that the production outlet's entity has a unit that does not fit

#### Scenario: Optional default absent
- **WHEN** the config sets a prefix and Home Assistant does not know `sensor.<prefix>_system_cop_display`
- **THEN** the editor shows no warning for the system COP

#### Scenario: Optional role set explicitly
- **WHEN** the config sets `entities: { htr: { power: sensor.old_htr } }`, which Home Assistant does not know
- **THEN** the editor warns that the HTR power's `sensor.old_htr` does not exist

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

### Requirement: Labels of the heat power roles
The editor SHALL label `heating.power`, `dhw.power` and `htr.power` "Heat power" wherever it names a role (the
advanced pickers, the "Not present" list, the suggestion report and the binding warnings); `compressor.power` keeps
"Power consumption".

#### Scenario: HTR power label
- **WHEN** the editor lists `htr.power` in the advanced pickers
- **THEN** its label reads "Heat power" in the "HTR recovery" group, not "Power consumption"

### Requirement: Suggestions for the HTR and power roles
The device suggestions SHALL match the HTR state, the HTR power, the DG1 power, the DHW power and the system COP to a
device's entities by their names, like every other role. A candidate named as electrical power (for example
"Electrical Power DHW") SHALL NOT fit the DG1, DHW or HTR power, which are heat.

#### Scenario: Firmware device
- **WHEN** the user picks a device with the firmware's entities and presses "Suggest entities"
- **THEN** the HTR state, HTR power, DG1 power, DHW power and system COP are written under `entities` with that
  device's `htr_active`, `heating_power_htr`, `heating_power_dg1`, `heating_power_dhw` and `system_cop_display`
  entities

#### Scenario: Electrical power kept apart
- **WHEN** the device's only W entity named for the DHW is "Electrical Power DHW"
- **THEN** the DHW power is left empty

#### Scenario: Firmware names without firmware ids
- **WHEN** a device's entities are named "Heating Power DG1", "Heating Power DHW", "Heating Power HTR", "COP" and
  "System COP", with ids that follow no firmware suffix
- **THEN** the suggestions fill the DG1, DHW and HTR power, the COP and the system COP each with its own entity
