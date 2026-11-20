// No overlaps in a layout's verified range (add-compact-layout D6, D7; refine-simplified-layout D4, D6; rework-layouts D7; responsive-layout
// "Vertical threshold", "Labels clear of everything"): every emulator scenario in every installation of the measurement script has no
// two labels that overlap, no label that overlaps a component, a pipe, the drawing's edge or an outline (a rotated label by its
// rotated box). The horizontal layout is measured at the vertical threshold, 800 and 1000 px, the vertical layout at 320, 360,
// 412 px and 1 px under the threshold. The boxes are the script's (dev/overlaps.ts).
import { afterEach, describe, expect, test } from 'vitest';
import '../../dev/ha-stubs';
import '../../src/index';
import { EMULATOR_FONT, INSTALLATIONS, measureCard, overlapPairs } from '../../dev/overlaps';
import { MockHass } from '../../dev/mock-hass';
import { SCENARIO_NAMES, SCENARIOS } from '../../dev/scenarios';
import { NAMINGS, namingStates, registryOf } from '../../dev/foreign';
import { configOf, parseState } from '../../dev/url-state';
import type { EcogeoCard } from '../../src/card/ecogeo-card';
import { VERTICAL_BELOW } from '../../src/lib/layout';

afterEach(() => {
  document.body.replaceChildren();
});

const RANGES = [
  { layout: 'horizontal', widths: [VERTICAL_BELOW, 800, 1000] },
  { layout: 'vertical', widths: [320, 360, 412, VERTICAL_BELOW - 1] },
] as const;

describe.each(RANGES)('No overlaps in the verified range of the $layout layout', ({ layout, widths }) => {
  for (const width of widths)
    for (const naming of NAMINGS)
      for (const installation of INSTALLATIONS) {
        test.each(SCENARIO_NAMES)(`${naming} ${installation.name}: %s at ${String(width)} px`, async (name) => {
          const state = parseState(`?scenario=${name}&${installation.query}&naming=${naming}&layout=${layout}`);
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
          expect(root.querySelectorAll('.label').length).toBeGreaterThan(0);
          expect(overlapPairs(measureCard(root, { pipes: true }))).toEqual([]);
        });
      }
});
