import { describe, expect, test } from 'vitest';
import '../../src/index';
import { EcogeoCard } from '../../src/card/ecogeo-card';
import { cabinetStyles } from '../../src/diagram/cabinet';
import { dhwStyles } from '../../src/diagram/dhw';
import { sourceStyles } from '../../src/diagram/source';

/**
 * The stroke-width a selector renders with while the card's width is unknown: the declared value with the custom
 * properties (--pipe-width, --outline-width) replaced by their fallbacks (add-compact-layout D4).
 */
function widthOf(css: string, selector: string): number {
  const block = new RegExp(`${selector.replace('.', '\\.')}\\s*\\{([^}]*)\\}`).exec(css)?.[1] ?? '';
  const declared = /stroke-width:\s*([^;]+);/.exec(block)?.[1] ?? '';
  const plain = declared.replaceAll(/var\(--[\w-]+,\s*([\d.]+)\)/g, '$1');
  const max = /^max\(([\d.]+),\s*([\d.]+)\)$/.exec(plain);
  if (max !== null) return Math.max(Number(max[1]), Number(max[2]));
  const product = /^calc\(([\d.]+) \* ([\d.]+)\)$/.exec(plain);
  if (product !== null) return Number(product[1]) * Number(product[2]);
  return Number(plain);
}

describe('line weights (schematic-drawing spec)', () => {
  test('pipe stroke: every pipe base stroke is 3 units or more and every component outline 2 units or more', async () => {
    const card = document.createElement('ecogeo-card') as EcogeoCard;
    card.setConfig({ type: 'custom:ecogeo-card', source: 'hybrid', detail: 'full' });
    document.body.append(card);
    await card.updateComplete;
    const root = card.shadowRoot;
    if (root === null) throw new Error('no shadow root');

    // the rendered pipes are `.pipe` paths, whose stroke width the stylesheet sets
    const pipes = root.querySelectorAll('path.pipe[data-segment]');
    expect(pipes.length).toBeGreaterThan(40);
    expect(widthOf(cabinetStyles.cssText, '.pipe')).toBeGreaterThanOrEqual(3);
    // the flow overlay is as wide as the pipe, with its dash and gap scaled by 1.5 (2 12 before)
    expect(widthOf(cabinetStyles.cssText, '.flow')).toBeGreaterThanOrEqual(3);
    expect(cabinetStyles.cssText).toContain('stroke-dasharray: var(--pipe-width, 3) calc(var(--pipe-width, 3) * 6)');
    expect(root.querySelectorAll('path.flow').length).toBeGreaterThan(5);

    // every component symbol carries its outline width on the group
    const symbols = [...root.querySelectorAll('.symbol')];
    expect(symbols.length).toBeGreaterThan(40);
    for (const symbol of symbols) {
      expect(Number(symbol.getAttribute('stroke-width')), symbol.getAttribute('class') ?? '').toBeGreaterThanOrEqual(2);
    }

    // the cabinet, the source and the tank outlines
    expect(widthOf(cabinetStyles.cssText, '.outline')).toBe(3);
    expect(widthOf(sourceStyles.cssText, '.source-outline')).toBe(2.5);
    expect(widthOf(dhwStyles.cssText, '.tank-body')).toBe(2.5);
    expect(root.querySelector('.outline')).not.toBeNull();
    card.remove();
  });
});
