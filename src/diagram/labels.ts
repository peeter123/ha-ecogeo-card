// Value labels and the footer values (design D6, live-values spec). The labels are HTML overlaid on the SVG at
// percentage positions computed from viewBox coordinates (the pattern of hrv-ventilation src/diagram/labels.ts: HTML
// text over the drawing, so it stays crisp and selectable and taps work). Deviation from hrv: the labels are a fixed table of
// positions after the drawing's components (this card has no layout switch), not a model derived from the config,
// and a tap opens more-info through `fireMoreInfo` (the callback the card passes in).
//
// Positions are viewBox points with an alignment: `start` puts the label's left edge at x, `end` its right edge,
// `middle` centres it; y is the vertical centre. They sit where the drawing leaves room (checked on the emulator
// captures): the probe row's values below the discharge line, the compressor's stack inside the refrigerant loop,
// the source's values under the air unit and right of the collector, the tank's values under the external tank or,
// for model C, in the empty DHW zone (design D6). A label of a part that is not drawn is not shown (same rules as
// geometry.ts `partState`); a drawn label with no value shows a muted dash and keeps its place.
import { css, html, nothing, type TemplateResult } from 'lit';
import { formatReading, type DisplayContext } from '../calc/display';
import type { Readings } from '../calc/readings';
import type { RolePath } from '../config/roles';
import { DHW_LABELS, FOOTER_LABELS, NO_VALUE, ON_OFF_LABELS, VALUE_CAPTIONS } from '../strings';
import { partState, viewBox, type DrawContext, type Visibility } from './geometry';

export const labelStyles = css`
  .diagram {
    position: relative;
    container-type: inline-size;
  }
  .diagram svg {
    display: block;
    width: 100%;
    height: auto;
  }
  /* One drawing unit is 1 cqw / 10: the labels grow and shrink with the drawing, never below 8 px. */
  .label {
    position: absolute;
    display: inline-flex;
    align-items: baseline;
    gap: 0.3em;
    padding: 0 0.15em;
    border-radius: 2px;
    font-size: max(8px, 0.95cqw);
    line-height: 1.2;
    white-space: nowrap;
    color: var(--primary-text-color);
    background: color-mix(in srgb, var(--card-background-color, #fff) 80%, transparent);
    transform: translate(-50%, -50%);
  }
  .label.start {
    transform: translate(0, -50%);
  }
  .label.end {
    transform: translate(-100%, -50%);
  }
  .label.emphasis {
    font-size: max(9px, 1.2cqw);
    font-weight: 600;
  }
  .caption {
    color: var(--secondary-text-color);
    font-size: 0.85em;
  }
  .value {
    margin: 0;
    padding: 0;
    border: 0;
    background: none;
    font: inherit;
    color: inherit;
  }
  button.value {
    cursor: pointer;
  }
  .value.missing {
    color: var(--disabled-text-color);
  }
  .footer-item {
    display: inline-flex;
    gap: 0.3em;
    align-items: baseline;
  }
`;

type Align = 'start' | 'middle' | 'end';

export interface LabelSpec extends Pick<Visibility, 'feature' | 'dhw' | 'source'> {
  /** A unique id, also the `data-label` of the element. */
  id: string;
  role: RolePath;
  /** The manual item the value belongs to; 1 stands for connections 1/2. */
  item?: number;
  x: number;
  y: number;
  align: Align;
  /** A small text in front of the value, where its position alone would not say what it is. */
  caption?: string;
  /** The label shows "Demand" while the (binary) role is on, and nothing otherwise. */
  demand?: true;
  /** Larger text: the tank temperature. */
  emphasis?: true;
}

const spec = (
  id: string,
  role: RolePath,
  x: number,
  y: number,
  align: Align,
  extra: Partial<Omit<LabelSpec, 'id' | 'role' | 'x' | 'y' | 'align'>> = {},
): LabelSpec => ({ id, role, x, y, align, ...extra });

const TANK_X = 895;

