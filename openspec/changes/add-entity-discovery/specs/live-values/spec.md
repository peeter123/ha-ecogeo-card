# Spec Delta

## MODIFIED Requirements

### Requirement: The card's own units
The card SHALL format every number itself, not through Home Assistant's state formatting. Every value SHALL be
shown with the card's own unit for its role, joined by a no-break space: rpm, %, W, bar, °C for temperatures, and
K for temperature differences (superheat, start delta-T). The COP has no unit. A value whose entity reports a unit
the card cannot convert to the role's unit SHALL instead be shown as the entity's number with the entity's own unit,
joined by a no-break space.

#### Scenario: Percent keeps its space
- **WHEN** Home Assistant's language is English and pump 16 runs at 100 %
- **THEN** the label reads "100.0 %" with a no-break space, not "100%"

#### Scenario: Compressor speed in Hz
- **WHEN** the compressor speed entity reports 45 with the unit Hz
- **THEN** the label near item 11 reads "45 Hz", not "45 rpm"

#### Scenario: Pump speed in rpm
- **WHEN** the pump 15 entity reports 2400 with the unit rpm
- **THEN** the label at pump 15 reads "2400 rpm", not "2400 %"

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
- **WHEN** the production pressure entity reports 150 kPa, in the full layout
- **THEN** the label at item 38 reads "1.5 bar"

## ADDED Requirements

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
- **WHEN** the pump 15 role is bound to a binary sensor that reads `on`, in the full layout
- **THEN** the label at pump 15 reads "On"

### Requirement: Roles not present are hidden
A role set to `none` (card-config) SHALL show nothing: no label, no dash and no footer item. Its component SHALL
still be drawn. A role bound to an entity Home Assistant does not know SHALL still show a muted dash.

#### Scenario: No pressure sensors
- **WHEN** the config sets both pressure roles of the production and brine groups to `none`, in the full layout
- **THEN** no label is shown at items 37 and 38, and both pressure probes are still drawn

#### Scenario: No COP
- **WHEN** the config sets `entities: { unit: { cop: none } }`
- **THEN** the footer shows no COP item

#### Scenario: Unknown entity keeps its dash
- **WHEN** the production outlet role is bound to an entity Home Assistant does not know
- **THEN** the label at probe 33 shows a muted dash
