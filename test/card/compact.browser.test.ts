// The compact layout at real widths (responsive-layout spec: Layout hysteresis, Minimum rendered sizes), measured in
// Chromium: rendered stroke widths, label font sizes, the wrapping footer and the layout band at the threshold.
import { afterEach, describe, expect, test } from 'vitest';
import '../../dev/ha-stubs';
import '../../src/index';
import { MockHass } from '../../dev/mock-hass';
import { SCENARIO_NAMES, SCENARIOS, scenarioStates } from '../../dev/scenarios';
import type { EcogeoCard } from '../../src/card/ecogeo-card';
import type { CardConfig } from '../../src/lib/config';
import { COMPACT_BELOW, COMPACT_HYSTERESIS } from '../../src/lib/layout';

afterEach(() => {
  document.body.replaceChildren();
});

async function show(
  width: number,
  config: CardConfig = {},
  scenario: (typeof SCENARIO_NAMES)[number] = 'heating',
): Promise<{ card: EcogeoCard; wrapper: HTMLElement; root: ShadowRoot }> {
  const wrapper = document.createElement('div');
  wrapper.style.width = `${String(width)}px`;
  const card = document.createElement('ecogeo-card') as EcogeoCard;
  card.setConfig({ type: 'custom:ecogeo-card', prefix: 'ecoforest_ecogeo', source: 'air', ...config });
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

describe('Thin card', () => {
  test('at 360 px every pipe renders at least 2 px, every outline at least 1.25 px, every label font at least 10 px', async () => {
    const { root } = await show(360);
    expect(layoutOf(root)).toBe('compact');
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
    for (const width of [320, 500, COMPACT_BELOW - 1]) {
      const { root, card } = await show(width);
      for (const pipe of root.querySelectorAll<SVGGraphicsElement>('path.pipe')) {
        expect(renderedStroke(pipe), `${String(width)} pipe`).toBeGreaterThanOrEqual(2);
      }
      for (const outline of root.querySelectorAll<SVGGraphicsElement>('.outline, .symbol')) {
        expect(renderedStroke(outline), `${String(width)} outline`).toBeGreaterThanOrEqual(1.25);
      }
      card.remove();
    }
  });

  test('at 1000 px the strokes keep the designed widths and the full layout keeps its 8 px font floor', async () => {
    const { root } = await show(1000);
    expect(layoutOf(root)).toBe('full');
    const pipe = root.querySelector<SVGGraphicsElement>('path.pipe[data-segment]');
    expect(Number.parseFloat(getComputedStyle(pipe as Element).strokeWidth)).toBe(3);
    for (const label of root.querySelectorAll<HTMLElement>('.label')) {
      expect(Number.parseFloat(getComputedStyle(label).fontSize)).toBeGreaterThanOrEqual(8);
    }
  });
});

describe('Footer wraps', () => {
  test('at 320 px every footer item lies inside the card', async () => {
    const { root } = await show(320, { layout: 'full' });
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

  test('the compact footer at 320 px is inside the card too', async () => {
    const { root } = await show(320);
    const box = root.querySelector('ha-card')?.getBoundingClientRect();
    if (box === undefined) throw new Error('no ha-card');
    for (const item of root.querySelectorAll('.footer > *')) {
      expect(item.getBoundingClientRect().right, item.textContent).toBeLessThanOrEqual(box.right + 0.5);
    }
  });
});

describe('No flip at the threshold', () => {
  test('a compact card widened to threshold + 10 stays compact and is full at threshold + 24 or more', async () => {
    const { card, wrapper, root } = await show(360);
    expect(layoutOf(root)).toBe('compact');
    wrapper.style.width = `${String(COMPACT_BELOW + 10)}px`;
    await expect.poll(() => card.width).toBe(COMPACT_BELOW + 10);
    await card.updateComplete;
    expect(layoutOf(root)).toBe('compact');
    wrapper.style.width = `${String(COMPACT_BELOW + COMPACT_HYSTERESIS)}px`;
    await expect
      .poll(async () => {
        await card.updateComplete;
        return layoutOf(root);
      })
      .toBe('full');
  });
});
