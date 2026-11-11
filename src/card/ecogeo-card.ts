// The ecoGEO schematic card: a LitElement that validates and resolves its config, reads the roles, derives the mode
// and the circuits, draws the cabinet (diagram/cabinet.ts) with coloured, flowing pipes (pipes.ts), the outer-loop
// source (source.ts) and the external DHW tank (dhw.ts) in the SVG viewBox of design D5, overlays the value labels
// (labels.ts) and shows the footer: mode, values, alarm, offline and sample indications. Tapping a value fires
// `hass-more-info`; the card calls no service.
import { css, html, LitElement, nothing, svg, type PropertyValues, type TemplateResult } from 'lit';
import { circuitsFor } from '../calc/circuits';
import { deriveMode, isAlarm, isOffline } from '../calc/mode';
import { readRoles, type Readings } from '../calc/readings';
import { configErrors } from '../config/options';
import { resolveConfig, type ResolvedConfig } from '../config/resolve';
import { SAMPLE_STATES } from '../config/sample';
import { cabinetStyles, renderCabinet } from '../diagram/cabinet';
import { dhwStyles, renderDhw } from '../diagram/dhw';
import { viewBox } from '../diagram/geometry';
import { footerItems, labelsFor, labelStyles, renderFooterItems, renderLabels } from '../diagram/labels';
import { tankColor, type PipeView } from '../diagram/pipes';
import { renderSource, sourceStyles } from '../diagram/source';
import type { CardConfig } from '../lib/config';
import { defineOnce } from '../lib/define';
import { localeFromHass } from '../lib/format';
import { fireMoreInfo, stateOf, type HassLike } from '../lib/hass';
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
    sourceStyles,
    dhwStyles,
    labelStyles,
    css`
      .footer {
        display: flex;
        flex-wrap: wrap;
        align-items: baseline;
        gap: 4px 16px;
        padding: 8px 16px 12px;
      }
      .mode {
        font-weight: 500;
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
    if (resolved === undefined) return html`<ha-card><div class="diagram"></div></ha-card>`;
    const { readings, offline } = this.readings(resolved);
    const mode = deriveMode(readings, resolved.features);
    const circuits = circuitsFor(mode, resolved.features, resolved.dhw, readings);
    const view: PipeView = { mode, circuits, readings, stops: resolved.colors };
    const states = resolved.sample ? SAMPLE_STATES : (this.hass?.states ?? {});
    const display = { locale: localeFromHass(this.hass), entities: this.hass?.entities, states };
    // Taps open more-info of the role's entity; the sample's entities do not exist, so they do nothing there.
    const onTap = resolved.sample
      ? undefined
      : (entityId: string): void => {
          fireMoreInfo(this, entityId);
        };
    return html`<ha-card>
      <div class="diagram">
        <svg
          viewBox="0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label=${SCHEMATIC_LABEL}
          style="--dhw-tank-color: ${tankColor(view)}"
        >
          ${svg`${renderSource(resolved, readings, circuits.active.has('brine'))}${renderDhw(resolved)}${renderCabinet(resolved, view)}`}
        </svg>
        ${renderLabels(labelsFor(resolved, readings, resolved.entities, display), onTap)}
      </div>
      <div class="footer">
        <span class="mode">${MODE_LABELS[mode]}</span>
        ${renderFooterItems(footerItems(readings, resolved.entities, display), onTap)}
        ${isAlarm(readings['unit.alarm']) ? html`<span class="alarm">${INDICATIONS.alarm}</span>` : nothing}
        ${offline ? html`<span class="offline">${INDICATIONS.offline}</span>` : nothing}
        ${resolved.sample ? html`<span class="sample">${INDICATIONS.sampleValues}</span>` : nothing}
      </div>
    </ha-card>`;
  }
}

defineOnce(CARD_TAG, EcogeoCard);
