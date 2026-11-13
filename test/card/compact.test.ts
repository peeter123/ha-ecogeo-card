// The compact layout's content (responsive-layout spec: Compact content, Layout hysteresis), with a mocked width.
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { arrangementFor } from '../../src/diagram/geometry';
import '../../src/index';
import type { EcogeoCard } from '../../src/card/ecogeo-card';
import type { CardConfig } from '../../src/lib/config';
import { COMPACT_BELOW, COMPACT_HYSTERESIS } from '../../src/lib/layout';
import { VALUE_CAPTIONS } from '../../src/strings';

// the default config draws the simplified level
const simplified = arrangementFor('simplified', 'full');
const LABEL_SPECS = simplified.labels.specs;

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
const labelIds = (card: EcogeoCard): string[] =>
  [...root(card).querySelectorAll('[data-label]')].map((element) => element.getAttribute('data-label') ?? '');
const footerIds = (card: EcogeoCard): string[] =>
  [...root(card).querySelectorAll('[data-footer]')].map((element) => element.getAttribute('data-footer') ?? '');
const layoutOf = (card: EcogeoCard): string | null | undefined =>
  root(card).querySelector('ha-card')?.getAttribute('data-layout');

const KEY = ['production_out', 'production_in', 'brine_out', 'brine_in', 'compressor_speed'];
const DETAIL = [
  'production_pressure',
  'production_pump',
  'dg1_setpoint',
  'brine_pressure',
  'brine_pump',
  'discharge_pressure',
  'suction_pressure',
  'compressor_percentage',
  'compressor_power',
  'superheat',
  'expansion_valve',
  'tank_external_setpoint',
  'tank_external_start_delta',
];

describe('label tiers', () => {
  test('the key labels are the seven key values; "Demand" captions are detail', () => {
    const keys = LABEL_SPECS.filter((label) => label.tier === 'key').map((label) => label.id);
    expect(keys.sort()).toEqual(
      [
        ...KEY,
        'air_unit_out',
        'ground_out',
        'hybrid_ground_out',
        'tank_external_temperature',
        'tank_internal_temperature',
      ].sort(),
    );
    expect(LABEL_SPECS.filter((label) => label.demand === true).every((label) => label.tier === 'detail')).toBe(true);
  });
});

describe('compact content', () => {
  test('Compact labels: heating, ground source, external tank shows the key values only', async () => {
    const card = await show(360, { source: 'ground', dhw: 'external' });
    expect(layoutOf(card)).toBe('compact');
    expect(labelIds(card).sort()).toEqual([...KEY, 'ground_out', 'tank_external_temperature'].sort());
    for (const id of DETAIL) expect(labelIds(card), id).not.toContain(id);
  });

  test('the source Out is the only source label: air, ground and hybrid', async () => {
    const out = { air: 'air_unit_out', ground: 'ground_out', hybrid: 'hybrid_ground_out' } as const;
    for (const source of ['air', 'ground', 'hybrid'] as const) {
      const card = await show(360, { source });
      const ids = labelIds(card);
      expect(ids, source).toContain(out[source]);
      for (const id of Object.values(out)) if (id !== out[source]) expect(ids, `${source} ${id}`).not.toContain(id);
      for (const id of ['air_unit_in', 'hybrid_air_unit_in', 'ground_in', 'fan_speed', 'outside_temperature']) {
        expect(ids, `${source} ${id}`).not.toContain(id);
      }
      card.remove();
    }
  });

  test('model C: the internal tank temperature stays, its setpoint and start delta-T go', async () => {
    const card = await show(360, { model: 'C', dhw: 'internal' });
    const ids = labelIds(card);
    expect(ids).toContain('tank_internal_temperature');
    expect(ids).not.toContain('tank_internal_setpoint');
    expect(ids).not.toContain('tank_internal_start_delta');
  });

  test('the full layout still shows every label', async () => {
    const card = await show(1000, { source: 'ground', dhw: 'external' });
    for (const id of [...KEY, ...DETAIL]) expect(labelIds(card), id).toContain(id);
  });

  test('Compact footer: the outside temperature and the COP, not the capacities, on/off or season', async () => {
    const card = await show(360);
    expect(footerIds(card).sort()).toEqual(['cop', 'outside_temperature']);
    expect(root(card).querySelector('.mode')).not.toBeNull();
    const wide = await show(1000);
    expect(footerIds(wide)).toEqual(
      expect.arrayContaining(['on_off', 'season', 'cop', 'condensation_capacity', 'evaporation_capacity']),
    );
  });

  test('Compact ignores full detail: no item number and no safety valve', async () => {
    const full = await show(1000, { detail: 'full', variant: 4 });
    expect(root(full).querySelectorAll('text.item').length).toBeGreaterThan(20);
    expect(root(full).querySelector('[data-item="20"]')).not.toBeNull();
    const compact = await show(360, { detail: 'full', variant: 4 });
    expect(root(compact).querySelectorAll('text.item')).toHaveLength(0);
    expect(root(compact).querySelector('[data-item="20"]')).toBeNull();
    expect(root(compact).querySelector('[data-item="21"]')).toBeNull();
  });

  test('forced compact at any width behaves the same', async () => {
    const card = await show(1000, { layout: 'compact', detail: 'full' });
    expect(root(card).querySelectorAll('text.item')).toHaveLength(0);
    expect(footerIds(card).sort()).toEqual(['cop', 'outside_temperature']);
  });
});

