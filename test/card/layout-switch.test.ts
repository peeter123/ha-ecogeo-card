// The switch between the layouts with a mocked width (responsive-layout spec: Layout choice, Layout hysteresis, Same values in
// both layouts).
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { arrangementFor } from '../../src/diagram/geometry';
import '../../src/index';
import type { EcogeoCard } from '../../src/card/ecogeo-card';
import type { CardConfig } from '../../src/lib/config';
import { VERTICAL_BELOW, VERTICAL_HYSTERESIS } from '../../src/lib/layout';

class FakeObserver {
  static instances: FakeObserver[] = [];
  constructor(private readonly callback: ResizeObserverCallback) {
    FakeObserver.instances.push(this);
  }
  observe(): void {
    // the test triggers the observations
  }
  unobserve(): void {
    // not used
  }
  disconnect(): void {
    // not used
  }
  resize(width: number): void {
    this.callback([{ contentRect: { width } } as ResizeObserverEntry], this);
  }
}

beforeEach(() => {
  FakeObserver.instances = [];
  vi.stubGlobal('ResizeObserver', FakeObserver);
});
afterEach(() => {
  vi.unstubAllGlobals();
  document.body.replaceChildren();
});

async function resizeTo(card: EcogeoCard, width: number): Promise<void> {
  FakeObserver.instances.at(-1)?.resize(width);
  await card.updateComplete;
}

/** A card in sample mode (heating) at the given width. */
async function show(width: number, config: CardConfig = {}): Promise<EcogeoCard> {
  const card = document.createElement('ecogeo-card') as EcogeoCard;
  card.setConfig({ type: 'custom:ecogeo-card', ...config });
  document.body.append(card);
  await card.updateComplete;
  await resizeTo(card, width);
  return card;
}

const root = (card: EcogeoCard): ShadowRoot => {
  if (card.shadowRoot === null) throw new Error('no shadow root');
  return card.shadowRoot;
};
const footerIds = (card: EcogeoCard): string[] =>
  [...root(card).querySelectorAll('[data-footer]')].map((element) => element.getAttribute('data-footer') ?? '');
const layoutOf = (card: EcogeoCard): string | null | undefined =>
  root(card).querySelector('ha-card')?.getAttribute('data-layout');

describe('No flip at the threshold', () => {
  test('a vertical card stays vertical up to threshold + 23 and goes horizontal at threshold + 24', async () => {
    const card = await show(360);
    await resizeTo(card, VERTICAL_BELOW + 10);
    expect(layoutOf(card)).toBe('vertical');
    await resizeTo(card, VERTICAL_BELOW + VERTICAL_HYSTERESIS - 1);
    expect(layoutOf(card)).toBe('vertical');
    await resizeTo(card, VERTICAL_BELOW + VERTICAL_HYSTERESIS);
    expect(layoutOf(card)).toBe('horizontal');
  });

  test('a horizontal card goes vertical only below the threshold, and then stays vertical across the band', async () => {
    const card = await show(1000);
    await resizeTo(card, VERTICAL_BELOW + 10);
    expect(layoutOf(card)).toBe('horizontal');
    await resizeTo(card, VERTICAL_BELOW - 1);
    expect(layoutOf(card)).toBe('vertical');
    await resizeTo(card, VERTICAL_BELOW + 10);
    expect(layoutOf(card)).toBe('vertical');
  });
});

describe('The footer in both layouts', () => {
  test('the footer shows the same items at 360 and 1000 px', async () => {
    const narrow = await show(360);
    const wide = await show(1000);
    expect(footerIds(narrow)).toEqual(footerIds(wide));
    expect(root(narrow).querySelector('.mode')).not.toBeNull();
  });

  test('the alarm and offline indications show in the vertical layout', async () => {
    const card = document.createElement('ecogeo-card') as EcogeoCard;
    card.setConfig({ type: 'custom:ecogeo-card', prefix: 'demo_ecogeo' });
    card.hass = {
      states: {
        'binary_sensor.demo_ecogeo_alarm': {
          entity_id: 'binary_sensor.demo_ecogeo_alarm',
          state: 'on',
          attributes: {},
        },
        'binary_sensor.demo_ecogeo_status': {
          entity_id: 'binary_sensor.demo_ecogeo_status',
          state: 'off',
          attributes: {},
        },
      },
    };
    document.body.append(card);
    await card.updateComplete;
    await resizeTo(card, 360);
    expect(layoutOf(card)).toBe('vertical');
    expect(root(card).querySelector('.alarm')).not.toBeNull();
    expect(root(card).querySelector('.offline')).not.toBeNull();
  });
});

