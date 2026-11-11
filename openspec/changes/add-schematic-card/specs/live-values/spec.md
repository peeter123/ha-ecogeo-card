## Purpose

How the card shows live values on the schematic: which values appear where, how numbers and units are formatted,
how missing values look, and what happens on a tap.

## ADDED Requirements

### Requirement: Refrigerant values beside their components
The card SHALL show the refrigerant values next to their components:
- temperatures 29/30 and pressures 35/36
- compressor 11 speed in rpm and %, and its power in W
- expansion valve 12 opening in %, and the superheat in K
- condensation (8) and evaporation (7) temperatures

#### Scenario: Compressor label
- **WHEN** the compressor runs at 2803 rpm and 38.9 % and draws 786 W
- **THEN** the labels near item 11 read "2803 rpm", "38.9 %" and "786 W"

#### Scenario: Superheat
- **WHEN** the superheat entity reports 6.2 °C
- **THEN** the label near item 12 reads "6.2 K"

### Requirement: Hydraulic values beside their components
The card SHALL show the hydraulic values next to their components: temperatures 31-34, pressures 37/38, the
speeds of pumps 15 and 16 in %, and the DG1 setpoint at connections 1/2. Values of parts that are not drawn
SHALL NOT be shown.

#### Scenario: Production labels
- **WHEN** the production outlet reads 25.2 °C and pump 15 runs at 99.9 %
- **THEN** "25.2 °C" is shown at probe 33 and "99.9 %" at pump 15

#### Scenario: Part not drawn
- **WHEN** passive cooling is `false`
- **THEN** no label for items 10, 27 or 28 is shown

### Requirement: Footer
The card SHALL show a footer with:
- the derived mode
- the on/off state
- the season (summer or winter)
- the outside temperature
- the COP
- the condensation and evaporation capacity in W
- the alarm and offline indications when they apply

#### Scenario: Footer while heating
- **WHEN** the mode is `heating`, winter is on, the COP is 6.0 and the condensation capacity is 4712 W
- **THEN** the footer shows "Heating", the winter season, "6.0" and "4712 W"

### Requirement: The card's own units
The card SHALL format every number itself, not through Home Assistant's state formatting. Every value SHALL be
shown with the card's own unit for its role, joined by a no-break space: rpm, %, W, bar, °C for temperatures, and
K for temperature differences (superheat, start delta-T). The COP has no unit.

#### Scenario: Percent keeps its space
- **WHEN** Home Assistant's language is English and pump 16 runs at 100 %
- **THEN** the label reads "100.0 %" with a no-break space, not "100%"

### Requirement: Locale and precision
Numbers SHALL use Home Assistant's locale and number format setting. The decimals SHALL come from the entity's
display precision when Home Assistant has one and the entity's unit is the card's unit for the role, and from the
card's default for the role otherwise (a converted value, such as kW shown in W, uses the role default). A
temperature difference reported in °C counts as the card's unit K, since the number is unchanged.

#### Scenario: Locale
- **WHEN** Home Assistant's number format uses a decimal comma
- **THEN** the production outlet reads "25,2 °C"

#### Scenario: Display precision
- **WHEN** the production outlet entity has a display precision of 0 and reads 25.2 °C
- **THEN** the label reads "25 °C"

### Requirement: Unit conversion
Units SHALL be converted where needed: °F to °C, and kW to W. A temperature difference reported in °F SHALL be
converted back with the same absolute formula, because Home Assistant converted it as an absolute temperature.

#### Scenario: Fahrenheit sensor
- **WHEN** a probe reports 77 °F
- **THEN** it is shown and coloured as 25 °C

#### Scenario: Fahrenheit superheat
- **WHEN** the superheat entity reports 43.2 °F
- **THEN** the label reads "6.2 K"

### Requirement: Missing and sentinel values
An `unavailable` or `unknown` state, a non-numeric state, or the firmware sentinel -999.9 SHALL show as a muted
dash instead of a number. It SHALL NOT raise an error.

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
The card SHALL re-render only when the state of one of its resolved entities changes, or when the theme, locale,
the entity registry or configuration changes.

#### Scenario: Unrelated entity
- **WHEN** a light elsewhere in Home Assistant changes state
- **THEN** the card does not re-render
