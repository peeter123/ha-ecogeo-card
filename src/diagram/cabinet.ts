// The cabinet (design D5, D6; schematic-drawing spec): the outline, the connections on the top edge (1-6, and 47-49
// on model C) with their item numbers and circuit labels, every internal component as a symbol with its item number
// (model C's tank 50-54 included), and every pipe segment of the drawing, the source's and the external DHW tank's
// pipes outside the cabinet too, coloured by temperature and animated by flow
// (pipes.ts). Valve positions come from circuits.ts; a feature that is `false` removes its parts (geometry.ts), `unused` draws them muted.
import { css, nothing, svg, type SVGTemplateResult } from 'lit';
import { CIRCUIT_LABELS } from '../strings';
import {
  CABINET,
  CIRCUIT_LABELS as LABEL_POSITIONS,
  drawnComponents,
  drawnSegments,
  gapsIn,
  partState,
  pathData,
  type Component,
  type DrawContext,
  type Point,
  type Segment,
} from './geometry';
import { coilColor, pipeState, shownState, type PipeView } from './pipes';
import { symbol, type ValvePort } from './symbols';

export const cabinetStyles = css`
  .outline {
    fill: none;
    stroke: var(--primary-text-color);
    stroke-width: 2;
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
  /* The dash overlay of an active pipe: dashes in the card colour run along it in the direction of the flow. */
  .flow {
    fill: none;
    stroke: var(--card-background-color, #fff);
    stroke-opacity: 0.55;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-dasharray: 2 12;
    animation: flow-dash var(--flow-duration, 2s) linear infinite;
  }
  .flow.reversed {
    animation-direction: reverse;
  }
  @keyframes flow-dash {
    to {
      stroke-dashoffset: -14;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .flow {
      animation: none;
    }
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
    font-size: 10px;
    font-weight: 500;
  }
`;

/** The open ports of a three-way valve (frame of its symbol, see symbols.ts) for the position from circuits.ts. */
function openPorts(item: number, circuits: PipeView['circuits']): readonly ValvePort[] {
  if (item === 26) return circuits.valve26 === 'dhw' ? ['l', 'd'] : ['l', 'r'];
  return circuits.valves2728 === 'exchanger' ? ['d', 'r'] : ['l', 'r'];
}

function component(entry: { part: Component; state: 'normal' | 'muted' }, view: PipeView): SVGTemplateResult {
  const { part } = entry;
  const { circuits } = view;
  const state = shownState(part, entry.state, view.mode);
  const [dx, dy, anchor] = part.tag;
  return svg`<g class="symbol-group ${state}" data-item=${part.item} data-kind=${part.kind} style=${part.kind === 'coil' ? `color: ${coilColor(view)}` : nothing}>
    <g transform="translate(${part.x} ${part.y})">${symbol(part.kind, {
      rotation: part.rotation,
      size: part.size,
      open: part.kind === 'valve3' ? openPorts(part.item, circuits) : undefined,
      reversed: part.kind === 'inversion_valve' ? circuits.valve14 === 'reversed' : undefined,
    })}</g>
    <text class="item" x=${part.x + dx} y=${part.y + dy} text-anchor=${anchor ?? 'start'}>${part.item}</text>
  </g>`;
}

/** One pipe: the base stroke in its colour (or muted) and, while it flows, the dash overlay. */
function pipe(
  segment: Segment,
  geometryState: 'normal' | 'muted',
  view: PipeView,
  gaps: readonly Point[],
): SVGTemplateResult {
  const state = pipeState(segment, geometryState, view);
  const d = pathData(segment.points, gaps);
  return svg`<path class="pipe ${state.muted ? 'muted' : ''}" data-segment=${segment.id} style=${state.muted ? nothing : `stroke: ${state.color}`} d=${d} />${
    state.animated
      ? svg`<path class="flow ${state.reversed ? 'reversed' : ''}" data-flow=${segment.id} style="--flow-duration: ${String(state.duration)}s" d=${d} />`
      : nothing
  }`;
}

/** The cabinet as SVG content for the card's viewBox: no images, only paths, symbols and text. */
export function renderCabinet(context: DrawContext, view: PipeView): SVGTemplateResult {
  const segments = drawnSegments(context);
  const ids = new Set(segments.map((entry) => entry.part.id));
  return svg`<g class="cabinet">
    <rect class="outline" x=${CABINET.x} y=${CABINET.y} width=${CABINET.width} height=${CABINET.height} rx="6" />
    ${LABEL_POSITIONS.filter((label) => partState(label, context) !== 'hidden').map(
      (label) =>
        svg`<text class="circuit-label" x=${label.x} y=${label.y} text-anchor="middle">${CIRCUIT_LABELS[label.key]}</text>`,
    )}
    ${segments.map((entry) => pipe(entry.part, entry.state, view, gapsIn(entry.part.id, ids)))}
    ${drawnComponents(context).map((entry) => component(entry, view))}
  </g>`;
}
