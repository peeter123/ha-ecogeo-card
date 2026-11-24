// The air unit's three values (outer-loop-source "Air unit values inside", "Air unit values at phone width"): the outside
// temperature above the fan, the fan speed below it and the Out beside the exit pass sit inside the case, at least 10 px
// high, crossing no outline, fin, tube, fan or each other, at the horizontal layout's threshold and at the vertical layout's
// 320 px and just under its threshold. Three states: heating (the fan turns), defrost (the widest values, "-12.3 °C", and the
// fan still), a full fan ("100 %", the widest percentage), the spec's rpm value ("900 rpm") and a four-digit one ("1450 rpm",
// wider than the room right of the coil panel at 320 px: an expected failure, narrowed to that one pair). Real layout, so Chromium and WebKit; the boxes are
// the overlap check's (dev/overlaps.ts).
import { afterEach, describe, expect, test } from 'vitest';
import '../../dev/ha-stubs';
import '../../src/index';
import { EMULATOR_FONT, TOLERANCE, measureCard, overlapPairs } from '../../dev/overlaps';
import { MockHass } from '../../dev/mock-hass';
import { SCENARIOS } from '../../dev/scenarios';
import { NAMINGS, namingStates, registryOf } from '../../dev/foreign';
import { configOf, parseState } from '../../dev/url-state';
import type { EcogeoCard } from '../../src/card/ecogeo-card';
import { VERTICAL_BELOW } from '../../src/lib/layout';

afterEach(() => {
  document.body.replaceChildren();
});

const CASES = [
  { layout: 'horizontal', width: VERTICAL_BELOW },
  { layout: 'vertical', width: 320 },
  { layout: 'vertical', width: VERTICAL_BELOW - 1 },
] as const;

interface Fan {
  state: string;
  unit: string;
}

const STATES = [
  { name: 'heating', scenario: 'heating', fan: undefined, still: false },
  { name: 'defrost, fan still', scenario: 'defrost', fan: undefined, still: true },
  { name: 'fan at 100 %', scenario: 'heating', fan: { state: '100', unit: '%' }, still: false },
  { name: 'fan at 900 rpm', scenario: 'heating', fan: { state: '900', unit: 'rpm' }, still: false },
  { name: 'fan at 1450 rpm', scenario: 'heating', fan: { state: '1450', unit: 'rpm' }, still: false },
] as const;

/** The one pair of the four-digit rpm value that is an accepted limitation (see the test). */
const ACCEPTED_PAIR = 'label fan_speed x obstacle:air-coil';

async function show(
  source: 'air' | 'hybrid',
  layout: string,
  width: number,
  scenario: 'heating' | 'defrost',
  fan: Fan | undefined,
) {
  const state = parseState(`?scenario=${scenario}&source=${source}&layout=${layout}`);
  const wrapper = document.createElement('div');
  wrapper.style.fontFamily = EMULATOR_FONT.family;
  wrapper.style.fontSize = EMULATOR_FONT.size;
  wrapper.style.width = `${String(width)}px`;
  const card = document.createElement('ecogeo-card') as EcogeoCard;
  card.setConfig(configOf(state));
  const naming = NAMINGS[0];
  const readings = namingStates(naming, SCENARIOS[scenario].states);
  if (fan !== undefined) {
    const entity = Object.keys(readings).find((id) => id.endsWith('aerothermal_fan_speed'));
    if (entity === undefined) throw new Error('no fan entity');
    readings[entity] = { state: fan.state, attributes: { unit_of_measurement: fan.unit } };
  }
  card.hass = new MockHass().build(readings, false, registryOf(naming));
  wrapper.append(card);
  document.body.append(wrapper);
  await card.updateComplete;
  await expect.poll(() => card.width).toBe(width);
  await card.updateComplete;
  await document.fonts.ready;
  if (!card.shadowRoot) throw new Error('no shadow root');
  return card.shadowRoot;
}

describe.each(CASES)('Air unit values: $layout layout at $width px', ({ layout, width }) => {
  describe.each(STATES)('$name', ({ scenario, fan, still }) => {
    // Accepted limitation: a four-digit rpm value ("1450 rpm") is wider than the room right of the coil panel and can touch
    // it in the vertical layout at 320 px. Only that one pair is allowed: the checks below take it out of the list, and a
    // separate expected failure turns red if a later change makes it fit.
    const limited = fan?.state === '1450' && layout === 'vertical' && width === 320;
    async function check(source: 'air' | 'hybrid') {
      const root = await show(source, layout, width, scenario, fan);
      const ids =
        source === 'air' ? ['outside_temperature', 'fan_speed', 'air_unit_out'] : ['outside_temperature', 'fan_speed'];
      const measured = measureCard(root, { pipes: true });
      // the case outline, not the unit's group: the group also holds the feet, which reach the band's bottom edge
      const outline = root.querySelector('g[data-source="air"] > rect.band-outline');
      if (outline === null) throw new Error('no air unit case');
      const unit = outline.getBoundingClientRect();
      for (const id of ids) {
        const element = root.querySelector(`.label[data-label="${id}"]`);
        if (element === null) throw new Error(`no label ${id}`);
        expect(element.classList.contains('bare'), id).toBe(true);
        const { height } = element.getBoundingClientRect();
        expect(height, id).toBeGreaterThanOrEqual(10);
        const box = measured.labels.find((label) => label.id === id);
        if (box === undefined) throw new Error(`no box ${id}`);
        expect(box.left, id).toBeGreaterThan(unit.left + TOLERANCE);
        expect(box.right, id).toBeLessThan(unit.right - TOLERANCE);
        expect(box.top, id).toBeGreaterThan(unit.top + TOLERANCE);
        expect(box.bottom, id).toBeLessThan(unit.bottom - TOLERANCE);
      }
      if (fan?.unit === 'rpm') {
        expect(root.querySelector('.label[data-label="fan_speed"] .value')?.textContent.trim()).toMatch(/rpm$/);
      }
      if (fan?.unit === '%') {
        expect(root.querySelector('.label[data-label="fan_speed"] .value')?.textContent.trim()).toMatch(/^100\s%$/);
      }
      expect(root.querySelector('.fan-rotor')?.classList.contains('still'), 'fan still').toBe(still);
      if (source === 'hybrid') expect(root.querySelector('.label[data-label="air_unit_out"]')).toBeNull();
      // no pair that names one of the values: no outline, fin, tube, fan, foot or other label
      return overlapPairs(measured).filter((pair) => ids.some((id) => pair.includes(id)));
    }

    test.each(['air', 'hybrid'] as const)(
      '%s: inside the case, at least 10 px high, touching nothing',
      async (source) => {
        const pairs = await check(source);
        expect(pairs.filter((pair) => !(limited && pair === ACCEPTED_PAIR))).toEqual([]);
      },
    );

    if (limited) {
      test.fails.each(['air', 'hybrid'] as const)('%s: the accepted pair is gone', async (source) => {
        expect(await check(source)).not.toContain(ACCEPTED_PAIR);
      });
    }
  });
});
