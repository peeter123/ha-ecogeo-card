## MODIFIED Requirements

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

## ADDED Requirements

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
