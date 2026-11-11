import { describe, expect, test, vi } from 'vitest';
import '../../src/index';
import { formatReading, decimalsOf, displayPrecision } from '../../src/calc/display';
import { readRoles } from '../../src/calc/readings';
import { EcogeoCard } from '../../src/card/ecogeo-card';
import { SAMPLE_STATES, sampleEntityId } from '../../src/config/sample';
import { ROLE_BY_PATH, ROLE_PATHS, defaultEntityId, type RolePath } from '../../src/config/roles';
import { mergeFeatures } from '../../src/config/variants';
import { LABEL_SPECS, footerItems, labelsFor, positionOf } from '../../src/diagram/labels';
import type { CardConfig } from '../../src/lib/config';
import type { HassEntityState, HassLike } from '../../src/lib/hass';
import {
  DHW_LABELS,
  FOOTER_LABELS,
  HEATING_LABELS,
  INDICATIONS,
  NBSP,
  NO_VALUE,
  VALUE_CAPTIONS,
} from '../../src/strings';

const P = 'demo_ecogeo';
const nb = (text: string): string => text.replaceAll(' ', NBSP);

/** The states of every role under the demo prefix, from the sample (the heating snapshot), with overrides by role. */
function liveStates(overrides: Partial<Record<RolePath, string | [state: string, unit: string]>> = {}) {
  return Object.fromEntries(
    ROLE_PATHS.map((role): [string, HassEntityState] => {
      const sample = SAMPLE_STATES[sampleEntityId(role)];
      const entityId = defaultEntityId(
        ROLE_BY_PATH.get(role) ??
          (() => {
            throw new Error(role);
          })(),
        P,
      );
      const override = overrides[role];
      const [value, unit] = Array.isArray(override) ? override : [override ?? sample?.state ?? '', undefined];
      return [
        entityId,
        {
          entity_id: entityId,
          state: value,
          attributes: { ...sample?.attributes, ...(unit === undefined ? {} : { unit_of_measurement: unit }) },
        },
      ];
    }),
  );
}

const idOf = (role: RolePath): string =>
  `${ROLE_BY_PATH.get(role)?.domain ?? 'sensor'}.${P}_${ROLE_BY_PATH.get(role)?.suffix ?? ''}`;

async function mount(config: CardConfig = {}, hass?: HassLike): Promise<EcogeoCard> {
  const card = document.createElement('ecogeo-card') as EcogeoCard;
  card.setConfig({ type: 'custom:ecogeo-card', prefix: P, ...config });
  if (hass !== undefined) card.hass = hass;
  document.body.append(card);
  await card.updateComplete;
  return card;
}

const root = (card: EcogeoCard): ShadowRoot => {
  if (card.shadowRoot === null) throw new Error('no shadow root');
  return card.shadowRoot;
};
const label = (card: EcogeoCard, id: string): Element | null => root(card).querySelector(`[data-label="${id}"]`);
const valueOf = (card: EcogeoCard, id: string): string | undefined =>
  label(card, id)?.querySelector('.value')?.textContent.trim();
const footer = (card: EcogeoCard, id: string): string | undefined =>
  root(card).querySelector(`[data-footer="${id}"] .value`)?.textContent.trim();
const labelIds = (card: EcogeoCard): string[] =>
  [...root(card).querySelectorAll('[data-label]')].map((element) => element.getAttribute('data-label') ?? '');

const hassOf = (overrides: Parameters<typeof liveStates>[0] = {}, extra: Partial<HassLike> = {}): HassLike => ({
  states: liveStates(overrides),
  locale: { language: 'en', number_format: 'language' },
  ...extra,
});

