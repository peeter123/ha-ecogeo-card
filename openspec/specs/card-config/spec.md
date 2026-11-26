# card-config Specification

## Purpose

How the ecoGEO card is configured: which unit and installation it draws, which entities feed each role, and how an
invalid or empty configuration is handled.

## Requirements

### Requirement: Card type and options
The card SHALL register as `custom:ecogeo-card` and accept the options `model` (`B` or `C`, default `B`),
`variant` (1-4, default 4), `source` (`air`, `ground` or `hybrid`, default `ground`), `dhw` (`external`,
`internal`, `unused` or `none`), `emitter` (`underfloor`, `radiator` or `none`, default `underfloor`) and `prefix` (an
entity object-id prefix).

#### Scenario: Minimal valid config
- **WHEN** the config is `type: custom:ecogeo-card` with `prefix: ecoforest_ecogeo`
- **THEN** the card renders model B, variant 4, a ground source, the model's default DHW storage, an underfloor
  emitter, gradient exchanger fills and the automatic layout

#### Scenario: Invalid option value
- **WHEN** the config sets `model: D`
- **THEN** the card shows a configuration error that names `model` and its allowed values

#### Scenario: Invalid emitter
- **WHEN** the config sets `emitter: convector`
- **THEN** the card shows a configuration error that names `emitter` and its allowed values

#### Scenario: Invalid layout
- **WHEN** the config sets `layout: portrait`, or one of the former values `full` and `compact`
- **THEN** the card shows a configuration error that names `layout` and its allowed values

#### Scenario: Invalid detail
- **WHEN** the config sets `detail: full`
- **THEN** the card shows a configuration error that names `detail`, as for any unknown option

#### Scenario: Unknown option
- **WHEN** the config sets `colour: red`
- **THEN** the card shows a configuration error that names `colour`

### Requirement: DHW default follows the model
When `dhw` is not set, it SHALL default to `external` for model B and `internal` for model C. Setting `dhw: internal`
on model B, or `dhw: external` on model C, SHALL be a configuration error. Model C always has its integrated tank,
so `dhw: none` on model C SHALL be a configuration error; `dhw: unused` SHALL be valid on both models.

#### Scenario: Model C default
- **WHEN** the config sets `model: C` and no `dhw`
- **THEN** the card draws the DHW tank inside the cabinet

#### Scenario: Mismatch
- **WHEN** the config sets `model: B` and `dhw: internal`
- **THEN** the card shows a configuration error that names `dhw`

#### Scenario: No tank on model C
- **WHEN** the config sets `model: C` and `dhw: none`
- **THEN** the card shows a configuration error that names `dhw`

#### Scenario: Unused tank on either model
- **WHEN** the config sets `dhw: unused` with `model: B`, or with `model: C`
- **THEN** the card raises no configuration error

### Requirement: Variant presets
Each variant SHALL set a default state for the cooling parts, following the B1-B4 figures of the service manual:
- `active_cooling` (item 14)
- `passive_cooling` (items 10, 27, 28)

Variant 1 SHALL disable both parts, variant 2 SHALL enable passive cooling only, variant 3 SHALL enable active
cooling only, and variant 4 SHALL enable both.

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
- **THEN** items 9, 17 and 22 are not drawn, and the other parts keep the variant 4 preset

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
An override SHALL win over the prefix default. A role MAY instead be set to `none` (see "Roles not present"). An
unknown role path, or a value that is neither an entity id nor `none`, SHALL be a configuration error.

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

### Requirement: Roles not present
A role set to `none` in `entities` SHALL have no entity: the prefix default SHALL NOT apply to it, its value SHALL
be hidden (live-values), and as a mode input it SHALL count as having no value (operating-mode). `none` SHALL count
as an entity setting, so a config with only `none` roles does not show the sample values.

#### Scenario: Fan speed not present
- **WHEN** the config sets `prefix: ecoforest_ecogeo` and `entities: { source: { fan_speed: none } }`
- **THEN** the fan speed role has no entity, and `sensor.ecoforest_ecogeo_aerothermal_fan_speed` is not read

#### Scenario: None is not a sample config
- **WHEN** the config sets only `entities: { unit: { cop: none } }`
- **THEN** the card shows no sample values and no "Sample values" note

### Requirement: State value lists
`states` SHALL accept the keys `off` and `defrost`, each a list of one or more non-empty texts. `off` lists the
on/off states that mean the heat pump is off (default `[OFF]`); `defrost` lists the compressor modes that mean
defrost (default `[Defrost]`). A set list SHALL replace its default. Texts SHALL match case-insensitively after
trimming. An unknown key, or a value that is not such a list, SHALL be a configuration error that names it.

