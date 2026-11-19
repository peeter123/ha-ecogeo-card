// A role set to `none` is not present (add-entity-discovery D7): its label is not rendered, and the labels that remain
// do not overlap each other or a component. Overlaps need real layout, so this runs in a browser.
import { afterEach, describe, expect, test } from 'vitest';
import '../../dev/ha-stubs';
import '../../src/index';
import { EMULATOR_FONT, measureCard, overlapPairs } from '../../dev/overlaps';
import { MockHass } from '../../dev/mock-hass';
import { SCENARIOS, scenarioStates } from '../../dev/scenarios';
import type { EcogeoCard } from '../../src/card/ecogeo-card';
import type { CardConfig } from '../../src/lib/config';

afterEach(() => {
  document.body.replaceChildren();
});

async function show(width: number, config: CardConfig): Promise<ShadowRoot> {
  const wrapper = document.createElement('div');
  wrapper.style.fontFamily = EMULATOR_FONT.family;
  wrapper.style.fontSize = EMULATOR_FONT.size;
  wrapper.style.width = `${String(width)}px`;
  const card = document.createElement('ecogeo-card') as EcogeoCard;
  card.setConfig({ type: 'custom:ecogeo-card', prefix: 'ecoforest_ecogeo', source: 'air', ...config });
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

describe('Roles not present', () => {
  test('no label is rendered at items 37 and 38 with both pressure roles none, the probes stay drawn', async () => {
    const root = await show(900, {
      layout: 'horizontal',
      entities: { production: { pressure: 'none' }, brine: { pressure: 'none' } },
    });
    expect(root.querySelectorAll('.label').length).toBeGreaterThan(0);
    expect(root.querySelector('.label[data-label-item="37"]')).toBeNull();
    expect(root.querySelector('.label[data-label-item="38"]')).toBeNull();
    expect(root.querySelector('g[data-item="37"]')).not.toBeNull();
    expect(root.querySelector('g[data-item="38"]')).not.toBeNull();
    expect(overlapPairs(measureCard(root))).toEqual([]);
  });

  test('absent labels do not break the overlap measurement in the horizontal layout', async () => {
    const root = await show(900, {
      layout: 'horizontal',
      entities: { production: { outlet_temperature: 'none' }, unit: { cop: 'none', system_cop: 'none' } },
    });
    expect(root.querySelector('.label[data-label="production_out"]')).toBeNull();
    expect(root.querySelector('[data-footer="cop"]')).toBeNull();
    expect(overlapPairs(measureCard(root))).toEqual([]);
  });
});
