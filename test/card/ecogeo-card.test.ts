import { describe, expect, test, vi } from 'vitest';
import '../../src/index';
import type { EcogeoCard } from '../../src/card/ecogeo-card';
import type { CardConfig } from '../../src/lib/config';
import type { HassLike } from '../../src/lib/hass';
import { NBSP, INDICATIONS, MODE_LABELS } from '../../src/strings';
import { absentOptionalRoles, readRoles } from '../../src/calc/readings';
import { SAMPLE_ENTITIES, SAMPLE_STATES } from '../../src/config/sample';
import { footerItems } from '../../src/diagram/labels';
import { mergeFeatures } from '../../src/config/variants';
import { state, states } from '../helpers';

async function mount(config: CardConfig = { type: 'custom:ecogeo-card' }, hass?: HassLike): Promise<EcogeoCard> {
  const card = document.createElement('ecogeo-card') as EcogeoCard;
  card.setConfig(config);
  if (hass !== undefined) card.hass = hass;
  document.body.append(card);
  await card.updateComplete;
  return card;
}

const text = (card: EcogeoCard, selector: string): string | undefined =>
  card.shadowRoot?.querySelector(selector)?.textContent.trim();

const P = 'demo_ecogeo';
const hassWith = (...entries: readonly (readonly [string, string, string?])[]): HassLike => ({
  states: states(...entries),
});

describe('ecogeo-card frame', () => {
  test('the element registers and renders an svg with the viewBox of add-schematic-card D5 and the cabinet', async () => {
    const card = await mount();
    const svg = card.shadowRoot?.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute('viewBox')).toBe('0 0 1000 755');
    expect(svg?.querySelector('g.cabinet')).not.toBeNull();
    card.remove();
  });

  test('size hints (add-schematic-card D6)', async () => {
    const card = await mount();
    expect(card.getCardSize()).toBe(10);
    expect(card.getGridOptions()).toEqual({ columns: 'full', rows: 'auto', min_rows: 8 });
    card.remove();
  });
});

describe('configuration errors', () => {
  const card = document.createElement('ecogeo-card') as EcogeoCard;

  test.each([
    [{ model: 'D' }, 'model'],
    [{ colour: 'red' }, 'colour'],
    [{ model: 'B', dhw: 'internal' }, 'dhw'],
    [{ features: { solar: true } }, 'solar'],
    [{ entities: { production: { flow: 'sensor.x' } } }, 'production.flow'],
    [{ entities: { dhw: { temperature: 52 } } }, 'dhw.temperature'],
  ])('setConfig throws for %j and names %s', (config, name) => {
    expect(() => {
      card.setConfig({ type: 'custom:ecogeo-card', ...config });
    }).toThrow(name);
  });

  test('a valid config does not throw', () => {
    expect(() => {
      card.setConfig({ type: 'custom:ecogeo-card', prefix: P });
      card.setConfig({ type: 'custom:ecogeo-card' });
    }).not.toThrow();
  });
});

describe('sample mode', () => {
  test('an empty config shows the heating mode and the Sample values note', async () => {
    const card = await mount();
    expect(text(card, '.mode')).toBe(MODE_LABELS.heating);
    expect(text(card, '.sample')).toBe(INDICATIONS.sampleValues);
    expect(card.shadowRoot?.querySelector('.alarm')).toBeNull();
    expect(card.shadowRoot?.querySelector('.offline')).toBeNull();
    card.remove();
  });

  test('card-config "Sample footer": the sample DG1 power and system COP, not the capacity or the register COP', async () => {
    const card = await mount();
    const footer = (id: string) => text(card, `[data-footer="${id}"] .value`);
    expect(footer('dg1_power')).toBe(`4712${NBSP}W`);
    expect(footer('cop')).toMatch(/^5[.,]8$/);
    expect(card.shadowRoot?.querySelector('[data-footer="condensation_capacity"]')).toBeNull();
    card.remove();
    // The sample's entities are not buttons, so the entity behind each item is read from the pure function.
    const items = footerItems(
      readRoles(SAMPLE_STATES, SAMPLE_ENTITIES),
      SAMPLE_ENTITIES,
      { locale: {} },
      {
        mode: 'heating',
        features: mergeFeatures(4, {}),
        source: 'ground',
        dhw: 'external',
        notPresent: new Set(),
        absent: absentOptionalRoles(SAMPLE_STATES, SAMPLE_ENTITIES, new Set()),
      },
    );
    expect(items.find((item) => item.id === 'dg1_power')?.entityId).toBe(SAMPLE_ENTITIES['heating.power']);
    expect(items.find((item) => item.id === 'dg1_power')?.entityId).not.toBe(SAMPLE_ENTITIES['heating.capacity']);
    expect(items.find((item) => item.id === 'cop')?.entityId).toBe(SAMPLE_ENTITIES['unit.system_cop']);
  });

  test('a prefix ends sample mode: no note, and with no entities in hass the mode is standby', async () => {
    const card = await mount({ type: 'custom:ecogeo-card', prefix: P }, { states: {} });
    expect(card.shadowRoot?.querySelector('.sample')).toBeNull();
    expect(text(card, '.mode')).toBe(MODE_LABELS.standby);
    card.remove();
  });
});