describe('refrigerant labels', () => {
  test('compressor label: 2803 rpm, 38.9 % and 786 W near item 11', async () => {
    const card = await mount({}, hassOf());
    expect(valueOf(card, 'compressor_speed')).toBe(nb('2803 rpm'));
    expect(valueOf(card, 'compressor_percentage')).toBe(nb('38.9 %'));
    expect(valueOf(card, 'compressor_power')).toBe(nb('786 W'));
    for (const id of ['compressor_speed', 'compressor_percentage', 'compressor_power']) {
      expect(label(card, id)?.getAttribute('data-label-item')).toBe('11');
    }
    card.remove();
  });

  test('superheat of 6.2 degrees reads 6.2 K near item 12, the valve opening in %', async () => {
    const card = await mount({}, hassOf({ 'refrigerant.superheat': ['6.2', '°C'] }));
    expect(valueOf(card, 'superheat')).toBe(nb('6.2 K'));
    expect(label(card, 'superheat')?.getAttribute('data-label-item')).toBe('12');
    expect(valueOf(card, 'expansion_valve')).toBe(nb('58 %'));
    card.remove();
  });

  test('temperatures and pressures of the probes, and the condensation and evaporation temperatures', async () => {
    const card = await mount({}, hassOf());
    expect(valueOf(card, 'suction_temperature')).toBe(nb('1.0 °C'));
    expect(valueOf(card, 'discharge_temperature')).toBe(nb('52.5 °C'));
    expect(valueOf(card, 'suction_pressure')).toBe(nb('5.7 bar'));
    expect(valueOf(card, 'discharge_pressure')).toBe(nb('16.4 bar'));
    expect(valueOf(card, 'condensation_temperature')).toBe(nb('27.0 °C'));
    expect(valueOf(card, 'evaporation_temperature')).toBe(`−5.3${NBSP}°C`);
    card.remove();
  });
});

describe('hydraulic labels', () => {
  test('production labels: 25.2 °C at probe 33 and 99.9 % at pump 15', async () => {
    const card = await mount({}, hassOf());
    expect(valueOf(card, 'production_out')).toBe(nb('25.2 °C'));
    expect(label(card, 'production_out')?.getAttribute('data-label-item')).toBe('33');
    expect(valueOf(card, 'production_pump')).toBe(nb('99.9 %'));
    expect(label(card, 'production_pump')?.getAttribute('data-label-item')).toBe('15');
    expect(valueOf(card, 'production_in')).toBe(nb('22.0 °C'));
    expect(valueOf(card, 'production_pressure')).toBe(nb('1.2 bar'));
    expect(valueOf(card, 'dg1_setpoint')).toBe(nb('35.0 °C'));
    card.remove();
  });

  test('brine labels: probes 31 and 32, pressure 37, pump 16', async () => {
    const card = await mount({}, hassOf());
    expect(valueOf(card, 'brine_out')).toBe(`−2.8${NBSP}°C`);
    expect(valueOf(card, 'brine_in')).toBe(nb('0.5 °C'));
    expect(valueOf(card, 'brine_pressure')).toBe(nb('1.2 bar'));
    expect(valueOf(card, 'brine_pump')).toBe(nb('100.0 %'));
    card.remove();
  });

  test('part not drawn: no tank labels without DHW storage, no fan speed label with a ground source', async () => {
    const noDhw = await mount({ dhw: 'none' }, hassOf());
    expect(labelIds(noDhw).filter((id) => id.startsWith('tank_'))).toEqual([]);
    expect(labelIds(noDhw)).toContain('compressor_speed');
    noDhw.remove();
    const ground = await mount({ source: 'ground' }, hassOf());
    expect(labelIds(ground)).not.toContain('fan_speed');
    expect(labelIds(ground)).toContain('compressor_speed');
    ground.remove();
  });
});

