# Spec Delta

## MODIFIED Requirements

### Requirement: Air unit
With `source: air`, the card SHALL draw an air unit: a housing with a finned coil block, through which the brine
tube winds as a serpentine across the fins, and a fan drawn as blades inside a ring. The brine SHALL enter and
leave the coil on the same side of the unit, the side facing the cabinet. The fan SHALL rotate while its speed is
above 0 %, faster at higher speed. A fan speed in another unit (such as rpm) above 0 SHALL rotate the fan at a fixed medium speed. The air unit SHALL show the fan speed and the outside temperature under its
housing, and the brine temperature entering and leaving it at its two ports. In the compact layout
(responsive-layout) the air unit SHALL show only the brine temperature leaving it (Out), and the fan SHALL still
rotate by its speed.

#### Scenario: Running fan
- **WHEN** the source is `air` and the fan speed is 34.5 %, in the full layout
- **THEN** the fan rotates and the label reads "34.5 %" (with a no-break space)

#### Scenario: Stopped fan
- **WHEN** the fan speed is 0 % or unavailable
- **THEN** the fan is drawn still

#### Scenario: Air unit drawing
- **WHEN** the source is `air` or `hybrid`
- **THEN** the air unit shows at least six parallel fins crossed by the brine tube in an even number of passes (at
  least four), and a fan of at least three blades inside a ring

#### Scenario: Air unit ports
- **WHEN** the source is `air`, in the full layout
- **THEN** the brine pipe into the coil and the pipe out of it both meet the unit on its right side, the label "In"
  next to the inlet shows the brine outlet temperature of the heat pump, and the label "Out" next to the outlet
  shows the air unit's brine outlet temperature

#### Scenario: Compact air unit
- **WHEN** the source is `air`, the card shows the compact layout and the fan speed is 34.5 %
- **THEN** only the air unit's Out value is shown, no fan speed, outside temperature or In label, and the fan
  rotates

#### Scenario: Fan speed in rpm
- **WHEN** the source is `air` and the fan speed entity reports 900 rpm, in the full layout
- **THEN** the fan rotates at the fixed medium speed and the label reads "900 rpm" (with a no-break space)
