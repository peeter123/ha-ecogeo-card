// The emulator's state and its URL query string (add-schematic-card D9): scenario, model, variant, source, dhw, every feature,
// detail, fill, layout, width, theme and cycle. Every combination is addressable by URL. Pure, so it is unit-tested. URL pattern after
// hrv-ventilation dev/preview.ts (state in the query string); the parameters are this card's own.
import {
  DEFAULT_VARIANT,
  DETAIL_LEVELS,
  DHW_STORAGES,
  EXCHANGER_FILLS,
  LAYOUTS,
  MODELS,
  SOURCES,
  type Detail,
  type DhwStorage,
  type ExchangerFill,
  type Layout,
  type Model,
  type Source,
} from '../src/config/options';
import { FEATURE_KEYS, VARIANTS, type FeatureKey, type Variant } from '../src/config/variants';
import type { CardConfig } from '../src/lib/config';
import { DEMO_PREFIX, SCENARIO_NAMES, isScenarioName, type ScenarioName } from './scenarios';

export const THEMES = ['light', 'dark'] as const;
export type Theme = (typeof THEMES)[number];

/** A feature control: the variant's preset, or an explicit state. */
export const FEATURE_CHOICES = ['default', 'true', 'false', 'unused'] as const;
export type FeatureChoice = (typeof FEATURE_CHOICES)[number];

/** The card widths of the emulator's width control, in px; the URL accepts any whole width from MIN_WIDTH to MAX_WIDTH. */
export const WIDTHS = [320, 360, 412, 600, 800, 1000] as const;
export const DEFAULT_WIDTH = 1000;
export const MIN_WIDTH = 200;
export const MAX_WIDTH = 2000;

export interface EmulatorState {
  scenario: ScenarioName;
  model: Model;
  variant: Variant;
  source: Source;
  /** `default` leaves `dhw` out of the config: external on model B, internal on model C. */
  dhw: 'default' | DhwStorage;
  features: Record<FeatureKey, FeatureChoice>;
  /** The card's `detail` option: `simplified` (the default) or `full`. */
  detail: Detail;
  /** The card's `exchanger_fill` option (URL `fill=`): `gradient` (the default) or `none`. */
  fill: ExchangerFill;
  /** The card's `layout` option (URL `layout=`): `auto` (the default), `full` or `compact`. */
  layout: Layout;
  /** The width of the card's slot in px (URL `width=`). */
  width: number;
  theme: Theme;
  /** Seconds per step of the screenshot cycle; undefined when the cycle is off. */
  cycle: number | undefined;
}

export const DEFAULT_CYCLE_SECONDS = 3;

/**
 * The DHW choices the card accepts on a model (card-config): B external, unused or none; C internal or unused. The
 * emulator offers only these and falls back to `default` for any other, so it never produces a rejected config.
 */
export const dhwChoicesFor = (model: Model): readonly ('default' | DhwStorage)[] =>
  model === 'C' ? ['default', 'internal', 'unused'] : ['default', 'external', 'unused', 'none'];

/** The DHW choice kept when the model changes: the same one when the model accepts it, else `default`. */
export const dhwForModel = (model: Model, dhw: 'default' | DhwStorage): 'default' | DhwStorage =>
  dhwChoicesFor(model).includes(dhw) ? dhw : 'default';

export const defaultState = (): EmulatorState => ({
  scenario: 'heating',
  model: 'B',
  variant: DEFAULT_VARIANT,
  source: 'ground',
  dhw: 'default',
  features: { active_cooling: 'default', passive_cooling: 'default', htr: 'default', backup_heater: 'default' },
  detail: 'simplified',
  fill: 'gradient',
  layout: 'auto',
  width: DEFAULT_WIDTH,
  theme: 'light',
  cycle: undefined,
});

/** The value when it is one of the choices, else the fallback. */
const pick = <T extends string>(choices: readonly T[], value: string | null, fallback: T): T =>
  choices.find((choice) => choice === value) ?? fallback;

/** The state a query string describes; a missing or invalid parameter keeps its default. */
export function parseState(search: string): EmulatorState {
  const params = new URLSearchParams(search);
  const base = defaultState();
  const scenario = params.get('scenario');
  const variant = Number(params.get('variant'));
  const cycle = params.get('cycle');
  const width = Number(params.get('width'));
  const cycleSeconds = cycle === null ? undefined : Number(cycle);
  const model = pick(MODELS, params.get('model'), base.model);
  return {
    scenario: isScenarioName(scenario) ? scenario : base.scenario,
    model,
    variant: VARIANTS.find((v) => v === variant) ?? base.variant,
    source: pick(SOURCES, params.get('source'), base.source),
    dhw: dhwForModel(model, pick(['default', ...DHW_STORAGES] as const, params.get('dhw'), base.dhw)),
    features: Object.fromEntries(
      FEATURE_KEYS.map((key) => [key, pick(FEATURE_CHOICES, params.get(key), 'default')]),
    ) as Record<FeatureKey, FeatureChoice>,
    detail: pick(DETAIL_LEVELS, params.get('detail'), base.detail),
    fill: pick(EXCHANGER_FILLS, params.get('fill'), base.fill),
    layout: pick(LAYOUTS, params.get('layout'), base.layout),
    width: Number.isInteger(width) && width >= MIN_WIDTH && width <= MAX_WIDTH ? width : base.width,
    theme: pick(THEMES, params.get('theme'), base.theme),
    cycle:
      cycleSeconds === undefined
        ? undefined
        : Number.isFinite(cycleSeconds) && cycleSeconds > 0
          ? cycleSeconds
          : DEFAULT_CYCLE_SECONDS,
  };
}

/** The query string of a state: scenario, model, variant, source and theme always; the rest when not the default. */
export function toSearch(state: EmulatorState): string {
  const params = new URLSearchParams({
    scenario: state.scenario,
    model: state.model,
    variant: String(state.variant),
    source: state.source,
    theme: state.theme,
  });
  if (state.dhw !== 'default') params.set('dhw', state.dhw);
  if (state.detail !== 'simplified') params.set('detail', state.detail);
  if (state.fill !== 'gradient') params.set('fill', state.fill);
  if (state.layout !== 'auto') params.set('layout', state.layout);
  if (state.width !== DEFAULT_WIDTH) params.set('width', String(state.width));
  for (const key of FEATURE_KEYS) if (state.features[key] !== 'default') params.set(key, state.features[key]);
  if (state.cycle !== undefined) params.set('cycle', String(state.cycle));
  return `?${params.toString()}`;
}

/** The card config of a state: the demo prefix, the options and the explicit features. */
export function configOf(state: EmulatorState): CardConfig {
  const features: Record<string, boolean | 'unused'> = {};
  for (const key of FEATURE_KEYS) {
    const choice = state.features[key];
    if (choice !== 'default') features[key] = choice === 'unused' ? 'unused' : choice === 'true';
  }
  return {
    type: 'custom:ecogeo-card',
    prefix: DEMO_PREFIX,
    model: state.model,
    variant: state.variant,
    source: state.source,
    detail: state.detail,
    exchanger_fill: state.fill,
    layout: state.layout,
    ...(state.dhw === 'default' ? {} : { dhw: state.dhw }),
    ...(Object.keys(features).length === 0 ? {} : { features }),
  };
}

export { SCENARIO_NAMES };
