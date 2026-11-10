// Test helpers: readings with only the given roles set, and a states map.
import type { Readings } from '../src/calc/readings';
import { ROLE_PATHS } from '../src/config/roles';
import type { HassEntityState } from '../src/lib/hass';

/** Readings with every role without a value, except the ones given. */
export function readings(values: Partial<Record<keyof Readings, number | string | boolean>> = {}): Readings {
  return {
    ...Object.fromEntries(ROLE_PATHS.map((role) => [role, undefined])),
    ...values,
  } as unknown as Readings;
}

/** A state object. */
export function state(entityId: string, value: string, unit?: string): HassEntityState {
  return { entity_id: entityId, state: value, attributes: unit === undefined ? {} : { unit_of_measurement: unit } };
}

/** A states map from [entity id, state, unit] entries. */
export function states(...entries: readonly (readonly [string, string, string?])[]): Record<string, HassEntityState> {
  return Object.fromEntries(entries.map(([id, value, unit]) => [id, state(id, value, unit)]));
}
