// The entity suggestions (add-entity-discovery D8): binds a device's entities to the roles that are empty or bound to
// an entity Home Assistant does not know. Pure: it reads states, the registries and the config, and returns the new
// `entities` values and a report of role ids (the editor words them). The card never calls it (D1).
import { DIRECTION_WORDS, KEYWORDS, SETPOINT_ROLES, SETPOINT_WORDS, WEAK_OUT_WORDS } from '../config/keywords';
import { isNone, prefixOf } from '../config/options';
import { resolveEntities } from '../config/resolve';
import { ON_OFF_DOMAINS, ROLES, defaultEntityId, type RolePath, type RoleSpec } from '../config/roles';
import { valueAt, type CardConfig } from '../lib/config';
import type { HassDevice, HassEntityRegistryEntry, HassEntityState } from '../lib/hass';
import { canConvert } from '../lib/units';

/** The scores of D8. */
export const SCORE = {
  /** The firmware's entity id under the inferred prefix. */
  exact: 100,
  /** An object id ending in `_<suffix>`. */
  suffix: 90,
  subject: 30,
  role: 20,
  direction: 10,
  /** Below this a match is weak and the role stays empty. */
  strong: 40,
  /** A role whose two best candidates are this close (or closer) is left empty. */
  tie: 5,
} as const;

export interface SuggestInput {
  states: Readonly<Record<string, HassEntityState | undefined>>;
  entities: Readonly<Record<string, HassEntityRegistryEntry | undefined>>;
  devices: Readonly<Record<string, HassDevice | undefined>>;
  deviceId: string;
  config: CardConfig;
}

export interface SuggestReport {
  /** The roles this suggestion bound. */
  filled: RolePath[];
  /** The roles that took part and stayed empty (no match, a weak match or a tie). */
  empty: RolePath[];
}

export interface Suggestion {
  /** The config's `entities` with the filled roles merged in (nested like the config). */
  entities: Record<string, unknown>;
  report: SuggestReport;
}

/** An entity of the device the suggestions may bind. */
export interface Candidate {
  entityId: string;
  domain: string;
  objectId: string;
  unit: string | undefined;
  deviceClass: string | undefined;
  /** The registry entry's bare name and the state's friendly name. */
  names: string[];
}

/** Lower case, accents removed (`ß` as `ss`). */
export const fold = (text: string): string =>
  text.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replaceAll('ß', 'ss');

/** The words of a text: folded, split on anything that is not a letter (digits are dropped). */
export const tokens = (text: string): string[] =>
  fold(text)
    .split(/[^a-z]+/)
    .filter((token) => token !== '');

const splitId = (entityId: string): [domain: string, objectId: string] => {
  const dot = entityId.indexOf('.');
  return [entityId.slice(0, dot), entityId.slice(dot + 1)];
};

/** Step 1: the registry entries of the device whose state exists. */
export function deviceCandidates(
  states: SuggestInput['states'],
  entities: SuggestInput['entities'],
  devices: SuggestInput['devices'],
  deviceId: string,
): Candidate[] {
  const deviceName = devices[deviceId]?.name_by_user ?? devices[deviceId]?.name ?? '';
  return Object.values(entities)
    .filter((entry): entry is HassEntityRegistryEntry => entry?.device_id === deviceId)
    .flatMap((entry) => {
      const state = states[entry.entity_id];
      if (state === undefined) return [];
      const [domain, objectId] = splitId(entry.entity_id);
      const friendly = state.attributes.friendly_name;
      const unit = state.attributes.unit_of_measurement;
      const deviceClass = state.attributes['device_class'];
      return [
        {
          entityId: entry.entity_id,
          domain,
          objectId,
          unit: typeof unit === 'string' ? unit : undefined,
          deviceClass: typeof deviceClass === 'string' ? deviceClass : undefined,
          names: [
            ...(typeof friendly === 'string' ? [stripDeviceName(friendly, deviceName)] : []),
            ...(typeof entry.name === 'string' ? [entry.name] : []),
          ],
        },
      ];
    });
}

/** Removes the device name from the start of a friendly name (Home Assistant builds `<device> <name>`). */
function stripDeviceName(friendly: string, deviceName: string): string {
  const name = fold(deviceName).trim();
  const text = fold(friendly);
  if (name === '' || !text.startsWith(name)) return friendly;
  const rest = text.slice(name.length);
  return rest === '' || /^[^a-z0-9]/.test(rest) ? rest : friendly;
}

/** Step 2: the longest common start of the object ids, cut after the last `_` (empty when none). */
export function inferPrefix(objectIds: readonly string[]): string {
  const [first, ...others] = objectIds;
  if (first === undefined) return '';
  let common = first;
  for (const id of others) {
    let i = 0;
    while (i < common.length && i < id.length && common[i] === id[i]) i++;
    common = common.slice(0, i);
  }
  const cut = common.lastIndexOf('_');
  return cut < 0 ? '' : common.slice(0, cut + 1);
}

