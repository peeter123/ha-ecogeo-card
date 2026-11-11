import { describe, expect, test } from 'vitest';
import '../../src/index';
import { EcogeoCard } from '../../src/card/ecogeo-card';
import type { CardConfig } from '../../src/lib/config';
import type { HassLike } from '../../src/lib/hass';
import { DHW_LABELS } from '../../src/strings';
import { DEMO_PREFIX, SCENARIOS, scenarioStates } from '../../dev/scenarios';

async function mount(config: CardConfig = {}, hass?: HassLike): Promise<EcogeoCard> {
  const card = document.createElement('ecogeo-card') as EcogeoCard;
  card.setConfig({ type: 'custom:ecogeo-card', ...config });
  if (hass !== undefined) card.hass = hass;
  document.body.append(card);
  await card.updateComplete;
  return card;
}

const hot: HassLike = {
  states: Object.fromEntries(
    Object.entries(scenarioStates(SCENARIOS.dhw.states)).map(([id, value]) => [id, { entity_id: id, ...value }]),
  ),
};

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

  test('external tank: a rounded cylinder (straight walls, domed caps) whose body keeps the DHW colour hook', async () => {
    const card = await mount({ model: 'B', dhw: 'external' });
    const body = root(card).querySelector('path.tank-body[data-dhw-tank="external"]');
    expect(body?.getAttribute('fill')).toContain('--dhw-tank-color');
    const d = body?.getAttribute('d') ?? '';
    expect(d).toMatch(/^M806 164 A89 14 0 0 1 984 164 V316 A89 14 0 0 1 806 316 Z$/);
    expect(root(card).querySelector('.dhw-storage .tank-rim')).not.toBeNull();
    card.remove();
  });

  test('helical coil: at least four turns, front halves solid, back halves faint, flow on the front halves only', async () => {
    const card = await mount({ prefix: DEMO_PREFIX, model: 'B', dhw: 'external' }, hot);
    const halves = [...root(card).querySelectorAll('[data-segment="dhw_ext_coil"] path[data-half]')];
    const front = halves.filter((half) => half.getAttribute('data-half') === 'front');
    const back = halves.filter((half) => half.getAttribute('data-half') === 'back');
    expect(halves.length).toBeGreaterThanOrEqual(8);
    expect(front.length + back.length).toBe(halves.length);
    expect(front.length).toBeGreaterThanOrEqual(4);
    expect(back.length).toBeGreaterThanOrEqual(4);
    for (const half of front) expect(half.hasAttribute('opacity')).toBe(false);
    for (const half of back) expect(Number(half.getAttribute('opacity'))).toBeLessThan(0.5);
    // same colour on every half, and the pipes' base stroke
    expect(new Set(halves.map((half) => half.getAttribute('style'))).size).toBe(1);
    expect(halves.every((half) => half.classList.contains('pipe'))).toBe(true);
    // the dash overlay follows the front halves only
    const flow = root(card).querySelector('[data-flow="dhw_ext_coil"]');
    expect(flow).not.toBeNull();
    expect((flow?.getAttribute('d') ?? '').match(/M/g)).toHaveLength(front.length);
    for (const half of front) expect(flow?.getAttribute('d')).toContain(half.getAttribute('d'));
    for (const half of back) expect(flow?.getAttribute('d')).not.toContain(half.getAttribute('d'));
    // its ends meet the pipes from ports 5 and 6
    const d = (id: string): string => root(card).querySelector(`[data-segment="${id}"]`)?.getAttribute('d') ?? '';
    expect(d('dhw_ext_in').endsWith('L940 212')).toBe(true);
    expect(halves[0]?.getAttribute('d')?.startsWith('M940 212')).toBe(true);
    expect(halves.at(-1)?.getAttribute('d')?.endsWith('840 296')).toBe(true);
    expect(d('dhw_ext_out').startsWith('M840 296')).toBe(true);
    card.remove();
  });

  test('helical coil: muted without a flow, no overlay', async () => {
    const card = await mount({ prefix: DEMO_PREFIX, model: 'B', dhw: 'external' }, { states: {} });
    expect(root(card).querySelector('[data-flow="dhw_ext_coil"]')).toBeNull();
    const halves = [...root(card).querySelectorAll('[data-segment="dhw_ext_coil"] path[data-half]')];
    expect(halves.length).toBeGreaterThanOrEqual(8);
    expect(halves.every((half) => half.classList.contains('muted'))).toBe(true);
    card.remove();
  });

  test('simplified model C: coil 51 is drawn as a helix of the same kind (front solid, back faint)', async () => {
    const card = await mount({ model: 'C' });
    const coil = root(card).querySelector('[data-item="51"] .symbol.coil');
    const paths = [...(coil?.querySelectorAll('path[data-half]') ?? [])];
    const faint = paths.filter((path) => path.getAttribute('data-half') === 'back');
    const solid = paths.filter((path) => path.getAttribute('data-half') === 'front');
    expect(solid).toHaveLength(6);
    expect(faint).toHaveLength(5);
    for (const path of solid) expect(path.hasAttribute('opacity')).toBe(false);
    for (const path of faint) expect(path.hasAttribute('opacity')).toBe(true);
    expect(root(card).querySelector('[data-item="52"]')).toBeNull();
    expect(root(card).querySelector('[data-item="53"]')).toBeNull();
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
