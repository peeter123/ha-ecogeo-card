## MODIFIED Requirements

### Requirement: Refrigerant components after the manual figure
The cabinet SHALL contain the refrigerant circuit in the topology of the manual's B4 figure:
- compressor 11, condenser 8, evaporator 7
- expansion valve 12, filter dryer 13, inversion valve 14
- temperature probes 29/30, pressure transducers 35/36 (see "Refrigerant probe pairs")

Mini-pressure switches 39/40 and service outlets 41 SHALL NOT be drawn: they have no live value. No component SHALL
show its item number. Compressor 11 SHALL use the standard compressor symbol: a circle with two straight lines
converging from its suction side towards its discharge side, drawn as outlines without a fill (decided by the user
2026-11-23).

#### Scenario: Compressor symbol
- **WHEN** the card renders any configuration
- **THEN** compressor 11 is a circle with two straight converging lines, wide at the suction pipe and narrow at the
  discharge pipe, and no part of the circle is filled

#### Scenario: Compressor fill in the dark theme
- **WHEN** Home Assistant uses a dark theme
- **THEN** the compressor's circle and lines take the dark theme's outline colour and no part of the circle is filled

#### Scenario: Refrigerant items
- **WHEN** the card renders variant 4 with every feature `true`
- **THEN** items 7, 8, 11, 12, 13, 14, 29, 30, 35 and 36 are drawn

#### Scenario: Simplified refrigerant
- **WHEN** the card renders variant 4 with every feature `true`
- **THEN** no refrigerant component shows an item number, and 39, 40 and 41 are not drawn

## ADDED Requirements

### Requirement: One band style
The band's bodies (the emitter, the air unit, the ground collector and the external tank) SHALL share one corner
radius, one outline weight and one inner margin, SHALL draw no divider line across the body, and SHALL stand flat on
the band's bottom edge (decided by the user 2026-11-23).

#### Scenario: Shared style
- **WHEN** the card renders model B with `dhw: external`, `source: hybrid` and `emitter: underfloor`, in either layout
- **THEN** the emitter, the air unit, the collector and the tank have the same corner radius and outline width, no
  line crosses any of them from wall to wall except a pipe, and the lowest edge of each body's outline lies on the
  band's bottom edge along the body's width

### Requirement: One jog level
The horizontal sections of the pipes between the cabinet's top edge and the band's bodies SHALL lie at one height above
the cabinet's top edge. Only the external tank's pipes MAY use a second height, and only in an arrangement where one
height would make them cross another band pipe (decided by the user 2026-11-23).

#### Scenario: One level in the horizontal layout
- **WHEN** the card renders the horizontal layout with any source, any emitter and any DHW storage
- **THEN** every horizontal pipe section between the cabinet and the band lies at the same height, and no two pipes
  outside the cabinet cross

#### Scenario: Tank level only where needed
- **WHEN** the card renders the vertical layout with any source, any emitter and `dhw: external`
- **THEN** the emitter's and the source's horizontal pipe sections lie at one height, the tank's lie at the same
  height unless that height would make them cross a source pipe, and no two pipes outside the cabinet cross
