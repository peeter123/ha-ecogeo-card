import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import '../../src/index';
import type { EcogeoCard } from '../../src/card/ecogeo-card';
import { configErrors } from '../../src/config/options';
import { resolveConfig } from '../../src/config/resolve';
import { COMPACT_BELOW, isCompact } from '../../src/lib/layout';
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
    expect(configErrors({ type: 'custom:ecogeo-card', layout: 'portrait' })).toEqual([
      expect.stringMatching(/layout.*auto, full, compact/),
    ]);
  });

  test('Minimal valid config uses the automatic layout', () => {
    expect(resolveConfig({ type: 'custom:ecogeo-card', prefix: 'ecoforest_ecogeo' }).layout).toBe('auto');
    for (const layout of ['auto', 'full', 'compact']) {
      expect(configErrors({ type: 'custom:ecogeo-card', layout })).toEqual([]);
    }
  });
});

describe('isCompact', () => {
  test('forced layouts ignore the width', () => {
    expect(isCompact('compact', 2000)).toBe(true);
    expect(isCompact('full', 100)).toBe(false);
  });

  test('auto is compact below the threshold only, and full while the width is unknown', () => {
    expect(isCompact('auto', COMPACT_BELOW - 1)).toBe(true);
    expect(isCompact('auto', COMPACT_BELOW)).toBe(false);
    expect(isCompact('auto', undefined)).toBe(false);
    expect(isCompact('auto', 0)).toBe(false);
  });
});

describe('card layout from its width', () => {
  test('unknown width (before the first observation) is full', async () => {
    const card = await mount();
    expect(layoutOf(card)).toBe('full');
  });

  test('Auto on a phone: 360 px is compact', async () => {
    const card = await mount();
    await resize(card, 360);
    expect(layoutOf(card)).toBe('compact');
  });

  test('Auto on a wide card: 1000 px is full', async () => {
    const card = await mount();
    await resize(card, 1000);
    expect(layoutOf(card)).toBe('full');
  });

  test('Forced full: layout full at 360 px is full', async () => {
    const card = await mount({ layout: 'full' });
    await resize(card, 360);
    expect(layoutOf(card)).toBe('full');
  });

  test('Forced compact at 1000 px is compact', async () => {
    const card = await mount({ layout: 'compact' });
    await resize(card, 1000);
    expect(layoutOf(card)).toBe('compact');
  });

  test('a width change that keeps the layout does not render again; one that flips it does', async () => {
    const card = await mount();
    await resize(card, 360);
    const rendered = vi.spyOn(card as unknown as { render(): unknown }, 'render');
    await resize(card, 380);
    expect(rendered).not.toHaveBeenCalled();
    await resize(card, 1000);
    expect(rendered).toHaveBeenCalledTimes(1);
    expect(layoutOf(card)).toBe('full');
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
