// The emulator's two mock sources as `hass` for the editor and stub tests (firmware naming under any prefix, and
// the foreign naming).
import {
  FIRMWARE_DEVICE_ID,
  firmwareRegistry,
  foreignRegistry,
  namingStates,
  type MockRegistry,
} from '../../dev/foreign';
import { DEMO_PREFIX, SCENARIOS } from '../../dev/scenarios';
import type { HassEntityState, HassLike } from '../../src/lib/hass';

const toStates = (readings: ReturnType<typeof namingStates>): Record<string, HassEntityState> =>
  Object.fromEntries(Object.entries(readings).map(([id, reading]) => [id, { entity_id: id, ...reading }]));

const renamed = (text: string, prefix: string): string => text.replace(`.${DEMO_PREFIX}_`, `.${prefix}_`);

/** The firmware's device under another prefix (a renamed device). */
export function firmwareHass(prefix: string, deviceId = FIRMWARE_DEVICE_ID): HassLike & { registry: MockRegistry } {
  const registry = firmwareRegistry();
  const entities = Object.fromEntries(
    Object.values(registry.entities).map((entry) => {
      const id = renamed(entry.entity_id, prefix);
      return [id, { ...entry, entity_id: id, device_id: deviceId }];
    }),
  );
  const states = Object.fromEntries(
    Object.entries(toStates(namingStates('firmware', SCENARIOS.heating.states))).map(([id, state]) => {
      const next = renamed(id, prefix);
      return [next, { ...state, entity_id: next }];
    }),
  );
  return { states, entities, devices: { [deviceId]: { id: deviceId, name: 'Heat pump' } }, registry };
}

export function foreignHass(): HassLike {
  const registry = foreignRegistry();
  return {
    states: toStates(namingStates('foreign', SCENARIOS.heating.states)),
    entities: registry.entities,
    devices: registry.devices,
  };
}
