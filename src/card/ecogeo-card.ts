// The ecoGEO schematic card: a LitElement that validates and resolves its config, reads the roles, derives the mode
// and the circuits, draws the cabinet (diagram/cabinet.ts) with coloured, flowing pipes (pipes.ts), the outer-loop
// source (source.ts) and the external DHW tank (dhw.ts) in the SVG viewBox of add-schematic-card D5, overlays the value labels
// (labels.ts) and shows the footer: mode, values, alarm, offline and sample indications. Tapping a value fires
// `hass-more-info`; the card calls no service.
import { css, html, LitElement, nothing, svg, type PropertyValues, type TemplateResult } from 'lit';
import { circuitsFor } from '../calc/circuits';
import { deriveMode, isAlarm, isOffline } from '../calc/mode';
import { animationReadings, readRoles, type Readings } from '../calc/readings';
import { configErrors } from '../config/options';
import { resolveConfig, type ResolvedConfig } from '../config/resolve';
import { SAMPLE_STATES } from '../config/sample';
import { cabinetStyles, renderCabinet } from '../diagram/cabinet';
import type { Taps } from '../diagram/component-info';
import { dhwStyles, renderDhw } from '../diagram/dhw';
import { arrangementFor, type DrawContext, type ShownLayout } from '../diagram/geometry';
import { footerItems, labelsFor, labelStyles, renderFooterItems, renderLabels } from '../diagram/labels';
import { coilMutedColor, MUTED_COLOR } from '../diagram/colors';
import { EDITOR_TAG } from '../editor/ecogeo-card-editor';
import { tankColor, type PipeView } from '../diagram/pipes';
import { renderSource, sourceStyles } from '../diagram/source';
import type { CardConfig } from '../lib/config';
import { defineOnce } from '../lib/define';
import { localeFromHass } from '../lib/format';
import { drawingWidth, nextCompact, strokeWidths, type StrokeWidths } from '../lib/layout';
import { fireMoreInfo, stateOf, type HassLike } from '../lib/hass';
import { shouldRender } from '../lib/render';
import { stubConfig } from '../suggest/stub';
import { INDICATIONS, MODE_LABELS, SCHEMATIC_LABEL } from '../strings';

export const CARD_TAG = 'ecogeo-card';

/** Home Assistant's grid options for a card (add-schematic-card D6). */
export interface GridOptions {
  columns: number | 'full';
  rows?: number | 'auto';
  min_columns?: number;
  min_rows?: number;
}

/** Counts the card instances, for the ids of their SVG gradients (two cards on one page must not share ids). */
let instances = 0;

