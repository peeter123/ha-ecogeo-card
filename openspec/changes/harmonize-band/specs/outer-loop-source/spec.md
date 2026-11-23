## MODIFIED Requirements

### Requirement: Air unit with its value inside
With `source: air`, the card SHALL draw an air unit as the front view of an outdoor unit: a case on two feet, a
guarded fan right of centre, and a finned coil panel on the left holding the brine serpentine, entered and left on the
side facing the cabinet. It SHALL show, bare and inside the case, the outside temperature above the fan, the fan speed
below it and the brine leaving the unit beside its outlet pipe, and no other value.

#### Scenario: Air unit drawing
- **WHEN** the source is `air` or `hybrid`
- **THEN** the air unit shows a case standing on two feet, at least six parallel fins in a panel left of the fan
  crossed by the brine tube in an even number of passes (at least four), and a fan of at least three blades inside a
  ring with a guard of concentric rings and spokes

#### Scenario: Air unit Out inside
- **WHEN** the source is `air`, the outside temperature reads 8.4 °C, the fan speed 45.2 % and the air unit's outlet
  5.7 °C
- **THEN** "8.4 °C" is shown above the fan, "45 %" below the fan and "5.7 °C" beside the outlet pipe, all inside the
  case, without captions, crossing no outline, fin, tube, fan or each other, and no In value is shown at the air unit

#### Scenario: Air unit values at phone width
- **WHEN** the source is `air` and the card renders the vertical layout at 320 px
- **THEN** the three values are inside the case, at least 10 px high, crossing no outline, fin, tube, fan or each
  other

### Requirement: Fan follows its speed
The air unit's fan SHALL rotate while its speed is above 0 %, faster at higher speed; a fan speed in another unit (such
as rpm) above 0 SHALL rotate it at a fixed medium speed. The fan speed SHALL be shown below the fan (see "Air unit with
its value inside"): a percentage as a whole percent, another unit with that unit.

#### Scenario: Running fan
- **WHEN** the source is `air` and the fan speed is 34.5 %
- **THEN** the fan rotates and "35 %" is shown below it

#### Scenario: Stopped fan
- **WHEN** the fan speed is 0 % or unavailable
- **THEN** the fan is drawn still, and the value below it shows "0 %" or the dash

#### Scenario: Fan speed in rpm
- **WHEN** the source is `air` and the fan speed entity reports 900 rpm
- **THEN** the fan rotates at the fixed medium speed and "900 rpm" is shown below it

### Requirement: Ground collector
With `source: ground`, the card SHALL draw a ground collector as a borehole: a body hatched along its top (the
surface), in which the brine rises up the left side, runs through two vertical U-loops in series and drops down the
right side to connections 3 and 4. It SHALL show the brine leaving the collector (the heat pump's brine inlet) bare,
at its bottom beside the outlet pipe, and no In value.

#### Scenario: Ground source
- **WHEN** the config sets `source: ground`
- **THEN** a ground collector is drawn above connections 3 and 4, and no air unit or fan is drawn

#### Scenario: Collector drawing
- **WHEN** the config sets `source: ground`
- **THEN** the collector has two vertical U-loops hanging down from under its hatched top, joined in series, with a
  riser on its left to the first loop and a riser on its right from the second loop, and its ends meet the pipes of
  connections 3 and 4

#### Scenario: Collector Out
- **WHEN** the config sets `source: ground` and the brine inlet reads 7.1 °C
- **THEN** "7.1 °C" without a caption is shown inside the collector at its bottom beside the outlet riser, crossing
  no pipe or outline

### Requirement: Hybrid side by side
With `source: hybrid`, the card SHALL draw the air unit and the ground collector side by side in one brine loop, air
unit first: connection 3's pipe to the air unit, a link pipe from the air unit to the collector, and the collector to
connection 4. The collector's Out (the brine inlet of the heat pump) SHALL be shown as the source's Out; the air unit
SHALL show the outside temperature and the fan speed but no Out, and the link pipe SHALL carry no label.

#### Scenario: Hybrid
- **WHEN** the config sets `source: hybrid`
- **THEN** the air unit and the ground collector are both drawn above connections 3 and 4, side by side, joined by a
  link pipe, crossing no pipe; the collector shows its Out and the air unit shows the outside temperature and the
  fan speed and no Out