/**
 * Step 2 (D8): the prefix by role vote. Each role votes once for the `x` of every candidate whose id is
 * `<role.domain>.<x>_<role.suffix>`; the `x` with most roles wins (ties: the longer, then the alphabetically first).
 * Without a vote, the longest common start of the object ids. Returned with its trailing `_`, or empty.
 */
export function votePrefix(candidates: readonly Candidate[]): string {
  const votes = new Map<string, number>();
  for (const role of ROLES) {
    const found = new Set<string>();
    for (const candidate of candidates) {
      const tail = `_${role.suffix}`;
      if (
        candidate.domain === role.domain &&
        candidate.objectId.length > tail.length &&
        candidate.objectId.endsWith(tail)
      )
        found.add(candidate.objectId.slice(0, -tail.length));
    }
    for (const x of found) votes.set(x, (votes.get(x) ?? 0) + 1);
  }
  const [winner] = [...votes].sort(
    ([a, countA], [b, countB]) => countB - countA || b.length - a.length || (a < b ? -1 : 1),
  );
  return winner === undefined ? inferPrefix(candidates.map((candidate) => candidate.objectId)) : `${winner[0]}_`;
}

const unitKey = (unit: string | undefined): string => (unit ?? '').trim().toLowerCase();

/** Units a number role takes beyond its convertible ones (D6): speed in rpm or Hz, pumps and the fan in % or rpm. */
const OTHER_UNITS: Partial<Record<RolePath, readonly string[]>> = {
  'compressor.speed': ['rpm', 'hz'],
  'production.pump': ['%', 'rpm'],
  'brine.pump': ['%', 'rpm'],
  'source.fan_speed': ['%', 'rpm'],
};

/** The `device_class` values a quantity's role can come from. */
const CLASSES: Readonly<Record<string, readonly string[]>> = {
  temperature: ['temperature'],
  difference: ['temperature'],
  power: ['power'],
  pressure: ['pressure', 'atmospheric_pressure'],
};

/** The parts of an entity the fit check reads: its domain, unit and device class. */
export type Kind = Pick<Candidate, 'domain' | 'unit' | 'deviceClass'>;

/** The unit (and device class) half of the fit, for an entity whose domain the role accepts. */
export function unitFits(role: RoleSpec, candidate: Kind): boolean {
  if (ON_OFF_DOMAINS.includes(candidate.domain)) return true;
  if (role.kind !== 'number') {
    // A measurement (a unit or a numeric device class) is not a mode or a flag (an hours counter, a signal strength).
    return unitKey(candidate.unit) === '' && (candidate.deviceClass === undefined || candidate.deviceClass === 'enum');
  }
  if ('quantity' in role && role.quantity !== undefined) {
    if (!canConvert(role.quantity, candidate.unit)) return false;
    const classes = CLASSES[role.quantity];
    return candidate.deviceClass === undefined || classes === undefined || classes.includes(candidate.deviceClass);
  }
  const unit = unitKey(candidate.unit);
  const units =
    OTHER_UNITS[role.path as RolePath] ?? ('unit' in role && role.unit !== undefined ? [unitKey(role.unit)] : []);
  return units.length === 0 ? unit === '' : units.includes(unit);
}

/** Step 3: does the candidate fit the role by domain, unit and device class? */
export function fits(role: RoleSpec, candidate: Kind): boolean {
  return role.accepts.includes(candidate.domain) && unitFits(role, candidate);
}

/** A keyword of four or more letters hits inside a token, a shorter one only as a whole token. */
const hits = (words: readonly string[], found: readonly string[]): boolean =>
  words.some((word) => found.some((token) => (word.length >= 4 ? token.includes(word) : token === word)));

/** The score of an exact entity id or a suffix match; 0 when the candidate has neither. */
function nameScore(role: RoleSpec, candidate: Candidate, prefix: string): number {
  const exact = candidate.entityId === defaultEntityId(role, prefix.replace(/_$/, ''));
  if (exact && prefix !== '') return SCORE.exact;
  const suffixDomain = role.kind !== 'binary' || ON_OFF_DOMAINS.includes(candidate.domain);
  if (suffixDomain && (candidate.objectId === role.suffix || candidate.objectId.endsWith(`_${role.suffix}`)))
    return SCORE.suffix;
  return 0;
}

/** The direction part of the score; undefined when a paired role has no direction word of its own. */
function directionScore(role: RoleSpec, found: readonly string[]): number | undefined {
  if (role.direction === undefined) return 0;
  // A paired role needs a direction word of its own; a candidate with only the opposite one has none.
  const weakOut = role.direction === 'out' && hits(WEAK_OUT_WORDS, found) && !hits(DIRECTION_WORDS.in, found);
  if (!weakOut && !hits(DIRECTION_WORDS[role.direction], found)) return undefined;
  return SCORE.direction;
}

