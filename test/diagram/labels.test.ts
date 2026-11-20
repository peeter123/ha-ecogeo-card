import { describe, expect, test, vi } from 'vitest';
import '../../src/index';
import { formatReading, decimalsInState, decimalsOf, displayPrecision } from '../../src/calc/display';
import { readRoles } from '../../src/calc/readings';
import { EcogeoCard } from '../../src/card/ecogeo-card';
import { SAMPLE_STATES, sampleEntityId } from '../../src/config/sample';
import { ROLE_BY_PATH, ROLE_PATHS, defaultEntityId, type RolePath } from '../../src/config/roles';
import { mergeFeatures } from '../../src/config/variants';
import { drawnSegments, partState, arrangementFor } from '../../src/diagram/geometry';
import { COIL_51_SHAPE } from '../../src/diagram/symbols';
import { footerItems, labelsFor, cssPosition, type LabelSpec } from '../../src/diagram/labels';
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

// the default config draws the simplified level
const arrangement = arrangementFor('horizontal');
/** The arrangement of the card's band key for a source (the external tank drawn). */
const bandOf = (source: 'air' | 'ground' | 'hybrid') =>
  arrangementFor('horizontal', { source, tank: true, emitter: 'none' });
const LABEL_SPECS = arrangement.labels.specs;

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
  test('compressor label: 2803 rpm near item 11, and neither the percentage nor the power', async () => {
    const card = await mount({}, hassOf());
    expect(valueOf(card, 'compressor_speed')).toBe(nb('2803 rpm'));
    expect(label(card, 'compressor_speed')?.getAttribute('data-label-item')).toBe('11');
    // the percentage and the power stay roles but are not drawn (live-values "Values on the drawing")
    expect(label(card, 'compressor_percentage')).toBeNull();
    expect(label(card, 'compressor_power')).toBeNull();
    expect(card.shadowRoot?.textContent).not.toContain(nb('786 W'));
    expect(card.shadowRoot?.textContent).not.toContain(nb('38.9 %'));
    card.remove();
  });

  test('superheat of 6.2 degrees reads 6.2 K near item 12, the valve opening in %', async () => {
    const card = await mount({}, hassOf({ 'refrigerant.superheat': ['6.2', '°C'] }));
    expect(valueOf(card, 'superheat')).toBe(nb('6.2 K'));
    expect(label(card, 'superheat')?.getAttribute('data-label-item')).toBe('12');
    expect(valueOf(card, 'expansion_valve')).toBe(nb('58 %'));
    expect(label(card, 'expansion_valve')?.getAttribute('data-label-item')).toBe('12');
    card.remove();
  });

  test('temperatures and pressures of the probes, and no condensation or evaporation temperature', async () => {
    const card = await mount({}, hassOf());
    expect(valueOf(card, 'suction_temperature')).toBe(nb('1.0 °C'));
    expect(valueOf(card, 'discharge_temperature')).toBe(nb('52.5 °C'));
    expect(valueOf(card, 'suction_pressure')).toBe(nb('5.7 bar'));
    expect(valueOf(card, 'discharge_pressure')).toBe(nb('16.4 bar'));
    expect(label(card, 'condensation_temperature')).toBeNull();
    expect(label(card, 'evaporation_temperature')).toBeNull();
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
    // Out at probe 33, In at probe 34 (live-values "Hydraulic values"); the DG1 setpoint is not drawn
    expect(label(card, 'production_out')?.querySelector('.caption')?.textContent.trim()).toBe(VALUE_CAPTIONS.portOut);
    expect(label(card, 'production_in')?.querySelector('.caption')?.textContent.trim()).toBe(VALUE_CAPTIONS.portIn);
    expect(label(card, 'dg1_setpoint')).toBeNull();
    card.remove();
  });

  test('brine labels: probes 31 and 32, pressure 37, pump 16', async () => {
    const card = await mount({}, hassOf());
    expect(valueOf(card, 'brine_out')).toBe(`−2.8${NBSP}°C`);
    expect(valueOf(card, 'brine_in')).toBe(nb('0.5 °C'));
    expect(valueOf(card, 'brine_pressure')).toBe(nb('1.2 bar'));
    expect(valueOf(card, 'brine_pump')).toBe(nb('100.0 %'));
    expect(label(card, 'brine_out')?.querySelector('.caption')?.textContent.trim()).toBe(VALUE_CAPTIONS.portOut);
    expect(label(card, 'brine_in')?.querySelector('.caption')?.textContent.trim()).toBe(VALUE_CAPTIONS.portIn);
    card.remove();
  });

  // live-values "Unused tank labels": the tank is drawn but shows no values, in both layouts
  test('unused tank: no tank labels on either model, in the horizontal and the vertical layout', async () => {
    for (const model of ['B', 'C'] as const) {
      for (const layout of ['horizontal', 'vertical'] as const) {
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

  test('part not drawn: no tank labels without DHW storage, no air unit label with a ground source', async () => {
    const noDhw = await mount({ dhw: 'none' }, hassOf());
    expect(labelIds(noDhw).filter((id) => id.startsWith('tank_'))).toEqual([]);
    expect(labelIds(noDhw)).toContain('compressor_speed');
    noDhw.remove();
    const ground = await mount({ source: 'ground' }, hassOf());
    expect(labelIds(ground)).not.toContain('air_unit_out');
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
    expect(footer(card, 'dg1_power')).toBe(`4712${NBSP}W`);
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
      { 'heating.power': ['4.712', 'kW'] },
      { entities: { [idOf('heating.power')]: { display_precision: 3 } } },
    );
    const card = await mount({}, hass);
    expect(footer(card, 'dg1_power')).toBe(nb('4712 W'));
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

  // a temperature difference (K), shown for the superheat
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
    const card = await mount({}, hassOf({ 'heating.power': ['4.712', 'kW'] }));
    expect(footer(card, 'dg1_power')).toBe(nb('4712 W'));
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
    const card = await mount({}, hassOf({ 'compressor.speed': state }));
    expect(valueOf(card, 'compressor_speed')).toBe(NO_VALUE);
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
    const card = await mount({ ...NO_PRESSURE, layout: 'horizontal' }, hassOf());
    expect(label(card, 'production_pressure')).toBeNull();
    expect(label(card, 'brine_pressure')).toBeNull();
    expect(root(card).querySelector('[data-label-item="37"], [data-label-item="38"]')).toBeNull();
    expect(root(card).querySelector('g[data-item="37"]')).not.toBeNull();
    expect(root(card).querySelector('g[data-item="38"]')).not.toBeNull();
    expect(label(card, 'production_out')).not.toBeNull();
    card.remove();
  });

  test('a hidden label stays hidden in the vertical layout', async () => {
    const card = await mount(
      { entities: { production: { outlet_temperature: 'none' } }, layout: 'vertical' },
      hassOf(),
    );
    expect(label(card, 'production_out')).toBeNull();
    expect(label(card, 'production_in')).not.toBeNull();
    card.remove();
  });

  test('No COP: the footer shows no COP item, the others stay', async () => {
    for (const layout of ['horizontal', 'vertical']) {
      const card = await mount({ entities: { unit: { cop: 'none', system_cop: 'none' } }, layout }, hassOf());
      expect(root(card).querySelector('[data-footer="cop"]')).toBeNull();
      expect(root(card).querySelector('[data-footer="outside_temperature"]')).not.toBeNull();
      card.remove();
    }
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

  test('unit.on_off none changes no footer item: the footer has no on/off item at all', async () => {
    const card = await mount({ entities: { unit: { on_off: 'none' } } }, hassOf());
    expect(root(card).querySelector('[data-footer="on_off"]')).toBeNull();
    expect(root(card).querySelector('[data-footer="cop"]')).not.toBeNull();
    card.remove();
  });
});

describe('footer', () => {
  const footerIds = (card: EcogeoCard): string[] =>
    [...root(card).querySelectorAll('[data-footer]')].map((element) => element.getAttribute('data-footer') ?? '');

  test('heating, system COP 5.8, DG1 4712 W and HTR 0 W: no on/off state, no season', async () => {
    const card = await mount({}, hassOf());
    expect(root(card).querySelector('.mode')?.textContent.trim()).toBe('Heating');
    expect(footer(card, 'cop')).toBe('5.8');
    expect(footer(card, 'dg1_power')).toBe(nb('4712 W'));
    expect(footer(card, 'htr_power')).toBe(nb('0 W'));
    expect(root(card).querySelector('[data-footer="condensation_capacity"]')).toBeNull();
    expect(root(card).querySelector('[data-footer="evaporation_capacity"]')).toBeNull();
    expect(footer(card, 'outside_temperature')).toBe(nb('3.8 °C'));
    expect(footerIds(card)).toEqual(['outside_temperature', 'cop', 'dg1_power', 'htr_power']);
    expect(root(card).querySelector('.footer')?.textContent).not.toContain('Winter');
    card.remove();
  });

  test('the footer is the same in the horizontal and the vertical layout', async () => {
    const horizontal = await mount({ layout: 'horizontal' }, hassOf());
    const vertical = await mount({ layout: 'vertical' }, hassOf());
    expect(root(vertical).querySelector('.footer')?.textContent).toBe(
      root(horizontal).querySelector('.footer')?.textContent,
    );
    expect(footerIds(vertical)).toEqual(footerIds(horizontal));
    horizontal.remove();
    vertical.remove();
  });

  test('the alarm and offline indications show when they apply', async () => {
    const card = await mount({}, hassOf({ 'unit.alarm': 'on', 'unit.connection': 'off' }));
    expect(root(card).querySelector('.alarm')?.textContent.trim()).toBe(INDICATIONS.alarm);
    expect(root(card).querySelector('.offline')?.textContent.trim()).toBe(INDICATIONS.offline);
    card.remove();
  });

  test('without any state the footer shows dashes', () => {
    const rd = readRoles(
      {},
      Object.fromEntries(ROLE_PATHS.map((role) => [role, undefined])) as Record<RolePath, undefined>,
    );
    const items = footerItems(
      rd,
      Object.fromEntries(ROLE_PATHS.map((role) => [role, undefined])) as Record<RolePath, undefined>,
      { locale: {} },
      {
        mode: 'heating',
        features: mergeFeatures(4, {}),
        dhw: 'external',
        notPresent: new Set(),
        absent: new Set(),
      },
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
    expect(events.map((event) => event.detail.entityId)).toEqual([idOf('unit.system_cop')]);
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
  test('air: only the Out of the air unit, as a bare number inside the unit (no caption), and no fan speed, outside temperature or In', async () => {
    const card = await mount({ source: 'air' }, hassOf());
    expect(valueOf(card, 'air_unit_out')).toBe(nb('0.5 °C'));
    expect(label(card, 'air_unit_out')?.querySelector('.caption')).toBeNull();
    expect(label(card, 'air_unit_out')?.textContent.trim()).toBe(nb('0.5 °C'));
    expect(label(card, 'air_unit_out')?.getAttribute('data-role')).toBe('source.air_unit_outlet_temperature');
    for (const id of ['fan_speed', 'outside_temperature', 'air_unit_in', 'hybrid_air_unit_in']) {
      expect(labelIds(card), id).not.toContain(id);
    }
    expect(labelIds(card).some((id) => id.startsWith('ground_'))).toBe(false);
    // Out sits inside the housing, in the strip between the fan and the coil block
    const air = bandOf('air');
    const out = air.labels.specs.find((spec) => spec.id === 'air_unit_out');
    const strip = air.airUnit?.strip;
    expect(out?.align).toBe('middle');
    expect(out?.x).toBe((strip?.x ?? 0) + (strip?.width ?? 0) / 2);
    expect(out?.y).toBe((strip?.y ?? 0) + (strip?.height ?? 0) / 2);
    card.remove();
  });

  test('Ground collector: only Out, the brine inlet, in the strip between the hatching and the serpentine, and no In', async () => {
    const card = await mount({ source: 'ground' }, hassOf());
    expect(valueOf(card, 'ground_out')).toBe(nb('0.5 °C'));
    expect(label(card, 'ground_out')?.querySelector('.caption')).toBeNull();
    expect(label(card, 'ground_out')?.textContent.trim()).toBe(nb('0.5 °C'));
    expect(label(card, 'ground_out')?.getAttribute('data-role')).toBe('brine.inlet_temperature');
    expect(labelIds(card)).not.toContain('ground_in');
    expect(labelIds(card)).not.toContain('fan_speed');
    const ground = bandOf('ground');
    const out = ground.labels.specs.find((spec) => spec.id === 'ground_out');
    const strip = ground.collector?.strip;
    expect(out?.x).toBe((strip?.x ?? 0) + (strip?.width ?? 0) / 2);
    expect(out?.y).toBe((strip?.y ?? 0) + (strip?.height ?? 0) / 2);
    expect(out?.y).toBeGreaterThan((ground.collector?.hatch.y ?? 0) + (ground.collector?.hatch.height ?? 0));
    expect(out?.y).toBeLessThan(ground.collector?.passes.y0 ?? 0);
    card.remove();
  });

  test('Hybrid: only the ground loop shows its Out, the air unit shows no value and the link pipe has no label', async () => {
    const card = await mount({ source: 'hybrid' }, hassOf());
    const ids = labelIds(card);
    expect(ids).toContain('hybrid_ground_out');
    for (const id of [
      'fan_speed',
      'outside_temperature',
      'hybrid_air_unit_in',
      'ground_in',
      'ground_out',
      'hybrid_ground_in',
      'hybrid_air_unit_out',
      'air_unit_in',
      'air_unit_out',
    ]) {
      expect(ids, id).not.toContain(id);
    }
    expect(
      ids.some((id) => LABEL_SPECS.find((spec) => spec.id === id)?.role === 'source.air_unit_outlet_temperature'),
    ).toBe(false);
    expect(valueOf(card, 'hybrid_ground_out')).toBe(nb('0.5 °C'));
    expect(label(card, 'hybrid_ground_out')?.getAttribute('data-role')).toBe('brine.inlet_temperature');
    expect(label(card, 'hybrid_ground_out')?.querySelector('.caption')).toBeNull();
    expect(label(card, 'hybrid_ground_out')?.textContent.trim()).toBe(nb('0.5 °C'));
    card.remove();
  });

  test('the source label is an ordinary value label: the same plate and size, never bare or emphasised, and it opens more-info', async () => {
    const events: CustomEvent<{ entityId: string }>[] = [];
    const ids = { air: 'air_unit_out', ground: 'ground_out', hybrid: 'hybrid_ground_out' } as const;
    for (const source of ['air', 'ground', 'hybrid'] as const) {
      const card = await mount({ source }, hassOf());
      card.addEventListener('hass-more-info', (event) => events.push(event as CustomEvent<{ entityId: string }>));
      const id = ids[source];
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
      card.remove();
    }
  });

  describe('the source label sits inside its body, touching no pipe, outline or other label', () => {
    interface Box {
      left: number;
      right: number;
      top: number;
      bottom: number;
    }
    // a bare value label (no caption): at most about 74 units wide and 18 tall at 560 px (the narrowest width of the horizontal layout)
    const [WIDTH, HEIGHT] = [74, 18];
    const boxOf = (spec: LabelSpec): Box => {
      const left = spec.align === 'start' ? spec.x : spec.align === 'end' ? spec.x - WIDTH : spec.x - WIDTH / 2;
      return { left, right: left + WIDTH, top: spec.y - HEIGHT / 2, bottom: spec.y + HEIGHT / 2 };
    };
    const apart = (u: Box, v: Box): boolean =>
      u.right <= v.left || v.right <= u.left || u.bottom <= v.top || v.bottom <= u.top;
    const SOURCE_IDS = new Set(['air_unit_out', 'ground_out', 'hybrid_ground_out']);

    test.each(['air', 'ground', 'hybrid'] as const)('%s', (source) => {
      const arr = bandOf(source);
      const context = { model: 'B', dhw: 'external', source, features: mergeFeatures(4, {}) } as const;
      const shown = arr.labels.specs.filter((spec) => partState(spec, context) !== 'hidden');
      const mine = shown.filter((spec) => SOURCE_IDS.has(spec.id));
      expect(mine).toHaveLength(1);
      const body = source === 'air' ? arr.airUnit : arr.collector;
      if (body === undefined) throw new Error('no body');
      // the value's strip lies inside the body, clear of the obstacles the body registers (the fan, the coil block, the
      // hatching, the serpentine)
      const obstacles: Box[] =
        source === 'air'
          ? [
              {
                left: body.x,
                right: body.x + body.width,
                top: body.y,
                bottom: (arr.airUnit?.fan.cy ?? 0) + (arr.airUnit?.fan.radius ?? 0),
              },
              {
                left: arr.airUnit?.coil.x ?? 0,
                right: (arr.airUnit?.coil.x ?? 0) + (arr.airUnit?.coil.width ?? 0),
                top: arr.airUnit?.coil.y ?? 0,
                bottom: (arr.airUnit?.coil.y ?? 0) + (arr.airUnit?.coil.height ?? 0),
              },
            ]
          : [
              {
                left: body.x,
                right: body.x + body.width,
                top: body.y,
                bottom: arr.collector ? arr.collector.hatch.y + arr.collector.hatch.height : 0,
              },
              {
                left: arr.collector?.serpentine.x ?? 0,
                right: (arr.collector?.serpentine.x ?? 0) + (arr.collector?.serpentine.width ?? 0),
                top: arr.collector?.serpentine.y ?? 0,
                bottom: (arr.collector?.serpentine.y ?? 0) + (arr.collector?.serpentine.height ?? 0),
              },
            ];
      for (const spec of mine) {
        const box = boxOf(spec);
        // inside the body's outline, with room
        expect(box.left, spec.id).toBeGreaterThan(body.x + 2);
        expect(box.right, spec.id).toBeLessThan(body.x + body.width - 2);
        expect(box.top, spec.id).toBeGreaterThan(body.y + 2);
        expect(box.bottom, spec.id).toBeLessThan(body.y + body.height - 2);
        for (const obstacle of obstacles) expect(apart(box, obstacle), spec.id).toBe(true);
        for (const other of shown.filter((item) => item.id !== spec.id)) {
          expect(apart(box, boxOf(other)), `${spec.id} ${other.id}`).toBe(true);
        }
        // no pipe: every straight piece, thickened by its half stroke and a margin of 1
        for (const pipe of drawnSegments(context).map(({ part }) => part)) {
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
      }
    });
  });
});

describe('DHW tank labels', () => {
  test('external tank: 52.1 °C as a bare number inside the tank (no caption), and neither the setpoint nor the start delta-T', async () => {
    const card = await mount({ model: 'B', dhw: 'external' }, hassOf({ 'dhw.start_delta': ['8', '°C'] }));
    expect(valueOf(card, 'tank_external_temperature')).toBe(nb('52.1 °C'));
    expect(label(card, 'tank_external_temperature')?.querySelector('.caption')).toBeNull();
    expect(label(card, 'tank_external_temperature')?.textContent.trim()).toBe(nb('52.1 °C'));
    expect(label(card, 'tank_external_setpoint')).toBeNull();
    expect(label(card, 'tank_external_start_delta')).toBeNull();
    expect(root(card).querySelector('.tank-caption')).toBeNull();
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

  test.each(['underfloor', 'radiator'] as const)(
    'heating-emitter "Demand on": "Demand" inside the %s shows only while the DG1 demand is on',
    async (emitter) => {
      const on = await mount({ emitter }, hassOf({ 'heating.demand': 'on' }));
      expect(valueOf(on, 'emitter_demand')).toBe(HEATING_LABELS.demand);
      expect(label(on, 'emitter_demand')?.getAttribute('data-label-item')).toBe('1');
      expect(label(on, 'dg1_demand')).toBeNull();
      on.remove();
      const off = await mount({ emitter }, hassOf({ 'heating.demand': 'off' }));
      expect(label(off, 'emitter_demand')).toBeNull();
      off.remove();
      const unavailable = await mount({ emitter }, hassOf({ 'heating.demand': 'unavailable' }));
      expect(label(unavailable, 'emitter_demand')).toBeNull();
      unavailable.remove();
    },
  );

  test('heating-emitter "Demand without an emitter": with emitter none "Demand" sits beside the stubs, in the cabinet-side place', async () => {
    const on = await mount({ emitter: 'none' }, hassOf({ 'heating.demand': 'on' }));
    expect(valueOf(on, 'dg1_demand')).toBe(HEATING_LABELS.demand);
    expect(label(on, 'dg1_demand')?.getAttribute('data-label-item')).toBe('1');
    expect(label(on, 'emitter_demand')).toBeNull();
    on.remove();
    const off = await mount({ emitter: 'none' }, hassOf({ 'heating.demand': 'off' }));
    expect(label(off, 'dg1_demand')).toBeNull();
    off.remove();
  });

  test('the demand is a label of the emitter body: its place is the strip at the top of the body, from the zones', () => {
    for (const emitter of ['underfloor', 'radiator'] as const) {
      const arrangement = arrangementFor('horizontal', { source: 'ground', tank: true, emitter });
      const spec = arrangement.labels.specs.find((candidate) => candidate.id === 'emitter_demand');
      const body = arrangement.emitter;
      expect(spec, emitter).toBeDefined();
      expect(body, emitter).toBeDefined();
      if (spec === undefined || body === undefined) continue;
      expect(spec.align).toBe('middle');
      expect(spec.x).toBe(body.strip.x + body.strip.width / 2);
      expect(spec.y).toBe(body.strip.y + body.strip.height / 2);
      expect(spec.y, emitter).toBeLessThan(body.y + 40);
    }
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

  test('model C: the DHW temperature (no caption) and the demand inside tank 50 above coil 51, and nothing under an external tank', async () => {
    const card = await mount({ model: 'C' }, hassOf({ 'dhw.demand': 'on' }));
    const ids = labelIds(card).filter((id) => id.startsWith('tank_'));
    expect(ids).toEqual(['tank_internal_temperature', 'tank_internal_demand']);
    expect(valueOf(card, 'tank_internal_temperature')).toBe(nb('52.1 °C'));
    expect(label(card, 'tank_internal_temperature')?.querySelector('.caption')).toBeNull();
    expect(label(card, 'tank_internal_temperature')?.textContent.trim()).toBe(nb('52.1 °C'));
    // no background plate and no emphasised size: the values sit on the tank's tint at the normal label size
    for (const id of ids) {
      expect(label(card, id)?.classList.contains('bare'), id).toBe(true);
      expect(label(card, id)?.classList.contains('emphasis'), id).toBe(false);
    }
    card.remove();
  });

  describe('model C tank values clear of everything', () => {
    const arr = arrangementFor('horizontal');
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
      tank_internal_temperature: [66, 13],
      tank_internal_demand: [41, 12],
    };
    const boxOf = (id: string): Box => {
      const spec = arr.labels.specs.find((item) => item.id === id);
      const size = SIZE[id];
      if (spec === undefined || size === undefined) throw new Error(id);
      const [width, height] = size;
      const left = spec.align === 'start' ? spec.x : spec.align === 'end' ? spec.x - width : spec.x - width / 2;
      return { left, right: left + width, top: spec.y - height / 2, bottom: spec.y + height / 2 };
    };
    const apart = (u: Box, v: Box): boolean =>
      u.right <= v.left || v.right <= u.left || u.bottom <= v.top || v.bottom <= u.top;
    const ids = Object.keys(SIZE);
    const coil = arr.components.find((component) => component.item === 51);
    if (coil === undefined) throw new Error('no coil 51');
    // the coil's drawn extent: the supply port stub (stroke 3) runs along the turned helix's top edge, which is the
    // shape's cx + rx above the centre
    const STUB_STROKE = 3;
    const coilTop = coil.y - (COIL_51_SHAPE.cx + COIL_51_SHAPE.rx) - STUB_STROKE / 2;

    test('inside tank 50, above the coil, in one row', () => {
      const tank = arr.internalTank;
      for (const id of ids) {
        const box = boxOf(id);
        expect(box.left, id).toBeGreaterThan(tank.x + 2);
        expect(box.right, id).toBeLessThan(tank.x + tank.width - 2);
        expect(box.top, id).toBeGreaterThan(tank.y + 2);
        // (the row estimate is a unit or two taller than the drawn text; the browser overlap tests are exact)
        expect(box.bottom, id).toBeLessThan(coilTop + 2);
      }
      // the demand sits right of the temperature, in the same row (it is 4 units higher, clear of probe 54's circle)
      const [temperature, demand] = ['tank_internal_temperature', 'tank_internal_demand'].map((id) =>
        arr.labels.specs.find((item) => item.id === id),
      );
      expect(Math.abs((demand?.y ?? 0) - (temperature?.y ?? 0))).toBeLessThanOrEqual(4);
      expect(demand?.x ?? 0).toBeGreaterThan((temperature?.x ?? 0) + (SIZE['tank_internal_temperature']?.[0] ?? 0));
    });

    test('no overlap with each other, other labels, components or pipes', () => {
      const boxes = ids.map((id) => [id, boxOf(id)] as const);
      for (const [index, [id, box]] of boxes.entries()) {
        for (const [other, otherBox] of boxes.slice(index + 1))
          expect(apart(box, otherBox), id + ' ' + other).toBe(true);
        // every other value label is outside this box
        for (const spec of arr.labels.specs.filter((item) => !ids.includes(item.id))) {
          const near = { left: spec.x - 30, right: spec.x + 30, top: spec.y - 6, bottom: spec.y + 6 };
          expect(apart(box, near), id + ' ' + spec.id).toBe(true);
        }
        // components drawn near (probe 54 and the others): their symbol boxes (radius 14, the largest symbols' half size) stay clear, except tank 50
        for (const part of arr.components.filter((item) => item.item !== 50 && item.item !== 51)) {
          // a port is only a 10 x 6 rectangle on the cabinet's top edge, so a half size of 7 covers it
          const half = part.kind === 'port' ? 7 : part.kind === 'probe_t' ? 9 : 14;
          const symbolBox = { left: part.x - half, right: part.x + half, top: part.y - half, bottom: part.y + half };
          expect(apart(box, symbolBox), id + ' component ' + String(part.item)).toBe(true);
        }
        // no pipe point or run passes through the box (orthogonal runs)
        for (const segment of arr.segments.filter((item) => item.dhw !== 'external' && item.shape === undefined)) {
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
    expect(cssPosition({ x: 500, y: arrangement.viewBox.height / 2 }, arrangement.viewBox)).toEqual({
      left: '50%',
      top: '50%',
    });
  });

  test('every label has a unique id and lies inside the viewBox', () => {
    const ids = LABEL_SPECS.map((spec) => spec.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const spec of LABEL_SPECS) {
      expect(spec.x, spec.id).toBeGreaterThan(0);
      expect(spec.x, spec.id).toBeLessThan(1000);
      expect(spec.y, spec.id).toBeGreaterThan(0);
      expect(spec.y, spec.id).toBeLessThan(arrangement.viewBox.height);
    }
  });

  test('labelsFor is pure: the same inputs give the same labels', () => {
    const features = mergeFeatures(4, {});
    const entities = Object.fromEntries(ROLE_PATHS.map((role) => [role, undefined])) as Record<RolePath, undefined>;
    const readings = readRoles({}, entities);
    const context = { model: 'B', dhw: 'external', source: 'air', features } as const;
    expect(labelsFor(context, readings, entities, { locale: {} })).toEqual(
      labelsFor(context, readings, entities, { locale: {} }),
    );
  });
});

describe('units from another source', () => {
  test('pressure in kPa reads in bar at item 38 (horizontal layout)', async () => {
    const card = await mount({ layout: 'horizontal' }, hassOf({ 'production.pressure': ['150', 'kPa'] }));
    expect(valueOf(card, 'production_pressure')).toBe(`1.5${NBSP}bar`);
    card.remove();
  });

  test('compressor speed in Hz keeps its own unit', async () => {
    const card = await mount({ layout: 'horizontal' }, hassOf({ 'compressor.speed': ['45', 'Hz'] }));
    expect(valueOf(card, 'compressor_speed')).toBe(`45${NBSP}Hz`);
    card.remove();
  });

  test('pump speed in rpm keeps its own unit, joined by a no-break space', async () => {
    const card = await mount({ layout: 'horizontal' }, hassOf({ 'production.pump': ['2400', 'rpm'] }));
    const text = valueOf(card, 'production_pump');
    expect(text).toBe(`2400${NBSP}rpm`);
    expect(text).not.toContain(' ');
    card.remove();
  });

  test('pump as on/off reads On', async () => {
    const entityId = 'binary_sensor.pump_state';
    const states = { ...hassOf().states, [entityId]: { entity_id: entityId, state: 'on', attributes: {} } };
    const card = await mount({ layout: 'horizontal', entities: { production: { pump: entityId } } }, { states });
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

describe('footer power items and efficiency (add-htr-state)', () => {
  type Over = Parameters<typeof liveStates>[0];
  const display = { locale: { language: 'en', number_format: 'language' } } as const;
  const everyEntity = Object.fromEntries(ROLE_PATHS.map((role) => [role, idOf(role)])) as Record<
    RolePath,
    string | undefined
  >;
  /** The footer of a mode: the entity of every role in `absent` or `none` is left out, as the card does. */
  function footerOf(
    mode: Parameters<typeof footerItems>[3]['mode'],
    over: Over = {},
    options: {
      htr?: boolean;
      dhw?: 'external' | 'internal' | 'unused' | 'none';
      absent?: readonly RolePath[];
      none?: readonly RolePath[];
    } = {},
  ) {
    const absent = new Set<RolePath>([...(options.absent ?? []), ...(options.none ?? [])]);
    const notPresent = new Set<RolePath>(options.none ?? []);
    const entities = { ...everyEntity };
    for (const role of absent) entities[role] = undefined;
    const states = liveStates(over);
    return footerItems(readRoles(states, entities), entities, display, {
      mode,
      features: mergeFeatures(4, { htr: options.htr ?? true }),
      dhw: options.dhw ?? 'external',
      notPresent,
      absent,
    });
  }
  const shown = (items: ReturnType<typeof footerOf>): string[] =>
    items.map((item) => `${item.caption === undefined ? '' : `${item.caption} `}${item.text}`);
  const power = (items: ReturnType<typeof footerOf>): string[] =>
    items.filter((item) => item.id.endsWith('_power')).map((item) => item.id);

  test('Footer while heating: system COP, DG1 and HTR, no condensation or evaporation item', () => {
    const items = footerOf('heating', {
      'unit.winter': 'on',
      'unit.system_cop': '4.6',
      'heating.power': '5211',
      'htr.power': '1835',
    });
    expect(shown(items)).toEqual([`Outside ${nb('3.8 °C')}`, 'COP 4.6', `DG1 ${nb('5211 W')}`, `HTR ${nb('1835 W')}`]);
    expect(items.map((item) => item.id)).not.toContain('condensation_capacity');
    expect(items.map((item) => item.id)).not.toContain('evaporation_capacity');
  });

  test('DHW power: only DHW', () => {
    const items = footerOf('dhw', { 'dhw.power': '5043' });
    expect(shown(items).slice(-1)).toEqual([`DHW ${nb('5043 W')}`]);
    expect(power(items)).toEqual(['dhw_power']);
  });

  test('Active cooling with HTR: Cooling, HTR and the EER caption', () => {
    const items = footerOf(
      'active_cooling',
      { 'cooling.capacity': '4000', 'htr.power': '3200', 'unit.system_cop': '3.9' },
      { dhw: 'internal' },
    );
    expect(shown(items).slice(-3)).toEqual(['EER 3.9', `Cooling ${nb('4000 W')}`, `HTR ${nb('3200 W')}`]);
  });

  test('HTR idle while heating shows 0 W', () => {
    const items = footerOf('heating', { 'htr.active': 'off', 'htr.power': '0' });
    expect(shown(items)).toContain(`HTR ${nb('0 W')}`);
  });

  test.each(['passive_cooling', 'defrost', 'off', 'standby'] as const)('no power item in %s', (mode) => {
    expect(power(footerOf(mode))).toEqual([]);
  });

  test('DG1 without the firmware split shows the condensation capacity, and taps its entity', () => {
    const items = footerOf('heating', { 'heating.capacity': '4712' }, { absent: ['heating.power'] });
    const dg1 = items.find((item) => item.id === 'dg1_power');
    expect(dg1?.caption).toBe(FOOTER_LABELS.dg1);
    expect(dg1?.text).toBe(nb('4712 W'));
    expect(dg1?.entityId).toBe(idOf('heating.capacity'));
  });

  test('DHW without the firmware split shows the condensation capacity', () => {
    const items = footerOf('dhw', { 'heating.capacity': '4300' }, { absent: ['dhw.power'] });
    expect(shown(items).slice(-1)).toEqual([`DHW ${nb('4300 W')}`]);
  });

  test('no HTR power role: no HTR item', () => {
    expect(power(footerOf('heating', {}, { absent: ['htr.power'] }))).toEqual(['dg1_power']);
    expect(power(footerOf('active_cooling', {}, { none: ['htr.power'] }))).toEqual(['cooling_power']);
  });

  test.each([
    ['an unused tank', { dhw: 'unused' }],
    ['no tank', { dhw: 'none' }],
    ['HTR false', { htr: false }],
  ] as const)('no HTR item with %s', (_name, options) => {
    expect(power(footerOf('heating', {}, options))).toEqual(['dg1_power']);
  });

  test('power unavailable: a muted dash, not the fallback', () => {
    const items = footerOf('heating', { 'heating.power': 'unavailable', 'heating.capacity': '4712' });
    const dg1 = items.find((item) => item.id === 'dg1_power');
    expect(dg1).toMatchObject({ text: NO_VALUE, missing: true });
  });

  test('an explicit entity Home Assistant does not know is not absent: it keeps its dash', () => {
    const entities = { ...everyEntity, 'heating.power': 'sensor.typo' };
    const items = footerItems(readRoles(liveStates(), entities), entities, display, {
      mode: 'heating',
      features: mergeFeatures(4, {}),
      dhw: 'external',
      notPresent: new Set(),
      absent: new Set(),
    });
    expect(items.find((item) => item.id === 'dg1_power')).toMatchObject({ text: NO_VALUE, missing: true });
  });

  test('a capacity role set to none hides the item that falls back to it', () => {
    const items = footerOf('heating', {}, { absent: ['heating.power'], none: ['heating.capacity'] });
    expect(power(items)).toEqual(['htr_power']);
  });

  test('power items are formatted like capacities', () => {
    const items = footerOf('heating');
    for (const id of ['dg1_power', 'htr_power']) expect(items.map((item) => item.id)).toContain(id);
    expect(items.find((item) => item.id === 'dg1_power')?.text).toBe(nb('4712 W'));
  });

  test('System COP first, register COP as fallback', () => {
    const live = { 'unit.system_cop': '4.6', 'unit.cop': '5.1' } as const;
    expect(shown(footerOf('heating', live)).filter((text) => text.startsWith('COP'))).toEqual(['COP 4.6']);
    const fallback = footerOf('heating', live, { absent: ['unit.system_cop'] });
    expect(fallback.find((item) => item.id === 'cop')).toMatchObject({ text: '5.1', entityId: idOf('unit.cop') });
  });

  test('Zero is no efficiency, whichever role feeds it', () => {
    const cop = (items: ReturnType<typeof footerOf>) => items.find((item) => item.id === 'cop');
    expect(cop(footerOf('standby', { 'unit.system_cop': '0' }))).toMatchObject({ text: NO_VALUE, missing: true });
    expect(cop(footerOf('standby', { 'unit.cop': '0' }, { absent: ['unit.system_cop'] }))).toMatchObject({
      text: NO_VALUE,
      missing: true,
    });
  });

  test('EER while cooling, COP in every other mode', () => {
    const caption = (mode: Parameters<typeof footerOf>[0]) => footerOf(mode).find((item) => item.id === 'cop')?.caption;
    expect(caption('active_cooling')).toBe('EER');
    for (const mode of ['heating', 'dhw', 'passive_cooling', 'defrost', 'off', 'standby'] as const)
      expect(caption(mode), mode).toBe('COP');
  });

  test('System COP unavailable: a muted dash, not the register COP', () => {
    const items = footerOf('heating', { 'unit.system_cop': 'unavailable', 'unit.cop': '5.1' });
    expect(items.find((item) => item.id === 'cop')).toMatchObject({ text: NO_VALUE, missing: true });
  });

  test('No COP: both roles none show no COP item', () => {
    const items = footerOf('heating', {}, { none: ['unit.cop', 'unit.system_cop'] });
    expect(items.map((item) => item.id)).not.toContain('cop');
  });

  test('only the system COP set to none falls back to the register COP', () => {
    const items = footerOf('heating', { 'unit.cop': '5.1' }, { none: ['unit.system_cop'] });
    expect(items.find((item) => item.id === 'cop')?.text).toBe('5.1');
  });
});

describe('the 19 values (live-values "Values on the drawing")', () => {
  const HEATING_BOTH_DEMANDS = { 'heating.demand': 'on', 'dhw.demand': 'on' } as const;

  test('heating, model B, air, external tank, variant 4, both demands on: exactly these 19 labels', async () => {
    const card = await mount({ model: 'B', source: 'air', dhw: 'external', variant: 4 }, hassOf(HEATING_BOTH_DEMANDS));
    expect(labelIds(card).sort()).toEqual(
      [
        'production_out',
        'production_in',
        'brine_out',
        'brine_in',
        'production_pressure',
        'brine_pressure',
        'production_pump',
        'brine_pump',
        'discharge_temperature',
        'discharge_pressure',
        'suction_temperature',
        'suction_pressure',
        'compressor_speed',
        'expansion_valve',
        'superheat',
        'air_unit_out',
        'tank_external_temperature',
        'emitter_demand',
        'tank_external_demand',
      ].sort(),
    );
    expect(labelIds(card)).toHaveLength(19);
    card.remove();
  });

  test('the deleted labels are in no arrangement of any source or tank', () => {
    const DELETED = [
      'compressor_percentage',
      'compressor_power',
      'condensation_temperature',
      'evaporation_temperature',
      'fan_speed',
      'outside_temperature',
      'air_unit_in',
      'ground_in',
      'hybrid_air_unit_in',
      'dg1_setpoint',
      'tank_external_setpoint',
      'tank_external_start_delta',
      'tank_internal_setpoint',
      'tank_internal_start_delta',
    ];
    const ids = LABEL_SPECS.map((spec) => spec.id);
    for (const id of DELETED) expect(ids, id).not.toContain(id);
  });

  test('ground source: Out of the collector is the only source value', async () => {
    const card = await mount({ model: 'B', source: 'ground', dhw: 'external' }, hassOf(HEATING_BOTH_DEMANDS));
    expect(labelIds(card)).toContain('ground_out');
    expect(labelIds(card)).not.toContain('ground_in');
    card.remove();
  });

  test('no in-drawing caption names a group or part (responsive-layout "No in-drawing captions")', async () => {
    const CAPTIONS = ['DG1', 'Outer loop', 'DHW', 'Air unit', 'Ground loop', 'DHW tank'];
    for (const layout of ['horizontal', 'vertical'] as const) {
      for (const source of ['air', 'ground', 'hybrid'] as const) {
        for (const [model, dhw] of [
          ['B', 'external'],
          ['C', 'internal'],
        ] as const) {
          const card = await mount({ model, source, dhw, layout }, hassOf(HEATING_BOTH_DEMANDS));
          const drawn = [...root(card).querySelectorAll('svg text')].map((text) => text.textContent.trim());
          for (const caption of CAPTIONS)
            expect(drawn, `${layout} ${source} ${model} ${caption}`).not.toContain(caption);
          expect(root(card).querySelector('.circuit-label, .source-caption, .tank-caption')).toBeNull();
          card.remove();
        }
      }
    }
  });
});

describe('footer items by mode (live-values "Footer", "Power items in the footer")', () => {
  const ids = (card: EcogeoCard): string[] =>
    [...root(card).querySelectorAll('[data-footer]')].map((element) => element.getAttribute('data-footer') ?? '');
  const text = (card: EcogeoCard, id: string): string | undefined =>
    root(card)
      .querySelector(`[data-footer="${id}"]`)
      ?.textContent.replaceAll(/[ \t\r\n]+/g, ' ')
      .trim();

  test('heating: outside temperature, COP, DG1 and HTR', async () => {
    const card = await mount({}, hassOf({ 'unit.system_cop': '4.6', 'heating.power': '5211', 'htr.power': '1835' }));
    expect(root(card).querySelector('.mode')?.textContent.trim()).toBe(MODE_LABELS.heating);
    expect(ids(card)).toEqual(['outside_temperature', 'cop', 'dg1_power', 'htr_power']);
    expect(text(card, 'cop')).toBe('COP 4.6');
    expect(text(card, 'dg1_power')).toBe(`DG1 ${nb('5211 W')}`);
    expect(text(card, 'htr_power')).toBe(`HTR ${nb('1835 W')}`);
    card.remove();
  });

  test('DHW: outside temperature, COP and DHW only', async () => {
    const card = await mount({}, hassOf({ 'dhw.demand': 'on', 'dhw.power': '5043' }));
    expect(root(card).querySelector('.mode')?.textContent.trim()).toBe(MODE_LABELS.dhw);
    expect(ids(card)).toEqual(['outside_temperature', 'cop', 'dhw_power']);
    expect(text(card, 'dhw_power')).toBe(`DHW ${nb('5043 W')}`);
    card.remove();
  });

  test('active cooling with HTR: outside temperature, EER, Cooling and HTR', async () => {
    const card = await mount(
      { features: { htr: true, active_cooling: true } },
      hassOf({
        'unit.summer': 'on',
        'unit.winter': 'off',
        'cooling.capacity': '4000',
        'htr.power': '3200',
      }),
    );
    expect(root(card).querySelector('.mode')?.textContent.trim()).toBe(MODE_LABELS.active_cooling);
    expect(ids(card)).toEqual(['outside_temperature', 'cop', 'cooling_power', 'htr_power']);
    expect(text(card, 'cop')).toContain('EER');
    expect(text(card, 'cooling_power')).toBe(`Cooling ${nb('4000 W')}`);
    expect(text(card, 'htr_power')).toBe(`HTR ${nb('3200 W')}`);
    card.remove();
  });

  test('passive cooling: outside temperature and COP, no power item', async () => {
    const card = await mount(
      { features: { passive_cooling: true } },
      hassOf({
        'unit.summer': 'on',
        'unit.winter': 'off',
        'compressor.speed': '0',
        'compressor.percentage': '0',
        'compressor.power': '0',
        'production.pump': '40',
      }),
    );
    expect(root(card).querySelector('.mode')?.textContent.trim()).toBe(MODE_LABELS.passive_cooling);
    expect(ids(card)).toEqual(['outside_temperature', 'cop']);
    card.remove();
  });
});