describe('units, locale and precision', () => {
  test('percent keeps its space: 100 % reads "100.0 %" with a no-break space', async () => {
    const card = await mount({}, hassOf());
    const text = valueOf(card, 'brine_pump') ?? '';
    expect(text).toBe(`100.0${NBSP}%`);
    expect(text).not.toBe('100%');
    card.remove();
  });

  test('locale: a decimal comma shows 25,2 °C', async () => {
    const card = await mount({}, hassOf({}, { locale: { language: 'en', number_format: 'decimal_comma' } }));
    // the setting 'decimal_comma' is a period as thousands separator and a comma as decimal
    expect(valueOf(card, 'production_out')).toBe(`25,2${NBSP}°C`);
    card.remove();
  });

  test('locale: no thousands separator in 2803 rpm or 4712 W', async () => {
    const card = await mount({}, hassOf());
    expect(valueOf(card, 'compressor_speed')).toBe(`2803${NBSP}rpm`);
    expect(footer(card, 'condensation_capacity')).toBe(`4712${NBSP}W`);
    card.remove();
  });

  test('display precision of the entity wins over the role default: 0 gives 25 °C', async () => {
    const hass = hassOf({}, { entities: { [idOf('production.outlet_temperature')]: { display_precision: 0 } } });
    const card = await mount({}, hass);
    expect(valueOf(card, 'production_out')).toBe(nb('25 °C'));
    // another entity keeps the role default
    expect(valueOf(card, 'production_in')).toBe(nb('22.0 °C'));
    card.remove();
  });

  test('display precision helpers: a whole number from 0 to 20, else the role default', () => {
    expect(displayPrecision({ display_precision: 2 })).toBe(2);
    expect(displayPrecision({ display_precision: null })).toBeUndefined();
    expect(displayPrecision({ display_precision: -1 })).toBeUndefined();
    expect(displayPrecision({ display_precision: 1.5 })).toBeUndefined();
    expect(displayPrecision(undefined)).toBeUndefined();
    const role = ROLE_BY_PATH.get('production.pump');
    if (role === undefined) throw new Error('no role');
    expect(decimalsOf(role, undefined)).toBe(1);
    expect(decimalsOf(role, 3)).toBe(3);
  });

  test('Fahrenheit: a probe reporting 77 degrees F is shown and coloured as 25 °C', async () => {
    const card = await mount({}, hassOf({ 'production.outlet_temperature': ['77', '°F'] }));
    expect(valueOf(card, 'production_out')).toBe(nb('25.0 °C'));
    const stroke = root(card).querySelector('[data-segment="p1_up"]')?.getAttribute('style') ?? '';
    expect(stroke).toContain('color-mix(in srgb, #fb8c00 20%, #43a047)');
    card.remove();
  });

  test('display precision only applies to a value in the role unit: kW shown as W uses the role default', async () => {
    const hass = hassOf(
      { 'compressor.power': ['0.786', 'kW'] },
      { entities: { [idOf('compressor.power')]: { display_precision: 3 } } },
    );
    const card = await mount({}, hass);
    expect(valueOf(card, 'compressor_power')).toBe(nb('786 W'));
    card.remove();
  });

  test('a Fahrenheit entity with a display precision uses the role default decimals', async () => {
    const hass = hassOf(
      { 'production.outlet_temperature': ['77', '°F'] },
      { entities: { [idOf('production.outlet_temperature')]: { display_precision: 0 } } },
    );
    const card = await mount({}, hass);
    expect(valueOf(card, 'production_out')).toBe(nb('25.0 °C'));
    card.remove();
  });

  test('a superheat entity in °C with a display precision of 2 shows 6.20 K', async () => {
    const hass = hassOf(
      { 'refrigerant.superheat': ['6.2', '°C'] },
      { entities: { [idOf('refrigerant.superheat')]: { display_precision: 2 } } },
    );
    const card = await mount({}, hass);
    expect(valueOf(card, 'superheat')).toBe(nb('6.20 K'));
    card.remove();
  });

  test('a Fahrenheit superheat entity with a display precision still uses the role default', async () => {
    const hass = hassOf(
      { 'refrigerant.superheat': ['43.2', '°F'] },
      { entities: { [idOf('refrigerant.superheat')]: { display_precision: 2 } } },
    );
    const card = await mount({}, hass);
    expect(valueOf(card, 'superheat')).toBe(nb('6.2 K'));
    card.remove();
  });

  test('Fahrenheit superheat: 43.2 degrees F reads 6.2 K', async () => {
    const card = await mount({}, hassOf({ 'refrigerant.superheat': ['43.2', '°F'] }));
    expect(valueOf(card, 'superheat')).toBe(nb('6.2 K'));
    card.remove();
  });

  test('kilowatts are converted to watts', async () => {
    const card = await mount({}, hassOf({ 'compressor.power': ['0.786', 'kW'] }));
    expect(valueOf(card, 'compressor_power')).toBe(nb('786 W'));
    card.remove();
  });

  test('formatReading: the COP has no unit, a missing value has no text', () => {
    expect(formatReading('unit.cop', 6, undefined, { locale: { language: 'en' } })).toBe('6.0');
    expect(formatReading('unit.cop', undefined, undefined, { locale: {} })).toBeUndefined();
    expect(formatReading('unit.cop', Number.NaN, undefined, { locale: {} })).toBeUndefined();
  });
});

