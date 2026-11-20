# schematic-drawing Specification

## Purpose

What the card draws for the heat pump cabinet itself: its top connections and its internal hydraulic and
refrigerant components, following the topology of the service manual's figures in one cabinet layout with value
lanes from which both layouts' arrangements are derived, the band above the cabinet that holds the emitter, the
source and the tank at one body height, and which parts are drawn for each model, variant and feature state.

## Requirements

### Requirement: Drawn by the card
The card SHALL draw the whole schematic as inline SVG generated from the configuration and states. It SHALL NOT
use a raster or external background image. The drawing SHALL scale with the card width and keep its aspect
ratio.

#### Scenario: No image resources
- **WHEN** the card renders
- **THEN** the card's DOM contains no `img` element and no CSS `background-image` for the schematic

### Requirement: Cabinet with top connections
The card SHALL draw the cabinet as a rectangle with its six hydraulic connections on the top edge, left to right
in the manual's order:
- 1 production outlet and 2 production return, joined to the DG1 emitter (heating-emitter).
- 3 brine outlet and 4 brine inlet, joined to the outer-loop source (outer-loop-source).
- 5 and 6, joined to the external DHW tank (dhw-storage).
No connection SHALL show its item number, and no connection caption (DG1, outer loop, DHW) SHALL be drawn.

#### Scenario: Port order
- **WHEN** the card renders model B with `dhw: external`
- **THEN** the top edge shows connections 1, 2, 3, 4, 5, 6 left to right, with no item number and no caption

#### Scenario: No DHW
- **WHEN** the config sets `dhw: none`
- **THEN** connections 5 and 6 and valve 26 are not drawn, and ports 1/2 connect directly to the production circuit
- **AND** the HTR group (9, 17, 22) is not drawn, and the discharge line runs from compressor 11 straight to
  valve 14

#### Scenario: No crossings
- **WHEN** the card renders model B with `dhw: external`, any source and any emitter, in either layout
- **THEN** the pipes of connections 1/2 rise to the emitter, those of 3/4 to the source and those of 5/6 to the tank,
  and no two pipes outside the cabinet cross

#### Scenario: Hops inside the cabinet
- **WHEN** the card renders model B with `dhw: external`
- **THEN** every crossing of pipes inside the cabinet (such as the DHW supply and return lines over the lines of
  connections 2, 3 and 4) is drawn as a hop, there are no more crossings than in the manual figure, and no pipe
  outside the cabinet crosses another

### Requirement: Refrigerant components after the manual figure
The cabinet SHALL contain the refrigerant circuit in the topology of the manual's B4 figure:
- compressor 11, condenser 8, evaporator 7
- expansion valve 12, filter dryer 13, inversion valve 14
- temperature probes 29/30, pressure transducers 35/36 (see "Refrigerant probe pairs")

Mini-pressure switches 39/40 and service outlets 41 SHALL NOT be drawn: they have no live value. No component SHALL
show its item number. Compressor 11 SHALL use the standard compressor symbol: a circle with two straight lines
converging from its suction side towards its discharge side. The two parts of the circle outside the lines (the
triangles between each line and the circle) SHALL be filled solid in the outline colour, so they read black on a
light theme and stay visible on a dark one; the part between the lines stays unfilled.

#### Scenario: Compressor symbol
- **WHEN** the card renders any configuration
- **THEN** compressor 11 is a circle with two straight converging lines, wide at the suction pipe and narrow at the
  discharge pipe, and the two parts of the circle outside the lines are filled solid in the outline colour

#### Scenario: Compressor fill in the dark theme
- **WHEN** Home Assistant uses a dark theme
- **THEN** the compressor's two filled parts take the dark theme's outline colour and contrast with the card
  background

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

No component SHALL show its item number. Vessels 18/19, safety valves 20/21, drain valves 23/24 and the HTR system
discharge valve 25 (decided by the user 2026-11-20), and the stub pipes that lead only to them, SHALL NOT be drawn;
nor SHALL items 42 and 43 (cooling outlet and inlet of the inverter) and 46 (electrical panel). None of them carries a
live value.

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

