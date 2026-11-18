import { describe, expect, test } from 'vitest';
import { circuitsFor as circuitsForRaw, type CircuitId } from '../../src/calc/circuits';
import type { Mode } from '../../src/calc/mode';
import { variantFeatures } from '../../src/config/variants';
import { readings } from '../helpers';

/** The role has an entity and the brine pump is present, unless a test says otherwise (the card passes both explicitly). */
const circuitsFor = (
  mode: Parameters<typeof circuitsForRaw>[0],
  features: Parameters<typeof circuitsForRaw>[1],
  dhw: Parameters<typeof circuitsForRaw>[2],
  r: Parameters<typeof circuitsForRaw>[3],
  brinePumpPresent = true,
  htrActivePresent = true,
) => circuitsForRaw(mode, features, dhw, r, brinePumpPresent, htrActivePresent);

const v4 = variantFeatures(4);
const running = readings({ 'brine.pump': 100, 'heating.capacity': 4712 });
const active = (set: ReadonlySet<CircuitId>): CircuitId[] => [...set].sort();

describe('valve positions follow the mode', () => {
  test('valve 26 points to the DHW ports in dhw only', () => {
    const modes: Mode[] = ['off', 'defrost', 'dhw', 'active_cooling', 'heating', 'passive_cooling', 'standby'];
    for (const mode of modes) {
      expect(circuitsFor(mode, v4, 'external', running).valve26).toBe(mode === 'dhw' ? 'dhw' : 'production');
    }
  });

  test('valve 14 is reversed in active cooling only', () => {
    expect(circuitsFor('active_cooling', v4, 'external', running).valve14).toBe('reversed');
    expect(circuitsFor('heating', v4, 'external', running).valve14).toBe('normal');
    expect(circuitsFor('defrost', v4, 'external', running).valve14).toBe('normal');
  });

  test('valves 27/28 route through exchanger 10 in passive cooling and defrost only', () => {
    expect(circuitsFor('passive_cooling', v4, 'external', running).valves2728).toBe('exchanger');
    expect(circuitsFor('defrost', v4, 'external', running).valves2728).toBe('exchanger');
    expect(circuitsFor('heating', v4, 'external', running).valves2728).toBe('closed');
    expect(circuitsFor('active_cooling', v4, 'external', running).valves2728).toBe('closed');
  });

  test('defrost: valves 27/28 to exchanger 10, valve 14 normal, valve 26 to ports 1/2', () => {
    const c = circuitsFor('defrost', v4, 'external', running);
    expect([c.valves2728, c.valve14, c.valve26]).toEqual(['exchanger', 'normal', 'production']);
  });
});

describe('active circuits follow the mode', () => {
  test('heating: refrigerant, brine and DG1; no DHW loop', () => {
    expect(active(circuitsFor('heating', v4, 'external', running).active)).toEqual([
      'brine',
      'production_dg1',
      'refrigerant',
    ]);
  });

  test('dhw: refrigerant, brine, production to 5/6 and the coil', () => {
    expect(active(circuitsFor('dhw', v4, 'external', running).active)).toEqual([
      'brine',
      'dhw_coil',
      'production_dhw',
      'refrigerant',
    ]);
  });

  test('dhw without DHW storage has no DHW loop', () => {
    expect(active(circuitsFor('dhw', v4, 'none', running).active)).toEqual(['brine', 'refrigerant']);
  });

  // operating-mode "DHW mode with an unused tank"
  test('dhw with an unused tank: no circuit to ports 5/6 and no DHW coil, valve 26 still follows the mode', () => {
    const c = circuitsFor('dhw', v4, 'unused', running);
    expect(active(c.active)).toEqual(['brine', 'refrigerant']);
    expect(c.valve26).toBe('dhw');
  });

  test('active cooling: reversed refrigerant, brine and DG1', () => {
    const c = circuitsFor('active_cooling', v4, 'external', readings({ 'brine.pump': 100, 'heating.capacity': 0 }));
    expect(active(c.active)).toEqual(['brine', 'production_dg1', 'refrigerant']);
  });

  test('passive cooling and defrost: brine, DG1 and exchanger 10; refrigerant muted', () => {
    for (const mode of ['passive_cooling', 'defrost'] as const) {
      expect(active(circuitsFor(mode, v4, 'external', running).active)).toEqual([
        'brine',
        'exchanger_10',
        'production_dg1',
      ]);
    }
  });

  test('off and standby: no circuit active', () => {
    expect(circuitsFor('off', v4, 'external', running).active.size).toBe(0);
    expect(circuitsFor('standby', v4, 'external', running).active.size).toBe(0);
  });
});