describe('missing values', () => {
  test('the sentinel -999.9 shows a muted dash, without an error', async () => {
    const card = await mount({}, hassOf({ 'brine.outlet_temperature': '-999.900024414062' }));
    const value = label(card, 'brine_out')?.querySelector('.value');
    expect(value?.textContent.trim()).toBe(NO_VALUE);
    expect(value?.classList.contains('missing')).toBe(true);
    card.remove();
  });

  test.each(['unavailable', 'unknown', 'abc'])('state "%s" shows the dash', async (state) => {
    const card = await mount({}, hassOf({ 'compressor.power': state }));
    expect(valueOf(card, 'compressor_power')).toBe(NO_VALUE);
    card.remove();
  });

  test('a role with no entity in hass shows the dash and keeps its label', async () => {
    const card = await mount({}, { states: {} });
    expect(valueOf(card, 'production_out')).toBe(NO_VALUE);
    expect(footer(card, 'cop')).toBe(NO_VALUE);
    card.remove();
  });
});

describe('footer', () => {
  test('heating, winter, COP 6.0 and 4712 W', async () => {
    const card = await mount({}, hassOf());
    expect(root(card).querySelector('.mode')?.textContent.trim()).toBe('Heating');
    expect(footer(card, 'on_off')).toBe('On');
    expect(footer(card, 'season')).toBe(FOOTER_LABELS.winter);
    expect(footer(card, 'cop')).toBe('6.0');
    expect(footer(card, 'condensation_capacity')).toBe(nb('4712 W'));
    expect(footer(card, 'evaporation_capacity')).toBe(nb('3926 W'));
    expect(footer(card, 'outside_temperature')).toBe(nb('3.8 °C'));
    card.remove();
  });

  test('summer is the season while summer is on; the alarm and offline indications show when they apply', async () => {
    const card = await mount(
      {},
      hassOf({ 'unit.summer': 'on', 'unit.winter': 'off', 'unit.alarm': 'on', 'unit.connection': 'off' }),
    );
    expect(footer(card, 'season')).toBe(FOOTER_LABELS.summer);
    expect(root(card).querySelector('.alarm')?.textContent.trim()).toBe(INDICATIONS.alarm);
    expect(root(card).querySelector('.offline')?.textContent.trim()).toBe(INDICATIONS.offline);
    card.remove();
  });

  test('without a season or an on/off state the footer shows dashes', () => {
    const rd = readRoles(
      {},
      Object.fromEntries(ROLE_PATHS.map((role) => [role, undefined])) as Record<RolePath, undefined>,
    );
    const items = footerItems(
      rd,
      Object.fromEntries(ROLE_PATHS.map((role) => [role, undefined])) as Record<RolePath, undefined>,
      { locale: {} },
    );
    expect(items.map((item) => item.text)).toEqual(new Array(items.length).fill(NO_VALUE));
    expect(items.every((item) => item.missing)).toBe(true);
  });
});

describe('tap opens more-info (read-only)', () => {
  test('tapping the brine inlet label fires hass-more-info for its entity and nothing else', async () => {
    const card = await mount({}, hassOf());
    const events: CustomEvent<{ entityId: string }>[] = [];
    card.addEventListener('hass-more-info', (event) => events.push(event as CustomEvent<{ entityId: string }>));
    const callService = vi.fn();
    (card.hass as HassLike & { callService?: unknown }).callService = callService;
    label(card, 'brine_in')?.querySelector<HTMLButtonElement>('button.value')?.click();
    expect(events).toHaveLength(1);
    expect(events[0]?.detail.entityId).toBe(idOf('brine.inlet_temperature'));
    expect(events[0]?.bubbles && events[0].composed).toBe(true);
    expect(callService).not.toHaveBeenCalled();
    card.remove();
  });

  test('a footer value opens its entity too', async () => {
    const card = await mount({}, hassOf());
    const events: CustomEvent<{ entityId: string }>[] = [];
    card.addEventListener('hass-more-info', (event) => events.push(event as CustomEvent<{ entityId: string }>));
    root(card).querySelector<HTMLButtonElement>('[data-footer="cop"] button')?.click();
    expect(events.map((event) => event.detail.entityId)).toEqual([idOf('unit.cop')]);
    card.remove();
  });

  test('in sample mode the values are not buttons', async () => {
    const card = document.createElement('ecogeo-card') as EcogeoCard;
    card.setConfig({ type: 'custom:ecogeo-card' });
    document.body.append(card);
    await card.updateComplete;
    expect(root(card).querySelectorAll('.label button')).toHaveLength(0);
    expect(root(card).querySelector('.label .value')?.textContent.trim()).not.toBe('');
    card.remove();
  });
});

