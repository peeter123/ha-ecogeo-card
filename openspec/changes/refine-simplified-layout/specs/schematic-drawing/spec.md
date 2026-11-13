## ADDED Requirements

### Requirement: Simplified arrangement
At the simplified level the card SHALL use an arrangement of its own: a cabinet wider and shorter than at the full
level, with no empty band where the full level's service and safety parts are, and the outer-loop source and the
external DHW tank drawn smaller beside it. The drawing SHALL keep its aspect ratio, which is wider at the simplified
level. The full level's arrangement SHALL stay as it was before this change.

#### Scenario: Wider, shorter cabinet
- **WHEN** the card renders model B with `dhw: external` and a ground loop, once with `detail: simplified` and once
  with `detail: full`
- **THEN** the simplified cabinet is wider and less tall in drawing units than the full one, and the simplified
  drawing's height-to-width ratio is smaller

#### Scenario: Full level unchanged
- **WHEN** the card renders any emulator capture with `detail: full`
- **THEN** its drawing and label positions are the same as before this change

#### Scenario: No empty band
- **WHEN** the card renders variant 4 with every feature `true` and no `detail`
- **THEN** the distance from the lowest drawn part or pipe inside the cabinet to the cabinet's bottom edge is no more
  than 40 drawing units

### Requirement: Simplified arrangement keeps the topology
The simplified arrangement SHALL keep every rule of the full level's topology: the port order on the top edge, the
probe placements, the HTR placement, no crossing of pipes outside the cabinet, every crossing inside the cabinet
drawn as a hop and no more crossings than the manual figure. Every drawn part SHALL lie inside its zone (cabinet,
source or tank) and no two drawn parts SHALL overlap.

#### Scenario: Ports and crossings
- **WHEN** the card renders model B with `dhw: external`, every source and no `detail`
- **THEN** the top edge shows connections 1-6 left to right, no two pipes outside the cabinet cross, and every
  crossing inside the cabinet is a hop

#### Scenario: Pressure 38 inside the cabinet
- **WHEN** the card renders with no `detail`
- **THEN** pressure transducer 38 and its stub pipe lie inside the cabinet outline, on the production return side
