// The panel fit at real sizes, in Chromium and WebKit (refine-simplified-layout D9, responsive-layout "Panel view fits the
// screen"): the footer inside the window in a 1280 x 800 viewport, the drawing centred, and the drawing as wide as the card
// outside a panel view.
import { page } from 'vitest/browser';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import '../../dev/ha-stubs';
import '../../src/index';
import { MockHass } from '../../dev/mock-hass';
import { DEMO_PREFIX, SCENARIOS, scenarioStates } from '../../dev/scenarios';
import type { EcogeoCard } from '../../src/card/ecogeo-card';
import { arrangementFor, bandKeyOf } from '../../src/diagram/geometry';
import { FOOTER_ALLOWANCE } from '../../src/lib/layout';

const HEADER = 56;

beforeEach(() => {
  document.body.style.margin = '0';
});
afterEach(() => {
  document.body.replaceChildren();
  document.body.style.margin = '';
});

/** A card below a 56 px header that sets `--header-height`, like Home Assistant's panel view. */
async function showPanel(
  isPanel: boolean,
  width?: number,
  scenario: keyof typeof SCENARIOS = 'passive_cooling',
  extra: Record<string, unknown> = {},
): Promise<{ card: EcogeoCard; root: ShadowRoot }> {
  document.body.style.setProperty('--header-height', `${String(HEADER)}px`);
  const header = document.createElement('div');
  header.style.height = `${String(HEADER)}px`;
  const wrapper = document.createElement('div');
  if (width !== undefined) wrapper.style.width = `${String(width)}px`;
  const card = document.createElement('ecogeo-card') as EcogeoCard;
  card.setConfig({ type: 'custom:ecogeo-card', prefix: DEMO_PREFIX, source: 'air', ...extra });
  card.hass = new MockHass().build(scenarioStates(SCENARIOS[scenario].states), false);
  card.isPanel = isPanel;
  wrapper.append(card);
  document.body.append(header, wrapper);
  await card.updateComplete;
  await document.fonts.ready;
  await expect.poll(() => card.width).toBeGreaterThan(0);
  await card.updateComplete;
  const root = card.shadowRoot;
  if (root === null) throw new Error('no shadow root');
  return { card, root };
}

const box = (root: ShadowRoot, selector: string): DOMRect => {
  const element = root.querySelector(selector);
  if (element === null) throw new Error(`no ${selector}`);
  return element.getBoundingClientRect();
};

describe('Desktop panel', () => {
  test.each([
    [1280, 800],
    [1280, 1000],
    [1024, 640],
  ])('in a %i x %i px window the footer is inside the window and the drawing is centred', async (width, height) => {
    await page.viewport(width, height);
    const { card, root } = await showPanel(true);
    await expect.poll(() => window.innerHeight).toBe(height);
    await card.updateComplete;
    const footer = box(root, '.footer');
    expect(footer.bottom).toBeLessThanOrEqual(window.innerHeight);
    expect(footer.top).toBeGreaterThan(HEADER);
    const diagram = box(root, '.diagram');
    expect(diagram.left + diagram.width / 2).toBeCloseTo(window.innerWidth / 2, 0);
    expect(diagram.height + HEADER).toBeLessThanOrEqual(window.innerHeight);
  });

  test('the longest footer (active cooling with HTR, EER) stays inside a 1280 x 800 window and its allowance', async () => {
    await page.viewport(1280, 800);
    const { card, root } = await showPanel(true, undefined, 'active_cooling_htr');
    await expect.poll(() => window.innerHeight).toBe(800);
    await card.updateComplete;
    const footer = box(root, '.footer');
    expect(root.querySelector('[data-footer="htr_power"]')).not.toBeNull();
    expect(footer.bottom).toBeLessThanOrEqual(window.innerHeight);
    expect(footer.height).toBeLessThanOrEqual(FOOTER_ALLOWANCE);
  });

  test('the footer stays inside the window when it wraps to two lines (a short window, the longest mode)', async () => {
    await page.viewport(900, 600);
    const { card, root } = await showPanel(true, undefined, 'active_cooling_htr');
    await expect.poll(() => window.innerHeight).toBe(600);
    await card.updateComplete;
    expect(box(root, '.footer').bottom).toBeLessThanOrEqual(window.innerHeight);
  });

  test('model C with tank 50 in the vertical layout fits a 1280 x 800 window (the fit uses the rendered arrangement)', async () => {
    await page.viewport(1280, 800);
    const { card, root } = await showPanel(true, undefined, 'passive_cooling', {
      model: 'C',
      dhw: 'internal',
      layout: 'vertical',
    });
    await expect.poll(() => window.innerHeight).toBe(800);
    await card.updateComplete;
    expect(root.querySelector('[data-layout="vertical"]')).not.toBeNull();
    expect(box(root, '.footer').bottom).toBeLessThanOrEqual(window.innerHeight);
    // The drawing is fitted to the 740 x 825 arrangement of tank 50, not to the 740 x 797 one without it.
    const arrangement = arrangementFor('vertical', bandKeyOf({ model: 'C', dhw: 'internal', source: 'air' }));
    const fitted = Math.floor(
      ((800 - HEADER - FOOTER_ALLOWANCE) * arrangement.viewBox.width) / arrangement.viewBox.height,
    );
    expect(box(root, '.diagram').width).toBeLessThanOrEqual(fitted);
  });
});

describe('Not a panel', () => {
  test('a card 1000 px wide that is not in a panel view renders its drawing 1000 px wide, whatever the window height', async () => {
    await page.viewport(1280, 500);
    const { root } = await showPanel(false, 1000);
    expect(box(root, '.diagram').width).toBe(1000);
    expect(root.querySelector('.diagram')?.getAttribute('style')).toBeNull();
  });
});
