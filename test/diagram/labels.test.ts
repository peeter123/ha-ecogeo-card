import { describe, expect, test, vi } from 'vitest';
import '../../src/index';
import { formatReading, decimalsInState, decimalsOf, displayPrecision } from '../../src/calc/display';
import { readRoles } from '../../src/calc/readings';
import { EcogeoCard } from '../../src/card/ecogeo-card';
import { SAMPLE_STATES, sampleEntityId } from '../../src/config/sample';
import { ROLE_BY_PATH, ROLE_PATHS, defaultEntityId, type RolePath } from '../../src/config/roles';
import { mergeFeatures } from '../../src/config/variants';
import {
  AIR_PORT_Y,
  AIR_UNIT,
  AIR_UNIT_WALL_X,
  CABINET,
  COMPONENTS,
  GROUND_LINE_X,
  GROUND_LINE_Y,
  GROUND_LOOP,
  INTERNAL_TANK,
  SEGMENTS,
  drawnSegments,
  partState,
} from '../../src/diagram/geometry';
import { COIL_51_SHAPE } from '../../src/diagram/symbols';
import { LABEL_SPECS, footerItems, labelsFor, positionOf, type LabelSpec } from '../../src/diagram/labels';
import type { CardConfig } from '../../src/lib/config';
import type { HassEntityState, HassLike } from '../../src/lib/hass';
import {
  DHW_LABELS,
  FOOTER_LABELS,
  HEATING_LABELS,
  INDICATIONS,
  MODE_LABELS,
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

  // live-values "Unused tank labels": the tank is drawn but shows no values, in the full and the compact layout
  test('unused tank: no tank labels on either model, in the full and the compact layout', async () => {
    for (const model of ['B', 'C'] as const) {
      for (const layout of ['full', 'compact'] as const) {
        const card = await mount({ model, dhw: 'unused', layout }, hassOf());
        expect(
          labelIds(card).filter((id) => id.startsWith('tank_')),
          `${model} ${layout}`,
        ).toEqual([]);
        expect(labelIds(card)).toContain('compressor_speed');
        card.remove();
      }
    }
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
    expect(stroke).toContain('color-mix(in srgb, #e8a317 50%, #8ecae6)');
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

describe('roles not present', () => {
  const NO_PRESSURE = {
    entities: { production: { pressure: 'none' }, brine: { pressure: 'none' } },
  };

  test('No pressure sensors: no label at items 37 and 38, the probes stay drawn', async () => {
    const card = await mount({ ...NO_PRESSURE, detail: 'full', layout: 'full' }, hassOf());
    expect(label(card, 'production_pressure')).toBeNull();
    expect(label(card, 'brine_pressure')).toBeNull();
    expect(root(card).querySelector('[data-label-item="37"], [data-label-item="38"]')).toBeNull();
    expect(root(card).querySelector('g[data-item="37"]')).not.toBeNull();
    expect(root(card).querySelector('g[data-item="38"]')).not.toBeNull();
    expect(label(card, 'production_out')).not.toBeNull();
    card.remove();
  });

  test('a hidden label stays hidden in the compact layout', async () => {
    const card = await mount({ entities: { production: { outlet_temperature: 'none' } }, layout: 'compact' }, hassOf());
    expect(label(card, 'production_out')).toBeNull();
    expect(label(card, 'production_in')).not.toBeNull();
    card.remove();
  });

  test('No COP: the footer shows no COP item, the others stay', async () => {
    for (const layout of ['full', 'compact']) {
      const card = await mount({ entities: { unit: { cop: 'none' } }, layout }, hassOf());
      expect(root(card).querySelector('[data-footer="cop"]')).toBeNull();
      expect(root(card).querySelector('[data-footer="outside_temperature"]')).not.toBeNull();
      card.remove();
    }
  });

  test('a lone season role: its text, its tap entity, and a dash while it reads off', async () => {
    const winter = await mount({ entities: { unit: { summer: 'none' } } }, hassOf());
    expect(footer(winter, 'season')).toBe(FOOTER_LABELS.winter);
    const events: string[] = [];
    winter.addEventListener('hass-more-info', (event) =>
      events.push((event as CustomEvent<{ entityId: string }>).detail.entityId),
    );
    root(winter).querySelector<HTMLButtonElement>('[data-footer="season"] button')?.click();
    expect(events).toEqual([idOf('unit.winter')]);
    winter.remove();
    const summer = await mount(
      { entities: { unit: { winter: 'none' } } },
      hassOf({ 'unit.summer': 'on', 'unit.winter': 'off' }),
    );
    expect(footer(summer, 'season')).toBe(FOOTER_LABELS.summer);
    const summerEvents: string[] = [];
    summer.addEventListener('hass-more-info', (event) =>
      summerEvents.push((event as CustomEvent<{ entityId: string }>).detail.entityId),
    );
    root(summer).querySelector<HTMLButtonElement>('[data-footer="season"] button')?.click();
    expect(summerEvents).toEqual([idOf('unit.summer')]);
    summer.remove();
    const off = await mount({ entities: { unit: { winter: 'none' } } }, hassOf({ 'unit.summer': 'off' }));
    expect(footer(off, 'season')).toBe(NO_VALUE);
    off.remove();
  });

  test('the season item goes only when both its roles are not present', async () => {
    const one = await mount({ entities: { unit: { summer: 'none' } } }, hassOf());
    expect(root(one).querySelector('[data-footer="season"]')).not.toBeNull();
    one.remove();
    const both = await mount({ entities: { unit: { summer: 'none', winter: 'none' } } }, hassOf());
    expect(root(both).querySelector('[data-footer="season"]')).toBeNull();
    both.remove();
  });

  test('Unknown entity keeps its dash: the label of a bound but unknown entity stays', async () => {
    const card = await mount({ entities: { production: { outlet_temperature: 'sensor.does_not_exist' } } }, hassOf());
    const value = label(card, 'production_out')?.querySelector('.value');
    expect(value?.textContent.trim()).toBe(NO_VALUE);
    expect(value?.classList.contains('missing')).toBe(true);
    card.remove();
  });

  test('Power only: speed and percentage none, the power decides (DHW demand on)', async () => {
    const card = await mount(
      { entities: { compressor: { speed: 'none', percentage: 'none' } } },
      hassOf({
        'compressor.speed': '0',
        'compressor.percentage': '0',
        'compressor.power': '786',
        'dhw.demand': 'on',
      }),
    );
    expect(root(card).querySelector('.mode')?.textContent.trim()).toBe(MODE_LABELS.dhw);
    card.remove();
  });

  test('Standby power: a speed entity set to none is not read, the power is below 100 W', async () => {
    const card = await mount(
      { entities: { compressor: { speed: 'none', percentage: 'none' } } },
      hassOf({ 'compressor.speed': '2803', 'compressor.power': '15', 'dhw.demand': 'on' }),
    );
    expect(root(card).querySelector('.mode')?.textContent.trim()).toBe(MODE_LABELS.standby);
    card.remove();
  });

  test('unit.on_off none hides the on/off footer item', async () => {
    const card = await mount({ entities: { unit: { on_off: 'none' } } }, hassOf());
    expect(root(card).querySelector('[data-footer="on_off"]')).toBeNull();
    expect(root(card).querySelector('[data-footer="cop"]')).not.toBeNull();
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
  test('air: the fan speed label reads 34.5 % with a no-break space, plus the outside temperature', async () => {
    const card = await mount({ source: 'air' }, hassOf());
    expect(valueOf(card, 'fan_speed')).toBe(`34.5${NBSP}%`);
    expect(label(card, 'fan_speed')?.querySelector('.caption')?.textContent.trim()).toBe(VALUE_CAPTIONS.fan);
    expect(valueOf(card, 'outside_temperature')).toBe(nb('3.8 °C'));
    expect(labelIds(card).some((id) => id.startsWith('ground_'))).toBe(false);
    card.remove();
  });

  test('Air unit ports: In shows the brine outlet of the heat pump, Out the air unit outlet, each next to its port', async () => {
    const card = await mount({ source: 'air' }, hassOf());
    expect(valueOf(card, 'air_unit_in')).toBe(`−2.8${NBSP}°C`);
    expect(label(card, 'air_unit_in')?.querySelector('.caption')?.textContent.trim()).toBe('In');
    expect(label(card, 'air_unit_in')?.getAttribute('data-role')).toBe('brine.outlet_temperature');
    expect(valueOf(card, 'air_unit_out')).toBe(nb('0.5 °C'));
    expect(label(card, 'air_unit_out')?.querySelector('.caption')?.textContent.trim()).toBe('Out');
    expect(label(card, 'air_unit_out')?.getAttribute('data-role')).toBe('source.air_unit_outlet_temperature');
    // the old label under the housing is gone: the stack under the housing is the fan and the outside temperature
    expect(labelIds(card)).not.toContain('air_unit_outlet');
    const under = LABEL_SPECS.filter((spec) => spec.source?.includes('air') && spec.y > AIR_UNIT.y + AIR_UNIT.height);
    expect(under.map((spec) => spec.id)).toEqual(['fan_speed', 'outside_temperature']);
    // In sits at the inlet port (the bottom pass) and Out at the outlet port (the top pass), right of the housing's wall
    const at = (id: string): LabelSpec | undefined => LABEL_SPECS.find((spec) => spec.id === id);
    expect(Math.abs((at('air_unit_in')?.y ?? 0) - AIR_PORT_Y.bottom)).toBeLessThan(20);
    expect(Math.abs((at('air_unit_out')?.y ?? 0) - AIR_PORT_Y.top)).toBeLessThan(20);
    for (const id of ['air_unit_in', 'air_unit_out']) expect(at(id)?.x, id).toBeGreaterThan(AIR_UNIT_WALL_X);
    card.remove();
  });

  test('Single loop: In at the down leg shows the brine outlet, Out at the up leg the brine inlet, both at the ground line', async () => {
    const card = await mount({ source: 'ground' }, hassOf());
    expect(valueOf(card, 'ground_in')).toBe(`−2.8${NBSP}°C`);
    expect(valueOf(card, 'ground_out')).toBe(nb('0.5 °C'));
    expect(label(card, 'ground_in')?.querySelector('.caption')?.textContent.trim()).toBe('In');
    expect(label(card, 'ground_out')?.querySelector('.caption')?.textContent.trim()).toBe('Out');
    expect(label(card, 'ground_in')?.getAttribute('data-role')).toBe('brine.outlet_temperature');
    expect(label(card, 'ground_out')?.getAttribute('data-role')).toBe('brine.inlet_temperature');
    expect(labelIds(card)).not.toContain('fan_speed');
    const at = (id: string): LabelSpec | undefined => LABEL_SPECS.find((spec) => spec.id === id);
    // In on the down leg's side, Out on the up leg's, both just under the ground line
    expect(at('ground_in')?.x).toBeGreaterThan(GROUND_LOOP.downX);
    expect(at('ground_out')?.x).toBeLessThan(GROUND_LOOP.upX);
    for (const id of ['ground_in', 'ground_out']) {
      expect((at(id)?.y ?? 0) - GROUND_LINE_Y.ground, id).toBeGreaterThan(0);
      expect((at(id)?.y ?? 0) - GROUND_LINE_Y.ground, id).toBeLessThan(30);
    }
    card.remove();
  });

  test('Hybrid: the air unit has only its In, the ground loop only its Out, and the link pipe has no label', async () => {
    const card = await mount({ source: 'hybrid' }, hassOf());
    const ids = labelIds(card);
    expect(ids).toEqual(
      expect.arrayContaining(['fan_speed', 'outside_temperature', 'hybrid_air_unit_in', 'hybrid_ground_out']),
    );
    // no air unit Out and no ground In: both would label the link pipe
    for (const id of [
      'ground_in',
      'ground_out',
      'hybrid_ground_in',
      'hybrid_air_unit_out',
      'air_unit_in',
      'air_unit_out',
    ]) {
      expect(ids, id).not.toContain(id);
    }
    expect(valueOf(card, 'hybrid_air_unit_in')).toBe(`−2.8${NBSP}°C`);
    expect(label(card, 'hybrid_air_unit_in')?.getAttribute('data-role')).toBe('brine.outlet_temperature');
    expect(label(card, 'hybrid_air_unit_in')?.querySelector('.caption')?.textContent.trim()).toBe('In');
    expect(
      ids.some((id) => LABEL_SPECS.find((spec) => spec.id === id)?.role === 'source.air_unit_outlet_temperature'),
    ).toBe(false);
    expect(valueOf(card, 'hybrid_ground_out')).toBe(nb('0.5 °C'));
    expect(label(card, 'hybrid_ground_out')?.getAttribute('data-role')).toBe('brine.inlet_temperature');
    expect(label(card, 'hybrid_ground_out')?.querySelector('.caption')?.textContent.trim()).toBe('Out');
    // the hybrid is entered at the top pass: In is at the top port
    expect(
      Math.abs((LABEL_SPECS.find((spec) => spec.id === 'hybrid_air_unit_in')?.y ?? 0) - AIR_PORT_Y.top),
    ).toBeLessThan(20);
    card.remove();
  });

  test('the port labels are ordinary value labels: the same plate and size, never bare or emphasised, and they open more-info', async () => {
    const events: CustomEvent<{ entityId: string }>[] = [];
    const ids = {
      air: ['air_unit_in', 'air_unit_out'],
      ground: ['ground_in', 'ground_out'],
      hybrid: ['hybrid_air_unit_in', 'hybrid_ground_out'],
    } as const;
    for (const source of ['air', 'ground', 'hybrid'] as const) {
      const card = await mount({ source }, hassOf());
      card.addEventListener('hass-more-info', (event) => events.push(event as CustomEvent<{ entityId: string }>));
      for (const id of ids[source]) {
        const element = label(card, id);
        expect(element?.classList.contains('bare'), id).toBe(false);
        expect(element?.classList.contains('emphasis'), id).toBe(false);
        // the value joins its unit with a no-break space
        expect(valueOf(card, id), id).toMatch(/\d\s°C$/);
        const role = (element?.getAttribute('data-role') ?? '') as RolePath;
        events.length = 0;
        element?.querySelector<HTMLButtonElement>('button.value')?.click();
        expect(
          events.map((event) => event.detail.entityId),
          id,
        ).toEqual([idOf(role)]);
      }
      card.remove();
    }
  });

  describe.each(['simplified', 'full'] as const)('port labels touch no pipe or other label (%s)', (detail) => {
    interface Box {
      left: number;
      right: number;
      top: number;
      bottom: number;
    }
    // a value label with its caption: at most about 64 units wide and 13 tall at the 1000 px slot (normal size; the
    // `.slot` of dev/index.html is the 1000 px reference). The estimate holds for cards about 842 px or wider, where
    // 0.95cqw is at least 8 px
    const [WIDTH, HEIGHT] = [64, 13];
    const boxOf = (spec: LabelSpec): Box => {
      const left = spec.align === 'start' ? spec.x : spec.align === 'end' ? spec.x - WIDTH : spec.x - WIDTH / 2;
      return { left, right: left + WIDTH, top: spec.y - HEIGHT / 2, bottom: spec.y + HEIGHT / 2 };
    };
    const apart = (u: Box, v: Box): boolean =>
      u.right <= v.left || v.right <= u.left || u.bottom <= v.top || v.bottom <= u.top;
    const SOURCE_IDS = new Set([
      'fan_speed',
      'outside_temperature',
      'air_unit_in',
      'air_unit_out',
      'hybrid_air_unit_in',
      'ground_in',
      'ground_out',
      'hybrid_ground_out',
    ]);

    test.each(['air', 'ground', 'hybrid'] as const)('%s', (source) => {
      const context = { model: 'B', dhw: 'external', source, features: mergeFeatures(4, {}), detail } as const;
      const shown = LABEL_SPECS.filter((spec) => partState(spec, context) !== 'hidden');
      const mine = shown.filter((spec) => SOURCE_IDS.has(spec.id));
      expect(mine.length).toBeGreaterThanOrEqual(source === 'ground' ? 2 : 3);
      const pipes = drawnSegments(context).map(({ part }) => part);
      // the housing, the coil block, the cabinet, and the ground line with its hatching
      const solids: [string, Box][] = [
        ['cabinet', { left: CABINET.x - 2, right: 1000, top: CABINET.y - 2, bottom: 620 }],
      ];
      if (source !== 'ground') {
        const { x, y, width, height } = AIR_UNIT;
        solids.push(['housing', { left: x - 2, right: x + width + 2, top: y - 2, bottom: y + height + 2 }]);
      }
      if (source !== 'air') {
        const lineY = GROUND_LINE_Y[source === 'hybrid' ? 'hybrid' : 'ground'];
        solids.push([
          'ground line',
          { left: GROUND_LINE_X.start, right: GROUND_LINE_X.end, top: lineY - 2, bottom: lineY + 10 },
        ]);
      }
      for (const spec of mine) {
        const box = boxOf(spec);
        expect(box.left, spec.id).toBeGreaterThan(0);
        for (const [name, solid] of solids) expect(apart(box, solid), `${spec.id} ${name}`).toBe(true);
        for (const other of shown.filter((item) => item.id !== spec.id)) {
          expect(apart(box, boxOf(other)), `${spec.id} ${other.id}`).toBe(true);
        }
        // no pipe: every straight piece, thickened by its half stroke and a margin of 1
        for (const pipe of pipes) {
          pipe.points.slice(1).forEach((end, index) => {
            const start = pipe.points[index] ?? end;
            const run: Box = {
              left: Math.min(start[0], end[0]) - 2.5,
              right: Math.max(start[0], end[0]) + 2.5,
              top: Math.min(start[1], end[1]) - 2.5,
              bottom: Math.max(start[1], end[1]) + 2.5,
            };
            expect(apart(box, run), `${spec.id} ${pipe.id}`).toBe(true);
          });
        }
        // the value text stays on the card: the wide estimate must not reach the cabinet or the left edge
        expect(box.right, spec.id).toBeLessThan(CABINET.x);
      }
      // every other label below the cabinet's top (the probe labels at the cabinet's left edge, for one) keeps 8 units
      // clear of every pipe of the source (the labels of the pipe run above the cabinet sit by design under the top lines)
      for (const other of shown.filter((item) => !SOURCE_IDS.has(item.id) && item.y > CABINET.y)) {
        const width = other.caption === undefined ? 40 : WIDTH;
        const left = other.align === 'start' ? other.x : other.align === 'end' ? other.x - width : other.x - width / 2;
        const box: Box = { left, right: left + width, top: other.y - HEIGHT / 2, bottom: other.y + HEIGHT / 2 };
        for (const pipe of pipes.filter((candidate) => candidate.id.startsWith('src_'))) {
          pipe.points.slice(1).forEach((end, index) => {
            const start = pipe.points[index] ?? end;
            const run: Box = {
              left: Math.min(start[0], end[0]) - 8,
              right: Math.max(start[0], end[0]) + 8,
              top: Math.min(start[1], end[1]) - 8,
              bottom: Math.max(start[1], end[1]) + 8,
            };
            expect(apart(box, run), `${other.id} ${pipe.id}`).toBe(true);
          });
        }
      }
    });
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
      '--dhw-tank-color: color-mix(in srgb, #d7263d 10.5%, #f2711c)',
    );
    card.remove();
  });

  test('model C: the tank values are one row inside tank 50 above coil 51, and nothing is under an external tank', async () => {
    const card = await mount({ model: 'C' }, hassOf({ 'dhw.demand': 'on' }));
    const ids = labelIds(card).filter((id) => id.startsWith('tank_'));
    expect(ids).toEqual([
      'tank_internal_temperature',
      'tank_internal_setpoint',
      'tank_internal_start_delta',
      'tank_internal_demand',
    ]);
    expect(valueOf(card, 'tank_internal_temperature')).toBe(nb('52.1 °C'));
    // the captions are the external tank's
    expect(label(card, 'tank_internal_setpoint')?.textContent).toContain(VALUE_CAPTIONS.setpointShort);
    expect(label(card, 'tank_internal_start_delta')?.textContent).toContain(VALUE_CAPTIONS.startDeltaShort);
    // no background plate and no emphasised size: the values sit on the tank's tint at the normal label size
    for (const id of ids) {
      expect(label(card, id)?.classList.contains('bare'), id).toBe(true);
      expect(label(card, id)?.classList.contains('emphasis'), id).toBe(false);
    }
    card.remove();
  });

  describe.each(['simplified', 'full'] as const)('model C tank values clear of everything (%s)', (detail) => {
    interface Box {
      left: number;
      right: number;
      top: number;
      bottom: number;
    }
    // widths and heights in drawing units, measured in the emulator at the 1000 px slot (the `.slot` of dev/index.html;
    // normal size), rounded up with a margin of 2 to 3 units. The estimate holds for cards about 842 px or wider,
    // where 0.95cqw is at least 8 px
    const SIZE: Record<string, [number, number]> = {
      tank_internal_temperature: [36, 13],
      tank_internal_setpoint: [43, 13],
      tank_internal_start_delta: [33, 13],
      tank_internal_demand: [41, 13],
    };
    const boxOf = (id: string): Box => {
      const spec = LABEL_SPECS.find((item) => item.id === id);
      const size = SIZE[id];
      if (spec === undefined || size === undefined) throw new Error(id);
      const [width, height] = size;
      const left = spec.align === 'start' ? spec.x : spec.align === 'end' ? spec.x - width : spec.x - width / 2;
      return { left, right: left + width, top: spec.y - height / 2, bottom: spec.y + height / 2 };
    };
    const apart = (u: Box, v: Box): boolean =>
      u.right <= v.left || v.right <= u.left || u.bottom <= v.top || v.bottom <= u.top;
    const ids = Object.keys(SIZE);
    const coil = COMPONENTS.find((component) => component.item === 51);
    if (coil === undefined) throw new Error('no coil 51');
    // the coil's drawn extent: the supply port stub (stroke 3) runs along the turned helix's top edge, which is the
    // shape's cx + rx above the centre
    const STUB_STROKE = 3;
    const coilTop = coil.y - (COIL_51_SHAPE.cx + COIL_51_SHAPE.rx) - STUB_STROKE / 2;

    test('inside tank 50, above the coil, in one row', () => {
      const tank = INTERNAL_TANK;
      for (const id of ids) {
        const box = boxOf(id);
        expect(box.left, id).toBeGreaterThan(tank.x + 2);
        expect(box.right, id).toBeLessThan(tank.x + tank.width - 2);
        expect(box.top, id).toBeGreaterThan(tank.y + 2);
        expect(box.bottom, id).toBeLessThan(coilTop);
      }
      const rowY = ['temperature', 'setpoint', 'start_delta'].map(
        (name) => LABEL_SPECS.find((item) => item.id === 'tank_internal_' + name)?.y,
      );
      expect(new Set(rowY).size).toBe(1);
      // the demand text sits under the row
      expect(LABEL_SPECS.find((item) => item.id === 'tank_internal_demand')?.y).toBeGreaterThan(rowY[0] ?? 0);
    });

    test('no overlap with each other, other labels, item tags, components or pipes', () => {
      const boxes = ids.map((id) => [id, boxOf(id)] as const);
      for (const [index, [id, box]] of boxes.entries()) {
        for (const [other, otherBox] of boxes.slice(index + 1))
          expect(apart(box, otherBox), id + ' ' + other).toBe(true);
        // every other value label is outside this box
        for (const spec of LABEL_SPECS.filter((item) => !ids.includes(item.id))) {
          const near = { left: spec.x - 30, right: spec.x + 30, top: spec.y - 6, bottom: spec.y + 6 };
          expect(apart(box, near), id + ' ' + spec.id).toBe(true);
        }
        // item tags (full detail): a 14 x 10 box at the tag's anchor
        if (detail === 'full') {
          for (const part of COMPONENTS.filter((item) => item.dhw === 'internal' || item.item === 26)) {
            const [dx, dy, anchor] = part.tag;
            const x = part.x + dx;
            const left = anchor === 'start' ? x : anchor === 'end' ? x - 14 : x - 7;
            const tag = { left, right: left + 14, top: part.y + dy - 9, bottom: part.y + dy + 1 };
            expect(apart(box, tag), id + ' tag ' + String(part.item)).toBe(true);
          }
        }
        // components drawn near (probe 54 and the others): their symbol boxes (radius 14, the largest symbols' half size) stay clear, except tank 50
        for (const part of COMPONENTS.filter((item) => item.item !== 50 && item.item !== 51)) {
          // a port is only a 10 x 6 rectangle on the cabinet's top edge, so a half size of 7 covers it
          const half = part.kind === 'port' ? 7 : 14;
          const symbolBox = { left: part.x - half, right: part.x + half, top: part.y - half, bottom: part.y + half };
          expect(apart(box, symbolBox), id + ' component ' + String(part.item)).toBe(true);
        }
        // no pipe point or run passes through the box (orthogonal runs)
        for (const segment of SEGMENTS.filter((item) => item.dhw !== 'external' && item.shape === undefined)) {
          for (let i = 1; i < segment.points.length; i += 1) {
            const [x0 = 0, y0 = 0] = segment.points[i - 1] ?? [];
            const [x1 = 0, y1 = 0] = segment.points[i] ?? [];
            const run = {
              left: Math.min(x0, x1),
              right: Math.max(x0, x1),
              top: Math.min(y0, y1),
              bottom: Math.max(y0, y1),
            };
            const crosses =
              run.right > box.left && run.left < box.right && run.bottom > box.top && run.top < box.bottom;
            expect(crosses, id + ' pipe ' + segment.id).toBe(false);
          }
        }
      }
    });
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
    const context = { model: 'B', dhw: 'external', source: 'air', features, detail: 'simplified' } as const;
    expect(labelsFor(context, readings, entities, { locale: {} })).toEqual(
      labelsFor(context, readings, entities, { locale: {} }),
    );
  });
});

describe('units from another source', () => {
  test('pressure in kPa reads in bar at item 38 (full layout)', async () => {
    const card = await mount({ layout: 'full' }, hassOf({ 'production.pressure': ['150', 'kPa'] }));
    expect(valueOf(card, 'production_pressure')).toBe(`1.5${NBSP}bar`);
    card.remove();
  });

  test('compressor speed in Hz keeps its own unit', async () => {
    const card = await mount({ layout: 'full' }, hassOf({ 'compressor.speed': ['45', 'Hz'] }));
    expect(valueOf(card, 'compressor_speed')).toBe(`45${NBSP}Hz`);
    card.remove();
  });

  test('pump speed in rpm keeps its own unit, joined by a no-break space', async () => {
    const card = await mount({ layout: 'full' }, hassOf({ 'production.pump': ['2400', 'rpm'] }));
    const text = valueOf(card, 'production_pump');
    expect(text).toBe(`2400${NBSP}rpm`);
    expect(text).not.toContain(' ');
    card.remove();
  });

  test('pump as on/off reads On', async () => {
    const entityId = 'binary_sensor.pump_state';
    const states = { ...hassOf().states, [entityId]: { entity_id: entityId, state: 'on', attributes: {} } };
    const card = await mount({ layout: 'full', entities: { production: { pump: entityId } } }, { states });
    expect(valueOf(card, 'production_pump')).toBe('On');
    card.remove();
  });

  test('a unit the card converts is not passed through', () => {
    const context = { locale: undefined, states: { 'sensor.p': { attributes: { unit_of_measurement: 'kW' } } } };
    expect(formatReading('compressor.power', 786, 'sensor.p', context)).toBe(`786${NBSP}W`);
  });
});

describe('passed-through decimals', () => {
  const context = (state: string, unit: string, precision?: number) => ({
    locale: { language: 'en' },
    states: { 'sensor.x': { state, attributes: { unit_of_measurement: unit } } },
    ...(precision === undefined ? {} : { entities: { 'sensor.x': { display_precision: precision } } }),
  });

  test('the decimals of the state are kept', () => {
    expect(formatReading('compressor.speed', 45.6, 'sensor.x', context('45.6', 'Hz'))).toBe(`45.6${NBSP}Hz`);
    expect(formatReading('production.pump', 2400, 'sensor.x', context('2400', 'rpm'))).toBe(`2400${NBSP}rpm`);
  });

  test('display_precision is honoured when set', () => {
    expect(formatReading('compressor.speed', 45.6, 'sensor.x', context('45.6', 'Hz', 0))).toBe(`46${NBSP}Hz`);
  });

  test('a pressure in atm passes through', () => {
    expect(formatReading('production.pressure', 1.25, 'sensor.x', context('1.25', 'atm'))).toBe(`1.25${NBSP}atm`);
  });
});

describe('decimalsInState', () => {
  test.each([
    ['45.6', 1],
    ['2400', 0],
    ['1.5e3', 0],
    ['1.5E-3', 0],
    [undefined, 0],
  ])('"%s" has %s decimals', (text, decimals) => {
    expect(decimalsInState(text)).toBe(decimals);
  });
});
