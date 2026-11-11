# card-config Specification

## Purpose

How the ecoGEO card is configured: which unit and installation it draws, which entities feed each role, and how an
invalid or empty configuration is handled.

## Requirements

### Requirement: Card type and options
The card SHALL register as `custom:ecogeo-card` and accept the options `model` (`B` or `C`, default `B`),
`variant` (1-4, default 4), `source` (`air`, `ground` or `hybrid`, default `ground`), `dhw` (`external`,
`internal` or `none`), `prefix` (an entity object-id prefix), `features`, `entities` and `colors` (temperature colour
stops). Unknown top-level options SHALL be rejected, except the keys Home Assistant itself adds to a card config
(`view_layout`, `layout_options`, `grid_options`, `visibility`), which SHALL be accepted and ignored.

#### Scenario: Minimal valid config
- **WHEN** the config is `type: custom:ecogeo-card` with `prefix: ecoforest_ecogeo`
- **THEN** the card renders model B, variant 4, a ground source and the model's default DHW storage

#### Scenario: Invalid option value
- **WHEN** the config sets `model: D`
- **THEN** the card shows a configuration error that names `model` and its allowed values

#### Scenario: Unknown option
- **WHEN** the config sets `colour: red`
- **THEN** the card shows a configuration error that names `colour`

### Requirement: DHW default follows the model
When `dhw` is not set, it SHALL default to `external` for model B and `internal` for model C. Setting `dhw: internal`
on model B, or `dhw: external` on model C, SHALL be a configuration error.

#### Scenario: Model C default
- **WHEN** the config sets `model: C` and no `dhw`
- **THEN** the card draws the DHW tank inside the cabinet

#### Scenario: Mismatch
- **WHEN** the config sets `model: B` and `dhw: internal`
- **THEN** the card shows a configuration error that names `dhw`

### Requirement: Variant presets
Each variant SHALL set a default state for the cooling parts, following the B1-B4 figures of the service manual:
- `active_cooling` (item 14)
- `passive_cooling` (items 10, 27, 28)

Variant 1 SHALL disable both parts, variant 2 SHALL enable passive cooling only, variant 3 SHALL enable active
cooling only, and variant 4 SHALL enable both. The parts `htr` (items 9, 17, 22, 25) and `backup_heater` (items
44, 45) appear in every figure. They SHALL default to `true` for every variant.

#### Scenario: Variant 4
- **WHEN** the config sets `variant: 4` and no `features`
- **THEN** active cooling, passive cooling, HTR and backup heater are all enabled

#### Scenario: Variant 1
- **WHEN** the config sets `variant: 1` and no `features`
- **THEN** active and passive cooling are disabled, items 10, 14, 27 and 28 are not drawn, and HTR and the backup
  heater are enabled

#### Scenario: Variant 2
- **WHEN** the config sets `variant: 2` and no `features`
- **THEN** passive cooling is enabled and active cooling is disabled

#### Scenario: Variant 3
- **WHEN** the config sets `variant: 3` and no `features`
- **THEN** active cooling is enabled and passive cooling is disabled

### Requirement: Feature states override the preset
Each key under `features` SHALL take one of three states:
- `true`: present and in use.
- `false`: not present, not drawn.
- `unused`: present and drawn muted. The card SHALL never derive the part's own function, and SHALL never draw
  the part active, except that exchanger 10 with valves 27 and 28 SHALL still be active during a defrost (see
  operating-mode).

A key set in `features` SHALL override the variant preset for that part only.

#### Scenario: Unused part
- **WHEN** the config sets `features: { passive_cooling: unused }`
- **THEN** items 10, 27 and 28 are drawn muted, and passive cooling is never derived as the operating mode

#### Scenario: Removed part
- **WHEN** the config sets `variant: 4` and `features: { htr: false }`
- **THEN** items 9, 17, 22 and 25 are not drawn, and the other parts keep the variant 4 preset

#### Scenario: Unknown feature
- **WHEN** the config sets `features: { solar: true }`
- **THEN** the card shows a configuration error that names `solar`

### Requirement: Entity defaults from the prefix
When `prefix` is set, every entity role without an override SHALL default to the firmware's entity id for that
role: `<domain>.<prefix>_<suffix>`, with the domain and suffix of the firmware naming (for example
`sensor.<prefix>_production_out`, `binary_sensor.<prefix>_dhw_demand`, `number.<prefix>_dhw_setpoint`).

#### Scenario: Prefix only
- **WHEN** the config sets `prefix: ecoforest_ecogeo` and no `entities`
- **THEN** the production outlet probe reads `sensor.ecoforest_ecogeo_production_out`

#### Scenario: Missing default entity
- **WHEN** a role's default entity does not exist in Home Assistant
- **THEN** that role shows no value, and the card renders without a configuration error

### Requirement: Per-role entity overrides
`entities` SHALL map role paths to entity ids as nested objects, one level per path segment. For example, the
role `production.outlet_temperature` is set as `entities: { production: { outlet_temperature: <entity id> } }`.
An override SHALL win over the prefix default. An unknown role path, or a value that is not an entity id, SHALL
be a configuration error.

#### Scenario: Override one role
- **WHEN** the config sets a prefix and `entities: { dhw: { temperature: sensor.boiler_top } }`
- **THEN** the DHW tank shows the state of `sensor.boiler_top`, and every other role keeps its prefix default

#### Scenario: Unknown role
- **WHEN** the config sets `entities: { production: { flow: sensor.x } }`
- **THEN** the card shows a configuration error that names `production.flow`

#### Scenario: Not an entity id
- **WHEN** the config sets `entities: { dhw: { temperature: 52 } }`
- **THEN** the card shows a configuration error that names `dhw.temperature`

### Requirement: Sample values for an empty config
A config with neither `prefix` nor any `entities` SHALL render with built-in sample values for every role, show a
muted "Sample values" note, and raise no configuration error. Once `prefix` or any entity is set, the card SHALL
use only real states.

#### Scenario: Card picker preview
- **WHEN** the card is added with only its type
- **THEN** it renders the full schematic in heating mode with sample values and the "Sample values" note

#### Scenario: No mixing
- **WHEN** the config sets one entity override and no prefix
- **THEN** every other role shows no value, never a sample value
