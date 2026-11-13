# Spec Delta

## MODIFIED Requirements

### Requirement: One derived mode
The card SHALL derive exactly one mode from the live values, taking the first whose condition holds, in this
order:
1. `off`
2. `defrost`
3. `dhw`
4. `active_cooling`
5. `heating`
6. `passive_cooling`
7. `standby`

The compressor counts as running when its speed is above 0, or its speed entity reads on (see "Compressor running
from what exists"). The production and brine pumps count as running when their speed is above 0, or their entity
reads on.

#### Scenario: Off wins
- **WHEN** the on/off state reads `OFF` while the compressor still reports 1500 rpm
- **THEN** the mode is `off`

#### Scenario: Pump on/off
- **WHEN** the compressor is stopped, summer is on, the production pump entity is a binary sensor that reads `on` and
  passive cooling is `true`
- **THEN** the mode is `passive_cooling`

### Requirement: Off mode
The mode SHALL be `off` when the heat pump's on/off state matches one of the `states.off` values (card-config;
default `OFF`, case-insensitive), whatever the other values are. When the on/off role is bound to an on/off entity
(live-values), the mode SHALL be `off` when that entity reads off. Any other on/off state, including `EMERGENCY`,
SHALL NOT make the mode `off`.

#### Scenario: Off
- **WHEN** the heat pump's on/off state reads `OFF`
- **THEN** the mode is `off`

#### Scenario: Emergency is not off
- **WHEN** the on/off state reads `EMERGENCY` and the compressor runs with DG1 demand in winter
- **THEN** the mode is `heating`

#### Scenario: Off from a switch
- **WHEN** the on/off role is bound to `switch.heat_pump`, which reads `off`
- **THEN** the mode is `off`

#### Scenario: On from a switch
- **WHEN** the on/off role is bound to `switch.heat_pump`, which reads `on`, and the compressor runs in winter
- **THEN** the mode is `heating`

### Requirement: Defrost mode
The mode SHALL be `defrost` when the compressor operation mode matches one of the `states.defrost` values
(card-config; default `Defrost`, case-insensitive), whatever the compressor speed and demands are. When the
compressor mode role is bound to an on/off entity (live-values), the mode SHALL be `defrost` when that entity reads
on. Every other value (`None`, `Time-Out`, `Balance`, `Cycle Inversion`, unknown) SHALL NOT make the mode `defrost`.

#### Scenario: Defrost
- **WHEN** the compressor operation mode reads `Defrost`, the compressor is at 0 rpm and DG1 demand is on
- **THEN** the mode is `defrost`

#### Scenario: Balance is not defrost
- **WHEN** the compressor operation mode reads `Balance` and the compressor runs at 2803 rpm in winter
- **THEN** the mode is `heating`

#### Scenario: Own defrost value
- **WHEN** the config sets `states: { defrost: [Abtauen] }` and the compressor operation mode reads `abtauen`
- **THEN** the mode is `defrost`

#### Scenario: Defrost from a binary sensor
- **WHEN** the compressor mode role is bound to a binary sensor that reads `on`
- **THEN** the mode is `defrost`

### Requirement: Missing inputs fall back safely
An unavailable or unknown input, and a role set to `none`, SHALL count as not running or not active. If whether
the compressor runs is unknown (none of its running inputs has a value), the mode SHALL be `standby` unless it is
`off` or `defrost`.

#### Scenario: Compressor speed unavailable
- **WHEN** the compressor rpm, percentage and power are `unavailable` and DHW demand is on
- **THEN** the mode is `standby`

#### Scenario: Every input unavailable
- **WHEN** every heat pump entity is `unavailable`
- **THEN** the mode is `standby`

## ADDED Requirements

### Requirement: Compressor running from what exists
Whether the compressor runs SHALL come from the first of these roles that has a value: the speed (above 0, or on),
the percentage (above 0), the power (above 100 W). A role with no value (unavailable, unknown, unknown to Home
Assistant, or `none`) SHALL be skipped.

#### Scenario: No speed entity
- **WHEN** the speed role is `none`, the percentage reads 38.9 %, DHW demand is off and winter is on
- **THEN** the mode is `heating`

#### Scenario: Power only
- **WHEN** the speed and percentage roles are `none`, the power reads 786 W and DHW demand is on
- **THEN** the mode is `dhw`

#### Scenario: Standby power
- **WHEN** the speed and percentage roles are `none`, the power reads 15 W and DHW demand is on
- **THEN** the mode is `standby`

#### Scenario: Speed wins
- **WHEN** the speed reads 0 rpm and the power reads 300 W
- **THEN** the compressor counts as stopped
