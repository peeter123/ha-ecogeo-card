// The stub config of the card picker (add-entity-discovery D10): the prefix of the one device that carries the
// firmware's entity names, or nothing. Runs D8's steps 1 and 2 over every device and counts the roles whose exact
// firmware id `<domain>.<prefix>_<suffix>` exists. Used by `getStubConfig(hass)` only; the card never reads devices.
import { ROLES, defaultEntityId } from '../config/roles';
import type { CardConfig } from '../lib/config';
import type { HassEntityRegistryEntry, HassLike } from '../lib/hass';
import { deviceCandidates, votePrefix } from './suggest';

/** The prefix of the device when at least half of the roles exist under it with their firmware ids, else undefined. */
function firmwarePrefix(hass: HassLike, entities: Readonly<Record<string, HassEntityRegistryEntry>>, deviceId: string) {
  const candidates = deviceCandidates(hass.states, entities, hass.devices ?? {}, deviceId);
  const prefix = votePrefix(candidates).replace(/_$/, '');
  if (prefix === '') return undefined;
  const ids = new Set(candidates.map((candidate) => candidate.entityId));
  const found = ROLES.filter((role) => ids.has(defaultEntityId(role, prefix))).length;
  return found * 2 >= ROLES.length ? prefix : undefined;
}

/** `{ prefix }` when exactly one device carries the firmware naming, `{}` otherwise (also without `hass`). */
export function stubConfig(hass: HassLike | undefined): CardConfig {
  if (hass === undefined) return {};
  // The registry entries by device, grouped once.
  const byDevice = new Map<string, Record<string, HassEntityRegistryEntry>>();
  for (const entry of Object.values((hass.entities ?? {}) as Readonly<Record<string, HassEntityRegistryEntry>>)) {
    if (typeof entry.device_id !== 'string') continue;
    const group = byDevice.get(entry.device_id) ?? {};
    group[entry.entity_id] = entry;
    byDevice.set(entry.device_id, group);
  }
  const prefixes = [...byDevice].flatMap(([id, entries]) => firmwarePrefix(hass, entries, id) ?? []);
  return prefixes.length === 1 ? { prefix: prefixes[0] } : {};
}
