## Purpose

The domestic hot water storage drawn with the heat pump: an external tank right of the cabinet joined to
connections 5 and 6 (model B), the tank integrated in the cabinet (model C), or none, with its live values.

## ADDED Requirements

### Requirement: External tank right of the cabinet
With `dhw: external`, the card SHALL draw a storage tank with a heating coil to the right of the cabinet. Two
pipes SHALL run from connections 5 and 6 up from the top edge and across to the coil, without crossing any pipe.

#### Scenario: External tank
- **WHEN** the card renders model B with `dhw: external`
- **THEN** a tank with a coil is drawn right of the cabinet, and its coil connects to connections 5 and 6

### Requirement: Internal tank for model C
With `dhw: internal`, the card SHALL draw the integrated storage inside the cabinet, after the manual's C figure:
- tank 50 with coil 51 and DHW probe 54
- tap water inlet 47, DHW outlet 48 and recirculation 49 as stubs on the cabinet's top edge
- manual trap 52 and drain valve 53

#### Scenario: Internal tank
- **WHEN** the config sets `model: C`
- **THEN** tank 50 with coil 51 is drawn inside the cabinet, and no tank is drawn outside it

### Requirement: Tank values
The tank SHALL show the DHW temperature, the DHW setpoint, the DHW start delta-T and the DHW demand. The tank body
SHALL be coloured by the DHW temperature on the card's temperature scale. The start delta-T SHALL be shown in K.
The DHW demand SHALL be shown as a short text ("Demand") only while it is on.

#### Scenario: Values shown
- **WHEN** the DHW temperature is 52.1 °C, the setpoint is 58 °C and the start delta-T is 8 °C
- **THEN** the tank shows "52.1 °C", "58 °C" and "8 K", each number joined to its unit by a no-break space

#### Scenario: Demand on
- **WHEN** the DHW demand is on
- **THEN** the tank shows "Demand"

#### Scenario: DHW temperature unavailable
- **WHEN** the DHW temperature is unavailable
- **THEN** the tank body is drawn in the muted colour and its label shows no number

### Requirement: Coil loop active in DHW mode or with HTR recovery
The pipes between connections 5/6 and the coil, and the coil itself, SHALL be coloured and animated when the mode
is `dhw` or the HTR circuit is active (see operating-mode), and muted otherwise.

#### Scenario: Heating mode
- **WHEN** the mode is `heating`
- **THEN** the DHW loop pipes and coil are muted, and the tank still shows its temperature colour and values

#### Scenario: HTR recovery
- **WHEN** the mode is `active_cooling` and the HTR circuit is active
- **THEN** the DHW loop pipes and coil are coloured and animated, and valve 26 still points to ports 1/2

### Requirement: No DHW
With `dhw: none`, the card SHALL draw no tank, no DHW pipes, no connections 5 and 6 and no valve 26.

#### Scenario: Heating only
- **WHEN** the config sets `dhw: none`
- **THEN** nothing related to DHW is drawn or shown
