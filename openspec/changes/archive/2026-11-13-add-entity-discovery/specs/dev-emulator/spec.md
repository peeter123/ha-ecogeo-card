# Spec Delta

## ADDED Requirements

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

### Requirement: Foreign naming in the capture list
The capture list SHALL include the foreign naming in the heating, DHW, defrost and off scenarios, and in the heating
scenario at a phone width (360 px).

#### Scenario: Captures
- **WHEN** a capture script runs the capture list
- **THEN** it captures the four foreign scenarios and the foreign heating scenario at 360 px
