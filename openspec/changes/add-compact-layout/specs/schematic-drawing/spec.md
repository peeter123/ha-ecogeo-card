# Spec Delta

## MODIFIED Requirements

### Requirement: Cabinet with top connections
The card SHALL draw the cabinet as a rectangle with its six hydraulic connections on the top edge, left to right
in the manual's order:
- 1 production outlet and 2 production return, labelled as the heating circuit (DG1).
- 3 brine outlet and 4 brine inlet, labelled as the outer loop.
- 5 and 6, labelled as DHW.
Each connection SHALL show its item number with `detail: full`, and SHALL NOT show it with `detail: simplified`.
In the compact layout (responsive-layout) the connection labels (DG1, outer loop, DHW) SHALL NOT be drawn.

#### Scenario: Port order
- **WHEN** the card renders model B with `dhw: external` in the full layout
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

### Requirement: Detail level
The card SHALL draw the schematic at the level of detail set by the `detail` option: `simplified` (the default)
or `full`. Simplified SHALL leave out the service and safety parts that have no live value and SHALL show no item
numbers; full SHALL draw every part of the manual figure with its item number. In the compact layout
(responsive-layout) the card SHALL draw the simplified level whatever `detail` says.

#### Scenario: Default is simplified
- **WHEN** the config sets no `detail`
- **THEN** no item number is shown anywhere on the drawing, and the safety valves 20/21 are not drawn

#### Scenario: Full detail
- **WHEN** the config sets `detail: full` and the card shows the full layout
- **THEN** the drawing shows the same parts and item numbers as before this option existed
