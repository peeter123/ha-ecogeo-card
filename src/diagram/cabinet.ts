// The cabinet (add-schematic-card D5, D6; schematic-drawing spec): the outline, the connections on the top edge (1-6, and 47-49
// on model C) with their item numbers and circuit labels, every internal component as a symbol with its item number
// (model C's tank 50-54 included), and every pipe segment of the drawing, the source's and the external DHW tank's
// pipes outside the cabinet too, coloured by temperature and animated by flow
// (pipes.ts). Valve positions come from circuits.ts; a feature that is `false` removes its parts (geometry.ts), `unused` draws them muted.
import { css, nothing, svg, type SVGTemplateResult } from 'lit';
import type { ExchangerFill } from '../config/options';
import { CIRCUIT_LABELS, componentLabel } from '../strings';
import { COIL_MUTED_VAR, MUTED_COLOR } from './colors';
import { COMPONENT_ROLES, focusRingStyles, tapBindings, tapTarget, type Taps } from './component-info';
import {
  CABINET,
  CIRCUIT_LABELS as LABEL_POSITIONS,
  drawnComponents,
  drawnSegments,
  externalTankBody,
  gapsIn,
  HELIX_BACK_OPACITY,
  helixDrawOrder,
  helixHalves,
  HOP,
  partState,
  pathData,
  roundedPathData,
  type Component,
  type DrawContext,
  type ExchangerSide,
  type HelixShape,
  type Point,
  type Segment,
} from './geometry';
import { DEFAULT_STROKES } from '../lib/layout';
import { coilColor, pipeState, shownState, type PipeState, type PipeView } from './pipes';
import { symbol, type ValvePort } from './symbols';

