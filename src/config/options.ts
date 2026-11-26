// The card's options and their validation (add-schematic-card D1, D2, D3; card-config spec). setConfig rejects a config with
// an unknown option, an invalid value, an unknown feature or role, or a dhw that does not fit the model, instead of
// falling back to a default silently. The option checking is the copied lib/options.ts; the checks it cannot
// express (a whole-number variant, tri-state features, nested entity roles) are here.
import { colorsErrors } from '../diagram/colors';
import { DEFAULT_STATES, type StateLists } from './states';
import { asEntityId, valueAt, type CardConfig } from '../lib/config';
import { invalidOptions, optionValue, type ChoiceOption, type OptionSpec } from '../lib/options';
import { CONFIG_ERRORS, OPTIONS } from '../strings';
import { ROLE_BY_PATH, type RolePath } from './roles';
import { FEATURE_KEYS, VARIANTS, type FeatureKey, type FeatureState } from './variants';

export const MODELS = ['B', 'C'] as const;
export type Model = (typeof MODELS)[number];
export const SOURCES = ['air', 'ground', 'hybrid'] as const;
export type Source = (typeof SOURCES)[number];
export const DHW_STORAGES = ['external', 'internal', 'unused', 'none'] as const;
export type DhwStorage = (typeof DHW_STORAGES)[number];
export const EMITTERS = ['underfloor', 'radiator', 'none'] as const;
export type Emitter = (typeof EMITTERS)[number];

export const MODEL_OPTION: ChoiceOption = { kind: 'choice', path: 'model', default: 'B', choices: MODELS };
export const SOURCE_OPTION: ChoiceOption = { kind: 'choice', path: 'source', default: 'ground', choices: SOURCES };
// The default of dhw depends on the model (defaultDhw); this default is not used.
export const DHW_OPTION: ChoiceOption = { kind: 'choice', path: 'dhw', default: 'external', choices: DHW_STORAGES };
/** The heat emitter of the DG1 circuit on connections 1/2 (rework-layouts D5): an underfloor loop, a radiator or none (stubs only). */
export const EMITTER_OPTION: ChoiceOption = {
  kind: 'choice',
  path: 'emitter',
  default: 'underfloor',
  choices: EMITTERS,
};
export const EXCHANGER_FILLS = ['gradient', 'none'] as const;
export type ExchangerFill = (typeof EXCHANGER_FILLS)[number];
/** How the plate exchangers 7-10 are filled (refine-schematic-drawing D4): a gradient per side from the pipes' colours, or not at all. */
export const EXCHANGER_FILL_OPTION: ChoiceOption = {
  kind: 'choice',
  path: 'exchanger_fill',
  default: 'gradient',
  choices: EXCHANGER_FILLS,
};
export const LAYOUTS = ['auto', 'horizontal', 'vertical'] as const;
export type Layout = (typeof LAYOUTS)[number];
/** The layout of the card (rework-layouts D8): `auto` picks by the card's width, `horizontal` and `vertical` force one. */
export const LAYOUT_OPTION: ChoiceOption = { kind: 'choice', path: 'layout', default: 'auto', choices: LAYOUTS };
/** The choice options, checked by lib/options.ts. */
export const CHOICE_OPTIONS: readonly OptionSpec[] = [
  MODEL_OPTION,
  SOURCE_OPTION,
  DHW_OPTION,
  EMITTER_OPTION,
  EXCHANGER_FILL_OPTION,
  LAYOUT_OPTION,
];

export const DEFAULT_VARIANT = 4;

/** The options of the card, plus the keys Home Assistant adds to any card of a dashboard. `colors` is checked by diagram/colors.ts. */
export const TOP_LEVEL_OPTIONS: readonly string[] = [
  'type',
  'model',
  'variant',
  'source',
  'dhw',
  'emitter',
  'prefix',
  'features',
  'entities',
  'states',
  'colors',
  'exchanger_fill',
  'layout',
  'view_layout',
  'layout_options',
  'grid_options',
  'visibility',
];

/** The DHW storage of a model when `dhw` is not set: external on B, internal on C. */
export const defaultDhw = (model: Model): DhwStorage => (model === 'C' ? 'internal' : 'external');

/** A key written without a value in YAML is null; it counts as left out. */
const isLeftOut = (value: unknown): value is undefined | null => value === undefined || value === null;

