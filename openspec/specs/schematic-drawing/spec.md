# schematic-drawing Specification

## Purpose

What the card draws for the heat pump cabinet itself: its top connections and its internal hydraulic and
refrigerant components, following the service manual's figures, and which parts are drawn for each model,
variant and feature state.

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
- 1 production outlet and 2 production return, labelled as the heating circuit (DG1).
- 3 brine outlet and 4 brine inlet, labelled as the outer loop.
- 5 and 6, labelled as DHW.
Each connection SHALL show its item number.

#### Scenario: Port order
- **WHEN** the card renders model B with `dhw: external`
- **THEN** the top edge shows connections 1, 2, 3, 4, 5, 6 left to right, labelled DG1, outer loop and DHW

#### Scenario: No DHW
- **WHEN** the config sets `dhw: none`
- **THEN** connections 5 and 6 and valve 26 are not drawn, and ports 1/2 connect directly to the production circuit
- **AND** the HTR group (9, 17, 22, 25) is not drawn, and the discharge line runs from compressor 11 straight to
  valve 14

#### Scenario: No crossings
- **WHEN** the card renders model B with `dhw: external` and any source
- **THEN** the DG1 stubs of connections 1/2 end below the pipe run above the cabinet, the 3/4 pipes run left to
  the source, the 5/6 pipes run right to the tank, and no two pipes outside the cabinet cross

#### Scenario: Hops inside the cabinet
- **WHEN** the card renders model B with `dhw: external`
- **THEN** every crossing of pipes inside the cabinet (such as the DHW supply and return lines over the lines of
  connections 2, 3 and 4) is drawn as a hop, there are no more crossings than in the manual figure, and no pipe
  outside the cabinet crosses another

### Requirement: Refrigerant components after the manual figure
The cabinet SHALL contain the refrigerant circuit in the topology of the manual's B4 figure, each component with
its item number:
- compressor 11, condenser 8, evaporator 7
- expansion valve 12, filter dryer 13, inversion valve 14
- temperature probes 29/30, pressure transducers 35/36, mini-pressure switches 39/40, service outlets 41

#### Scenario: Refrigerant items
- **WHEN** the card renders variant 4 with every feature `true`
- **THEN** items 7, 8, 11, 12, 13, 14, 29, 30, 35, 36, 39, 40 and 41 are drawn with their item numbers

### Requirement: Hydraulic components after the manual figure
The cabinet SHALL contain the hydraulic circuits in the topology of the manual's B4 figure, each component with
its item number:
- **Production:** pump 15, DHW valve 26, probes 33/34, transducer 38, outlet resistor 44 with safety thermostat 45.
- **Brine:** pump 16, probes 31/32, transducer 37, exchanger 10 with valves 27/28.
- **HTR:** exchanger 9, pump 17, valves 22/25.
- **Safety and service:** vessels 18/19, safety valves 20/21, drain valves 23/24.

Items 42 and 43 (cooling outlet and inlet of the inverter) and 46 (electrical panel) are not drawn: they carry no
production, brine or refrigerant flow and have no live value.

#### Scenario: Hydraulic items
- **WHEN** the card renders variant 4 with every feature `true`
- **THEN** items 9, 10, 15-28, 31-34, 37, 38, 44 and 45 are drawn with their item numbers

#### Scenario: HTR placement
- **WHEN** the card renders variant 4 with HTR `true`
- **THEN** exchanger 9 sits on the compressor discharge line between compressor 11 and valve 14, and its water
  lines with pump 17 and valves 22/25 join the DHW lines of connections 5/6

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
- **THEN** exchanger 9, pump 17 and valves 22/25 are drawn muted, with no flow animation

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
- **THEN** the cabinet outline, item numbers and labels contrast with the dark card background
