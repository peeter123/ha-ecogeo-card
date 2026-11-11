// The outer-loop source (add-schematic-card D5, D6; refine-schematic-drawing D11-D14; outer-loop-source spec): the air unit, the ground loop or both on
// one brine loop, drawn in the zone left of the cabinet (viewBox x 0-240), its top on the cabinet's top line. This
// file draws what is not a pipe: the air unit's housing (slatted front), finned coil block and fan, the ground line
// and the captions. The pipes (ports 3/4 up into the run, left to the zone, the serpentine and the ground loop's U)
// are segments in geometry.ts, so pipes.ts colours and animates them like every other pipe. None of these parts is
// a manual item: the manual's figures stop at connections 3 (brine outlet) and 4 (brine inlet).
//
// The live values (labels.ts): the air unit's fan speed and outside temperature go under the housing, its In and Out
// beside its two ports on the housing's right; the ground loop's In and Out sit at the ground line, beside the legs.
import { css, nothing, svg, type SVGTemplateResult } from 'lit';
import type { Readings } from '../calc/readings';
import { AIR_UNIT_FAN_NAME, SOURCE_LABELS } from '../strings';
import { FAN_ROLE, focusRingStyles, tapBindings, tapTarget, type Taps } from './component-info';
import { AIR_UNIT, GROUND_CAPTION, GROUND_LINE_X, GROUND_LINE_Y, drawnSegments, type DrawContext } from './geometry';

export const sourceStyles = css`
  .source-outline {
    fill: none;
    stroke: var(--primary-text-color);
    stroke-width: max(2.5, var(--outline-width, 2));
  }
  .source-frame {
    fill: none;
    stroke: var(--primary-text-color);
    stroke-width: var(--outline-width, 2);
  }
  .source-fin {
    stroke: var(--secondary-text-color);
    stroke-opacity: 0.55;
    stroke-width: calc(var(--outline-width, 2) * 0.5);
  }
  .source-slat {
    stroke: var(--secondary-text-color);
    stroke-width: var(--outline-width, 2);
    stroke-linecap: round;
  }
  .source-divider {
    stroke: var(--primary-text-color);
    stroke-width: calc(var(--outline-width, 2) * 0.75);
  }
  .source-ground {
    stroke: var(--secondary-text-color);
    stroke-width: calc(var(--outline-width, 2) * 0.75);
  }
  /* The brine circuit is inactive: the housing, coil and ground line are muted like the pipes; the fan follows its own speed. */
  .muted .source-outline,
  .muted .source-frame,
  .muted .source-fin,
  .muted .source-slat,
  .muted .source-divider,
  .muted .source-ground {
    stroke: var(--disabled-text-color);
  }
  .muted .source-caption {
    fill: var(--disabled-text-color);
  }
  .source-caption {
    fill: var(--secondary-text-color);
    font-size: 11px;
  }
  .fan-part[role='button'] {
    cursor: pointer;
  }
  .fan-part[role='button']:focus-visible {
    ${focusRingStyles}
  }
  .fan-ring {
    fill: none;
    stroke: var(--primary-text-color);
    stroke-width: var(--outline-width, 2);
  }
  .fan-blade {
    fill: var(--secondary-text-color);
  }
  .fan-rotor {
    animation: fan-spin var(--fan-duration, 2s) linear infinite;
  }
  .fan-rotor.still {
    animation: none;
  }
  @keyframes fan-spin {
    to {
      transform: rotate(360deg);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .fan-rotor {
      animation: none;
    }
  }
`;

/** The seconds a full turn of the fan takes: 1.2 s at 100 %, slower below, never faster than 0.5 s or slower than 6 s. */
export const fanDuration = (speed: number | undefined): number | undefined =>
  speed === undefined || !(speed > 0) ? undefined : Math.min(6, Math.max(0.5, 120 / speed));

/** The fan's five swept blades around the origin (refine-schematic-drawing D6): each curves away from its root at the hub. */
const BLADES = [0, 72, 144, 216, 288].map(
  (angle) =>
    svg`<path class="fan-blade" d="M0 -4 C9 -6 21 -16 17 -30 C6 -26 -3 -17 -3 -6 Z" transform="rotate(${angle})" />`,
);

