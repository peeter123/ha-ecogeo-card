# Spec Delta

## MODIFIED Requirements

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
