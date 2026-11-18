// Value labels and the footer values (add-schematic-card D6, live-values spec). The labels are HTML overlaid on the SVG at
// percentage positions computed from viewBox coordinates (the pattern of hrv-ventilation src/diagram/labels.ts: HTML
// text over the drawing, so it stays crisp and selectable and taps work). Deviation from hrv: the labels' places are a table
// in the arrangement (label-places.ts: placed after the drawing's components from its zone constants, a few key labels with a second place for the compact layout), not a model derived from the config,
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
import type { Mode } from '../calc/mode';
import type { Readings } from '../calc/readings';
import type { DhwStorage } from '../config/options';
import type { RolePath } from '../config/roles';
import type { Features } from '../config/variants';
import { DHW_LABELS, FOOTER_LABELS, HEATING_LABELS, NO_VALUE, ON_OFF_LABELS } from '../strings';
import { arrangementOf, partState, type DrawContext } from './geometry';
import { STACKED_CAPTIONS, type Align, type LabelSpec, type Placement, type Tier } from './label-places';

export type { LabelSpec, Placement, Tier };

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
  /* The compact layout shows few labels, so they can be larger and never drop below 10 px (add-compact-layout D5). */
  [data-layout='compact'] .label {
    font-size: max(10px, 1.6cqw);
  }
  [data-layout='compact'] .label.emphasis {
    font-size: max(11px, 1.9cqw);
  }
  [data-layout='compact'] .label .caption {
    font-size: 1em;
  }
  /* A caption on its own line above the value (STACKED_CAPTIONS): the label is two lines tall and as wide as the value. */
  .label.stacked {
    flex-direction: column;
    align-items: center;
    gap: 0;
  }
  .label.stacked.start {
    align-items: flex-start;
  }
  .label.stacked.end {
    align-items: flex-end;
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

/** One label to show: its text (or none, for a missing value) and the entity a tap opens. */
export interface ShownLabel {
  id: string;
  role: RolePath;
  item?: number;
  x: number;
  y: number;
  align: Align;
  caption?: string;
  /** The caption is on its own line above the value (compact only). */
  stacked?: true;
  emphasis: boolean;
  bare?: true;
  /** The value as text; the dash while the value is missing. */
  text: string;
  missing: boolean;
  /** The entity of the role, for the tap; undefined without one. */
  entityId: string | undefined;
}

type Entities = Readonly<Record<RolePath, string | undefined>>;

const ALL_PRESENT: ReadonlySet<RolePath> = new Set();

/**
 * The labels to show: those of parts that are drawn (the same rules as geometry.ts `partState`), each with its text
 * from display.ts, or the dash while its value is missing. The "Demand" label is shown only while its role is on.
 * Inputs: the draw context (DHW storage, source, features), the readings, the roles' entity ids and the display context;
 * with `compact` only the key labels (add-compact-layout D2).
 */
export function labelsFor(
  context: DrawContext,
  readings: Readings,
  entities: Entities,
  display: DisplayContext,
  compact = false,
  notPresent: ReadonlySet<RolePath> = ALL_PRESENT,
): ShownLabel[] {
  return arrangementOf(context).labels.specs.flatMap((label): ShownLabel[] => {
    if (compact && label.tier !== 'key') return [];
    // A role set to `none` is not present: no label at all, not even the dash (add-entity-discovery D7).
    if (notPresent.has(label.role)) return [];
    // An unused tank (dhw: unused) shows no values: its labels are left out, though its parts are drawn.
    if (partState(label, context) === 'hidden' || (context.dhw === 'unused' && label.dhw !== undefined)) return [];
    const entityId = entities[label.role];
    const compactPlace = compact ? label.compact : undefined;
    const caption = (compact ? label.compactCaption : undefined) ?? label.caption;
    const place: Placement = compactPlace ?? { x: label.x, y: label.y, align: label.align };
    const common = {
      id: label.id,
      role: label.role,
      ...place,
      emphasis: label.emphasis === true,
      // A label moved to its compact place no longer sits on tank 50's body, so it gets its plate back.
      ...(label.bare === true && compactPlace === undefined ? { bare: true as const } : {}),
      entityId,
      ...(label.item === undefined ? {} : { item: label.item }),
      ...(caption === undefined ? {} : { caption }),
      ...(compact && caption !== undefined && STACKED_CAPTIONS.has(label.id) ? { stacked: true as const } : {}),
    };
    const value: unknown = readings[label.role];
    if (label.demand === true) {
      const text = label.role === 'heating.demand' ? HEATING_LABELS.demand : DHW_LABELS.demand;
      return value === true ? [{ ...common, text, missing: false }] : [];
    }
    const text = formatReading(
      label.role,
      typeof value === 'number' || typeof value === 'boolean' ? value : undefined,
      entityId,
      display,
    );
    return [{ ...common, text: text ?? NO_VALUE, missing: text === undefined }];
  });
}

/** One value of the footer. */
export interface FooterItem {
  id: string;
  /** `key` items are the only ones the compact layout shows. */
  tier: Tier;
  /** The small text in front of the value, if any. */
  caption?: string;
  text: string;
  missing: boolean;
  entityId: string | undefined;
}

/** The footer items the compact layout keeps (add-compact-layout D2); the mode, the alarm and the offline indication are card texts that always show. */
const FOOTER_KEY_ITEMS: ReadonlySet<string> = new Set(['outside_temperature', 'cop']);

/** What the footer's power items and efficiency depend on besides the readings (add-htr-state D2, D4). */
export interface FooterInputs {
  /** The derived mode: it decides which power items show, and the efficiency's caption. */
  mode: Mode;
  /** The `htr` feature: the HTR item needs it `true`. */
  features: Pick<Features, 'htr'>;
  /** The DHW storage: the HTR item needs a tank in use (`external` or `internal`). */
  dhw: DhwStorage;
  /** The roles set to `none`: an item whose roles are all in it is left out. */
  notPresent: ReadonlySet<RolePath>;
  /** The optional roles without an entity (`absentOptionalRoles`): their consumers take the fallback. */
  absent: ReadonlySet<RolePath>;
}

/**
 * The footer's values: the on/off state, the season, the outside temperature, the efficiency and the mode's power items
 * (add-htr-state D2): heating DG1 (`heating.power`, else `heating.capacity`) and HTR (`htr.power`), dhw DHW (`dhw.power`,
 * else `heating.capacity`), active_cooling Cooling (`cooling.capacity`) and HTR, no power item in any other mode. HTR
 * shows only with the feature `true`, a DHW tank in use and an `htr.power` entity, also at 0 W. The efficiency is
 * `unit.system_cop`, else `unit.cop` (an optional role without an entity, `absent`); 0 shows as a dash; the caption is
 * EER in active_cooling. With `compact` only the key items (outside temperature, efficiency). The mode, the alarm and the
 * offline indication are texts of the card, not values. Inputs: the readings, the role entities, the display context,
 * `inputs` (mode, features, DHW storage, `notPresent`: roles set to `none`, `absent`: optional roles without an
 * entity) and `compact`. Pure.
 */
export function footerItems(
  readings: Readings,
  entities: Entities,
  display: DisplayContext,
  inputs: FooterInputs,
  compact = false,
): FooterItem[] {
  const { notPresent, absent } = inputs;
  // An item is built from its roles and left out (undefined) when every one of them is not present (`none`); the roles
  // are given here only, so a new footer item cannot escape the hiding. The tap opens the first role's entity.
  const item = (
    id: string,
    roles: readonly [RolePath, ...RolePath[]],
    caption: string | undefined,
    text: string | undefined,
  ): FooterItem | undefined =>
    roles.every((role) => notPresent.has(role))
      ? undefined
      : {
          id,
          tier: FOOTER_KEY_ITEMS.has(id) ? 'key' : 'detail',
          ...(caption === undefined ? {} : { caption }),
          text: text ?? NO_VALUE,
          missing: text === undefined,
          entityId: entities[roles[0]],
        };
  const textOf = (role: RolePath): string | undefined => {
    const value: unknown = readings[role];
    return formatReading(
      role,
      typeof value === 'number' || typeof value === 'boolean' ? value : undefined,
      entities[role],
      display,
    );
  };
  const number = (id: string, role: RolePath, caption: string): FooterItem | undefined =>
    item(id, [role], caption, textOf(role));
  /** The item of a role, or of its fallback role while the role has no entity. */
  const withFallback = (id: string, role: RolePath, fallback: RolePath, caption: string): FooterItem | undefined =>
    number(id, absent.has(role) ? fallback : role, caption);
  const onOff = readings['unit.on_off'];
  const season =
    readings['unit.summer'] === true
      ? FOOTER_LABELS.summer
      : readings['unit.winter'] === true
        ? FOOTER_LABELS.winter
        : undefined;
  // The efficiency: the system COP, else the register COP; 0 is no efficiency whichever role feeds it.
  const efficiencyRole: RolePath = absent.has('unit.system_cop') ? 'unit.cop' : 'unit.system_cop';
  const efficiency = item(
    'cop',
    [efficiencyRole],
    inputs.mode === 'active_cooling' ? FOOTER_LABELS.eer : FOOTER_LABELS.cop,
    readings[efficiencyRole] === 0 ? undefined : textOf(efficiencyRole),
  );
  const { mode } = inputs;
  const htr =
    (mode === 'heating' || mode === 'active_cooling') &&
    inputs.features.htr === true &&
    (inputs.dhw === 'external' || inputs.dhw === 'internal') &&
    !absent.has('htr.power')
      ? number('htr_power', 'htr.power', FOOTER_LABELS.htr)
      : undefined;
  const power =
    mode === 'heating'
      ? [withFallback('dg1_power', 'heating.power', 'heating.capacity', FOOTER_LABELS.dg1), htr]
      : mode === 'dhw'
        ? [withFallback('dhw_power', 'dhw.power', 'heating.capacity', FOOTER_LABELS.dhw)]
        : mode === 'active_cooling'
          ? [number('cooling_power', 'cooling.capacity', FOOTER_LABELS.cooling), htr]
          : [];
  const items = [
    item(
      'on_off',
      ['unit.on_off'],
      undefined,
      onOff === undefined
        ? undefined
        : typeof onOff === 'boolean'
          ? ON_OFF_LABELS[onOff ? 'on' : 'off']
          : (ON_OFF_LABELS[onOff.toLowerCase()] ?? onOff),
    ),
    item(
      'season',
      // The tap opens the summer entity while it reads on or the winter role is not present, else the winter one.
      readings['unit.summer'] === true || notPresent.has('unit.winter')
        ? ['unit.summer', 'unit.winter']
        : ['unit.winter', 'unit.summer'],
      undefined,
      season,
    ),
    number('outside_temperature', 'source.outside_temperature', FOOTER_LABELS.outside),
    efficiency,
    ...power,
  ];
  const present = items.filter((entry) => entry !== undefined);
  return compact ? present.filter((entry) => entry.tier === 'key') : present;
}

/** The position of a label in percent of the drawing's width and height. */
export const cssPosition = (
  label: Pick<ShownLabel, 'x' | 'y'>,
  viewBox: { width: number; height: number },
): { left: string; top: string } => ({
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
  viewBox: { width: number; height: number },
): TemplateResult {
  return html`${labels.map((label) => {
    const { left, top } = cssPosition(label, viewBox);
    return html`<span
      class="label ${label.align}${label.emphasis ? ' emphasis' : ''}${label.bare === true ? ' bare' : ''}${label.stacked === true ? ' stacked' : ''}"
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
