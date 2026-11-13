// The component-info spec: the name and item number of every drawn component as tooltip and accessible name, and
// the more-info tap of a component with an entity of its own (refine-schematic-drawing D2).
import { describe, expect, test, vi } from 'vitest';
import '../../src/index';
import { EcogeoCard } from '../../src/card/ecogeo-card';
import { ROLE_BY_PATH, ROLES } from '../../src/config/roles';
import { COMPONENT_ROLES, EXTERNAL_TANK_ROLE, FAN_ROLE } from '../../src/diagram/component-info';
import { arrangementFor } from '../../src/diagram/geometry';
import type { CardConfig } from '../../src/lib/config';
import type { HassLike } from '../../src/lib/hass';
import { AIR_UNIT_FAN_NAME, COMPONENT_NAMES, DHW_LABELS, componentLabel } from '../../src/strings';
import { states } from '../helpers';

// the default config draws the simplified level
const full = arrangementFor('simplified', 'full');
const COMPONENTS = full.components;

const P = 'demo_ecogeo';
const ALL_TRUE = { active_cooling: true, passive_cooling: true, htr: true, backup_heater: true };

async function mount(config: CardConfig = {}, hass?: HassLike): Promise<EcogeoCard> {
  const card = document.createElement('ecogeo-card') as EcogeoCard;
  card.setConfig({ type: 'custom:ecogeo-card', ...config });
  if (hass !== undefined) card.hass = hass;
  document.body.append(card);
  await card.updateComplete;
  return card;
}

const root = (card: EcogeoCard): ShadowRoot => {
  if (card.shadowRoot === null) throw new Error('no shadow root');
  return card.shadowRoot;
};
const group = (card: EcogeoCard, item: number): SVGElement => {
  const element = root(card).querySelector<SVGElement>(`[data-item="${String(item)}"]`);
  if (element === null) throw new Error(`item ${String(item)} is not drawn`);
  return element;
};
const hass: HassLike = { states: states([`sensor.${P}_heatpump_on_off`, 'ON']) };
const live: CardConfig = { prefix: P };

/** Collects the more-info events the card fires. */
function listen(card: EcogeoCard): string[] {
  const seen: string[] = [];
  card.addEventListener('hass-more-info', (event) =>
    seen.push((event as CustomEvent<{ entityId: string }>).detail.entityId),
  );
  return seen;
}

describe('component names', () => {
  test('pump tooltip: "Production circulator pump (15)" as title and aria-label', async () => {
    const card = await mount(live, hass);
    const pump = group(card, 15);
    expect(pump.querySelector('title')?.textContent).toBe('Production circulator pump (15)');
    expect(pump.getAttribute('aria-label')).toBe('Production circulator pump (15)');
    card.remove();
  });

  test('connections carry their name too', async () => {
    const card = await mount({ detail: 'simplified' });
    expect(group(card, 1).querySelector('title')?.textContent).toBe('Production outlet (1)');
    expect(group(card, 4).getAttribute('aria-label')).toBe('Brine inlet (4)');
    card.remove();
  });

  test.each([
    ['B', 'external'],
    ['B', 'none'],
    ['C', 'internal'],
  ] as const)('every component named: model %s, dhw %s, detail full, every feature true', async (model, dhw) => {
    const card = await mount({ model, dhw, detail: 'full', features: ALL_TRUE });
    const groups = [...root(card).querySelectorAll<SVGElement>('[data-item]')];
    expect(groups.length).toBeGreaterThan(30);
    for (const element of groups) {
      const item = element.getAttribute('data-item') ?? '';
      const title = element.querySelector('title')?.textContent ?? '';
      expect(title, item).toMatch(new RegExp(`^\\S.* \\(${item}\\)$`));
      expect(element.getAttribute('aria-label'), item).toBe(title);
    }
    card.remove();
  });

  test('every component of the geometry has a name, and the names are not repeated by accident', () => {
    for (const component of COMPONENTS) expect(COMPONENT_NAMES[component.item], String(component.item)).toBeTruthy();
    expect(componentLabel(15)).toBe('Production circulator pump (15)');
    expect(componentLabel(42)).toBe('');
  });

  test('the air unit fan and the external tank are named', async () => {
    const card = await mount({ source: 'air', dhw: 'external' });
    expect(root(card).querySelector('.fan-part title')?.textContent).toBe(AIR_UNIT_FAN_NAME);
    expect(root(card).querySelector('.dhw-storage title')?.textContent).toBe(DHW_LABELS.externalTank);
    card.remove();
  });
});

