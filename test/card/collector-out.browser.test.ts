// The collector's Out (outer-loop-source "Collector Out"): the brine inlet sits bare inside the collector at its bottom,
// ending just left of the return riser, at least 10 px high, crossing no outline, hatching, pipe or other label, at the horizontal
// layout's threshold and at the vertical layout's 320 px and just under its threshold. Two states: heating and
// defrost (its values differ). Real layout, so Chromium and WebKit; the boxes are the overlap check's
// (dev/overlaps.ts).
import { afterEach, describe, expect, test } from 'vitest';
import '../../dev/ha-stubs';
import '../../src/index';
import { EMULATOR_FONT, TOLERANCE, measureCard, overlapPairs } from '../../dev/overlaps';
import { MockHass } from '../../dev/mock-hass';
import { SCENARIOS } from '../../dev/scenarios';
import { NAMINGS, namingStates, registryOf } from '../../dev/foreign';
import { configOf, parseState } from '../../dev/url-state';
import type { EcogeoCard } from '../../src/card/ecogeo-card';
import { BAND } from '../../src/diagram/geometry';
import { VERTICAL_BELOW } from '../../src/lib/layout';

afterEach(() => {
  document.body.replaceChildren();
});

const CASES = [
  { layout: 'horizontal', width: VERTICAL_BELOW },
  { layout: 'vertical', width: 320 },
  { layout: 'vertical', width: VERTICAL_BELOW - 1 },
] as const;

const SCENARIOS_SHOWN = ['heating', 'defrost'] as const;

async function show(source: 'ground' | 'hybrid', layout: string, width: number, scenario: 'heating' | 'defrost') {
  const state = parseState(`?scenario=${scenario}&source=${source}&layout=${layout}`);
  const wrapper = document.createElement('div');
  wrapper.style.fontFamily = EMULATOR_FONT.family;
  wrapper.style.fontSize = EMULATOR_FONT.size;
  wrapper.style.width = `${String(width)}px`;
  const card = document.createElement('ecogeo-card') as EcogeoCard;
  card.setConfig(configOf(state));
  const naming = NAMINGS[0];
  const readings = namingStates(naming, SCENARIOS[scenario].states);
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

describe.each(CASES)('Collector Out: $layout layout at $width px', ({ layout, width }) => {
  describe.each(SCENARIOS_SHOWN)('%s', (scenario) => {
    test.each(['ground', 'hybrid'] as const)(
      '%s: inside the collector, at least 10 px high, touching nothing',
      async (source) => {
        const root = await show(source, layout, width, scenario);
        const id = source === 'ground' ? 'ground_out' : 'hybrid_ground_out';
        const measured = measureCard(root, { pipes: true });
        const outline = root.querySelector('g.ground-collector > rect.band-outline');
        if (outline === null) throw new Error('no collector outline');
        const body = outline.getBoundingClientRect();
        const element = root.querySelector(`.label[data-label="${id}"]`);
        if (element === null) throw new Error(`no label ${id}`);
        expect(element.classList.contains('bare'), id).toBe(true);
        expect(element.getBoundingClientRect().height, id).toBeGreaterThanOrEqual(10);
        const box = measured.labels.find((label) => label.id === id);
        if (box === undefined) throw new Error(`no box ${id}`);
        expect(box.left, id).toBeGreaterThan(body.left + TOLERANCE);
        expect(box.right, id).toBeLessThan(body.right - TOLERANCE);
        expect(box.top, id).toBeGreaterThan(body.top + TOLERANCE);
        expect(box.bottom, id).toBeLessThan(body.bottom - TOLERANCE);
        // the Out sits in the lower part, beside the return riser: below the loops' bends
        const bends = root.querySelector('[data-obstacle="ground-probe"]')?.getBoundingClientRect();
        if (bends === undefined) throw new Error('no probe box');
        expect(box.top, id).toBeGreaterThanOrEqual(bends.bottom - TOLERANCE);
        // it ends just left of the return riser: its right edge is left of the riser and at most about two margins from it
        const kind = source === 'ground' ? 'gnd' : 'hyb';
        const riser = root.querySelector(`[data-segment="src_${kind}_up"]`)?.getBoundingClientRect();
        if (riser === undefined) throw new Error('no return riser');
        const margin = (BAND.margin * body.width) / BAND.collector.width;
        expect(riser.right - box.right, id).toBeGreaterThan(0);
        expect(riser.right - box.right, id).toBeLessThan(2 * margin + 4);
        // no pair that names the value: no outline, hatching, pipe or other label
        expect(overlapPairs(measured).filter((pair) => pair.includes(id))).toEqual([]);
      },
    );
  });
});
