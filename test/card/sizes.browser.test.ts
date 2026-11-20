// Minimum rendered sizes and the layout band at real widths (responsive-layout spec: Layout hysteresis, Minimum rendered
// sizes), measured in Chromium and WebKit: rendered stroke widths, the 10 px label font floor, the wrapping footer and the band
// at the threshold. Both layouts are checked; the vertical one renders the horizontal arrangement until the vertical arrangement of
// rework-layouts is built.
import { afterEach, describe, expect, test } from 'vitest';
import '../../dev/ha-stubs';
import '../../src/index';
import { EMULATOR_FONT } from '../../dev/overlaps';
import { MockHass } from '../../dev/mock-hass';
import { DEMO_PREFIX, SCENARIO_NAMES, SCENARIOS, scenarioStates } from '../../dev/scenarios';
import type { EcogeoCard } from '../../src/card/ecogeo-card';
import type { CardConfig } from '../../src/lib/config';
import { FOOTER_ALLOWANCE, VERTICAL_BELOW, VERTICAL_HYSTERESIS } from '../../src/lib/layout';

afterEach(() => {
  document.body.replaceChildren();
});

const LAYOUTS = ['horizontal', 'vertical'] as const;

async function show(
  width: number,
  config: CardConfig = {},
  scenario: (typeof SCENARIO_NAMES)[number] = 'heating',
): Promise<{ card: EcogeoCard; wrapper: HTMLElement; root: ShadowRoot }> {
  const wrapper = document.createElement('div');
  wrapper.style.width = `${String(width)}px`;
  // The emulator's font, as in the overlap tests: the footer's wrapping depends on it.
  wrapper.style.fontFamily = EMULATOR_FONT.family;
  wrapper.style.fontSize = EMULATOR_FONT.size;
  const card = document.createElement('ecogeo-card') as EcogeoCard;
  card.setConfig({ type: 'custom:ecogeo-card', prefix: DEMO_PREFIX, source: 'air', ...config });
  card.hass = new MockHass().build(scenarioStates(SCENARIOS[scenario].states), false);
  wrapper.append(card);
  document.body.append(wrapper);
  await card.updateComplete;
  await expect.poll(() => card.width).toBe(width);
  await card.updateComplete;
  await document.fonts.ready;
  const root = card.shadowRoot;
  if (root === null) throw new Error('no shadow root');
  return { card, wrapper, root };
}

const layoutOf = (root: ShadowRoot): string | null | undefined =>
  root.querySelector('ha-card')?.getAttribute('data-layout');

/** The rendered stroke width of an SVG element in screen px: its computed width (user units) times the CTM scale. */
function renderedStroke(element: SVGGraphicsElement): number {
  // Chromium serializes a computed `max()` or `calc()` width as `calc(3.5px)`.
  const units = Number.parseFloat(/\d+(?:\.\d+)?/.exec(getComputedStyle(element).strokeWidth)?.[0] ?? 'NaN');
  const matrix = element.getScreenCTM();
  if (matrix === null) throw new Error('no CTM');
  return units * Math.hypot(matrix.a, matrix.b);
}

