## MODIFIED Requirements

### Requirement: Coil loop active in DHW mode or with HTR recovery
The pipes between connections 5/6 and the coil, and the coil itself, SHALL be coloured and animated when the mode
is `dhw` or the HTR circuit is active (see operating-mode), with `dhw` `external` or `internal`, and muted
otherwise (an unused tank stays muted in every mode). On model C, which has no connections 5/6, coil 51 is a
symbol: it takes the colour of the water feeding it (the production outlet in DHW mode, the DHW temperature during
HTR recovery) and is never animated.

#### Scenario: Heating mode
- **WHEN** the mode is `heating` and the HTR circuit is not active
- **THEN** the DHW loop pipes and coil are muted, and the tank still shows its temperature colour and values

#### Scenario: HTR recovery
- **WHEN** the mode is `active_cooling` and the HTR circuit is active
- **THEN** the DHW loop pipes and coil are coloured and animated, and valve 26 still points to ports 1/2

#### Scenario: HTR recovery while heating
- **WHEN** the mode is `heating`, `dhw` is `external` and the HTR circuit is active
- **THEN** the DHW loop pipes and coil are coloured with the DHW temperature and animated, and valve 26 still points
  to ports 1/2
