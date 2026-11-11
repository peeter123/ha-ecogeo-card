import { describe, expect, test } from 'vitest';
import '../../src/index';
import { EcogeoCard } from '../../src/card/ecogeo-card';
import { cabinetStyles } from '../../src/diagram/cabinet';
import { dhwStyles } from '../../src/diagram/dhw';
import { sourceStyles } from '../../src/diagram/source';

/** The stroke-width declared for a selector in a stylesheet. */
function widthOf(css: string, selector: string): number {
  const block = new RegExp(`${selector.replace('.', '\\.')}\\s*\\{([^}]*)\\}`).exec(css)?.[1] ?? '';
  return Number(/stroke-width:\s*([\d.]+)/.exec(block)?.[1]);
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
    expect(cabinetStyles.cssText).toContain('stroke-dasharray: 3 18');
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
