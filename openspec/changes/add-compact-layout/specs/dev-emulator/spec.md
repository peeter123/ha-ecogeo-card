# Spec Delta

## ADDED Requirements

### Requirement: Card width and layout controls
The emulator SHALL let the developer set the card's width (at least 320, 360, 412, 600, 800 and 1000 px) and the
`layout` option (auto, full or compact), mirrored in the URL like the other controls. The capture list SHALL
include every scenario at a phone width (360 px) in the automatic layout, and the full layout at the compact
threshold.

#### Scenario: Phone width
- **WHEN** a capture script opens the emulator URL with `width=360` and the heating scenario
- **THEN** the card renders 360 px wide in the compact layout without manual input
