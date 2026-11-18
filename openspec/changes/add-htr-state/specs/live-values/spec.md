## MODIFIED Requirements

### Requirement: Footer
The card SHALL show a footer with:
- the derived mode
- the on/off state
- the season (summer or winter)
- the outside temperature
- the efficiency, COP or EER (see "Footer efficiency")
- the mode's power items in W (see "Footer power items by mode")
- the alarm and offline indications when they apply

The footer SHALL NOT show the condensation or the evaporation capacity under those names.

In the compact layout (responsive-layout) the footer SHALL show only the derived mode, the outside temperature,
the COP, and the alarm and offline indications when they apply.

#### Scenario: Footer while heating
- **WHEN** the mode is `heating`, winter is on, the system COP is 4.6, the DG1 power is 5211 W, HTR is `true` with an
  external tank and the HTR power is 1835 W, in the full layout
- **THEN** the footer shows "Heating", the winter season, "COP 4.6", "DG1 5211 W" and "HTR 1835 W", and no
  condensation or evaporation item

### Requirement: Roles not present are hidden
A role set to `none` (card-config) SHALL show nothing: no label, no dash and no footer item. Its component SHALL
still be drawn. A role bound to an entity Home Assistant does not know SHALL still show a muted dash, except an
optional role whose prefix default does not exist (card-config "Optional roles"): its fallback shows instead.

#### Scenario: No pressure sensors
- **WHEN** the config sets both pressure roles of the production and brine groups to `none`, in the full layout
- **THEN** no label is shown at items 37 and 38, and both pressure probes are still drawn

#### Scenario: No COP
- **WHEN** the config sets `entities: { unit: { cop: none, system_cop: none } }`
- **THEN** the footer shows no COP item

#### Scenario: Unknown entity keeps its dash
- **WHEN** the production outlet role is bound to an entity Home Assistant does not know
- **THEN** the label at probe 33 shows a muted dash

## ADDED Requirements

### Requirement: Footer power items by mode
In the full layout the footer SHALL show, in W (0 decimals by default; an entity's display precision applies, see
"Locale and precision"): in `heating` "DG1" (the DG1 power) and "HTR" (the
HTR power); in `dhw` "DHW" (the DHW power); in `active_cooling` "Cooling" (the evaporation capacity) and "HTR"; in
every other mode no power item. "DG1" and "DHW" SHALL show the condensation capacity when their role has no entity
(card-config "Optional roles"). "HTR" SHALL show only when HTR is `true`, `dhw` is `external` or `internal` and the
HTR power role has an entity.

#### Scenario: DHW power
- **WHEN** the mode is `dhw` and the DHW power is 5043 W, in the full layout
- **THEN** the footer shows "DHW 5043 W" and no DG1, HTR or Cooling item

#### Scenario: Active cooling with HTR
- **WHEN** the mode is `active_cooling`, the evaporation capacity is 4000 W, HTR is `true` with an internal tank and
  the HTR power is 3200 W, in the full layout
- **THEN** the footer shows "Cooling 4000 W" and "HTR 3200 W"

#### Scenario: HTR idle while heating
- **WHEN** the mode is `heating`, HTR is `true` with an external tank, the HTR state is off and the HTR power is 0 W
- **THEN** the footer shows "HTR 0 W"

#### Scenario: No power item in passive cooling
- **WHEN** the mode is `passive_cooling`, in the full layout
- **THEN** the footer shows no DG1, DHW, Cooling or HTR item

#### Scenario: DG1 without the firmware's split
- **WHEN** the mode is `heating`, the DG1 power role has no entity and the condensation capacity is 4712 W
- **THEN** the footer shows "DG1 4712 W"

#### Scenario: No HTR power role
- **WHEN** the mode is `heating`, HTR is `true` with an external tank, and the HTR power role has no entity
- **THEN** the footer shows no HTR item

#### Scenario: No HTR item with an unused tank
- **WHEN** the mode is `heating`, HTR is `true` and `dhw` is `unused`
- **THEN** the footer shows no HTR item

#### Scenario: Power unavailable
- **WHEN** the mode is `heating` and the DG1 power entity exists and is `unavailable`
- **THEN** the DG1 item shows a muted dash, not the condensation capacity

#### Scenario: Compact footer without power items
- **WHEN** the mode is `heating` with HTR running, in the compact layout
- **THEN** the footer shows no DG1 or HTR item

### Requirement: Footer efficiency
The footer's efficiency SHALL come from the system COP role, or from the COP role when the system COP role has no
entity (card-config "Optional roles"). A value of 0 SHALL show as a muted dash. Its caption SHALL be "EER" in
`active_cooling` and "COP" in every other mode.

#### Scenario: System COP first
- **WHEN** the system COP is 4.6 and the register COP is 5.1
- **THEN** the footer shows "COP 4.6"

#### Scenario: Register COP as fallback
- **WHEN** the system COP role has no entity and the register COP is 5.1
- **THEN** the footer shows "COP 5.1"

#### Scenario: Zero is no efficiency
- **WHEN** the mode is `standby` and the system COP is 0
- **THEN** the footer's COP item shows a muted dash

#### Scenario: EER while cooling
- **WHEN** the mode is `active_cooling` and the system COP is 3.9
- **THEN** the footer shows "EER 3.9"

#### Scenario: System COP unavailable
- **WHEN** the system COP entity exists and is `unavailable`, and the register COP is 5.1
- **THEN** the footer's COP item shows a muted dash, not 5.1
