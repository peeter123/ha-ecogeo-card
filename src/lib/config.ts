// Copied from hrv-ventilation src/lib/config.ts: valueAt, asEntityId and entityAt only (the humidity and stream
// helpers are dropped). Deviation: hrv defines its own `RolePath` union there; this copy leaves it out and the card
// uses `RolePath` from config/roles.
// Config reading shared by the card: roles are config paths such as "production.outlet_temperature".

/** A card config as it comes from YAML or the editor: nested objects with entity IDs as strings. */
export type CardConfig = Readonly<Record<string, unknown>>;

// The shape of a Home Assistant entity ID: a domain starting with a letter, a dot, an object ID (lowercase letters,
// digits, underscores). The leading letter keeps numbers written as strings ("1.2") out.
const ENTITY_ID = /^[a-z][a-z0-9_]*\.[a-z0-9_]+$/;

/** The value at a dotted path such as "production.pump", or undefined when any part of the path is missing. */
export function valueAt(config: CardConfig, path: string): unknown {
  let value: unknown = config;
  for (const key of path.split('.')) {
    if (typeof value !== 'object' || value === null || !Object.hasOwn(value, key)) return undefined;
    value = (value as Record<string, unknown>)[key];
  }
  return value;
}

/** The value as an entity ID, trimmed, or undefined when it is not a string shaped like an entity ID. */
export function asEntityId(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const id = value.trim();
  return ENTITY_ID.test(id) ? id : undefined;
}

/**
 * The entity ID configured for the role at `path`, trimmed, or undefined when the role is not set or does not hold
 * something shaped like an entity ID. The card reads entities through this, so what the check accepts is what it uses.
 */
export function entityAt(config: CardConfig, path: string): string | undefined {
  return asEntityId(valueAt(config, path));
}
