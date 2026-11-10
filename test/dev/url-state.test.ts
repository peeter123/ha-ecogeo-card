import { describe, expect, test } from 'vitest';
import { CAPTURES } from '../../dev/captures';
import { SCENARIO_NAMES } from '../../dev/scenarios';
import { configOf, defaultState, parseState, toSearch } from '../../dev/url-state';
import { configErrors } from '../../src/config/options';

describe('emulator URL state', () => {
  test('an empty query is the default state', () => {
    expect(parseState('')).toEqual(defaultState());
  });

  test('a state survives the round trip through its query string', () => {
    const state = {
      ...defaultState(),
      scenario: 'passive_cooling' as const,
      model: 'C' as const,
      variant: 2 as const,
      source: 'hybrid' as const,
      dhw: 'none' as const,
      theme: 'dark' as const,
      cycle: 5,
      features: { active_cooling: 'false', passive_cooling: 'unused', htr: 'true', backup_heater: 'default' } as const,
    };
    expect(parseState(toSearch(state))).toEqual(state);
  });

  test('invalid values keep their defaults', () => {
    expect(parseState('?scenario=x&model=Z&variant=9&source=sun&theme=blue&htr=maybe')).toEqual(defaultState());
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

  test('it covers every scenario, each source, each dhw value, model C, each feature false and unused and dark', () => {
    const states = CAPTURES.map(({ query }) => parseState(`?${query}`));
    for (const scenario of SCENARIO_NAMES) expect(states.some((s) => s.scenario === scenario)).toBe(true);
    for (const source of ['air', 'ground', 'hybrid']) expect(states.some((s) => s.source === source)).toBe(true);
    for (const dhw of ['external', 'internal', 'none']) expect(states.some((s) => s.dhw === dhw)).toBe(true);
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
