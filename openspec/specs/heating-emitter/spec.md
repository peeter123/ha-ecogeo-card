# heating-emitter Specification

## Purpose
The heat emitter of the DG1 heating circuit, drawn on connections 1 and 2 so that the production water visibly goes
somewhere: an underfloor spiral, a radiator or none, coloured and animated with the DG1 production circuit, with no
caption of the DG1 demand.

## Requirements

### Requirement: Emitter above connections 1/2
The card SHALL draw the emitter chosen by the `emitter` option in the band above the cabinet, above connections 1
and 2. Its supply pipe SHALL run from connection 1 to the emitter's inlet and its return pipe from the emitter's outlet
to connection 2, without crossing any pipe. With `emitter: none` connections 1 and 2 SHALL end in short stubs and no
emitter SHALL be drawn.

#### Scenario: Default emitter
- **WHEN** the config sets no `emitter`
- **THEN** an underfloor loop is drawn above connections 1 and 2, joined to both, and no pipe crosses another
  outside the cabinet

#### Scenario: No emitter
- **WHEN** the config sets `emitter: none`
- **THEN** no emitter is drawn and connections 1 and 2 end in short stubs above the cabinet

### Requirement: Underfloor loop drawing
With `emitter: underfloor` the card SHALL draw a bifilar spiral pipe inside a floor body (a rectangle drawn in the
outline style): an inward run, entered by the supply pipe, that winds towards the centre in at least two turns, and an
outward run that winds back out between the inward turns and is left by the return pipe. The two runs SHALL NOT cross,
and both ends SHALL lie on the body's side facing the cabinet.

#### Scenario: Underfloor passes
- **WHEN** the config sets `emitter: underfloor`
- **THEN** the emitter is a rectangle holding a spiral of at least two inward turns, reversing in its centre and
  winding back out between them, with its two ends on the supply and return pipes at the body's bottom

#### Scenario: Spiral without crossings
- **WHEN** the config sets `emitter: underfloor`, in either layout
- **THEN** no run of the spiral crosses another, and adjacent runs are at least 12 units apart

### Requirement: Radiator drawing
With `emitter: radiator` the card SHALL draw a panel radiator: a body with at least four vertical columns, its inlet at
the top on one side and its outlet at the bottom on the other side.

#### Scenario: Radiator columns
- **WHEN** the config sets `emitter: radiator`
- **THEN** the emitter is a body with at least four vertical columns, the supply pipe meets it at the top and the
  return pipe at the bottom on the opposite side

### Requirement: Emitter follows the DG1 production circuit
The emitter, its supply pipe and its return pipe SHALL be coloured and animated while the DG1 production circuit is
active (operating-mode), and drawn muted and still otherwise.

#### Scenario: Heating
- **WHEN** the mode is `heating`, the production outlet reads 35.0 °C and the return 30.0 °C
- **THEN** the supply pipe has the 35.0 °C colour, the return pipe the 30.0 °C colour, and the emitter's flow is
  animated

#### Scenario: DHW mode
- **WHEN** the mode is `dhw`
- **THEN** the emitter and its pipes are muted and not animated

#### Scenario: Passive cooling
- **WHEN** the mode is `passive_cooling`
- **THEN** the emitter and its pipes are coloured by the production temperatures and animated

### Requirement: Emitter colours from supply to return
The supply pipe SHALL take the production outlet temperature (33) and the return pipe the production return
temperature (34). The underfloor spiral's inward run SHALL take the supply colour and its outward run the return
colour, so that adjacent turns alternate between them. The radiator's body SHALL be filled from the supply colour at
the top to the return colour at the bottom, following `exchanger_fill`.

#### Scenario: Underfloor colours
- **WHEN** the config sets `emitter: underfloor`, the mode is `heating`, the outlet reads 35.0 °C and the return
  30.0 °C
- **THEN** the inward run has the 35.0 °C colour, the outward run the 30.0 °C colour, and both runs are animated in
  the direction of the flow

#### Scenario: Radiator without fill
- **WHEN** the config sets `emitter: radiator` and `exchanger_fill: none`, and the mode is `heating`
- **THEN** the radiator's body has no fill and its outline and pipes are drawn as with a fill
