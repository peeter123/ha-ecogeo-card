import { describe, expect, test } from 'vitest';
import { CAPTURES } from '../../dev/captures';
import { SCENARIO_NAMES } from '../../dev/scenarios';
import { configOf, defaultState, dhwForModel, parseState, toSearch } from '../../dev/url-state';
import { configErrors } from '../../src/config/options';
import { COMPACT_BELOW } from '../../src/lib/layout';

describe('emulator URL state', () => {
  test('a DHW value the model rejects falls back to default', () => {
    expect(parseState('?model=C&dhw=none').dhw).toBe('default');
    expect(parseState('?model=B&dhw=internal').dhw).toBe('default');
    expect(parseState('?model=C&dhw=unused').dhw).toBe('unused');
    expect(dhwForModel('C', 'none')).toBe('default');
    expect(dhwForModel('B', 'unused')).toBe('unused');
  });

  test('an empty query is the default state', () => {
    expect(parseState('')).toEqual(defaultState());
  });

  test('a state survives the round trip through its query string', () => {
    const state = {
      ...defaultState(),
      scenario: 'passive_cooling' as const,
      naming: 'foreign' as const,
      model: 'C' as const,
      variant: 2 as const,
      source: 'hybrid' as const,
      dhw: 'unused' as const,
      detail: 'full' as const,
      fill: 'none' as const,
      layout: 'compact' as const,
      width: 360,
      theme: 'dark' as const,
      cycle: 5,
      features: { active_cooling: 'false', passive_cooling: 'unused', htr: 'true', backup_heater: 'default' } as const,
    };
    expect(parseState(toSearch(state))).toEqual(state);
  });

  test('invalid values keep their defaults', () => {
    expect(
      parseState(
        '?scenario=x&naming=klingon&model=Z&variant=9&source=sun&theme=blue&htr=maybe&detail=minimal&fill=solid&layout=portrait&width=abc',
      ),
    ).toEqual(defaultState());
  });

  test('naming: the URL carries naming=foreign only when it is not the default', () => {
    const foreign = { ...defaultState(), naming: 'foreign' as const };
    expect(new URLSearchParams(toSearch(foreign)).get('naming')).toBe('foreign');
    expect(new URLSearchParams(toSearch(defaultState())).has('naming')).toBe(false);
    expect(parseState('?naming=foreign').naming).toBe('foreign');
    expect(parseState('?naming=firmware').naming).toBe('firmware');
  });

  test('naming: the foreign config binds every role by id, sets the `none` roles and the states, and has no prefix', () => {
    const config = configOf({ ...defaultState(), naming: 'foreign' });
    expect(configErrors(config)).toEqual([]);
    expect(config['prefix']).toBeUndefined();
    expect(config['states']).toEqual({ defrost: ['Ontdooien'] });
    expect(config['entities']).toMatchObject({
      source: { fan_speed: 'none' },
      unit: { cop: 'none', on_off: 'switch.wp_30' },
      heating: { setpoint: 'none' },
    });
    expect(configOf(defaultState())['prefix']).toBe('demo_ecogeo');
  });

  test('switch detail: the URL carries detail=full and the card config follows', () => {
    const full = { ...defaultState(), detail: 'full' as const };
    expect(new URLSearchParams(toSearch(full)).get('detail')).toBe('full');
    expect(parseState('?detail=full').detail).toBe('full');
    expect(configOf(full)['detail']).toBe('full');
    expect(configErrors(configOf(full))).toEqual([]);
    expect(new URLSearchParams(toSearch(defaultState())).has('detail')).toBe(false);
  });

  test('the exchanger fill travels in the URL as fill= and reaches the card config', () => {
    const none = { ...defaultState(), fill: 'none' as const };
    expect(new URLSearchParams(toSearch(none)).get('fill')).toBe('none');
    expect(parseState('?fill=none').fill).toBe('none');
    expect(configOf(none)['exchanger_fill']).toBe('none');
    expect(configOf(defaultState())['exchanger_fill']).toBe('gradient');
    expect(configErrors(configOf(none))).toEqual([]);
    expect(new URLSearchParams(toSearch(defaultState())).has('fill')).toBe(false);
  });

  test('the card width and layout travel in the URL as width= and layout= and reach the card config', () => {
    const phone = { ...defaultState(), width: 360, layout: 'full' as const };
    const params = new URLSearchParams(toSearch(phone));
    expect(params.get('width')).toBe('360');
    expect(params.get('layout')).toBe('full');
    expect(parseState('?width=360&layout=full')).toEqual(phone);
    expect(configOf(phone)['layout']).toBe('full');
    expect(configOf(defaultState())['layout']).toBe('auto');
    expect(configErrors(configOf(phone))).toEqual([]);
    const defaults = new URLSearchParams(toSearch(defaultState()));
    expect(defaults.has('width')).toBe(false);
    expect(defaults.has('layout')).toBe(false);
    expect(parseState('?width=50').width).toBe(defaultState().width);
    expect(parseState('?width=340').width).toBe(340);
  });

  test('Phone width: the captures include every scenario at 360 px in auto and in full at the threshold', () => {
    const queries = CAPTURES.map((capture) => capture.query);
    for (const name of SCENARIO_NAMES) {
      expect(queries).toContain(`scenario=${name}&width=360&theme=light`);
      expect(queries).toContain(`scenario=${name}&layout=full&width=${String(COMPACT_BELOW)}&theme=light`);
    }
    const phone = parseState(`?scenario=heating&width=360`);
    expect(phone.width).toBe(360);
    expect(phone.layout).toBe('auto');
  });

  test('the config of a state is valid and carries the explicit features only', () => {
    const state = defaultState();
    expect(configErrors(configOf(state))).toEqual([]);
    const config = configOf({ ...defaultState(), features: { ...defaultState().features, htr: 'unused' } });
    expect(config['features']).toEqual({ htr: 'unused' });
  });
});

