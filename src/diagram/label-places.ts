// The value labels' placements (refine-simplified-layout D1, rework-layouts D7): where each of the values sits in an
// arrangement, as a function of the arrangement's zone constants. Labels.ts reads them from the arrangement; the
// texts, captions and visibility rules stay there. Positions are viewBox points with an alignment: `start` puts the label's
// left edge at x, `end` its right edge, `middle` centres it; y is the vertical centre. They sit where the drawing leaves
// room, and on no pipe (found with `npm run search-places`, checked by the overlap browser tests), every cabinet value in a lane
// of the cabinet frame beside its part (in the horizontal layout the probes' and pumps' values in the column lanes; in the vertical layout the
// rotated values and the pump 15 value in the gaps between vertical pipes beside their part), the pair blocks, the compressor's speed
// and the opening in the row lane under its row. The values of the band's bodies (the source's Out, the DHW temperature) inside their bodies, and, for
// model C, inside tank 50 above its coil. The bodies' labels are functions of the zones: they follow their body.
import type { RolePath } from '../config/roles';
import { MIN_DRAWING_WIDTH, VERTICAL_BELOW } from '../lib/layout';
import { VALUE_CAPTIONS } from '../strings';
import type { BandZones, CabinetZones, ShownLayout, Visibility, Zones } from './geometry';

/**
 * The label font factor of each layout (rework-layouts D8): a label's font is `max(10px, k cqw)`, and the factor is chosen so that
 * the labels are about as tall in viewBox units in both layouts at the threshold. In the horizontal layout (viewBox 1000 wide, 1 cqw
 * = 10 units) the factor is 1.3: the font is the 10 px floor up to a 770 px card and grows with the drawing above it (13 px at
 * 1000 px), so above the threshold a label is never taller in units than at the 10 px floor there, 12 px * 1000 / 560 = 21.4
 * units. In the vertical layout (viewBox 740 wide, 1 cqw = 7.4 units) about the same 21.4 units need a font of 1.2 * k * 7.4 = 21.3,
 * so k = 2.4: the font is the 10 px floor up to a 417 px card (28 units tall at 320 px, the size the place search plans with) and
 * grows with the drawing above it, to 13.4 px at 1 px under the threshold, where a label is 21.3 units tall. Above 417 px a
 * vertical label's box, in units, no longer grows, so the places found at 320 px hold up to the threshold.
 */
export const LABEL_FONT_K: Readonly<Record<ShownLayout, number>> = { horizontal: 1.3, vertical: 2.4 };

/** The label font size of a layout, as the CSS value. */
export const labelFontSize = (layout: ShownLayout): string => `max(10px, ${String(LABEL_FONT_K[layout])}cqw)`;

/** The height of a label's box at the 10 px font floor (line height 1.2), in px. */
export const LABEL_LINE_PX = 12;

/** The viewBox width of each layout's arrangement, in units (geometry.ts: the horizontal x map spans 990 plus the margin, the vertical one 720 plus 20). */
export const VIEWBOX_WIDTH: Readonly<Record<ShownLayout, number>> = { horizontal: 1000, vertical: 740 };

/**
 * The row pitch of a two-row block (a probe pair's temperature over its pressure), in viewBox units, per layout: the label height
 * at the layout's narrowest verified width, where the 10 px floor makes a label tallest in units (the threshold for the horizontal
 * layout, 320 px for the vertical one), plus a unit (WebKit's boxes are a unit taller), rounded up to the place search's 4-unit
 * grid, so the two rows never overlap at any width (rework-layouts D7). The search script reads it too (dev/overlaps.ts
 * `PAIR_ROW_GAP`).
 */
export const PAIR_ROW_GAP: Readonly<Record<ShownLayout, number>> = {
  horizontal: Math.ceil(((LABEL_LINE_PX * VIEWBOX_WIDTH.horizontal) / VERTICAL_BELOW + 1) / 4) * 4,
  vertical: Math.ceil(((LABEL_LINE_PX * VIEWBOX_WIDTH.vertical) / MIN_DRAWING_WIDTH + 1) / 4) * 4,
};

export type Align = 'start' | 'middle' | 'end';

