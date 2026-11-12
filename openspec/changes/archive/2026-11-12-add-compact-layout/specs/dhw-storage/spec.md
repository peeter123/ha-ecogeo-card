# Spec Delta

## MODIFIED Requirements

### Requirement: Tank values
The tank SHALL show the DHW temperature, the DHW setpoint, the DHW start delta-T and the DHW demand. The tank body
SHALL be coloured by the DHW temperature on the card's temperature scale. The start delta-T SHALL be shown in K.
The DHW demand SHALL be shown as a short text ("Demand") only while it is on. In the compact layout
(responsive-layout) the tank SHALL show only the DHW temperature, with a short "DHW" caption, and the tank body
SHALL keep its colour.

#### Scenario: Values shown
- **WHEN** the DHW temperature is 52.1 °C, the setpoint is 58 °C and the start delta-T is 8 °C, in the full layout
- **THEN** the tank shows "52.1 °C", "58 °C" and "8 K", each number joined to its unit by a no-break space

#### Scenario: Demand on
- **WHEN** the DHW demand is on, in the full layout
- **THEN** the tank shows "Demand"

#### Scenario: DHW temperature unavailable
- **WHEN** the DHW temperature is unavailable
- **THEN** the tank body is drawn in the muted colour and its label shows no number

#### Scenario: Compact tank values
- **WHEN** the card shows the compact layout, the DHW temperature is 52.1 °C and the DHW demand is on
- **THEN** the tank shows the DHW temperature with a "DHW" caption, and no setpoint, start delta-T or "Demand"
