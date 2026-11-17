## MODIFIED Requirements

### Requirement: Refrigerant values beside their components
The card SHALL show the refrigerant values next to their components:
- temperatures 29/30 and pressures 35/36
- compressor 11 speed in rpm and %, and its power in W
- expansion valve 12 opening in %, and the superheat in K, at the full detail level only (schematic-drawing)
- condensation (8) and evaporation (7) temperatures

In the compact layout (responsive-layout) the card SHALL show only the compressor speed in rpm of these values.

#### Scenario: Compressor label
- **WHEN** the compressor runs at 2803 rpm and 38.9 % and draws 786 W, in the full layout
- **THEN** the labels near item 11 read "2803 rpm", "38.9 %" and "786 W"

#### Scenario: Superheat
- **WHEN** the superheat entity reports 6.2 °C, in the full layout with `detail: full`
- **THEN** the label near item 12 reads "6.2 K"

#### Scenario: Simplified leaves out item 12's values
- **WHEN** the superheat entity reports 6.2 °C and the expansion valve opening 58 %, in the full layout with no
  `detail`
- **THEN** neither "6.2 K" nor "58 %" is shown, and tapping valve 12 still opens the more-info dialog of the
  expansion valve opening's entity

#### Scenario: Compact refrigerant values
- **WHEN** the card shows the compact layout and the compressor runs at 2803 rpm
- **THEN** "2803 rpm" is shown, and no other refrigerant value is

### Requirement: Hydraulic values beside their components
The card SHALL show the hydraulic values next to their components: temperatures 31-34, pressures 37/38, the
speeds of pumps 15 and 16 in %, and the DG1 setpoint at connections 1/2. Values of parts that are not drawn, and
the values of an unused tank (`dhw: unused`), SHALL NOT be shown. In the compact layout (responsive-layout) the card
SHALL show only the temperatures 31-34, in their compact places with Out and In captions. In the full layout at
`detail: full` the production outlet and return temperatures (33, 34) SHALL be shown as a column outside the
cabinet's left wall, level with their probes, with the same Out and In captions, since the cabinet has no room beside
probe 34 at that level.

#### Scenario: Production labels
- **WHEN** the production outlet reads 25.2 °C and pump 15 runs at 99.9 %, in the full layout
- **THEN** "25.2 °C" is shown at probe 33 and "99.9 %" at pump 15

#### Scenario: Full-level production column
- **WHEN** the config sets `detail: full`, the card shows the full layout, and the production outlet reads 25.2 °C
  and the return 22.0 °C
- **THEN** both values are shown left of the cabinet's left wall, one above the other, captioned Out and In, and
  neither crosses the cabinet outline

#### Scenario: Part not drawn
- **WHEN** the config sets `dhw: none`, or `source: ground`
- **THEN** no tank labels are shown, or no fan speed label is shown

#### Scenario: Unused tank labels
- **WHEN** the config sets `dhw: unused`
- **THEN** the tank is drawn muted and no tank labels are shown

#### Scenario: Compact hydraulic values
- **WHEN** the card shows the compact layout
- **THEN** the temperatures 31-34 are shown, and no pressure, pump speed or DG1 setpoint is
