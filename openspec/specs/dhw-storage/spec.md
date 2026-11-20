# dhw-storage Specification

## Purpose

The domestic hot water storage drawn with the heat pump: an external tank in the band above connections 5 and 6
(model B), the tank integrated in the cabinet (model C), the model's tank drawn muted when it is unused, or none
(model B only), with the DHW temperature and demand inside the tank.

## Requirements

### Requirement: Internal tank for model C
With `dhw: internal`, the card SHALL draw the integrated storage inside the cabinet, after the manual's C figure:

- tank 50 with coil 51, drawn as a helix as on the external tank, and DHW probe 54
- tap water inlet 47, DHW outlet 48 and recirculation 49 as stubs on the cabinet's top edge

Manual trap 52 and drain valve 53 SHALL NOT be drawn: they have no live value.

#### Scenario: Internal tank
- **WHEN** the config sets `model: C`
- **THEN** tank 50 with coil 51 is drawn inside the cabinet, and no tank is drawn in the band

#### Scenario: Model C tank values
- **WHEN** the config sets `model: C`, the DHW temperature is 52.1 °C and the DHW demand is on
- **THEN** the DHW temperature without a caption and "Demand" are shown inside tank 50, above coil 51, touching no
  drawn part, the tank wall or another label

#### Scenario: Model C tank values stacked
- **WHEN** the config sets `model: C`, the DHW demand is on, and the card renders the vertical layout at 320 px
- **THEN** the DHW temperature and "Demand" are stacked, the temperature above, inside tank 50 in the added height
  above coil 51 (schematic-drawing "Vertical arrangement", decided by the user 2026-11-20), touching no drawn part, the
  tank wall or each other

#### Scenario: Simplified model C
- **WHEN** the config sets `model: C`
- **THEN** coil 51 is drawn as a helix, and the manual trap 52 and drain valve 53 are not drawn

### Requirement: Coil loop active in DHW mode or with HTR recovery
The pipes between connections 5/6 and the coil, and the coil itself, SHALL be coloured and animated when the mode
is `dhw` or the HTR circuit is active (see operating-mode), with `dhw` `external` or `internal`, and muted
otherwise (an unused tank stays muted in every mode). On model C, which has no connections 5/6, coil 51 is a
symbol: it takes the colour of the water feeding it (the production outlet in DHW mode, the DHW temperature during
HTR recovery) and is never animated.

#### Scenario: Heating mode
- **WHEN** the mode is `heating` and the HTR circuit is not active
- **THEN** the DHW loop pipes and coil are muted, and the tank still shows its temperature colour and values

#### Scenario: HTR recovery
- **WHEN** the mode is `active_cooling` and the HTR circuit is active
- **THEN** the DHW loop pipes and coil are coloured and animated, and valve 26 still points to ports 1/2

#### Scenario: HTR recovery while heating
- **WHEN** the mode is `heating`, `dhw` is `external` and the HTR circuit is active
- **THEN** the DHW loop pipes and coil are coloured with the DHW temperature and animated, and valve 26 still points
  to ports 1/2

### Requirement: No DHW
With `dhw: none`, the card SHALL draw no tank, no DHW pipes, no connections 5 and 6 and no valve 26.

#### Scenario: Heating only
- **WHEN** the config sets `dhw: none`
- **THEN** nothing related to DHW is drawn or shown, except the mode label "DHW" when the unit reports DHW
  mode (see operating-mode)

### Requirement: Unused DHW storage
With `dhw: unused`, the card SHALL draw the model's tank (on model B the external tank with connections 5 and 6, on
model C tank 50 with coil 51) and valve 26 in the muted style: the tank body (fill and outline), the coil, valve 26 and
the DHW pipes muted and never animated. The tank SHALL show no values. HTR SHALL follow its own feature state, as with a
tank in use, but the HTR circuit and the DHW coil SHALL never be active (see operating-mode).

