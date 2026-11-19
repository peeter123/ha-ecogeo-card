import { describe, expect, test } from 'vitest';
import { CAPTURES } from '../../dev/captures';
import { SCENARIO_NAMES } from '../../dev/scenarios';
import { configOf, defaultState, dhwForModel, parseState, toSearch } from '../../dev/url-state';
import { configErrors } from '../../src/config/options';
import { VERTICAL_BELOW } from '../../src/lib/layout';

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
      fill: 'none' as const,
      layout: 'vertical' as const,
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
        '?scenario=x&naming=klingon&model=Z&variant=9&source=sun&theme=blue&htr=maybe&fill=solid&layout=portrait&width=abc',
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
      unit: { cop: 'sensor.wp_35', on_off: 'switch.wp_30' },
      heating: { setpoint: 'none' },
    });
    expect(configOf(defaultState())['prefix']).toBe('demo_ecogeo');
  });

  test('an old detail= in a URL is ignored: no state, no URL parameter and no config option', () => {
    expect(parseState('?detail=full')).toEqual(defaultState());
    expect(parseState('?scenario=dhw&detail=full&layout=horizontal')).toEqual(
      parseState('?scenario=dhw&layout=horizontal'),
    );
    expect(toSearch(parseState('?detail=full'))).not.toContain('detail');
    expect(configOf(parseState('?detail=full'))).not.toHaveProperty('detail');
    expect(configErrors(configOf(parseState('?detail=full')))).toEqual([]);
  });

  test('the old layout values full and compact in a URL keep the default', () => {
    expect(parseState('?layout=full').layout).toBe('auto');
    expect(parseState('?layout=compact').layout).toBe('auto');
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
    const phone = { ...defaultState(), width: 360, layout: 'horizontal' as const };
    const params = new URLSearchParams(toSearch(phone));
    expect(params.get('width')).toBe('360');
    expect(params.get('layout')).toBe('horizontal');
    expect(parseState('?width=360&layout=horizontal')).toEqual(phone);
    expect(configOf(phone)['layout']).toBe('horizontal');
    expect(configOf(defaultState())['layout']).toBe('auto');
    expect(configErrors(configOf(phone))).toEqual([]);
    const defaults = new URLSearchParams(toSearch(defaultState()));
    expect(defaults.has('width')).toBe(false);
    expect(defaults.has('layout')).toBe(false);
    expect(parseState('?width=50').width).toBe(defaultState().width);
    expect(parseState('?width=340').width).toBe(340);
  });

  test('Threshold width: the captures include every scenario in the horizontal layout at the threshold, light and dark', () => {
    const queries = CAPTURES.map((capture) => capture.query);
    for (const name of SCENARIO_NAMES) {
      for (const theme of ['light', 'dark'])
        expect(queries).toContain(`scenario=${name}&layout=horizontal&width=${String(VERTICAL_BELOW)}&theme=${theme}`);
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

  test('the foreign naming is captured in heating, DHW, defrost and off', () => {
    const foreign = CAPTURES.map(({ query }) => parseState(`?${query}`)).filter((s) => s.naming === 'foreign');
    for (const scenario of ['heating', 'dhw', 'defrost', 'off'] as const)
      expect(
        foreign.some((s) => s.scenario === scenario),
        scenario,
      ).toBe(true);
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

  test('it has no full-detail and no compact capture, and captures the horizontal layout at the threshold, 800 and 1000 px', () => {
    const queries = CAPTURES.map(({ query }) => query);
    expect(queries.filter((query) => /detail=|layout=(full|compact)/.test(query))).toEqual([]);
    const horizontal = CAPTURES.map(({ query }) => parseState(`?${query}`)).filter((s) => s.layout === 'horizontal');
    for (const width of [VERTICAL_BELOW, 800, 1000])
      expect(
        horizontal.some((s) => s.width === width),
        String(width),
      ).toBe(true);
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

describe('panel', () => {
  test('panel=1 shows the card as in a panel view; it is off by default and for any other value', () => {
    expect(defaultState().panel).toBe(false);
    expect(parseState('?panel=1').panel).toBe(true);
    expect(parseState('?panel=0').panel).toBe(false);
    expect(parseState('?panel=yes').panel).toBe(false);
  });

  test('it travels in the URL only when on, and round-trips', () => {
    expect(new URLSearchParams(toSearch(defaultState())).has('panel')).toBe(false);
    const panel = { ...defaultState(), panel: true };
    expect(new URLSearchParams(toSearch(panel)).get('panel')).toBe('1');
    expect(parseState(toSearch(panel))).toEqual(panel);
  });

  test('Panel view: the captures include the heating scenario in a 1280 x 800 window', () => {
    const capture = CAPTURES.find((c) => c.query.includes('panel=1'));
    expect(capture?.viewport).toEqual({ width: 1280, height: 800 });
    expect(parseState(`?${capture?.query ?? ''}`).scenario).toBe('heating');
  });
});
