import { describe, expect, test } from 'vitest';
import '../../src/index';
import type { EcogeoCard } from '../../src/card/ecogeo-card';

async function mount(): Promise<EcogeoCard> {
  const card = document.createElement('ecogeo-card') as EcogeoCard;
  card.setConfig({ type: 'custom:ecogeo-card' });
  document.body.append(card);
  await card.updateComplete;
  return card;
}

describe('ecogeo-card skeleton', () => {
  test('the element registers and renders an svg with the viewBox of design D5', async () => {
    const card = await mount();
    const svg = card.shadowRoot?.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute('viewBox')).toBe('0 0 1000 620');
    expect(svg?.children).toHaveLength(0);
    card.remove();
  });

  test('accepts any config', () => {
    const card = document.createElement('ecogeo-card') as EcogeoCard;
    expect(() => {
      card.setConfig({});
      card.setConfig({ anything: { goes: 1 } });
    }).not.toThrow();
  });

  test('size hints (design D6)', async () => {
    const card = await mount();
    expect(card.getCardSize()).toBe(10);
    expect(card.getGridOptions()).toEqual({ columns: 'full', rows: 'auto', min_rows: 8 });
    card.remove();
  });
});