/** A prefix is blank (left out) when it is a string of whitespace only; the editor removes the key instead of writing one. */
const isBlank = (value: unknown): boolean => isLeftOut(value) || (typeof value === 'string' && value.trim() === '');

const isGroup = (value: unknown): value is CardConfig =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const PREFIX = /^[a-z0-9_]+$/;

/** The value of an `entities` role that means the role is not present: no entity, no default, no label (add-entity-discovery D1). */
const NONE = 'none';

/** True for the `none` value of an `entities` role: exactly `none` after trimming, lower case. */
export const isNone = (value: unknown): boolean => typeof value === 'string' && value.trim() === NONE;

/** The option's prefix, trimmed, or undefined when it is not set. Call after configErrors found no problem. */
export function prefixOf(config: CardConfig): string | undefined {
  const value = valueAt(config, 'prefix');
  return isBlank(value) ? undefined : (value as string).trim();
}

/** The variant, 1-4, or the default. Call after configErrors found no problem. */
export function variantOf(config: CardConfig): (typeof VARIANTS)[number] {
  const value = valueAt(config, 'variant');
  return VARIANTS.find((variant) => variant === value) ?? DEFAULT_VARIANT;
}

/** The model, the source, the dhw storage (its default follows the model) and the emitter. Call after configErrors found no problem. */
export function installationOf(config: CardConfig): {
  model: Model;
  source: Source;
  dhw: DhwStorage;
  emitter: Emitter;
} {
  const model = optionValue(config, MODEL_OPTION) as Model;
  const dhwSet = !isLeftOut(valueAt(config, 'dhw'));
  return {
    model,
    source: optionValue(config, SOURCE_OPTION) as Source,
    dhw: dhwSet ? (optionValue(config, DHW_OPTION) as DhwStorage) : defaultDhw(model),
    emitter: optionValue(config, EMITTER_OPTION) as Emitter,
  };
}

/** The exchanger fill, `gradient` unless set. Call after configErrors found no problem. */
export const exchangerFillOf = (config: CardConfig): ExchangerFill =>
  optionValue(config, EXCHANGER_FILL_OPTION) as ExchangerFill;

/** The layout choice, `auto` unless set. Call after configErrors found no problem. */
export const layoutOf = (config: CardConfig): Layout => optionValue(config, LAYOUT_OPTION) as Layout;

/** The keys of the `states` option. */
const STATES_KEYS = ['off', 'defrost'] as const;

/** A list of one or more non-empty texts. */
const isTextList = (value: unknown): value is string[] =>
  Array.isArray(value) && value.length > 0 && value.every((text) => typeof text === 'string' && text.trim() !== '');

/** The state values that mean off and defrost: the lists of `states`, each replacing its default. Call after configErrors found no problem. */
export function statesOf(config: CardConfig): StateLists {
  const states = valueAt(config, 'states');
  const group = isGroup(states) ? states : {};
  const list = (key: (typeof STATES_KEYS)[number]): readonly string[] => {
    const value = group[key];
    return isTextList(value) ? value : DEFAULT_STATES[key];
  };
  return { off: list('off'), defrost: list('defrost') };
}

/** The features set in the config (only valid keys and states), without the preset. */
export function featureOverrides(config: CardConfig): Partial<Record<FeatureKey, FeatureState>> {
  const features = valueAt(config, 'features');
  if (!isGroup(features)) return {};
  const result: Partial<Record<FeatureKey, FeatureState>> = {};
  for (const key of FEATURE_KEYS) {
    const value = features[key];
    if (value === true || value === false || value === 'unused') result[key] = value;
  }
  return result;
}

const isFeatureState = (value: unknown): value is FeatureState =>
  value === true || value === false || value === 'unused';

/** The roles whose `entities` value is `none`: not present, so they get no label, footer item or default entity. */
export function notPresentRoles(config: CardConfig): ReadonlySet<RolePath> {
  const entities = valueAt(config, 'entities');
  if (!isGroup(entities)) return new Set();
  return new Set(
    entityLeaves(entities)
      .filter(([path, value]) => ROLE_BY_PATH.has(path) && isNone(value))
      .map(([path]) => path as RolePath),
  );
}

