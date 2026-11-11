# Spec Delta

## MODIFIED Requirements

### Requirement: Source drawn left of the cabinet
The card SHALL draw the outer-loop source to the left of the cabinet, chosen by the `source` option. Two pipes
SHALL run from connection 3 (brine outlet) and connection 4 (brine inlet) up from the top edge and across to the
source. On their way they SHALL pass above the DG1 stubs of connections 1 and 2 without crossing any pipe. The top
of the source (the air unit's housing, or the ground loop's ground line when there is no air unit) SHALL sit on
the cabinet's top line.

#### Scenario: Pipes from the top
- **WHEN** the card renders any source
- **THEN** the brine pipes leave the cabinet at connections 3 and 4 on the top edge and run to the source on the
  left, above the stubs of connections 1 and 2

#### Scenario: Source aligned to the cabinet
- **WHEN** the card renders `source: air`, `ground` or `hybrid`
- **THEN** the top of the air unit's housing (air, hybrid) or the ground line (ground) is at the cabinet's top line

### Requirement: Air unit
With `source: air`, the card SHALL draw an air unit: a housing with a finned coil block, through which the brine
tube winds as a serpentine between the fins, and a fan drawn as blades inside a ring. The brine SHALL enter and
leave the coil on the same side of the unit, the side facing the cabinet. The fan SHALL rotate while its speed is
above 0 %, faster at higher speed. The air unit SHALL show the fan speed and the outside temperature under its
housing, and the brine temperature entering and leaving it at its two ports.

#### Scenario: Running fan
- **WHEN** the source is `air` and the fan speed is 34.5 %
- **THEN** the fan rotates and the label reads "34.5 %" (with a no-break space)

#### Scenario: Stopped fan
- **WHEN** the fan speed is 0 % or unavailable
- **THEN** the fan is drawn still

#### Scenario: Air unit drawing
- **WHEN** the source is `air` or `hybrid`
- **THEN** the air unit shows at least six parallel fins crossed by the brine tube in an even number of passes (at
  least four), and a fan of at least three blades inside a ring

#### Scenario: Air unit ports
- **WHEN** the source is `air`
- **THEN** the brine pipe into the coil and the pipe out of it both meet the unit on its right side, the label "In"
  next to the inlet shows the brine outlet temperature of the heat pump, and the label "Out" next to the outlet
  shows the air unit's brine outlet temperature

### Requirement: Ground loop
With `source: ground`, the card SHALL draw a ground loop: a ground line with a single vertical loop below it (one
leg down, a half circle at the bottom, one leg up), joined to the brine pipes at the ground line. It SHALL show the
brine temperature entering the loop ("In", the heat pump's brine outlet) and leaving it ("Out", the heat pump's
brine inlet) where the pipes meet the loop.

#### Scenario: Ground source
- **WHEN** the config sets `source: ground`
- **THEN** a ground loop is drawn left of the cabinet, and no air unit or fan speed is shown

#### Scenario: Single loop
- **WHEN** the config sets `source: ground`
- **THEN** the loop runs down from the ground line, turns in a half circle and runs back up to the ground line,
  with "In" at the down leg and "Out" at the up leg

### Requirement: Hybrid source
With `source: hybrid`, the card SHALL draw both the air unit and the ground loop in one brine loop (air unit
first), each showing its own values: the air unit its fan speed, outside temperature and its In and Out at its
ports, the ground loop only its Out (the brine inlet of the heat pump), since its In would repeat the air unit's
Out on the same pipe.

#### Scenario: Hybrid
- **WHEN** the config sets `source: hybrid`
- **THEN** the air unit and the ground loop are both drawn on the brine pipes, each with its own labels
