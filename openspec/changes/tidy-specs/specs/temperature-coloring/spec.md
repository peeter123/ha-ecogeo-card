# Spec Delta

## MODIFIED Requirements

### Requirement: Water segment temperatures
Each water pipe segment SHALL take the temperature of the probe that defines it:
- production outlet 33 on the supply from the condenser to connection 1 (or 5 in DHW mode), and on from connection
  1 to the emitter (heating-emitter)
- production return 34 from the emitter to connection 2, and on the return from connection 2 (or 6) to the condenser

#### Scenario: Heating segments
- **WHEN** the mode is `heating`, the production outlet reads 25.2 °C and the return reads 22.0 °C
- **THEN** the supply to connection 1 and on to the emitter has the 25.2 °C colour, and the return from the emitter
  to connection 2 and on to the condenser the 22.0 °C colour

#### Scenario: Ground collector halves
- **WHEN** the source is `ground`, the brine circuit is active, the brine outlet reads 2.0 °C and the brine inlet
  5.0 °C
- **THEN** the collector's half entered from connection 3 has the 2.0 °C colour and the half towards connection 4
  the 5.0 °C colour

### Requirement: Flow animation
Active segments SHALL show a dash animation in the direction of flow. Its speed SHALL follow:
- the production pump % on production segments, including those through exchanger 10
- the brine pump % on brine segments, including those through exchanger 10
- the compressor % on refrigerant segments
- a fixed medium speed on HTR water segments, since pump 17 reports no speed

#### Scenario: Faster pump
- **WHEN** the brine pump goes from 50 % to 100 %
- **THEN** the brine segments animate faster

#### Scenario: HTR without a speed
- **WHEN** the HTR circuit is active
- **THEN** its water segments animate at the fixed speed

#### Scenario: Pump on without a percentage
- **WHEN** the production circuit is active and the production pump entity is a binary sensor that reads `on`, or
  reports 2400 rpm
- **THEN** the production segments animate at the fixed medium speed

## ADDED Requirements

### Requirement: Brine segment temperatures
The brine segments SHALL take the temperature of the probe that defines them: brine inlet 32 from connection 4 to the
evaporator, and brine outlet 31 from the evaporator to connection 3. With a ground source the collector's first half
SHALL take the brine outlet; the collector's second half and the return to connection 4 SHALL take the brine inlet.

#### Scenario: Brine around the evaporator
- **WHEN** the brine circuit is active, the brine inlet reads 5.0 °C and the brine outlet reads 2.0 °C
- **THEN** the pipe from connection 4 to the evaporator has the 5.0 °C colour and the pipe from the evaporator to
  connection 3 the 2.0 °C colour

#### Scenario: Ground source collector
- **WHEN** the source is `ground` and the brine circuit is active
- **THEN** the collector's first half takes the brine outlet, and its second half and the return to connection 4
  take the brine inlet

### Requirement: Air unit segment temperatures
The air unit outlet temperature SHALL colour the air unit's exit and, in a hybrid, the link and the first half of the
ground collector.

#### Scenario: Air source
- **WHEN** the source is `air` and the air unit outlet reads 1.0 °C
- **THEN** the air unit's exit has the 1.0 °C colour

#### Scenario: Hybrid source
- **WHEN** the source is `hybrid` and the air unit outlet reads 1.0 °C
- **THEN** the air unit's exit, the link and the first half of the ground collector have the 1.0 °C colour

### Requirement: Production legs through exchanger 10
In `passive_cooling` and `defrost`, while valves 27/28 route through exchanger 10, the production legs from exchanger
10 and valve 27 to condenser 8 SHALL take the production outlet, since the stopped compressor leaves the water
temperature unchanged.

#### Scenario: Passive cooling legs
- **WHEN** the mode is `passive_cooling`, valves 27/28 route through exchanger 10 and the production outlet reads
  25.2 °C
- **THEN** the production legs from exchanger 10 and valve 27 to condenser 8 have the 25.2 °C colour

### Requirement: HTR recovery water temperature
During HTR recovery (HTR active, no DHW production), the DHW lines outside the arm of valve 26 and the external tank
pipes carry HTR water and SHALL take the DHW temperature.

#### Scenario: HTR recovery lines
- **WHEN** HTR is active, the mode is not `dhw` and the DHW temperature reads 45.0 °C
- **THEN** the DHW lines outside the arm of valve 26 and the external tank pipes have the 45.0 °C colour

### Requirement: Still segments
At 0 %, at off, or with an unknown speed, a segment with a speed role SHALL be still.

#### Scenario: Pump at zero
- **WHEN** the brine circuit is active and the brine pump reads 0 %
- **THEN** the brine segments are still

#### Scenario: Pump off or unknown
- **WHEN** the production circuit is active and the production pump entity reads `off` or is unknown
- **THEN** the production segments are still

### Requirement: Pump without a percentage animates at a fixed speed
A pump that runs without a percentage (its entity reads on, or reports a speed in another unit above 0, such as rpm)
SHALL animate its segments at the same fixed medium speed.

#### Scenario: Speed in rpm
- **WHEN** the brine circuit is active and the brine pump entity reports 1800 rpm
- **THEN** the brine segments animate at the fixed medium speed
