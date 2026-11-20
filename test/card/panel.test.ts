// The panel fit in the card (refine-simplified-layout D9) with a fake ResizeObserver and a stubbed window height.
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import '../../src/index';
import type { EcogeoCard } from '../../src/card/ecogeo-card';
import { drawingWidth } from '../../src/lib/layout';

class FakeObserver {
  static instances: FakeObserver[] = [];
  constructor(private readonly callback: ResizeObserverCallback) {
    FakeObserver.instances.push(this);
  }
  observe(): void {
    // the test triggers the observation
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

async function show(width: number, height: number, isPanel: boolean | undefined, layout?: string): Promise<EcogeoCard> {
  vi.stubGlobal('innerHeight', height);
  const card = document.createElement('ecogeo-card') as EcogeoCard;
  card.setConfig({ type: 'custom:ecogeo-card' });
  if (isPanel !== undefined) card.isPanel = isPanel;
  if (layout !== undefined) card.layout = layout;
  document.body.append(card);
  await card.updateComplete;
  FakeObserver.instances.at(-1)?.resize(width);
  await card.updateComplete;
  return card;
}

const diagram = (card: EcogeoCard): HTMLElement => {
  const element = card.shadowRoot?.querySelector<HTMLElement>('.diagram');
  if (!element) throw new Error('no drawing');
  return element;
};

describe('isPanel', () => {
  test('a card assigned isPanel by Home Assistant does not throw, before and after connecting', async () => {
    const card = document.createElement('ecogeo-card') as EcogeoCard;
    expect(() => {
      card.isPanel = true;
    }).not.toThrow();
    card.setConfig({ type: 'custom:ecogeo-card' });
    document.body.append(card);
    await card.updateComplete;
    expect(() => {
      (card as unknown as { isPanel: unknown }).isPanel = undefined;
      (card as unknown as { isPanel: unknown }).isPanel = false;
    }).not.toThrow();
    await card.updateComplete;
    expect(card.isPanel).toBe(false);
  });

  test('not a panel: no max-width, whatever the window height', async () => {
    const card = await show(1280, 500, undefined);
    expect(diagram(card).getAttribute('style')).toBeNull();
  });

  test('a panel in a short window: the drawing gets the fitted max-width, centred', async () => {
    const card = await show(1280, 800, true);
    const expected = drawingWidth({
      isPanel: true,
      cardWidth: 1280,
      windowHeight: 800,
      headerHeight: undefined,
      viewBox: { width: 1000, height: 755 },
    });
    expect(expected).toBeLessThan(1280);
    expect(diagram(card).style.maxWidth).toBe(`${String(expected)}px`);
    expect(diagram(card).style.margin).toBe('0px auto');
  });

  test('only layout = panel assigned (no isPanel, as after a rebuild) gives the fit; other layouts none', async () => {
    const expected = Math.floor(((800 - 56 - 64) * 1000) / 755);
    const card = await show(1280, 800, undefined, 'panel');
    expect(diagram(card).style.maxWidth).toBe(`${String(expected)}px`);
    for (const layout of ['masonry', 'grid', undefined]) {
      const other = await show(1280, 800, undefined, layout);
      expect(diagram(other).getAttribute('style')).toBeNull();
    }
  });

  test('a bare requestUpdate() renders', async () => {
    const card = await show(1280, 800, true);
    let renders = 0;
    const render = (card as unknown as { render: () => unknown }).render.bind(card);
    (card as unknown as { render: () => unknown }).render = () => {
      renders += 1;
      return render();
    };
    card.requestUpdate();
    await card.updateComplete;
    expect(renders).toBe(1);
  });

  test('a panel in a tall window: no max-width', async () => {
    const card = await show(1280, 1500, true);
    expect(diagram(card).getAttribute('style')).toBeNull();
  });

  test('a window resize updates the drawing, and the listener is removed with the card', async () => {
    const card = await show(1280, 800, true);
    const before = diagram(card).style.maxWidth;
    vi.stubGlobal('innerHeight', 700);
    window.dispatchEvent(new Event('resize'));
    await card.updateComplete;
    expect(diagram(card).style.maxWidth).not.toBe(before);
    card.remove();
    vi.stubGlobal('innerHeight', 600);
    window.dispatchEvent(new Event('resize'));
    expect(card.viewportHeight).toBe(700);
  });

  test('the layout follows the drawing width: a panel in a short window is vertical with auto although the card is wide', async () => {
    // (420 - 56 - 64) * 1000 / 755 = 397 px, below the vertical threshold
    const card = await show(1280, 420, true);
    expect(card.shownLayout).toBe('vertical');
    expect(card.shadowRoot?.querySelector('ha-card')?.getAttribute('data-layout')).toBe('vertical');
    const tall = await show(1280, 800, true);
    expect(tall.shownLayout).toBe('horizontal');
  });
});
