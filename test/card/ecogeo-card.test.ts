import { describe, expect, test, vi } from 'vitest';
import '../../src/index';
import type { EcogeoCard } from '../../src/card/ecogeo-card';
import type { CardConfig } from '../../src/lib/config';
import type { HassLike } from '../../src/lib/hass';
import { INDICATIONS, MODE_LABELS } from '../../src/strings';
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
  test('the element registers and renders an svg with the viewBox of design D5', async () => {
    const card = await mount();
    const svg = card.shadowRoot?.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute('viewBox')).toBe('0 0 1000 620');
    expect(svg?.children).toHaveLength(0);
    card.remove();
  });

  test('size hints (design D6)', async () => {
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

  test('a prefix ends sample mode: no note, and with no entities in hass the mode is standby', async () => {
    const card = await mount({ type: 'custom:ecogeo-card', prefix: P }, { states: {} });
    expect(card.shadowRoot?.querySelector('.sample')).toBeNull();
    expect(text(card, '.mode')).toBe(MODE_LABELS.standby);
    card.remove();
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
