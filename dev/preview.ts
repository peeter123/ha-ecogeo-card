// The preview page (npm run dev): the card from the source in a light and a dark theme, with an empty mock `hass`.
// Vite reloads the page when a source file changes. Adapted from hrv-ventilation dev/preview.ts.
import './ha-stubs';
import '../src/index';
import type { EcogeoCard } from '../src/card/ecogeo-card';
import { MockHass } from './mock-hass';

const THEMES = ['light', 'dark'] as const;
const mock = new MockHass();

const main = document.getElementById('cards');
if (!main) throw new Error('the page has no #cards element');

for (const theme of THEMES) {
  const section = document.createElement('section');
  section.className = `theme ${theme}`;
  const heading = document.createElement('h2');
  heading.textContent = `${theme} theme`;
  const slot = document.createElement('div');
  slot.className = 'slot';
  slot.style.width = '900px';
  const card = document.createElement('ecogeo-card') as EcogeoCard;
  card.setConfig({ type: 'custom:ecogeo-card' });
  card.hass = mock.build({}, theme === 'dark');
  slot.append(card);
  section.append(heading, slot);
  main.append(section);
}