#### Scenario: Own off values
- **WHEN** the config sets `states: { off: [Uit, Standby] }` and the on/off entity reads `uit`
- **THEN** the mode is `off`

#### Scenario: Default replaced
- **WHEN** the config sets `states: { off: [Uit] }` and the on/off entity reads `OFF`
- **THEN** the mode is not `off`

#### Scenario: Invalid states
- **WHEN** the config sets `states: { off: Uit }` or `states: { cooling: [Cool] }`
- **THEN** the card shows a configuration error that names `states.off` or `states.cooling`

### Requirement: Optional roles
The roles `htr.active`, `htr.power`, `heating.power`, `dhw.power` and `unit.system_cop` SHALL be optional. An
optional role SHALL have no entity when it is set to `none`, or when it is not set in `entities` and there is no
prefix or its prefix default does not exist in Home Assistant; whatever uses it then takes its fallback
(operating-mode, live-values). Set in `entities` to an entity id, it SHALL behave like every other role.

#### Scenario: Default entities of the optional roles
- **WHEN** the config sets `prefix: ecoforest_ecogeo` and Home Assistant has the firmware's entities
- **THEN** the optional roles read `binary_sensor.ecoforest_ecogeo_htr_active`,
  `sensor.ecoforest_ecogeo_heating_power_htr`, `sensor.ecoforest_ecogeo_heating_power_dg1`,
  `sensor.ecoforest_ecogeo_heating_power_dhw` and `sensor.ecoforest_ecogeo_system_cop_display`

#### Scenario: Older firmware
- **WHEN** the config sets a prefix and Home Assistant does not know `sensor.<prefix>_heating_power_dg1`
- **THEN** `heating.power` has no entity, and the card renders without a configuration error

#### Scenario: Set to none
- **WHEN** the config sets `entities: { unit: { system_cop: none } }`
- **THEN** `unit.system_cop` has no entity, even when its prefix default exists

#### Scenario: Explicit entity that does not exist
- **WHEN** the config sets `entities: { heating: { power: sensor.typo } }` and Home Assistant does not know it
- **THEN** `heating.power` keeps `sensor.typo` as its entity and shows a muted dash

#### Scenario: Default entity unavailable
- **WHEN** the default entity of `dhw.power` exists and is `unavailable`
- **THEN** `dhw.power` keeps that entity and shows a muted dash

#### Scenario: No prefix
- **WHEN** the config binds roles only through `entities`, without a prefix, and does not set `htr.power`
- **THEN** `htr.power` has no entity

### Requirement: Optional roles in the sample values
With the sample values (see "Sample values for an empty config") every optional role SHALL take its sample value and
SHALL NOT fall back.

#### Scenario: Sample footer
- **WHEN** the card is added with only its type
- **THEN** the footer shows the sample DG1 power and the sample system COP, not the condensation capacity or the
  register COP

### Requirement: Further card options
The card SHALL also accept the options `features`, `entities`, `states` (the state values that mean off and defrost),
`colors` (temperature colour stops), `exchanger_fill` (`gradient` or `none`, default `gradient`) and `layout` (`auto`,
`horizontal` or `vertical`, default `auto`).

#### Scenario: Further options accepted
- **WHEN** the config sets `exchanger_fill: none`, `layout: vertical` and a `colors` list
- **THEN** the card renders without exchanger fills, in the vertical layout, with those colour stops, and shows no
  configuration error

### Requirement: Unknown options rejected
Unknown top-level options SHALL be rejected, except the keys Home Assistant itself adds to a card config
(`view_layout`, `layout_options`, `grid_options`, `visibility`), which SHALL be accepted and ignored.

#### Scenario: Home Assistant keys ignored
- **WHEN** the config sets `grid_options`, `layout_options`, `view_layout` and `visibility` besides valid options
- **THEN** the card shows no configuration error and renders as without those keys

#### Scenario: Unknown key rejected
- **WHEN** the config sets a top-level key that is neither an option nor one of those Home Assistant keys
- **THEN** the card shows a configuration error that names the key

### Requirement: Always-on parts of the variants
The parts `htr` (items 9, 17, 22; the manual's group also has valve 25, which the card no longer draws, decided by
the user 2026-11-20) and `backup_heater` (items 44, 45) appear in every figure. They SHALL default to `true` for every
variant.

#### Scenario: Defaults in every variant
- **WHEN** the config sets `variant` to 1, 2, 3 or 4 in turn, with no `features`
- **THEN** `htr` and `backup_heater` are enabled for each variant
