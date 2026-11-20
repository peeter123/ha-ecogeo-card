# Spec Delta

## ADDED Requirements

### Requirement: Source above connections 3/4
The card SHALL draw the outer-loop source chosen by the `source` option in the band above the cabinet, above
connections 3 and 4 (schematic-drawing "Band arrangement"). The pipes from connection 3 (brine outlet) and connection
4 (brine inlet) SHALL rise from the top edge to the source without crossing any pipe and without passing over the
emitter or the tank.

#### Scenario: Pipes from the top
- **WHEN** the card renders any source, in either layout
- **THEN** the brine pipes leave the cabinet at connections 3 and 4 and rise to the source above them, crossing no
  pipe

#### Scenario: Source between emitter and tank
- **WHEN** the card renders `source: hybrid` with `dhw: external` and `emitter: radiator`
- **THEN** the air unit and the ground collector lie right of the emitter and left of the tank, all above the cabinet

### Requirement: Air unit with its value inside
With `source: air`, the card SHALL draw an air unit: a housing with a finned coil block, through which the brine tube
winds as a serpentine across the fins, and a fan drawn as blades inside a ring. The brine SHALL enter and leave the
coil on the side facing the cabinet. The brine temperature leaving the air unit SHALL be shown inside the housing as
the bare value, without a caption (the housing and its tooltip name it); no other value SHALL be shown at the air unit.

#### Scenario: Air unit drawing
- **WHEN** the source is `air` or `hybrid`
- **THEN** the air unit shows at least six parallel fins crossed by the brine tube in an even number of passes (at
  least four), and a fan of at least three blades inside a ring

#### Scenario: Air unit Out inside
- **WHEN** the source is `air` and the air unit's outlet reads 5.7 °C
- **THEN** "5.7 °C" without a caption is shown inside the housing, crossing no outline, fin, tube or fan, and no
  In, fan speed or outside temperature label is shown at the air unit

### Requirement: Fan follows its speed
The air unit's fan SHALL rotate while its speed is above 0 %, faster at higher speed; a fan speed in another unit (such
as rpm) above 0 SHALL rotate it at a fixed medium speed. The fan speed SHALL NOT be shown as a value.

#### Scenario: Running fan
- **WHEN** the source is `air` and the fan speed is 34.5 %
- **THEN** the fan rotates, and no fan speed label is shown

#### Scenario: Stopped fan
- **WHEN** the fan speed is 0 % or unavailable
- **THEN** the fan is drawn still

#### Scenario: Fan speed in rpm
- **WHEN** the source is `air` and the fan speed entity reports 900 rpm
- **THEN** the fan rotates at the fixed medium speed

### Requirement: Ground collector
With `source: ground`, the card SHALL draw a ground collector: a strip of ground (a rectangle hatched along its top
edge, the surface) holding a flat serpentine pipe of at least four horizontal passes, its two ends joined to the pipes
of connections 3 and 4. It SHALL show the brine temperature leaving the collector (the heat pump's brine inlet) inside
the strip as the bare value, without a caption, and no In value.

#### Scenario: Ground source
- **WHEN** the config sets `source: ground`
- **THEN** a ground collector is drawn above connections 3 and 4, and no air unit or fan is drawn

#### Scenario: Collector drawing
- **WHEN** the config sets `source: ground`
- **THEN** the collector has at least four horizontal passes joined by bends inside a strip hatched along its top,
  and its ends meet the pipes of connections 3 and 4

#### Scenario: Collector Out
- **WHEN** the config sets `source: ground` and the brine inlet reads 7.1 °C
- **THEN** "7.1 °C" without a caption is shown inside the strip, crossing no pipe or outline

### Requirement: Hybrid side by side
With `source: hybrid`, the card SHALL draw the air unit and the ground collector side by side in one brine loop, air
unit first: connection 3's pipe to the air unit, a link pipe from the air unit to the collector, and the collector to
connection 4. Only the collector's Out (the brine inlet of the heat pump) SHALL be shown; the air unit SHALL show no
value, and the link pipe SHALL carry no label.

#### Scenario: Hybrid
- **WHEN** the config sets `source: hybrid`
- **THEN** the air unit and the ground collector are both drawn above connections 3 and 4, side by side, joined by a
  link pipe, crossing no pipe, and only the collector's Out value is shown

## MODIFIED Requirements

### Requirement: Outer loop active with the brine circuit
The outer-loop pipes and the source SHALL be coloured and animated when the brine circuit is active (see
operating-mode), and muted otherwise. "The source" includes its symbols (the air unit's housing and coil, the ground
collector's serpentine), which take the muted style with the pipes; the fan keeps following its own speed. This
includes `defrost`, in which exchanger 10 warms the brine that runs to the air unit.

#### Scenario: Standby
- **WHEN** the mode is `standby`
- **THEN** the outer-loop pipes are muted, and the fan rotates only if its own speed is above 0 %

#### Scenario: Defrost
- **WHEN** the mode is `defrost`, the source is `air` and the brine pump runs
- **THEN** the outer-loop pipes are coloured by the brine probes and animated towards the air unit

## REMOVED Requirements

### Requirement: Source drawn left of the cabinet
**Reason**: The band arrangement puts the source above its own connections; the pipe run over the cabinet to the left
is gone.
**Migration**: See "Source above connections 3/4".

### Requirement: Air unit
**Reason**: The air unit moves into the band and keeps only its Out value, inside its housing; the fan speed, outside
temperature and In labels are gone.
**Migration**: See "Air unit with its value inside" and "Fan follows its speed".

### Requirement: Ground loop
**Reason**: A vertical loop hanging below a ground line does not fit a band above the cabinet; it becomes a flat
collector in a ground strip, with only its Out value.
**Migration**: See "Ground collector".

### Requirement: Hybrid source
**Reason**: The hybrid's air unit and collector now sit side by side in the band, and the air unit's In label is
gone.
**Migration**: See "Hybrid side by side".
