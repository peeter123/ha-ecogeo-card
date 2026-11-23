// The heat emitter (rework-layouts D5; heating-emitter spec): the underfloor loop or the radiator of the DG1 heating circuit,
// drawn in the band's first slot over connections 1/2. This file draws the body and the loop; the supply and return pipes (port 1
// up through the join lane into the body, and from it down to port 2) are the segments `dg1_sup` and `dg1_ret` of the DG1 production
// circuit in geometry.ts, so pipes.ts colours and animates them like every other pipe, and activity follows the circuit without
// logic of its own. The emitter is not a manual item: it is outside the unit (the manual's figures stop at connections 1 and 2),
// so it cites no item number; its tooltip names it.
//
// Colouring: the supply pipe takes production outlet 33 and the return pipe production return 34. The underfloor loop is one path
// stroked with a vertical gradient from the supply colour (the first, top pass: the inlet) to the return colour (the last, bottom
// pass: the outlet), whatever `exchanger_fill` says; the radiator's body is filled with the same gradient from its top to its
// bottom when `exchanger_fill` is `gradient`, and has no fill otherwise. Idle (the circuit inactive, or no probe value) the body, loop
// and fill are muted like the pipes. The dash overlay on the loop follows the supply pipe's flow.
//
// The body shows no demand caption. The body registers
// its columns with `data-obstacle` so that the overlap check sees them. The body is a button for the demand's more-info.
import { css, nothing, svg, type SVGTemplateResult } from 'lit';
import { EMITTER_NAMES } from '../strings';
import { MUTED_COLOR } from './colors';
import { EMITTER_ROLE, focusRingStyles, tapBindings, tapTarget, type Taps } from './component-info';
import { BAND, arrangementOf, isSegmentActive, roundedPathData, type DrawContext, type EmitterShape } from './geometry';
import type { FillOptions } from './cabinet';
import { pipeState, type PipeView } from './pipes';
import { obstacle } from './obstacle';

export const emitterStyles = css`
  .emitter-outline {
    stroke: var(--primary-text-color);
  }
  .emitter-column {
    fill: none;
    stroke: var(--primary-text-color);
    stroke-opacity: 0.6;
    stroke-width: calc(var(--outline-width, 2) * 0.75);
  }
  /* The circuit is inactive: the body, its lines and its columns are muted like the pipes. */
  .emitter.muted .emitter-outline,
  .emitter.muted .emitter-column {
    stroke: var(--disabled-text-color);
  }
  .emitter[role='button'] {
    cursor: pointer;
  }
  .emitter[role='button']:focus-visible {
    ${focusRingStyles}
  }
`;

/** The opacity of the radiator's fill: low enough that the columns stay readable (as the exchangers' fills). */
const RADIATOR_FILL_OPACITY = 0.5;

/** The body of the emitter: outline (with the gradient fill of a radiator), the radiator's columns, and the loop. */
function body(
  shape: EmitterShape,
  paints: { gradient: string; muted: boolean },
  loopPath: string,
  fillRadiator: boolean,
  animated: { duration: number } | undefined,
): SVGTemplateResult {
  const { x, y, width, height } = shape;
  const radiator = shape.kind === 'radiator';
  const loopStyle = paints.muted ? nothing : `stroke: url(#${paints.gradient})`;
  return svg`<rect class="emitter-outline band-outline" x=${x} y=${y} width=${width} height=${height} rx=${BAND.radius} fill=${radiator && fillRadiator ? `url(#${paints.gradient})` : 'none'} fill-opacity=${RADIATOR_FILL_OPACITY} />
    ${
      radiator
        ? svg`${shape.columns.map((column) => svg`<rect class="emitter-column" x=${column.x} y=${column.y} width=${column.width} height=${column.height} rx="4" />`)}${obstacle(
            'radiator-columns',
            {
              x: shape.columns[0]?.x ?? x,
              y: shape.columns[0]?.y ?? y,
              width: (shape.columns.at(-1)?.x ?? x) + (shape.columns.at(-1)?.width ?? 0) - (shape.columns[0]?.x ?? x),
              height: shape.columns[0]?.height ?? 0,
            },
          )}`
        : svg`<path class="pipe${paints.muted ? ' muted' : ''}" data-emitter-loop style=${loopStyle} stroke-linecap="round" d=${loopPath} />${
            animated === undefined
              ? nothing
              : svg`<path class="flow" data-flow="dg1_loop" style="--flow-duration: ${String(animated.duration)}s" d=${loopPath} />`
          }`
    }`;
}

/**
 * The emitter for the config: nothing for `emitter: none` (the stubs are segments). Needs the pipe view for the supply and
 * return colours, and the fill options for the radiator's fill and the ids of the card's gradients.
 */
export function renderEmitter(
  context: DrawContext,
  view: PipeView,
  taps: Taps | undefined,
  fill: FillOptions,
): SVGTemplateResult {
  const arrangement = arrangementOf(context);
  const shape = arrangement.emitter;
  const supply = arrangement.segments.find((segment) => segment.id === 'dg1_sup');
  const back = arrangement.segments.find((segment) => segment.id === 'dg1_ret');
  if (shape === undefined || supply === undefined || back === undefined) return svg``;
  const from = pipeState(supply, 'normal', view);
  const to = pipeState(back, 'normal', view);
  const active = isSegmentActive(supply, view.circuits);
  const muted = from.muted && to.muted;
  const gradient = `${fill.idPrefix}-emitter`;
  const radiator = shape.kind === 'radiator';
  // the underfloor gradient spans the first to the last pass, the radiator's the whole body
  const top = radiator ? shape.y : (shape.passes[0] ?? shape.y);
  const bottom = radiator ? shape.y + shape.height : (shape.passes.at(-1) ?? shape.y + shape.height);
  const tap = tapBindings(tapTarget(EMITTER_ROLE, taps), taps?.onTap);
  const name = EMITTER_NAMES[shape.kind];
  const loopPath =
    shape.loop.length === 0 ? '' : roundedPathData(shape.loop, (shape.passes[1] ?? 0) / 2 - (shape.passes[0] ?? 0) / 2);
  return svg`<g class="emitter${active ? '' : ' muted'}" data-emitter="body" data-emitter-kind=${shape.kind} aria-label=${name} role=${tap.role} tabindex=${tap.tabindex} @click=${tap.click} @keydown=${tap.keydown}>
    <title>${name}</title>
    <defs>
      <linearGradient id=${gradient} gradientUnits="userSpaceOnUse" x1="0" y1=${top} x2="0" y2=${bottom} data-muted=${muted}>
        <stop offset="0" style="stop-color: ${muted ? MUTED_COLOR : from.color}" />
        <stop offset="1" style="stop-color: ${muted ? MUTED_COLOR : to.color}" />
      </linearGradient>
    </defs>
    <rect class="emitter-hit" x=${shape.x} y=${shape.y} width=${shape.width} height=${shape.height} fill="transparent" stroke="none" />
    ${body(shape, { gradient, muted }, loopPath, fill.mode === 'gradient', from.animated ? { duration: from.duration ?? 2 } : undefined)}
  </g>`;
}