describe('efficient updates', () => {
  test('a change of display precision in the entity registry re-renders; an unrelated entity does not', async () => {
    const hass = hassOf({}, { entities: { [idOf('production.outlet_temperature')]: { display_precision: 1 } } });
    const card = await mount({}, hass);
    const render = vi.spyOn(card as unknown as { render(): unknown }, 'render');
    card.hass = {
      ...hass,
      states: { ...hass.states, 'light.kitchen': { entity_id: 'light.kitchen', state: 'on', attributes: {} } },
    };
    await card.updateComplete;
    expect(render).not.toHaveBeenCalled();
    card.hass = { ...hass, entities: { [idOf('production.outlet_temperature')]: { display_precision: 0 } } };
    await card.updateComplete;
    expect(render).toHaveBeenCalledTimes(1);
    expect(valueOf(card, 'production_out')).toBe(nb('25 °C'));
    card.remove();
  });

  test('a change of locale re-renders', async () => {
    const hass = hassOf();
    const card = await mount({}, hass);
    card.hass = { ...hass, locale: { language: 'en', number_format: 'decimal_comma' } };
    await card.updateComplete;
    expect(valueOf(card, 'production_out')).toBe(`25,2${NBSP}°C`);
    card.remove();
  });
});

describe('source labels', () => {
  test('air: the fan speed label reads 34.5 % with a no-break space, plus outside and outlet temperatures', async () => {
    const card = await mount({ source: 'air' }, hassOf());
    expect(valueOf(card, 'fan_speed')).toBe(`34.5${NBSP}%`);
    expect(label(card, 'fan_speed')?.querySelector('.caption')?.textContent.trim()).toBe(VALUE_CAPTIONS.fan);
    expect(valueOf(card, 'outside_temperature')).toBe(nb('3.8 °C'));
    expect(valueOf(card, 'air_unit_outlet')).toBe(nb('0.5 °C'));
    expect(labelIds(card).some((id) => id.startsWith('ground_'))).toBe(false);
    card.remove();
  });

  test('ground: brine out and in at the collector, no fan label', async () => {
    const card = await mount({ source: 'ground' }, hassOf());
    expect(valueOf(card, 'ground_out')).toBe(`−2.8${NBSP}°C`);
    expect(valueOf(card, 'ground_in')).toBe(nb('0.5 °C'));
    expect(labelIds(card)).not.toContain('fan_speed');
    card.remove();
  });

  test('hybrid: the air unit and the ground loop each have their own labels', async () => {
    const card = await mount({ source: 'hybrid' }, hassOf());
    const ids = labelIds(card);
    expect(ids).toEqual(
      expect.arrayContaining(['fan_speed', 'outside_temperature', 'air_unit_outlet', 'hybrid_ground_in']),
    );
    // the ground loop's entry would repeat the air unit's outlet: only its exit is shown
    expect(ids).not.toContain('hybrid_ground_out');
    expect(ids).not.toContain('ground_out');
    expect(valueOf(card, 'hybrid_ground_in')).toBe(nb('0.5 °C'));
    card.remove();
  });

  test('a stopped or unavailable fan still shows its label: 0 % or a dash', async () => {
    const stopped = await mount({ source: 'air' }, hassOf({ 'source.fan_speed': '0' }));
    expect(valueOf(stopped, 'fan_speed')).toBe(`0.0${NBSP}%`);
    stopped.remove();
    const missing = await mount({ source: 'air' }, hassOf({ 'source.fan_speed': 'unavailable' }));
    expect(valueOf(missing, 'fan_speed')).toBe(NO_VALUE);
    missing.remove();
  });
});

