// The emulator page (npm run dev): the card from the source with a mock `hass`, a scenario picker, configuration
// controls and live value sliders. All state is mirrored in the URL query string (url-state.ts), so every step is
// addressable by a capture script. Adapted from hrv-ventilation dev/preview.ts (controls, URL state, cycle mode,
// theme); the scenarios and controls are this card's own. Vite reloads the page when a source file changes.
import './ha-stubs';
import '../src/index';
import type { EcogeoCard } from '../src/card/ecogeo-card';
import { DETAIL_LEVELS, DHW_STORAGES, EXCHANGER_FILLS, MODELS, SOURCES } from '../src/config/options';
import type { RolePath } from '../src/config/roles';
import { FEATURE_KEYS, VARIANTS } from '../src/config/variants';
import { NBSP, NO_VALUE, UNITS } from '../src/strings';
import { CAPTURES } from './captures';
import { MockHass } from './mock-hass';
import { SCENARIO_NAMES, SCENARIOS, scenarioStates } from './scenarios';
import {
  DEFAULT_CYCLE_SECONDS,
  FEATURE_CHOICES,
  THEMES,
  configOf,
  parseState,
  toSearch,
  type EmulatorState,
} from './url-state';

/** The rpm of the compressor at 100 %, from the sample (2803 rpm at 38.9 %): the percentage slider moves both. */
const RPM_PER_PERCENT = 72;

interface SliderSpec {
  label: string;
  /** The roles it writes; the first one is what the slider shows. */
  roles: readonly RolePath[];
  min: number;
  max: number;
  step: number;
  unit: string;
  /** The value each role gets from the slider value; the first role gets the value itself by default. */
  write?: (value: number) => Partial<Record<RolePath, number>>;
}

const T = UNITS.celsius;
const P = UNITS.percent;
const SLIDERS: readonly SliderSpec[] = [
  { label: 'Production out', roles: ['production.outlet_temperature'], min: 5, max: 65, step: 0.5, unit: T },
  { label: 'Production in', roles: ['production.return_temperature'], min: 5, max: 65, step: 0.5, unit: T },
  { label: 'Brine out', roles: ['brine.outlet_temperature'], min: -15, max: 40, step: 0.5, unit: T },
  { label: 'Brine in', roles: ['brine.inlet_temperature'], min: -15, max: 40, step: 0.5, unit: T },
  { label: 'DHW temperature', roles: ['dhw.temperature'], min: 20, max: 70, step: 0.5, unit: T },
  { label: 'Discharge', roles: ['compressor.discharge_temperature'], min: 20, max: 110, step: 1, unit: T },
  { label: 'Suction', roles: ['compressor.suction_temperature'], min: -20, max: 30, step: 0.5, unit: T },
  { label: 'Production pump', roles: ['production.pump'], min: 0, max: 100, step: 1, unit: P },
  { label: 'Brine pump', roles: ['brine.pump'], min: 0, max: 100, step: 1, unit: P },
  {
    label: 'Compressor',
    roles: ['compressor.percentage', 'compressor.speed'],
    min: 0,
    max: 100,
    step: 1,
    unit: P,
    write: (value) => ({ 'compressor.percentage': value, 'compressor.speed': Math.round(value * RPM_PER_PERCENT) }),
  },
  { label: 'Fan speed', roles: ['source.fan_speed'], min: 0, max: 100, step: 1, unit: P },
  { label: 'Condensation capacity', roles: ['heating.capacity'], min: 0, max: 10000, step: 100, unit: UNITS.watt },
];

const mock = new MockHass();
let state: EmulatorState = parseState(location.search);
/** The slider values set by hand: cleared when a scenario is picked. */
let overrides: Partial<Record<RolePath, string>> = {};
let cycleTimer: number | undefined;
let cycleIndex = 0;

const cardsRoot = document.getElementById('cards');
const controlsRoot = document.getElementById('controls');
if (!cardsRoot || !controlsRoot) throw new Error('the page has no #cards or #controls element');

const slot = document.createElement('div');
slot.className = 'slot';
const card = document.createElement('ecogeo-card') as EcogeoCard;
const error = document.createElement('pre');
error.className = 'error';
error.hidden = true;
slot.append(card, error);
cardsRoot.append(slot);

/** Pushes the state into the card: the config, the mock states, the theme and the URL. */
function apply(): void {
  document.body.className = state.theme;
  try {
    card.setConfig(configOf(state));
    error.hidden = true;
  } catch (cause) {
    error.textContent = cause instanceof Error ? cause.message : String(cause);
    error.hidden = false;
  }
  const states = { ...SCENARIOS[state.scenario].states, ...overrides } as Record<RolePath, string>;
  card.hass = mock.build(scenarioStates(states), state.theme === 'dark');
  history.replaceState(null, '', toSearch(state));
  delete cardsRoot?.dataset['ready'];
  void card.updateComplete.then(() => {
    if (cardsRoot) cardsRoot.dataset['ready'] = state.scenario;
  });
}

const syncers: (() => void)[] = [];

function labelled(text: string, control: HTMLElement): HTMLLabelElement {
  const label = document.createElement('label');
  label.append(`${text} `, control);
  return label;
}

