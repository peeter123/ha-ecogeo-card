// Adapted from hrv-ventilation test/lib/config.test.ts: valueAt and entityAt (the humidity and stream tests are
// dropped with their helpers).
import { describe, expect, test } from 'vitest';
import { asEntityId, entityAt, valueAt, type CardConfig } from '../../src/lib/config';

const complete: CardConfig = {
  type: 'custom:ecogeo-card',
  production: { outlet_temperature: 'sensor.demo_ecogeo_production_out', pump: 'sensor.demo_ecogeo_production_pump' },
  brine: { inlet_temperature: ' sensor.demo_ecogeo_brine_in ' },
};

describe('valueAt', () => {
  test('reads nested paths', () => {
    expect(valueAt(complete, 'production.pump')).toBe('sensor.demo_ecogeo_production_pump');
    expect(valueAt(complete, 'compressor.speed')).toBeUndefined();
    expect(valueAt(complete, 'type.length')).toBeUndefined();
  });

  test('inherited object members are not config values', () => {
    expect(valueAt({}, 'constructor')).toBeUndefined();
    expect(valueAt({ production: {} }, 'production.toString')).toBeUndefined();
  });
});

describe('entityAt and asEntityId', () => {
  test('an entity ID is trimmed, so what the check accepts is what the card reads', () => {
    expect(entityAt(complete, 'brine.inlet_temperature')).toBe('sensor.demo_ecogeo_brine_in');
  });

  test('only something shaped like an entity ID counts', () => {
    expect(entityAt(complete, 'production.pump')).toBe('sensor.demo_ecogeo_production_pump');
    for (const value of ['', '  ', 'sensor', 'production pump', 'Sensor.Pump', 'sensor.', '.pump', '1.2', null, 42]) {
      expect(entityAt({ production: { pump: value } }, 'production.pump'), String(value)).toBeUndefined();
      expect(asEntityId(value), String(value)).toBeUndefined();
    }
    expect(entityAt({ production: 'sensor.x' }, 'production.pump')).toBeUndefined();
    expect(entityAt({}, 'production.pump')).toBeUndefined();
  });
});