describe('circuits limited by pumps and feature states', () => {
  test('brine pump stopped: the brine circuit is muted, refrigerant and production stay active', () => {
    const c = circuitsFor('active_cooling', v4, 'external', readings({ 'brine.pump': 0, 'heating.capacity': 0 }));
    expect(active(c.active)).toEqual(['production_dg1', 'refrigerant']);
  });

  test('Brine pump not present: the brine circuit is not limited by the pump', () => {
    const none = readings({ 'heating.capacity': 4712 });
    expect(circuitsFor('heating', v4, 'external', none, false).active.has('brine')).toBe(true);
    expect(circuitsFor('heating', v4, 'external', none, true).active.has('brine')).toBe(false);
    expect(circuitsFor('standby', v4, 'external', none, false).active.has('brine')).toBe(false);
  });

  test('brine pump without a value is not running', () => {
    expect(circuitsFor('heating', v4, 'external', readings()).active.has('brine')).toBe(false);
  });

  test('defrost with passive cooling unused: exchanger 10, valves 27/28, brine and production active; refrigerant muted', () => {
    const c = circuitsFor('defrost', { ...v4, passive_cooling: 'unused' }, 'external', running);
    expect(active(c.active)).toEqual(['brine', 'exchanger_10', 'production_dg1']);
    expect(c.valves2728).toBe('exchanger');
    expect(c.active.has('refrigerant')).toBe(false);
  });

  test('defrost without exchanger 10 (passive cooling false): no exchanger circuit', () => {
    const c = circuitsFor('defrost', { ...v4, passive_cooling: false }, 'external', running);
    expect(active(c.active)).toEqual(['brine', 'production_dg1']);
    expect(c.valves2728).toBe('closed');
  });
});

// operating-mode "HTR recovery": the fallback rule, for a `htr.active` role without an entity
describe('HTR recovery without the HTR state (fallback)', () => {
  const brineOn = (capacity: number | undefined, pump = 100) =>
    readings({ 'brine.pump': pump, 'heating.capacity': capacity });
  const fallback = (
    mode: Mode,
    r: ReturnType<typeof brineOn>,
    features: Parameters<typeof circuitsFor>[1] = v4,
    dhw: Parameters<typeof circuitsFor>[2] = 'external',
  ) => circuitsFor(mode, features, dhw, r, true, false);

  test('heat partly into the tank: htr, coil and brine active, valve 26 to ports 1/2', () => {
    const c = fallback('active_cooling', brineOn(1200));
    expect(c.active.has('htr') && c.active.has('dhw_coil') && c.active.has('brine')).toBe(true);
    expect(c.valve26).toBe('production');
  });

  test('all heat into the tank: htr and coil active, brine muted', () => {
    const c = fallback('active_cooling', brineOn(3000, 0));
    expect(c.active.has('htr') && c.active.has('dhw_coil')).toBe(true);
    expect(c.active.has('brine')).toBe(false);
  });

  test('condensation capacity 0 W or unknown: no htr', () => {
    expect(fallback('active_cooling', brineOn(0)).active.has('htr')).toBe(false);
    expect(fallback('active_cooling', brineOn(undefined)).active.has('htr')).toBe(false);
  });

  test('no HTR while heating without the state, whatever the capacity', () => {
    const c = fallback('heating', brineOn(4712));
    expect(c.active.has('htr') || c.active.has('dhw_coil')).toBe(false);
  });

  test('the HTR state is not read in the fallback', () => {
    const c = circuitsFor(
      'active_cooling',
      v4,
      'external',
      readings({ 'brine.pump': 100, 'heating.capacity': 1200, 'htr.active': false }),
      true,
      false,
    );
    expect(c.active.has('htr')).toBe(true);
  });

  test('htr unused or false, or no DHW storage: no htr', () => {
    expect(fallback('active_cooling', brineOn(1200), { ...v4, htr: 'unused' }).active.has('htr')).toBe(false);
    expect(fallback('active_cooling', brineOn(1200), { ...v4, htr: false }).active.has('htr')).toBe(false);
    expect(fallback('active_cooling', brineOn(1200), v4, 'none').active.has('htr')).toBe(false);
  });

  test('an unused tank: no htr circuit and no DHW coil', () => {
    const c = fallback('active_cooling', brineOn(1200), v4, 'unused');
    expect(c.active.has('htr') || c.active.has('dhw_coil')).toBe(false);
    expect(c.valve26).toBe('production');
    expect(fallback('active_cooling', brineOn(3000, 0), v4, 'unused').active.has('htr')).toBe(false);
  });
});