export const cabinetStyles = css`
  /* The stroke widths follow the card's width (add-compact-layout D4): the card sets --pipe-width and --outline-width on the svg,
     in drawing units; the fallbacks are the designed widths, used while the width is unknown. */
  .outline {
    fill: none;
    stroke: var(--primary-text-color);
    stroke-width: max(3, var(--outline-width, 2));
  }
  .symbol {
    stroke-width: var(--outline-width, 2);
  }
  .pipe {
    fill: none;
    stroke: var(--secondary-text-color);
    stroke-width: var(--pipe-width, 3);
    stroke-linejoin: round;
  }
  .pipe.muted {
    stroke: var(--disabled-text-color);
  }
  /* A muted helix (external coil, coil 51) takes its own grey (refine-schematic-drawing D8; set by the card, light theme only). */
  .helix .pipe.muted {
    stroke: var(--ecogeo-coil-muted, var(--disabled-text-color));
  }
  /* The part of an idle coil pipe inside the tank, in the coil's grey (clipped to the tank body, refine-schematic-drawing D8). */
  .pipe-inside {
    fill: none;
    stroke: var(--ecogeo-coil-muted, var(--disabled-text-color));
    stroke-width: var(--pipe-width, 3);
    stroke-linejoin: round;
  }
  /* The dash overlay of an active pipe: dashes in the card colour run along it in the direction of the flow. */
  .flow {
    fill: none;
    stroke: var(--card-background-color, #fff);
    stroke-opacity: 0.55;
    stroke-width: var(--pipe-width, 3);
    stroke-linecap: round;
    stroke-dasharray: var(--pipe-width, 3) calc(var(--pipe-width, 3) * 6);
    animation: flow-dash var(--flow-duration, 2s) linear infinite;
  }
  .flow.reversed {
    animation-direction: reverse;
  }
  /* One dash period (dash 1 + gap 6 widths). The -7px carries a length: Chromium does not interpolate a unitless calc(), it jumps. */
  @keyframes flow-dash {
    to {
      stroke-dashoffset: calc(var(--pipe-width, 3) * -7px);
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
  /* A component with an entity of its own opens its more-info dialog (component-info.ts). */
  .symbol-group[role='button'] {
    cursor: pointer;
  }
  .symbol-group[role='button']:focus-visible {
    ${focusRingStyles}
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

/**
 * One component: the symbol, its name as `<title>` and `aria-label` (component-info spec), a tap when its role has an
 * entity, and its item number only at `detail: full`.
 */
function component(
  entry: { part: Component; state: 'normal' | 'muted' },
  view: PipeView,
  detail: DrawContext['detail'],
  taps: Taps | undefined,
  fills?: { left: string; right: string },
): SVGTemplateResult {
  const { part } = entry;
  const { circuits } = view;
  const state = shownState(part, entry.state, view.mode);
  const [dx, dy, anchor] = part.tag;
  const label = componentLabel(part.item);
  const tap = tapBindings(tapTarget(COMPONENT_ROLES[part.item], taps), taps?.onTap);
  return svg`<g class="symbol-group ${state}" data-item=${part.item} data-kind=${part.kind} aria-label=${label} role=${tap.role} tabindex=${tap.tabindex} @click=${tap.click} @keydown=${tap.keydown} style=${part.kind === 'coil' ? `color: ${coilStyleColor(view)}` : nothing}>
    <title>${label}</title>
    <g transform="translate(${part.x} ${part.y})">${symbol(part.kind, {
      rotation: part.rotation,
      size: part.size,
      open: part.kind === 'valve3' ? openPorts(part.item, circuits) : undefined,
      reversed: part.kind === 'inversion_valve' ? circuits.valve14 === 'reversed' : undefined,
      fills,
    })}</g>
    ${detail === 'full' ? svg`<text class="item" x=${part.x + dx} y=${part.y + dy} text-anchor=${anchor ?? 'start'}>${part.item}</text>` : nothing}
  </g>`;
}

/**
 * A helical coil (refine-schematic-drawing D5): one path per half-turn, the front halves with the base stroke and the back halves faint,
 * and, while it flows, the dash overlay on the front halves only, in the direction of the segment.
 */
function helix(segment: Segment, shape: HelixShape, state: PipeState): SVGTemplateResult {
  const halves = helixHalves(shape);
  const style = state.muted ? nothing : `stroke: ${state.color}`;
  return svg`<g class="helix ${state.muted ? 'muted' : ''}" data-segment=${segment.id} style=${style}>
    ${helixDrawOrder(halves).map(
      (half) =>
        svg`<path class="pipe ${state.muted ? 'muted' : ''}" data-half=${half.front ? 'front' : 'back'} style=${style} stroke-linecap=${half.front ? 'round' : 'butt'} opacity=${half.front ? nothing : HELIX_BACK_OPACITY} d=${half.d} />`,
    )}
    ${
      state.animated
        ? svg`<path class="flow ${state.reversed ? 'reversed' : ''}" data-flow=${segment.id} style="--flow-duration: ${String(state.duration)}s" d=${halves
            .filter((half) => half.front)
            .map((half) => half.d)
            .join(' ')} />`
        : nothing
    }
  </g>`;
}

/** One pipe: the base stroke in its colour (or muted) and, while it flows, the dash overlay. */
function pipe(
  segment: Segment,
  state: PipeState,
  gaps: readonly Point[],
  hop: number,
  clipId?: string,
): SVGTemplateResult {
  if (segment.shape !== undefined) return helix(segment, segment.shape, state);
  const d =
    segment.bend === undefined ? pathData(segment.points, gaps, hop) : roundedPathData(segment.points, segment.bend);
  return svg`<path class="pipe ${state.muted ? 'muted' : ''}" data-segment=${segment.id} style=${state.muted ? nothing : `stroke: ${state.color}`} stroke-linecap=${segment.roundEnd === true ? 'round' : nothing} d=${d} />${
    state.muted && clipId !== undefined && COIL_PIPES.has(segment.id)
      ? svg`<path class="pipe-inside" data-inside=${segment.id} clip-path="url(#${clipId})" d=${d} />`
      : nothing
  }${
    state.animated
      ? svg`<path class="flow ${state.reversed ? 'reversed' : ''}" data-flow=${segment.id} style="--flow-duration: ${String(state.duration)}s" d=${d} />`
      : nothing
  }`;
}

/** How the exchangers are filled: the option, and the id prefix of this card's gradients (unique per card instance). */
export interface FillOptions {
  mode: ExchangerFill;
  idPrefix: string;
}

/** A gradient of one exchanger side, as defs content, and the paint that refers to it. */
interface SideGradient {
  id: string;
  y1: number;
  y2: number;
  start: string;
  end: string;
  muted: boolean;
}

/**
 * The colours of one exchanger side (refine-schematic-drawing D4): from the state of the segment that enters it to the one that leaves
 * it. A reversed side (active cooling, refrigerant legs of 7 and 8) swaps start and end. Candidates that are not drawn
 * are skipped; a side is muted when none of its drawn segments is coloured. Every drawn side has exactly one drawn candidate at each end
 * (a geometry test checks it).
 */
function sideGradient(
  side: ExchangerSide,
  id: string,
  states: ReadonlyMap<string, PipeState>,
  mode: PipeView['mode'],
): SideGradient {
  const find = (ids: readonly string[]): PipeState | undefined =>
    ids.map((candidate) => states.get(candidate)).find((state) => state !== undefined);
  const reversed = side.reversible === true && mode === 'active_cooling';
  const [first, last] = reversed ? [side.leaving, side.entering] : [side.entering, side.leaving];
  const from = find(first);
  const to = find(last);
  const muted = (from?.muted ?? true) && (to?.muted ?? true);
  const colorOf = (state: PipeState | undefined): string => (muted ? MUTED_COLOR : (state?.color ?? MUTED_COLOR));
  // the first stop sits at the end the flow enters (the bottom or the top of the half), the second where it leaves
  const startAtTop = (side.enters === 'top') !== reversed;
  return {
    id,
    y1: startAtTop ? 0 : 1,
    y2: startAtTop ? 1 : 0,
    start: colorOf(from),
    end: colorOf(to),
    muted,
  };
}

const gradientDef = (gradient: SideGradient): SVGTemplateResult =>
  svg`<linearGradient id=${gradient.id} x1="0" y1=${gradient.y1} x2="0" y2=${gradient.y2} data-muted=${gradient.muted}>
      <stop offset="0" style="stop-color: ${gradient.start}" />
      <stop offset="1" style="stop-color: ${gradient.end}" />
    </linearGradient>`;

/** Coil 51's colour: its temperature colour, or the coil's muted grey (light theme: darker) while idle (refine-schematic-drawing D8). */
function coilStyleColor(view: PipeView): string {
  const color = coilColor(view);
  return color === MUTED_COLOR ? COIL_MUTED_VAR : color;
}

/** The pipes that feed the external coil: while muted, their part inside the tank is drawn again in the coil's grey. */
const COIL_PIPES: ReadonlySet<string> = new Set(['dhw_ext_in', 'dhw_ext_out']);

/** The cabinet as SVG content for the card's viewBox: no images, only paths, symbols and text. */
export function renderCabinet(
  context: DrawContext,
  view: PipeView,
  taps?: Taps,
  fill: FillOptions = { mode: 'gradient', idPrefix: 'ecogeo' },
  pipeWidth: number = DEFAULT_STROKES.pipe,
): SVGTemplateResult {
  // The hop gaps scale with the pipe's width (add-compact-layout D4).
  const hop = (HOP * pipeWidth) / DEFAULT_STROKES.pipe;
  const segments = drawnSegments(context);
  const ids = new Set(segments.map((entry) => entry.part.id));
  const states = new Map(segments.map((entry) => [entry.part.id, pipeState(entry.part, entry.state, view)] as const));
  const gradients: SideGradient[] = [];
  const clipId = context.dhw === 'external' ? `${fill.idPrefix}-tank-clip` : undefined;
  const components = drawnComponents(context).map((entry) => {
    const sides = fill.mode === 'gradient' ? entry.part.sides : undefined;
    if (sides === undefined) return component(entry, view, context.detail, taps);
    const paints = { left: 'none', right: 'none' };
    for (const side of sides) {
      const gradient = sideGradient(
        side,
        `${fill.idPrefix}-x${String(entry.part.item)}-${side.half}`,
        states,
        view.mode,
      );
      gradients.push(gradient);
      paints[side.half] = `url(#${gradient.id})`;
    }
    return component(entry, view, context.detail, taps, paints);
  });
  return svg`<g class="cabinet">
    <defs>${gradients.map(gradientDef)}${clipId === undefined ? nothing : svg`<clipPath id=${clipId} data-tank-clip><path d=${externalTankBody()} /></clipPath>`}</defs>
    <rect class="outline" x=${CABINET.x} y=${CABINET.y} width=${CABINET.width} height=${CABINET.height} rx="6" />
    ${LABEL_POSITIONS.filter((label) => context.captions !== false && partState(label, context) !== 'hidden').map(
      (label) =>
        svg`<text class="circuit-label" x=${label.x} y=${label.y} text-anchor="middle">${CIRCUIT_LABELS[label.key]}</text>`,
    )}
    ${segments.map((entry) => {
      const state = states.get(entry.part.id);
      return state === undefined ? nothing : pipe(entry.part, state, gapsIn(entry.part.id, ids), hop, clipId);
    })}
    ${components}
  </g>`;
}
