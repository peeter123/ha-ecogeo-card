import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { LitElement } from 'lit';
import '../../src/index';
import type { EcogeoCard } from '../../src/card/ecogeo-card';
import { configErrors } from '../../src/config/options';
import { resolveConfig } from '../../src/config/resolve';
import { VERTICAL_BELOW, VERTICAL_HYSTERESIS, isVertical, nextVertical, strokeWidths } from '../../src/lib/layout';
import type { CardConfig } from '../../src/lib/config';

/** A ResizeObserver whose observations the test triggers. */
class FakeObserver {
  static instances: FakeObserver[] = [];
  observed: Element[] = [];
  disconnected = false;
  constructor(private readonly callback: ResizeObserverCallback) {
    FakeObserver.instances.push(this);
  }
  observe(target: Element): void {
    this.observed.push(target);
  }
  unobserve(): void {
    // not used by the card
  }
  disconnect(): void {
    this.disconnected = true;
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

async function mount(config: CardConfig = {}): Promise<EcogeoCard> {
  const card = document.createElement('ecogeo-card') as EcogeoCard;
  card.setConfig({ type: 'custom:ecogeo-card', ...config });
  document.body.append(card);
  await card.updateComplete;
  return card;
}

const layoutOf = (card: EcogeoCard): string | null | undefined =>
  card.shadowRoot?.querySelector('ha-card')?.getAttribute('data-layout');

async function resize(card: EcogeoCard, width: number): Promise<void> {
  const observer = FakeObserver.instances.at(-1);
  if (observer === undefined) throw new Error('the card observes nothing');
  observer.resize(width);
  await card.updateComplete;
}

describe('layout option', () => {
  test('Invalid layout: the error names layout and its allowed values', () => {
    for (const layout of ['portrait', 'full', 'compact']) {
      expect(configErrors({ type: 'custom:ecogeo-card', layout })).toEqual([
        expect.stringMatching(/layout.*auto, horizontal, vertical/),
      ]);
    }
  });

  test('Invalid detail: the removed option is an unknown option', () => {
    expect(configErrors({ type: 'custom:ecogeo-card', detail: 'full' })).toEqual([expect.stringContaining('detail')]);
  });

  test('Minimal valid config uses the automatic layout', () => {
    expect(resolveConfig({ type: 'custom:ecogeo-card', prefix: 'ecoforest_ecogeo' }).layout).toBe('auto');
    for (const layout of ['auto', 'horizontal', 'vertical']) {
      expect(configErrors({ type: 'custom:ecogeo-card', layout })).toEqual([]);
    }
  });
});

describe('VERTICAL_BELOW', () => {
  test('stays at 640 px or less', () => {
    expect(VERTICAL_BELOW).toBeLessThanOrEqual(640);
  });
});

describe('isVertical', () => {
  test('forced layouts ignore the width', () => {
    expect(isVertical('vertical', 2000)).toBe(true);
    expect(isVertical('horizontal', 100)).toBe(false);
  });

  test('auto is vertical below the threshold only, and horizontal while the width is unknown', () => {
    expect(isVertical('auto', VERTICAL_BELOW - 1)).toBe(true);
    expect(isVertical('auto', VERTICAL_BELOW)).toBe(false);
    expect(isVertical('auto', undefined)).toBe(false);
    expect(isVertical('auto', 0)).toBe(false);
  });
});

describe('nextVertical (layout hysteresis)', () => {
  test('forced layouts ignore the width and the current layout', () => {
    expect(nextVertical('vertical', 2000, false)).toBe(true);
    expect(nextVertical('horizontal', 100, true)).toBe(false);
  });

  test('a horizontal card goes vertical below the threshold, as isVertical does', () => {
    expect(nextVertical('auto', VERTICAL_BELOW - 1, false)).toBe(true);
    expect(nextVertical('auto', VERTICAL_BELOW, false)).toBe(false);
  });

  test('No flip at the threshold: a vertical card stays vertical until the threshold plus the hysteresis', () => {
    expect(VERTICAL_HYSTERESIS).toBe(24);
    expect(nextVertical('auto', VERTICAL_BELOW + 10, true)).toBe(true);
    expect(nextVertical('auto', VERTICAL_BELOW + VERTICAL_HYSTERESIS - 1, true)).toBe(true);
    expect(nextVertical('auto', VERTICAL_BELOW + VERTICAL_HYSTERESIS, true)).toBe(false);
    expect(nextVertical('auto', VERTICAL_BELOW + 100, true)).toBe(false);
  });

  test('an unknown width gives horizontal, also for a vertical card', () => {
    expect(nextVertical('auto', undefined, true)).toBe(false);
    expect(nextVertical('auto', 0, true)).toBe(false);
  });
});

describe('strokeWidths', () => {
  test('wide cards and an unknown width keep the designed widths', () => {
    for (const width of [undefined, 0, 700, 1000, 2000]) {
      expect(strokeWidths(width), String(width)).toEqual({ pipe: 3, outline: 2 });
    }
  });

  test('narrow cards get 2 px pipes and 1.25 px outlines in drawing units, rounded up to 0.1', () => {
    expect(strokeWidths(360)).toEqual({ pipe: 5.6, outline: 3.5 });
    expect(strokeWidths(320)).toEqual({ pipe: 6.3, outline: 4 });
    expect(strokeWidths(300)).toEqual({ pipe: 6.7, outline: 4.2 });
  });

  test('the rendered minimum holds after rounding at every width', () => {
    for (let width = 200; width <= 700; width += 1) {
      const { pipe, outline } = strokeWidths(width);
      expect(pipe * (width / 1000), String(width)).toBeGreaterThanOrEqual(2 - 1e-9);
      expect(outline * (width / 1000), String(width)).toBeGreaterThanOrEqual(1.25 - 1e-9);
    }
  });
});

describe('card layout from its width', () => {
  test('unknown width (before the first observation) is horizontal', async () => {
    const card = await mount();
    expect(layoutOf(card)).toBe('horizontal');
  });

  test('Auto on a phone: 360 px is vertical', async () => {
    const card = await mount();
    await resize(card, 360);
    expect(layoutOf(card)).toBe('vertical');
  });

  test('Auto on a wide card: 1000 px is horizontal', async () => {
    const card = await mount();
    await resize(card, 1000);
    expect(layoutOf(card)).toBe('horizontal');
  });

  test('Forced horizontal: layout horizontal at 360 px is horizontal', async () => {
    const card = await mount({ layout: 'horizontal' });
    await resize(card, 360);
    expect(layoutOf(card)).toBe('horizontal');
  });

  test('Forced vertical at 1000 px is vertical', async () => {
    const card = await mount({ layout: 'vertical' });
    await resize(card, 1000);
    expect(layoutOf(card)).toBe('vertical');
  });

  test('a width change that keeps the layout does not render again; one that flips it does', async () => {
    const card = await mount();
    await resize(card, 1000);
    const rendered = vi.spyOn(card as unknown as { render(): unknown }, 'render');
    await resize(card, 1200);
    expect(rendered).not.toHaveBeenCalled();
    await resize(card, 360);
    expect(rendered).toHaveBeenCalledTimes(1);
    expect(layoutOf(card)).toBe('vertical');
  });

  test('a width change that keeps the layout but changes the stroke widths renders again', async () => {
    const card = await mount();
    await resize(card, 360);
    const rendered = vi.spyOn(card as unknown as { render(): unknown }, 'render');
    await resize(card, 380);
    expect(rendered).toHaveBeenCalledTimes(1);
    expect(card.shadowRoot?.querySelector('svg')?.getAttribute('style')).toContain(
      `--pipe-width: ${String(strokeWidths(380).pipe)}`,
    );
  });

  test('an observation with an unchanged width is ignored', async () => {
    const card = await mount();
    await resize(card, 360);
    expect(card.width).toBe(360);
    const assigned = vi.spyOn(card, 'width', 'set');
    FakeObserver.instances.at(-1)?.resize(360);
    expect(assigned).not.toHaveBeenCalled();
    expect(card.isUpdatePending).toBe(false);
    FakeObserver.instances.at(-1)?.resize(361);
    expect(assigned).toHaveBeenCalledTimes(1);
  });

  test('the observer connects with the card and disconnects when it leaves', async () => {
    const card = await mount();
    const observer = FakeObserver.instances.at(-1);
    expect(observer?.observed).toEqual([card]);
    card.remove();
    expect(observer?.disconnected).toBe(true);
  });
});

// Home Assistant's hui-card assigns `layout` ("panel", "grid") to every card element. A card that defines `layout`
// without a setter throws on that assignment and cannot be built (add-compact-layout D1, task 2.6).
describe('the layout property Home Assistant assigns', () => {
  const assign = (card: EcogeoCard, value: unknown): void => {
    (card as unknown as { layout: unknown }).layout = value;
  };

  test('assigning layout before setConfig neither throws nor changes the layout shown', async () => {
    const card = document.createElement('ecogeo-card') as EcogeoCard;
    for (const value of ['panel', 'grid', undefined])
      expect(() => {
        assign(card, value);
      }).not.toThrow();
    card.setConfig({ type: 'custom:ecogeo-card' });
    document.body.append(card);
    await card.updateComplete;
    await resize(card, 360);
    expect(layoutOf(card)).toBe('vertical');
    expect(card.shownLayout).toBe('vertical');
  });

  test('assigning layout after setConfig neither throws nor changes the layout shown', async () => {
    for (const [config, width, shown] of [
      [{}, 360, 'vertical'],
      [{}, 1000, 'horizontal'],
      [{ layout: 'horizontal' }, 360, 'horizontal'],
      [{ layout: 'vertical' }, 1000, 'vertical'],
    ] as const) {
      const card = await mount(config);
      await resize(card, width);
      for (const value of ['panel', 'grid', undefined]) {
        expect(() => {
          assign(card, value);
        }).not.toThrow();
        await card.updateComplete;
        expect(layoutOf(card)).toBe(shown);
        expect(card.shownLayout).toBe(shown);
      }
    }
  });

  test('layout is a plain reactive property (settable, never read-only), separate from the config option', () => {
    const card = document.createElement('ecogeo-card') as EcogeoCard;
    // Home Assistant's panel view assigns layout = 'panel'; the config's layout option lives in the resolved config.
    expect((card.constructor as typeof LitElement).elementProperties.has('layout')).toBe(true);
    expect(() => {
      (card as unknown as { layout: unknown }).layout = 'panel';
    }).not.toThrow();
    expect((card as unknown as { layout: unknown }).layout).toBe('panel');
  });

  // The properties Home Assistant's hui-card assigns to every card element.
  test.each(['hass', 'layout', 'preview', 'editMode', 'isPanel'])('%s is never a getter without a setter', (name) => {
    const card = document.createElement('ecogeo-card') as EcogeoCard;
    const readOnly = (descriptor: PropertyDescriptor | undefined): boolean =>
      descriptor?.get !== undefined && descriptor.set === undefined;
    expect(readOnly(Object.getOwnPropertyDescriptor(card, name))).toBe(false);
    for (
      let proto = Object.getPrototypeOf(card) as object | null;
      proto !== null && proto !== LitElement.prototype;
      proto = Object.getPrototypeOf(proto) as object | null
    ) {
      expect(readOnly(Object.getOwnPropertyDescriptor(proto, name)), proto.constructor.name).toBe(false);
    }
  });
});