export interface LabelSpec extends Pick<Visibility, 'dhw' | 'source'> {
  /** A unique id, also the `data-label` of the element. */
  id: string;
  role: RolePath;
  /** The manual item the value belongs to; 1 stands for connections 1/2. */
  item?: number;
  x: number;
  y: number;
  align: Align;
  /** A small text in front of the value, where its position alone would not say what it is. */
  caption?: string;
  /** No background plate: the label sits on a tinted body (the external tank's values, the values inside tank 50). */
  bare?: true;
  /** Turned by -90 degrees about its place, so it reads from bottom to top (the vertical layout's values along vertical pipes). */
  rotate?: -90;
}

/** A label's place: a viewBox point, the alignment of the label to it and, for a turned label, its rotation (always centred on the point). */
export interface Placement {
  x: number;
  y: number;
  align: Align;
  rotate?: -90;
}

/** Maps a point of the frame's cabinet to the arrangement's own. */
type PointMap = (x: number, y: number) => readonly [number, number];

export interface PlaceOverride {
  /** The place, from the zones and the point map of the cabinet. */
  at: (z: Zones, map: PointMap) => Placement;
  reason: string;
}

/**
 * The labels of the horizontal arrangement whose default place (the frame's place under the maps, or the zone's) fails
 * and that `npm run search-places -- --layout=horizontal` moved, each with its reason: what the default place's box, with
 * the 2 px margin, meets (the search prints it under "Default place meets"). Every entry is a constant place; the labels
 * of the band's bodies are placed from the zones. No label sits on a pipe.
 */
export const HORIZONTAL_PLACES: Readonly<Record<string, PlaceOverride>> = {};

/**
 * The labels of the vertical arrangement whose default place (the frame's place under the maps) fails and that
 * `npm run search-places -- --layout=vertical --width=320` moved, each with its reason, like `HORIZONTAL_PLACES`.
 */
export const VERTICAL_PLACES: Readonly<Record<string, PlaceOverride>> = (() => {
  /**
   * A place of a cabinet value: the search's place in the arrangement without tank 50's head stretch, lowered by `headShift` where the
   * stretch applies, so it stays beside the same part. `turned`: rotated by -90 degrees, centred on the place.
   */
  const cabinet = (x: number, y: number, align: Align, reason: string, turned: boolean): PlaceOverride => ({
    at: (z) => ({ x, y: y + z.headShift, align, ...(turned ? { rotate: -90 as const } : {}) }),
    reason,
  });
  const ROW =
    'turned -90 degrees along its vertical pipe, in one row with its outlet, return and pressure values at the same height (the search keeps their vertical extents nested, in this order from left to right)';
  return {
    production_out: cabinet(
      56,
      424,
      'middle',
      `the left strip between the outline and riser 1 is 55 units wide: the default place on probe 33 meets it; ${ROW}, under probe 33`,
      true,
    ),
    production_in: cabinet(
      96,
      424,
      'middle',
      `the gap between riser 1 and the trunk is 77 units wide, probe 34's body fills its right side: the default place on probe 34 meets it; ${ROW}, left of the trunk under probe 34`,
      true,
    ),
    production_pressure: cabinet(
      132,
      432,
      'middle',
      `the default place on transducer 38 meets it; ${ROW}, under transducer 38 and next to the return value in the same gap`,
      true,
    ),
    brine_out: cabinet(
      532,
      424,
      'middle',
      `the gap between the suction line and riser 3 is 47 units wide: the default place on probe 31 meets it and riser 3; ${ROW}, under probe 31`,
      true,
    ),
    brine_in: cabinet(
      628,
      424,
      'middle',
      `the default place on probe 32 meets it and riser 4; ${ROW}, right of riser 4, in order after the outlet value`,
      true,
    ),
    brine_pressure: cabinet(
      664,
      420,
      'middle',
      `the default place on transducer 37 meets it and riser 4; ${ROW}, next to the return value in the gap right of riser 4 (123 units wide)`,
      true,
    ),
    brine_pump: cabinet(
      636,
      560,
      'middle',
      'the default place on pump 16 meets it; turned -90 degrees along riser 4, right of the pump in the gap right of riser 4',
      true,
    ),
    production_pump: cabinet(
      192,
      620,
      'start',
      'horizontal, above pump 15 (the search keeps it no lower than its default place): the default place meets valve 27, so it starts 10 units right of it',
      false,
    ),
  };
})();

/**
 * Where each value that the vertical layout draws elsewhere than the horizontal one starts its search (rework-layouts D7): the
 * frame's point of its part, centred on it. `rotate`: the value is turned by -90 degrees (the production and brine hydraulic values
 * along their vertical pipes and the pump 16 value); the pump 15 value stays horizontal, above pump 15. `npm run search-places --
 * --layout=vertical` measures the distance of a place from this point, never from a recorded place.
 */
