// The fixed capture list (design D9): the emulator URLs that `npm run capture` walks and that the cycle mode steps
// through. Each entry is a name (the PNG file name) and a query string; parameters left out take the defaults of
// url-state.ts (scenario heating, model B, variant 4, source ground, dhw and features by preset, detail simplified, light theme).
import { SCENARIO_NAMES } from './scenarios';
import { FEATURE_KEYS } from '../src/config/variants';

export interface CaptureStep {
  name: string;
  /** The query string, without the leading `?`. */
  query: string;
}

const step = (name: string, query: string): CaptureStep => ({ name, query });

export const CAPTURES: readonly CaptureStep[] = [
  // every scenario with the default config
  ...SCENARIO_NAMES.map((name) => step(`scenario-${name}`, `scenario=${name}`)),
  // each source, in heating and in passive cooling
  ...(['air', 'ground', 'hybrid'] as const).flatMap((source) => [
    step(`source-${source}-heating`, `scenario=heating&source=${source}`),
    step(`source-${source}-passive_cooling`, `scenario=passive_cooling&source=${source}`),
  ]),
  // each dhw value (internal only exists on model C)
  step('dhw-external', 'scenario=dhw&dhw=external'),
  step('dhw-none', 'scenario=heating&dhw=none'),
  step('dhw-none-dhw-mode', 'scenario=dhw&dhw=none'),
  step('dhw-internal-modelC', 'scenario=dhw&model=C&dhw=internal'),
  // model C
  step('model-C-dhw-none', 'scenario=heating&model=C&dhw=none'),
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
  step('detail-full-modelC', 'scenario=dhw&model=C&dhw=internal&detail=full'),
  // dark theme
  step('theme-dark-heating', 'scenario=heating&theme=dark'),
  step('theme-dark-dhw', 'scenario=dhw&theme=dark'),
  step('theme-dark-defrost', 'scenario=defrost&theme=dark'),
  step('theme-dark-hybrid', 'scenario=heating&theme=dark&source=hybrid'),
  step('theme-dark-features-unused', 'scenario=active_cooling_htr&theme=dark&passive_cooling=unused&htr=unused'),
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