describe('optional roles (add-htr-state)', () => {
  const dg1 = `sensor.${P}_heating_power_dg1`;

  test('Older firmware: with a prefix and no optional entity the card renders without a configuration error', async () => {
    const config = { type: 'custom:ecogeo-card', prefix: P };
    expect(() => {
      (document.createElement('ecogeo-card') as EcogeoCard).setConfig(config);
    }).not.toThrow();
    const card = await mount(config, { states: {} });
    expect(card.shadowRoot?.querySelector('svg')).not.toBeNull();
    expect(card.shadowRoot?.querySelector('.error')).toBeNull();
    card.remove();
  });

  test('the default entity of an absent optional role is watched: adding it to hass.states re-renders', async () => {
    const card = await mount({ type: 'custom:ecogeo-card', prefix: P }, { states: {} });
    const inner = card as unknown as { entityIds: string[]; renderedHass: HassLike | undefined };
    expect(inner.entityIds).toContain(dg1);
    const next = hassWith([dg1, '4000', 'W']);
    card.hass = next;
    await card.updateComplete;
    expect(inner.renderedHass).toBe(next);
    card.remove();
  });
});

describe('none is not a sample config', () => {
  test('only unit.cop none: no sample values and no Sample values note', async () => {
    const card = await mount({ type: 'custom:ecogeo-card', entities: { unit: { cop: 'none' } } }, { states: {} });
    expect(card.shadowRoot?.querySelector('.sample')).toBeNull();
    expect(text(card, '.mode')).toBe(MODE_LABELS.standby);
    card.remove();
  });
});

describe('brine pump not present', () => {
  const heating = [
    [`sensor.${P}_compressor_rpm`, '2803', 'RPM'],
    [`binary_sensor.${P}_winter`, 'on'],
    [`sensor.${P}_heatpump_on_off`, 'ON'],
    [`sensor.${P}_brine_out`, '8.0', '°C'],
  ] as const;
  const brinePipe = (card: EcogeoCard): Element | null | undefined =>
    card.shadowRoot?.querySelector('[data-segment="src_out"]');

  test('a prefix-only heating snapshot with brine.pump none has an active brine circuit; with the default pump entity it is muted', async () => {
    const without = await mount(
      { type: 'custom:ecogeo-card', prefix: P, entities: { brine: { pump: 'none' } } },
      hassWith(...heating),
    );
    expect(text(without, '.mode')).toBe(MODE_LABELS.heating);
    expect(brinePipe(without)?.classList.contains('muted')).toBe(false);
    without.remove();
    const gated = await mount({ type: 'custom:ecogeo-card', prefix: P }, hassWith(...heating));
    expect(brinePipe(gated)?.classList.contains('muted')).toBe(true);
    gated.remove();
  });
});