#### Scenario: Unused external tank
- **WHEN** the config sets `model: B` and `dhw: unused`
- **THEN** the tank, its coil, the pipes from connections 5 and 6 and valve 26 are drawn muted, and the tank shows
  no values

#### Scenario: Unused internal tank
- **WHEN** the config sets `model: C` and `dhw: unused`
- **THEN** tank 50, coil 51 and valve 26 are drawn muted inside the cabinet, and the tank shows no values

#### Scenario: HTR kept with an unused tank
- **WHEN** the config sets `model: C`, `dhw: unused` and HTR is `true`
- **THEN** exchanger 9, pump 17 and valve 22 are drawn, as with `dhw: internal` (valve 25 is not drawn in either case,
  decided by the user 2026-11-20)

#### Scenario: DHW mode with an unused tank
- **WHEN** `dhw` is `unused` and the unit reports DHW mode
- **THEN** the mode label shows "DHW", and the tank, coil and DHW pipes stay muted

### Requirement: External tank above connections 5/6
With `dhw: external`, the card SHALL draw a storage tank in the band above the cabinet, above connections 5 and 6
(schematic-drawing "Band arrangement"): an upright cylinder with domed top and bottom, holding a helical heating coil
drawn as a helix seen from the side (front half of each turn solid, back half faint). Two pipes SHALL rise from
connections 5 and 6 to the coil's two ends without crossing any pipe. The tank SHALL be centred on the coil.

#### Scenario: External tank
- **WHEN** the card renders model B with `dhw: external`, in either layout
- **THEN** a tank with a coil is drawn above connections 5 and 6, right of the source, and its coil connects to both

#### Scenario: Helical coil
- **WHEN** the card renders model B with `dhw: external`
- **THEN** the coil has at least four turns, each turn's front half is drawn solid and its back half faint, and the
  coil's ends meet the two pipes from connections 5 and 6

#### Scenario: Tank geometry
- **WHEN** the card renders model B with `dhw: external`
- **THEN** the tank's centre line is the coil's centre line, and the whole tank lies above the cabinet's top edge

### Requirement: Muted coil visible on the tank
The coil SHALL be coloured, animated and muted like the DHW pipes, except that a muted coil SHALL be drawn in a darker
grey than the other muted pipes in the light theme, so that it stays visible on the tank.

#### Scenario: Idle coil in the light theme
- **WHEN** the mode is `heating` (the coil is muted) and the theme is light
- **THEN** the coil is drawn in a grey darker than the muted colour of the other pipes, its pipes take the same
  darker grey inside the tank, and the grey changes only where the pipes cross the tank wall

### Requirement: DHW values inside the tank
The tank SHALL show the DHW temperature as the bare value, without a caption, and the DHW demand as the text
"Demand" only while it is on, both inside the tank body (the external tank's cylinder, or tank 50). The tank body
SHALL be coloured by the DHW temperature on the card's temperature scale. The DHW setpoint and start delta-T SHALL
NOT be shown. With `dhw: unused` the tank SHALL show no values and its body SHALL take the muted colour (see Unused
DHW storage).

#### Scenario: Values shown
- **WHEN** the DHW temperature is 52.1 °C, the setpoint is 58 °C and the start delta-T is 8 °C
- **THEN** the tank shows "52.1 °C" without a caption inside its body, and neither "58 °C" nor "8 K"

#### Scenario: Demand on
- **WHEN** the DHW demand is on
- **THEN** the tank shows "Demand" inside its body, touching neither the coil nor the wall

#### Scenario: Stacked at phone width
- **WHEN** the card renders model B with `dhw: external` in the vertical layout at 320 px, the DHW demand on
- **THEN** the DHW temperature and "Demand" are stacked, the temperature above, inside the external tank above its
  coil, touching neither each other, the coil nor the wall (schematic-drawing "One body height in the band",
  decided by the user 2026-11-20)

#### Scenario: DHW temperature unavailable
- **WHEN** the DHW temperature is unavailable
- **THEN** the tank body is drawn in the muted colour and its label shows no number
