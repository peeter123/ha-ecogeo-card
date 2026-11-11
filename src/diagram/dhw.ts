// The DHW storage (add-schematic-card D5, D7; dhw-storage spec): an external tank with a coil right of the cabinet (model B,
// connections 5 "DHW inter-accumulator outlet" and 6 "inlet"), the integrated tank of model C, or none.
//
// - External: this file draws the tank body and its caption. The pipes from ports 5/6 (up into the run and right to
//   the zone) and the coil inside the tank are segments in geometry.ts (dhw_ext_in, dhw_ext_coil, dhw_ext_out), so
//   pipes.ts colours and animates them like every other pipe. The tank is not a manual item.
// - Internal (model C): items 50 (tank), 51 (coil), 52 (manual trap), 53 (drain valve), 54 (DHW probe) and the
//   connections 47/48/49 are components in geometry.ts, drawn by the cabinet with the symbols of symbols.ts.
// - None: nothing is drawn (no tank, no pipes, no ports 5/6, no valve 26).
//
// The tank body hook (add-schematic-card D7: the body takes the DHW temperature on the card's colour scale): both
// tank bodies are a `.tank-body` shape (a path for the external cylinder, a rect for tank 50) with a `data-dhw-tank` attribute, filled from the custom property
// `--dhw-tank-color` (no fill while it is not set). A muted body (DHW temperature unavailable) gets the muted colour
// through the same property. The values (temperature, setpoint, start delta-T, demand) go under the external tank
// (centred on it, below its bottom edge: EXTERNAL_TANK) for the external one, and inside tank 50, one row above coil 51 (refine-schematic-drawing D8b), for the internal one (labels.ts).
import { css, nothing, svg, type SVGTemplateResult } from 'lit';
import { DHW_LABELS } from '../strings';
import { EXTERNAL_TANK_ROLE, focusRingStyles, tapBindings, tapTarget, type Taps } from './component-info';
import { EXTERNAL_TANK, externalTankBody, type DrawContext } from './geometry';

export const dhwStyles = css`
  .tank-body {
    stroke: var(--primary-text-color);
    stroke-width: max(2.5, var(--outline-width, 2));
  }
  .tank-rim {
    fill: none;
    stroke: var(--primary-text-color);
    stroke-width: calc(var(--outline-width, 2) * 0.75);
    stroke-opacity: 0.6;
  }
  .dhw-storage[role='button'] {
    cursor: pointer;
  }
  .dhw-storage[role='button']:focus-visible {
    ${focusRingStyles}
  }
  .tank-caption {
    fill: var(--secondary-text-color);
    font-size: 11px;
  }
`;

/**
 * The DHW storage outside the cabinet: the external tank's body (a rounded cylinder) and caption (a button for the DHW temperature's
 * more-info, with its name as tooltip); the other storages draw nothing here.
 */
export function renderDhw(context: DrawContext, taps?: Taps): SVGTemplateResult {
  if (context.dhw !== 'external') return svg``;
  const { x, y, width, dome } = EXTERNAL_TANK;
  const rx = width / 2;
  // straight walls with elliptical domed caps: the top cap's lower arc is drawn as a rim
  const body = externalTankBody();
  const rim = `M${String(x)} ${String(y + dome)} A${String(rx)} ${String(dome)} 0 0 0 ${String(x + width)} ${String(y + dome)}`;
  const tap = tapBindings(tapTarget(EXTERNAL_TANK_ROLE, taps), taps?.onTap);
  return svg`<g class="dhw-storage" data-dhw="external" aria-label=${DHW_LABELS.externalTank} role=${tap.role} tabindex=${tap.tabindex} @click=${tap.click} @keydown=${tap.keydown}>
    <title>${DHW_LABELS.externalTank}</title>
    <path class="tank-body" data-dhw-tank="external" d=${body} fill="var(--dhw-tank-color, none)" fill-opacity="0.25" />
    <path class="tank-rim" d=${rim} />
    ${context.captions === false ? nothing : svg`<text class="tank-caption" x=${x + width / 2} y=${y - 6} text-anchor="middle">${DHW_LABELS.externalTank}</text>`}
  </g>`;
}
