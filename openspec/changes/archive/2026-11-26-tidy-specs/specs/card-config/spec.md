# Spec Delta

## MODIFIED Requirements

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

## ADDED Requirements

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
