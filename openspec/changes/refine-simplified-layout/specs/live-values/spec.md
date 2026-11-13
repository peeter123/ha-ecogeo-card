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
