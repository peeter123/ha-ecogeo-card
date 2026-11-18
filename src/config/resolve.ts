// Config to ResolvedConfig (add-schematic-card D2, D3): the options with their defaults, the features (preset merged with the
// overrides), the entity id of every role and the sample flag. Pure; call after options.configErrors found no problem.
import { stopsOf, type ColorStop } from '../diagram/colors';
import { entityAt, type CardConfig } from '../lib/config';
import {
  detailOf,
  exchangerFillOf,
  featureOverrides,
  installationOf,
  layoutOf,
  notPresentRoles,
  prefixOf,
  setsAnyEntity,
  statesOf,
  variantOf,
  type Detail,
  type ExchangerFill,
  type Layout,
  type DhwStorage,
  type Model,
  type Source,
} from './options';
import type { StateLists } from './states';
import { defaultEntityId, ROLES, type RolePath } from './roles';
import { SAMPLE_ENTITIES } from './sample';
import { mergeFeatures, type Features, type Variant } from './variants';

export interface ResolvedConfig {
  model: Model;
  variant: Variant;
  source: Source;
  dhw: DhwStorage;
  /** The level of detail: `simplified` leaves out the service and safety parts and the item numbers. */
  detail: Detail;
  /** How the plate exchangers are filled: a `gradient` per side from the pipes' colours, or `none`. */
  exchangerFill: ExchangerFill;
  /** The `layout` option: `auto` follows the card's width, `full` and `compact` force one. */
  layout: Layout;
  prefix: string | undefined;
  features: Features;
  /** The entity id of each role, or undefined when the role has no entity (no override and no prefix). */
  entities: Readonly<Record<RolePath, string | undefined>>;
  /** The roles set to `none` in `entities`: not present, so no label or footer item (a role with no entity shows a dash). */
  notPresent: ReadonlySet<RolePath>;
  /**
   * The roles whose entity is the prefix default (not set in `entities`, not `none`): the ones an optional role
   * without a known entity falls back from (add-htr-state D3). Empty in sample mode.
   */
  defaulted: ReadonlySet<RolePath>;
  /** The state values that mean off and defrost (the `states` option). */
  states: StateLists;
  /** The temperature colour stops: the `colors` option or the default scale. */
  colors: readonly ColorStop[];
  /** True when the config sets neither a prefix nor an entity: the roles are the sample entities. */
  sample: boolean;
}

/**
 * The entity id of every role: an explicit `entities` override, then `<domain>.<prefix>_<suffix>` when a prefix is
 * set and the role is not `none`, then nothing.
 */
export function resolveEntities(
  config: CardConfig,
  prefix: string | undefined,
  notPresent: ReadonlySet<RolePath> = notPresentRoles(config),
): Record<RolePath, string | undefined> {
  return Object.fromEntries(
    ROLES.map((role) => [
      role.path,
      entityAt(config, `entities.${role.path}`) ??
        (prefix === undefined || notPresent.has(role.path) ? undefined : defaultEntityId(role, prefix)),
    ]),
  ) as Record<RolePath, string | undefined>;
}

/** The roles whose entity comes from the prefix default: no `entities` value, not `none`, and a prefix. */
export function defaultedRoles(
  config: CardConfig,
  prefix: string | undefined,
  notPresent: ReadonlySet<RolePath> = notPresentRoles(config),
): ReadonlySet<RolePath> {
  if (prefix === undefined) return new Set();
  return new Set(
    ROLES.filter((role) => entityAt(config, `entities.${role.path}`) === undefined && !notPresent.has(role.path)).map(
      (role) => role.path,
    ),
  );
}

/** True when the card shows its built-in sample: no prefix and no entity override. */
export const isSampleMode = (config: CardConfig): boolean => prefixOf(config) === undefined && !setsAnyEntity(config);

export function resolveConfig(config: CardConfig): ResolvedConfig {
  const prefix = prefixOf(config);
  const variant = variantOf(config);
  const sample = isSampleMode(config);
  // A `none` role is an entity setting, so it never occurs in sample mode.
  const notPresent = notPresentRoles(config);
  return {
    ...installationOf(config),
    detail: detailOf(config),
    exchangerFill: exchangerFillOf(config),
    layout: layoutOf(config),
    variant,
    prefix,
    states: statesOf(config),
    colors: stopsOf(config),
    features: mergeFeatures(variant, featureOverrides(config)),
    entities: sample ? SAMPLE_ENTITIES : resolveEntities(config, prefix, notPresent),
    notPresent,
    defaulted: sample ? new Set() : defaultedRoles(config, prefix, notPresent),
    sample,
  };
}
