// The vertical layout's rotated values in real engines (responsive-layout "Rotated values in the vertical layout", "Minimum rendered
// sizes"): a turned label's box is taller than wide, it reads bottom to top, its font is still at least 10 px, and the horizontal layout
// turns nothing. Measured in Chromium and WebKit.
import { afterEach, describe, expect, test } from 'vitest';
import '../../dev/ha-stubs';
import '../../src/index';
import { EMULATOR_FONT } from '../../dev/overlaps';
import { MockHass } from '../../dev/mock-hass';
import { DEMO_PREFIX, SCENARIOS, scenarioStates } from '../../dev/scenarios';
import type { EcogeoCard } from '../../src/card/ecogeo-card';

afterEach(() => {
  document.body.replaceChildren();
});

const TURNED = [
  'production_out',
  'production_in',
  'production_pressure',
  'brine_out',
  'brine_in',
  'brine_pressure',
  'brine_pump',
];

async function show(width: number, layout: 'horizontal' | 'vertical'): Promise<ShadowRoot> {
  const wrapper = document.createElement('div');
  wrapper.style.width = `${String(width)}px`;
  wrapper.style.fontFamily = EMULATOR_FONT.family;
  wrapper.style.fontSize = EMULATOR_FONT.size;
  const card = document.createElement('ecogeo-card') as EcogeoCard;
  card.setConfig({ type: 'custom:ecogeo-card', prefix: DEMO_PREFIX, source: 'air', layout });
  card.hass = new MockHass().build(scenarioStates(SCENARIOS.heating.states), false);
  wrapper.append(card);
  document.body.append(wrapper);
  await card.updateComplete;
  await expect.poll(() => card.width).toBe(width);
  await card.updateComplete;
  await document.fonts.ready;
  if (card.shadowRoot === null) throw new Error('no shadow root');
  return card.shadowRoot;
}

describe('rotated values', () => {
  test.each([320, 360, 412, 559])(
    'at %i px the seven turned values are taller than wide and at least 10 px',
    async (width) => {
      const root = await show(width, 'vertical');
      const turned = [...root.querySelectorAll<HTMLElement>('.label.rotated')];
      expect(turned.map((label) => label.dataset['label']).sort()).toEqual([...TURNED].sort());
      for (const label of turned) {
        const box = label.getBoundingClientRect();
        expect(box.height, label.dataset['label']).toBeGreaterThan(box.width);
        expect(Number.parseFloat(getComputedStyle(label).fontSize), label.dataset['label']).toBeGreaterThanOrEqual(10);
        // -90 degrees turns counter-clockwise: the text's x axis points up, so it reads from bottom to top
        const matrix = new DOMMatrix(getComputedStyle(label).transform);
        expect([Math.round(matrix.a), Math.round(matrix.b)], label.dataset['label']).toEqual([0, -1]);
      }
      // the pump 15 value and the refrigerant values are horizontal
      for (const id of ['production_pump', 'discharge_temperature', 'compressor_speed', 'expansion_valve']) {
        const box = root.querySelector<HTMLElement>(`[data-label="${id}"]`)?.getBoundingClientRect();
        expect(box === undefined || box.width > box.height, id).toBe(true);
      }
    },
  );

  test('the horizontal layout turns nothing', async () => {
    const root = await show(1000, 'horizontal');
    expect(root.querySelectorAll('.label.rotated')).toHaveLength(0);
  });
});