/** Every leaf of the `entities` option as a dotted role path with its value. */
export function entityLeaves(entities: CardConfig, parent = ''): [path: string, value: unknown][] {
  return Object.entries(entities).flatMap(([key, value]): [string, unknown][] => {
    const path = parent === '' ? key : `${parent}.${key}`;
    return isGroup(value) ? entityLeaves(value, path) : [[path, value]];
  });
}

function variantErrors(config: CardConfig): string[] {
  const value = valueAt(config, 'variant');
  if (isLeftOut(value) || VARIANTS.some((variant) => variant === value)) return [];
  return [
    OPTIONS.invalid('variant', CONFIG_ERRORS.integer(String(VARIANTS[0]), String(VARIANTS[VARIANTS.length - 1]))),
  ];
}

function prefixErrors(config: CardConfig): string[] {
  const value = valueAt(config, 'prefix');
  if (isBlank(value) || (typeof value === 'string' && PREFIX.test(value.trim()))) return [];
  return [OPTIONS.invalid('prefix', CONFIG_ERRORS.prefix)];
}

function featureErrors(config: CardConfig): string[] {
  const features = valueAt(config, 'features');
  if (isLeftOut(features)) return [];
  if (!isGroup(features)) return [OPTIONS.invalid('features', OPTIONS.object)];
  return Object.entries(features).flatMap(([key, value]) => {
    if (!FEATURE_KEYS.some((known) => known === key)) return [CONFIG_ERRORS.unknownFeature(key, FEATURE_KEYS)];
    return isLeftOut(value) || isFeatureState(value) ? [] : [CONFIG_ERRORS.featureState(key)];
  });
}

function statesErrors(config: CardConfig): string[] {
  const states = valueAt(config, 'states');
  if (isLeftOut(states)) return [];
  if (!isGroup(states)) return [OPTIONS.invalid('states', OPTIONS.object)];
  return Object.entries(states).flatMap(([key, value]) => {
    if (!STATES_KEYS.some((known) => known === key)) return [CONFIG_ERRORS.statesKey(key)];
    return isLeftOut(value) || isTextList(value) ? [] : [CONFIG_ERRORS.statesList(key)];
  });
}

function entityErrors(config: CardConfig): string[] {
  const entities = valueAt(config, 'entities');
  if (isLeftOut(entities)) return [];
  if (!isGroup(entities)) return [OPTIONS.invalid('entities', OPTIONS.object)];
  return entityLeaves(entities).flatMap(([path, value]) => {
    if (isBlank(value)) return [];
    if (!ROLE_BY_PATH.has(path)) return [CONFIG_ERRORS.unknownRole(path)];
    return asEntityId(value) !== undefined || isNone(value) ? [] : [CONFIG_ERRORS.notEntityId(path)];
  });
}

/** True when `entities` sets any role: a non-blank value, valid or not (a malformed one is still the user's choice). */
export function setsAnyEntity(config: CardConfig): boolean {
  const entities = valueAt(config, 'entities');
  return isGroup(entities) && entityLeaves(entities).some(([, value]) => !isBlank(value));
}

/**
 * Every problem of the config as a message that names the option, role or feature; empty for a valid config.
 * A config with neither `prefix` nor entities is valid (sample mode).
 */
export function configErrors(config: CardConfig): string[] {
  const unknown = Object.keys(config)
    .filter((key) => !TOP_LEVEL_OPTIONS.includes(key))
    .map((key) => CONFIG_ERRORS.unknownOption(key));
  const choices = invalidOptions(config, CHOICE_OPTIONS);
  const errors = [
    ...unknown,
    ...choices,
    ...variantErrors(config),
    ...prefixErrors(config),
    ...featureErrors(config),
    ...entityErrors(config),
    ...statesErrors(config),
    ...colorsErrors(config),
  ];
  // The mismatch is only checked when model and dhw are valid by themselves.
  if (invalidOptions(config, [MODEL_OPTION, DHW_OPTION]).length === 0 && !isLeftOut(valueAt(config, 'dhw'))) {
    const { model, dhw } = installationOf(config);
    // Model C always has its tank, which may be unused but not absent.
    if ((model === 'B' && dhw === 'internal') || (model === 'C' && (dhw === 'external' || dhw === 'none'))) {
      errors.push(CONFIG_ERRORS.dhwMismatch(dhw, model));
    }
  }
  return errors;
}
