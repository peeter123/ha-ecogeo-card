# Spec Delta

## MODIFIED Requirements

### Requirement: External tank right of the cabinet
With `dhw: external`, the card SHALL draw a storage tank to the right of the cabinet: an upright cylinder with
domed top and bottom, and inside it a helical heating coil in the lower part of the tank, drawn as a helix seen from
the side (the front half of each turn solid, the back half faint). Two pipes SHALL run from connections 5 and 6 up
from the top edge and across to the coil's two ends, without crossing any pipe. The coil SHALL be coloured,
animated and muted exactly as the coil pipe was before.

#### Scenario: External tank
- **WHEN** the card renders model B with `dhw: external`
- **THEN** a tank with a coil is drawn right of the cabinet, and its coil connects to connections 5 and 6

#### Scenario: Helical coil
- **WHEN** the card renders model B with `dhw: external`
- **THEN** the coil has at least four turns, each turn's front half is drawn solid and its back half faint, and
  the coil's ends meet the two pipes from connections 5 and 6

### Requirement: Internal tank for model C
With `dhw: internal`, the card SHALL draw the integrated storage inside the cabinet, after the manual's C figure:
- tank 50 with coil 51, drawn as a helix as on the external tank, and DHW probe 54
- tap water inlet 47, DHW outlet 48 and recirculation 49 as stubs on the cabinet's top edge
- with `detail: full` only: manual trap 52 and drain valve 53

#### Scenario: Internal tank
- **WHEN** the config sets `model: C`
- **THEN** tank 50 with coil 51 is drawn inside the cabinet, and no tank is drawn outside it

#### Scenario: Simplified model C
- **WHEN** the config sets `model: C` and no `detail`
- **THEN** coil 51 is drawn as a helix, and the manual trap 52 and drain valve 53 are not drawn
