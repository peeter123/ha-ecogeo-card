## Purpose

How pipes are coloured and animated: active circuits on an absolute temperature scale, each segment by the probe
that measures it, flowing in their real direction, and inactive circuits muted.

## ADDED Requirements

### Requirement: Absolute temperature scale
Temperatures SHALL map to colours on a fixed scale, with stops that can be configured. The default stops are:
- -10 °C blue
- 20 °C green
- 45 °C orange
- 70 °C red
Colours between stops SHALL be interpolated. Temperatures outside the scale SHALL take the colour of the nearest
end. The scale SHALL NOT depend on the other temperatures shown.

#### Scenario: Cold brine
- **WHEN** the brine outlet reads -2.8 °C
- **THEN** its segment is coloured between blue and green, closer to blue

#### Scenario: Out of range
- **WHEN** the compressor discharge reads 95 °C
- **THEN** its segment has the 70 °C end colour

#### Scenario: Custom stops
- **WHEN** the config sets other colour stops
- **THEN** the segments use those stops, and an invalid stop list is a configuration error

### Requirement: Water segment temperatures
Each production and brine pipe segment SHALL take the temperature of the probe that defines it:
- production outlet 33 on the supply from the condenser to connection 1 (or 5 in DHW mode)
- production return 34 on the return from connection 2 (or 6) to the condenser
- brine inlet 32 from connection 4 to the evaporator
- brine outlet 31 from the evaporator to connection 3

#### Scenario: Heating segments
- **WHEN** the mode is `heating`, the production outlet reads 25.2 °C and the return reads 22.0 °C
- **THEN** the supply to connection 1 has the 25.2 °C colour and the return from connection 2 the 22.0 °C colour

### Requirement: Refrigerant segment temperatures
Each refrigerant segment SHALL take the temperature of its point in the cycle:
- discharge probe 30 from the compressor to the condenser
- condensation temperature from the condenser to the expansion valve
- evaporation temperature from the expansion valve to the evaporator
- suction probe 29 from the evaporator to the compressor
In active cooling, the segments SHALL follow the reversed flow.

#### Scenario: Discharge line
- **WHEN** the compressor discharge reads 52.5 °C in heating mode
- **THEN** the segment from compressor 11 to condenser 8 has the 52.5 °C colour

#### Scenario: Reversed cycle
- **WHEN** the mode is `active_cooling`
- **THEN** the discharge colour is on the segment from compressor 11 to evaporator 7, which works as the condenser

#### Scenario: Missing probe
- **WHEN** a segment's probe is unavailable or reads the sentinel -999.9
- **THEN** that segment is drawn in the muted colour, even when its circuit is active

### Requirement: Inactive circuits muted
Segments of circuits that are not active (see operating-mode) SHALL be drawn in the muted theme colour, without
animation. So SHALL every part whose feature is `unused`.

#### Scenario: DHW loop while heating
- **WHEN** the mode is `heating`
- **THEN** the DHW pipes to connections 5 and 6 are muted and still

### Requirement: Flow animation
Active segments SHALL show a dash animation in the direction of flow. Its speed SHALL follow:
- the production pump % on production segments
- the brine pump % on brine segments
- the compressor % on refrigerant segments
At 0 %, or with an unknown speed, the segment SHALL be still. The animation SHALL stop when the user prefers
reduced motion.

#### Scenario: Faster pump
- **WHEN** the brine pump goes from 50 % to 100 %
- **THEN** the brine segments animate faster

#### Scenario: Reduced motion
- **WHEN** the browser reports prefers-reduced-motion
- **THEN** no segment and no fan is animated, and the colours are unchanged
