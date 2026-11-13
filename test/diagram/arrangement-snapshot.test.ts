// The markup snapshot (refine-simplified-layout D8): the card rendered for every configuration of dev/captures.ts with
// the emulator's sample states, in happy-dom. Each capture has its own snapshot file (__snapshots__/arrangement/<capture>.snap) of the SVG markup and of the label
// positions the card writes into the markup (the class (alignment) and the left/top percentages of `[data-label]`, and the footer
// keys), so an intended change updates one known set. happy-dom has no layout: these are the positions in the markup,
// not measured boxes. Recorded before the arrangement refactor; it must pass unchanged after it.
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import '../../src/index';
import type { EcogeoCard } from '../../src/card/ecogeo-card';
import { CAPTURES } from '../../dev/captures';
import { MockHass } from '../../dev/mock-hass';
import { SCENARIOS } from '../../dev/scenarios';
import { configOf, parseState } from '../../dev/url-state';
import { namingStates, registryOf } from '../../dev/foreign';

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

/** The markup without Lit's comment markers and with the per-instance id prefix made constant. */
const normalise = (markup: string): string =>
  markup
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/ecogeo\d+/g, 'ecogeoN')
    .replace(/></g, '>\n<');

describe('markup snapshot of every capture', () => {
  test('the capture names are unique', () => {
    expect(new Set(CAPTURES.map((capture) => capture.name)).size).toBe(CAPTURES.length);
  });

  test.each(CAPTURES.map((capture) => [capture.name, capture.query] as const))('%s', async (name, query) => {
    const state = parseState(`?${query}`);
    const mock = new MockHass();
    const card = document.createElement('ecogeo-card') as EcogeoCard;
    card.setConfig(configOf(state));
    card.hass = mock.build(
      namingStates(state.naming, SCENARIOS[state.scenario].states),
      state.theme === 'dark',
      registryOf(state.naming),
    );
    document.body.append(card);
    await card.updateComplete;
    FakeObserver.instances.at(-1)?.resize(state.width);
    await card.updateComplete;
    const root = card.shadowRoot;
    if (root === null) throw new Error('no shadow root');
    const diagram = root.querySelector('.diagram');
    const svg = root.querySelector('svg');
    if (diagram === null || svg === null) throw new Error('no drawing');
    const labels = [...diagram.querySelectorAll('[data-label]')].map(
      (element) =>
        `${element.getAttribute('data-label') ?? ''} | ${element.getAttribute('class') ?? ''} | ${element.getAttribute('style') ?? ''}`,
    );
    const footer = [...root.querySelectorAll('[data-footer]')].map(
      (element) => element.getAttribute('data-footer') ?? '',
    );
    const text = [
      `layout: ${root.querySelector('ha-card')?.getAttribute('data-layout') ?? ''}`,
      'labels:',
      ...labels,
      `footer: ${footer.join(', ')}`,
      'svg:',
      normalise(svg.outerHTML),
      '',
    ].join('\n');
    await expect(text).toMatchFileSnapshot(`__snapshots__/arrangement/${name}.snap`);
    card.remove();
  });
});
