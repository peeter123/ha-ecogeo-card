// The fixed capture list (add-schematic-card D9): the emulator URLs that `npm run capture` walks and that the cycle mode steps
// through. Each entry is a name (the PNG file name) and a query string; parameters left out take the defaults of
// url-state.ts (scenario heating, model B, variant 4, source ground, dhw and features by preset, detail simplified, light theme).
import { SCENARIO_NAMES } from './scenarios';
import { FEATURE_KEYS } from '../src/config/variants';
import { COMPACT_BELOW, COMPACT_BELOW_FULL } from '../src/lib/layout';

export interface CaptureStep {
  name: string;
  /** The query string, without the leading `?`. */
  query: string;
  /** The browser window's size in px, for a capture that depends on it (a panel view); the capture then shows the whole window. */
  viewport?: { width: number; height: number };
}

/** A phone's card width in px (the emulator's 360 px option). */
const PHONE_WIDTH = 360;

/** The installations and widths of the label captures (refine-simplified-layout 4.4). */
const LABEL_VARIANTS = [
  { name: 'ground', query: 'source=ground' },
  { name: 'air', query: 'source=air' },
  { name: 'modelC', query: 'model=C&dhw=internal' },
] as const;
const LABEL_WIDTHS = [COMPACT_BELOW, 800, 1000] as const;
const LABEL_SCENARIOS = ['heating', 'dhw', 'defrost', 'passive_cooling'] as const;

const step = (name: string, query: string, viewport?: CaptureStep['viewport']): CaptureStep =>
  viewport === undefined ? { name, query } : { name, query, viewport };

/** The window of the panel capture (refine-simplified-layout 6.2): a desktop screen. */
export const PANEL_VIEWPORT = { width: 1280, height: 800 } as const;

