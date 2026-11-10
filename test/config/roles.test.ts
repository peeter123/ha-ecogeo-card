import { describe, expect, test } from 'vitest';
import { DISPLAY_UNITS, ROLES, defaultEntityId, isRolePath } from '../../src/config/roles';

describe('role table', () => {
  test('paths and entity suffixes are unique, paths are group.name', () => {
    expect(new Set(ROLES.map((r) => r.path)).size).toBe(ROLES.length);
    expect(new Set(ROLES.map((r) => `${r.domain}.${r.suffix}`)).size).toBe(ROLES.length);
    for (const role of ROLES) expect(role.path).toMatch(/^[a-z]+\.[a-z_]+$/);
  });

  test('display units are the card units', () => {
    expect([...DISPLAY_UNITS].sort()).toEqual(['%', 'K', 'W', 'bar', 'rpm', '°C'].sort());
  });

  test('differences show in K, and every role with a unit has decimals', () => {
    for (const role of ROLES) {
      if ('quantity' in role && role.quantity === 'difference') expect(role.unit).toBe('K');
      if ('unit' in role) expect(role).toHaveProperty('decimals');
    }
  });

  test('default entity id and role path check', () => {
    const outlet = ROLES.find((r) => r.path === 'production.outlet_temperature');
    expect(outlet && defaultEntityId(outlet, 'demo_ecogeo')).toBe('sensor.demo_ecogeo_production_out');
    expect(isRolePath('dhw.temperature')).toBe(true);
    expect(isRolePath('production.flow')).toBe(false);
  });
});
