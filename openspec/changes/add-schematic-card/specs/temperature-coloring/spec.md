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
Each water pipe segment SHALL take the temperature of the probe that defines it:
- production outlet 33 on the supply from the condenser to connection 1 (or 5 in DHW mode)
- production return 34 on the return from connection 2 (or 6) to the condenser
- brine inlet 32 from connection 4 to the evaporator
- brine outlet 31 from the evaporator to connection 3

#### Scenario: Heating segments
- **WHEN** the mode is `heating`, the production outlet reads 25.2 °C and the return reads 22.0 °C
- **THEN** the supply to connection 1 has the 25.2 °C colour and the return from connection 2 the 22.0 °C colour

### Requirement: Exchanger 10 and HTR segment temperatures
The production and brine segments through exchanger 10 SHALL take their own side's outlet and inlet probes, in
the same way as the other water segments. The HTR water segments (exchanger 9, pump 17 and their lines to the DHW
pipes) SHALL take the DHW temperature.

#### Scenario: Defrost segments
- **WHEN** the mode is `defrost` and the brine inlet reads 8.0 °C
- **THEN** the brine segment from exchanger 10 towards connection 4 has the 8.0 °C colour

#### Scenario: HTR segments
- **WHEN** the HTR circuit is active and the DHW temperature is 48 °C
- **THEN** the HTR water segments have the 48 °C colour

### Requirement: Refrigerant segment temperatures
Each refrigerant segment SHALL take the temperature of its point in the cycle:
- discharge probe 30 from the compressor through HTR exchanger 9 and valve 14 to the condenser
- condensation temperature from the condenser to the expansion valve
- evaporation temperature from the expansion valve to the evaporator
- suction probe 29 from the evaporator to the compressor
In active cooling, the segments SHALL follow the reversed flow.

#### Scenario: Discharge line
- **WHEN** the compressor discharge reads 52.5 °C in heating mode
- **THEN** the segments from compressor 11 through exchanger 9 to condenser 8 have the 52.5 °C colour

#### Scenario: Reversed cycle
- **WHEN** the mode is `active_cooling`
- **THEN** the discharge colour is on the segments from compressor 11 through exchanger 9 to evaporator 7, which
  works as the condenser

#### Scenario: Missing probe
- **WHEN** a segment's probe is unavailable or reads the sentinel -999.9
- **THEN** that segment is drawn in the muted colour, even when its circuit is active

### Requirement: Inactive circuits muted
Segments of circuits that are not active (see operating-mode) SHALL be drawn in the muted theme colour, without
animation. So SHALL every part whose feature is `unused`, except exchanger 10 with valves 27/28 during
`defrost`.

#### Scenario: DHW loop while heating
- **WHEN** the mode is `heating`
- **THEN** the DHW pipes to connections 5 and 6 are muted and still

#### Scenario: Refrigerant during defrost
- **WHEN** the mode is `defrost`
- **THEN** the refrigerant segments are muted and still

### Requirement: Flow animation
Active segments SHALL show a dash animation in the direction of flow. Its speed SHALL follow:
- the production pump % on production segments, including those through exchanger 10
- the brine pump % on brine segments, including those through exchanger 10
- the compressor % on refrigerant segments
- a fixed medium speed on HTR water segments, since pump 17 reports no speed
At 0 %, or with an unknown speed, a segment with a speed role SHALL be still.

#### Scenario: Faster pump
- **WHEN** the brine pump goes from 50 % to 100 %
- **THEN** the brine segments animate faster

#### Scenario: HTR without a speed
- **WHEN** the HTR circuit is active
- **THEN** its water segments animate at the fixed speed

### Requirement: Reduced motion
The card SHALL show no animation when the user prefers reduced motion. Colours SHALL stay the same.

#### Scenario: Reduced motion
- **WHEN** the browser reports prefers-reduced-motion
- **THEN** no segment and no fan is animated, and the colours are unchanged
