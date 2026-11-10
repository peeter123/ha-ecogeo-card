# ecoGEO card

This page explains the ecoGEO schematic card: what it shows, where each fact comes from and how the pieces fit
together. It is a skeleton; sections marked "to be written" are filled in as the card is built.

## Purpose

The card draws the internal schematic of an Ecoforest ecoGEO heat pump (the hydraulic and refrigerant circuits) as
inline SVG, shows the live value of each sensor beside its component, and colours the pipes by temperature. It
reads entities from Home Assistant and never writes to them.

## Sources of truth

Every fact in the card, and in this document, is marked with where it comes from:

- **manual-figure**: the ecoGEO technical service manual, section 3.1 "Component location" (item numbers 1 to 54,
  figures B1 to B4 and C). Every drawn component and pipe cites its item number. The geometry follows the figure's
  topology, not its exact coordinates.
- **firmware-entity**: entity names and units as exposed by the `esphome-ecoforest-ecogeo` firmware (object ids
  `<prefix>_<suffix>`, default prefix `ecoforest_ecogeo`). The card's default entity mapping follows this naming.
- **Registers.csv**: the register list in the firmware repository, for the meaning and range of registers the
  firmware does not expose yet.
- **derived**: a state the card infers (operating mode, valve positions, active circuits). Each derived state names
  its inputs and is a pure, unit-tested function.

## Variants

The manual's section 3.1 "Component location" (page 34) shows four figures, B1 to B4, of the same unit. They differ
only in the cooling parts (manual-figure). The card's `variant` option selects the matching preset; the `features`
option overrides single parts.

| Variant (figure) | `active_cooling` (item 14) | `passive_cooling` (items 10, 27, 28) | Source |
|---|---|---|---|
| 1 (B1) | no | no | manual-figure, section 3.1, page 34 |
| 2 (B2) | no | yes | manual-figure, section 3.1, page 34 |
| 3 (B3) | yes | no | manual-figure, section 3.1, page 34 |
| 4 (B4) | yes | yes | manual-figure, section 3.1, page 34 |

- B1 has no cooling parts, B2 has passive cooling, B3 has active cooling and B4 has both.
- The HTR (items 9, 17, 22, 25) and the outlet resistor with its thermostat (items 44, 45) appear in all four
  figures, so they are not part of any preset: `htr` and `backup_heater` default to `true` for every variant.
- Figure B2 shows a stray label "14" without a valve symbol. It is taken to be an error in the figure: variant 2 has
  no cycle inversion valve.
- A feature state is `true`, `false` or `unused`. `unused` draws the part muted and stops the card from deriving
  the part's own function; exchanger 10 with valves 27 and 28 still takes part in a defrost.

## Configuration

