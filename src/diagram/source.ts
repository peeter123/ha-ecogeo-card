// The outer-loop source (design D5, D6; outer-loop-source spec): the air unit, the ground loop or both on one brine
// loop, drawn in the zone left of the cabinet (viewBox x 0-210). This file draws what is not a pipe: the air unit's
// housing, fins and fan, the ground line and the captions. The pipes (ports 3/4 up into the run, left to the zone, the
// coil rows and the collector rows) are segments in geometry.ts, so group 6 colours and animates them like every other
// pipe. None of these parts is a manual item: the manual's figures stop at connections 3 (brine outlet) and 4 (brine
// inlet).
//
// Room for the live values (group 6): the air unit's fan speed, outside temperature and air unit outlet temperature
// go under the housing (y 305-345); the ground loop's outlet and inlet temperatures go where its pipes meet it, at
// the right of the collector (x 160-205).
import { css, svg, type SVGTemplateResult } from 'lit';
import type { Readings } from '../calc/readings';
import { SOURCE_LABELS } from '../strings';
import { AIR_UNIT, GROUND_CAPTION, GROUND_LINE_Y, drawnSegments, type DrawContext } from './geometry';

export const sourceStyles = css`
  .source-outline {
    fill: none;
    stroke: var(--primary-text-color);
    stroke-width: 2;
  }
  .source-fin {
    stroke: var(--divider-color);
    stroke-width: 1;
  }
  .source-ground {
    stroke: var(--secondary-text-color);
    stroke-width: 1.5;
  }
  /* The brine circuit is inactive: the housing, coil and ground line are muted like the pipes; the fan follows its own speed. */
  .muted .source-outline,
  .muted .source-fin,
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
  .fan-ring {
    fill: none;
    stroke: var(--primary-text-color);
    stroke-width: 1.5;
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

/** The fan's four blades around the origin. */
const BLADES = [0, 90, 180, 270].map(
  (angle) =>
    svg`<path class="fan-blade" d="M0 0 C6 -8 6 -24 0 -30 C-8 -24 -8 -8 0 0 Z" transform="rotate(${angle})" />`,
);

function airUnit(speed: number | undefined, muted: boolean): SVGTemplateResult {
  const { x, y, width, height, fanX, fanY, fanRadius } = AIR_UNIT;
  const duration = fanDuration(speed);
  const { fins: fin } = AIR_UNIT;
  const fins = Array.from({ length: fin.count }, (_, index) => fin.x + index * fin.step);
  return svg`<g class="air-unit${muted ? ' muted' : ''}" data-source="air">
    <rect class="source-outline" x=${x} y=${y} width=${width} height=${height} rx="6" />
    ${fins.map((fin) => svg`<path class="source-fin" d="M${fin} ${AIR_UNIT.fins.y0} V${AIR_UNIT.fins.y1}" />`)}
    <circle class="fan-ring" cx=${fanX} cy=${fanY} r=${fanRadius} />
    <g class="fan" data-fan transform="translate(${fanX} ${fanY})">
      <g class=${duration === undefined ? 'fan-rotor still' : 'fan-rotor'} style=${duration === undefined ? '' : `--fan-duration: ${String(duration)}s`}>${BLADES}<circle r="4" fill="var(--primary-text-color)" /></g>
    </g>
    <text class="source-caption" x=${AIR_UNIT.captionX} y=${AIR_UNIT.captionY} text-anchor="middle">${SOURCE_LABELS.air}</text>
  </g>`;
}

/** The x of the drawn source pipes that run across the height `lineY`. */
function pipesAcross(context: DrawContext, lineY: number): number[] {
  return drawnSegments(context).flatMap(({ part }) =>
    part.id.startsWith('src_')
      ? part.points.slice(1).flatMap((end, index) => {
          const start = part.points[index];
          if (start?.[0] !== end[0]) return [];
          return lineY > Math.min(start[1], end[1]) && lineY < Math.max(start[1], end[1]) ? [end[0]] : [];
        })
      : [],
  );
}

/** The ground line with its hatching, at `lineY`, leaving out the places where the source pipes pass. */
function groundLine(context: DrawContext, kind: 'ground' | 'hybrid', lineY: number, muted: boolean): SVGTemplateResult {
  const skip = pipesAcross(context, lineY);
  const ticks = Array.from({ length: 16 }, (_, index) => 44 + index * 10).filter(
    (tick) => !skip.some((pipe) => Math.abs(pipe - tick) < 8),
  );
  const captionY = GROUND_CAPTION.y[kind];
  return svg`<g class="ground-loop${muted ? ' muted' : ''}" data-source="ground">
    <path class="source-ground" d="M8 ${lineY} H202" />
    ${ticks.map((tick) => svg`<path class="source-ground" d="M${tick} ${lineY} l-6 8" />`)}
    <text class="source-caption" x=${GROUND_CAPTION.x} y=${captionY} text-anchor="middle">${SOURCE_LABELS.ground}</text>
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
): SVGTemplateResult {
  const air = context.source === 'air' || context.source === 'hybrid';
  const ground = context.source === 'ground' || context.source === 'hybrid';
  const kind = context.source === 'hybrid' ? 'hybrid' : 'ground';
  return svg`<g class="source" data-source-kind=${context.source}>
    ${air ? airUnit(readings['source.fan_speed'], !brineActive) : svg``}
    ${ground ? groundLine(context, kind, GROUND_LINE_Y[kind], !brineActive) : svg``}
  </g>`;
}