describe('capture list', () => {
  test('every step parses, gives a valid config, and has a unique name', () => {
    const names = new Set<string>();
    for (const { name, query } of CAPTURES) {
      expect(names.has(name), name).toBe(false);
      names.add(name);
      expect(configErrors(configOf(parseState(`?${query}`))), name).toEqual([]);
    }
  });

  test('the foreign naming is captured in heating, DHW, defrost and off, and in heating on a phone', () => {
    const foreign = CAPTURES.map(({ query }) => parseState(`?${query}`)).filter((s) => s.naming === 'foreign');
    for (const scenario of ['heating', 'dhw', 'defrost', 'off'] as const)
      expect(
        foreign.some((s) => s.scenario === scenario),
        scenario,
      ).toBe(true);
    expect(foreign.some((s) => s.scenario === 'heating' && s.width === 360)).toBe(true);
  });

  test('each source is captured in light and dark, in heating and in a cold-source mode (passive cooling or defrost)', () => {
    const states = CAPTURES.map(({ query }) => parseState(`?${query}`));
    for (const source of ['air', 'ground', 'hybrid'] as const) {
      for (const theme of ['light', 'dark'] as const) {
        const own = states.filter((state) => state.source === source && state.theme === theme);
        expect(
          own.some((state) => state.scenario === 'heating'),
          `${source} ${theme} heating`,
        ).toBe(true);
        expect(
          own.some((state) => state.scenario === 'passive_cooling' || state.scenario === 'defrost'),
          `${source} ${theme} passive cooling or defrost`,
        ).toBe(true);
      }
    }
  });

  test('it has full-detail captures of heating and of model C', () => {
    const full = CAPTURES.map(({ query }) => parseState(`?${query}`)).filter((s) => s.detail === 'full');
    expect(full.some((s) => s.scenario === 'heating' && s.model === 'B')).toBe(true);
    expect(full.some((s) => s.model === 'C')).toBe(true);
  });

  test('it covers every scenario, each source, each dhw value, model C, each feature false and unused and dark', () => {
    const states = CAPTURES.map(({ query }) => parseState(`?${query}`));
    for (const scenario of SCENARIO_NAMES) expect(states.some((s) => s.scenario === scenario)).toBe(true);
    for (const source of ['air', 'ground', 'hybrid']) expect(states.some((s) => s.source === source)).toBe(true);
    for (const dhw of ['external', 'internal', 'unused', 'none']) expect(states.some((s) => s.dhw === dhw)).toBe(true);
    expect(states.some((s) => s.model === 'C')).toBe(true);
    expect(states.some((s) => s.theme === 'dark')).toBe(true);
    for (const key of ['active_cooling', 'passive_cooling', 'htr', 'backup_heater'] as const) {
      for (const value of ['false', 'unused'])
        expect(
          states.some((s) => s.features[key] === value),
          key,
        ).toBe(true);
    }
  });
});
