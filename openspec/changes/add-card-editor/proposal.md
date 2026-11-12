# Proposal

## Why

The card is configured only in YAML: model, variant, source, DHW storage, features, prefix, per-role entity
overrides and, after the previous changes, colours, detail, exchanger fill and layout. Every adjustment means
editing the dashboard's YAML by hand. The hrv-ventilation cards have a visual editor built on Home Assistant's own
`ha-form`, with collapsible sections and an "Advanced settings" switch; this card needs the same, so that it can be
added and tuned from the dashboard UI and, later, published for others.

## What Changes

- `getConfigElement()` returns a visual editor, `ecogeo-card-editor`, built from hrv-ventilation's editor (copied,
  not imported, with headers naming the source files).
- Sections, in order:
  - **Unit:** model, variant, outer-loop source, DHW storage.
  - **Entities:** the entity prefix.
  - **Features:** passive cooling, active cooling, HTR, backup heater, each `true`, `false` or `unused`, empty
    meaning the variant's default.
  - **Appearance:** detail level, exchanger fill, layout, and the colour stops (temperature and colour per row).
  - **Advanced (behind the switch):** one entity picker per role, grouped like the role table (production, brine,
    compressor, refrigerant, heating, cooling, DHW, source, unit), each filtered to the role's domain.
- The editor writes only what the user set: defaults are not written, a cleared field removes its key, keys the
  editor does not show are kept.
- `getStubConfig()` keeps the card picker's sample-value preview.
- The editor is read-only towards Home Assistant like the card: it changes only the card config.
- Docs and README updated; release, deploy and resource bump.

## Capabilities

### New Capabilities

- `card-editor`: the visual editor: its sections and fields, how it maps to the YAML config, what it writes and
  keeps, the advanced switch, and the colour stop rows.

### Modified Capabilities

Added after the live check of group 3 (the user found that on model C, `dhw: none` also removed HTR, while a
model C always has its tank, which may only be unused): `dhw` gains the value `unused` (the model's tank drawn
muted, no tank values, HTR following its own feature, no DHW circuit active), and `dhw: none` becomes a
configuration error on model C.

- `card-config`: `dhw` accepts `unused`; `none` is rejected on model C.
- `dhw-storage`: the unused tank.
- `operating-mode`: no DHW circuit or HTR recovery with an unused tank.
- `live-values`: no tank values for an unused tank.
- `dev-emulator`: the DHW storage control offers `unused`.

## Out of scope

- Finding the entities by picking the ESPHome device: `add-entity-discovery` (until then the prefix and the
  advanced pickers).
- Browser tests of the editor inside a real Home Assistant: `add-browser-tests`; this change tests the editor with
  a stand-in `ha-form` (as hrv does) and checks it once on the live installation.
- Translations: the editor's strings are English, in `src/strings.ts`, as the card's are.

## Impact

- Code: new `src/editor/` (editor element, schema, fields, copied from hrv-ventilation's `src/editor/`),
  `src/card/ecogeo-card.ts` (`getConfigElement`, `getStubConfig`), `src/strings.ts` (editor labels), tests with a
  stub `ha-form`.
- Depends on `add-compact-layout` and `refine-schematic-drawing` being archived (the Appearance fields expose their
  options).
- Live installation: yes. Release, deploy, `?v=` bump; the existing view's config must open in the editor and
  survive a save without changes.
