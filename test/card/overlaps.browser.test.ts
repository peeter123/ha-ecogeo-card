// No overlaps above the threshold (add-compact-layout D6, D7; refine-simplified-layout D4, D6): every emulator scenario in
// every installation of the measurement script, in the full layout at the compact threshold, has no two labels that overlap,
// no label that overlaps a component or a pipe, and no caption that overlaps a label or a pipe. The boxes are the
// script's (dev/overlaps.ts). The compact layout below still counts labels and components only, until its places are
// searched with pipes (refine-simplified-layout group 5).
import { afterEach, describe, expect, test } from 'vitest';
import '../../dev/ha-stubs';
import '../../src/index';
import { EMULATOR_FONT, INSTALLATIONS, measureCard, overlapPairs, sidePairs } from '../../dev/overlaps';
import { MockHass } from '../../dev/mock-hass';
import { SCENARIO_NAMES, SCENARIOS } from '../../dev/scenarios';
import { NAMINGS, namingStates, registryOf } from '../../dev/foreign';
import { configOf, parseState } from '../../dev/url-state';
import type { EcogeoCard } from '../../src/card/ecogeo-card';
import { COMPACT_BELOW } from '../../src/lib/layout';

afterEach(() => {
  document.body.replaceChildren();
});

describe('No overlaps above the threshold', () => {
  for (const naming of NAMINGS)
    for (const installation of INSTALLATIONS) {
      test.each(SCENARIO_NAMES)(`${naming} ${installation.name}: %s at ${String(COMPACT_BELOW)} px`, async (name) => {
        const state = parseState(
          `?scenario=${name}&${installation.query}&naming=${naming}&layout=full&detail=simplified`,
        );
        const wrapper = document.createElement('div');
        wrapper.style.fontFamily = EMULATOR_FONT.family;
        wrapper.style.fontSize = EMULATOR_FONT.size;
        wrapper.style.width = `${String(COMPACT_BELOW)}px`;
        const card = document.createElement('ecogeo-card') as EcogeoCard;
        card.setConfig(configOf(state));
        card.hass = new MockHass().build(namingStates(naming, SCENARIOS[name].states), false, registryOf(naming));
        wrapper.append(card);
        document.body.append(wrapper);
        await card.updateComplete;
        await document.fonts.ready;
        const root = card.shadowRoot;
        if (!root) throw new Error('no shadow root');
        expect(root.querySelectorAll('.label').length).toBeGreaterThan(0);
        expect(overlapPairs(measureCard(root, { pipes: true }))).toEqual([]);
      });
    }
});

// The compact layout's labels are at least 10 px, so they are largest relative to the drawing on the narrowest cards:
// no overlaps there either (the places of labels.ts COMPACT_PLACES).
describe('No overlaps in the compact layout', () => {
  for (const width of [320, 360, 480, COMPACT_BELOW - 1]) {
    for (const naming of NAMINGS)
      for (const installation of INSTALLATIONS) {
        test.each(SCENARIO_NAMES)(`${naming} ${installation.name}: %s at ${String(width)} px`, async (name) => {
          const state = parseState(
            `?scenario=${name}&${installation.query}&naming=${naming}&layout=compact&detail=simplified`,
          );
          const wrapper = document.createElement('div');
          wrapper.style.fontFamily = EMULATOR_FONT.family;
          wrapper.style.fontSize = EMULATOR_FONT.size;
          wrapper.style.width = `${String(width)}px`;
          const card = document.createElement('ecogeo-card') as EcogeoCard;
          card.setConfig(configOf(state));
          card.hass = new MockHass().build(namingStates(naming, SCENARIOS[name].states), false, registryOf(naming));
          wrapper.append(card);
          document.body.append(wrapper);
          await card.updateComplete;
          await expect.poll(() => card.width).toBe(width);
          await card.updateComplete;
          await document.fonts.ready;
          const root = card.shadowRoot;
          if (!root) throw new Error('no shadow root');
          expect(root.querySelectorAll('.label').length).toBeGreaterThan(4);
          const measurement = measureCard(root);
          expect(overlapPairs(measurement)).toEqual([]);
          expect(sidePairs(measurement)).toEqual([]);
        });
      }
  }
});
