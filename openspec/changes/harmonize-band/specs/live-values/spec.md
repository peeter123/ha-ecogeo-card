## MODIFIED Requirements

### Requirement: Footer
The card SHALL show a footer with:
- the derived mode
- the outside temperature, when no air unit is drawn
- the efficiency, COP or EER (see "Footer efficiency")
- the mode's power items in W (see "Power items in the footer")
- the alarm and offline indications when they apply

The footer SHALL NOT show the on/off state, the season, or the condensation or evaporation capacity under those names.
It SHALL be the same in both layouts.

#### Scenario: Footer while heating
- **WHEN** the source is `ground`, the mode is `heating`, winter is on, the system COP is 4.6, the DG1 power is
  5211 W, HTR is `true` with an external tank and the HTR power is 1835 W
- **THEN** the footer shows "Heating", the outside temperature, "COP 4.6", "DG1 5211 W" and "HTR 1835 W", and no
  on/off state, season, condensation or evaporation item

#### Scenario: Footer with an air unit
- **WHEN** the source is `air` or `hybrid`
- **THEN** the footer shows no outside temperature, and the air unit shows it

### Requirement: Values on the drawing
The drawing SHALL show these values, and no others: production out and in (33, 34), brine out and in (31, 32), the
production and brine pressures (38, 37), the speeds of pumps 15 and 16, the discharge and suction temperatures and
pressures (30, 36, 29, 35), the compressor speed (11), the expansion valve opening (12), the source's Out, the DHW
temperature, and, at the air unit, the outside temperature and the fan speed. A value whose part is not drawn SHALL
NOT be shown.

#### Scenario: Heating with every part
- **WHEN** the card renders model B, `source: air`, `dhw: external`, variant 4 in heating with both demands on
- **THEN** exactly those 18 values are shown, and no "Demand" (decided by the user 2026-11-23), superheat (decided
  by the user 2026-11-20), compressor percentage or power, condensation or evaporation temperature, air unit In, DG1
  setpoint, DHW setpoint or start delta-T

#### Scenario: Ground source
- **WHEN** the card renders `source: ground`
- **THEN** the source's Out is the ground collector's Out, no ground collector In is shown, and no fan speed or
  outside temperature is shown on the drawing