const VERTICAL_HOMES: Readonly<Record<string, { x: number; y: number; rotate?: true }>> = {
  production_out: { x: 49, y: 112, rotate: true },
  production_in: { x: 126, y: 112, rotate: true },
  production_pressure: { x: 126, y: 142, rotate: true },
  production_pump: { x: 217, y: 366 },
  brine_out: { x: 526, y: 112, rotate: true },
  brine_in: { x: 581, y: 112, rotate: true },
  brine_pressure: { x: 581, y: 142, rotate: true },
  brine_pump: { x: 597, y: 298, rotate: true },
};

const makeSpec = (
  id: string,
  role: RolePath,
  x: number,
  y: number,
  align: Align,
  extra: Partial<Omit<LabelSpec, 'id' | 'role' | 'x' | 'y' | 'align'>> = {},
): LabelSpec => ({ id, role, x, y, align, ...extra });

/** The value labels' places in an arrangement. */
export interface LabelPlaces {
  specs: readonly LabelSpec[];
}

/** The centre of a rectangle. */
const centre = (rect: { x: number; y: number; width: number; height: number }): [number, number] => [
  rect.x + rect.width / 2,
  rect.y + rect.height / 2,
];

/**
 * The row of the external tank's temperature: 44 units under its top edge, centred on it. The rim of the top cap reaches 28
 * units under the top edge, the coil starts 90 under it.
 */
const TANK_TEMPERATURE_DY = 44;

/**
 * The labels of the band's bodies, placed from the zones (rework-layouts D4, harmonize-band D4): the air unit's outside
 * temperature above its fan, its fan speed below it and its Out beside the exit pass (the hybrid has no Out), the
 * collector's Out (at its bottom beside the return riser), and the DHW
 * temperature in the upper part of the external tank, bare on its tinted body. A body that is not in the zones'
 * band key has no label.
 */
function bodySpecs(z: Partial<BandZones>): LabelSpec[] {
  const specs: LabelSpec[] = [];
  const { airUnit, collector, externalTank } = z;
  if (airUnit !== undefined && (z.key?.source === 'air' || z.key?.source === 'hybrid')) {
    const { outside, speed, out } = airUnit.values;
    const air: ['air', 'hybrid'] = ['air', 'hybrid'];
    specs.push(
      makeSpec('outside_temperature', 'source.outside_temperature', ...centre(outside), 'middle', {
        source: air,
        bare: true,
      }),
      makeSpec('fan_speed', 'source.fan_speed', ...centre(speed), 'middle', { source: air, bare: true }),
    );
    // the hybrid's link pipe carries the air unit's outlet, and the Out of the source is the collector's: no Out here
    if (z.key.source === 'air') {
      specs.push(
        makeSpec('air_unit_out', 'source.air_unit_outlet_temperature', out.x, centre(out)[1], 'start', {
          source: ['air'],
          bare: true,
        }),
      );
    }
  }
  if (collector !== undefined && z.key?.source !== undefined && z.key.source !== 'air') {
    const x = collector.out.x + collector.out.width;
    const y = centre(collector.out)[1];
    const hybrid = z.key.source === 'hybrid';
    specs.push(
      makeSpec(hybrid ? 'hybrid_ground_out' : 'ground_out', 'brine.inlet_temperature', x, y, 'end', {
        source: [hybrid ? 'hybrid' : 'ground'],
        bare: true,
      }),
    );
  }
  if (externalTank !== undefined) {
    const x = externalTank.x + externalTank.width / 2;
    specs.push(
      makeSpec('tank_external_temperature', 'dhw.temperature', x, externalTank.y + TANK_TEMPERATURE_DY, 'middle', {
        dhw: 'external',
        bare: true,
      }),
    );
  }
  return specs;
}

/**
 * The placements of an arrangement: each label's place computed from its zones. `place` maps a
 * point of the frame's cabinet to the arrangement's own: the labels at the cabinet's
 * components go through it, the ones placed from the zones (the band's bodies, tank 50) do not.
 * The values of live-values "Values on the drawing": production out and in, brine out and in, the two pressures, the
 * two pumps, the discharge and suction pairs, the compressor speed, the expansion valve opening, the
 * source's Out and the DHW temperature.
 */
