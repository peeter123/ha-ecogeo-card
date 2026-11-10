## Purpose

The domestic hot water storage drawn with the heat pump: an external tank left of the cabinet joined to connections
5 and 6 (model B), the tank integrated in the cabinet (model C), or none, with its live values.

## ADDED Requirements

### Requirement: External tank left of the cabinet
With `dhw: external`, the card SHALL draw a storage tank with a heating coil to the left of the cabinet. Two pipes
SHALL run from connections 5 and 6 up from the top edge and across to the coil.

#### Scenario: External tank
- **WHEN** the card renders model B with `dhw: external`
- **THEN** a tank with a coil is drawn left of the cabinet, and its coil connects to connections 5 and 6

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
SHALL be coloured by the DHW temperature on the card's temperature scale.

#### Scenario: Values shown
- **WHEN** the DHW temperature is 52.1 °C, the setpoint is 58 °C and the start delta-T is 8 °C
- **THEN** the tank shows "52.1 °C" and "58 °C" and the start delta-T, each number joined to its unit by a no-break
  space

#### Scenario: DHW temperature unavailable
- **WHEN** the DHW temperature is unavailable
- **THEN** the tank body is drawn in the muted colour and its label shows no number

### Requirement: Coil loop active in DHW mode
The pipes between connections 5/6 and the coil, and the coil itself, SHALL be coloured and animated only when the
mode is `dhw`, and muted otherwise.

#### Scenario: Heating mode
- **WHEN** the mode is `heating`
- **THEN** the DHW loop pipes and coil are muted, and the tank still shows its temperature colour and values

### Requirement: No DHW
With `dhw: none`, the card SHALL draw no tank, no DHW pipes, no connections 5 and 6 and no valve 26.

#### Scenario: Heating only
- **WHEN** the config sets `dhw: none`
- **THEN** nothing related to DHW is drawn or shown
