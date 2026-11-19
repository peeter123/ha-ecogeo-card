# Spec Delta

## ADDED Requirements

### Requirement: Values on the drawing
The drawing SHALL show these values, and no others: production out and in (33, 34), brine out and in (31, 32), the
production and brine pressures (38, 37), the speeds of pumps 15 and 16, the discharge and suction temperatures and
pressures (30, 36, 29, 35), the compressor speed (11), the expansion valve opening and the superheat (12), the
source's Out, the DHW temperature, and the DG1 and DHW demand. A value whose part is not drawn SHALL NOT be shown.

#### Scenario: Heating with every part
- **WHEN** the card renders model B, `source: air`, `dhw: external`, variant 4 in heating with both demands on
- **THEN** exactly those 19 values are shown, and no compressor percentage or power, condensation or evaporation
  temperature, fan speed, outside temperature, air unit In, DG1 setpoint, DHW setpoint or start delta-T

#### Scenario: Ground source
- **WHEN** the card renders `source: ground`
- **THEN** the source's Out is the ground collector's Out, and no ground collector In is shown

### Requirement: Refrigerant values
The card SHALL show the discharge temperature 30 and pressure 36 together beside their pair, the suction temperature
29 and pressure 35 together beside theirs (schematic-drawing "Refrigerant probe pairs"), the compressor 11 speed in
rpm, and the expansion valve 12 opening in % with the superheat in K beside valve 12.

#### Scenario: Compressor label
- **WHEN** the compressor runs at 2803 rpm and 38.9 % and draws 786 W
- **THEN** the label near item 11 reads "2803 rpm", and neither "38.9 %" nor "786 W" is shown

#### Scenario: Superheat and valve opening
- **WHEN** the superheat entity reports 6.2 °C and the expansion valve opening 58 %
- **THEN** the labels near item 12 read "6.2 K" and "58 %"

#### Scenario: Probe pair values
- **WHEN** the discharge reads 47.6 °C and 16.2 bar and the suction 4.3 °C and 6.9 bar
- **THEN** "47.6 °C" and "16.2 bar" are shown together beside probes 30 and 36, and "4.3 °C" and "6.9 bar" beside
  probes 29 and 35

### Requirement: Hydraulic values
The card SHALL show temperatures 31-34 with Out and In captions beside their probes, pressures 37/38 beside their
transducers, and the speeds of pumps 15 and 16 in % at the pumps. Values of parts that are not drawn, and the values
of an unused tank (`dhw: unused`), SHALL NOT be shown.

#### Scenario: Production labels
- **WHEN** the production outlet reads 25.2 °C, the production pressure 1.7 bar and pump 15 runs at 99.9 %
- **THEN** "25.2 °C" with an Out caption is shown beside probe 33, "1.7 bar" beside transducer 38 and "99.9 %" at
  pump 15

#### Scenario: Brine captions
- **WHEN** the brine outlet reads 2.3 °C and the brine inlet 5.7 °C
- **THEN** "2.3 °C" is shown with an Out caption beside probe 31 and "5.7 °C" with an In caption beside probe 32

#### Scenario: Part not drawn
- **WHEN** the config sets `dhw: none`
- **THEN** no tank labels are shown

#### Scenario: Unused tank labels
- **WHEN** the config sets `dhw: unused`
- **THEN** the tank is drawn muted and no tank labels are shown

