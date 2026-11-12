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