/** Every value label of the drawing. */
export const LABEL_SPECS: readonly LabelSpec[] = [
  // production: probes 33 and 34, pressure 38, pump 15, and the DG1 setpoint above connections 1/2
  spec('production_out', 'production.outlet_temperature', 237, 228, 'end', { item: 33 }),
  spec('production_in', 'production.return_temperature', 291, 247, 'middle', { item: 34 }),
  spec('production_pressure', 'production.pressure', 360, 537, 'end', { item: 38 }),
  spec('production_pump', 'production.pump', 396, 380, 'end', { item: 15 }),
  spec('dg1_setpoint', 'heating.setpoint', 291, 96, 'middle', { item: 1 }),
  // brine: probes 31 and 32, pressure 37, pump 16
  spec('brine_out', 'brine.outlet_temperature', 633, 247, 'start', { item: 31 }),
  spec('brine_in', 'brine.inlet_temperature', 697, 247, 'start', { item: 32 }),
  spec('brine_pressure', 'brine.pressure', 689, 459, 'start', { item: 37 }),
  spec('brine_pump', 'brine.pump', 676, 300, 'end', { item: 16 }),
  // refrigerant: temperatures 30 and 29 and pressures 36 and 35 below the discharge and suction lines, the compressor's
  // three values inside the loop, the expansion valve's, and the condensation (8) and evaporation (7) temperatures
  spec('discharge_temperature', 'compressor.discharge_temperature', 436, 262, 'start', { item: 30 }),
  spec('discharge_pressure', 'compressor.discharge_pressure', 480, 275, 'middle', { item: 36 }),
  spec('suction_temperature', 'compressor.suction_temperature', 528, 262, 'start', { item: 29 }),
  spec('suction_pressure', 'compressor.suction_pressure', 570, 275, 'middle', { item: 35 }),
  spec('compressor_speed', 'compressor.speed', 503, 308, 'middle', { item: 11 }),
  spec('compressor_percentage', 'compressor.percentage', 503, 319, 'middle', { item: 11 }),
  spec('compressor_power', 'compressor.power', 503, 330, 'middle', { item: 11 }),
  spec('superheat', 'refrigerant.superheat', 527, 376, 'middle', { item: 12 }),
  spec('expansion_valve', 'refrigerant.expansion_valve', 527, 388, 'middle', { item: 12 }),
  spec('condensation_temperature', 'refrigerant.condensation_temperature', 432, 437, 'middle', { item: 8 }),
  spec('evaporation_temperature', 'refrigerant.evaporation_temperature', 572, 437, 'middle', { item: 7 }),
  // air unit (also in the hybrid): the fan, the outside air and the brine at the unit's outlet, under the housing
  spec('fan_speed', 'source.fan_speed', 115, 312, 'middle', { source: ['air', 'hybrid'], caption: VALUE_CAPTIONS.fan }),
  spec('outside_temperature', 'source.outside_temperature', 115, 325, 'middle', {
    source: ['air', 'hybrid'],
    caption: VALUE_CAPTIONS.outside,
  }),
  spec('air_unit_outlet', 'source.air_unit_outlet_temperature', 115, 338, 'middle', {
    source: ['air', 'hybrid'],
    caption: VALUE_CAPTIONS.airOutlet,
  }),
  // ground loop, right of the collector: the brine out and in; in the hybrid only its exit
  spec('ground_out', 'brine.outlet_temperature', 158, 203, 'start', {
    source: ['ground'],
    caption: VALUE_CAPTIONS.groundOut,
  }),
  spec('ground_in', 'brine.inlet_temperature', 158, 290, 'start', {
    source: ['ground'],
    caption: VALUE_CAPTIONS.groundIn,
  }),
  spec('hybrid_ground_in', 'brine.inlet_temperature', 158, 480, 'start', {
    source: ['hybrid'],
    caption: VALUE_CAPTIONS.groundIn,
  }),
  // external tank: under the tank (y 340-420); model C: in the empty DHW zone (x 800-990, y 140-230)
  ...(['external', 'internal'] as const).flatMap((dhw) => {
    const y = dhw === 'external' ? 352 : 152;
    return [
      spec(`tank_${dhw}_temperature`, 'dhw.temperature', TANK_X, y, 'middle', { dhw, emphasis: true }),
      spec(`tank_${dhw}_setpoint`, 'dhw.setpoint', TANK_X, y + 15, 'middle', { dhw, caption: VALUE_CAPTIONS.setpoint }),
      spec(`tank_${dhw}_start_delta`, 'dhw.start_delta', TANK_X, y + 29, 'middle', {
        dhw,
        caption: VALUE_CAPTIONS.startDelta,
      }),
      spec(`tank_${dhw}_demand`, 'dhw.demand', TANK_X, y + 43, 'middle', { dhw, demand: true }),
    ];
  }),
];

/** One label to show: its text (or none, for a missing value) and the entity a tap opens. */
export interface ShownLabel {
  id: string;
  role: RolePath;
  item?: number;
  x: number;
  y: number;
  align: Align;
  caption?: string;
  emphasis: boolean;
  /** The value as text; the dash while the value is missing. */
  text: string;
  missing: boolean;
  /** The entity of the role, for the tap; undefined without one. */
  entityId: string | undefined;
}

type Entities = Readonly<Record<RolePath, string | undefined>>;

/**
 * The labels to show: those of parts that are drawn (the same rules as geometry.ts `partState`), each with its text
 * from display.ts, or the dash while its value is missing. The "Demand" label is shown only while its role is on.
 * Inputs: the draw context (DHW storage, source, features), the readings, the roles' entity ids and the display context.
 */