The options, feature states and the role table (every role with its firmware entity suffix, unit and manual item)
are in the [README](../README.md#configuration). The role table is the single source in `src/config/roles.ts`
(firmware-entity names and units; manual-figure item numbers). An entity for a role is chosen in this order: the
override in `entities`, then `<domain>.<prefix>_<suffix>` when `prefix` is set, then none. With neither a prefix
nor an entity the card shows built-in sample values, taken from a heating day of the live unit.

## Operating mode

The mode is derived (derived), by a pure function that names its inputs: `unit.on_off`, `compressor.mode`,
`compressor.speed`, `dhw.demand`, `unit.summer`, `production.pump` and the `active_cooling` and
`passive_cooling` feature states. The first row whose condition holds wins.

| Order | Mode | Condition |
|---|---|---|
| 1 | Off | `unit.on_off` reads OFF (case-insensitive); EMERGENCY is not off |
| 2 | Defrost | `compressor.mode` reads Defrost (case-insensitive); Balance is not defrost |
| 3 | DHW | the compressor runs and `dhw.demand` is on |
| 4 | Active cooling | the compressor runs, `unit.summer` is on and `active_cooling` is `true` |
| 5 | Heating | the compressor runs |
| 6 | Passive cooling | the compressor is stopped, `unit.summer` is on, the production pump runs and `passive_cooling` is `true` |
| 7 | Standby | everything else, including an unknown compressor speed |

The compressor runs when its speed is above 0 rpm; a pump runs when its speed is above 0 %. An unavailable or unknown
input counts as not running or not active. The alarm (`unit.alarm`) and the bridge connection (`unit.connection`,
the ESPHome device's connectivity, not the heat pump) never change the mode: they add an Alarm and an Offline
indication.

Valves and circuits follow the mode (also pure, in `src/calc/circuits.ts`):

| Mode | Valve 26 | Valve 14 | Valves 27/28 | Active circuits |
|---|---|---|---|---|
| Heating | ports 1/2 | normal | closed | refrigerant, brine, production to ports 1/2 |
| DHW | ports 5/6 | normal | closed | refrigerant, brine, production to ports 5/6, DHW coil |
| Active cooling | ports 1/2 | reversed | closed | refrigerant, brine, production to ports 1/2; with HTR recovery also HTR and the DHW coil |
| Passive cooling | ports 1/2 | normal | exchanger 10 | brine, production to ports 1/2, exchanger 10 |
| Defrost | ports 1/2 | normal | exchanger 10 | the same as passive cooling; the refrigerant is idle |
| Off, Standby | ports 1/2 | normal | closed | none |

- The brine circuit is active only while the brine pump runs.
- A circuit whose part is `false` or `unused` is never active, except exchanger 10 with valves 27/28 in a defrost
  (and not at all when `passive_cooling` is `false`).
- HTR recovery: in active cooling, with `htr` `true`, a DHW storage and `heating.capacity` (the condensation
  capacity) above 0 W, the HTR circuit (exchanger 9, pump 17) and the DHW coil are active and valve 26 stays towards
  ports 1/2. In every other mode HTR is drawn idle: its state is not known (coil 210 is not exposed by the firmware).
- Without DHW storage (`dhw: none`) there is no DHW loop, so the DHW mode has no DHW circuits and HTR is never active.

## Drawing

The cabinet is drawn as inline SVG, in a fixed viewBox of 1000 x 620 units that scales with the card width. There is
no image anywhere. Everything below cites the manual (manual-figure, section 3.1, figures B1 to B4 and C, item
numbers 1 to 54); coordinates are the card's own, the topology is the figure's.

### Items drawn

Each drawn component carries its item number as small secondary text. Parts in italics depend on a feature or on the
DHW storage (see below).

| Items | Symbol | Part |
|---|---|---|
| 1, 2 | port | Production outlet and return, labelled DG1 |
| 3, 4 | port | Brine outlet and inlet, labelled Outer loop |
| 5, 6 | port | *DHW inter-accumulator outlet and inlet, labelled DHW (model B with an external tank only)* |
| 7, 8 | plate exchanger | Evaporator and condenser |
| *9* | plate exchanger | *HTR system exchanger, on the discharge line* |
| *10* | plate exchanger | *Passive cooling / defrosting exchanger* |
| 11 | compressor | Compressor |
| 12, 13 | expansion valve, filter dryer | Electronic expansion valve, filter dryer |
| *14* | inversion valve | *Cycle inversion valve, drawn in its position (normal or reversed)* |
| 15, 16, *17* | pump | Production, brine and *HTR* circulator pumps |
| 18, 19 | expansion vessel | Brine and production expansion vessels |
| 20, 21 | safety valve | Brine and production safety valves |
| *22*, *25* | valve, drain valve | *HTR system retention and discharge valves* |
| 23, 24 | drain valve | Brine drain and production discharge valves |
| *26* | three-way valve | *DHW valve, drawn in its position (towards ports 1/2 or the DHW lines)* |
| *27*, *28* | three-way valve | *Passive cooling production and brine valves, drawn in their position* |
| 29 to 34 | probe T | Suction, discharge, brine outlet, brine inlet, production outlet and production return probes |
| 35, 36, 37, 38 | transducer P | Suction, discharge, brine and production pressure transducers |
| 39, 40 | mini-pressure switch | Suction and discharge switches |
| 41 | service outlet | Service outlets (two) |
| *44*, *45* | resistor, thermostat | *Outlet resistor and safety thermostat* |
| *47, 48, 49* | port | *Model C only: tap water inlet, DHW outlet and recirculation, on the top edge (see Source and DHW)* |
| *50, 51* | tank, coil | *Model C only: the integrated DHW storage tank and its coil* |
| *52, 53* | service outlet, drain valve | *Model C only: the manual trap on the coil's supply line and the tank drain valve* |
| *54* | probe T | *Model C only: the DHW temperature probe on the tank wall* |

Probes 33 and 34 sit on the production outlet and return lines, 31 and 32 on the brine outlet and inlet lines, 30 on
the compressor discharge and 29 on the suction line, as in the figure.

### Features and DHW storage

- `true`: the part is drawn normally.
- `false`: the part is not drawn and its pipes are closed off as in a variant without it, by a straight pipe that
  replaces it. Without passive cooling, exchanger 10 and valves 27/28 go and the production and brine lines run
  straight through. Without HTR, exchanger 9, pump 17 and valves 22/25 go and the discharge line runs from the
  compressor straight to valve 14. Without active cooling, valve 14 goes and the discharge line runs straight to the
  condenser and the evaporator straight to the compressor. Without the backup heater, resistor 44 and thermostat 45
  go.
- `unused`: the part is drawn muted and is never active, except that exchanger 10 with valves 27/28 is drawn active in a defrost. Pipes that only serve it are muted; a pipe that merely
  passes through it (for example the discharge line through exchanger 9) stays normal.
- Without DHW storage (`dhw: none`) connections 5/6, valve 26 and the whole HTR group (9, 17, 22, 25) are not drawn,
  because HTR only makes sense with a DHW storage; ports 1/2 connect straight to the production circuit.
- Model C draws no connections 5/6. The DHW lines of valve 26 run into the integrated tank (items 47 to 54), drawn
  under the top edge (see Source and DHW).

### How the B4 figure is laid out

- **Top edge:** ports 1 and 2 are left, 3 and 4 right of centre, 5 and 6 far right. The DG1 stubs of ports 1/2 end
  just below the pipe run above the cabinet; the pipes of ports 3/4 and 5/6 leave from the top edge into that run
  (see the Source and DHW sections), so no pipe outside the cabinet crosses another.
- **DHW lines:** valve 26 sits on port 1's line. Its DHW output is the supply line across the cabinet to port 5, and
  the return line from port 6 runs back across to join port 2's line. Exchanger 9 taps the supply, pump 17 the return.
- **Refrigerant:** compressor 11 is in the middle. The discharge runs left through 36, 40 and 30 into HTR exchanger 9 and on to inversion valve 14, which feeds condenser 8 (heating) or evaporator 7 (active
  cooling). The expansion leg 8, 41, 13, 12, 7 runs along the lower row; the suction returns through 29, 35 and 39
  with service outlet 41.
- **Valve 14's ports:** the three ports on its right are ordered suction (top), evaporator 7 (middle), condenser 8
  (bottom). The figure orders them evaporator, suction, condenser, which makes two refrigerant pipes cross; this
  order does not. It is a layout choice, the connections are the same.
- **Production:** the return trunk runs from the junction of ports 2 and 6 down to valve 27, pump 15 and condenser 8.
  From there the outlet runs left to resistor 44 and up past probe 33 to valve 26 and port 1. The resistor is drawn
  vertical on port 1's lane (the figure draws it horizontal with the return line passing behind it). The vessel 19,
  transducer 38 and safety valve 21 sit on the pump's suction side and drain 24 after the pump, as in the figure.
- **Exchanger 10:** below the lower row, with valves 27 and 28 beside pump 15 and evaporator 7: production water
  passes one side, brine the other. Vessel 18, transducer 37 and safety valve 20 tap port 4's line before pump 16;
  drain 23 hangs on port 3's line.
- **Crossings inside the cabinet:** the line from port 1 through valve 26 to port 5 separates port 2 from port 6, yet
  the DHW return from 6 has to join port 2's line, so at least one internal crossing is unavoidable. The figure
  has 15 (14 hops, plus the return line passing behind resistor 44); this layout needs 14. Each is declared as data in `src/diagram/geometry.ts`
  and drawn as a hop, a small gap in one of the two pipes: the DHW supply and return across the lines of ports 2, 3
  and 4 (5 hops) and across the HTR riser (1), the return trunk across the outlet line (1), the brine feed across
  port 3's line (1), exchanger 10's brine pipes across each other (1) and across port 3's drain line (1), and the
  production vessel and drain taps across exchanger 10's two production pipes (4). Tests fail when two pipes cross
  anywhere else.

## Source and DHW

The outer-loop source and the DHW storage are drawn outside the cabinet, in the zones left (x 0 to 210) and right
(x 790 to 1000) of it. Their pipes are segments in `src/diagram/geometry.ts`, like the cabinet's, so they will take
the same colour and animation (planned, with the colours section). The air unit, the ground loop and the external tank have no item number in the manual;
the manual's figures stop at the connections.

### Outer-loop source (`source`)

Connection 3 (brine outlet) and 4 (brine inlet) rise from the top edge into the pipe run above the cabinet, above the
DG1 stubs and the circuit labels. Port 4's pipe is the higher one (y 50, port 3's runs at y 85), so the two never
cross on their way left. They belong to the brine circuit: they are to be active with it, defrost included.

- **Air:** a housing with a finned coil of three rows and a fan. The brine enters the coil at the top and leaves
  on the left. The fan rotates while `source.fan_speed` is above 0 % (a full turn takes 120 s divided by the speed
  in %, between 0.5 and 6 s) and stands still at 0 % or without a value. It does not depend on the mode, so it
  also turns in standby when its own speed says so. With `prefers-reduced-motion` the fan stands still.
- **Ground:** a ground line with a collector loop of three rows below it, joined to the brine pipes.
- **Hybrid:** both on one brine loop, in series. The brine runs through the air unit first and then down to the
  ground loop, which sits under the air unit; the loop's exit returns up along the left edge to port 4. Series
  keeps the drawing free of crossings in the narrow zone, which two branches in parallel would not.

### DHW storage (`dhw`)

- **External (model B):** ports 5 (outlet) and 6 (inlet), the manual's "DHW inter-accumulator", rise into the run and
  go right to a tank with a coil. Port 5's pipe is the higher one (y 50 against y 85) so they do not cross. The
  coil is three rows inside the tank body.
- **Internal (model C):** the integrated tank is drawn inside the cabinet, under the top edge, after figure C: tank
  50 with coil 51, probe 54 and the connections 47 (tap water inlet), 48 (DHW outlet) and 49 (recirculation) on the
  top edge, the manual trap 52 on the coil's supply line, and the drain valve 53 on the tank wall. The figure's tank
  is tall and fills the cabinet; this one is squat so that the probe row and the rest of the cabinet stay as in the
  B figures. It differs from the figure in these ways: 47 and 49 are short stubs that end at the tank's top rather
  than dip tubes (the coil fills the tank's height, so a tube would cross it), the trap sits on the supply line
  instead of the coil's high point, and probe 54 and drain valve 53 touch the wall.
- **None:** no tank, no DHW pipes, no connections 5/6, no valve 26 and no HTR group. The mode label "DHW" can still show when the unit reports DHW mode.

The tank body is planned to take the DHW temperature colour through the custom property `--dhw-tank-color`, which
nothing sets yet.

The fan speed, outside temperature, air unit outlet temperature, the ground loop's brine temperatures and the tank
values are planned as live labels (see Live values); the space for them is kept free beside the source and the
tanks.

## Colours

To be written.

## Live values

To be written.

## Installation

To be written.
