// The DHW storage (add-schematic-card D5, D7; rework-layouts D2; dhw-storage spec): an external tank with a coil in the band above
// ports 5 "DHW inter-accumulator outlet" and 6 "inlet" (model B), the integrated tank 50 of model C inside the cabinet, or none.
//
// - External: this file draws the tank body (no caption: its tooltip names it). The pipes from ports 5/6 up into the band and the coil
//   inside the tank are segments in geometry.ts (dhw_ext_in, dhw_ext_coil, dhw_ext_out), so pipes.ts colours and animates them like
//   every other pipe. The tank is not a manual item.
// - Internal (model C): items 50 (tank), 51 (coil) and 54 (DHW probe) and the connections 47/48/49 are components in geometry.ts, drawn
//   by the cabinet with the symbols of symbols.ts. Items 52 (manual trap) and 53 (drain valve) are service parts and not drawn.
// - Unused (`dhw: unused`): the model's tank (chosen by geometry.ts `drawnStorage`) is drawn as above but muted through
//   `partState`: the body, outline and rim take the muted colour and no values are shown.
// - None: nothing is drawn (no tank, no pipes, no ports 5/6, no valve 26).
//
// The tank body hook (add-schematic-card D7: the body takes the DHW temperature on the card's colour scale): both
// tank bodies are a `.tank-body` shape (a path for the external cylinder, a rect for tank 50) with a `data-dhw-tank` attribute, filled
// from the custom property `--dhw-tank-color` (no fill while it is not set). A muted body (DHW temperature unavailable) gets the muted
// colour through the same property. The DHW temperature goes inside the tank (labels.ts); in tank 50 it sits above
// coil 51.
import { css, svg, type SVGTemplateResult } from 'lit';
import { DHW_LABELS } from '../strings';
import { EXTERNAL_TANK_ROLE, focusRingStyles, tapBindings, tapTarget, type Taps } from './component-info';
import { arrangementOf, drawnStorage, externalTankBody, type DrawContext } from './geometry';

export const dhwStyles = css`
  .tank-body {
    stroke: var(--primary-text-color);
    stroke-width: max(2.5, var(--outline-width, 2));
  }
  /* An unused tank (dhw: unused): outline and rim muted as well as the fill (tank 50 is a muted symbol group). */
  .symbol-group.muted .tank-body,
  .dhw-storage.muted .tank-body,
  .dhw-storage.muted .tank-rim {
    stroke: var(--disabled-text-color);
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
`;

/**
 * The DHW storage outside the cabinet: the external tank's body (a rounded cylinder; a button for the DHW temperature's
 * more-info, with its name as tooltip); the other storages draw nothing here.
 */
export function renderDhw(context: DrawContext, taps?: Taps): SVGTemplateResult {
  if (drawnStorage(context) !== 'external') return svg``;
  const arrangement = arrangementOf(context);
  if (arrangement.externalTank === undefined) return svg``;
  const { x, y, width, dome } = arrangement.externalTank;
  const rx = width / 2;
  // straight walls with elliptical domed caps: the top cap's lower arc is drawn as a rim
  const body = externalTankBody(arrangement);
  const rim = `M${String(x)} ${String(y + dome)} A${String(rx)} ${String(dome)} 0 0 0 ${String(x + width)} ${String(y + dome)}`;
  const tap = tapBindings(tapTarget(EXTERNAL_TANK_ROLE, taps), taps?.onTap);
  return svg`<g class=${context.dhw === 'unused' ? 'dhw-storage muted' : 'dhw-storage'} data-dhw="external" aria-label=${DHW_LABELS.externalTank} role=${tap.role} tabindex=${tap.tabindex} @click=${tap.click} @keydown=${tap.keydown}>
    <title>${DHW_LABELS.externalTank}</title>
    <path class="tank-body" data-dhw-tank="external" d=${body} fill="var(--dhw-tank-color, none)" fill-opacity="0.25" />
    <path class="tank-rim" d=${rim} />
    <rect class="obstacle" data-obstacle="tank-rim" x=${x} y=${y + dome} width=${width} height=${dome} fill="none" stroke="none" />
  </g>`;
}
