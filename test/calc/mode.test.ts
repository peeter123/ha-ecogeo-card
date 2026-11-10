import { describe, expect, test } from 'vitest';
import { deriveMode, isAlarm, isOffline, MODES } from '../../src/calc/mode';
import type { Features } from '../../src/config/variants';
import { variantFeatures } from '../../src/config/variants';
import { readings, state } from '../helpers';

const v4 = variantFeatures(4);
const winterRun = { 'compressor.speed': 2803, 'unit.winter': true, 'unit.summer': false, 'unit.on_off': 'ON' };

describe('one derived mode', () => {
  test('the mode set is the spec order', () => {
    expect(MODES).toEqual(['off', 'defrost', 'dhw', 'active_cooling', 'heating', 'passive_cooling', 'standby']);
  });

  test('off wins over a running compressor', () => {
    expect(deriveMode(readings({ 'unit.on_off': 'OFF', 'compressor.speed': 1500 }), v4)).toBe('off');
  });

  test('off wins over defrost', () => {
    expect(deriveMode(readings({ 'unit.on_off': 'OFF', 'compressor.mode': 'Defrost' }), v4)).toBe('off');
  });
});

describe('off mode', () => {
  test('off is case-insensitive', () => {
    expect(deriveMode(readings({ 'unit.on_off': 'off' }), v4)).toBe('off');
    expect(deriveMode(readings({ 'unit.on_off': 'Off' }), v4)).toBe('off');
  });

  test('emergency is not off', () => {
    const mode = deriveMode(readings({ ...winterRun, 'unit.on_off': 'EMERGENCY', 'heating.demand': true }), v4);
    expect(mode).toBe('heating');
  });

  test.each(['ON', 'Unavailable', 'Unknown'])('%s is not off', (text) => {
    expect(deriveMode(readings({ ...winterRun, 'unit.on_off': text }), v4)).toBe('heating');
  });
});

describe('defrost mode', () => {
  test('defrost at 0 rpm with DG1 demand', () => {
    const mode = deriveMode(
      readings({ 'compressor.mode': 'Defrost', 'compressor.speed': 0, 'heating.demand': true }),
      v4,
    );
    expect(mode).toBe('defrost');
  });

  test('defrost is case-insensitive and wins over dhw demand', () => {
    expect(deriveMode(readings({ ...winterRun, 'compressor.mode': 'DEFROST', 'dhw.demand': true }), v4)).toBe(
      'defrost',
    );
  });

  test('defrost with an unknown compressor speed', () => {
    expect(deriveMode(readings({ 'compressor.mode': 'Defrost' }), v4)).toBe('defrost');
  });

  test('defrost without exchanger 10 (passive cooling false) is still defrost', () => {
    expect(deriveMode(readings({ 'compressor.mode': 'Defrost' }), { ...v4, passive_cooling: false })).toBe('defrost');
  });

  test('Balance is not defrost', () => {
    expect(deriveMode(readings({ ...winterRun, 'compressor.mode': 'Balance' }), v4)).toBe('heating');
  });

  test.each(['None', 'Time-Out', 'Cycle Inversion', 'whatever'])('%s is not defrost', (text) => {
    expect(deriveMode(readings({ ...winterRun, 'compressor.mode': text }), v4)).toBe('heating');
  });
});

describe('modes while the compressor runs', () => {
  test('heating', () => {
    expect(deriveMode(readings({ ...winterRun, 'dhw.demand': false }), v4)).toBe('heating');
  });

  test('dhw wins over heating demand', () => {
    expect(deriveMode(readings({ ...winterRun, 'dhw.demand': true, 'heating.demand': true }), v4)).toBe('dhw');
  });

  test('active cooling: summer, no dhw demand, feature true', () => {
    const inputs = readings({ 'compressor.speed': 2000, 'unit.summer': true, 'dhw.demand': false });
    expect(deriveMode(inputs, v4)).toBe('active_cooling');
  });

  test('summer with active cooling false, unused or in a variant without it is heating', () => {
    const inputs = readings({ 'compressor.speed': 2000, 'unit.summer': true });
    expect(deriveMode(inputs, { ...v4, active_cooling: false })).toBe('heating');
    expect(deriveMode(inputs, { ...v4, active_cooling: 'unused' })).toBe('heating');
    expect(deriveMode(inputs, variantFeatures(2))).toBe('heating');
  });

  test('dhw wins over active cooling', () => {
    const inputs = readings({ 'compressor.speed': 2000, 'unit.summer': true, 'dhw.demand': true });
    expect(deriveMode(inputs, v4)).toBe('dhw');
  });
});

describe('modes while the compressor is stopped', () => {
  const stopped = { 'compressor.speed': 0, 'unit.summer': true, 'production.pump': 60 };

  test('passive cooling', () => {
    expect(deriveMode(readings(stopped), v4)).toBe('passive_cooling');
  });

  test('passive cooling unused is standby', () => {
    expect(deriveMode(readings(stopped), { ...v4, passive_cooling: 'unused' })).toBe('standby');
  });

  test('passive cooling false is standby', () => {
    expect(deriveMode(readings(stopped), { ...v4, passive_cooling: false })).toBe('standby');
  });

  test('a stopped production pump, or winter, is standby', () => {
    expect(deriveMode(readings({ ...stopped, 'production.pump': 0 }), v4)).toBe('standby');
    expect(deriveMode(readings({ ...stopped, 'production.pump': undefined }), v4)).toBe('standby');
    expect(deriveMode(readings({ ...stopped, 'unit.summer': false }), v4)).toBe('standby');
  });
});

describe('missing inputs fall back safely', () => {
  test('compressor speed unavailable with dhw demand is standby', () => {
    expect(deriveMode(readings({ 'dhw.demand': true, 'unit.summer': true, 'production.pump': 60 }), v4)).toBe(
      'standby',
    );
  });

  test('every input unavailable is standby', () => {
    expect(deriveMode(readings(), v4)).toBe('standby');
  });
});

describe('offline indication', () => {
  test.each(['off', 'unavailable', 'unknown', 'OFF'])('connection %s is offline', (value) => {
    expect(isOffline(state('binary_sensor.x', value))).toBe(true);
  });

  test('connection on shows no indication', () => {
    expect(isOffline(state('binary_sensor.x', 'on'))).toBe(false);
  });

  test('without a connection entity there is no indication', () => {
    expect(isOffline(undefined)).toBe(false);
  });

  test('bridge offline with every other entity unavailable: the mode is standby', () => {
    const connection = state('binary_sensor.x', 'off');
    expect(isOffline(connection)).toBe(true);
    expect(deriveMode(readings(), v4)).toBe('standby');
  });
});

describe('alarm overlay', () => {
  test('the alarm does not change the mode', () => {
    const base = { ...winterRun };
    expect(deriveMode(readings({ ...base, 'unit.alarm': true }), v4)).toBe('heating');
    expect(deriveMode(readings({ ...base, 'unit.alarm': true }), v4)).toBe(deriveMode(readings(base), v4));
    expect(isAlarm(true)).toBe(true);
    expect(isAlarm(false)).toBe(false);
    expect(isAlarm(undefined)).toBe(false);
  });

  test('mode inputs are limited to the documented roles', () => {
    // flipping any other reading leaves the mode alone
    const features: Features = v4;
    const base = readings(winterRun);
    const other = readings({ ...winterRun, 'unit.connection': false, 'heating.demand': true, 'brine.pump': 0 });
    expect(deriveMode(other, features)).toBe(deriveMode(base, features));
  });
});
