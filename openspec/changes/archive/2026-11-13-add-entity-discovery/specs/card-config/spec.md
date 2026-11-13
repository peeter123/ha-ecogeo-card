# Spec Delta

## MODIFIED Requirements

### Requirement: Card type and options
The card SHALL register as `custom:ecogeo-card` and accept the options `model` (`B` or `C`, default `B`),
`variant` (1-4, default 4), `source` (`air`, `ground` or `hybrid`, default `ground`), `dhw` (`external`,
`internal`, `unused` or `none`), `prefix` (an entity object-id prefix), `features`, `entities`, `states` (the state
values that mean off and defrost), `colors` (temperature colour stops), `detail` (`simplified` or `full`, default
`simplified`), `exchanger_fill` (`gradient` or `none`, default `gradient`) and `layout` (`auto`, `full` or
`compact`, default `auto`). Unknown top-level options SHALL be rejected, except the keys Home Assistant itself adds
to a card config (`view_layout`, `layout_options`, `grid_options`, `visibility`), which SHALL be accepted and
ignored.

#### Scenario: Minimal valid config
- **WHEN** the config is `type: custom:ecogeo-card` with `prefix: ecoforest_ecogeo`
- **THEN** the card renders model B, variant 4, a ground source, the model's default DHW storage, the simplified
  detail level, gradient exchanger fills and the automatic layout

#### Scenario: Invalid option value
- **WHEN** the config sets `model: D`
- **THEN** the card shows a configuration error that names `model` and its allowed values

#### Scenario: Invalid detail
- **WHEN** the config sets `detail: minimal`
- **THEN** the card shows a configuration error that names `detail` and its allowed values

#### Scenario: Invalid layout
- **WHEN** the config sets `layout: portrait`
- **THEN** the card shows a configuration error that names `layout` and its allowed values

#### Scenario: Unknown option
- **WHEN** the config sets `colour: red`
- **THEN** the card shows a configuration error that names `colour`

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

## ADDED Requirements

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