describe('component-to-role table', () => {
  test('every entry names a role of the role table', () => {
    for (const role of [...Object.values(COMPONENT_ROLES), FAN_ROLE, EXTERNAL_TANK_ROLE]) {
      expect(ROLE_BY_PATH.has(role), role).toBe(true);
    }
  });

  test("a role that alone belongs to a numbered item is that item's entry", () => {
    for (const [item, role] of Object.entries(COMPONENT_ROLES)) {
      const sameItem = ROLES.filter((spec) => spec.item === item);
      if (sameItem.length === 1) expect(sameItem[0]?.path, item).toBe(role);
    }
  });

  test('every drawn item with exactly one role in the role table has that role as its entry', async () => {
    const card = await mount({ model: 'C', detail: 'full', features: ALL_TRUE });
    const drawn = [...root(card).querySelectorAll('[data-item]')].map((e) => Number(e.getAttribute('data-item')));
    for (const item of drawn) {
      const sameItem = ROLES.filter((spec) => spec.item === String(item));
      if (sameItem.length === 1) expect(COMPONENT_ROLES[item], String(item)).toBe(sameItem[0]?.path);
    }
    card.remove();
  });

  test('the hand-chosen entries of refine-schematic-drawing D2', () => {
    expect(COMPONENT_ROLES[11]).toBe('compressor.speed');
    expect(COMPONENT_ROLES[12]).toBe('refrigerant.expansion_valve');
    expect(COMPONENT_ROLES[8]).toBe('refrigerant.condensation_temperature');
    expect(COMPONENT_ROLES[7]).toBe('refrigerant.evaporation_temperature');
    expect(COMPONENT_ROLES[50]).toBe('dhw.temperature');
    expect(COMPONENT_ROLES[54]).toBe('dhw.temperature');
    for (const item of [9, 10, 13, 14, 17, 22, 25, 27, 28, 44, 45])
      expect(COMPONENT_ROLES[item], String(item)).toBeUndefined();
  });
});

describe('accessibility of the drawing', () => {
  test('the svg is a group, not an image, so the component buttons stay exposed', async () => {
    const card = await mount(live, hass);
    expect(root(card).querySelector('svg')?.getAttribute('role')).toBe('group');
    expect(root(card).querySelector('[role="button"]')).not.toBeNull();
    card.remove();
  });
});