export class EcogeoCard extends LitElement {
  static override styles = [
    cabinetStyles,
    sourceStyles,
    dhwStyles,
    labelStyles,
    css`
      /* Block, so the ResizeObserver reports the card's width (an inline element reports none). */
      :host {
        display: block;
      }
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
    width: { state: true },
    viewportHeight: { state: true },
    // Plain reactive property: Home Assistant assigns it to the cards of a panel view (a getter-only accessor would throw).
    isPanel: { attribute: false },
    // Also assigned by Home Assistant: its panel view sets `layout = 'panel'`. Not the config's `layout` option (resolved.layout).
    layout: { attribute: false },
  };

  /** The visual editor (add-card-editor): the editor element, which builds its own schema from the config. */
  static getConfigElement(): HTMLElement {
    return document.createElement(EDITOR_TAG);
  }

  /**
   * The card picker's starting config: the prefix of the one device that carries the firmware's entity names (the
   * preview then shows its live values), else no prefix and no entities, so the preview shows the sample values.
   * Home Assistant passes `hass`, though its developer docs do not say so: without it the stub is empty.
   */
  static getStubConfig(hass?: HassLike): CardConfig {
    return stubConfig(hass);
  }

  declare hass?: HassLike;
  declare config?: CardConfig;
  /** The card's own width in px, from the ResizeObserver; 0 until the first observation (the layout is then full). */
  declare width: number;
  /** True when Home Assistant shows the card in a panel view: the drawing is then kept within the window's height (D9). */
  declare isPanel?: boolean;
  /** The layout name Home Assistant's view assigns to the card element (`panel` in a panel view); not the `layout` option. */
  declare layout?: string;
  /** The window's inner height in px, from the window's `resize`. */
  declare viewportHeight: number;
  private resolved?: ResolvedConfig;
  private observer?: ResizeObserver;
  private renderedCompact = false;
  /** Whether the layout last rendered was compact because `auto` chose it: only that counts for the hysteresis. */
  private renderedAutoCompact = false;
  private renderedStroke: StrokeWidths = strokeWidths(undefined);
  private renderedDrawing = 0;
  private entityIds: string[] = [];
  private renderedHass?: HassLike;
  private readonly idPrefix = `ecogeo${String(++instances)}`;

  constructor() {
    super();
    this.width = 0;
    this.viewportHeight = window.innerHeight;
  }

  /**
   * True in a panel view: Home Assistant set `isPanel` (only when its card wrapper updates) or `layout = 'panel'` (its panel
   * view sets that on the card element, also when the card is rebuilt).
   */
  private get inPanel(): boolean {
    return this.isPanel === true || this.layout === 'panel';
  }

  private readonly onWindowResize = (): void => {
    if (this.inPanel && window.innerHeight !== this.viewportHeight) this.viewportHeight = window.innerHeight;
  };

  /** A CSS length custom property of the card in px (such as `56px`), or undefined when unset. */
  private cssPx(name: string): number | undefined {
    const value = Number.parseFloat(getComputedStyle(this).getPropertyValue(name));
    return Number.isFinite(value) ? value : undefined;
  }

  /** The drawing's width in px for an arrangement's viewBox: the card's width, or in a panel view what fits the window. */
  private drawingWidthFor(viewBox: { width: number; height: number }): number {
    return drawingWidth({
      isPanel: this.inPanel,
      cardWidth: this.width,
      // read directly: `viewportHeight` only triggers the update on a resize and can be stale when the card turns into a panel
      windowHeight: window.innerHeight,
      // outside a panel view no styles are read
      headerHeight: this.inPanel ? this.cssPx('--header-height') : undefined,
      safeAreaTop: this.inPanel ? this.cssPx('--safe-area-inset-top') : undefined,
      viewBox,
    });
  }

  /**
   * The width the layout is decided on: the drawing's width with the arrangement the full layout would show (the viewBox of
   * the configured detail level). The compact layout's arrangement is the simplified one, whose ratio gives a width at
   * least as large, so deciding on this width keeps the choice from depending on the choice (D9).
   */
  private layoutWidth(): number {
    return this.drawingWidthFor(arrangementFor(this.resolved?.detail ?? 'simplified', 'full').viewBox);
  }

  /**
   * The layout the card shows now: compact or full, from the `layout` option, the measured width and, with `auto`, the
   * layout it showed so far (the hysteresis of add-compact-layout D1).
   */
  get shownLayout(): 'compact' | 'full' {
    return nextCompact(
      this.resolved?.layout ?? 'auto',
      this.layoutWidth(),
      this.renderedAutoCompact,
      this.resolved?.detail ?? 'simplified',
    )
      ? 'compact'
      : 'full';
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.observer = new ResizeObserver((entries) => {
      const width = entries.at(-1)?.contentRect.width;
      // An observation whose width did not change is ignored, so a re-render that only changes the height cannot loop.
      if (width !== undefined && width !== this.width) this.width = width;
    });
    this.observer.observe(this);
    window.addEventListener('resize', this.onWindowResize);
    this.viewportHeight = window.innerHeight;
  }

  override disconnectedCallback(): void {
    this.observer?.disconnect();
    this.observer = undefined;
    window.removeEventListener('resize', this.onWindowResize);
    super.disconnectedCallback();
  }

  /** Called by Home Assistant with the card's config. Throws for an invalid config: HA shows its error card. */
  setConfig(config: CardConfig): void {
    const errors = configErrors(config);
    if (errors.length > 0) throw new Error(errors.join('; '));
    this.resolved = resolveConfig(config);
    this.entityIds = [...new Set(Object.values(this.resolved.entities).filter((id) => id !== undefined))];
    this.config = config;
  }

  /** Height in units of 50 px for the masonry layout (add-schematic-card D6). */
  getCardSize(): number {
    return 10;
  }

  /** Full width on the sections grid, at least 8 rows tall (add-schematic-card D6). */
  getGridOptions(): GridOptions {
    return { columns: 'full', rows: 'auto', min_rows: 8 };
  }

  protected override shouldUpdate(changed: PropertyValues): boolean {
    // A change of the card's width, the window's height, `isPanel` or `layout` alone renders only when it flips the layout or changes
    // the drawing's width or the stroke widths (add-compact-layout D1, D4; refine-simplified-layout D9).
    if (
      changed.size > 0 &&
      [...changed.keys()].every(
        (key) => key === 'width' || key === 'viewportHeight' || key === 'isPanel' || key === 'layout',
      )
    ) {
      const layout = this.shownLayout;
      const stroke = strokeWidths(this.drawingWidthFor(this.arrangementViewBox(layout)));
      return (
        (layout === 'compact') !== this.renderedCompact ||
        this.fittedWidth(layout) !== this.renderedDrawing ||
        stroke.pipe !== this.renderedStroke.pipe ||
        stroke.outline !== this.renderedStroke.outline
      );
    }
    return shouldRender(changed, this.hass, this.renderedHass, this.entityIds);
  }

  private arrangementViewBox(layout: ShownLayout): { width: number; height: number } {
    const compact = layout === 'compact';
    return arrangementFor(compact ? 'simplified' : (this.resolved?.detail ?? 'simplified'), layout).viewBox;
  }

  /** The `max-width` in px the drawing gets in a panel view (0: none, the drawing fills the card). */
  private fittedWidth(layout: ShownLayout): number {
    if (!this.inPanel || !(this.width > 0)) return 0;
    const width = this.drawingWidthFor(this.arrangementViewBox(layout));
    return width < this.width ? width : 0;
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
    const layout = this.shownLayout;
    const compact = layout === 'compact';
    this.renderedCompact = compact;
    this.renderedAutoCompact = compact && this.resolved?.layout === 'auto';
    const stroke = strokeWidths(this.drawingWidthFor(this.arrangementViewBox(layout)));
    this.renderedStroke = stroke;
    const fitted = this.fittedWidth(layout);
    this.renderedDrawing = fitted;
    const config = this.resolved;
    if (config === undefined) return html`<ha-card data-layout=${layout}><div class="diagram"></div></ha-card>`;
    // The compact layout draws the simplified detail level whatever `detail` says; the resolved config keeps the user's (D3).
    // It also leaves out the captions inside the drawing, which would render at about 4 px.
    const detail = compact ? 'simplified' : config.detail;
    const arrangement = arrangementFor(detail, layout);
    const { viewBox } = arrangement;
    const resolved: ResolvedConfig & Pick<DrawContext, 'captions' | 'arrangement'> = compact
      ? { ...config, detail, captions: false, arrangement }
      : { ...config, arrangement };
    const { readings, offline } = this.readings(resolved);
    const mode = deriveMode(readings, resolved.features, resolved.states);
    const circuits = circuitsFor(
      mode,
      resolved.features,
      resolved.dhw,
      readings,
      !resolved.notPresent.has('brine.pump'),
    );
    const states = resolved.sample ? SAMPLE_STATES : (this.hass?.states ?? {});
    const moving = animationReadings(readings, resolved.entities, states);
    const view: PipeView = { mode, circuits, readings: moving, stops: resolved.colors };
    const display = { locale: localeFromHass(this.hass), entities: this.hass?.entities, states };
    // Taps open more-info of the role's entity; the sample's entities do not exist, so they do nothing there.
    const onTap = resolved.sample
      ? undefined
      : (entityId: string): void => {
          fireMoreInfo(this, entityId);
        };
    const taps: Taps = { entities: resolved.entities, onTap };
    return html`<ha-card data-layout=${layout}>
      <div class="diagram" style=${fitted > 0 ? `max-width: ${String(fitted)}px; margin: 0 auto` : nothing}>
        <svg
          viewBox="0 0 ${viewBox.width} ${viewBox.height}"
          preserveAspectRatio="xMidYMid meet"
          role="group"
          aria-label=${SCHEMATIC_LABEL}
          style="--dhw-tank-color: ${resolved.dhw === 'unused' ? MUTED_COLOR : tankColor(view)}; --ecogeo-coil-muted: ${coilMutedColor(this.hass?.themes?.darkMode === true)}; --pipe-width: ${String(stroke.pipe)}; --outline-width: ${String(stroke.outline)}"
        >
          ${svg`${renderSource(resolved, moving, circuits.active.has('brine'), taps)}${renderDhw(resolved, taps)}${renderCabinet(resolved, view, taps, { mode: resolved.exchangerFill, idPrefix: this.idPrefix }, stroke.pipe)}`}
        </svg>
        ${renderLabels(labelsFor(resolved, readings, resolved.entities, display, compact, resolved.notPresent), onTap, viewBox)}
      </div>
      <div class="footer">
        <span class="mode">${MODE_LABELS[mode]}</span>
        ${renderFooterItems(footerItems(readings, resolved.entities, display, compact, resolved.notPresent), onTap)}
        ${isAlarm(readings['unit.alarm']) ? html`<span class="alarm">${INDICATIONS.alarm}</span>` : nothing}
        ${offline ? html`<span class="offline">${INDICATIONS.offline}</span>` : nothing}
        ${resolved.sample ? html`<span class="sample">${INDICATIONS.sampleValues}</span>` : nothing}
      </div>
    </ha-card>`;
  }
}

defineOnce(CARD_TAG, EcogeoCard);
