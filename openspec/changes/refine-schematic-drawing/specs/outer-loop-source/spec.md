# Spec Delta

## MODIFIED Requirements

### Requirement: Air unit
With `source: air`, the card SHALL draw an air unit: a housing with a finned coil block, through which the brine
tube winds as a serpentine between the fins, and a fan drawn as blades inside a ring. The fan SHALL rotate while
its speed is above 0 %, faster at higher speed. The air unit SHALL show the fan speed, the outside temperature
and the air unit's brine outlet temperature.

#### Scenario: Running fan
- **WHEN** the source is `air` and the fan speed is 34.5 %
- **THEN** the fan rotates and the label reads "34.5 %" (with a no-break space)

#### Scenario: Stopped fan
- **WHEN** the fan speed is 0 % or unavailable
- **THEN** the fan is drawn still

#### Scenario: Air unit drawing
- **WHEN** the source is `air` or `hybrid`
- **THEN** the air unit shows at least six parallel fins crossed by the brine tube in at least three passes, and a
  fan of at least three blades inside a ring
