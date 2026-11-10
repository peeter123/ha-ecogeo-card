import { render, svg } from 'lit';
import { describe, expect, test } from 'vitest';
import type { ComponentKind } from '../../src/diagram/geometry';
import { symbol } from '../../src/diagram/symbols';

const KINDS: readonly ComponentKind[] = [
  'port',
  'pump',
  'valve3',
  'inversion_valve',
  'probe_t',
  'transducer_p',
  'pressure_switch',
  'thermostat',
  'exchanger',
  'compressor',
  'vessel',
  'safety_valve',
  'valve',
  'drain_valve',
  'resistor',
  'filter_dryer',
  'expansion_valve',
  'service_outlet',
  'coil_slot',
];

function mount(kind: ComponentKind, rotation: 0 | 90 | 180 | 270 = 0): SVGElement {
  const host = document.createElement('div');
  render(svg`<svg>${symbol(kind, { rotation })}</svg>`, host);
  const group = host.querySelector('svg > g');
  if (group === null) throw new Error('no group');
  return group as unknown as SVGElement;
}

describe('symbols', () => {
  test.each(KINDS)('%s renders an svg group', (kind) => {
    const group = mount(kind);
    expect(group.tagName.toLowerCase()).toBe('g');
    expect(group.classList.contains(kind)).toBe(true);
  });

  test.each(KINDS.filter((kind) => kind !== 'coil_slot'))('%s draws something that follows the text colour', (kind) => {
    const group = mount(kind);
    expect(group.children.length).toBeGreaterThan(0);
    expect(group.getAttribute('stroke')).toBe('currentColor');
  });

  test('a probe keeps its letter upright when turned', () => {
    const group = mount('probe_t', 90);
    expect(group.getAttribute('transform')).toBe('rotate(90)');
    expect(group.querySelector('text')?.getAttribute('transform')).toBe('rotate(-90)');
  });

  test('a three-way valve fills the arms that are open', () => {
    const host = document.createElement('div');
    render(svg`<svg>${symbol('valve3', { open: ['l', 'd'] })}</svg>`, host);
    const fills = [...host.querySelectorAll('g > path[fill]')].map((path) => path.getAttribute('fill'));
    expect(fills.slice(0, 3)).toEqual(['currentColor', 'none', 'currentColor']);
  });
});
