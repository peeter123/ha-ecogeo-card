# Spec Delta

## MODIFIED Requirements

### Requirement: Flow animation
Active segments SHALL show a dash animation in the direction of flow. Its speed SHALL follow:
- the production pump % on production segments, including those through exchanger 10
- the brine pump % on brine segments, including those through exchanger 10
- the compressor % on refrigerant segments
- a fixed medium speed on HTR water segments, since pump 17 reports no speed
A pump that runs without a percentage (its entity reads on, or reports a speed in another unit above 0, such as
rpm) SHALL animate its segments at the same fixed medium speed. At 0 %, at off, or with an unknown speed, a segment
with a speed role SHALL be still.

#### Scenario: Faster pump
- **WHEN** the brine pump goes from 50 % to 100 %
- **THEN** the brine segments animate faster

#### Scenario: HTR without a speed
- **WHEN** the HTR circuit is active
- **THEN** its water segments animate at the fixed speed

#### Scenario: Pump on without a percentage
- **WHEN** the production circuit is active and the production pump entity is a binary sensor that reads `on`, or
  reports 2400 rpm
- **THEN** the production segments animate at the fixed medium speed
