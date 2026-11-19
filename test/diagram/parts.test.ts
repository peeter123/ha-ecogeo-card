// The one drawing level (rework-layouts D1; schematic-drawing "Refrigerant components", "Hydraulic components", dhw-storage
// "Model C tank"): the drawing shows the refrigerant and hydraulic parts the card tells about, with no item numbers, and
// leaves out the service and safety parts of the manual figure (items 18-21, 23, 24, 39-41, 52, 53) and their stub pipes.
import { describe, expect, test } from 'vitest';
import '../../src/index';
import { EcogeoCard } from '../../src/card/ecogeo-card';
import { arrangementFor } from '../../src/diagram/geometry';
import type { CardConfig } from '../../src/lib/config';

const { components: COMPONENTS, segments: SEGMENTS } = arrangementFor('horizontal');

const ALL_TRUE = { active_cooling: true, passive_cooling: true, htr: true, backup_heater: true };

async function mount(config: CardConfig = {}): Promise<EcogeoCard> {
  const card = document.createElement('ecogeo-card') as EcogeoCard;
  card.setConfig({ type: 'custom:ecogeo-card', ...config });
  document.body.append(card);
  await card.updateComplete;
  return card;
}

const root = (card: EcogeoCard): ShadowRoot => {
  if (card.shadowRoot === null) throw new Error('no shadow root');
  return card.shadowRoot;
};
const items = (card: EcogeoCard): Set<number> =>
  new Set([...root(card).querySelectorAll('[data-item]')].map((element) => Number(element.getAttribute('data-item'))));
const segments = (card: EcogeoCard): Set<string> =>
  new Set(
    [...root(card).querySelectorAll('[data-segment]')].map((element) => element.getAttribute('data-segment') ?? ''),
  );
/** The drawn texts inside the components: only the probes' letters (class glyph) are allowed, no item numbers. */
const itemTexts = (card: EcogeoCard): number => root(card).querySelectorAll('[data-item] text:not(.glyph)').length;

const REFRIGERANT = [7, 8, 11, 12, 13, 14, 29, 30, 35, 36];
const HYDRAULIC = [9, 10, 15, 16, 17, 22, 25, 26, 27, 28, 31, 32, 33, 34, 37, 38, 44, 45];
const LEFT_OUT = [18, 19, 20, 21, 23, 24, 39, 40, 41, 52, 53];
const LEFT_OUT_STUBS = ['prod_tap_b', 'prod_drain', 'brine_tap_b', 'brine_drain'];

describe('the drawn parts', () => {
  test('no item number anywhere and no safety valves', async () => {
    const card = await mount({ features: ALL_TRUE });
    expect(itemTexts(card)).toBe(0);
    expect(items(card).has(20)).toBe(false);
    expect(items(card).has(21)).toBe(false);
    card.remove();
  });

  test('Refrigerant components: 7-14, 29, 30, 35 and 36 without item numbers, 39, 40 and 41 not drawn', async () => {
    const card = await mount({ variant: 4, features: ALL_TRUE });
    for (const item of REFRIGERANT) expect(items(card).has(item), String(item)).toBe(true);
    for (const item of [39, 40, 41]) expect(items(card).has(item), String(item)).toBe(false);
    expect(itemTexts(card)).toBe(0);
    card.remove();
  });

  test('Hydraulic components: the circuits without item numbers, 18-21, 23, 24 and their stub pipes not drawn', async () => {
    const card = await mount({ variant: 4, features: ALL_TRUE });
    for (const item of HYDRAULIC) expect(items(card).has(item), String(item)).toBe(true);
    for (const item of [18, 19, 20, 21, 23, 24]) expect(items(card).has(item), String(item)).toBe(false);
    for (const id of LEFT_OUT_STUBS) expect(segments(card).has(id), id).toBe(false);
    expect(itemTexts(card)).toBe(0);
    card.remove();
  });

  test('the transducers, valves 22/25 and thermostat 45 stay; the transducers have no stub pipe', async () => {
    const card = await mount({ features: ALL_TRUE });
    for (const item of [35, 36, 37, 38, 22, 25, 45]) expect(items(card).has(item), String(item)).toBe(true);
    expect(segments(card).has('htr_drain')).toBe(true);
    // the transducers sit on their lines: no stub pipe leads to them (schematic-drawing "Transducers on their lines")
    for (const id of ['prod_tap_a', 'brine_tap_a']) expect(segments(card).has(id), id).toBe(false);
    card.remove();
  });

  test('model C: the manual trap 52 and drain valve 53 are not drawn, coil 51 and probe 54 are', async () => {
    const card = await mount({ model: 'C' });
    expect(items(card).has(52)).toBe(false);
    expect(items(card).has(53)).toBe(false);
    for (const item of [47, 48, 49, 50, 51, 54]) expect(items(card).has(item), String(item)).toBe(true);
    expect(itemTexts(card)).toBe(0);
    card.remove();
  });

  test('the lists hold none of the left-out parts, nor a `detail` field', () => {
    const drawn = new Set(COMPONENTS.map((component) => component.item));
    for (const item of LEFT_OUT) expect(drawn.has(item), String(item)).toBe(false);
    for (const id of LEFT_OUT_STUBS)
      expect(
        SEGMENTS.some((segment) => segment.id === id),
        id,
      ).toBe(false);
    for (const part of [...COMPONENTS, ...SEGMENTS])
      expect(part, JSON.stringify(part).slice(0, 40)).not.toHaveProperty('detail');
    for (const part of COMPONENTS) expect(part, String(part.item)).not.toHaveProperty('tag');
  });
});
