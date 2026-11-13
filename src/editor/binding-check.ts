// The binding check (add-entity-discovery D9): warns about each role bound to an entity Home Assistant does not know
// and each role bound to an entity whose unit (or kind) does not fit it. A role is bound by an `entities` value or by
// the prefix default; `none` roles have no entity. The fit is the suggestion module's own (one source of truth); an
// on/off entity on a role that accepts one is fine. Pure: the editor shows the result and changes nothing.
import { isNone, prefixOf } from '../config/options';
import { resolveEntities } from '../config/resolve';
import { ROLES } from '../config/roles';
import { valueAt, type CardConfig } from '../lib/config';
import type { HassEntityState } from '../lib/hass';
import { unitFits } from '../suggest/suggest';
import { EDITOR } from '../strings';
import { roleLabel } from './role-labels';

/** The warnings of a config against the states, in role table order; none while the states are not loaded. */
export function bindingWarnings(
  config: CardConfig,
  states: Readonly<Record<string, HassEntityState | undefined>> | undefined,
): string[] {
  if (states === undefined || Object.keys(states).length === 0) return [];
  const resolved = resolveEntities(config, prefixOf(config));
  return ROLES.flatMap((role) => {
    const entityId = resolved[role.path];
    if (entityId === undefined || isNone(valueAt(config, `entities.${role.path}`))) return [];
    const name = roleLabel(role.path);
    const state = states[entityId];
    if (state === undefined) return [EDITOR.suggest.unknown(name, entityId)];
    const domain = entityId.slice(0, entityId.indexOf('.'));
    if (!(role.accepts as readonly string[]).includes(domain)) return [EDITOR.suggest.kind(name, entityId)];
    // An unavailable entity may have lost its unit: only a state that reports one is judged.
    if (state.state === 'unavailable') return [];
    const unit = state.attributes.unit_of_measurement;
    const deviceClass = state.attributes['device_class'];
    const kind = {
      domain,
      unit: typeof unit === 'string' ? unit : undefined,
      deviceClass: typeof deviceClass === 'string' ? deviceClass : undefined,
    };
    return unitFits(role, kind) ? [] : [EDITOR.suggest.unit(name, entityId)];
  });
}
