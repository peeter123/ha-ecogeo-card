# card-editor Specification

## Purpose
The card's visual editor in Home Assistant's dashboard UI: which fields it offers in which sections, how they map
to the YAML config, and what it writes, clears and keeps.

## Requirements

### Requirement: Visual editor available
The card SHALL provide a visual editor through Home Assistant's card editor hook, built only from Home Assistant's
`ha-form` and no other Home Assistant element. Adding the card from the card picker SHALL still show the sample
preview.

#### Scenario: Editor element
- **WHEN** Home Assistant asks the card for its config element
- **THEN** it receives an `ecogeo-card-editor` element

#### Scenario: Picker preview
- **WHEN** the card is added from the card picker
- **THEN** the stub config renders the sample-value schematic

### Requirement: Editor sections
The editor SHALL show, in this order: the unit (model, variant, source, DHW storage), the entity prefix, the four
features (each `true`, `false`, `unused` or empty for the variant default), and the appearance (detail level,
exchanger fill, layout and colour stops). Each field SHALL show the option's current value from the config, or
its default when the config leaves it out.

#### Scenario: Existing config opens
- **WHEN** the editor opens a config with `model: B`, `variant: 4`, `source: air`, `dhw: external`, a prefix and
  `features: { passive_cooling: unused }`
- **THEN** every field shows that value, and the other features show the variant default

### Requirement: Advanced entity pickers
Behind an "Advanced settings" switch the editor SHALL show one entity picker per role, grouped in collapsible
sections like the role table, each filtered to the role's domain. The switch SHALL be editor state only and SHALL
never be written to the config. A config that already has `entities` overrides SHALL open with the switch on.

#### Scenario: Override a role
- **WHEN** the user turns the switch on and picks `sensor.boiler_top` for the DHW temperature
- **THEN** the config gains `entities: { dhw: { temperature: sensor.boiler_top } }` and nothing else changes

#### Scenario: Switch not written
- **WHEN** the user turns the switch on and off
- **THEN** the config is unchanged

### Requirement: Minimal writes
The editor SHALL write only the keys the user set. A field set to its default value SHALL NOT be written, a cleared
field SHALL remove its key (and an emptied `features` or `entities` object SHALL be removed), and keys the editor
does not show SHALL be kept unchanged.

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
