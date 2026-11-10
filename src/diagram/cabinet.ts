// The cabinet (design D5, D6; schematic-drawing spec): the outline, the six connections on the top edge with their
// item numbers and circuit labels, every internal component as a symbol with its item number, and every pipe segment
// in the neutral colour. Colour and animation by temperature and flow come in group 6. Valve positions come from
// circuits.ts; a feature that is `false` removes its parts (geometry.ts), `unused` draws them muted.
import { css, svg, type SVGTemplateResult } from 'lit';
import type { Circuits } from '../calc/circuits';
import { CIRCUIT_LABELS } from '../strings';
import {
  CABINET,
  CIRCUIT_LABELS as LABEL_POSITIONS,
  INTERNAL_TANK_SLOT,
  drawnComponents,
  drawnSegments,
  gapsIn,
  partState,
  pathData,
  type Component,
  type DrawContext,
} from './geometry';
import { symbol, type ValvePort } from './symbols';

export const cabinetStyles = css`
  .outline {
    fill: none;
    stroke: var(--primary-text-color);
    stroke-width: 2;
  }
  .tank-slot {
    fill: none;
    stroke: var(--divider-color);
    stroke-dasharray: 4 4;
  }
  .pipe {
    fill: none;
    stroke: var(--secondary-text-color);
    stroke-width: 2;
    stroke-linejoin: round;
  }
  .pipe.muted {
    stroke: var(--disabled-text-color);
  }
  .symbol-group {
    color: var(--primary-text-color);
  }
  .symbol-group.muted {
    color: var(--disabled-text-color);
  }
  .item {
    fill: var(--secondary-text-color);
    font-size: 9px;
  }
  .circuit-label {
    fill: var(--primary-text-color);
    font-size: 11px;
    font-weight: 500;
  }
`;

/** The open ports of a three-way valve (frame of its symbol, see symbols.ts) for the position from circuits.ts. */
function openPorts(item: number, circuits: Circuits): readonly ValvePort[] {
  if (item === 26) return circuits.valve26 === 'dhw' ? ['l', 'd'] : ['l', 'r'];
  return circuits.valves2728 === 'exchanger' ? ['d', 'r'] : ['l', 'r'];
}

function component(entry: { part: Component; state: 'normal' | 'muted' }, circuits: Circuits): SVGTemplateResult {
  const { part } = entry;
  if (part.kind === 'coil_slot') return svg``;
  const [dx, dy, anchor] = part.tag;
  return svg`<g class="symbol-group ${entry.state}" data-item=${part.item} data-kind=${part.kind}>
    <g transform="translate(${part.x} ${part.y})">${symbol(part.kind, {
      rotation: part.rotation,
      size: part.size,
      open: part.kind === 'valve3' ? openPorts(part.item, circuits) : undefined,
      reversed: part.kind === 'inversion_valve' ? circuits.valve14 === 'reversed' : undefined,
    })}</g>
    <text class="item" x=${part.x + dx} y=${part.y + dy} text-anchor=${anchor ?? 'start'}>${part.item}</text>
  </g>`;
}

/** The cabinet as SVG content for the card's viewBox: no images, only paths, symbols and text. */
export function renderCabinet(context: DrawContext, circuits: Circuits): SVGTemplateResult {
  const segments = drawnSegments(context);
  const ids = new Set(segments.map((entry) => entry.part.id));
  const slot = INTERNAL_TANK_SLOT;
  return svg`<g class="cabinet">
    <rect class="outline" x=${CABINET.x} y=${CABINET.y} width=${CABINET.width} height=${CABINET.height} rx="6" />
    ${context.dhw === 'internal' ? svg`<rect class="tank-slot" x=${slot.x} y=${slot.y} width=${slot.width} height=${slot.height} rx="8" />` : svg``}
    ${LABEL_POSITIONS.filter((label) => partState(label, context) !== 'hidden').map(
      (label) =>
        svg`<text class="circuit-label" x=${label.x} y=${label.y} text-anchor="middle">${CIRCUIT_LABELS[label.key]}</text>`,
    )}
    ${segments.map(
      (entry) =>
        svg`<path class="pipe ${entry.state}" data-segment=${entry.part.id} d=${pathData(entry.part.points, gapsIn(entry.part.id, ids))} />`,
    )}
    ${drawnComponents(context).map((entry) => component(entry, circuits))}
  </g>`;
}
