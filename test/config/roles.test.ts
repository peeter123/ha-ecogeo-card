import { describe, expect, test } from 'vitest';
import { DISPLAY_UNITS, OPTIONAL_ROLE_PATHS, ROLES, defaultEntityId, isRolePath } from '../../src/config/roles';

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

  test('add-htr-state: the five optional roles, and only they, are optional', () => {
    const optional = ROLES.filter((r) => 'optional' in r).map((r) => [r.path, r.domain, r.suffix, r.item]);
    expect(optional.sort()).toEqual(
      [
        ['htr.active', 'binary_sensor', 'htr_active', '9'],
        ['htr.power', 'sensor', 'heating_power_htr', '9'],
        ['heating.power', 'sensor', 'heating_power_dg1', '1/2'],
        ['dhw.power', 'sensor', 'heating_power_dhw', '26'],
        ['unit.system_cop', 'sensor', 'system_cop_display', 'footer'],
      ].sort(),
    );
    expect([...OPTIONAL_ROLE_PATHS].sort()).toEqual(optional.map((r) => r[0]).sort());
    for (const path of ['htr.power', 'heating.power', 'dhw.power']) {
      expect(ROLES.find((r) => r.path === path)).toMatchObject({ unit: 'W', decimals: 0 });
    }
    expect(ROLES.find((r) => r.path === 'unit.system_cop')).toMatchObject({ decimals: 1 });
  });
});
