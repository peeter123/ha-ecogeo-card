// The outer-loop source (add-schematic-card D5, D6; refine-schematic-drawing D11-D14; rework-layouts D3, D4; outer-loop-source spec): the
// air unit, the ground collector or both side by side on one brine loop, drawn in the band above the cabinet, over connections
// 3/4. This file draws what is not a pipe: the air unit's housing, finned coil block and fan, and the collector's ground strip
// with its hatching (no captions: the tooltips name the parts, rework-layouts "No in-drawing captions"). The pipes (ports 3/4
// up through the join lane into the bottom faces, the serpentines and the link) are segments in geometry.ts, so pipes.ts
// colours and animates them like every other pipe. None of these parts is a manual item: the manual's figures stop at
// connections 3 (brine outlet) and 4 (brine inlet).
//
// The live value (labels.ts): the source's Out only, inside the air unit's housing (the strip between the fan and the coil
// block) or the collector's strip (between the hatching and the serpentine); the bodies register their obstacles with
// `data-obstacle` so that the overlap check sees the coil, the fan, the hatching and the serpentine inside them.
import { css, svg, type SVGTemplateResult } from 'lit';
import type { AnimationReadings } from '../calc/readings';
import { AIR_UNIT_FAN_NAME, AIR_UNIT_NAME, GROUND_COLLECTOR_NAME } from '../strings';
import { FAN_ROLE, focusRingStyles, tapBindings, tapTarget, type Taps } from './component-info';
import { arrangementOf, type AirUnitShape, type CollectorShape, type DrawContext } from './geometry';

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
  .muted .source-divider,
  .muted .source-ground {
    stroke: var(--disabled-text-color);
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

/** Rounds to 2 decimals, so the shapes' derived values leave no float noise in the markup. */
const round2 = (value: number): number => Math.round(value * 100) / 100;

/** The fan's turn in seconds at the fixed medium speed, for a speed in another unit than % (add-entity-discovery D6). */
const FAN_MEDIUM_SECONDS = 3;

/**
 * The seconds a full turn of the fan takes: 1.2 s at 100 %, slower below, never faster than 0.5 s or slower than 6 s.
 * `true` (a speed above 0 in another unit, see animationReadings) turns at the fixed medium speed.
 */
export const fanDuration = (speed: number | boolean | undefined): number | undefined =>
  speed === true
    ? FAN_MEDIUM_SECONDS
    : speed === undefined || speed === false || !(speed > 0)
      ? undefined
      : Math.min(6, Math.max(0.5, 120 / speed));

/** The fan's five swept blades around the origin (refine-schematic-drawing D6): each curves away from its root at the hub. */
const BLADES = [0, 72, 144, 216, 288].map(
  (angle) =>
    svg`<path class="fan-blade" d="M0 -4 C9 -6 21 -16 17 -30 C6 -26 -3 -17 -3 -6 Z" transform="rotate(${angle})" />`,
);

/** The blades are drawn for a ring of this radius; a smaller ring scales them. */
const BLADE_RING = 34;

/** An invisible box that registers an obstacle inside a body for the overlap check (dev/overlaps.ts). */
const obstacle = (name: string, rect: { x: number; y: number; width: number; height: number }): SVGTemplateResult =>
  svg`<rect class="obstacle" data-obstacle=${name} x=${rect.x} y=${rect.y} width=${rect.width} height=${rect.height} fill="none" stroke="none" />`;

function airUnit(
  unit: AirUnitShape,
  speed: number | boolean | undefined,
  muted: boolean,
  taps: Taps | undefined,
): SVGTemplateResult {
  const { x, y, width, height, fan, coil, fins: fin, dividerY } = unit;
  const duration = fanDuration(speed);
  const finYs = Array.from({ length: fin.count }, (_, index) => round2(fin.y0 + index * fin.step));
  const fanScale = round2(fan.radius / BLADE_RING);
  const tap = tapBindings(tapTarget(FAN_ROLE, taps), taps?.onTap);
  return svg`<g class="air-unit${muted ? ' muted' : ''}" data-source="air" aria-label=${AIR_UNIT_NAME}>
    <title>${AIR_UNIT_NAME}</title>
    <rect class="source-outline" x=${x} y=${y} width=${width} height=${height} rx="6" />
    <path class="source-divider" d="M${x} ${dividerY} H${round2(x + width)}" />
    ${obstacle('air-divider', { x, y: dividerY - 1.5, width, height: 3 })}
    <rect class="source-frame" data-coil-block data-obstacle="air-coil" x=${coil.x} y=${coil.y} width=${coil.width} height=${coil.height} rx="3" />
    ${finYs.map((finY) => svg`<path class="source-fin" d="M${fin.x0} ${finY} H${fin.x1}" />`)}
    <g class="fan-part" aria-label=${AIR_UNIT_FAN_NAME} role=${tap.role} tabindex=${tap.tabindex} @click=${tap.click} @keydown=${tap.keydown}>
      <title>${AIR_UNIT_FAN_NAME}</title>
      <circle class="fan-ring" data-obstacle="air-fan" cx=${fan.cx} cy=${fan.cy} r=${fan.radius} />
      <circle class="fan-hit" cx=${fan.cx} cy=${fan.cy} r=${fan.radius} fill="transparent" stroke="none" />
      <g class="fan" data-fan transform="translate(${fan.cx} ${fan.cy})${fanScale === 1 ? '' : ` scale(${String(fanScale)})`}">
        <g class=${duration === undefined ? 'fan-rotor still' : 'fan-rotor'} style=${duration === undefined ? '' : `--fan-duration: ${String(duration)}s`}>${BLADES}<circle class="fan-hub" r="5" fill="var(--primary-text-color)" /></g>
      </g>
    </g>
  </g>`;
}

/** The ground collector: the strip, hatched along its top (the surface); its serpentine is a segment of the brine circuit. */
function collectorBody(collector: CollectorShape, muted: boolean): SVGTemplateResult {
  const { x, y, width, height, hatch, serpentine } = collector;
  const ticks = Array.from({ length: Math.floor((width - 20) / 10) + 1 }, (_, index) => round2(x + 14 + index * 10));
  return svg`<g class="ground-collector${muted ? ' muted' : ''}" data-source="ground" aria-label=${GROUND_COLLECTOR_NAME}>
    <title>${GROUND_COLLECTOR_NAME}</title>
    <rect class="source-outline" x=${x} y=${y} width=${width} height=${height} rx="4" />
    <path class="source-ground" d="M${x} ${hatch.y + hatch.height} H${round2(x + width)}" />
    ${ticks.map((tick) => svg`<path class="source-ground" d="M${tick} ${y} l-8 ${hatch.height}" />`)}
    ${obstacle('ground-hatch', hatch)}
    ${obstacle('ground-serpentine', serpentine)}
  </g>`;
}

/**
 * The source for the config: air unit, ground collector or both (hybrid), with the fan turning at `source.fan_speed`. The
 * housing, coil and collector are muted while the brine circuit is inactive (`brineActive` false), like the pipes.
 */
export function renderSource(
  context: DrawContext,
  readings: Pick<AnimationReadings, 'source.fan_speed'>,
  brineActive: boolean,
  taps?: Taps,
): SVGTemplateResult {
  const { airUnit: unit, collector } = arrangementOf(context);
  const air = context.source === 'air' || context.source === 'hybrid';
  const ground = context.source === 'ground' || context.source === 'hybrid';
  return svg`<g class="source" data-source-kind=${context.source}>
    ${air && unit !== undefined ? airUnit(unit, readings['source.fan_speed'], !brineActive, taps) : svg``}
    ${ground && collector !== undefined ? collectorBody(collector, !brineActive) : svg``}
  </g>`;
}
