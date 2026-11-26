# Spec Delta

## MODIFIED Requirements

### Requirement: Refrigerant components after the manual figure
The cabinet SHALL contain the refrigerant circuit in the topology of the manual's B4 figure:
- compressor 11, condenser 8, evaporator 7
- expansion valve 12, filter dryer 13, inversion valve 14
- temperature probes 29/30, pressure transducers 35/36 (see "Refrigerant probe pairs")

No component SHALL show its item number.

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

### Requirement: Hydraulic components after the manual figure
The cabinet SHALL contain the hydraulic circuits in the topology of the manual's B4 figure:
- **Production:** pump 15, DHW valve 26, probes 33/34, transducer 38, outlet resistor 44 with safety thermostat 45.
- **Brine:** pump 16, probes 31/32, transducer 37, exchanger 10 with valves 27/28.
- **HTR:** exchanger 9, pump 17, valve 22.

No component SHALL show its item number.

#### Scenario: Hydraulic items
- **WHEN** the card renders variant 4 with every feature `true`
- **THEN** items 9, 10, 15, 16, 17, 22, 26-28, 31-34, 37, 38, 44 and 45 are drawn

#### Scenario: Simplified hydraulics
- **WHEN** the card renders variant 4 with every feature `true`
- **THEN** no hydraulic component shows an item number, and items 18-21, 23, 24 and 25 and their stub pipes are not
  drawn

#### Scenario: HTR placement
- **WHEN** the card renders variant 4 with HTR `true`
- **THEN** exchanger 9 sits on the compressor discharge line between compressor 11 and valve 14, and its water
  lines with pump 17 and valve 22 join the DHW lines of connections 5/6

#### Scenario: Probe placement
- **WHEN** the card renders
- **THEN** probe 33 sits on the production outlet line, 34 on the production return, 31 on the brine outlet, 32 on
  the brine inlet, 30 on the compressor discharge and 29 on the compressor suction, as in the manual figure

### Requirement: Cabinet layout with value lanes
The cabinet's parts SHALL follow the topology of the manual figures (the port order, the order of the parts along
every pipe, the probe and HTR placements and the crossings) but not their coordinates. They SHALL be laid out once, in
rows and columns with lanes between them, where a row lane is a horizontal strip across the whole cabinet that no
part enters and only vertical pipes cross, and a column lane is the same in the vertical direction.

#### Scenario: Lanes free of parts
- **WHEN** the card renders any configuration, in either layout
- **THEN** no part lies in a row lane or a column lane, a row lane is crossed only by vertical pipes and a column lane
  only by horizontal ones

## ADDED Requirements

### Requirement: Refrigerant parts left undrawn
Mini-pressure switches 39/40 and service outlets 41 SHALL NOT be drawn: they have no live value.

#### Scenario: Items 39, 40 and 41
- **WHEN** the card renders variant 4 with every feature `true`
- **THEN** none of the items 39, 40 and 41 is drawn

### Requirement: Compressor symbol
Compressor 11 SHALL use the standard compressor symbol: a circle with two straight lines converging from its suction
side towards its discharge side, drawn as outlines without a fill (decided by the user 2026-11-23).

#### Scenario: Outline symbol
- **WHEN** the card renders any configuration
- **THEN** compressor 11 is drawn as outlines only, a circle and two straight lines converging from the suction side
  towards the discharge side, with no fill

### Requirement: Hydraulic parts left undrawn
Vessels 18/19, safety valves 20/21, drain valves 23/24 and the HTR system discharge valve 25 (decided by the user
2026-11-20), and the stub pipes that lead only to them, SHALL NOT be drawn; nor SHALL items 42 and 43 (cooling outlet
and inlet of the inverter) and 46 (electrical panel). None of them carries a live value.

#### Scenario: Items without a live value
- **WHEN** the card renders variant 4 with every feature `true`
- **THEN** none of the items 18-21, 23-25, 42, 43 and 46 is drawn, and neither are the stub pipes that lead only to
  items 18-21, 23, 24 and 25

### Requirement: Layouts derived from the cabinet layout
Both layouts SHALL be derived from the one cabinet layout: the horizontal layout widens column lanes and the vertical
layout heightens row lanes.

#### Scenario: Same order in both layouts
- **WHEN** the card renders the same configuration in the horizontal and in the vertical layout
- **THEN** the cabinet's parts have the same row and column order in both, and only the lanes differ in size

### Requirement: Values in the lanes
Every value in the cabinet SHALL sit in a lane beside its part, except as "Gap places in the vertical layout"
allows and except a value inside its body (dhw-storage "DHW values inside the tank").

#### Scenario: Values beside their part
- **WHEN** the card renders any configuration in the horizontal layout
- **THEN** every value in the cabinet that is not inside a body lies in a row lane or a column lane, beside its part,
  and a value inside a body (the DHW temperature in tank 50 on model C) lies inside its body
