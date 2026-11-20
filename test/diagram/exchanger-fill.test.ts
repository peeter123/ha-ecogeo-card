import { describe, expect, test } from 'vitest';
import '../../src/index';
import { EcogeoCard } from '../../src/card/ecogeo-card';
import { MUTED_COLOR, temperatureColor } from '../../src/diagram/colors';
import type { RolePath } from '../../src/config/roles';
import type { CardConfig } from '../../src/lib/config';
import type { HassLike } from '../../src/lib/hass';
import { DEMO_PREFIX, SCENARIOS, scenarioStates, type ScenarioName } from '../../dev/scenarios';

/** A card in sample mode (heating) or on the states of an emulator scenario. */
async function mount(config: CardConfig = {}, scenario?: ScenarioName): Promise<EcogeoCard> {
  const card = document.createElement('ecogeo-card') as EcogeoCard;
  const prefix = scenario === undefined ? {} : { prefix: DEMO_PREFIX };
  card.setConfig({ type: 'custom:ecogeo-card', ...prefix, ...config });
  if (scenario !== undefined) {
    const states = scenarioStates(SCENARIOS[scenario].states);
    const hass: HassLike = {
      states: Object.fromEntries(Object.entries(states).map(([id, state]) => [id, { entity_id: id, ...state }])),
    };
    card.hass = hass;
  }
  document.body.append(card);
  await card.updateComplete;
  return card;
}

const root = (card: EcogeoCard): ShadowRoot => {
  if (card.shadowRoot === null) throw new Error('no shadow root');
  return card.shadowRoot;
};

interface Side {
  paint: string | null;
  opacity: string | null;
  y1: number;
  y2: number;
  start: string;
  end: string;
}