/** Step 4: the score of a candidate for a role; 0 when it does not match or is excluded. */
export function score(role: RoleSpec, candidate: Candidate, prefix: string): number {
  const byName = nameScore(role, candidate, prefix);
  if (byName > 0) return byName;
  const found = [
    ...tokens(candidate.objectId.startsWith(prefix) ? candidate.objectId.slice(prefix.length) : candidate.objectId),
    ...candidate.names.flatMap(tokens),
  ];
  const isSetpoint = hits(SETPOINT_WORDS, found);
  if (isSetpoint !== SETPOINT_ROLES.has(role.path as RolePath)) return 0;
  const keywords = KEYWORDS[role.path as RolePath];
  if (keywords.exclude !== undefined && hits(keywords.exclude, found)) return 0;
  let total = 0;
  if (hits(keywords.subject, found)) total += SCORE.subject;
  if (hits(keywords.role, found)) total += SCORE.role;
  const direction = directionScore(role, found);
  return direction === undefined ? 0 : total + direction;
}

/** The entities map as a nested copy, so the result never shares objects with the config. */
function cloneGroup(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value).map(([key, inner]) => [
      key,
      typeof inner === 'object' && inner !== null && !Array.isArray(inner) ? cloneGroup(inner) : inner,
    ]),
  );
}

/** Step 6: the roles that are open (empty, or bound to an unknown entity) and the entities the kept bindings use. */
function openRoles(config: CardConfig, states: SuggestInput['states']): { open: RoleSpec[]; used: Set<string> } {
  const resolved = resolveEntities(config, prefixOf(config));
  const used = new Set<string>();
  const open: RoleSpec[] = [];
  for (const role of ROLES) {
    if (isNone(valueAt(config, `entities.${role.path}`))) continue;
    // A role whose resolved entity (override or prefix default) is known is bound: it keeps it.
    const bound = resolved[role.path];
    if (bound !== undefined && states[bound] !== undefined) used.add(bound);
    else open.push(role);
  }
  return { open, used };
}

/** A candidate scored for an open role; `order` is the role's place among the open roles. */
interface ScoredPair {
  role: RoleSpec;
  order: number;
  candidate: Candidate;
  score: number;
}

/** The scored (role, candidate) pairs of the open roles, strongest first, then by role order and entity id. */
function rankedPairs(
  open: readonly RoleSpec[],
  candidates: readonly Candidate[],
  used: ReadonlySet<string>,
  prefix: string,
): ScoredPair[] {
  return open
    .flatMap((role, order) =>
      candidates
        .filter((candidate) => !used.has(candidate.entityId) && fits(role, candidate))
        .map((candidate) => ({ role, order, candidate, score: score(role, candidate, prefix) })),
    )
    .filter((pair) => pair.score > 0)
    .sort((a, b) => b.score - a.score || a.order - b.order || (a.candidate.entityId < b.candidate.entityId ? -1 : 1));
}

/** Step 5: strongest pair first; a role whose two best unused candidates are close stays empty. Adds to `used`. */
function takePairs(pairs: readonly ScoredPair[], used: Set<string>): Map<RolePath, string> {
  const taken = new Map<RolePath, string>();
  const closed = new Set<RolePath>();
  for (const pair of pairs) {
    const path = pair.role.path as RolePath;
    if (pair.score < SCORE.strong) break;
    if (taken.has(path) || closed.has(path) || used.has(pair.candidate.entityId)) continue;
    const [best, second] = pairs.filter((other) => other.role === pair.role && !used.has(other.candidate.entityId));
    if (best !== undefined && second !== undefined && best.score - second.score <= SCORE.tie) {
      closed.add(path);
      continue;
    }
    taken.set(path, pair.candidate.entityId);
    used.add(pair.candidate.entityId);
  }
  return taken;
}

/** The config's entities map, copied, with the taken entity ids written in. */
function entitiesWith(config: CardConfig, taken: ReadonlyMap<RolePath, string>): Record<string, unknown> {
  const entities = cloneGroup(valueAt(config, 'entities'));
  for (const [path, entityId] of taken) {
    const [group = '', name = ''] = path.split('.');
    const inner = entities[group];
    const target = typeof inner === 'object' && inner !== null ? (inner as Record<string, unknown>) : {};
    target[name] = entityId;
    entities[group] = target;
  }
  return entities;
}

/** Binds the device's entities to the open roles (D8 steps 1 to 6). */
export function suggestEntities(input: SuggestInput): Suggestion {
  const { states, config } = input;
  const candidates = deviceCandidates(states, input.entities, input.devices, input.deviceId);
  const prefix = votePrefix(candidates);
  const { open, used } = openRoles(config, states);
  const taken = takePairs(rankedPairs(open, candidates, used, prefix), used);
  const entities = entitiesWith(config, taken);
  const filled = open.map((role) => role.path as RolePath).filter((path) => taken.has(path));
  return {
    entities,
    report: { filled, empty: open.map((role) => role.path as RolePath).filter((path) => !taken.has(path)) },
  };
}
