// Pixel references of fixed emulator renders, compared in Chromium on Linux (the CI image with Roboto installed) and
// skipped on every other platform: glyph rasterisation differs per platform, so a reference only holds where it was
// recorded. Both layouts (horizontal at 1000 px, vertical at 320 px), light and dark, over installations that together
// cover every source, DHW storage and emitter. The references are test/visual/references/<render>-chromium-linux.png.
import { afterEach, describe, expect, test } from 'vitest';
import { page, server } from 'vitest/browser';
import '../../dev/ha-stubs';
import '../../src/index';
import { EMULATOR_FONT } from '../../dev/overlaps';
import { MockHass } from '../../dev/mock-hass';
import { SCENARIOS } from '../../dev/scenarios';
import { namingStates, registryOf } from '../../dev/foreign';
import { configOf, parseState } from '../../dev/url-state';
import type { EcogeoCard } from '../../src/card/ecogeo-card';

afterEach(() => {
  document.body.replaceChildren();
});

/** The emulator page's palette (dev/index.html, `body.light` and `body.dark`). */
const THEMES = {
  light: {
    '--card-background-color': '#ffffff',
    '--primary-text-color': '#212121',
    '--secondary-text-color': '#727272',
    '--disabled-text-color': '#bdbdbd',
    '--divider-color': 'rgba(0, 0, 0, 0.12)',
  },
  dark: {
    '--card-background-color': '#1c1c1c',
    '--primary-text-color': '#e1e1e1',
    '--secondary-text-color': '#9b9b9b',
    '--disabled-text-color': '#6f6f6f',
    '--divider-color': 'rgba(225, 225, 225, 0.12)',
  },
} as const;

const LAYOUTS = [
  { layout: 'horizontal', width: 1000 },
  { layout: 'vertical', width: 320 },
] as const;

/** Source x DHW storage x emitter: ground, air and hybrid; external, internal (model C), none and unused; underfloor, radiator and none. */
const RENDERS = [
  { name: 'ground-external-underfloor', scenario: 'heating', query: 'source=ground' },
  { name: 'air-none-radiator', scenario: 'heating', query: 'source=air&dhw=none&emitter=radiator' },
  { name: 'hybrid-internal-noemitter', scenario: 'dhw', query: 'source=hybrid&model=C&dhw=internal&emitter=none' },
  { name: 'air-unused-underfloor', scenario: 'heating', query: 'source=air&dhw=unused' },
] as const;

describe.each(LAYOUTS)('Visual references, $layout layout', ({ layout, width }) => {
  for (const theme of ['light', 'dark'] as const)
    test.skipIf(server.platform !== 'linux').each(RENDERS)(
      `${layout} ${theme} $name`,
      async ({ name, scenario, query }) => {
        const state = parseState(`?scenario=${scenario}&${query}&layout=${layout}`);
        const wrapper = document.createElement('div');
        wrapper.style.fontFamily = EMULATOR_FONT.family;
        wrapper.style.fontSize = EMULATOR_FONT.size;
        wrapper.style.width = `${String(width)}px`;
        for (const [property, value] of Object.entries(THEMES[theme])) wrapper.style.setProperty(property, value);
        wrapper.style.colorScheme = theme;
        wrapper.style.background = THEMES[theme]['--card-background-color'];
        const card = document.createElement('ecogeo-card') as EcogeoCard;
        card.setConfig(configOf(state));
        card.hass = new MockHass().build(
          namingStates('firmware', SCENARIOS[state.scenario].states),
          theme === 'dark',
          registryOf('firmware'),
        );
        wrapper.append(card);
        document.body.append(wrapper);
        await card.updateComplete;
        await expect.poll(() => card.width).toBe(width);
        await card.updateComplete;
        await document.fonts.ready;
        await expect.element(page.elementLocator(wrapper)).toMatchScreenshot(`${layout}-${theme}-${name}`);
      },
    );
});
