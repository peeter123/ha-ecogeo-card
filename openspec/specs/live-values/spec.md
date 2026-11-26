# live-values Specification

## Purpose

How the card shows live values on the schematic: which values appear where, how numbers and units are formatted,
how missing values look, and what happens on a tap.

## Requirements

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

### Requirement: The card's own units
The card SHALL format every number itself, not through Home Assistant's state formatting. Every value SHALL be
shown with the card's own unit for its role, joined by a no-break space: rpm, %, W, bar, °C for temperatures, and
K for temperature differences (superheat, start delta-T). The COP has no unit. A value whose entity reports a unit
the card cannot convert to the role's unit SHALL instead be shown as the entity's number with the entity's own unit,
joined by a no-break space.

#### Scenario: Percent keeps its space
- **WHEN** Home Assistant's language is English and pump 16 runs at 99.9 %
- **THEN** the label reads "100 %" with a no-break space, not "100%" or "99.9 %"

#### Scenario: Compressor speed in Hz
- **WHEN** the compressor speed entity reports 45 with the unit Hz
- **THEN** the label near item 11 reads "45 Hz", not "45 rpm"

#### Scenario: Pump speed in rpm
- **WHEN** the pump 15 entity reports 2400 with the unit rpm
- **THEN** the label at pump 15 reads "2400 rpm", not "2400 %"

### Requirement: Locale and precision
Numbers SHALL use Home Assistant's locale and number format setting. The decimals SHALL come from the entity's
display precision when Home Assistant has one and the entity's unit is the card's unit for the role, and from the
card's default for the role otherwise.

#### Scenario: Locale
- **WHEN** Home Assistant's number format uses a decimal comma
- **THEN** the production outlet reads "25,2 °C"

#### Scenario: Display precision
- **WHEN** the production outlet entity has a display precision of 0 and reads 25.2 °C
- **THEN** the label reads "25 °C"

#### Scenario: Passed-through decimals
- **WHEN** the compressor speed entity reports 45.6 Hz without a display precision
- **THEN** the label reads "45.6 Hz"

#### Scenario: Pump precision ignored
- **WHEN** the pump 15 entity has a display precision of 1 and reads 99.9 %
- **THEN** the label at pump 15 reads "100 %"

### Requirement: Unit conversion
Units SHALL be converted where needed: °F to °C, kW to W, and kPa, MPa, Pa, mbar and psi to bar. A temperature
difference reported in °F SHALL be converted back with the same absolute formula, because Home Assistant converted
it as an absolute temperature.

#### Scenario: Fahrenheit sensor
- **WHEN** a probe reports 77 °F
- **THEN** it is shown and coloured as 25 °C

#### Scenario: Fahrenheit superheat
- **WHEN** the superheat entity, a temperature difference, reports 43.2 °F
- **THEN** the card reads it as 6.2 K (a unit test of the readings), and no label shows it, as the superheat is no
  longer drawn (decided by the user 2026-11-20)

#### Scenario: Pressure in kPa
- **WHEN** the production pressure entity reports 150 kPa
- **THEN** the label at item 38 reads "1.5 bar"

### Requirement: Missing and sentinel values
An `unavailable` or `unknown` state, a non-numeric state, or the firmware sentinel -999.9 (any value at or below
-999) SHALL show as a muted dash instead of a number. It SHALL NOT raise an error.

#### Scenario: Sentinel
- **WHEN** a temperature entity reads -999.900024414062
- **THEN** its label shows a muted dash

### Requirement: Read-only interaction
Tapping a value label SHALL open Home Assistant's more-info dialog for that entity. The card SHALL NOT call any
service or change any entity. Changes made in the more-info dialog of a setpoint (a `number` entity) are Home
Assistant's own controls, not the card's.

#### Scenario: Tap a probe
- **WHEN** the user taps the brine inlet label
- **THEN** the more-info dialog of the brine inlet entity opens

### Requirement: Efficient updates
The card SHALL re-render only when the state of one of its resolved entities changes, or when the theme, locale or
language, the registry entries of its entities, or the configuration changes.

#### Scenario: Unrelated entity
- **WHEN** a light elsewhere in Home Assistant changes state
- **THEN** the card does not re-render

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

