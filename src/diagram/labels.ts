// Value labels and the footer values (add-schematic-card D6, live-values spec). The labels are HTML overlaid on the SVG at
// percentage positions computed from viewBox coordinates (the pattern of hrv-ventilation src/diagram/labels.ts: HTML
// text over the drawing, so it stays crisp and selectable and taps work). Deviation from hrv: the labels are a fixed table of
// positions after the drawing's components (this card has no layout switch), not a model derived from the config,
// and a tap opens more-info through `fireMoreInfo` (the callback the card passes in).
//
// Positions are viewBox points with an alignment: `start` puts the label's left edge at x, `end` its right edge,
// `middle` centres it; y is the vertical centre. They sit where the drawing leaves room (checked on the emulator
// captures): the probe row's values below the discharge line, the compressor's stack inside the refrigerant loop,
// the source's values under the air unit and beside its ports and the ground loop's legs, the tank's values under the external tank or,
// for model C, inside tank 50 above its coil (refine-schematic-drawing D8b). A label of a part that is not drawn is not shown (same rules as
// geometry.ts `partState`); a drawn label with no value shows a muted dash and keeps its place.
import { css, html, nothing, type TemplateResult } from 'lit';
import { formatReading, type DisplayContext } from '../calc/display';
import type { Readings } from '../calc/readings';
import type { RolePath } from '../config/roles';
import { DHW_LABELS, FOOTER_LABELS, HEATING_LABELS, NO_VALUE, ON_OFF_LABELS, VALUE_CAPTIONS } from '../strings';
import {
  AIR_PORT_Y,
  AIR_UNIT,
  AIR_UNIT_WALL_X,
  EXTERNAL_TANK,
  GROUND_LINE_Y,
  GROUND_LOOP,
  INTERNAL_TANK,
  partState,
  viewBox,
  type DrawContext,
  type Visibility,
} from './geometry';

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
  .label.bare {
    background: none;
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

export interface LabelSpec extends Pick<Visibility, 'dhw' | 'source'> {
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
  /** No background plate: the label sits on a tinted body (the values inside tank 50). */
  bare?: true;
}

const spec = (
  id: string,
  role: RolePath,
  x: number,
  y: number,
  align: Align,
  extra: Partial<Omit<LabelSpec, 'id' | 'role' | 'x' | 'y' | 'align'>> = {},
): LabelSpec => ({ id, role, x, y, align, ...extra });

/** The external tank's values: centred under the tank, 22 units below its bottom. */
const EXT_TANK_X = EXTERNAL_TANK.x + EXTERNAL_TANK.width / 2;
const EXT_TANK_Y = EXTERNAL_TANK.y + EXTERNAL_TANK.height + 22;

/** Model C's tank values: the row's centre line, 12 units under the tank's top (the strip above coil 51 is ~34 tall). */
const INTERNAL_ROW_Y = INTERNAL_TANK.y + 12;
const INTERNAL_CENTRE_X = INTERNAL_TANK.x + INTERNAL_TANK.width / 2;

/** The air unit's fan and outside labels: the first 12 units under the housing, the second 13 below it. */
const AIR_LABELS_Y = AIR_UNIT.y + AIR_UNIT.height + 12;
/** The air unit's port labels: 6 units right of the housing's wall, 12 units under (top port) or above (bottom port) the port's pipe. */
const PORT_LABEL_X = AIR_UNIT_WALL_X + 6;
const PORT_LABEL_DY = 12;
/** The ground loop's labels: 20 units under the ground line, clear of its hatching. */
const GROUND_LABEL_DY = 20;

/** Every value label of the drawing. */
export const LABEL_SPECS: readonly LabelSpec[] = [
  // production: probes 33 and 34, pressure 38, pump 15, and the DG1 setpoint above connections 1/2
  spec('production_out', 'production.outlet_temperature', 237, 228, 'end', { item: 33 }),
  spec('production_in', 'production.return_temperature', 291, 247, 'middle', { item: 34 }),
  spec('production_pressure', 'production.pressure', 360, 537, 'end', { item: 38 }),
  spec('production_pump', 'production.pump', 396, 380, 'end', { item: 15 }),
  spec('dg1_setpoint', 'heating.setpoint', 291, 96, 'middle', { item: 1 }),
  spec('dg1_demand', 'heating.demand', 320, 123, 'start', { item: 1, demand: true }),
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
  // air unit (also in the hybrid): the fan and the outside air under the housing, the brine In and Out beside the two
  // ports on the housing's right (refine-schematic-drawing D14). The label of the top port hangs under its pipe, that of the bottom port
  // sits on its pipe, so the two stay between the pipes and clear of the production labels at the cabinet. Air: In at the
  // bottom port, Out at the top one. Hybrid (entered at the top): only In, at the top port; the air unit's Out and the ground loop's In would be the same value on the link pipe, which carries no label.
  spec('fan_speed', 'source.fan_speed', AIR_UNIT.fanX, AIR_LABELS_Y, 'middle', {
    source: ['air', 'hybrid'],
    caption: VALUE_CAPTIONS.fan,
  }),
  spec('outside_temperature', 'source.outside_temperature', AIR_UNIT.fanX, AIR_LABELS_Y + 13, 'middle', {
    source: ['air', 'hybrid'],
    caption: VALUE_CAPTIONS.outside,
  }),
  spec('air_unit_in', 'brine.outlet_temperature', PORT_LABEL_X, AIR_PORT_Y.bottom - PORT_LABEL_DY, 'start', {
    source: ['air'],
    caption: VALUE_CAPTIONS.portIn,
  }),
  spec('air_unit_out', 'source.air_unit_outlet_temperature', PORT_LABEL_X, AIR_PORT_Y.top + PORT_LABEL_DY, 'start', {
    source: ['air'],
    caption: VALUE_CAPTIONS.portOut,
  }),
  spec('hybrid_air_unit_in', 'brine.outlet_temperature', PORT_LABEL_X, AIR_PORT_Y.top + PORT_LABEL_DY, 'start', {
    source: ['hybrid'],
    caption: VALUE_CAPTIONS.portIn,
  }),
  // ground loop (refine-schematic-drawing D14): In (the brine entering it) right of the down leg and Out (the brine leaving it) left of
  // the up leg, both just under the ground line; in the hybrid only Out
  spec(
    'ground_in',
    'brine.outlet_temperature',
    GROUND_LOOP.downX + 6,
    GROUND_LINE_Y.ground + GROUND_LABEL_DY,
    'start',
    {
      source: ['ground'],
      caption: VALUE_CAPTIONS.portIn,
    },
  ),
  spec('ground_out', 'brine.inlet_temperature', GROUND_LOOP.upX - 6, GROUND_LINE_Y.ground + GROUND_LABEL_DY, 'end', {
    source: ['ground'],
    caption: VALUE_CAPTIONS.portOut,
  }),
  spec(
    'hybrid_ground_out',
    'brine.inlet_temperature',
    GROUND_LOOP.upX - 6,
    GROUND_LINE_Y.hybrid + GROUND_LABEL_DY,
    'end',
    {
      source: ['hybrid'],
      caption: VALUE_CAPTIONS.portOut,
    },
  ),
  // external tank: stacked under the tank (EXTERNAL_TANK)
  spec('tank_external_temperature', 'dhw.temperature', EXT_TANK_X, EXT_TANK_Y, 'middle', {
    dhw: 'external',
    emphasis: true,
  }),
  spec('tank_external_setpoint', 'dhw.setpoint', EXT_TANK_X, EXT_TANK_Y + 15, 'middle', {
    dhw: 'external',
    caption: VALUE_CAPTIONS.setpoint,
  }),
  spec('tank_external_start_delta', 'dhw.start_delta', EXT_TANK_X, EXT_TANK_Y + 29, 'middle', {
    dhw: 'external',
    caption: VALUE_CAPTIONS.startDelta,
  }),
  spec('tank_external_demand', 'dhw.demand', EXT_TANK_X, EXT_TANK_Y + 43, 'middle', { dhw: 'external', demand: true }),
  // model C: one row inside tank 50, in the strip above coil 51: three labels centred at one sixth, one half and five
  // sixths of the tank's width (even gaps), at the normal label size, with no background plate and with short
  // captions; the demand text goes on a second line under the row. The labels have a minimum font size, so on cards
  // narrower than about 560 px while the demand line shows (about 510 px for the three values alone) they grow relative to the drawing and start to touch: narrower cards are left to the
  // compact layout (add-compact-layout).
  spec(
    'tank_internal_temperature',
    'dhw.temperature',
    INTERNAL_TANK.x + INTERNAL_TANK.width / 6,
    INTERNAL_ROW_Y,
    'middle',
    {
      dhw: 'internal',
      bare: true,
    },
  ),
  spec('tank_internal_setpoint', 'dhw.setpoint', INTERNAL_CENTRE_X, INTERNAL_ROW_Y, 'middle', {
    dhw: 'internal',
    caption: VALUE_CAPTIONS.setpointShort,
    bare: true,
  }),
  spec(
    'tank_internal_start_delta',
    'dhw.start_delta',
    INTERNAL_TANK.x + (INTERNAL_TANK.width * 5) / 6,
    INTERNAL_ROW_Y,
    'middle',
    {
      dhw: 'internal',
      caption: VALUE_CAPTIONS.startDeltaShort,
      bare: true,
    },
  ),
  spec('tank_internal_demand', 'dhw.demand', INTERNAL_CENTRE_X, INTERNAL_ROW_Y + 13, 'middle', {
    dhw: 'internal',
    demand: true,
    bare: true,
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
  bare?: true;
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
      ...(label.bare === true ? { bare: true as const } : {}),
      entityId,
      ...(label.item === undefined ? {} : { item: label.item }),
      ...(label.caption === undefined ? {} : { caption: label.caption }),
    };
    const value: unknown = readings[label.role];
    if (label.demand === true) {
      const text = label.role === 'heating.demand' ? HEATING_LABELS.demand : DHW_LABELS.demand;
      return value === true ? [{ ...common, text, missing: false }] : [];
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
      class="label ${label.align}${label.emphasis ? ' emphasis' : ''}${label.bare === true ? ' bare' : ''}"
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
