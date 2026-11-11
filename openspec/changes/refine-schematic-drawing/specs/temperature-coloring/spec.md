# Spec Delta

## MODIFIED Requirements

### Requirement: Absolute temperature scale
Temperatures SHALL map to colours on a fixed scale, with stops that can be configured. The default stops are:
- -10 °C blue
- 10 °C light blue
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
- **THEN** no default stop colour has a hue between 75° and 165°

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