describe('HTR recovery follows the HTR state', () => {
  const state = (htr: boolean | undefined, capacity = 4712) =>
    readings({ 'brine.pump': 100, 'heating.capacity': capacity, 'htr.active': htr });

  test('HTR while heating: htr, coil and DG1 active, valve 26 to ports 1/2', () => {
    for (const dhw of ['external', 'internal'] as const) {
      const c = circuitsFor('heating', v4, dhw, state(true));
      expect(active(c.active)).toEqual(['brine', 'dhw_coil', 'htr', 'production_dg1', 'refrigerant']);
      expect(c.valve26).toBe('production');
    }
  });

  test('HTR idle while heating: off, unknown (unavailable) leave htr and the coil out', () => {
    for (const htr of [false, undefined]) {
      expect(active(circuitsFor('heating', v4, 'external', state(htr)).active)).toEqual([
        'brine',
        'production_dg1',
        'refrigerant',
      ]);
    }
  });

  test('the HTR state decides in active cooling: off with 1200 W gives no htr, on gives htr and coil', () => {
    const off = circuitsFor('active_cooling', v4, 'external', state(false, 1200));
    expect(off.active.has('htr') || off.active.has('dhw_coil')).toBe(false);
    const on = circuitsFor('active_cooling', v4, 'external', state(true, 0));
    expect(on.active.has('htr') && on.active.has('dhw_coil')).toBe(true);
    expect(on.valve26).toBe('production');
  });

  test('the HTR state is ignored in dhw, passive cooling, defrost, off and standby', () => {
    const dhw = circuitsFor('dhw', v4, 'external', state(true));
    expect(dhw.active.has('htr')).toBe(false);
    expect(active(dhw.active)).toEqual(['brine', 'dhw_coil', 'production_dhw', 'refrigerant']);
    for (const mode of ['passive_cooling', 'defrost', 'standby', 'off'] as const) {
      expect(circuitsFor(mode, v4, 'external', state(true)).active.has('htr'), mode).toBe(false);
    }
  });

  test('HTR idle with an unused tank, or with htr unused, false or no tank, while on', () => {
    const unused = circuitsFor('heating', v4, 'unused', state(true));
    expect(unused.active.has('htr') || unused.active.has('dhw_coil')).toBe(false);
    expect(circuitsFor('heating', v4, 'none', state(true)).active.has('htr')).toBe(false);
    expect(circuitsFor('heating', { ...v4, htr: 'unused' }, 'external', state(true)).active.has('htr')).toBe(false);
    expect(circuitsFor('heating', { ...v4, htr: false }, 'external', state(true)).active.has('htr')).toBe(false);
  });
});