describe('DHW tank labels', () => {
  test('external tank: 52.1 °C, setpoint 58 °C, start delta-T 8 K, each joined to its unit', async () => {
    const card = await mount({ model: 'B', dhw: 'external' }, hassOf({ 'dhw.start_delta': ['8', '°C'] }));
    expect(valueOf(card, 'tank_external_temperature')).toBe(nb('52.1 °C'));
    expect(valueOf(card, 'tank_external_setpoint')).toBe(nb('58 °C'));
    expect(valueOf(card, 'tank_external_start_delta')).toBe(nb('8 K'));
    expect(label(card, 'tank_external_start_delta')?.querySelector('.caption')?.textContent.trim()).toBe(
      VALUE_CAPTIONS.startDelta,
    );
    card.remove();
  });

  test('"Demand" shows only while the DHW demand is on', async () => {
    const off = await mount({}, hassOf({ 'dhw.demand': 'off' }));
    expect(label(off, 'tank_external_demand')).toBeNull();
    off.remove();
    const on = await mount({}, hassOf({ 'dhw.demand': 'on' }));
    expect(valueOf(on, 'tank_external_demand')).toBe(DHW_LABELS.demand);
    on.remove();
  });

  test('"Demand" at connections 1/2 shows only while the DG1 demand is on', async () => {
    const on = await mount({}, hassOf({ 'heating.demand': 'on' }));
    expect(valueOf(on, 'dg1_demand')).toBe(HEATING_LABELS.demand);
    expect(label(on, 'dg1_demand')?.getAttribute('data-label-item')).toBe('1');
    on.remove();
    const off = await mount({}, hassOf({ 'heating.demand': 'off' }));
    expect(label(off, 'dg1_demand')).toBeNull();
    off.remove();
    const unavailable = await mount({}, hassOf({ 'heating.demand': 'unavailable' }));
    expect(label(unavailable, 'dg1_demand')).toBeNull();
    unavailable.remove();
  });

  test('DHW temperature unavailable: the tank body is muted and the label shows no number', async () => {
    const card = await mount({}, hassOf({ 'dhw.temperature': 'unavailable' }));
    expect(valueOf(card, 'tank_external_temperature')).toBe(NO_VALUE);
    const svg = root(card).querySelector('svg');
    expect(svg?.getAttribute('style')).toContain('--dhw-tank-color: var(--disabled-text-color)');
    card.remove();
  });

  test('the tank body takes the DHW temperature colour', async () => {
    const card = await mount({}, hassOf());
    expect(root(card).querySelector('svg')?.getAttribute('style')).toContain(
      '--dhw-tank-color: color-mix(in srgb, #e53935 28.4%, #fb8c00)',
    );
    card.remove();
  });

  test('model C: the tank values are in the DHW zone, x 800-990 and y 140-230, and nothing is under an external tank', async () => {
    const card = await mount({ model: 'C' }, hassOf({ 'dhw.demand': 'on' }));
    const ids = labelIds(card).filter((id) => id.startsWith('tank_'));
    expect(ids).toEqual([
      'tank_internal_temperature',
      'tank_internal_setpoint',
      'tank_internal_start_delta',
      'tank_internal_demand',
    ]);
    expect(valueOf(card, 'tank_internal_temperature')).toBe(nb('52.1 °C'));
    for (const spec of LABEL_SPECS.filter((item) => item.dhw === 'internal')) {
      expect(spec.x, spec.id).toBeGreaterThanOrEqual(800);
      expect(spec.x, spec.id).toBeLessThanOrEqual(990);
      expect(spec.y, spec.id).toBeGreaterThanOrEqual(140);
      expect(spec.y, spec.id).toBeLessThanOrEqual(230);
    }
    card.remove();
  });
});

describe('label positions', () => {
  test('positions are percentages of the viewBox', () => {
    expect(positionOf({ x: 500, y: 310 })).toEqual({ left: '50%', top: '50%' });
  });

  test('every label has a unique id and lies inside the viewBox', () => {
    const ids = LABEL_SPECS.map((spec) => spec.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const spec of LABEL_SPECS) {
      expect(spec.x, spec.id).toBeGreaterThan(0);
      expect(spec.x, spec.id).toBeLessThan(1000);
      expect(spec.y, spec.id).toBeGreaterThan(0);
      expect(spec.y, spec.id).toBeLessThan(620);
    }
  });

  test('labelsFor is pure: the same inputs give the same labels', () => {
    const features = mergeFeatures(4, {});
    const entities = Object.fromEntries(ROLE_PATHS.map((role) => [role, undefined])) as Record<RolePath, undefined>;
    const readings = readRoles({}, entities);
    const context = { dhw: 'external', source: 'air', features, detail: 'simplified' } as const;
    expect(labelsFor(context, readings, entities, { locale: {} })).toEqual(
      labelsFor(context, readings, entities, { locale: {} }),
    );
  });
});
