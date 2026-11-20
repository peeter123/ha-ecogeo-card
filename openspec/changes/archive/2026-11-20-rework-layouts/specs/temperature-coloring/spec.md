# Spec Delta

## MODIFIED Requirements

### Requirement: Water segment temperatures
Each water pipe segment SHALL take the temperature of the probe that defines it:
- production outlet 33 on the supply from the condenser to connection 1 (or 5 in DHW mode), and on from connection
  1 to the emitter (heating-emitter)
- production return 34 from the emitter to connection 2, and on the return from connection 2 (or 6) to the condenser
- brine inlet 32 from connection 4 to the evaporator
- brine outlet 31 from the evaporator to connection 3
- the air unit outlet temperature on the air unit's exit and, in a hybrid, on the link and the first half of the
  ground collector; with a ground source the collector's first half takes the brine outlet; the collector's second
  half and the return to connection 4 take the brine inlet

Some segments take another role depending on the mode:
- In `passive_cooling` and `defrost`, while valves 27/28 route through exchanger 10, the production legs from
  exchanger 10 and valve 27 to condenser 8 take the production outlet, since the stopped compressor leaves the
  water temperature unchanged.
- During HTR recovery (HTR active, no DHW production), the DHW lines outside the arm of valve 26 and the external
  tank pipes carry HTR water and take the DHW temperature.

#### Scenario: Heating segments
- **WHEN** the mode is `heating`, the production outlet reads 25.2 °C and the return reads 22.0 °C
- **THEN** the supply to connection 1 and on to the emitter has the 25.2 °C colour, and the return from the emitter
  to connection 2 and on to the condenser the 22.0 °C colour

#### Scenario: Ground collector halves
- **WHEN** the source is `ground`, the brine circuit is active, the brine outlet reads 2.0 °C and the brine inlet
  5.0 °C
- **THEN** the collector's half entered from connection 3 has the 2.0 °C colour and the half towards connection 4
  the 5.0 °C colour