describe.each(LAYOUTS)('Thin card, %s layout', (layout) => {
  test('at 360 px every pipe renders at least 2 px, every outline at least 1.25 px, every label font at least 10 px', async () => {
    const { root } = await show(360, { layout });
    expect(layoutOf(root)).toBe(layout);
    const pipes = [...root.querySelectorAll<SVGGraphicsElement>('path.pipe')];
    expect(pipes.length).toBeGreaterThan(20);
    for (const pipe of pipes) {
      expect(renderedStroke(pipe), pipe.getAttribute('data-segment') ?? 'helix').toBeGreaterThanOrEqual(2);
    }
    const outlines = [
      ...root.querySelectorAll<SVGGraphicsElement>(
        '.outline, .symbol, .source-outline, .source-frame, .tank-body, .fan-ring',
      ),
    ];
    expect(outlines.length).toBeGreaterThan(20);
    for (const outline of outlines) {
      expect(renderedStroke(outline), outline.getAttribute('class') ?? '').toBeGreaterThanOrEqual(1.25);
    }
    const labels = [...root.querySelectorAll<HTMLElement>('.label')];
    expect(labels.length).toBeGreaterThan(5);
    for (const label of labels) {
      expect(Number.parseFloat(getComputedStyle(label).fontSize), label.dataset['label'] ?? '').toBeGreaterThanOrEqual(
        10,
      );
    }
  });

  test('the minimum holds at 320 px, at 500 px and just below the threshold', async () => {
    for (const width of [320, 500, VERTICAL_BELOW - 1]) {
      const { root, card } = await show(width, { layout });
      for (const pipe of root.querySelectorAll<SVGGraphicsElement>('path.pipe')) {
        expect(renderedStroke(pipe), `${String(width)} pipe`).toBeGreaterThanOrEqual(2);
      }
      for (const outline of root.querySelectorAll<SVGGraphicsElement>('.outline, .symbol')) {
        expect(renderedStroke(outline), `${String(width)} outline`).toBeGreaterThanOrEqual(1.25);
      }
      card.remove();
    }
  });

  test('at 1000 px the strokes keep the designed widths and the labels keep their 10 px floor', async () => {
    const { root } = await show(1000, { layout });
    const pipe = root.querySelector<SVGGraphicsElement>('path.pipe[data-segment]');
    expect(Number.parseFloat(getComputedStyle(pipe as Element).strokeWidth)).toBe(3);
    for (const label of root.querySelectorAll<HTMLElement>('.label')) {
      expect(Number.parseFloat(getComputedStyle(label).fontSize)).toBeGreaterThanOrEqual(10);
    }
  });
});

describe.each(LAYOUTS)('Footer wraps, %s layout', (layout) => {
  test('at 320 px every footer item lies inside the card', async () => {
    const { root } = await show(320, { layout });
    const card = root.querySelector('ha-card');
    if (card === null) throw new Error('no ha-card');
    const box = card.getBoundingClientRect();
    const items = [...root.querySelectorAll('.footer > *')];
    expect(items.length).toBeGreaterThan(4);
    for (const item of items) {
      const rect = item.getBoundingClientRect();
      expect(rect.left, item.textContent).toBeGreaterThanOrEqual(box.left);
      expect(rect.right, item.textContent).toBeLessThanOrEqual(box.right + 0.5);
    }
    // it wrapped: not every item is on the first line
    expect(new Set(items.map((item) => Math.round(item.getBoundingClientRect().top))).size).toBeGreaterThan(1);
  });

  // add-htr-state: the longest footer (active cooling with HTR: mode, outside, EER, Cooling, HTR) at the
  // narrowest width the horizontal layout is drawn once vertical (the threshold plus the hysteresis) fits the panel allowance.
  test('the longest footer (active cooling with HTR, EER) at the threshold plus the hysteresis is inside the card and the allowance', async () => {
    const { root } = await show(VERTICAL_BELOW + VERTICAL_HYSTERESIS, { layout }, 'active_cooling_htr');
    const ids = [...root.querySelectorAll('[data-footer]')].map((item) => item.getAttribute('data-footer'));
    expect(ids).toEqual(['outside_temperature', 'cop', 'cooling_power', 'htr_power']);
    expect(root.querySelector('[data-footer="cop"] .caption')?.textContent).toBe('EER');
    const footer = root.querySelector('.footer');
    const card = root.querySelector('ha-card');
    if (footer === null || card === null) throw new Error('no footer');
    const box = card.getBoundingClientRect();
    for (const item of footer.children) {
      const rect = item.getBoundingClientRect();
      expect(rect.left, item.textContent).toBeGreaterThanOrEqual(box.left);
      expect(rect.right, item.textContent).toBeLessThanOrEqual(box.right + 0.5);
    }
    expect(footer.getBoundingClientRect().height).toBeLessThanOrEqual(FOOTER_ALLOWANCE);
  });
});

describe('No flip at the threshold', () => {
  test('a vertical card widened to threshold + 10 stays vertical and is horizontal at threshold + 24 or more', async () => {
    const { card, wrapper, root } = await show(360);
    expect(layoutOf(root)).toBe('vertical');
    wrapper.style.width = `${String(VERTICAL_BELOW + 10)}px`;
    await expect.poll(() => card.width).toBe(VERTICAL_BELOW + 10);
    await card.updateComplete;
    expect(layoutOf(root)).toBe('vertical');
    wrapper.style.width = `${String(VERTICAL_BELOW + VERTICAL_HYSTERESIS)}px`;
    await expect
      .poll(async () => {
        await card.updateComplete;
        return layoutOf(root);
      })
      .toBe('horizontal');
  });
});
