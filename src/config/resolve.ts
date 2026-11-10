// Config to ResolvedConfig (design D2, D3): the options with their defaults, the features (preset merged with the
// overrides), the entity id of every role and the sample flag. Pure; call after options.configErrors found no problem.
import { entityAt, type CardConfig } from '../lib/config';
import {
  featureOverrides,
  installationOf,
  prefixOf,
  setsAnyEntity,
  variantOf,
  type DhwStorage,
  type Model,
  type Source,
} from './options';
import { defaultEntityId, ROLES, type RolePath } from './roles';
import { SAMPLE_ENTITIES } from './sample';
import { mergeFeatures, type Features, type Variant } from './variants';

export interface ResolvedConfig {
  model: Model;
  variant: Variant;
  source: Source;
  dhw: DhwStorage;
  prefix: string | undefined;
  features: Features;
  /** The entity id of each role, or undefined when the role has no entity (no override and no prefix). */
  entities: Readonly<Record<RolePath, string | undefined>>;
  /** True when the config sets neither a prefix nor an entity: the roles are the sample entities. */
  sample: boolean;
}

/**
 * The entity id of every role: an explicit `entities` override, then `<domain>.<prefix>_<suffix>` when a prefix is
 * set, then nothing.
 */
export function resolveEntities(config: CardConfig, prefix: string | undefined): Record<RolePath, string | undefined> {
  return Object.fromEntries(
    ROLES.map((role) => [
      role.path,
      entityAt(config, `entities.${role.path}`) ?? (prefix === undefined ? undefined : defaultEntityId(role, prefix)),
    ]),
  ) as Record<RolePath, string | undefined>;
}

/** True when the card shows its built-in sample: no prefix and no entity override. */
export const isSampleMode = (config: CardConfig): boolean => prefixOf(config) === undefined && !setsAnyEntity(config);

export function resolveConfig(config: CardConfig): ResolvedConfig {
  const prefix = prefixOf(config);
  const variant = variantOf(config);
  const sample = isSampleMode(config);
  return {
    ...installationOf(config),
    variant,
    prefix,
    features: mergeFeatures(variant, featureOverrides(config)),
    entities: sample ? SAMPLE_ENTITIES : resolveEntities(config, prefix),
    sample,
  };
}
