import { describe, expect, test } from 'vitest';
import { circuitsFor, type CircuitId } from '../../src/calc/circuits';
import type { Mode } from '../../src/calc/mode';
import { variantFeatures } from '../../src/config/variants';
import { readings } from '../helpers';

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

describe('HTR recovery in active cooling', () => {
  const brineOn = (capacity: number | undefined, pump = 100) =>
    readings({ 'brine.pump': pump, 'heating.capacity': capacity });

  test('heat partly into the tank: htr, coil and brine active, valve 26 to ports 1/2', () => {
    const c = circuitsFor('active_cooling', v4, 'external', brineOn(1200));
    expect(c.active.has('htr') && c.active.has('dhw_coil') && c.active.has('brine')).toBe(true);
    expect(c.valve26).toBe('production');
  });

  test('all heat into the tank: htr and coil active, brine muted', () => {
    const c = circuitsFor('active_cooling', v4, 'external', brineOn(3000, 0));
    expect(c.active.has('htr') && c.active.has('dhw_coil')).toBe(true);
    expect(c.active.has('brine')).toBe(false);
  });

  test('condensation capacity 0 W or unknown: no htr', () => {
    expect(circuitsFor('active_cooling', v4, 'external', brineOn(0)).active.has('htr')).toBe(false);
    expect(circuitsFor('active_cooling', v4, 'external', brineOn(undefined)).active.has('htr')).toBe(false);
  });

  test('htr unused or false, or no DHW storage: no htr', () => {
    expect(circuitsFor('active_cooling', { ...v4, htr: 'unused' }, 'external', brineOn(1200)).active.has('htr')).toBe(
      false,
    );
    expect(circuitsFor('active_cooling', { ...v4, htr: false }, 'external', brineOn(1200)).active.has('htr')).toBe(
      false,
    );
    expect(circuitsFor('active_cooling', v4, 'none', brineOn(1200)).active.has('htr')).toBe(false);
  });

  test('HTR idle while heating, in dhw and in the other modes', () => {
    for (const mode of ['heating', 'dhw', 'passive_cooling', 'defrost', 'standby', 'off'] as const) {
      expect(circuitsFor(mode, v4, 'external', brineOn(4712)).active.has('htr'), mode).toBe(false);
    }
  });
});
