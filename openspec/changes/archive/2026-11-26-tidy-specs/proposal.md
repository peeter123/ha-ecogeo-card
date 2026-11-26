# Proposal

## Why

The accepted specs no longer pass `openspec validate --specs --strict`: 9 of the 13 fail on 16 requirements whose
description is over 500 characters. One requirement also says something the card no longer does, and the README
names a follow-up change that is already done. The card is stable at 1.1.1, so this is the moment to fix the record
before the HACS default-list submission.

## What Changes

- **Long requirements split.** Each of the 16 requirements keeps its name and all its scenarios. Its description is
  cut down to one behaviour without changing its meaning. Every behaviour taken out becomes its own requirement in the
  same spec, with its own scenarios. Examples move from the description into scenarios.
  - card-config: "Card type and options", "Variant presets".
  - card-editor: "Editor sections".
  - component-info: "Component name on hover", "Tap a component".
  - dev-emulator: "Card width and layout controls", "Foreign naming".
  - live-values: "Locale and precision".
  - operating-mode: "Active circuits follow the mode".
  - responsive-layout: "Panel view fits the screen", "Vertical threshold".
  - schematic-drawing: "Refrigerant components after the manual figure", "Hydraulic components after the manual
    figure", "Cabinet layout with value lanes".
  - temperature-coloring: "Water segment temperatures", "Flow animation".
  - The exact list is whatever `openspec validate --specs --strict` reports when the change starts; the design (D1)
    says how the requirements are matched to its output.
- **Tap a component corrected.** component-info says that a component opens the entity its value label shows. Since
  `rework-layouts` that is not true for exchangers 7 and 8, and it never was for DHW valve 26. Evaporator 7 opens the
  evaporating temperature, condenser 8 the condensing temperature and valve 26 the DHW demand (derived:
  `COMPONENT_ROLES` in `src/diagram/component-info.ts`). No value label shows these three; 7 and 8 colour the
  refrigerant pipes (`src/diagram/geometry.ts`). The requirement is reworded to state this. The behaviour stays as
  it is.
- **Values in the lanes corrected.** schematic-drawing "Cabinet layout with value lanes" puts every cabinet value in
  a lane, but on model C the DHW temperature sits inside tank 50, as dhw-storage "DHW values inside the tank"
  requires (`BODY_LABELS` in `dev/overlaps.ts`; `test/diagram/lanes.test.ts` leaves body values out). The split-off
  "Values in the lanes" names that exception. The behaviour stays as it is.
- **README status.** The Status section still names `add-browser-tests` as the planned follow-up, but the browser
  tests already exist (`npm run test:browser`, the browser project in `test/`). The sentence is removed, and the
  status names what is next instead: the HACS default list.

## Out of scope

- Any code or behaviour change. The card and `dist/` stay as they are; tests change only in comments that cite a
  requirement whose rule moved.
- A version bump, a CHANGELOG entry or a release: the shipped card does not change.
- Submitting the card to the HACS default list: the later change named in `add-hacs-release`.
- Requirements of 500 characters or fewer, even long ones; and requirements in the four specs that pass.
- Rewording that does not shorten a requirement or correct it.
- Comments in `src/` that cite a requirement whose rule moved (`src/calc/display.ts`, the `COMPONENT_ROLES` doc
  comment), and the lanes section of `docs/ecogeo-card.md`, which cites "Cabinet layout with value lanes" for where
  the values sit: the code change that follows, `limit-complexity`, touches `src/` and updates them.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `card-config`: two long requirements split.
- `card-editor`: one long requirement split.
- `component-info`: two long requirements split; "Tap a component" corrected for exchangers 7 and 8 and valve 26.
- `dev-emulator`: two long requirements split.
- `live-values`: one long requirement split.
- `operating-mode`: one long requirement split.
- `responsive-layout`: two long requirements split.
- `schematic-drawing`: three long requirements split.
- `temperature-coloring`: two long requirements split.

## Impact

- Specs: the nine delta specs above; after archive, `openspec validate --specs --strict` passes for all 13 specs.
- Docs: `README.md` (Status section) and `AGENTS.md` (the archived change, at archive).
- Code and `dist/`: none. Tests: five comments that cite a split requirement.
- Live installation: none. No deploy, no resource bump, no dashboard change.
