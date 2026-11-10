## Purpose

The operating mode the card derives from the heat pump's live values, and the valve positions and active circuits
that follow from it, so the drawing shows where heat flows right now.

## ADDED Requirements

### Requirement: One derived mode
The card SHALL derive exactly one mode from the live values: `off`, `dhw`, `active_cooling`, `heating`,
`passive_cooling` or `standby`, taking the first whose condition holds, in that order. The compressor counts as
running when its speed is above 0 rpm; the production pump counts as running when its speed is above 0 %.

#### Scenario: Off wins
- **WHEN** the on/off state reads `OFF` while the compressor still reports 1500 rpm
- **THEN** the mode is `off`

### Requirement: Off mode
The mode SHALL be `off` when the heat pump's on/off state reads `OFF` (case-insensitive), whatever the other
values are. Any other on/off state, including `EMERGENCY`, SHALL NOT make the mode `off`.

#### Scenario: Off
- **WHEN** the heat pump's on/off state reads `OFF`
- **THEN** the mode is `off`

#### Scenario: Emergency is not off
- **WHEN** the on/off state reads `EMERGENCY` and the compressor runs with DG1 demand in winter
- **THEN** the mode is `heating`

### Requirement: Modes while the compressor runs
While the compressor runs, the mode SHALL be `dhw` when DHW demand is on, otherwise `active_cooling` when summer is
on and active cooling is `true`, otherwise `heating`.

#### Scenario: Heating
- **WHEN** the compressor runs at 2803 rpm, DHW demand is off and winter is on
- **THEN** the mode is `heating`

#### Scenario: DHW wins over heating
- **WHEN** the compressor runs, DHW demand is on and heating (DG1) demand is also on
- **THEN** the mode is `dhw`

#### Scenario: Active cooling
- **WHEN** the compressor runs, summer is on, DHW demand is off and active cooling is `true`
- **THEN** the mode is `active_cooling`

### Requirement: Modes while the compressor is stopped
While the compressor is stopped, the mode SHALL be `passive_cooling` when summer is on, the production pump runs
and passive cooling is `true`, otherwise `standby`.

#### Scenario: Passive cooling
- **WHEN** the compressor is at 0 rpm, summer is on, the production pump runs at 60 % and passive cooling is `true`
- **THEN** the mode is `passive_cooling`

#### Scenario: Passive cooling unused
- **WHEN** the same values occur but passive cooling is `unused`
- **THEN** the mode is `standby`

### Requirement: Missing inputs fall back safely
An unavailable or unknown input SHALL count as not running or not active. If the compressor speed is unknown,
the mode SHALL be `standby` unless the on/off state reads `OFF`.

#### Scenario: Compressor speed unavailable
- **WHEN** the compressor rpm is `unavailable` and DHW demand is on
- **THEN** the mode is `standby`

#### Scenario: Bridge offline
- **WHEN** every heat pump entity is `unavailable` because the bridge is offline
- **THEN** the mode is `standby`, and the card shows an offline indication

### Requirement: Alarm overlay
When the alarm is on, the card SHALL show an alarm indication in addition to the derived mode. The alarm SHALL
NOT change the mode.

#### Scenario: Alarm while heating
- **WHEN** the mode is `heating` and the alarm is on
- **THEN** the card shows the alarm indication and still draws the heating circuits as active

### Requirement: Valve positions follow the mode
The mode SHALL set the drawn positions of the valves:
- DHW valve 26 points to ports 5/6 in `dhw`, and to ports 1/2 otherwise.
- Cycle inversion valve 14 is reversed in `active_cooling` only.
- Passive cooling valves 27 and 28 route through exchanger 10 in `passive_cooling` only.

#### Scenario: DHW valve
- **WHEN** the mode is `dhw`
- **THEN** valve 26 is drawn open towards the DHW ports and closed towards the production outlet

#### Scenario: Inversion valve
- **WHEN** the mode is `active_cooling`
- **THEN** valve 14 is drawn reversed, and the refrigerant flows through 7 and 8 in the reversed direction

### Requirement: Active circuits follow the mode
Each mode SHALL define which circuits are active:
- `heating`: refrigerant, brine and production to ports 1/2.
- `dhw`: refrigerant, brine and production to ports 5/6, plus the DHW coil.
- `active_cooling`: the reversed refrigerant, brine and production to ports 1/2.
- `passive_cooling`: brine and production through exchanger 10.
- `off` and `standby`: none.
A circuit whose part is `unused` or `false` SHALL never be active.

#### Scenario: Heating circuits
- **WHEN** the mode is `heating`
- **THEN** the refrigerant, brine and DG1 production circuits are active, and the DHW loop is not

#### Scenario: Standby
- **WHEN** the mode is `standby`
- **THEN** no circuit is active, and all pipes are drawn muted