describe('tap a component', () => {
  test('tapping pump 16 opens the brine pump entity and calls no service', async () => {
    const card = await mount(live, hass);
    const seen = listen(card);
    const callService = vi.fn();
    (card.hass as HassLike & { callService?: unknown }).callService = callService;
    const pump = group(card, 16);
    expect(pump.getAttribute('role')).toBe('button');
    expect(pump.getAttribute('tabindex')).toBe('0');
    pump.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(seen).toEqual([`sensor.${P}_brine_pump`]);
    expect(callService).not.toHaveBeenCalled();
    card.remove();
  });

  test("valve 12's tap opens the opening's entity at the simplified level, where its two values are not shown (refine-simplified-layout D5)", async () => {
    const card = await mount(live, hass);
    const seen = listen(card);
    expect(root(card).querySelector('[data-label="superheat"], [data-label="expansion_valve"]')).toBeNull();
    group(card, 12).dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(seen).toEqual([`sensor.${P}_expansion_valve_position`]);
    card.remove();
  });

  test('Compressor without a speed role: item 11 opens the percentage, else the power entity', async () => {
    const percentage = await mount({ prefix: P, entities: { compressor: { speed: 'none' } } }, hass);
    const seen = listen(percentage);
    group(percentage, 11).dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(seen).toEqual([`sensor.${P}_compressor_percentage`]);
    percentage.remove();
    const power = await mount({ prefix: P, entities: { compressor: { speed: 'none', percentage: 'none' } } }, hass);
    const seenPower = listen(power);
    group(power, 11).dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(seenPower).toEqual([`sensor.${P}_power_consumption`]);
    power.remove();
  });

  test('Enter and Space open it too, other keys do not', async () => {
    const card = await mount(live, hass);
    const seen = listen(card);
    const probe = group(card, 33);
    for (const key of ['Enter', ' ', 'a', 'Tab']) {
      probe.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
    }
    expect(seen).toEqual([`sensor.${P}_production_out`, `sensor.${P}_production_out`]);
    card.remove();
  });

  test('every entry of the table opens the entity of its role', async () => {
    const card = await mount({ model: 'C', dhw: 'internal', detail: 'full', features: ALL_TRUE, ...live }, hass);
    const seen = listen(card);
    const entities = ROLES.filter((spec) => Object.values(COMPONENT_ROLES).includes(spec.path));
    for (const [item, role] of Object.entries(COMPONENT_ROLES)) {
      const spec = entities.find((candidate) => candidate.path === role);
      const before = seen.length;
      group(card, Number(item)).dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(seen.slice(before), item).toEqual([`${spec?.domain ?? ''}.${P}_${spec?.suffix ?? ''}`]);
    }
    card.remove();
  });

  test('the air unit fan and the external tank open their entities', async () => {
    const card = await mount({ ...live, source: 'air', dhw: 'external' }, hass);
    const seen = listen(card);
    root(card)
      .querySelector('.fan-part')
      ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    root(card)
      .querySelector('.dhw-storage')
      ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(seen).toEqual([`sensor.${P}_aerothermal_fan_speed`, `sensor.${P}_dhw_temperature`]);
    card.remove();
  });

  test('no entity: filter dryer 13 opens nothing and is no button and no tab stop', async () => {
    const card = await mount(live, hass);
    const seen = listen(card);
    const dryer = group(card, 13);
    dryer.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    dryer.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(seen).toEqual([]);
    expect(dryer.hasAttribute('role')).toBe(false);
    expect(dryer.hasAttribute('tabindex')).toBe(false);
    card.remove();
  });

  test('only the components of the table are buttons', async () => {
    const card = await mount({ ...live, model: 'C', detail: 'full', features: ALL_TRUE }, hass);
    for (const element of root(card).querySelectorAll<SVGElement>('[data-item]')) {
      const item = Number(element.getAttribute('data-item'));
      expect(element.getAttribute('role') === 'button', String(item)).toBe(item in COMPONENT_ROLES);
      expect(element.hasAttribute('tabindex'), String(item)).toBe(item in COMPONENT_ROLES);
    }
    card.remove();
  });

  test('a role without an entity makes its component inert', async () => {
    const card = await mount({ entities: { brine: { pump: 'sensor.my_brine_pump' } } }, hass);
    expect(group(card, 16).getAttribute('role')).toBe('button');
    expect(group(card, 15).hasAttribute('role')).toBe(false);
    card.remove();
  });

  test('sample mode: no component is tappable', async () => {
    const card = await mount({ model: 'C', detail: 'full', features: ALL_TRUE });
    const seen = listen(card);
    expect(root(card).querySelectorAll('[role="button"]')).toHaveLength(0);
    expect(root(card).querySelectorAll('[tabindex]')).toHaveLength(0);
    group(card, 16).dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(seen).toEqual([]);
    card.remove();
  });

  test('sample mode with the external tank and the air unit: not tappable either', async () => {
    const card = await mount({ source: 'air', dhw: 'external' });
    expect(root(card).querySelectorAll('[role="button"]')).toHaveLength(0);
    card.remove();
  });
});