function select<T extends string>(
  name: string,
  text: string,
  choices: readonly T[],
  get: () => T,
  set: (value: T) => void,
  labels?: Readonly<Record<string, string>>,
): HTMLLabelElement {
  const element = document.createElement('select');
  element.name = name;
  for (const choice of choices) element.add(new Option(labels?.[choice] ?? choice, choice));
  element.addEventListener('change', () => {
    set(element.value as T);
    apply();
    syncControls();
  });
  syncers.push(() => {
    element.value = get();
  });
  return labelled(text, element);
}

const fieldset = (title: string, ...children: HTMLElement[]): HTMLFieldSetElement => {
  const set = document.createElement('fieldset');
  const legend = document.createElement('legend');
  legend.textContent = title;
  set.append(legend, ...children);
  return set;
};

function sliderValue(spec: SliderSpec): number | undefined {
  const role = spec.roles[0];
  const text = role === undefined ? undefined : (overrides[role] ?? SCENARIOS[state.scenario].states[role]);
  const value = Number(text);
  return text !== undefined && Number.isFinite(value) ? Math.min(spec.max, Math.max(spec.min, value)) : undefined;
}

function slider(spec: SliderSpec): HTMLLabelElement {
  const input = document.createElement('input');
  input.type = 'range';
  input.name = spec.label;
  input.min = String(spec.min);
  input.max = String(spec.max);
  input.step = String(spec.step);
  const output = document.createElement('output');
  const show = (): void => {
    output.textContent = `${input.value}${NBSP}${spec.unit}`;
  };
  input.addEventListener('input', () => {
    const value = Number(input.value);
    const first = spec.roles[0];
    const writes = spec.write?.(value) ?? (first === undefined ? {} : { [first]: value });
    for (const [role, written] of Object.entries(writes)) overrides[role as RolePath] = String(written);
    show();
    apply();
  });
  syncers.push(() => {
    const value = sliderValue(spec);
    input.value = String(value ?? spec.min);
    if (value === undefined) output.textContent = NO_VALUE;
    else show();
  });
  const label = labelled(spec.label, input);
  label.append(' ', output);
  return label;
}

function syncControls(): void {
  for (const sync of syncers) sync();
}

function stopCycle(): void {
  if (cycleTimer !== undefined) window.clearInterval(cycleTimer);
  cycleTimer = undefined;
}

/** Steps through the capture list, one step per `state.cycle` seconds; the step's query replaces the state. */
function startCycle(seconds: number): void {
  stopCycle();
  const run = (): void => {
    const next = CAPTURES[cycleIndex % CAPTURES.length];
    cycleIndex += 1;
    if (next === undefined) return;
    state = { ...parseState(`?${next.query}`), cycle: seconds };
    overrides = {};
    apply();
    syncControls();
  };
  run();
  cycleTimer = window.setInterval(run, seconds * 1000);
}

function cycleControl(): HTMLLabelElement {
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.name = 'cycle';
  box.addEventListener('change', () => {
    if (box.checked) {
      state = { ...state, cycle: state.cycle ?? DEFAULT_CYCLE_SECONDS };
      startCycle(state.cycle ?? DEFAULT_CYCLE_SECONDS);
    } else {
      stopCycle();
      state = { ...state, cycle: undefined };
      apply();
    }
  });
  syncers.push(() => {
    box.checked = state.cycle !== undefined;
  });
  return labelled('Cycle through the capture list', box);
}

controlsRoot.append(
  fieldset(
    'Scenario',
    select(
      'scenario',
      'Scenario',
      SCENARIO_NAMES,
      () => state.scenario,
      (value) => {
        state = { ...state, scenario: value };
        overrides = {};
      },
      Object.fromEntries(SCENARIO_NAMES.map((name) => [name, SCENARIOS[name].label])),
    ),
  ),
  fieldset(
    'Configuration',
    select(
      'model',
      'Model',
      MODELS,
      () => state.model,
      (value) => {
        state = { ...state, model: value };
      },
    ),
    select(
      'variant',
      'Variant',
      VARIANTS.map(String),
      () => String(state.variant),
      (value) => {
        state = { ...state, variant: VARIANTS.find((v) => String(v) === value) ?? state.variant };
      },
    ),
    select(
      'source',
      'Source',
      SOURCES,
      () => state.source,
      (value) => {
        state = { ...state, source: value };
      },
    ),
    select(
      'dhw',
      'DHW storage',
      ['default', ...DHW_STORAGES] as const,
      () => state.dhw,
      (value) => {
        state = { ...state, dhw: value };
      },
    ),
    select(
      'detail',
      'Detail',
      DETAIL_LEVELS,
      () => state.detail,
      (value) => {
        state = { ...state, detail: value };
      },
    ),
    select(
      'fill',
      'Exchanger fill',
      EXCHANGER_FILLS,
      () => state.fill,
      (value) => {
        state = { ...state, fill: value };
      },
    ),
    select(
      'theme',
      'Theme',
      THEMES,
      () => state.theme,
      (value) => {
        state = { ...state, theme: value };
      },
    ),
    cycleControl(),
  ),
  fieldset(
    'Features',
    ...FEATURE_KEYS.map((key) =>
      select(
        key,
        key,
        FEATURE_CHOICES,
        () => state.features[key],
        (value) => {
          state = { ...state, features: { ...state.features, [key]: value } };
        },
      ),
    ),
  ),
  fieldset('Live values', ...SLIDERS.map(slider)),
);

syncControls();
if (state.cycle === undefined) apply();
else startCycle(state.cycle);