export const CAPTURES: readonly CaptureStep[] = [
  // every scenario with the default config
  ...SCENARIO_NAMES.map((name) => step(`scenario-${name}`, `scenario=${name}`)),
  // add-entity-discovery D11: the foreign naming (other ids, kPa, Hz, an enum mode, `none` roles), also on a phone
  step('foreign-heating', 'scenario=heating&naming=foreign'),
  step('foreign-dhw', 'scenario=dhw&naming=foreign'),
  // add-htr-state: the optional roles unbound, so the fallbacks show (DG1 from the condensation capacity, the register COP)
  step('foreign-heating_htr', 'scenario=heating_htr&naming=foreign'),
  step('foreign-defrost', 'scenario=defrost&naming=foreign'),
  step('foreign-off', 'scenario=off&naming=foreign'),
  step('foreign-phone-heating', `scenario=heating&naming=foreign&width=${String(PHONE_WIDTH)}`),
  // each source, in heating and in passive cooling
  ...(['air', 'ground', 'hybrid'] as const).flatMap((source) => [
    step(`source-${source}-heating`, `scenario=heating&source=${source}`),
    step(`source-${source}-passive_cooling`, `scenario=passive_cooling&source=${source}`),
  ]),
  step('source-air-defrost', 'scenario=defrost&source=air'),
  // each dhw value (internal only exists on model C)
  step('dhw-external', 'scenario=dhw&dhw=external'),
  step('dhw-none', 'scenario=heating&dhw=none'),
  step('dhw-none-dhw-mode', 'scenario=dhw&dhw=none'),
  step('dhw-unused-modelB', 'scenario=heating&dhw=unused'),
  step('dhw-unused-dhw-mode', 'scenario=dhw&dhw=unused'),
  step('dhw-internal-modelC', 'scenario=dhw&model=C&dhw=internal'),
  // model C
  step('model-C-heating', 'scenario=heating&model=C&dhw=internal'),
  step('model-C-heating_htr', 'scenario=heating_htr&model=C&dhw=internal'),
  step('model-C-dhw-unused', 'scenario=heating&model=C&dhw=unused'),
  step('model-C-dhw-unused-htr', 'scenario=active_cooling_htr&model=C&dhw=unused'),
  step('model-C-active_cooling_htr', 'scenario=active_cooling_htr&model=C'),
  // each feature false and unused, in the scenario that uses it
  ...FEATURE_KEYS.flatMap((key) =>
    (['false', 'unused'] as const).map((state) =>
      step(`feature-${key}-${state}`, `scenario=${featureScenario(key)}&${key}=${state}`),
    ),
  ),
  step('feature-passive_cooling-unused-defrost', 'scenario=defrost&passive_cooling=unused'),
  // the other variants
  ...([1, 2, 3] as const).map((variant) =>
    step(`variant-${String(variant)}-heating`, `scenario=heating&variant=${String(variant)}`),
  ),
  // full detail: every part of the manual figure with its item number
  step('detail-full-heating', 'scenario=heating&detail=full'),
  step('detail-full-heating_htr', 'scenario=heating_htr&detail=full'),
  step('detail-full-modelC', 'scenario=dhw&model=C&dhw=internal&detail=full'),
  step('detail-full-air', 'scenario=heating&source=air&detail=full'),
  step('detail-full-hybrid', 'scenario=heating&source=hybrid&detail=full'),
  step('detail-full-dhw-none', 'scenario=heating&dhw=none&detail=full'),
  step('detail-full-variant-1', 'scenario=heating&variant=1&detail=full'),
  // dark theme
  step('theme-dark-heating', 'scenario=heating&theme=dark'),
  step('theme-dark-dhw', 'scenario=dhw&theme=dark'),
  step('theme-dark-modelC', 'scenario=dhw&model=C&dhw=internal&theme=dark'),
  step('theme-dark-defrost', 'scenario=defrost&theme=dark'),
  step('theme-dark-hybrid', 'scenario=heating&theme=dark&source=hybrid'),
  step('theme-dark-air', 'scenario=heating&theme=dark&source=air'),
  step('theme-dark-ground', 'scenario=heating&theme=dark&source=ground'),
  step('theme-dark-air-defrost', 'scenario=defrost&theme=dark&source=air'),
  step('theme-dark-hybrid-passive_cooling', 'scenario=passive_cooling&theme=dark&source=hybrid'),
  step('theme-dark-ground-passive_cooling', 'scenario=passive_cooling&theme=dark&source=ground'),
  step('theme-dark-features-unused', 'scenario=active_cooling_htr&theme=dark&passive_cooling=unused&htr=unused'),
  // refine-simplified-layout D9: a panel view in a desktop window; the drawing is narrower than the window and the footer is in it
  step('panel-heating', 'scenario=heating&panel=1', PANEL_VIEWPORT),
  // add-compact-layout: every scenario on a phone (360 px, automatic layout) and in the full layout at the compact
  // threshold (the constant of src/lib/layout.ts), light and dark
  step('narrow-light-heating', 'scenario=heating&width=320'),
  step('narrow-hybrid-heating', 'scenario=heating&source=hybrid&width=320'),
  step('phone-air-heating', `scenario=heating&source=air&width=${String(PHONE_WIDTH)}`),
  step('phone-hybrid-heating', `scenario=heating&source=hybrid&width=${String(PHONE_WIDTH)}`),
  step('phone-modelC-dhw', `scenario=dhw&model=C&dhw=internal&width=${String(PHONE_WIDTH)}`),
  ...(['light', 'dark'] as const).flatMap((theme) =>
    SCENARIO_NAMES.flatMap((name) => [
      step(`phone-${theme}-${name}`, `scenario=${name}&width=${String(PHONE_WIDTH)}&theme=${theme}`),
      step(`threshold-${theme}-${name}`, `scenario=${name}&layout=full&width=${String(COMPACT_BELOW)}&theme=${theme}`),
    ]),
  ),
  // refine-simplified-layout 4.4: the values of the simplified drawing at the compact threshold, 800 and 1000 px, in the
  // scenarios with the most values (heating, DHW, defrost, passive cooling), for an air unit, model C and, where the
  // `threshold-*` and `scenario-*` captures do not already show it, a ground loop
  ...LABEL_VARIANTS.flatMap(({ name, query }) =>
    LABEL_WIDTHS.flatMap((width) =>
      LABEL_SCENARIOS.filter(() => name !== 'ground' || width === 800).map((scenario) =>
        step(
          `labels-${name}-${String(width)}-${scenario}`,
          `scenario=${scenario}&${query}&layout=full&width=${String(width)}`,
        ),
      ),
    ),
  ),
  // refine-simplified-layout 8.4: the full detail level at its own threshold and at 1000 px for the same scenarios, and just under
  // the threshold, where the card is compact
  ...LABEL_VARIANTS.flatMap(({ name, query }) =>
    ([COMPACT_BELOW_FULL, 1000] as const).flatMap((width) =>
      LABEL_SCENARIOS.map((scenario) =>
        step(
          width === COMPACT_BELOW_FULL
            ? `threshold-full-${name}-${scenario}`
            : `labels-full-${name}-${String(width)}-${scenario}`,
          `scenario=${scenario}&${query}&detail=full&layout=full&width=${String(width)}`,
        ),
      ),
    ),
  ),
  step('threshold-full-under', `scenario=heating&detail=full&width=${String(COMPACT_BELOW_FULL - 1)}`),
];

/** The scenario in which a feature is active, so that muting or removing it shows. */
function featureScenario(key: (typeof FEATURE_KEYS)[number]): string {
  switch (key) {
    case 'active_cooling':
      return 'active_cooling_htr';
    case 'passive_cooling':
      return 'passive_cooling';
    case 'htr':
      return 'active_cooling_htr';
    case 'backup_heater':
      return 'heating';
  }
}
