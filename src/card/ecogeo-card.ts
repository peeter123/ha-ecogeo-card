// The ecoGEO schematic card: a LitElement that validates and resolves its config, reads the roles, derives the mode
// draws the cabinet (diagram/cabinet.ts) in the SVG viewBox of design D5 and shows the footer indications (mode,
// alarm, offline, sample values). Pipe colours and live value labels arrive in groups 5 and 6.
import { css, html, LitElement, nothing, type PropertyValues, type TemplateResult } from 'lit';
import { circuitsFor, type Circuits } from '../calc/circuits';
import { deriveMode, isAlarm, isOffline, type Mode } from '../calc/mode';
import { readRoles, type Readings } from '../calc/readings';
import { configErrors } from '../config/options';
import { resolveConfig, type ResolvedConfig } from '../config/resolve';
import { SAMPLE_STATES } from '../config/sample';
import { cabinetStyles, renderCabinet } from '../diagram/cabinet';
import { viewBox } from '../diagram/geometry';
import type { CardConfig } from '../lib/config';
import { defineOnce } from '../lib/define';
import { stateOf, type HassLike } from '../lib/hass';
import { shouldRender } from '../lib/render';
import { INDICATIONS, MODE_LABELS, SCHEMATIC_LABEL } from '../strings';

export const CARD_TAG = 'ecogeo-card';

/** The drawing's coordinate system (design D5). */
export const VIEWBOX_WIDTH = viewBox.width;
export const VIEWBOX_HEIGHT = viewBox.height;

/** Home Assistant's grid options for a card (design D6). */
export interface GridOptions {
  columns: number | 'full';
  rows?: number | 'auto';
  min_columns?: number;
  min_rows?: number;
}

export class EcogeoCard extends LitElement {
  static override styles = [
    cabinetStyles,
    css`
      .footer {
        display: flex;
        flex-wrap: wrap;
        gap: 4px 12px;
        padding: 0 16px 12px;
      }
      .sample {
        color: var(--secondary-text-color);
      }
      .alarm {
        color: var(--error-color);
      }
    `,
  ];

  static override properties = {
    hass: { attribute: false },
    config: { state: true },
  };

  declare hass?: HassLike;
  declare config?: CardConfig;
  private resolved?: ResolvedConfig;
  private entityIds: string[] = [];
  private renderedHass?: HassLike;

  /** Called by Home Assistant with the card's config. Throws for an invalid config: HA shows its error card. */
  setConfig(config: CardConfig): void {
    const errors = configErrors(config);
    if (errors.length > 0) throw new Error(errors.join('; '));
    this.resolved = resolveConfig(config);
    this.entityIds = [...new Set(Object.values(this.resolved.entities).filter((id) => id !== undefined))];
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

  protected override shouldUpdate(changed: PropertyValues): boolean {
    return shouldRender(changed, this.hass, this.renderedHass, this.entityIds);
  }

  /** The readings of every role: the sample states in sample mode, `hass.states` otherwise. */
  private readings(resolved: ResolvedConfig): { readings: Readings; offline: boolean } {
    const states = resolved.sample ? SAMPLE_STATES : (this.hass?.states ?? {});
    return {
      readings: readRoles(states, resolved.entities),
      offline: isOffline(stateOf(states, resolved.entities['unit.connection'])),
    };
  }

  protected override render(): TemplateResult {
    this.renderedHass = this.hass;
    const resolved = this.resolved;
    let mode: Mode | undefined;
    let circuits: Circuits | undefined;
    let alarm = false;
    let offline = false;
    if (resolved !== undefined) {
      const read = this.readings(resolved);
      mode = deriveMode(read.readings, resolved.features);
      circuits = circuitsFor(mode, resolved.features, resolved.dhw, read.readings);
      alarm = isAlarm(read.readings['unit.alarm']);
      offline = read.offline;
    }
    return html`<ha-card>
      <svg
        viewBox="0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label=${SCHEMATIC_LABEL}
      >
        ${resolved === undefined || circuits === undefined ? nothing : renderCabinet(resolved, circuits)}
      </svg>
      <div class="footer">
        ${mode === undefined ? nothing : html`<span class="mode">${MODE_LABELS[mode]}</span>`}
        ${alarm ? html`<span class="alarm">${INDICATIONS.alarm}</span>` : nothing}
        ${offline ? html`<span class="offline">${INDICATIONS.offline}</span>` : nothing}
        ${resolved?.sample === true ? html`<span class="sample">${INDICATIONS.sampleValues}</span>` : nothing}
      </div>
    </ha-card>`;
  }
}

defineOnce(CARD_TAG, EcogeoCard);
