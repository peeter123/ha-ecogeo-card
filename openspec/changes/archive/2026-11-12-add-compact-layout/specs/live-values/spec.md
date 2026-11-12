# Spec Delta

## MODIFIED Requirements

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
speeds of pumps 15 and 16 in %, and the DG1 setpoint at connections 1/2. Values of parts that are not drawn
SHALL NOT be shown. In the compact layout (responsive-layout) the card SHALL show only the temperatures 31-34, in
their compact places with Out and In captions.

#### Scenario: Production labels
- **WHEN** the production outlet reads 25.2 °C and pump 15 runs at 99.9 %, in the full layout
- **THEN** "25.2 °C" is shown at probe 33 and "99.9 %" at pump 15

#### Scenario: Part not drawn
- **WHEN** the config sets `dhw: none`, or `source: ground`
- **THEN** no tank labels are shown, or no fan speed label is shown

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
