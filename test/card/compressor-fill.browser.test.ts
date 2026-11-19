// The compressor's two filled parts take the outline colour in the light and the dark theme (schematic-drawing "Compressor
// symbol" and "Compressor fill in the dark theme"). Computed styles need a real browser.
import { afterEach, describe, expect, test } from 'vitest';
import '../../dev/ha-stubs';
import '../../src/index';
import type { EcogeoCard } from '../../src/card/ecogeo-card';

afterEach(() => {
  document.body.replaceChildren();
  document.body.style.removeProperty('--primary-text-color');
});

describe('Compressor fill', () => {
  test.each([
    ['light', 'rgb(33, 33, 33)'],
    ['dark', 'rgb(229, 229, 229)'],
  ] as const)('%s theme: both filled parts have the colour of the compressor outline', async (_theme, primary) => {
    document.body.style.setProperty('--primary-text-color', primary);
    const card = document.createElement('ecogeo-card') as EcogeoCard;
    card.setConfig({ type: 'custom:ecogeo-card' });
    document.body.append(card);
    await card.updateComplete;
    const symbol = card.shadowRoot?.querySelector('.symbol.compressor');
    const circle = symbol?.querySelector('circle');
    const fills = [...(symbol?.querySelectorAll('.compressor-fill') ?? [])];
    if (circle === null || circle === undefined) throw new Error('no compressor circle');
    expect(fills).toHaveLength(2);
    const outline = getComputedStyle(circle).stroke;
    expect(outline).toBe(primary);
    for (const fill of fills) expect(getComputedStyle(fill).fill).toBe(outline);
  });
});
