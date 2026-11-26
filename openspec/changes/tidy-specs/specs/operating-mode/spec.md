# Spec Delta

## MODIFIED Requirements

### Requirement: Active circuits follow the mode
Each mode SHALL define which circuits are active:
- `heating`: refrigerant, brine and production to ports 1/2 (HTR: see below).
- `dhw`: refrigerant, brine and production to ports 5/6, plus the DHW coil.
- `active_cooling`: the reversed refrigerant, brine and production to ports 1/2 (HTR: see below).
- `passive_cooling` and `defrost`: brine, production to ports 1/2, and both through exchanger 10.
- `off` and `standby`: none.

#### Scenario: Heating circuits
- **WHEN** the mode is `heating` and the HTR state is off
- **THEN** the refrigerant, brine and DG1 production circuits are active, and the DHW loop is not

#### Scenario: Standby
- **WHEN** the mode is `standby`
- **THEN** no circuit is active, and all pipes are drawn muted

#### Scenario: DHW mode with an unused tank
- **WHEN** the mode is `dhw` and `dhw` is `unused`
- **THEN** no circuit to ports 5/6 and no DHW coil is active

## ADDED Requirements

### Requirement: Circuits without a DHW tank
With `dhw: none` or `dhw: unused` the `dhw` mode SHALL still be derived and labelled and valve 26 SHALL still follow
the mode, but no circuit to ports 5/6, no DHW coil and no HTR circuit SHALL be active.

#### Scenario: DHW mode with no tank
- **WHEN** the mode is `dhw` and `dhw` is `none`
- **THEN** the mode label reads the DHW mode, valve 26 is in its DHW position, and no circuit to ports 5/6, no DHW
  coil and no HTR circuit is active

### Requirement: Exchanger 10 routing
Valves 27/28 SHALL route through exchanger 10 only when that part is drawn (`true` or `unused`). The exchanger 10
circuit SHALL NOT depend on the brine pump.

#### Scenario: Exchanger 10 not drawn
- **WHEN** the mode is `passive_cooling` and `passive_cooling` is `false`
- **THEN** valves 27/28 do not route through exchanger 10

#### Scenario: Brine pump stopped
- **WHEN** the mode is `passive_cooling`, exchanger 10 is drawn and the brine pump reads 0 %
- **THEN** the exchanger 10 circuit is still active
