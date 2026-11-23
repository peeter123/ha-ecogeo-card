## MODIFIED Requirements

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
- **THEN** the DHW temperature without a caption is shown inside tank 50, above coil 51, touching no drawn part or
  the tank wall, and no "Demand" is shown (decided by the user 2026-11-23)

#### Scenario: Model C tank values stacked
- **WHEN** the config sets `model: C` and the card renders the vertical layout at 320 px
- **THEN** the DHW temperature is shown inside tank 50 in the added height above coil 51 (schematic-drawing
  "Vertical arrangement", decided by the user 2026-11-20), touching no drawn part or the tank wall

#### Scenario: Simplified model C
- **WHEN** the config sets `model: C`
- **THEN** coil 51 is drawn as a helix, and the manual trap 52 and drain valve 53 are not drawn

### Requirement: External tank above connections 5/6
With `dhw: external`, the card SHALL draw a tank above connections 5 and 6 in the band: an upright cylinder with a
domed top and a flat bottom, centred on a helical coil seen from the side (front halves solid, back halves faint). The
supply from connection 5 SHALL run straight along the coil's top to the helix; the return SHALL leave the helix's
lower end down to connection 6, crossing no pipe.

#### Scenario: External tank
- **WHEN** the card renders model B with `dhw: external`, in either layout
- **THEN** a tank with a coil is drawn above connections 5 and 6, right of the source, and its coil connects to both

#### Scenario: Helical coil
- **WHEN** the card renders model B with `dhw: external`
- **THEN** the coil has at least four turns, each turn's front half is drawn solid and its back half faint, the
  straight pipe runs along the top of the coil from the supply to the helix's upper end, and no straight pipe runs
  along its bottom

#### Scenario: Tank geometry
- **WHEN** the card renders model B with `dhw: external`
- **THEN** the tank's centre line is the coil's centre line, the whole tank lies above the cabinet's top edge, and
  its flat bottom lies on the band's bottom edge with the bottoms of the other band bodies

### Requirement: DHW values inside the tank
The tank SHALL show the DHW temperature as the bare value, without a caption, inside the tank body (the external
tank's cylinder, or tank 50), at the same size and weight as the other values in the band. The tank body SHALL be
coloured by the DHW temperature on the card's temperature scale. The DHW demand, setpoint and start delta-T SHALL NOT
be shown. With `dhw: unused` the tank SHALL show no values and its body SHALL take the muted colour (see Unused DHW
storage).

#### Scenario: Values shown
- **WHEN** the DHW temperature is 52.1 °C, the DHW demand is on, the setpoint is 58 °C and the start delta-T is 8 °C
- **THEN** the tank shows "52.1 °C" without a caption inside its body, in the band's regular weight, and neither
  "Demand", "58 °C" nor "8 K"

#### Scenario: Demand on
- **WHEN** the DHW demand is on
- **THEN** no "Demand" is shown in or beside the tank (decided by the user 2026-11-23), and the tank body keeps its
  temperature colour

#### Scenario: Stacked at phone width
- **WHEN** the card renders model B with `dhw: external` in the vertical layout at 320 px
- **THEN** the DHW temperature is shown inside the external tank above its coil, touching neither the coil nor the
  wall

#### Scenario: DHW temperature unavailable
- **WHEN** the DHW temperature is unavailable
- **THEN** the tank body is drawn in the muted colour and its label shows no number