describe('Hysteresis counts only a vertical layout that auto chose', () => {
  test('after a switch from layout vertical to auto inside the band the card is horizontal', async () => {
    const card = await show(VERTICAL_BELOW + 10, { layout: 'vertical' });
    expect(layoutOf(card)).toBe('vertical');
    card.setConfig({ type: 'custom:ecogeo-card', layout: 'auto' });
    await card.updateComplete;
    expect(layoutOf(card)).toBe('horizontal');
  });

  test('a card that auto made vertical stays vertical in the band', async () => {
    const card = await show(360, { layout: 'auto' });
    await resizeTo(card, VERTICAL_BELOW + 10);
    expect(layoutOf(card)).toBe('vertical');
  });
});

describe('Same values in both layouts (responsive-layout)', () => {
  const labelTexts = (card: EcogeoCard): string[] =>
    [...root(card).querySelectorAll('[data-label]')].map(
      (element) => `${element.getAttribute('data-label') ?? ''}: ${element.textContent.replace(/\s+/g, ' ').trim()}`,
    );

  test.each([{}, { source: 'air', dhw: 'none', emitter: 'radiator' }, { model: 'C', dhw: 'internal' }] as const)(
    'the same labels with the same texts and the same footer, config %j',
    async (config) => {
      const horizontal = await show(1000, { ...config, layout: 'horizontal' });
      const vertical = await show(360, { ...config, layout: 'vertical' });
      expect(layoutOf(horizontal)).toBe('horizontal');
      expect(layoutOf(vertical)).toBe('vertical');
      expect(labelTexts(vertical).length).toBeGreaterThan(10);
      expect(labelTexts(vertical)).toEqual(labelTexts(horizontal));
      expect(footerIds(vertical)).toEqual(footerIds(horizontal));
    },
  );

  test('the vertical drawing is taller for its width than the horizontal one at 400 px', async () => {
    const [horizontal, vertical] = [await show(400, { layout: 'horizontal' }), await show(400, { layout: 'vertical' })];
    const ratio = (card: EcogeoCard): number => {
      const [, , width, height] = (root(card).querySelector('svg')?.getAttribute('viewBox') ?? '')
        .split(' ')
        .map(Number);
      return (height ?? 0) / (width ?? 1);
    };
    expect(ratio(vertical)).toBeGreaterThan(ratio(horizontal));
  });
});

describe('the arrangement of the shown layout (refine-simplified-layout D1)', () => {
  test.each([
    [1000, 'horizontal'],
    [320, 'vertical'],
  ] as const)("at %i px (%s layout): the viewBox is the arrangement's", async (width, layout) => {
    const card = await show(width);
    const { viewBox } = arrangementFor(layout);
    expect(layoutOf(card)).toBe(layout);
    expect(root(card).querySelector('svg')?.getAttribute('viewBox')).toBe(
      `0 0 ${String(viewBox.width)} ${String(viewBox.height)}`,
    );
  });

  test('the two layouts draw their own arrangements: the vertical one is narrower and taller', () => {
    const [horizontal, vertical] = [arrangementFor('horizontal'), arrangementFor('vertical')];
    expect(vertical).not.toBe(horizontal);
    expect(vertical.viewBox.width).toBeLessThan(horizontal.viewBox.width);
    expect(vertical.viewBox.height / vertical.viewBox.width).toBeGreaterThan(
      horizontal.viewBox.height / horizontal.viewBox.width,
    );
  });
});
