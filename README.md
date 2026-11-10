# ecoGEO heat pump card

A Lovelace card for Ecoforest ecoGEO heat pumps: the unit's internal schematic, drawn by the card as inline SVG,
with live values beside each component and the active circuits coloured by temperature. The card is read-only: it
shows the state of the unit and opens the more-info dialog of an entity, nothing else.

The card is meant to be used with the ESPHome firmware `esphome-ecoforest-ecogeo`, whose entity names are the
defaults. Every entity role can be overridden in the card configuration. See [docs/ecogeo-card.md](docs/ecogeo-card.md)
for the explanation of what the card shows and where each part comes from.

## Status

Work in progress. The card is a skeleton that renders an empty schematic frame; the drawing, the configuration,
the live values and the installation instructions arrive with the next task groups of the planned change
(`openspec/changes/add-schematic-card/`).

## Development

Requires Node 22.13 or newer, 24, or 26 and newer.

```sh
npm install
npm run dev       # the preview page with a mock hass, served by Vite
npm test          # unit tests (Vitest, happy-dom)
npm run check     # typecheck, lint, format check and tests
npm run build     # bundle into build/ecogeo-card.js (git-ignored)
npm run release   # check, build, verify that the bundle registers the card, copy it to dist/ecogeo-card.js
```

`dist/ecogeo-card.js` is the committed, deployable bundle. `npm run format` rewrites files with Prettier.