/** The fill of one half of an exchanger: its paint, and the gradient it refers to. */
function side(card: EcogeoCard, item: number, half: 'left' | 'right'): Side {
  const fill = root(card).querySelector(`[data-item="${String(item)}"] .exchanger-fill[data-half="${half}"]`);
  if (fill === null) throw new Error(`exchanger ${String(item)} has no ${half} fill`);
  const paint = fill.getAttribute('fill');
  const id = /^url\(#(.+)\)$/.exec(paint ?? '')?.[1] ?? '';
  const gradient = [...root(card).querySelectorAll('linearGradient')].find((element) => element.id === id);
  if (gradient === undefined) throw new Error(`no gradient ${id}`);
  const stops = [...gradient.querySelectorAll('stop')].map(
    (stop) => /stop-color:\s*(.+?);?$/.exec(stop.getAttribute('style') ?? '')?.[1] ?? '',
  );
  return {
    paint,
    opacity: fill.getAttribute('fill-opacity'),
    y1: Number(gradient.getAttribute('y1')),
    y2: Number(gradient.getAttribute('y2')),
    start: stops[0] ?? '',
    end: stops[1] ?? '',
  };
}

const scenarioValue = (scenario: ScenarioName, role: RolePath): number => Number(SCENARIOS[scenario].states[role]);
const colorOf = (scenario: ScenarioName, role: RolePath): string => temperatureColor(scenarioValue(scenario, role));

describe('exchanger side fills (temperature-coloring spec)', () => {
  test('condenser while heating: refrigerant 52.5 to 27.0 degrees, water 22.0 to 25.2 degrees', async () => {
    const card = await mount();
    const refrigerant = side(card, 8, 'right');
    expect(refrigerant.start).toBe(temperatureColor(52.5));
    expect(refrigerant.end).toBe(temperatureColor(27));
    // the refrigerant enters at the top and runs down
    expect([refrigerant.y1, refrigerant.y2]).toEqual([0, 1]);
    const water = side(card, 8, 'left');
    expect(water.start).toBe(temperatureColor(22));
    expect(water.end).toBe(temperatureColor(25.2));
    // the water enters at the bottom and runs up
    expect([water.y1, water.y2]).toEqual([1, 0]);
    expect(water.opacity).toBe('0.55');
    card.remove();
  });

  test('the fill lies under the outline, the plate lines and the ports', async () => {
    const card = await mount();
    const group = root(card).querySelector('[data-item="8"] .symbol');
    const kinds = [...(group?.children ?? [])].map((child) => child.getAttribute('class') ?? child.tagName);
    expect(kinds.slice(0, 2)).toEqual(['exchanger-fill', 'exchanger-fill']);
    expect(kinds.slice(2).some((kind) => kind.includes('exchanger-fill'))).toBe(false);
    card.remove();
  });

  test('idle exchanger: heating with passive cooling true, exchanger 10 is muted on both sides', async () => {
    const card = await mount({ features: { passive_cooling: true } });
    for (const half of ['left', 'right'] as const) {
      const muted = side(card, 10, half);
      expect([muted.start, muted.end]).toEqual([MUTED_COLOR, MUTED_COLOR]);
    }
    // the exchangers that work are coloured
    expect(side(card, 8, 'left').start).not.toBe(MUTED_COLOR);
    card.remove();
  });

  test('exchanger 10 is coloured in defrost, which uses it', async () => {
    const card = await mount({}, 'defrost');
    expect(side(card, 10, 'left').start).toBe(colorOf('defrost', 'production.return_temperature'));
    expect(side(card, 10, 'right').start).toBe(colorOf('defrost', 'brine.inlet_temperature'));
    card.remove();
  });

  test('fill off: no exchanger has a coloured fill and no gradient is defined', async () => {
    const card = await mount({ exchanger_fill: 'none' });
    expect(root(card).querySelectorAll('.exchanger-fill')).toHaveLength(0);
    // only the underfloor loop's own gradient (its stroke, whatever the fill says) is defined
    expect(
      [...root(card).querySelectorAll('linearGradient')].map((gradient) => gradient.id.replace(/^ecogeo\d+-/, '')),
    ).toEqual(['emitter']);
    expect(root(card).querySelectorAll('[data-kind="exchanger"]')).toHaveLength(4);
    card.remove();
  });

  test('an invalid exchanger_fill is a configuration error naming the option', () => {
    const card = document.createElement('ecogeo-card') as EcogeoCard;
    expect(() => {
      card.setConfig({ type: 'custom:ecogeo-card', exchanger_fill: 'solid' });
    }).toThrow(/exchanger_fill.*gradient, none/);
  });

  test('active cooling: condenser 8 works as the evaporator, so its refrigerant side swaps start and end', async () => {
    const card = await mount({}, 'active_cooling');
    const refrigerant = side(card, 8, 'right');
    // the refrigerant now enters at the bottom at the evaporation temperature and leaves at the top at suction
    expect([refrigerant.y1, refrigerant.y2]).toEqual([1, 0]);
    expect(refrigerant.start).toBe(colorOf('active_cooling', 'refrigerant.evaporation_temperature'));
    expect(refrigerant.end).toBe(colorOf('active_cooling', 'compressor.suction_temperature'));
    // the water side keeps its direction
    const water = side(card, 8, 'left');
    expect([water.y1, water.y2]).toEqual([1, 0]);
    card.remove();
  });

  test('active cooling: evaporator 7 works as the condenser, so its refrigerant side swaps start and end', async () => {
    const card = await mount({}, 'active_cooling');
    const refrigerant = side(card, 7, 'left');
    // discharge enters at the top and the condensed refrigerant leaves at the bottom
    expect([refrigerant.y1, refrigerant.y2]).toEqual([0, 1]);
    expect(refrigerant.start).toBe(colorOf('active_cooling', 'compressor.discharge_temperature'));
    expect(refrigerant.end).toBe(colorOf('active_cooling', 'refrigerant.condensation_temperature'));
    card.remove();
  });

  test('in heating evaporator 7 enters at the bottom at the evaporation temperature', async () => {
    const card = await mount();
    const refrigerant = side(card, 7, 'left');
    expect([refrigerant.y1, refrigerant.y2]).toEqual([1, 0]);
    expect(refrigerant.start).toBe(temperatureColor(-5.3));
    expect(refrigerant.end).toBe(temperatureColor(1));
    const brine = side(card, 7, 'right');
    expect(brine.start).toBe(temperatureColor(0.5));
    expect(brine.end).toBe(temperatureColor(-2.8));
    card.remove();
  });

  test('without active and passive cooling the bypass pipes colour the sides (the first drawn candidate counts)', async () => {
    const card = await mount({ features: { active_cooling: false, passive_cooling: false } });
    // 8 refrigerant in: ref_direct_8 at the discharge temperature
    expect(side(card, 8, 'right').start).toBe(temperatureColor(52.5));
    // 7 refrigerant out: ref_direct_suction at the suction temperature
    expect(side(card, 7, 'left').end).toBe(temperatureColor(1));
    // 7 brine out: brine_bypass28 at the brine outlet temperature
    expect(side(card, 7, 'right').end).toBe(temperatureColor(-2.8));
    card.remove();
  });

  test('HTR exchanger 9: discharge colour on the refrigerant side, HTR water colour only while HTR is active', async () => {
    const htr = await mount({}, 'active_cooling_htr');
    const discharge = colorOf('active_cooling_htr', 'compressor.discharge_temperature');
    expect(side(htr, 9, 'right')).toMatchObject({ start: discharge, end: discharge });
    const water = colorOf('active_cooling_htr', 'dhw.temperature');
    expect(side(htr, 9, 'left')).toMatchObject({ start: water, end: water });
    htr.remove();

    const heating = await mount();
    const heatingDischarge = temperatureColor(52.5);
    expect(side(heating, 9, 'right')).toMatchObject({ start: heatingDischarge, end: heatingDischarge });
    expect(side(heating, 9, 'left')).toMatchObject({ start: MUTED_COLOR, end: MUTED_COLOR });
    heating.remove();
  });

  test('two cards in one DOM define gradients with distinct ids, each fill pointing at its own card', async () => {
    const first = await mount();
    const second = await mount();
    const ids = (card: EcogeoCard): string[] => [...root(card).querySelectorAll('linearGradient')].map((g) => g.id);
    // the exchanger sides' gradients and the emitter's
    expect(ids(first)).toHaveLength(9);
    expect(ids(second)).toHaveLength(9);
    expect(new Set([...ids(first), ...ids(second)]).size).toBe(18);
    expect(side(first, 8, 'left').paint).not.toBe(side(second, 8, 'left').paint);
    first.remove();
    second.remove();
  });
});
