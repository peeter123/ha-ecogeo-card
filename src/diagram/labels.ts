// Value labels and the footer values (add-schematic-card D6, live-values spec). The labels are HTML overlaid on the SVG at
// percentage positions computed from viewBox coordinates (the pattern of hrv-ventilation src/diagram/labels.ts: HTML
// text over the drawing, so it stays crisp and selectable and taps work). Deviation from hrv: the labels' places are a table
// in the arrangement (label-places.ts: placed after the drawing's components from its zone constants), not a model derived from the config,
// and a tap opens more-info through `fireMoreInfo` (the callback the card passes in).
//
// Positions are viewBox points with an alignment: `start` puts the label's left edge at x, `end` its right edge,
// `middle` centres it; y is the vertical centre. They sit where the drawing leaves room (checked on the emulator
// captures): the cabinet's values in the lanes of its frame beside their parts (label-places.ts),
// the source's Out inside the air unit or the ground collector, the tank's values inside the external tank or,
// for model C, inside tank 50 above its coil (refine-schematic-drawing D8b). A label of a part that is not drawn is not shown (same rules as
// geometry.ts `partState`); a drawn label with no value shows a muted dash and keeps its place.
import { css, html, nothing, unsafeCSS, type TemplateResult } from 'lit';
import { formatReading, type DisplayContext } from '../calc/display';
import type { Mode } from '../calc/mode';
import type { Readings } from '../calc/readings';
import type { DhwStorage, Source } from '../config/options';
import type { RolePath } from '../config/roles';
import type { Features } from '../config/variants';
import { FOOTER_LABELS, NO_VALUE } from '../strings';
import { arrangementOf, partState, type DrawContext } from './geometry';
import { labelFontSize, type Align, type LabelSpec, type Placement } from './label-places';

export type { LabelSpec, Placement };

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
  /* One drawing unit is 1 cqw / 10 in the horizontal layout (viewBox 1000 wide) and 1 cqw / 7.4 in the vertical one (740 wide): the labels grow with the drawing above 770 px (horizontal) and 417 px (vertical), never below 10 px (LABEL_FONT_K). */
  .label {
    position: absolute;
    display: inline-flex;
    align-items: baseline;
    gap: 0.3em;
    padding: 0 0.15em;
    border-radius: 2px;
    font-size: ${unsafeCSS(labelFontSize('horizontal'))};
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
  .label.rotated {
    transform: translate(-50%, -50%) rotate(-90deg);
  }
  [data-layout='vertical'] .label {
    font-size: ${unsafeCSS(labelFontSize('vertical'))};
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

/** One label to show: its text (or none, for a missing value) and the entity a tap opens. */
export interface ShownLabel {
  id: string;
  role: RolePath;
  item?: number;
  x: number;
  y: number;
  align: Align;
  caption?: string;
  bare?: true;
  /** Turned by -90 degrees about its anchor (the vertical layout's values along vertical pipes). */
  rotate?: -90;
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
 * from display.ts, or the dash while its value is missing.
 * Inputs: the draw context (DHW storage, source, features), the readings, the roles' entity ids and the display context.
 */
export function labelsFor(
  context: DrawContext,
  readings: Readings,
  entities: Entities,
  display: DisplayContext,
  notPresent: ReadonlySet<RolePath> = ALL_PRESENT,
): ShownLabel[] {
  return arrangementOf(context).labels.specs.flatMap((label): ShownLabel[] => {
    // A role set to `none` is not present: no label at all, not even the dash (add-entity-discovery D7).
    if (notPresent.has(label.role)) return [];
    // An unused tank (dhw: unused) shows no values: its labels are left out, though its parts are drawn.
    if (partState(label, context) === 'hidden' || (context.dhw === 'unused' && label.dhw !== undefined)) return [];
    const entityId = entities[label.role];
    const { caption } = label;
    const place: Placement = { x: label.x, y: label.y, align: label.align };
    const common = {
      id: label.id,
      role: label.role,
      ...place,
      ...(label.bare === true ? { bare: true as const } : {}),
      ...(label.rotate === undefined ? {} : { rotate: label.rotate }),
      entityId,
      ...(label.item === undefined ? {} : { item: label.item }),
      ...(caption === undefined ? {} : { caption }),
    };
    const value: unknown = readings[label.role];
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
  /** The small text in front of the value, if any. */
  caption?: string;
  text: string;
  missing: boolean;
  entityId: string | undefined;
}

/** What the footer's power items and efficiency depend on besides the readings (add-htr-state D2, D4). */
export interface FooterInputs {
  /** The derived mode: it decides which power items show, and the efficiency's caption. */
  mode: Mode;
  /** The `htr` feature: the HTR item needs it `true`. */
  features: Pick<Features, 'htr'>;
  /** The outer-loop source: an air unit (`air`, `hybrid`) shows the outside temperature itself, so the footer drops it. */
  source: Source;
  /** The DHW storage: the HTR item needs a tank in use (`external` or `internal`). */
  dhw: DhwStorage;
  /** The roles set to `none`: an item whose roles are all in it is left out. */
  notPresent: ReadonlySet<RolePath>;
  /** The optional roles without an entity (`absentOptionalRoles`): their consumers take the fallback. */
  absent: ReadonlySet<RolePath>;
}

/**
 * The footer's values (the same in both layouts): the outside temperature (only with a ground source: an air unit shows
 * it on the drawing), the efficiency and the mode's power items
 * (add-htr-state D2): heating DG1 (`heating.power`, else `heating.capacity`) and HTR (`htr.power`), dhw DHW (`dhw.power`,
 * else `heating.capacity`), active_cooling Cooling (`cooling.capacity`) and HTR, no power item in any other mode. HTR
 * shows only with the feature `true`, a DHW tank in use and an `htr.power` entity, also at 0 W. The efficiency is
 * `unit.system_cop`, else `unit.cop` (an optional role without an entity, `absent`); 0 shows as a dash; the caption is
 * EER in active_cooling. The mode, the alarm and the
 * offline indication are texts of the card, not values. Inputs: the readings, the role entities, the display context,
 * `inputs` (mode, features, DHW storage, `notPresent`: roles set to `none`, `absent`: optional roles without an
 * entity). Pure.
 */
export function footerItems(
  readings: Readings,
  entities: Entities,
  display: DisplayContext,
  inputs: FooterInputs,
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
    inputs.source === 'ground'
      ? number('outside_temperature', 'source.outside_temperature', FOOTER_LABELS.outside)
      : undefined,
    efficiency,
    ...power,
  ];
  return items.filter((entry) => entry !== undefined);
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
      class="label ${label.align}${label.bare === true ? ' bare' : ''}${label.rotate === undefined ? '' : ' rotated'}"
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
