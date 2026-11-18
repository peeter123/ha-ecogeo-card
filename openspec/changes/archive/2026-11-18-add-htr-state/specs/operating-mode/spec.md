## RENAMED Requirements

- FROM: `### Requirement: HTR recovery in active cooling`
- TO: `### Requirement: HTR recovery`

## MODIFIED Requirements

### Requirement: Active circuits follow the mode
Each mode SHALL define which circuits are active:
- `heating`: refrigerant, brine and production to ports 1/2 (HTR: see below).
- `dhw`: refrigerant, brine and production to ports 5/6, plus the DHW coil.
- `active_cooling`: the reversed refrigerant, brine and production to ports 1/2 (HTR: see below).
- `passive_cooling` and `defrost`: brine, production to ports 1/2, and both through exchanger 10.
- `off` and `standby`: none.

With `dhw: none` or `dhw: unused` the `dhw` mode is still derived and labelled, valve 26 still follows the mode,
but no circuit to ports 5/6, no DHW coil and no HTR circuit is active. Valves 27/28 route through exchanger 10 only
when that part is drawn (`true` or `unused`). The exchanger 10 circuit does not depend on the brine pump.

#### Scenario: Heating circuits
- **WHEN** the mode is `heating` and the HTR state is off
- **THEN** the refrigerant, brine and DG1 production circuits are active, and the DHW loop is not

#### Scenario: Standby
- **WHEN** the mode is `standby`
- **THEN** no circuit is active, and all pipes are drawn muted

#### Scenario: DHW mode with an unused tank
- **WHEN** the mode is `dhw` and `dhw` is `unused`
- **THEN** no circuit to ports 5/6 and no DHW coil is active

### Requirement: HTR recovery
In `heating` and `active_cooling`, with HTR `true` and `dhw` `external` or `internal` (not `none` or `unused`), the
HTR circuit (exchanger 9, pump 17 and the water to the DHW lines) and the DHW coil SHALL be active while the HTR state
role is on. When that role has no entity (card-config "Optional roles"), they SHALL be active only in
`active_cooling` with a condensation capacity above 0 W. In every other case, `dhw` included, HTR SHALL be drawn idle.

#### Scenario: HTR while heating
- **WHEN** the mode is `heating`, HTR is `true`, `dhw` is `external` and the HTR state is on
- **THEN** the HTR circuit, the DHW coil and the DG1 production circuit are active, and valve 26 points to ports 1/2

#### Scenario: HTR idle while heating
- **WHEN** the mode is `heating`, HTR is `true` and the HTR state is off
- **THEN** exchanger 9 and pump 17 are drawn without flow

#### Scenario: HTR state unavailable
- **WHEN** the mode is `heating`, HTR is `true` and the HTR state entity is unavailable
- **THEN** exchanger 9 and pump 17 are drawn without flow

#### Scenario: HTR state decides in active cooling
- **WHEN** the mode is `active_cooling`, HTR is `true`, the HTR state is off and the condensation capacity is 1200 W
- **THEN** exchanger 9 and pump 17 are drawn without flow, and the DHW coil is muted

#### Scenario: HTR state ignored in DHW mode
- **WHEN** the mode is `dhw`, HTR is `true` and the HTR state is still on
- **THEN** exchanger 9 and pump 17 are drawn without flow, and the DHW production circuit to ports 5/6 is active

#### Scenario: Heat partly into the tank
- **WHEN** the HTR state role has no entity, the mode is `active_cooling`, HTR is `true`, the condensation capacity
  is 1200 W and the brine pump runs
- **THEN** the HTR circuit, the DHW coil and the brine circuit are all active, and valve 26 points to ports 1/2

#### Scenario: All heat into the tank
- **WHEN** the HTR state role has no entity, the mode is `active_cooling`, the condensation capacity is 3000 W and
  the brine pump is at 0 %
- **THEN** the HTR circuit and the DHW coil are active, and the brine circuit is muted

#### Scenario: No HTR while heating without the state
- **WHEN** the HTR state role has no entity, the mode is `heating` and HTR is `true`
- **THEN** exchanger 9 and pump 17 are drawn without flow

#### Scenario: HTR idle with an unused tank
- **WHEN** the mode is `heating`, HTR is `true`, `dhw` is `unused` and the HTR state is on
- **THEN** exchanger 9 and pump 17 are drawn without flow, and the DHW coil is muted
