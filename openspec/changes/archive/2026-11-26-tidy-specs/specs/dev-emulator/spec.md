# Spec Delta

## MODIFIED Requirements

### Requirement: Card width and layout controls
The emulator SHALL let the developer set the card's width (at least 320, 360, 412, 600, 800 and 1000 px) and the
`layout` option (auto, horizontal or vertical), mirrored in the URL like the other controls. It SHALL also let the
developer show the card as in a panel view (URL `panel`), so the panel fit can be checked at the window's height.

#### Scenario: Phone width
- **WHEN** a capture script opens the emulator URL with `width=360` and the heating scenario
- **THEN** the card renders 360 px wide in the vertical layout without manual input

#### Scenario: Panel view
- **WHEN** a capture script opens the emulator URL with `panel=1` and the heating scenario in a 1280 x 800 px window
- **THEN** the card renders as in a panel view, with its footer inside the window

### Requirement: Foreign naming
The emulator SHALL offer a naming control, `firmware` (default) or `foreign`, mirrored in the URL as `naming`. The
foreign naming SHALL be a mock source with other entity ids and Dutch friendly names, pressures in kPa, the
compressor speed in Hz, the compressor mode as an enum with Dutch values, the on/off state as a switch, and some
roles set to `none`, configured through `entities` and `states`.

#### Scenario: Foreign heating
- **WHEN** a capture script opens the emulator URL with `naming=foreign` and the heating scenario
- **THEN** the card shows mode "Heating", the pressures in bar, the compressor speed in Hz, and no labels for the
  roles that are not present

#### Scenario: Foreign defrost
- **WHEN** the developer picks the defrost scenario with the foreign naming
- **THEN** the card shows mode "Defrost"

#### Scenario: Foreign fallbacks
- **WHEN** the developer picks the heating with HTR recovery scenario with the foreign naming
- **THEN** the footer shows the condensation capacity as "DG1", the register COP and no HTR item, and exchanger 9
  and pump 17 are drawn without flow

## ADDED Requirements

### Requirement: Capture list for widths and layouts
The capture list SHALL include every scenario at a phone width (360 px) in the automatic layout, every scenario in
the vertical layout at 320 px, the horizontal layout at the vertical threshold, and the panel view at a desktop
window size (1280 x 800 px).

#### Scenario: Capture list entries
- **WHEN** the capture list is read
- **THEN** it holds every scenario at 360 px with `layout` auto, every scenario at 320 px with `layout` vertical,
  the horizontal layout at the vertical threshold width, and the panel view at 1280 x 800 px

### Requirement: Foreign naming leaves optional roles unbound
The foreign naming SHALL leave the optional roles (card-config) unbound, so the card shows their fallbacks, and SHALL
bind `unit.cop`, so the register COP shows as the fallback of `unit.system_cop`.

#### Scenario: Optional roles and COP
- **WHEN** a test builds the foreign naming's config
- **THEN** no optional role is bound or written, and `unit.cop` is bound