describe('mode, alarm and offline indications', () => {
  const heating = [
    [`sensor.${P}_compressor_rpm`, '2803', 'RPM'],
    [`binary_sensor.${P}_winter`, 'on'],
    [`binary_sensor.${P}_summer`, 'off'],
    [`sensor.${P}_heatpump_on_off`, 'ON'],
  ] as const;

  test('mode label from the live states', async () => {
    const card = await mount({ type: 'custom:ecogeo-card', prefix: P }, hassWith(...heating));
    expect(text(card, '.mode')).toBe(MODE_LABELS.heating);
    card.remove();
  });

  test('mode label: passive cooling, the compressor stopped in summer with the production pump running', async () => {
    const hass = hassWith(
      [`sensor.${P}_compressor_rpm`, '0', 'RPM'],
      [`binary_sensor.${P}_summer`, 'on'],
      [`binary_sensor.${P}_winter`, 'off'],
      [`sensor.${P}_heatpump_on_off`, 'ON'],
      [`sensor.${P}_production_pump`, '60', '%'],
    );
    const card = await mount({ type: 'custom:ecogeo-card', prefix: P }, hass);
    expect(text(card, '.mode')).toBe('Passive cooling');
    card.remove();
  });

  test('alarm indication in addition to the mode', async () => {
    const hass = hassWith(...heating, [`binary_sensor.${P}_alarm`, 'on']);
    const card = await mount({ type: 'custom:ecogeo-card', prefix: P }, hass);
    expect(text(card, '.mode')).toBe(MODE_LABELS.heating);
    expect(text(card, '.alarm')).toBe(INDICATIONS.alarm);
    card.remove();
  });

  test('offline indication from the connection entity, mode standby when everything is unavailable', async () => {
    const hass = hassWith([`binary_sensor.${P}_status`, 'off'], [`sensor.${P}_compressor_rpm`, 'unavailable']);
    const card = await mount({ type: 'custom:ecogeo-card', prefix: P }, hass);
    expect(text(card, '.offline')).toBe(INDICATIONS.offline);
    expect(text(card, '.mode')).toBe(MODE_LABELS.standby);
    card.remove();
  });

  test('no offline indication while the connection is on, or has no entity', async () => {
    const on = await mount({ type: 'custom:ecogeo-card', prefix: P }, hassWith([`binary_sensor.${P}_status`, 'on']));
    expect(on.shadowRoot?.querySelector('.offline')).toBeNull();
    on.remove();
    const none = await mount({ type: 'custom:ecogeo-card', prefix: P }, { states: {} });
    expect(none.shadowRoot?.querySelector('.offline')).toBeNull();
    none.remove();
  });

  test('the card updates when a state of its entities changes, and skips unrelated ones', async () => {
    const card = await mount({ type: 'custom:ecogeo-card', prefix: P }, hassWith(...heating));
    expect(text(card, '.mode')).toBe(MODE_LABELS.heating);
    const render = vi.spyOn(card as unknown as { render(): unknown }, 'render');
    const base = card.hass ?? { states: {} };
    card.hass = { ...base, states: { ...base.states, 'light.kitchen': state('light.kitchen', 'on') } };
    await card.updateComplete;
    expect(render).not.toHaveBeenCalled();
    card.hass = hassWith(...heating.slice(1), [`sensor.${P}_compressor_rpm`, '0', 'RPM']);
    await card.updateComplete;
    expect(render).toHaveBeenCalledTimes(1);
    expect(text(card, '.mode')).toBe(MODE_LABELS.standby);
    card.remove();
  });
});

describe('states option in the card', () => {
  test('own off and defrost texts reach the mode', async () => {
    const config = { type: 'custom:ecogeo-card', prefix: P, states: { off: ['Uit'], defrost: ['Ontdooien'] } };
    const off = await mount(config, hassWith([`sensor.${P}_heatpump_on_off`, 'Uit']));
    expect(text(off, '.mode')).toBe(MODE_LABELS.off);
    off.remove();
    const defrost = await mount(config, hassWith([`sensor.${P}_compressor_operation_mode`, 'Ontdooien']));
    expect(text(defrost, '.mode')).toBe(MODE_LABELS.defrost);
    defrost.remove();
  });
});

describe('on/off entity in the card', () => {
  test('a switch bound to the on/off role that reads off gives the off mode', async () => {
    const config = { type: 'custom:ecogeo-card', prefix: P, entities: { unit: { on_off: 'switch.heat_pump' } } };
    const card = await mount(config, hassWith(['switch.heat_pump', 'off'], [`sensor.${P}_compressor_rpm`, '2000']));
    expect(text(card, '.mode')).toBe(MODE_LABELS.off);
    card.remove();
  });
});
