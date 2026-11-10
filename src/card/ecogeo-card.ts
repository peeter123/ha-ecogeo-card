// The ecoGEO schematic card (skeleton): a LitElement that renders an empty SVG in the viewBox of design D5.
// The drawing, the role table and the configuration arrive in later task groups; for now any config is accepted.
import { html, LitElement, type TemplateResult } from 'lit';
import type { CardConfig } from '../lib/config';
import { defineOnce } from '../lib/define';
import type { HassLike } from '../lib/hass';
import { SCHEMATIC_LABEL } from '../strings';

export const CARD_TAG = 'ecogeo-card';

/** The drawing's coordinate system (design D5). */
export const VIEWBOX_WIDTH = 1000;
export const VIEWBOX_HEIGHT = 620;

/** Home Assistant's grid options for a card (design D6). */
export interface GridOptions {
  columns: number | 'full';
  rows?: number | 'auto';
  min_columns?: number;
  min_rows?: number;
}

export class EcogeoCard extends LitElement {
  static override properties = {
    hass: { attribute: false },
    config: { state: true },
  };

  declare hass?: HassLike;
  declare config?: CardConfig;

  /** Called by Home Assistant with the card's config. Any config is accepted for now. */
  setConfig(config: CardConfig): void {
    this.config = config;
  }

  /** Height in units of 50 px for the masonry layout (design D6). */
  getCardSize(): number {
    return 10;
  }

  /** Full width on the sections grid, at least 8 rows tall (design D6). */
  getGridOptions(): GridOptions {
    return { columns: 'full', rows: 'auto', min_rows: 8 };
  }

  protected override render(): TemplateResult {
    return html`<ha-card>
      <svg
        viewBox="0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label=${SCHEMATIC_LABEL}
      ></svg>
    </ha-card>`;
  }
}

defineOnce(CARD_TAG, EcogeoCard);
