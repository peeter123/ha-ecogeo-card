// The detail level (design D1; schematic-drawing "Detail level", "Refrigerant components", "Hydraulic components",
// dhw-storage "Simplified model C"): simplified leaves out the service and safety parts and every item number.
import { describe, expect, test } from 'vitest';
import '../../src/index';
import { EcogeoCard } from '../../src/card/ecogeo-card';
import { COMPONENTS, SEGMENTS } from '../../src/diagram/geometry';
import type { CardConfig } from '../../src/lib/config';

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
const itemTexts = (card: EcogeoCard): number => root(card).querySelectorAll('text.item').length;

const REFRIGERANT = [7, 8, 11, 12, 13, 14, 29, 30, 35, 36];
const HYDRAULIC = [9, 10, 15, 16, 17, 22, 25, 26, 27, 28, 31, 32, 33, 34, 37, 38, 44, 45];
const LEFT_OUT = [18, 19, 20, 21, 23, 24, 39, 40, 41];
const LEFT_OUT_STUBS = ['prod_tap_b', 'prod_drain', 'brine_tap_b', 'brine_drain'];

describe('detail level', () => {
  test('default is simplified: no item number anywhere and no safety valves', async () => {
    const card = await mount({ features: ALL_TRUE });
    expect(itemTexts(card)).toBe(0);
    expect(items(card).has(20)).toBe(false);
    expect(items(card).has(21)).toBe(false);
    card.remove();
  });

  test('simplified refrigerant: 7-14, 29, 30, 35 and 36 without item numbers, 39, 40 and 41 not drawn', async () => {
    const card = await mount({ variant: 4, features: ALL_TRUE });
    for (const item of REFRIGERANT) expect(items(card).has(item), String(item)).toBe(true);
    for (const item of [39, 40, 41]) expect(items(card).has(item), String(item)).toBe(false);
    expect(itemTexts(card)).toBe(0);
    card.remove();
  });

  test('simplified hydraulics: the circuits without item numbers, 18-21, 23, 24 and their stub pipes not drawn', async () => {
    const card = await mount({ variant: 4, features: ALL_TRUE });
    for (const item of HYDRAULIC) expect(items(card).has(item), String(item)).toBe(true);
    for (const item of [18, 19, 20, 21, 23, 24]) expect(items(card).has(item), String(item)).toBe(false);
    for (const id of LEFT_OUT_STUBS) expect(segments(card).has(id), id).toBe(false);
    expect(itemTexts(card)).toBe(0);
    card.remove();
  });

  test('simplified keeps the transducers, valves 22/25 and thermostat 45, with the pipes they sit on', async () => {
    const card = await mount({ features: ALL_TRUE });
    for (const item of [35, 36, 37, 38, 22, 25, 45]) expect(items(card).has(item), String(item)).toBe(true);
    for (const id of ['prod_tap_a', 'brine_tap_a', 'htr_drain']) expect(segments(card).has(id), id).toBe(true);
    card.remove();
  });

  test('simplified model C: the manual trap 52 and drain valve 53 are not drawn, coil 51 and probe 54 are', async () => {
    const card = await mount({ model: 'C' });
    expect(items(card).has(52)).toBe(false);
    expect(items(card).has(53)).toBe(false);
    for (const item of [47, 48, 49, 50, 51, 54]) expect(items(card).has(item), String(item)).toBe(true);
    expect(itemTexts(card)).toBe(0);
    card.remove();
  });

  test('full detail: every part of the figure with its item number, ports included', async () => {
    const card = await mount({ variant: 4, features: ALL_TRUE, detail: 'full' });
    for (const item of [...REFRIGERANT, ...HYDRAULIC, ...LEFT_OUT, 1, 2, 3, 4, 5, 6]) {
      expect(items(card).has(item), String(item)).toBe(true);
    }
    for (const id of LEFT_OUT_STUBS) expect(segments(card).has(id), id).toBe(true);
    const texts = [...root(card).querySelectorAll('[data-item]')].map((group) =>
      group.querySelector('text.item')?.textContent.trim(),
    );
    expect(texts).toEqual(
      [...root(card).querySelectorAll('[data-item]')].map((group) => group.getAttribute('data-item')),
    );
    card.remove();
  });

  test('full detail on model C draws 52 and 53 with their numbers', async () => {
    const card = await mount({ model: 'C', detail: 'full' });
    for (const item of [52, 53]) {
      expect(items(card).has(item), String(item)).toBe(true);
      expect(
        root(card)
          .querySelector(`[data-item="${String(item)}"] text.item`)
          ?.textContent.trim(),
      ).toBe(String(item));
    }
    card.remove();
  });

  test('the marked parts are exactly those of design D1', () => {
    const marked = COMPONENTS.filter((component) => component.detail === 'full').map((component) => component.item);
    expect([...new Set(marked)].sort((a, b) => a - b)).toEqual([18, 19, 20, 21, 23, 24, 39, 40, 41, 52, 53]);
    expect(marked.filter((item) => item === 41)).toHaveLength(2);
    const markedIds = SEGMENTS.filter((segment) => segment.detail === 'full').map((segment) => segment.id);
    expect(markedIds.sort()).toEqual([...LEFT_OUT_STUBS].sort());
  });
});
