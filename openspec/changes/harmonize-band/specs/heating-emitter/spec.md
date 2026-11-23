## MODIFIED Requirements

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

## REMOVED Requirements

### Requirement: DG1 demand on the emitter
**Reason**: The "Demand" caption cluttered the band (decided by the user 2026-11-23). The DG1 demand stays visible
through the DG1 production circuit's colouring and animation, and tapping the emitter still opens the DG1 demand's
more-info (component-info "Tap the emitter").
**Migration**: None in the config: the `heating.demand` role stays configurable and keeps its more-info; it no longer
shows a label, neither in the emitter nor beside the stubs of connections 1 and 2.
