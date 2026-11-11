## Purpose

The heat source of the outer (brine) loop, drawn outside the cabinet to its left and joined to connections 3 and
4: an air unit, a ground loop, or both, with their live values.

## ADDED Requirements

### Requirement: Source drawn left of the cabinet
The card SHALL draw the outer-loop source to the left of the cabinet, chosen by the `source` option. Two pipes
SHALL run from connection 3 (brine outlet) and connection 4 (brine inlet) up from the top edge and across to the
source. On their way they SHALL pass above the DG1 stubs of connections 1 and 2 without crossing any pipe.

#### Scenario: Pipes from the top
- **WHEN** the card renders any source
- **THEN** the brine pipes leave the cabinet at connections 3 and 4 on the top edge and run to the source on the
  left, above the stubs of connections 1 and 2

### Requirement: Air unit
With `source: air`, the card SHALL draw an air unit: a housing with a fan and a coil. The fan SHALL rotate while
its speed is above 0 %, faster at higher speed. The air unit SHALL show the fan speed, the outside temperature
and the air unit's brine outlet temperature.

#### Scenario: Running fan
- **WHEN** the source is `air` and the fan speed is 34.5 %
- **THEN** the fan rotates and the label reads "34.5 %" (with a no-break space)

#### Scenario: Stopped fan
- **WHEN** the fan speed is 0 % or unavailable
- **THEN** the fan is drawn still

### Requirement: Ground loop
With `source: ground`, the card SHALL draw a ground loop: a ground line with a collector or borehole loop below
it, joined to the brine pipes. It SHALL show the brine outlet and inlet temperatures where the pipes meet the loop.

#### Scenario: Ground source
- **WHEN** the config sets `source: ground`
- **THEN** a ground loop is drawn left of the cabinet, and no air unit or fan speed is shown

### Requirement: Hybrid source
With `source: hybrid`, the card SHALL draw both the air unit and the ground loop in one brine loop (air unit
first), each showing its own values: the air unit its fan speed and outlet temperature, the ground loop only its
exit (the brine inlet), since its entry would repeat the air unit's outlet.

#### Scenario: Hybrid
- **WHEN** the config sets `source: hybrid`
- **THEN** the air unit and the ground loop are both drawn on the brine pipes, each with its own labels

### Requirement: Outer loop active with the brine circuit
The outer-loop pipes and the source SHALL be coloured and animated when the brine circuit is active (see
operating-mode), and muted otherwise. "The source" includes its symbols (air unit housing and coil, ground loop),
which take the muted style with the pipes; the fan keeps following its own speed. This includes `defrost`, in
which exchanger 10 warms the brine that runs to the air unit.

#### Scenario: Standby
- **WHEN** the mode is `standby`
- **THEN** the outer-loop pipes are muted, and the fan rotates only if its own speed is above 0 %

#### Scenario: Defrost
- **WHEN** the mode is `defrost`, the source is `air` and the brine pump runs
- **THEN** the outer-loop pipes are coloured by the brine probes and animated towards the air unit
