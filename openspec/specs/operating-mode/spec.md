# operating-mode Specification

## Purpose

The operating mode the card derives from the heat pump's live values, and the valve positions and active circuits
that follow from it, so the drawing shows where heat flows right now.

## Requirements

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

The compressor counts as running when its speed is above 0 rpm. The production and brine pumps count as running
when their speed is above 0 %.

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

### Requirement: Defrost mode
The mode SHALL be `defrost` when the compressor operation mode reads `Defrost` (case-insensitive), whatever the
compressor speed and demands are. Every other value (`None`, `Time-Out`, `Balance`, `Cycle Inversion`, unknown)
SHALL NOT make the mode `defrost`.

#### Scenario: Defrost
- **WHEN** the compressor operation mode reads `Defrost`, the compressor is at 0 rpm and DG1 demand is on
- **THEN** the mode is `defrost`

#### Scenario: Balance is not defrost
- **WHEN** the compressor operation mode reads `Balance` and the compressor runs at 2803 rpm in winter
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
the mode SHALL be `standby` unless it is `off` or `defrost`.

#### Scenario: Compressor speed unavailable
- **WHEN** the compressor rpm is `unavailable` and DHW demand is on
- **THEN** the mode is `standby`

#### Scenario: Every input unavailable
- **WHEN** every heat pump entity is `unavailable`
- **THEN** the mode is `standby`

### Requirement: Offline indication
The card SHALL show an offline indication when the bridge connection entity (`unit.connection`) reads `off`,
`unavailable` or `unknown`. The connection SHALL NOT change the mode. Without a connection entity, the card
SHALL show no offline indication. A configured connection entity that Home Assistant does not know counts as no
connection entity.

#### Scenario: Bridge offline
- **WHEN** the connection entity reads `off` and every other heat pump entity is `unavailable`
- **THEN** the mode is `standby`, and the card shows the offline indication

#### Scenario: Bridge online
- **WHEN** the connection entity reads `on`
- **THEN** the card shows no offline indication

### Requirement: Alarm overlay
When the alarm is on, the card SHALL show an alarm indication in addition to the derived mode. The alarm SHALL
NOT change the mode.

#### Scenario: Alarm while heating
- **WHEN** the mode is `heating` and the alarm is on
- **THEN** the card shows the alarm indication and still draws the heating circuits as active

### Requirement: Valve positions follow the mode
The mode SHALL set the drawn positions of the valves:
- DHW valve 26 points to ports 5/6 in `dhw`, and to ports 1/2 otherwise, including `defrost` and HTR recovery.
- Cycle inversion valve 14 is reversed in `active_cooling` only.
- Valves 27 and 28 route through exchanger 10 in `passive_cooling` and `defrost` only.

#### Scenario: DHW valve
- **WHEN** the mode is `dhw`
- **THEN** valve 26 is drawn open towards the DHW ports and closed towards the production outlet

#### Scenario: Inversion valve
- **WHEN** the mode is `active_cooling`
- **THEN** valve 14 is drawn reversed, and the refrigerant flows through 7 and 8 in the reversed direction

#### Scenario: Defrost valves
- **WHEN** the mode is `defrost`
- **THEN** valves 27 and 28 are drawn towards exchanger 10, valve 14 is normal, and valve 26 points to ports 1/2

### Requirement: Active circuits follow the mode
Each mode SHALL define which circuits are active:
- `heating`: refrigerant, brine and production to ports 1/2.
- `dhw`: refrigerant, brine and production to ports 5/6, plus the DHW coil.
- `active_cooling`: the reversed refrigerant, brine and production to ports 1/2 (HTR: see below).
- `passive_cooling` and `defrost`: brine, production to ports 1/2, and both through exchanger 10.
- `off` and `standby`: none.

With `dhw: none` the `dhw` mode is still derived and labelled, valve 26 still follows the mode, but no circuit to
ports 5/6, no DHW coil and no HTR circuit is active. Valves 27/28 route through exchanger 10 only when that part
is drawn (`true` or `unused`). The exchanger 10 circuit does not depend on the brine pump.

#### Scenario: Heating circuits
- **WHEN** the mode is `heating`
- **THEN** the refrigerant, brine and DG1 production circuits are active, and the DHW loop is not

#### Scenario: Standby
- **WHEN** the mode is `standby`
- **THEN** no circuit is active, and all pipes are drawn muted

### Requirement: Circuits limited by pumps and feature states
The brine circuit SHALL be active only while the brine pump runs. A circuit whose part is `false` SHALL never be
active. A circuit whose part is `unused` SHALL never be active, except exchanger 10 in `defrost`.

#### Scenario: Brine pump stopped
- **WHEN** the mode is `active_cooling` and the brine pump is at 0 %
- **THEN** the brine circuit is muted, and the refrigerant and production circuits are active

#### Scenario: Defrost with passive cooling unused
- **WHEN** the mode is `defrost`, the brine pump runs and passive cooling is `unused`
- **THEN** exchanger 10, valves 27/28, the brine circuit and the production circuit are active, and the
  refrigerant is muted

#### Scenario: Defrost without exchanger 10
- **WHEN** the mode is `defrost` and passive cooling is `false`
- **THEN** the card shows the mode "Defrost", and no exchanger 10 circuit is drawn

### Requirement: HTR recovery in active cooling
In `active_cooling`, the HTR circuit (exchanger 9, pump 17 and the water to the DHW lines) and the DHW coil SHALL
be active when HTR is `true`, `dhw` is not `none` and the condensation capacity is above 0 W. In every other
mode, and when the condensation capacity is 0 W or unknown, HTR SHALL be drawn idle.

#### Scenario: Heat partly into the tank
- **WHEN** the mode is `active_cooling`, HTR is `true`, the condensation capacity is 1200 W and the brine pump runs
- **THEN** the HTR circuit, the DHW coil and the brine circuit are all active, and valve 26 points to ports 1/2

#### Scenario: All heat into the tank
- **WHEN** the mode is `active_cooling`, the condensation capacity is 3000 W and the brine pump is at 0 %
- **THEN** the HTR circuit and the DHW coil are active, and the brine circuit is muted

#### Scenario: HTR idle while heating
- **WHEN** the mode is `heating` and HTR is `true`
- **THEN** exchanger 9 and pump 17 are drawn without flow
