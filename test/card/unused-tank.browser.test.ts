// An unused tank (dhw: unused, add-card-editor D6) is muted in outline and rim as well as in fill; a tank in use keeps
// the primary text colour. Computed styles need a real browser.
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import '../../dev/ha-stubs';
import '../../src/index';
import type { EcogeoCard } from '../../src/card/ecogeo-card';

const PRIMARY = 'rgb(10, 20, 30)';
const MUTED = 'rgb(200, 201, 202)';

beforeEach(() => {
  document.body.style.setProperty('--primary-text-color', PRIMARY);
  document.body.style.setProperty('--disabled-text-color', MUTED);
});

afterEach(() => {
  document.body.replaceChildren();
});

async function stroke(config: Record<string, unknown>, selector: string): Promise<string> {
  const card = document.createElement('ecogeo-card') as EcogeoCard;
  card.setConfig({ type: 'custom:ecogeo-card', ...config });
  document.body.append(card);
  await card.updateComplete;
  const element = card.shadowRoot?.querySelector(selector);
  if (!element) throw new Error(`no ${selector}`);
  return getComputedStyle(element).stroke;
}

describe('Unused tank outline', () => {
  test.each([
    ['B', 'path.tank-body[data-dhw-tank="external"]'],
    ['B', '.dhw-storage .tank-rim'],
    ['C', 'rect.tank-body[data-dhw-tank="internal"]'],
  ] as const)('model %s, %s: in use keeps the text colour, unused is muted', async (model, selector) => {
    expect(await stroke({ model }, selector)).toBe(PRIMARY);
    document.body.querySelector('ecogeo-card')?.remove();
    expect(await stroke({ model, dhw: 'unused' }, selector)).toBe(MUTED);
  });
});
