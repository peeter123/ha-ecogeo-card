// DOM-level tests of the wiring between the card, the cabinet, the source and the pure pipe state: each of these
// breaks when the card stops passing the mode, the circuits or the colour stops to the drawing.
import { describe, expect, test } from 'vitest';
import '../../src/index';
import type { EcogeoCard } from '../../src/card/ecogeo-card';
import { SAMPLE_STATES, sampleEntityId } from '../../src/config/sample';
import { ROLE_BY_PATH, ROLE_PATHS, defaultEntityId, type RolePath } from '../../src/config/roles';
import { DEFAULT_STOPS, temperatureColor } from '../../src/diagram/colors';
import type { CardConfig } from '../../src/lib/config';
import type { HassEntityState, HassLike } from '../../src/lib/hass';

const P = 'demo_ecogeo';

/** The heating snapshot under the demo prefix, with overrides by role. */
function hassOf(overrides: Partial<Record<RolePath, string>> = {}): HassLike {
  const states = Object.fromEntries(
    ROLE_PATHS.map((role): [string, HassEntityState] => {
      const spec = ROLE_BY_PATH.get(role);
      if (spec === undefined) throw new Error(role);
      const sample = SAMPLE_STATES[sampleEntityId(role)];
      const entityId = defaultEntityId(spec, P);
      return [
        entityId,
        { entity_id: entityId, state: overrides[role] ?? sample?.state ?? '', attributes: sample?.attributes ?? {} },
      ];
    }),
  );
  return { states, locale: { language: 'en' } };
}

async function mount(config: CardConfig, hass: HassLike): Promise<EcogeoCard> {
  const card = document.createElement('ecogeo-card') as EcogeoCard;
  card.setConfig({ type: 'custom:ecogeo-card', prefix: P, ...config });
  card.hass = hass;
  document.body.append(card);
  await card.updateComplete;
  return card;
}

const root = (card: EcogeoCard): ShadowRoot => {
  if (card.shadowRoot === null) throw new Error('no shadow root');
  return card.shadowRoot;
};
const group = (card: EcogeoCard, item: number): Element | null =>
  root(card).querySelector(`[data-item="${String(item)}"]`);
const color = (temperature: number): string => temperatureColor(temperature, DEFAULT_STOPS);

const DEFROST = { 'compressor.mode': 'Defrost', 'compressor.speed': '0', 'compressor.percentage': '0' } as const;
const STANDBY = { 'compressor.speed': '0', 'compressor.percentage': '0' } as const;
const COOLING = { 'unit.summer': 'on', 'unit.winter': 'off' } as const;

describe('cabinet wiring', () => {
  test('defrost un-mutes exchanger 10 and valves 27/28 when passive cooling is unused; heating keeps them muted', async () => {
    const config = { features: { passive_cooling: 'unused' } } as const;
    const defrost = await mount(config, hassOf(DEFROST));
    for (const item of [10, 27, 28]) {
      expect(group(defrost, item)?.classList.contains('muted'), `defrost ${String(item)}`).toBe(false);
    }
    defrost.remove();
    const heating = await mount(config, hassOf());
    for (const item of [10, 27, 28]) {
      expect(group(heating, item)?.classList.contains('muted'), `heating ${String(item)}`).toBe(true);
    }
    heating.remove();
  });

  test('heating: an active pipe has a flow overlay with its dash period; defrost has none on the refrigerant', async () => {
    const heating = await mount({}, hassOf());
    const overlay = root(heating).querySelector('[data-flow="ln3"]');
    // brine pump at 100 %: 1.2 s
    expect(overlay?.getAttribute('style')).toContain('--flow-duration: 1.2s');
    expect(overlay?.classList.contains('reversed')).toBe(false);
    expect(root(heating).querySelector('[data-flow="ref_discharge"]')).not.toBeNull();
    heating.remove();
    const defrost = await mount({}, hassOf(DEFROST));
    expect(root(defrost).querySelectorAll('[data-flow^="ref_"]')).toHaveLength(0);
    expect(root(defrost).querySelector('[data-flow="ln3"]')).not.toBeNull();
    defrost.remove();
  });

  test('active cooling: the reversible refrigerant legs run reversed', async () => {
    const card = await mount({}, hassOf(COOLING));
    expect(root(card).querySelector('[data-flow="ref_8_13"]')?.classList.contains('reversed')).toBe(true);
    expect(root(card).querySelector('[data-flow="ref_discharge"]')?.classList.contains('reversed')).toBe(false);
    card.remove();
  });

  test('a custom colors option reaches the pipe strokes', async () => {
    const colors = [
      { temperature: -50, color: 'rgb(1, 2, 3)' },
      { temperature: -40, color: 'rgb(4, 5, 6)' },
    ];
    const card = await mount({ colors }, hassOf());
    // every temperature of the snapshot is above the last stop
    const stroke = root(card).querySelector('[data-segment="p1_up"]')?.getAttribute('style') ?? '';
    expect(stroke).toContain('rgb(4, 5, 6)');
    expect(root(card).querySelector('svg')?.getAttribute('style')).toContain('rgb(4, 5, 6)');
    card.remove();
  });

  test('model C: coil 51 takes the production outlet colour in DHW mode and the DHW colour in HTR recovery', async () => {
    const dhw = await mount({ model: 'C' }, hassOf({ 'dhw.demand': 'on' }));
    expect(group(dhw, 51)?.getAttribute('style')).toContain(color(25.2));
    expect(group(dhw, 51)?.getAttribute('style')).toContain('color:');
    dhw.remove();
    const htr = await mount({ model: 'C' }, hassOf({ ...COOLING, 'htr.active': 'on' }));
    expect(group(htr, 51)?.getAttribute('style')).toContain(color(52.1));
    htr.remove();
    const heatingHtr = await mount({ model: 'C' }, hassOf({ 'htr.active': 'on' }));
    expect(group(heatingHtr, 51)?.getAttribute('style')).toContain(color(52.1));
    heatingHtr.remove();
    const heating = await mount({ model: 'C' }, hassOf());
    expect(group(heating, 51)?.getAttribute('style')).toContain('var(--disabled-text-color)');
    heating.remove();
  });
});

describe('source wiring', () => {
  test('standby mutes the air unit and the ground collector, heating does not; the fan follows its own speed', async () => {
    for (const source of ['air', 'ground', 'hybrid'] as const) {
      const standby = await mount({ source }, hassOf(STANDBY));
      const mutedBodies = root(standby).querySelectorAll('.air-unit, .ground-collector');
      expect(mutedBodies.length, `standby ${source}`).toBeGreaterThan(0);
      for (const element of mutedBodies) {
        expect(element.classList.contains('muted'), `standby ${source}`).toBe(true);
      }
      if (source !== 'ground') {
        // the fan speed is 34.5 % in the snapshot: it turns although the circuit is idle
        expect(root(standby).querySelector('.fan-rotor')?.classList.contains('still')).toBe(false);
      }
      standby.remove();
      const heating = await mount({ source }, hassOf());
      const bodies = root(heating).querySelectorAll('.air-unit, .ground-collector');
      expect(bodies.length, `heating ${source}`).toBeGreaterThan(0);
      for (const element of bodies) {
        expect(element.classList.contains('muted'), `heating ${source}`).toBe(false);
      }
      heating.remove();
    }
  });
});
