# Spec Delta

## MODIFIED Requirements

### Requirement: Card type and options
The card SHALL register as `custom:ecogeo-card` and accept the options `model` (`B` or `C`, default `B`),
`variant` (1-4, default 4), `source` (`air`, `ground` or `hybrid`, default `ground`), `dhw` (`external`,
`internal` or `none`), `prefix` (an entity object-id prefix), `features`, `entities`, `colors` (temperature colour
stops), `detail` (`simplified` or `full`, default `simplified`), `exchanger_fill` (`gradient` or `none`, default
`gradient`) and `layout` (`auto`, `full` or `compact`, default `auto`). Unknown top-level options SHALL be rejected,
except the keys Home Assistant itself adds to a card config (`view_layout`, `layout_options`, `grid_options`,
`visibility`), which SHALL be accepted and ignored.

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
