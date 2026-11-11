import { describe, expect, test } from 'vitest';
import '../../src/index';
import { EcogeoCard } from '../../src/card/ecogeo-card';
import type { CardConfig } from '../../src/lib/config';
import { DHW_LABELS } from '../../src/strings';

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
const items = (card: EcogeoCard): number[] =>
  [...root(card).querySelectorAll('[data-item]')].map((element) => Number(element.getAttribute('data-item')));
const segments = (card: EcogeoCard): string[] =>
  [...root(card).querySelectorAll('[data-segment]')].map((element) => element.getAttribute('data-segment') ?? '');
const tanks = (card: EcogeoCard): string[] =>
  [...root(card).querySelectorAll('[data-dhw-tank]')].map((element) => element.getAttribute('data-dhw-tank') ?? '');

describe('DHW storage', () => {
  test('external: a tank with a coil right of the cabinet, joined to ports 5 and 6', async () => {
    const card = await mount({ model: 'B', dhw: 'external' });
    expect(tanks(card)).toEqual(['external']);
    expect(root(card).querySelector('.tank-caption')?.textContent.trim()).toBe(DHW_LABELS.externalTank);
    expect(segments(card)).toEqual(expect.arrayContaining(['dhw_ext_in', 'dhw_ext_coil', 'dhw_ext_out']));
    expect(items(card)).toEqual(expect.arrayContaining([5, 6, 26]));
    const d = (id: string): string => root(card).querySelector(`[data-segment="${id}"]`)?.getAttribute('d') ?? '';
    expect(d('dhw_ext_in').startsWith('M722 130 L722 50')).toBe(true);
    expect(d('dhw_ext_out').endsWith('L748 130')).toBe(true);
    expect(items(card).some((item) => item >= 47)).toBe(false);
    card.remove();
  });

  test('internal (model C): tank 50 with coil 51, probe 54, trap 52, drain valve 53 and stubs 47 to 49', async () => {
    const card = await mount({ model: 'C', detail: 'full' });
    expect(items(card)).toEqual(expect.arrayContaining([47, 48, 49, 50, 51, 52, 53, 54, 26]));
    expect(items(card)).not.toContain(5);
    expect(items(card)).not.toContain(6);
    expect(tanks(card)).toEqual(['internal']);
    expect(segments(card)).toEqual(expect.arrayContaining(['tap_47', 'tap_48', 'tap_49']));
    expect(segments(card).some((id) => id.startsWith('dhw_ext_'))).toBe(false);
    expect(root(card).querySelector('.dhw-storage')).toBeNull();
    for (const item of [47, 48, 49, 50, 51, 52, 53, 54]) {
      expect(
        root(card)
          .querySelector(`[data-item="${String(item)}"] text.item`)
          ?.textContent.trim(),
      ).toBe(String(item));
    }
    card.remove();
  });

  test('none: no tank, no DHW pipes, no ports 5 and 6, no valve 26 and no tank items', async () => {
    for (const model of ['B', 'C'] as const) {
      const card = await mount({ model, dhw: 'none' });
      expect(tanks(card)).toEqual([]);
      expect(root(card).querySelector('.dhw-storage')).toBeNull();
      for (const item of [5, 6, 26, 47, 48, 49, 50, 51, 52, 53, 54]) expect(items(card)).not.toContain(item);
      expect(segments(card).filter((id) => /^(dhw_|tap_)/.test(id))).toEqual([]);
      card.remove();
    }
  });

  test('both tank bodies carry the hook for the DHW temperature colour', async () => {
    for (const model of ['B', 'C'] as const) {
      const card = await mount({ model });
      expect(root(card).querySelector('.tank-body')?.getAttribute('fill')).toContain('--dhw-tank-color');
      card.remove();
    }
  });
});