function airUnit(
  speed: number | undefined,
  muted: boolean,
  taps: Taps | undefined,
  captions: boolean,
): SVGTemplateResult {
  const { x, y, width, height, fanX, fanY, fanRadius, coil, fins: fin, slats: slat, dividerY } = AIR_UNIT;
  const duration = fanDuration(speed);
  const fins = Array.from({ length: fin.count }, (_, index) => fin.x + index * fin.step);
  const slatYs = Array.from({ length: slat.count }, (_, index) => slat.y0 + index * slat.step);
  const [gutterLeft, gutterRight] = [x + 6, fanX + fanRadius + 6];
  const gutter = fanX - fanRadius - 6 - gutterLeft;
  const tap = tapBindings(tapTarget(FAN_ROLE, taps), taps?.onTap);
  return svg`<g class="air-unit${muted ? ' muted' : ''}" data-source="air">
    <rect class="source-outline" x=${x} y=${y} width=${width} height=${height} rx="6" />
    <path class="source-divider" d="M${x} ${dividerY} H${x + width}" />
    ${slatYs.map((slatY) => svg`<path class="source-slat" data-slat d="M${gutterLeft} ${slatY} h${gutter} M${gutterRight} ${slatY} h${gutter}" />`)}
    <rect class="source-frame" data-coil-block x=${coil.x} y=${coil.y} width=${coil.width} height=${coil.height} rx="3" />
    ${fins.map((finX) => svg`<path class="source-fin" d="M${finX} ${fin.y0} V${fin.y1}" />`)}
    <g class="fan-part" aria-label=${AIR_UNIT_FAN_NAME} role=${tap.role} tabindex=${tap.tabindex} @click=${tap.click} @keydown=${tap.keydown}>
      <title>${AIR_UNIT_FAN_NAME}</title>
      <circle class="fan-ring" cx=${fanX} cy=${fanY} r=${fanRadius} />
      <circle class="fan-hit" cx=${fanX} cy=${fanY} r=${fanRadius} fill="transparent" stroke="none" />
      <g class="fan" data-fan transform="translate(${fanX} ${fanY})">
        <g class=${duration === undefined ? 'fan-rotor still' : 'fan-rotor'} style=${duration === undefined ? '' : `--fan-duration: ${String(duration)}s`}>${BLADES}<circle class="fan-hub" r="5" fill="var(--primary-text-color)" /></g>
      </g>
    </g>
    ${captions ? svg`<text class="source-caption" x=${AIR_UNIT.captionX} y=${AIR_UNIT.captionY} text-anchor="middle">${SOURCE_LABELS.air}</text>` : nothing}
  </g>`;
}

/** The x of the drawn source pipes that run across or end on the height `lineY`. */
function pipesAcross(context: DrawContext, lineY: number): number[] {
  return drawnSegments(context).flatMap(({ part }) =>
    part.id.startsWith('src_')
      ? part.points.slice(1).flatMap((end, index) => {
          const start = part.points[index];
          if (start?.[0] !== end[0]) return [];
          return lineY >= Math.min(start[1], end[1]) && lineY <= Math.max(start[1], end[1]) ? [end[0]] : [];
        })
      : [],
  );
}

/** The ground line with its hatching, at `lineY`, leaving out the places where the source pipes pass. */
function groundLine(context: DrawContext, kind: 'ground' | 'hybrid', lineY: number, muted: boolean): SVGTemplateResult {
  const skip = pipesAcross(context, lineY);
  const ticks = Array.from(
    { length: Math.floor((GROUND_LINE_X.end - GROUND_LINE_X.start - 12) / 10) + 1 },
    (_, index) => GROUND_LINE_X.start + 6 + index * 10,
  ).filter((tick) => !skip.some((pipe) => Math.abs(pipe - tick) < 10));
  const captionY = GROUND_CAPTION.y[kind];
  return svg`<g class="ground-loop${muted ? ' muted' : ''}" data-source="ground">
    <path class="source-ground" d="M${GROUND_LINE_X.start} ${lineY} H${GROUND_LINE_X.end}" />
    ${ticks.map((tick) => svg`<path class="source-ground" d="M${tick} ${lineY} l-6 8" />`)}
    ${context.captions === false ? nothing : svg`<text class="source-caption" x=${GROUND_CAPTION.x} y=${captionY} text-anchor="middle">${SOURCE_LABELS.ground}</text>`}
  </g>`;
}

/**
 * The source for the config: air unit, ground loop or both (hybrid), with the fan turning at `source.fan_speed`. The
 * housing, coil and ground line are muted while the brine circuit is inactive (`brineActive` false), like the pipes.
 */
export function renderSource(
  context: DrawContext,
  readings: Pick<Readings, 'source.fan_speed'>,
  brineActive: boolean,
  taps?: Taps,
): SVGTemplateResult {
  const air = context.source === 'air' || context.source === 'hybrid';
  const ground = context.source === 'ground' || context.source === 'hybrid';
  const kind = context.source === 'hybrid' ? 'hybrid' : 'ground';
  return svg`<g class="source" data-source-kind=${context.source}>
    ${air ? airUnit(readings['source.fan_speed'], !brineActive, taps, context.captions !== false) : svg``}
    ${ground ? groundLine(context, kind, GROUND_LINE_Y[kind], !brineActive) : svg``}
  </g>`;
}
