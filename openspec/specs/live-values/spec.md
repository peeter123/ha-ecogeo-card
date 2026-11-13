# live-values Specification

## Purpose

How the card shows live values on the schematic: which values appear where, how numbers and units are formatted,
how missing values look, and what happens on a tap.

## Requirements

### Requirement: Refrigerant values beside their components
The card SHALL show the refrigerant values next to their components:
- temperatures 29/30 and pressures 35/36
- compressor 11 speed in rpm and %, and its power in W
- expansion valve 12 opening in %, and the superheat in K
- condensation (8) and evaporation (7) temperatures

In the compact layout (responsive-layout) the card SHALL show only the compressor speed in rpm of these values.

#### Scenario: Compressor label
- **WHEN** the compressor runs at 2803 rpm and 38.9 % and draws 786 W, in the full layout
- **THEN** the labels near item 11 read "2803 rpm", "38.9 %" and "786 W"

#### Scenario: Superheat
- **WHEN** the superheat entity reports 6.2 °C, in the full layout
- **THEN** the label near item 12 reads "6.2 K"

#### Scenario: Compact refrigerant values
- **WHEN** the card shows the compact layout and the compressor runs at 2803 rpm
- **THEN** "2803 rpm" is shown, and no other refrigerant value is

### Requirement: Hydraulic values beside their components
The card SHALL show the hydraulic values next to their components: temperatures 31-34, pressures 37/38, the
speeds of pumps 15 and 16 in %, and the DG1 setpoint at connections 1/2. Values of parts that are not drawn, and
the values of an unused tank (`dhw: unused`), SHALL NOT be shown. In the compact layout (responsive-layout) the card
SHALL show only the temperatures 31-34, in their compact places with Out and In captions.

#### Scenario: Production labels
- **WHEN** the production outlet reads 25.2 °C and pump 15 runs at 99.9 %, in the full layout
- **THEN** "25.2 °C" is shown at probe 33 and "99.9 %" at pump 15

#### Scenario: Part not drawn
- **WHEN** the config sets `dhw: none`, or `source: ground`
- **THEN** no tank labels are shown, or no fan speed label is shown

#### Scenario: Unused tank labels
- **WHEN** the config sets `dhw: unused`
- **THEN** the tank is drawn muted and no tank labels are shown

#### Scenario: Compact hydraulic values
- **WHEN** the card shows the compact layout
- **THEN** the temperatures 31-34 are shown, and no pressure, pump speed or DG1 setpoint is

### Requirement: Heating demand
The card SHALL show the DG1 demand beside connections 1/2, as the tank shows its own demand: the caption "Demand"
when the demand entity is on, and nothing when it is off or unavailable. In the compact layout (responsive-layout)
the DG1 demand SHALL NOT be shown.

#### Scenario: DG1 demand
- **WHEN** the DG1 demand entity is on, in the full layout
- **THEN** "Demand" is shown at connections 1/2, and it is gone when the entity turns off

#### Scenario: Compact without demand
- **WHEN** the card shows the compact layout and the DG1 demand entity is on
- **THEN** no "Demand" caption is shown

### Requirement: Footer
The card SHALL show a footer with:
- the derived mode
- the on/off state
- the season (summer or winter)
- the outside temperature
- the COP
- the condensation and evaporation capacity in W
- the alarm and offline indications when they apply

In the compact layout (responsive-layout) the footer SHALL show only the derived mode, the outside temperature,
the COP, and the alarm and offline indications when they apply.

#### Scenario: Footer while heating
- **WHEN** the mode is `heating`, winter is on, the COP is 6.0 and the condensation capacity is 4712 W, in
  the full layout
- **THEN** the footer shows "Heating", the winter season, "6.0" and "4712 W"

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

### Requirement: Locale and precision
Numbers SHALL use Home Assistant's locale and number format setting. The decimals SHALL come from the entity's
display precision when Home Assistant has one and the entity's unit is the card's unit for the role, and from the
card's default for the role otherwise (a converted value, such as kW shown in W, uses the role default). A
temperature difference reported in °C counts as the card's unit K, since the number is unchanged. A value shown with
the entity's own unit (see "The card's own units") SHALL take its decimals from the entity's display precision, or
else keep the decimals of its state.

#### Scenario: Locale
- **WHEN** Home Assistant's number format uses a decimal comma
- **THEN** the production outlet reads "25,2 °C"

#### Scenario: Display precision
- **WHEN** the production outlet entity has a display precision of 0 and reads 25.2 °C
- **THEN** the label reads "25 °C"

#### Scenario: Passed-through decimals
- **WHEN** the compressor speed entity reports 45.6 Hz without a display precision
- **THEN** the label reads "45.6 Hz"

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
