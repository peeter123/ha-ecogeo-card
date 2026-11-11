# Proposal

Status: stub. Only this proposal exists; complete the planning (`/opsx:explore`, then `/opsx:propose` or the
remaining artifacts) before `/opsx:apply`.

## Why

The card finds its entities from a text prefix (`<domain>.<prefix>_<suffix>`, firmware-entity naming). That breaks
as soon as a user renames the ESPHome device or an entity, and it asks users to know their object ids. Picking the
heat pump's device in the editor, and letting the card find each role's entity from that device, removes both
problems.

## What Changes

- A new option `device` (a Home Assistant device id). When set, each role without an override resolves to the
  device's entity that the firmware created for that role, found through the entity registry by the firmware's
  stable unique id or original object id, whatever the entity has been renamed to (firmware-entity).
- The prefix stays as a fallback and for YAML users; an explicit `entities` override still wins.
- The editor's Entities section offers a device picker filtered to the ESPHome integration, above the prefix.

## Capabilities

### New Capabilities

(none expected)

### Modified Capabilities

- `card-config`: the `device` option and the resolution order device -> prefix -> override.
- `card-editor`: the device picker.

## Open questions (to settle before planning further)

- What the firmware's unique ids look like per role, and whether they are stable across firmware versions (check
  esphome-ecoforest-ecogeo and a live entity registry entry).
- How the card reads the entity registry: `hass.entities` gives `device_id` and the entity id, but not the unique
  id; the original object id or a WebSocket registry call may be needed.
- Whether the prefix should be inferred from the device instead (simpler, but still breaks on renamed entities).

## Out of scope

- Detecting the model, variant, source or DHW storage from the device (needs firmware registers, for example
  source type 5143, Registers.csv; firmware change in esphome-ecoforest-ecogeo).

## Impact

- Code: `src/config/resolve.ts`, `src/card/ecogeo-card.ts` (registry-driven resolution), the editor.
- Depends on `add-card-editor` being archived.
- Live installation: a release and `?v=` bump; the live view may switch from prefix to device.