### Requirement: Optional parts follow their feature state
A part whose feature is `false` SHALL NOT be drawn, and its pipes SHALL be closed off as in a variant without
that part. A part whose feature is `unused` SHALL be drawn in the muted style and never active, except exchanger
10 with valves 27/28 in `defrost`, which are drawn active (see operating-mode). A part whose feature is `true`
SHALL be drawn normally.

#### Scenario: Without passive cooling
- **WHEN** passive cooling is `false`
- **THEN** exchanger 10 and valves 27/28 are not drawn, and the production and brine circuits bypass them

#### Scenario: Unused HTR
- **WHEN** HTR is `unused`
- **THEN** exchanger 9, pump 17 and valve 22 are drawn muted, with no flow animation, and valve 25 is not drawn

### Requirement: Model C cabinet
Model C SHALL draw the integrated DHW storage inside the cabinet (see dhw-storage) and SHALL NOT draw connections
5 and 6. All other components SHALL be drawn as for model B.

#### Scenario: Model C ports
- **WHEN** the config sets `model: C`
- **THEN** the top edge shows connections 1-4, and the DHW tank is inside the cabinet

### Requirement: Operating mode shown
The card SHALL show the derived operating mode as text in the card, for example "Heating" or "DHW", and the alarm
indication when the alarm is on.

#### Scenario: Mode label
- **WHEN** the mode is `passive_cooling`
- **THEN** the card shows the text "Passive cooling"

#### Scenario: Defrost label
- **WHEN** the mode is `defrost`
- **THEN** the card shows the text "Defrost"

### Requirement: Theme aware
The drawing SHALL use Home Assistant theme variables for its outlines, text and muted colours, and SHALL be
legible in both light and dark themes.

#### Scenario: Dark theme
- **WHEN** Home Assistant uses a dark theme
- **THEN** the cabinet outline, the component outlines, the emitter, source and tank outlines and the labels contrast
  with the dark card background

### Requirement: Line weights
Pipes SHALL be drawn with a stroke of at least 3 drawing units and component outlines with a stroke of at least 2
drawing units, so that the drawing stays legible when the card is scaled down.

#### Scenario: Pipe stroke
- **WHEN** the card renders
- **THEN** every pipe's base stroke is at least 3 units wide and every component outline at least 2 units

### Requirement: Band arrangement
Both layouts SHALL draw the emitter, the outer-loop source and the external tank in a band above the cabinet, in
the order of their connections: the emitter above 1/2, the source above 3/4, the tank above 5/6. Each SHALL be joined
to its connections by pipes that leave the top edge upwards. No pipe SHALL run over the cabinet from one side to the
other, and no part SHALL be drawn left or right of the cabinet.

#### Scenario: Band order
- **WHEN** the card renders model B with `dhw: external`, `source: air` and `emitter: underfloor`, in either layout
- **THEN** the emitter, the air unit and the tank lie above the cabinet's top edge, left to right in that order, and
  nothing is drawn beside the cabinet

#### Scenario: Short joins
- **WHEN** the card renders any configuration
- **THEN** every pipe between a connection and its part lies between the cabinet's top edge and the band, and no such
  pipe passes above another part

### Requirement: One body height in the band
The emitter, the source's bodies (the air unit, the ground collector, both of the hybrid) and the external tank SHALL
share one body height in both layouts, each standing on the band's bottom edge (decided by the user 2026-11-20).

#### Scenario: Equal body heights
- **WHEN** the card renders any emitter, source and DHW storage, in either layout
- **THEN** every drawn body in the band (emitter, air unit, ground collector, external tank) has the same height

### Requirement: Arrangement keeps the topology
Each layout's arrangement SHALL keep the port order on the top edge, the probe placements, the HTR placement, no
crossing of pipes outside the cabinet, every crossing inside the cabinet drawn as a hop and no more crossings than the
manual figure. Every drawn part SHALL lie inside its zone (cabinet or band) and no two drawn parts SHALL overlap.

#### Scenario: Ports and crossings
- **WHEN** the card renders model B with `dhw: external`, every source and every emitter, in either layout
- **THEN** the top edge shows connections 1-6 left to right, no two pipes outside the cabinet cross, and every
  crossing inside the cabinet is a hop

#### Scenario: No overlapping parts
- **WHEN** the card renders any emulator capture in either layout
- **THEN** no two drawn parts overlap and every part lies inside the cabinet or the band

