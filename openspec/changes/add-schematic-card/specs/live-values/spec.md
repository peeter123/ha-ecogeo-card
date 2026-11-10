## Purpose

How the card shows live values on the schematic: which values appear where, how numbers and units are formatted,
how missing values look, and what happens on a tap.

## ADDED Requirements

### Requirement: Refrigerant values beside their components
The card SHALL show the refrigerant values next to their components:
- temperatures 29/30 and pressures 35/36
- compressor 11 speed in rpm and %, and its power in W
- expansion valve 12 opening in %, and the superheat
- condensation (8) and evaporation (7) temperatures, and the condensation capacity

#### Scenario: Compressor label
- **WHEN** the compressor runs at 2803 rpm and 38.9 % and draws 786 W
- **THEN** the labels near item 11 read "2803 rpm", "38.9 %" and "786 W"

### Requirement: Hydraulic values beside their components
The card SHALL show the hydraulic values next to their components: temperatures 31-34, pressures 37/38, the
speeds of pumps 15 and 16 in %, and the DG1 setpoint at connections 1/2. The footer SHALL show the COP. Values of
parts that are not drawn SHALL NOT be shown.

#### Scenario: Production labels
- **WHEN** the production outlet reads 25.2 °C and pump 15 runs at 99.9 %
- **THEN** "25.2 °C" is shown at probe 33 and "99.9 %" at pump 15

#### Scenario: Part not drawn
- **WHEN** passive cooling is `false`
- **THEN** no label for items 10, 27 or 28 is shown

### Requirement: Number formatting
Every value SHALL be shown with its unit, joined by a no-break space. Formatting SHALL follow Home Assistant's
entity display precision and locale where Home Assistant provides them, and one decimal otherwise. Units SHALL
be converted where needed: °F to °C, and kW to W.

#### Scenario: Locale
- **WHEN** Home Assistant's number format uses a decimal comma
- **THEN** the production outlet reads "25,2 °C"

#### Scenario: Fahrenheit sensor
- **WHEN** a probe reports 77 °F
- **THEN** it is shown and coloured as 25 °C

### Requirement: Missing and sentinel values
An `unavailable` or `unknown` state, a non-numeric state, or the firmware sentinel -999.9 SHALL show as a muted
dash instead of a number. It SHALL NOT raise an error.

#### Scenario: Sentinel
- **WHEN** a temperature entity reads -999.900024414062
- **THEN** its label shows a muted dash

### Requirement: Read-only interaction
Tapping a value label SHALL open Home Assistant's more-info dialog for that entity. The card SHALL NOT call any
service or change any entity.

#### Scenario: Tap a probe
- **WHEN** the user taps the brine inlet label
- **THEN** the more-info dialog of the brine inlet entity opens

### Requirement: Efficient updates
The card SHALL re-render only when the state of one of its resolved entities changes, or when the theme, locale
or configuration changes.

#### Scenario: Unrelated entity
- **WHEN** a light elsewhere in Home Assistant changes state
- **THEN** the card does not re-render
