## ADDED Requirements

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