### Requirement: Vertical arrangement
The vertical layout's cabinet SHALL hold the same parts and pipes as the horizontal one, in the same order along every
pipe, with more height between the rows of parts, so that the values fit between the pipes at phone width. The band
SHALL span the drawing's width. With model C, tank 50 SHALL be taller in the vertical layout than in the horizontal
one, the added height lying above coil 51, so that its values stack there (decided by the user 2026-11-20).

#### Scenario: Taller cabinet
- **WHEN** the card renders the same configuration in both layouts
- **THEN** the vertical cabinet's height-to-width ratio is larger than the horizontal one's, and both draw the same
  set of parts and pipes

#### Scenario: Taller tank 50
- **WHEN** the card renders `model: C` with `dhw: internal` in both layouts
- **THEN** tank 50's wall is taller in the vertical layout, coil 51 and every other part keep their size, and the
  room between the tank's top and coil 51 is larger than in the horizontal layout

### Requirement: Cabinet layout with value lanes
The cabinet's parts SHALL follow the topology of the manual figures (the port order, the order of the parts along
every pipe, the probe and HTR placements and the crossings) but not their coordinates. They SHALL be laid out once, in
rows and columns with lanes between them, where a row lane is a horizontal strip across the whole cabinet that no
part enters and only vertical pipes cross, and a column lane is the same in the vertical direction. Both layouts SHALL
be derived from this one layout: the horizontal layout widens column lanes and the vertical layout heightens row
lanes, and every value in the cabinet sits in a lane beside its part, except as "Gap places in the vertical layout"
allows.

#### Scenario: Lanes free of parts
- **WHEN** the card renders any configuration, in either layout
- **THEN** no part lies in a row lane or a column lane, a row lane is crossed only by vertical pipes and a column lane
  only by horizontal ones

### Requirement: Gap places in the vertical layout
In the vertical layout, a rotated value (responsive-layout "Rotated values in the vertical layout") and the pump 15
value above pump 15 SHALL sit in a lane or in a gap between vertical pipes beside their part, even where that gap is
not a lane through the whole cabinet; in a gap they SHALL touch no part and no pipe (decided by the user 2026-11-20).

#### Scenario: Values in lanes
- **WHEN** a unit test checks every cabinet value of every configuration, in the frame and in both layouts
- **THEN** each value's box lies in a row lane or a column lane, except, in the vertical layout, the rotated values and
  the pump 15 value, whose boxes touch no part and no pipe and lie beside their part

### Requirement: Compressor and exchanger 10 centred
Compressor 11 and exchanger 10 SHALL be centred on the cabinet's vertical centre line in both layouts, keeping the
topology of "Cabinet layout with value lanes" (decided by the user 2026-11-20).

#### Scenario: Centred compressor and exchanger 10
- **WHEN** the card renders variant 4 in either layout
- **THEN** the centres of compressor 11 and exchanger 10 lie within 2 units of the cabinet's vertical centre line

#### Scenario: Same order in both layouts
- **WHEN** the same configuration is rendered once in each layout
- **THEN** the parts have the same left-to-right order within each row and the same top-to-bottom order within each
  column

### Requirement: Refrigerant probe pairs
Each temperature probe of the compressor SHALL be drawn next to its pressure transducer as a pair on the same line:
discharge temperature 30 with discharge pressure 36, and suction temperature 29 with suction pressure 35. No other
part SHALL sit between the two of a pair.

#### Scenario: Pairs
- **WHEN** the card renders any configuration
- **THEN** probes 30 and 36 are adjacent on the discharge line and 29 and 35 adjacent on the suction line, with no
  part between them

### Requirement: Transducers on their lines
Pressure transducer 38 SHALL be drawn on the production return line next to probe 34, and transducer 37 on the brine
inlet line next to probe 32, each directly on its line, with no stub pipe leading to it.

#### Scenario: Transducer 38
- **WHEN** the card renders any configuration
- **THEN** transducer 38 sits on the same pipe as probe 34, with no part between them, and no stub pipe leads to it

#### Scenario: Transducer 37
- **WHEN** the card renders any configuration
- **THEN** transducer 37 sits on the same pipe as probe 32, with no part between them, and no stub pipe leads to it