describe('No flip at the threshold', () => {
  test('a compact card stays compact up to threshold + 23 and goes full at threshold + 24', async () => {
    const card = await show(360);
    await resizeTo(card, COMPACT_BELOW + 10);
    expect(layoutOf(card)).toBe('compact');
    await resizeTo(card, COMPACT_BELOW + COMPACT_HYSTERESIS - 1);
    expect(layoutOf(card)).toBe('compact');
    await resizeTo(card, COMPACT_BELOW + COMPACT_HYSTERESIS);
    expect(layoutOf(card)).toBe('full');
  });

  test('a full card goes compact only below the threshold, and then stays compact across the band', async () => {
    const card = await show(1000);
    await resizeTo(card, COMPACT_BELOW + 10);
    expect(layoutOf(card)).toBe('full');
    await resizeTo(card, COMPACT_BELOW - 1);
    expect(layoutOf(card)).toBe('compact');
    await resizeTo(card, COMPACT_BELOW + 10);
    expect(layoutOf(card)).toBe('compact');
  });
});

describe('Compact without captions', () => {
  const captionTexts = (card: EcogeoCard): string[] =>
    [...root(card).querySelectorAll('svg text')]
      .filter((text) => ['circuit-label', 'source-caption', 'tank-caption'].includes(text.getAttribute('class') ?? ''))
      .map((text) => text.textContent.trim());

  test('compact draws no in-drawing caption, for every source and for model C; full draws them', async () => {
    const configs: CardConfig[] = [
      { source: 'air' },
      { source: 'ground' },
      { source: 'hybrid' },
      { model: 'C', dhw: 'internal' },
    ];
    for (const config of configs) {
      const compact = await show(360, config);
      expect(captionTexts(compact), JSON.stringify(config)).toEqual([]);
      compact.remove();
      const full = await show(1000, config);
      expect(captionTexts(full).length, JSON.stringify(config)).toBeGreaterThan(1);
      full.remove();
    }
  });
});

describe('Compact footer indications', () => {
  test('the alarm and offline indications show in compact', async () => {
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
    expect(layoutOf(card)).toBe('compact');
    expect(root(card).querySelector('.alarm')).not.toBeNull();
    expect(root(card).querySelector('.offline')).not.toBeNull();
    expect(footerIds(card).sort()).toEqual(['cop', 'outside_temperature']);
  });
});

describe('Hysteresis counts only a compact layout that auto chose', () => {
  test('after a switch from layout compact to auto inside the band the card is full', async () => {
    const card = await show(COMPACT_BELOW + 10, { layout: 'compact' });
    expect(layoutOf(card)).toBe('compact');
    card.setConfig({ type: 'custom:ecogeo-card', layout: 'auto' });
    await card.updateComplete;
    expect(layoutOf(card)).toBe('full');
  });

  test('a card that auto made compact stays compact in the band', async () => {
    const card = await show(360, { layout: 'auto' });
    await resizeTo(card, COMPACT_BELOW + 10);
    expect(layoutOf(card)).toBe('compact');
  });
});

describe('Compact value captions', () => {
  const caption = (card: EcogeoCard, id: string): string | undefined =>
    root(card).querySelector(`[data-label="${id}"] .caption`)?.textContent.trim();
  const expected = {
    production_out: VALUE_CAPTIONS.portOut,
    production_in: VALUE_CAPTIONS.portIn,
    brine_out: VALUE_CAPTIONS.portOut,
    brine_in: VALUE_CAPTIONS.portIn,
    tank_external_temperature: VALUE_CAPTIONS.dhw,
  };

  test('compact: the production and brine values carry Out and In captions; full has none', async () => {
    const compact = await show(360);
    for (const [id, text] of Object.entries(expected)) expect(caption(compact, id), id).toBe(text);
    const full = await show(1000);
    for (const id of Object.keys(expected)) expect(caption(full, id), id).toBeUndefined();
  });

  test('model C: the internal tank value carries the DHW caption in compact only', async () => {
    const config = { model: 'C', dhw: 'internal' } as const;
    expect(caption(await show(360, config), 'tank_internal_temperature')).toBe(VALUE_CAPTIONS.dhw);
    expect(caption(await show(1000, config), 'tank_internal_temperature')).toBeUndefined();
  });

  test('only the internal tank value stacks its caption above the value, and only in compact', async () => {
    const stacked = (card: EcogeoCard): string[] =>
      [...root(card).querySelectorAll('.label.stacked')].map((element) => element.getAttribute('data-label') ?? '');
    const config = { model: 'C', dhw: 'internal' } as const;
    expect(stacked(await show(360, config))).toEqual(['tank_internal_temperature']);
    expect(stacked(await show(360))).toEqual([]);
    expect(stacked(await show(1000, config))).toEqual([]);
  });

  test('the source and compressor labels keep the captions they had', async () => {
    const compact = await show(360, { source: 'air' });
    expect(caption(compact, 'air_unit_out')).toBe(VALUE_CAPTIONS.portOut);
    expect(caption(compact, 'compressor_speed')).toBeUndefined();
  });
});

describe('the arrangement of the shown layout (refine-simplified-layout D1)', () => {
  test.each([
    ['simplified', 1000, 'full'],
    ['full', 1000, 'full'],
    ['simplified', 320, 'compact'],
    ['full', 320, 'compact'],
  ] as const)("detail %s at %i px (%s layout): the viewBox is the arrangement's", async (detail, width, layout) => {
    const card = await show(width, { detail });
    const { viewBox } = arrangementFor(detail, layout);
    expect(root(card).querySelector('ha-card')?.getAttribute('data-layout')).toBe(layout);
    expect(root(card).querySelector('svg')?.getAttribute('viewBox')).toBe(
      `0 0 ${String(viewBox.width)} ${String(viewBox.height)}`,
    );
  });
});
