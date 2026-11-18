## MODIFIED Requirements

### Requirement: Scenario presets
The emulator SHALL offer these scenarios, each a complete set of states:
- off
- standby
- heating
- heating with HTR recovery
- DHW
- active cooling (all heat to the outer loop)
- active cooling with HTR recovery
- passive cooling
- defrost
- alarm while heating
- bridge offline
- sensors unavailable
Choosing a scenario SHALL update the card at once.

#### Scenario: DHW scenario
- **WHEN** the developer picks the DHW scenario
- **THEN** the card shows mode "DHW", valve 26 towards connections 5/6, and an active DHW loop

#### Scenario: HTR scenario
- **WHEN** the developer picks the active cooling with HTR recovery scenario
- **THEN** the card shows mode "Active cooling", valve 14 reversed, valve 26 towards connections 1/2, and an
  active HTR circuit and DHW loop

#### Scenario: Heating with HTR scenario
- **WHEN** the developer picks the heating with HTR recovery scenario
- **THEN** the card shows mode "Heating", valve 26 towards connections 1/2, an active DG1 production circuit, an
  active HTR circuit and DHW loop, and a footer with a DG1 and an HTR power

#### Scenario: Defrost scenario
- **WHEN** the developer picks the defrost scenario
- **THEN** the card shows mode "Defrost", valves 27/28 towards exchanger 10, a muted refrigerant circuit and an
  active outer loop

#### Scenario: Unavailable scenario
- **WHEN** the developer picks the unavailable scenario
- **THEN** the card shows muted dashes for the unavailable values and no error

#### Scenario: Offline scenario
- **WHEN** the developer picks the bridge offline scenario
- **THEN** the card shows the offline indication and mode "Standby"

### Requirement: Foreign naming
The emulator SHALL offer a naming control, `firmware` (default) or `foreign`, mirrored in the URL as `naming`. The
foreign naming SHALL be a mock source with other entity ids and Dutch friendly names, pressures in kPa, the
compressor speed in Hz, the compressor mode as an enum with Dutch values, the on/off state as a switch, and some
roles set to `none`, configured through `entities` and `states`. It SHALL leave the optional roles (card-config)
unbound, so the card shows their fallbacks, and SHALL bind `unit.cop`, so the register COP shows as the fallback of
`unit.system_cop`.

#### Scenario: Foreign heating
- **WHEN** a capture script opens the emulator URL with `naming=foreign` and the heating scenario
- **THEN** the card shows mode "Heating", the pressures in bar, the compressor speed in Hz, and no labels for the
  roles that are not present

#### Scenario: Foreign defrost
- **WHEN** the developer picks the defrost scenario with the foreign naming
- **THEN** the card shows mode "Defrost"

#### Scenario: Foreign fallbacks
- **WHEN** the developer picks the heating with HTR recovery scenario with the foreign naming, in the full layout
- **THEN** the footer shows the condensation capacity as "DG1", the register COP and no HTR item, and exchanger 9
  and pump 17 are drawn without flow

### Requirement: Foreign naming in the capture list
The capture list SHALL include the foreign naming in the heating, heating with HTR recovery, DHW, defrost and off
scenarios, and in the heating scenario at a phone width (360 px).

#### Scenario: Captures
- **WHEN** a capture script runs the capture list
- **THEN** it captures the five foreign scenarios and the foreign heating scenario at 360 px
