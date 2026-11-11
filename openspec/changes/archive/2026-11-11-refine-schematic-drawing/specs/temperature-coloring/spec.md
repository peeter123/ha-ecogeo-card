# Spec Delta

## MODIFIED Requirements

### Requirement: Absolute temperature scale
Temperatures SHALL map to colours on a fixed scale, with stops that can be configured. The default stops are:
- -10 °C blue
- 10 °C light blue
- 20 °C pale blue
- 30 °C amber
- 50 °C orange
- 70 °C red
No default stop SHALL be green. Colours between stops SHALL be interpolated. Temperatures outside the scale SHALL
take the colour of the nearest end. The scale SHALL NOT depend on the other temperatures shown.

#### Scenario: Cold brine
- **WHEN** the brine outlet reads -2.8 °C
- **THEN** its segment is coloured between blue and light blue, closer to blue

#### Scenario: Out of range
- **WHEN** the compressor discharge reads 95 °C
- **THEN** its segment has the 70 °C end colour

#### Scenario: Custom stops
- **WHEN** the config sets other colour stops
- **THEN** the segments use those stops, and an invalid stop list is a configuration error

#### Scenario: No green by default
- **WHEN** the config sets no `colors`
- **THEN** no default stop colour has a hue between 75° and 165°, and no colour of the default scale sampled in
  1 K steps from -10 °C to 70 °C has a hue between 75° and 165° at a saturation above 20 %

### Requirement: Water segment temperatures
Each water pipe segment SHALL take the temperature of the probe that defines it:
- production outlet 33 on the supply from the condenser to connection 1 (or 5 in DHW mode)
- production return 34 on the return from connection 2 (or 6) to the condenser
- brine inlet 32 from connection 4 to the evaporator
- brine outlet 31 from the evaporator to connection 3
- the air unit outlet temperature on the air unit's exit and, in a hybrid, on the link and the ground loop's down
  leg; the ground loop's down leg (ground source) takes the brine outlet; its up leg and the return to connection
  4 take the brine inlet

Some segments take another role depending on the mode:
- In `passive_cooling` and `defrost`, while valves 27/28 route through exchanger 10, the production legs from
  exchanger 10 and valve 27 to condenser 8 take the production outlet, since the stopped compressor leaves the
  water temperature unchanged.
- During HTR recovery (HTR active, no DHW production), the DHW lines outside the arm of valve 26 and the external
  tank pipes carry HTR water and take the DHW temperature.

#### Scenario: Heating segments
- **WHEN** the mode is `heating`, the production outlet reads 25.2 °C and the return reads 22.0 °C
- **THEN** the supply to connection 1 has the 25.2 °C colour and the return from connection 2 the 22.0 °C colour

## ADDED Requirements

### Requirement: Exchanger sides coloured
With `exchanger_fill: gradient` (the default), each side of plate exchangers 7, 8, 9 and 10 SHALL be filled with a
gradient from the colour of the pipe that enters that side to the colour of the pipe that leaves it, following the
same scale, mode-dependent roles and reversals as those pipes. The fill SHALL never hide the exchanger's outline
or ports.

#### Scenario: Condenser while heating
- **WHEN** the mode is `heating`, the discharge reads 52.5 °C, the condensation temperature 27.0 °C, the
  production return 22.0 °C and the production outlet 25.2 °C
- **THEN** condenser 8's refrigerant side runs from the 52.5 °C colour to the 27.0 °C colour, and its water side
  from the 22.0 °C colour to the 25.2 °C colour

### Requirement: Exchanger fill muted or off
A side of an exchanger whose pipes are muted SHALL be filled in the muted colour. With `exchanger_fill: none` the
exchangers SHALL keep an unfilled body.

#### Scenario: Idle exchanger
- **WHEN** the mode is `heating` and passive cooling is `true`
- **THEN** exchanger 10 is filled in the muted colour on both sides

#### Scenario: Fill off
- **WHEN** the config sets `exchanger_fill: none`
- **THEN** no exchanger has a coloured fill
