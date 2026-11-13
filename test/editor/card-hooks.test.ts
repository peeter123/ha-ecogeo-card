import { describe, expect, test } from 'vitest';
import '../../src/index';
import { EcogeoCard } from '../../src/card/ecogeo-card';
import { configErrors } from '../../src/config/options';
import { INDICATIONS } from '../../src/strings';
import { firmwareHass, foreignHass } from './hass-fixtures';

describe('card editor hooks', () => {
  test('card-editor "Editor element": getConfigElement returns an ecogeo-card-editor element', () => {
    const element = EcogeoCard.getConfigElement();
    expect(element.localName).toBe('ecogeo-card-editor');
    expect(element).toBeInstanceOf(customElements.get('ecogeo-card-editor'));
    expect(typeof (element as unknown as { setConfig: unknown }).setConfig).toBe('function');
  });

  test('card-editor "Picker preview": the stub config is valid and renders the sample-value schematic', async () => {
    const stub = EcogeoCard.getStubConfig();
    expect(configErrors({ type: 'custom:ecogeo-card', ...stub })).toEqual([]);
    expect(stub).not.toHaveProperty('prefix');
    expect(stub).not.toHaveProperty('entities');
    const card = document.createElement('ecogeo-card') as EcogeoCard;
    card.setConfig({ type: 'custom:ecogeo-card', ...stub });
    document.body.append(card);
    await card.updateComplete;
    expect(card.shadowRoot?.querySelector('.sample')?.textContent.trim()).toBe(INDICATIONS.sampleValues);
    expect(card.shadowRoot?.querySelector('svg g.cabinet')).not.toBeNull();
    card.remove();
  });

  test('card-editor "One firmware device": the stub sets the prefix of the one device with the firmware names', async () => {
    const hass = firmwareHass('hp_basement');
    const withForeign = { ...hass, states: { ...foreignHass().states, ...hass.states } };
    const stub = EcogeoCard.getStubConfig({
      ...withForeign,
      entities: { ...foreignHass().entities, ...hass.entities },
    });
    expect(stub).toEqual({ prefix: 'hp_basement' });
    expect(configErrors({ type: 'custom:ecogeo-card', ...stub })).toEqual([]);
    const card = document.createElement('ecogeo-card') as EcogeoCard;
    card.hass = hass;
    card.setConfig({ type: 'custom:ecogeo-card', ...stub });
    document.body.append(card);
    await card.updateComplete;
    expect(card.shadowRoot?.querySelector('.sample')).toBeNull();
    card.remove();
  });

  test('card-editor "Firmware device with helpers": helpers with other ids do not hide the prefix', () => {
    const hass = firmwareHass('hp_basement');
    for (const id of ['sensor.heatpump_cop_dhw', 'sensor.heatpump_calculated_flow']) {
      hass.states = { ...hass.states, [id]: { entity_id: id, state: '1', attributes: {} } };
      hass.entities = { ...hass.entities, [id]: { entity_id: id, device_id: 'dev_ecogeo_demo' } };
    }
    expect(EcogeoCard.getStubConfig(hass)).toEqual({ prefix: 'hp_basement' });
  });

  test('card-editor "Two firmware devices": the stub is empty and renders the sample values', () => {
    const first = firmwareHass('hp_basement');
    const second = firmwareHass('hp_attic', 'dev_second');
    const hass = {
      states: { ...first.states, ...second.states },
      entities: { ...first.entities, ...second.entities },
      devices: { ...first.devices, ...second.devices },
    };
    expect(EcogeoCard.getStubConfig(hass)).toEqual({});
  });

  test('a device with fewer than half of the roles, a foreign device and a missing hass give the empty stub', () => {
    const hass = firmwareHass('hp_basement');
    const few = Object.fromEntries(Object.entries(hass.entities ?? {}).slice(0, 10));
    expect(EcogeoCard.getStubConfig({ ...hass, entities: few })).toEqual({});
    expect(EcogeoCard.getStubConfig(foreignHass())).toEqual({});
    expect(EcogeoCard.getStubConfig(undefined)).toEqual({});
    expect(EcogeoCard.getStubConfig({ states: {} })).toEqual({});
  });
});
