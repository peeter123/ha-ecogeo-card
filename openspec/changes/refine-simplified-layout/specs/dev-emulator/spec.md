## MODIFIED Requirements

### Requirement: Card width and layout controls
The emulator SHALL let the developer set the card's width (at least 320, 360, 412, 600, 800 and 1000 px) and the
`layout` option (auto, full or compact), mirrored in the URL like the other controls. It SHALL also let the
developer show the card as in a panel view (URL `panel`), so the panel fit can be checked at the window's height.
The capture list SHALL include every scenario at a phone width (360 px) in the automatic layout, the full layout at
the compact threshold, and the panel view at a desktop window size (1280 x 800 px).

#### Scenario: Phone width
- **WHEN** a capture script opens the emulator URL with `width=360` and the heating scenario
- **THEN** the card renders 360 px wide in the compact layout without manual input

#### Scenario: Panel view
- **WHEN** a capture script opens the emulator URL with `panel=1` and the heating scenario in a 1280 x 800 px window
- **THEN** the card renders as in a panel view, with its footer inside the window