export function labelsFor(
  context: DrawContext,
  readings: Readings,
  entities: Entities,
  display: DisplayContext,
): ShownLabel[] {
  return LABEL_SPECS.flatMap((label): ShownLabel[] => {
    if (partState(label, context) === 'hidden') return [];
    const entityId = entities[label.role];
    const common = {
      id: label.id,
      role: label.role,
      x: label.x,
      y: label.y,
      align: label.align,
      emphasis: label.emphasis === true,
      entityId,
      ...(label.item === undefined ? {} : { item: label.item }),
      ...(label.caption === undefined ? {} : { caption: label.caption }),
    };
    const value: unknown = readings[label.role];
    if (label.demand === true) {
      return value === true ? [{ ...common, text: DHW_LABELS.demand, missing: false }] : [];
    }
    const text = formatReading(label.role, typeof value === 'number' ? value : undefined, entityId, display);
    return [{ ...common, text: text ?? NO_VALUE, missing: text === undefined }];
  });
}

/** One value of the footer. */
export interface FooterItem {
  id: string;
  /** The small text in front of the value, if any. */
  caption?: string;
  text: string;
  missing: boolean;
  entityId: string | undefined;
}

/**
 * The footer's values: the on/off state, the season, the outside temperature, the COP and the condensation and
 * evaporation capacity. The mode, the alarm and the offline indication are texts of the card, not values.
 */
export function footerItems(readings: Readings, entities: Entities, display: DisplayContext): FooterItem[] {
  const item = (id: string, role: RolePath, caption: string | undefined, text: string | undefined): FooterItem => ({
    id,
    ...(caption === undefined ? {} : { caption }),
    text: text ?? NO_VALUE,
    missing: text === undefined,
    entityId: entities[role],
  });
  const number = (id: string, role: RolePath, caption?: string): FooterItem => {
    const value: unknown = readings[role];
    return item(
      id,
      role,
      caption,
      formatReading(role, typeof value === 'number' ? value : undefined, entities[role], display),
    );
  };
  const onOff = readings['unit.on_off'];
  const season =
    readings['unit.summer'] === true
      ? FOOTER_LABELS.summer
      : readings['unit.winter'] === true
        ? FOOTER_LABELS.winter
        : undefined;
  return [
    item(
      'on_off',
      'unit.on_off',
      undefined,
      onOff === undefined ? undefined : (ON_OFF_LABELS[onOff.toLowerCase()] ?? onOff),
    ),
    item('season', readings['unit.summer'] === true ? 'unit.summer' : 'unit.winter', undefined, season),
    number('outside_temperature', 'source.outside_temperature', FOOTER_LABELS.outside),
    number('cop', 'unit.cop', FOOTER_LABELS.cop),
    number('condensation_capacity', 'heating.capacity', FOOTER_LABELS.condensation),
    number('evaporation_capacity', 'cooling.capacity', FOOTER_LABELS.evaporation),
  ];
}

/** The position of a label in percent of the drawing's width and height. */
export const positionOf = (label: Pick<ShownLabel, 'x' | 'y'>): { left: string; top: string } => ({
  left: `${String((label.x / viewBox.width) * 100)}%`,
  top: `${String((label.y / viewBox.height) * 100)}%`,
});

/** The value text: a button that opens more-info when the role has an entity and the card is not in sample mode. */
function value(
  entityId: string | undefined,
  text: string,
  missing: boolean,
  onTap: ((entityId: string) => void) | undefined,
): TemplateResult {
  const className = missing ? 'value missing' : 'value';
  return entityId === undefined || onTap === undefined
    ? html`<span class=${className}>${text}</span>`
    : html`<button
        class=${className}
        type="button"
        @click=${() => {
          onTap(entityId);
        }}
      >
        ${text}
      </button>`;
}

/** The HTML labels over the drawing; `onTap` is undefined where taps do nothing (sample mode). */
export function renderLabels(
  labels: readonly ShownLabel[],
  onTap: ((entityId: string) => void) | undefined,
): TemplateResult {
  return html`${labels.map((label) => {
    const { left, top } = positionOf(label);
    return html`<span
      class="label ${label.align}${label.emphasis ? ' emphasis' : ''}"
      data-label=${label.id}
      data-role=${label.role}
      data-label-item=${label.item ?? nothing}
      style="left: ${left}; top: ${top}"
      >${label.caption === undefined ? nothing : html`<span class="caption">${label.caption}</span>`}${value(label.entityId, label.text, label.missing, onTap)}</span
    >`;
  })}`;
}

/** The footer's values. */
export function renderFooterItems(
  items: readonly FooterItem[],
  onTap: ((entityId: string) => void) | undefined,
): TemplateResult {
  return html`${items.map(
    (item) =>
      html`<span class="footer-item" data-footer=${item.id}
        >${item.caption === undefined ? nothing : html`<span class="caption">${item.caption}</span>`}${value(item.entityId, item.text, item.missing, onTap)}</span
      >`,
  )}`;
}
