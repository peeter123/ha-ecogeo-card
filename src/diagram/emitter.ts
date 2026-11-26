// The heat emitter (rework-layouts D5; heating-emitter spec): the underfloor spiral or the radiator of the DG1 heating circuit,
// drawn in the band's first slot over connections 1/2. This file draws the body; the spiral's runs and the supply and return pipes
// (port 1 up through the join lane into the body, and from it down to port 2) are the segments `dg1_loop_in`, `dg1_loop_out`,
// `dg1_sup` and `dg1_ret` of the DG1 production
// circuit in geometry.ts, so pipes.ts colours and animates them like every other pipe, and activity follows the circuit without
// logic of its own. The emitter is not a manual item: it is outside the unit (the manual's figures stop at connections 1 and 2),
// so it cites no item number; its tooltip names it.
//
// Colouring: the supply pipe takes production outlet 33 and the return pipe production return 34. The underfloor spiral is two
// segments of the arrangement, `dg1_loop_in` (the inward run, production outlet 33) and `dg1_loop_out` (the outward run,
// production return 34), so adjacent turns alternate between the supply and the return colour and `pipes.ts` animates both with
// the DG1 circuit like every other pipe; this file draws only the floor body around them. The radiator's body is filled with a
// gradient from the supply colour at its top to the return colour at its bottom when `exchanger_fill` is `gradient`, and has no
// fill otherwise. Idle (the circuit inactive, or no probe value) the body and the fill are muted like the pipes.
//
// The body shows no demand caption. The radiator registers its columns with `data-obstacle` so that the overlap check sees them.
// The body is a button for the demand's more-info.
import { css, nothing, svg, type SVGTemplateResult } from 'lit';
import { EMITTER_NAMES } from '../strings';
import { MUTED_COLOR } from './colors';
import { EMITTER_ROLE, focusRingStyles, tapBindings, tapTarget, type Taps } from './component-info';
import { BAND, arrangementOf, isSegmentActive, type DrawContext, type EmitterShape } from './geometry';
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
  /* The spiral's runs are segments drawn above the body: a tap on them reaches the body's hit area (the emitter's button). */
  .pipe[data-segment^='dg1_loop'],
  .flow[data-flow^='dg1_loop'] {
    pointer-events: none;
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

/** The box around all of a radiator's columns (a zero-size box at the shape's corner for none): the radiator's obstacle for the overlap check. */
function columnsBox(shape: EmitterShape): { x: number; y: number; width: number; height: number } {
  const first = shape.columns[0];
  const last = shape.columns.at(-1);
  if (first === undefined || last === undefined) return { x: shape.x, y: shape.y, width: 0, height: 0 };
  return { x: first.x, y: first.y, width: last.x + last.width - first.x, height: first.height };
}

/** The body of the emitter: its outline (with the gradient fill of a radiator) and the radiator's columns. */
function body(shape: EmitterShape, gradient: string, fillRadiator: boolean): SVGTemplateResult {
  const { x, y, width, height } = shape;
  const radiator = shape.kind === 'radiator';
  return svg`<rect class="emitter-outline band-outline" x=${x} y=${y} width=${width} height=${height} rx=${BAND.radius} fill=${radiator && fillRadiator ? `url(#${gradient})` : 'none'} fill-opacity=${RADIATOR_FILL_OPACITY} />
    ${
      radiator
        ? svg`${shape.columns.map((column) => svg`<rect class="emitter-column" x=${column.x} y=${column.y} width=${column.width} height=${column.height} rx="4" />`)}${obstacle('radiator-columns', columnsBox(shape))}`
        : nothing
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
  const tap = tapBindings(tapTarget(EMITTER_ROLE, taps), taps?.onTap);
  const name = EMITTER_NAMES[shape.kind];
  // the gradient is the radiator's: it spans the whole body, from the supply colour at the top to the return colour at the bottom
  return svg`<g class="emitter${active ? '' : ' muted'}" data-emitter="body" data-emitter-kind=${shape.kind} aria-label=${name} role=${tap.role} tabindex=${tap.tabindex} @click=${tap.click} @keydown=${tap.keydown}>
    <title>${name}</title>
    ${
      radiator
        ? svg`<defs>
      <linearGradient id=${gradient} gradientUnits="userSpaceOnUse" x1="0" y1=${shape.y} x2="0" y2=${shape.y + shape.height} data-muted=${muted}>
        <stop offset="0" style="stop-color: ${muted ? MUTED_COLOR : from.color}" />
        <stop offset="1" style="stop-color: ${muted ? MUTED_COLOR : to.color}" />
      </linearGradient>
    </defs>`
        : nothing
    }
    <rect class="emitter-hit" x=${shape.x} y=${shape.y} width=${shape.width} height=${shape.height} fill="transparent" stroke="none" />
    ${body(shape, gradient, fill.mode === 'gradient')}
  </g>`;
}
