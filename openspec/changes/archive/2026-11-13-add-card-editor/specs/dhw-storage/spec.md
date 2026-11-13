# Spec Delta

## ADDED Requirements

### Requirement: Unused DHW storage
With `dhw: unused`, the card SHALL draw the model's tank (on model B the external tank with connections 5 and 6, on
model C tank 50 with coil 51) and valve 26 in the muted style: the tank body (fill and outline), the coil, valve 26
and the DHW pipes muted and never animated. The tank SHALL show no values. HTR SHALL follow its own feature state, as with a tank in use, but
the HTR circuit and the DHW coil SHALL never be active (see operating-mode).

#### Scenario: Unused external tank
- **WHEN** the config sets `model: B` and `dhw: unused`
- **THEN** the tank, its coil, the pipes from connections 5 and 6 and valve 26 are drawn muted, and the tank shows
  no values

#### Scenario: Unused internal tank
- **WHEN** the config sets `model: C` and `dhw: unused`
- **THEN** tank 50, coil 51 and valve 26 are drawn muted inside the cabinet, and the tank shows no values

#### Scenario: HTR kept with an unused tank
- **WHEN** the config sets `model: C`, `dhw: unused` and HTR is `true`
- **THEN** exchanger 9, pump 17 and valves 22/25 are drawn, as with `dhw: internal`

#### Scenario: DHW mode with an unused tank
- **WHEN** `dhw` is `unused` and the unit reports DHW mode
- **THEN** the mode label shows "DHW", and the tank, coil and DHW pipes stay muted

## MODIFIED Requirements

### Requirement: Tank values
The tank SHALL show the DHW temperature, the DHW setpoint, the DHW start delta-T and the DHW demand. The tank body
SHALL be coloured by the DHW temperature on the card's temperature scale. The start delta-T SHALL be shown in K.
The DHW demand SHALL be shown as a short text ("Demand") only while it is on. In the compact layout
(responsive-layout) the tank SHALL show only the DHW temperature, with a short "DHW" caption, and the tank body
SHALL keep its colour. With `dhw: unused` the tank SHALL show no values and its body SHALL take the muted colour
(see Unused DHW storage).

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

### Requirement: Coil loop active in DHW mode or with HTR recovery
The pipes between connections 5/6 and the coil, and the coil itself, SHALL be coloured and animated when the mode
is `dhw` or the HTR circuit is active (see operating-mode), with `dhw` `external` or `internal`, and muted
otherwise (an unused tank stays muted in every mode). On model C, which has no connections 5/6, coil 51 is a
symbol: it takes the colour of the water feeding it (the production outlet in DHW mode, the DHW temperature during
HTR recovery) and is never animated.

#### Scenario: Heating mode
- **WHEN** the mode is `heating`
- **THEN** the DHW loop pipes and coil are muted, and the tank still shows its temperature colour and values

#### Scenario: HTR recovery
- **WHEN** the mode is `active_cooling` and the HTR circuit is active
- **THEN** the DHW loop pipes and coil are coloured and animated, and valve 26 still points to ports 1/2