### Requirement: Footer HTR item
In `heating` and `active_cooling` the footer's "HTR" item SHALL show only when HTR is `true`, `dhw` is `external` or
`internal` and the HTR power role has an entity; it SHALL show also at 0 W while HTR is idle.

#### Scenario: No HTR power role
- **WHEN** the mode is `heating`, HTR is `true` with an external tank, and the HTR power role has no entity
- **THEN** the footer shows no HTR item

#### Scenario: No HTR item with an unused tank
- **WHEN** the mode is `heating`, HTR is `true` and `dhw` is `unused`
- **THEN** the footer shows no HTR item

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

### Requirement: Refrigerant values
The card SHALL show the discharge temperature 30 and pressure 36 together beside their pair, the suction temperature
29 and pressure 35 together beside theirs (schematic-drawing "Refrigerant probe pairs"), the compressor 11 speed in
rpm, and the expansion valve 12 opening in %, centred under valve 12. The superheat SHALL NOT be shown (decided by the
user 2026-11-20).

#### Scenario: Compressor label
- **WHEN** the compressor runs at 2803 rpm and 38.9 % and draws 786 W
- **THEN** the label near item 11 reads "2803 rpm", and neither "38.9 %" nor "786 W" is shown

#### Scenario: Valve opening without superheat
- **WHEN** the superheat entity reports 6.2 °C and the expansion valve opening 58 %, in either layout
- **THEN** one label near item 12 reads "58 %", centred under valve 12, and no "6.2 K" is shown

#### Scenario: Probe pair values
- **WHEN** the discharge reads 47.6 °C and 16.2 bar and the suction 4.3 °C and 6.9 bar
- **THEN** "47.6 °C" and "16.2 bar" are shown together beside probes 30 and 36, and "4.3 °C" and "6.9 bar" beside
  probes 29 and 35

### Requirement: Hydraulic values
The card SHALL show temperatures 31-34 with Out and In captions beside their probes, pressures 37/38 beside their
transducers, and the speeds of pumps 15 and 16 in whole percentages at the pumps (decided by the user 2026-11-20; see
"Locale and precision"). In the vertical layout some of them are drawn rotated (responsive-layout "Rotated values in
the vertical layout"), with the same texts. Values of parts that are not drawn, and the values of an unused tank
(`dhw: unused`), SHALL NOT be shown.

#### Scenario: Production labels
- **WHEN** the production outlet reads 25.2 °C, the production pressure 1.7 bar and pump 15 runs at 99.9 %
- **THEN** "25.2 °C" with an Out caption is shown beside probe 33, "1.7 bar" beside transducer 38 and "100 %" at
  pump 15

#### Scenario: Whole-percent pump 16
- **WHEN** pump 16 runs at 42.4 %
- **THEN** the label at pump 16 reads "42 %", with a no-break space before the %

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

### Requirement: Decimals of converted values
The decimals of a converted value, such as kW shown in W, SHALL come from the card's default for the role.

#### Scenario: Converted power
- **WHEN** a power entity reports 1.234 kW with a display precision of 2 and the card shows the role in W
- **THEN** the label uses the role's default number of decimals, not the entity's display precision

### Requirement: Temperature difference in degrees Celsius
A temperature difference reported in °C SHALL count as the card's unit K, since the number is unchanged.

#### Scenario: Difference in °C
- **WHEN** a temperature difference entity reports 5.2 °C
- **THEN** the label shows 5.2 K and takes its decimals as for the unit K

### Requirement: Decimals of values in the entity's own unit
A value shown with the entity's own unit (see "The card's own units") SHALL take its decimals from the entity's
display precision, or else keep the decimals of its state.

#### Scenario: Own unit with display precision
- **WHEN** the compressor speed entity reports 45.6 Hz with a display precision of 0
- **THEN** the label reads "46 Hz"

### Requirement: Pump speed precision
The speeds of pumps 15 and 16 in % SHALL show whole percentages (0 decimals), whatever the entity's display precision
(decided by the user 2026-11-20).

#### Scenario: Brine pump precision ignored
- **WHEN** the pump 16 entity has a display precision of 1 and reads 49.6 %
- **THEN** the label at pump 16 reads "50 %"