export function labelPlacesFor(
  z: CabinetZones & Partial<BandZones>,
  place: (x: number, y: number) => readonly [number, number] = (x, y) => [x, y],
  layout: ShownLayout = 'horizontal',
): LabelPlaces {
  const { internalTank } = z;
  /**
   * Model C's tank temperature: in the strip above coil 51 (about 30 units tall), 16 units under the tank's top, ending 70 units
   * from the left wall (so its left edge is about 7 units in), end-aligned, the place the search finds free at 560 px.
   */
  const INTERNAL_ROW_Y = internalTank.y + 16;
  /** The vertical layout's tank 50 temperature: at the left, in the head the y map adds above coil 51. */
  const vertical = layout === 'vertical';
  const spec = makeSpec;
  const cab: typeof spec = (id, role, x, y, align, extra) => {
    const home = layout === 'vertical' ? VERTICAL_HOMES[id] : undefined;
    if (home !== undefined) {
      const [hx, hy] = place(home.x, home.y);
      return spec(id, role, hx, hy, 'middle', home.rotate === true ? { ...extra, rotate: -90 } : extra);
    }
    const [px, py] = place(x, y);
    return spec(id, role, px, py, align, extra);
  };
  // the rows of a block: the first row's place under the maps, the next ones a row pitch (in the arrangement's units) below
  const gap = PAIR_ROW_GAP[layout];
  const row: (rows: number, ...args: Parameters<typeof spec>) => LabelSpec = (rows, id, role, x, y, align, extra) => {
    const [px, py] = place(x, y);
    return spec(id, role, px, py + rows * gap, align, extra);
  };
  const specs: readonly LabelSpec[] = [
    // production: probes 33 and 34 (Out, In) in the lanes beside them (left of probe 33, between riser 1 and probe 34), pressure 38 under the
    // return value, pump 15's value right of the pump (above its pipe)
    cab('production_out', 'production.outlet_temperature', 38, 112, 'end', {
      item: 33,
      caption: VALUE_CAPTIONS.portOut,
    }),
    cab('production_in', 'production.return_temperature', 115, 112, 'end', {
      item: 34,
      caption: VALUE_CAPTIONS.portIn,
    }),
    cab('production_pressure', 'production.pressure', 115, 142, 'end', { item: 38 }),
    cab('production_pump', 'production.pump', 229, 370, 'start', { item: 15 }),
    // brine: probe 31 (Out) right of riser 3, probe 32 (In) right of riser 4, pressure 37 left of its body, pump 16's value left of the pump
    cab('brine_out', 'brine.outlet_temperature', 544, 112, 'start', { item: 31, caption: VALUE_CAPTIONS.portOut }),
    cab('brine_in', 'brine.inlet_temperature', 609, 112, 'start', { item: 32, caption: VALUE_CAPTIONS.portIn }),
    cab('brine_pressure', 'brine.pressure', 570, 142, 'end', { item: 37 }),
    cab('brine_pump', 'brine.pump', 570, 298, 'end', { item: 16 }),
    // refrigerant: each pair's temperature (30, 29) over its pressure (36, 35) as one two-row block in the row lane under the pair, the
    // compressor's speed in a third row under it, and the expansion valve's opening alone, centred under valve 12
    cab('discharge_temperature', 'compressor.discharge_temperature', 283, 167, 'start', { item: 30 }),
    row(1, 'discharge_pressure', 'compressor.discharge_pressure', 283, 167, 'start', { item: 36 }),
    cab('suction_temperature', 'compressor.suction_temperature', 401, 167, 'start', { item: 29 }),
    row(1, 'suction_pressure', 'compressor.suction_pressure', 401, 167, 'start', { item: 35 }),
    row(2, 'compressor_speed', 'compressor.speed', 360, 167, 'middle', { item: 11 }),
    cab('expansion_valve', 'refrigerant.expansion_valve', 412, 426, 'middle', { item: 12 }),
    // the band's bodies: the source's Out and the external tank's values (bodySpecs)
    ...bodySpecs(z),
    // model C: the DHW temperature inside tank 50 in the strip above coil 51, with no background plate
    spec(
      'tank_internal_temperature',
      'dhw.temperature',
      internalTank.x + (vertical ? 24 : 70),
      vertical ? internalTank.y + 18 : INTERNAL_ROW_Y,
      vertical ? 'start' : 'end',
      {
        dhw: 'internal',
        bare: true,
      },
    ),
  ];
  return { specs };
}
