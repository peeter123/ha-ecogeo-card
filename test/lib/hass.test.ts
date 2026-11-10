// Adapted from hrv-ventilation test/lib/hass.test.ts: stateOf only, plus the more-info event.
import { describe, expect, test } from 'vitest';
import { fireMoreInfo, stateOf, type HassEntityState } from '../../src/lib/hass';

const STATE: HassEntityState = { entity_id: 'sensor.demo_t', state: '21.4', attributes: { unit_of_measurement: '°C' } };

describe('stateOf', () => {
  test('gives the state object of a known entity', () => {
    expect(stateOf({ 'sensor.demo_t': STATE }, 'sensor.demo_t')).toBe(STATE);
  });

  test('gives undefined without an id or for an unknown entity', () => {
    expect(stateOf({ 'sensor.demo_t': STATE }, undefined)).toBeUndefined();
    expect(stateOf({ 'sensor.demo_t': STATE }, 'sensor.demo_missing')).toBeUndefined();
  });
});

describe('fireMoreInfo', () => {
  test('dispatches a bubbling, composed hass-more-info event with the entity id', () => {
    const target = new EventTarget();
    const seen: CustomEvent<{ entityId: string }>[] = [];
    target.addEventListener('hass-more-info', (event) => seen.push(event as CustomEvent<{ entityId: string }>));
    fireMoreInfo(target, 'sensor.demo_t');
    expect(seen).toHaveLength(1);
    expect(seen[0]?.detail.entityId).toBe('sensor.demo_t');
    expect(seen[0]?.bubbles).toBe(true);
    expect(seen[0]?.composed).toBe(true);
  });
});
