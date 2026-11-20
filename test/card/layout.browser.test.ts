// The automatic layout at real widths: the card's own ResizeObserver, no mock (add-compact-layout D7).
import { afterEach, describe, expect, test } from 'vitest';
import '../../dev/ha-stubs';
import '../../src/index';
import type { EcogeoCard } from '../../src/card/ecogeo-card';
import type { CardConfig } from '../../src/lib/config';
import { VERTICAL_BELOW, VERTICAL_HYSTERESIS } from '../../src/lib/layout';

afterEach(() => {
  document.body.replaceChildren();
});

/** A card in a wrapper of the given width; the wrapper is returned too, to resize it. */
async function show(width: number, config: CardConfig = {}): Promise<{ card: EcogeoCard; wrapper: HTMLElement }> {
  const wrapper = document.createElement('div');
  wrapper.style.width = `${String(width)}px`;
  const card = document.createElement('ecogeo-card') as EcogeoCard;
  card.setConfig({ type: 'custom:ecogeo-card', ...config });
  wrapper.append(card);
  document.body.append(wrapper);
  await card.updateComplete;
  return { card, wrapper };
}

const layoutOf = (card: EcogeoCard): string | null | undefined =>
  card.shadowRoot?.querySelector('ha-card')?.getAttribute('data-layout');

/** Waits until the card shows the layout (the observer reports after layout, then Lit renders). */
async function expectLayout(card: EcogeoCard, layout: string): Promise<void> {
  await expect
    .poll(async () => {
      await card.updateComplete;
      return layoutOf(card);
    })
    .toBe(layout);
}

describe('layout at real widths', () => {
  test('Auto on a phone: 360 px is vertical', async () => {
    const { card } = await show(360);
    await expectLayout(card, 'vertical');
  });

  test('Auto on a wide card: 1000 px is horizontal', async () => {
    const { card } = await show(1000);
    await expectLayout(card, 'horizontal');
  });

  test('Forced horizontal: layout horizontal at 360 px is horizontal', async () => {
    const { card } = await show(360, { layout: 'horizontal' });
    await expect.poll(() => card.width).toBe(360);
    await expectLayout(card, 'horizontal');
  });

  test('Forced vertical at 1000 px is vertical', async () => {
    const { card } = await show(1000, { layout: 'vertical' });
    await expect.poll(() => card.width).toBe(1000);
    await expectLayout(card, 'vertical');
  });

  test('resizing the wrapper switches the layout both ways', async () => {
    const { card, wrapper } = await show(360);
    await expectLayout(card, 'vertical');
    wrapper.style.width = '1000px';
    await expectLayout(card, 'horizontal');
    wrapper.style.width = '360px';
    await expectLayout(card, 'vertical');
  });
});

describe('the automatic layout at the threshold (responsive-layout "Layout choice", "Layout hysteresis")', () => {
  test('a freshly loaded card is vertical 1 px under the threshold and horizontal at it', async () => {
    const under = await show(VERTICAL_BELOW - 1);
    await expect.poll(() => under.card.width).toBe(VERTICAL_BELOW - 1);
    await expectLayout(under.card, 'vertical');
    const at = await show(VERTICAL_BELOW);
    await expect.poll(() => at.card.width).toBe(VERTICAL_BELOW);
    await expectLayout(at.card, 'horizontal');
  });

  test('a card that went vertical stays vertical up to the threshold plus the hysteresis, and returns at it', async () => {
    const { card, wrapper } = await show(VERTICAL_BELOW - 1);
    await expectLayout(card, 'vertical');
    for (const [width, layout] of [
      [VERTICAL_BELOW, 'vertical'],
      [VERTICAL_BELOW + VERTICAL_HYSTERESIS - 1, 'vertical'],
      [VERTICAL_BELOW + VERTICAL_HYSTERESIS, 'horizontal'],
    ] as const) {
      wrapper.style.width = `${String(width)}px`;
      await expect.poll(() => card.width).toBe(width);
      await expectLayout(card, layout);
    }
    // and it goes vertical again below the threshold, without the hysteresis
    wrapper.style.width = `${String(VERTICAL_BELOW - 1)}px`;
    await expectLayout(card, 'vertical');
  });
});

describe('the layout property Home Assistant assigns', () => {
  test('assigning layout in a real engine neither throws nor changes the layout shown', async () => {
    const { card } = await show(360);
    const assign = (value: unknown): void => {
      (card as unknown as { layout: unknown }).layout = value;
    };
    for (const value of ['panel', 'grid', undefined])
      expect(() => {
        assign(value);
      }).not.toThrow();
    await expectLayout(card, 'vertical');
  });
});