### Requirement: Power items in the footer
The footer SHALL show, in W (0 decimals by default; an entity's display precision applies, see "Locale and
precision"): in `heating` "DG1" (the DG1 power) and "HTR" (the HTR power); in `dhw` "DHW" (the DHW power); in
`active_cooling` "Cooling" (the evaporation capacity) and "HTR"; in every other mode none. "DG1" and "DHW" SHALL
show the condensation capacity when their role has no entity (card-config "Optional roles"). HTR: "Footer HTR item".

#### Scenario: DHW power
- **WHEN** the mode is `dhw` and the DHW power is 5043 W
- **THEN** the footer shows "DHW 5043 W" and no DG1, HTR or Cooling item

#### Scenario: Active cooling with HTR
- **WHEN** the mode is `active_cooling`, the evaporation capacity is 4000 W, HTR is `true` with an internal tank and
  the HTR power is 3200 W
- **THEN** the footer shows "Cooling 4000 W" and "HTR 3200 W"

#### Scenario: HTR idle while heating
- **WHEN** the mode is `heating`, HTR is `true` with an external tank, the HTR state is off and the HTR power is 0 W
- **THEN** the footer shows "HTR 0 W"

#### Scenario: No power item in passive cooling
- **WHEN** the mode is `passive_cooling`
- **THEN** the footer shows no DG1, DHW, Cooling or HTR item

#### Scenario: DG1 without the firmware's split
- **WHEN** the mode is `heating`, the DG1 power role has no entity and the condensation capacity is 4712 W
- **THEN** the footer shows "DG1 4712 W"

#### Scenario: Power unavailable
- **WHEN** the mode is `heating` and the DG1 power entity exists and is `unavailable`
- **THEN** the DG1 item shows a muted dash, not the condensation capacity

#### Scenario: Power items in the vertical layout
- **WHEN** the mode is `heating` with HTR running, in the vertical layout
- **THEN** the footer shows the DG1 and HTR items, wrapped within the card

## MODIFIED Requirements

### Requirement: Footer
The card SHALL show a footer with:
- the derived mode
- the outside temperature
- the efficiency, COP or EER (see "Footer efficiency")
- the mode's power items in W (see "Power items in the footer")
- the alarm and offline indications when they apply

The footer SHALL NOT show the on/off state, the season, or the condensation or evaporation capacity under those names.
It SHALL be the same in both layouts.

#### Scenario: Footer while heating
- **WHEN** the mode is `heating`, winter is on, the system COP is 4.6, the DG1 power is 5211 W, HTR is `true` with an
  external tank and the HTR power is 1835 W
- **THEN** the footer shows "Heating", the outside temperature, "COP 4.6", "DG1 5211 W" and "HTR 1835 W", and no
  on/off state, season, condensation or evaporation item

### Requirement: Unit conversion
Units SHALL be converted where needed: °F to °C, kW to W, and kPa, MPa, Pa, mbar and psi to bar. A temperature
difference reported in °F SHALL be converted back with the same absolute formula, because Home Assistant converted
it as an absolute temperature.

#### Scenario: Fahrenheit sensor
- **WHEN** a probe reports 77 °F
- **THEN** it is shown and coloured as 25 °C

#### Scenario: Fahrenheit superheat
- **WHEN** the superheat entity reports 43.2 °F
- **THEN** the label reads "6.2 K"

#### Scenario: Pressure in kPa
- **WHEN** the production pressure entity reports 150 kPa
- **THEN** the label at item 38 reads "1.5 bar"

### Requirement: On/off states from any domain
A binary role SHALL read `on`, `true`, `yes` and `1` as on and `off`, `false`, `no` and `0` as off, case-insensitive
and from any domain. Any other state SHALL count as no value. The compressor speed and pump roles SHALL accept such
an on/off entity too: its label SHALL read "On" or "Off" instead of a number.

#### Scenario: Demand as a number
- **WHEN** the DHW demand role is bound to a sensor that reads `1`
- **THEN** the DHW demand counts as on

#### Scenario: Summer from a switch
- **WHEN** the summer role is bound to `switch.summer_mode`, which reads `on`
- **THEN** summer counts as on

#### Scenario: Pump as on/off
- **WHEN** the pump 15 role is bound to a binary sensor that reads `on`
- **THEN** the label at pump 15 reads "On"

### Requirement: Roles not present are hidden
A role set to `none` (card-config) SHALL show nothing: no label, no dash and no footer item. Its component SHALL
still be drawn. A role bound to an entity Home Assistant does not know SHALL still show a muted dash, except an
optional role whose prefix default does not exist (card-config "Optional roles"): its fallback shows instead. An
optional role set to `none` likewise hands its footer item to its fallback role.

#### Scenario: No pressure sensors
- **WHEN** the config sets both pressure roles of the production and brine groups to `none`
- **THEN** no label is shown at items 37 and 38, and both transducers are still drawn

#### Scenario: No COP
- **WHEN** the config sets `entities: { unit: { cop: none, system_cop: none } }`
- **THEN** the footer shows no COP item

#### Scenario: Unknown entity keeps its dash
- **WHEN** the production outlet role is bound to an entity Home Assistant does not know
- **THEN** the label at probe 33 shows a muted dash

## REMOVED Requirements

### Requirement: Refrigerant values beside their components
**Reason**: The detail levels and the compact layout are gone; the refrigerant values are one set in both layouts,
with the superheat and valve opening always shown and the compressor percentage and power, condensation and
evaporation temperatures no longer drawn.
**Migration**: See "Refrigerant values".

### Requirement: Hydraulic values beside their components
**Reason**: The full level's production column and the compact subset are gone; the hydraulic values are one set in
both layouts, without the DG1 setpoint.
**Migration**: See "Hydraulic values".

### Requirement: Heating demand
**Reason**: The DG1 demand now sits on the emitter and is shown in both layouts.
**Migration**: See heating-emitter "DG1 demand on the emitter".

### Requirement: Footer power items by mode
**Reason**: The compact footer without power items is gone; both layouts show the same footer.
**Migration**: See "Power items in the footer".
