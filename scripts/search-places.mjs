// `npm run search-places -- --layout=horizontal|vertical`: searches the label places of a layout (refine-simplified-layout
// D7, add-compact-layout D8, rework-layouts D7). For every one of the 18 values it finds, over every emulator scenario,
// installation and naming at the layout's narrowest verified width, the places where the label overlaps no component, no
// pipe at its rendered width, no other label and no outline (the cabinet's, a body's), stays inside the drawing, and, for a
// label inside a body (BODY_LABELS of dev/overlaps.ts: tank 50, the external tank, the air unit, the collector, the emitter), inside that body, with about 2 px of margin
// (Chromium and WebKit differ by 1-2 px in text width). There is no on-pipe set and no pipe-free option: a label without a
// place is reported and is a decision point (design Risks), not an exception. Of the feasible places it takes the one
// nearest the label's default place (its probe or component, before the recorded places), most constrained label first.
//
// How: the card is opened in the emulator in the chosen layout and measured with dev/overlaps.ts (pipes: true), so the
// obstacles are what renders. The obstacles are rasterised on a 0.25 px grid and a summed-area table answers "does this
// box hit one" in constant time. A candidate is a point of a 4 unit grid of the viewBox with an alignment (start, middle,
// end), its box the label's rendered size (the widest value of every case counts). A place must be feasible in every case
// the label exists in. The other labels are obstacles in a second step, at their widest, greedy by fewest places.
//
// Output: a table to paste into HORIZONTAL_PLACES or VERTICAL_PLACES (src/diagram/label-places.ts; a place that equals the
// label's default needs no entry), and, per label, how many places the search found. Rerun it after any change of the
// drawing's arrangement or of the label texts.
// Options: `--layout=horizontal|vertical` (default horizontal), `--width=N` (the search width: default the vertical
// threshold VERTICAL_BELOW for the horizontal layout, 320 for the vertical one), `--step=4` (the grid in viewBox units),
// `--margin=2` (px, horizontal), `--map` (prints where each label can go), `--quick` (the first naming, installation and scenario only), `--scenario=`, `--installation=` and `--naming=` (one of each, to iterate on a place), `--browser=chromium|webkit` (default chromium;
// use webkit on a host where Chromium measures text with whole-pixel advances, see the font smoothing note in
// docs/ecogeo-card.md). Starts and stops its own Vite server, like measure-layout.mjs.
/// <reference lib="dom" />
/* global document, HTMLElement, requestAnimationFrame */
import { fileURLToPath } from 'node:url';
import { chromium, webkit } from 'playwright';
import { createServer } from 'vite';

const KNOWN = [
  '--layout=',
  '--width=',
  '--step=',
  '--margin=',
  '--browser=',
  '--map',
  '--quick',
  '--scenario=',
  '--installation=',
  '--naming=',
];
const unknown = process.argv.slice(2).filter((arg) => !KNOWN.some((known) => arg.startsWith(known)));
if (unknown.length > 0) {
  console.error(
    `Unknown option: ${unknown.join(' ')}. Options: --layout=horizontal|vertical --width=N --step=N --margin=N (a number above 0, no space) --browser=chromium|webkit --map --quick --scenario=NAME --installation=NAME --naming=NAME`,
  );
  process.exit(2);
}
/** @param {string} name @param {number} fallback */
const option = (name, fallback) => {
  const arg = process.argv.find((a) => a.startsWith(`--${name}=`));
  if (arg === undefined) return fallback;
  const value = Number(arg.slice(name.length + 3));
  if (!Number.isFinite(value) || value <= 0) {
    console.error(`--${name} needs a number above 0, got "${arg.slice(name.length + 3)}"`);
    process.exit(2);
  }
  return value;
};
/** @param {string} name @param {readonly string[]} allowed @param {string} fallback */
const choice = (name, allowed, fallback) => {
  const arg = process.argv.find((a) => a.startsWith(`--${name}=`));
  const value = arg === undefined ? fallback : arg.slice(name.length + 3);
  if (!allowed.includes(value)) {
    console.error(`--${name} needs one of ${allowed.join(', ')}, got "${value}"`);
    process.exit(2);
  }
  return value;
};
const LAYOUT = choice('layout', ['horizontal', 'vertical'], 'horizontal');
const BROWSER = choice('browser', ['chromium', 'webkit'], 'chromium');
const WIDTH_OPTION = option('width', 0);
const STEP = option('step', 4);
const MARGIN_X = option('margin', 2);
const MARGIN_Y = 1;
/** The finest obstacle cell, in px. */
const CELL = 0.25;
const ALIGNS = /** @type {const} */ (['start', 'middle', 'end']);

/**
 * Runs in the page: for each label of the card, which candidate places are free of obstacles, as packed bits.
 * @param {{ step: number; cell: number; marginX: number; marginY: number; bodies: Readonly<Record<string, string>>; homes: Readonly<Record<string, { x: number; y: number; align: string }>>; partners: Readonly<Record<string, string>>; rows: number; headShift: number }} options
 */
async function searchInPage({ step, cell, marginX, marginY, bodies, homes, partners, rows, headShift }) {
  const path = '/dev/overlaps.ts';
  const shared = await import(path);
  const root = document.querySelector('ecogeo-card')?.shadowRoot;
  if (!root) throw new Error('the card has no shadow root');
  const m = shared.measureCard(root, { pipes: true });
  const { drawing, cabinet } = m;
  const svg = root.querySelector('.diagram svg');
  if (drawing === undefined || cabinet === undefined || svg === null) throw new Error('no drawing or cabinet');
  const vb = /** @type {SVGSVGElement} */ (svg).viewBox.baseVal;
  const dw = drawing.right - drawing.left;
  const dh = drawing.bottom - drawing.top;
  const scale = dw / vb.width;
  const tol = shared.TOLERANCE;

  // the obstacles, rasterised in px relative to the drawing's top left corner
  const gw = Math.ceil(dw / cell) + 1;
  const gh = Math.ceil(dh / cell) + 1;
  /**
   * A test "does any obstacle lie in the box" (px relative to the drawing, the box shrunk by the tolerance): the boxes
   * rasterised, with a summed-area table.
   * @param {readonly { left: number; right: number; top: number; bottom: number }[]} boxes
   */
  const obstacles = (boxes) => {
    const grid = new Uint8Array(gw * gh);
    for (const b of boxes) {
      const x0 = Math.max(0, Math.floor((b.left - drawing.left) / cell));
      const x1 = Math.min(gw, Math.ceil((b.right - drawing.left) / cell));
      const y0 = Math.max(0, Math.floor((b.top - drawing.top) / cell));
      const y1 = Math.min(gh, Math.ceil((b.bottom - drawing.top) / cell));
      for (let y = y0; y < y1; y += 1) for (let x = x0; x < x1; x += 1) grid[y * gw + x] = 1;
    }
    // sat[y * (gw + 1) + x] = obstacle cells in [0, x) x [0, y)
    const sw = gw + 1;
    const sat = new Int32Array(sw * (gh + 1));
    for (let y = 0; y < gh; y += 1) {
      let row = 0;
      for (let x = 0; x < gw; x += 1) {
        row += grid[y * gw + x] ?? 0;
        sat[(y + 1) * sw + x + 1] = (sat[y * sw + x + 1] ?? 0) + row;
      }
    }
    return (/** @type {number} */ l, /** @type {number} */ r, /** @type {number} */ t, /** @type {number} */ b) => {
      const x0 = Math.max(0, Math.floor((l + tol) / cell));
      const x1 = Math.min(gw, Math.ceil((r - tol) / cell));
      const y0 = Math.max(0, Math.floor((t + tol) / cell));
      const y1 = Math.min(gh, Math.ceil((b - tol) / cell));
      if (x1 <= x0 || y1 <= y0) return false;
      const total =
        (sat[y1 * sw + x1] ?? 0) - (sat[y0 * sw + x1] ?? 0) - (sat[y1 * sw + x0] ?? 0) + (sat[y0 * sw + x0] ?? 0);
      return total > 0;
    };
  };
  const pipeBoxes = (m.pipes ?? []).flatMap((/** @type {{ squares: object[] }} */ pipe) => pipe.squares);
  const hits = obstacles([...m.parts, ...pipeBoxes]);
  const cab = {
    left: cabinet.left - drawing.left,
    right: cabinet.right - drawing.left,
    top: cabinet.top - drawing.top,
    bottom: cabinet.bottom - drawing.top,
  };
  const nx = Math.floor(vb.width / step) + 1;
  // the same number of rows in every case, so that the packed bits line up
  const ny = rows;
  // where tank 50 is drawn the vertical layout stretches its head: the cabinet's labels (not the bodies') lie `headShift` units lower
  const shift = root.querySelector('[data-dhw-tank="internal"]') === null ? 0 : headShift;
  /** @param {string} id */
  // (a label whose default place is above the cabinet lies in the join lane, which the head does not move)
  const shiftOf = (id) =>
    bodies[id] !== undefined || (homes[id] !== undefined && homes[id].y * scale < cab.top) ? 0 : shift;
  const aligns = ['start', 'middle', 'end'];
  const results = [];
  // why each label's default place (its home, before the recorded places) fails: what its box, with the margin, overlaps
  /** @param {{ left: number; right: number; top: number; bottom: number }} a @param {{ left: number; right: number; top: number; bottom: number }} b */
  const meets = (a, b) =>
    Math.min(a.right, b.right) - Math.max(a.left, b.left) > tol &&
    Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > tol;
  const homeBoxes = m.labels.map(
    (/** @type {{ id: string; left: number; right: number; top: number; bottom: number }} */ label) => {
      const home = homes[label.id];
      const w = label.right - label.left;
      const h = label.bottom - label.top;
      // a body's label is placed from its zones (it follows its body): its home is where it renders
      if (bodies[label.id] !== undefined) {
        return {
          id: label.id,
          box: {
            left: label.left - drawing.left - marginX,
            right: label.right - drawing.left + marginX,
            top: label.top - drawing.top - marginY,
            bottom: label.bottom - drawing.top + marginY,
          },
        };
      }
      if (home === undefined) return { id: label.id, box: undefined };
      const x = home.x * scale + 0;
      const left = home.align === 'start' ? x : home.align === 'end' ? x - w : x - w / 2;
      const y = (home.y + shiftOf(label.id)) * scale;
      return {
        id: label.id,
        box: { left: left - marginX, right: left + w + marginX, top: y - h / 2 - marginY, bottom: y + h / 2 + marginY },
      };
    },
  );
  /** @param {string} id */
  const homeHits = (id) => {
    const mine = homeBoxes.find((/** @type {{ id: string }} */ entry) => entry.id === id)?.box;
    if (mine === undefined) return [];
    /** @type {string[]} */
    const hit = [];
    for (const part of m.parts) {
      const rel = {
        left: part.left - drawing.left,
        right: part.right - drawing.left,
        top: part.top - drawing.top,
        bottom: part.bottom - drawing.top,
      };
      if (meets(mine, rel) && bodies[id] !== part.id) hit.push(part.id);
    }
    for (const pipe of m.pipes ?? []) {
      if (
        pipe.squares.some((/** @type {{ left: number; right: number; top: number; bottom: number }} */ q) =>
          meets(mine, {
            left: q.left - drawing.left,
            right: q.right - drawing.left,
            top: q.top - drawing.top,
            bottom: q.bottom - drawing.top,
          }),
        )
      )
        hit.push(pipe.id);
    }
    for (const other of homeBoxes)
      // the two rows of a block keep their fixed pitch: a row's margin does not count against its partner
      if (other.id !== id && partners[id] !== other.id && other.box !== undefined && meets(mine, other.box))
        hit.push(`label:${other.id}`);
    if (mine.left < 0 || mine.top < 0 || mine.right > dw || mine.bottom > dh) hit.push('edge');
    const overlapsCabinet = meets(mine, cab);
    const withinCabinet =
      mine.left >= cab.left - tol &&
      mine.right <= cab.right + tol &&
      mine.top >= cab.top - tol &&
      mine.bottom <= cab.bottom + tol;
    if (overlapsCabinet && !withinCabinet) hit.push('cabinet');
    // a value inside a body stays inside that body's box
    const bodyOf =
      bodies[id] === undefined
        ? undefined
        : m.parts.find((/** @type {{ id: string }} */ part) => part.id === bodies[id]);
    if (
      bodyOf !== undefined &&
      !(
        mine.left >= bodyOf.left - drawing.left &&
        mine.right <= bodyOf.right - drawing.left &&
        mine.top >= bodyOf.top - drawing.top &&
        mine.bottom <= bodyOf.bottom - drawing.top
      )
    )
      hit.push(`outside:${bodyOf.id}`);
    return hit;
  };
  for (const label of m.labels) {
    // a label inside a body (tank 50, the external tank, the air unit, the ground collector) stays inside that body's box and
    // ignores the body as an obstacle; the obstacles the body registers (coil panel, fan, hatching, serpentine) still count
    const bodyId = bodies[label.id];
    const body =
      bodyId === undefined ? undefined : m.parts.find((/** @type {{ id: string }} */ part) => part.id === bodyId);
    const hitsOwn =
      body === undefined
        ? hits
        : obstacles([...m.parts.filter((/** @type {object} */ part) => part !== body), ...pipeBoxes]);
    const rel =
      body === undefined
        ? undefined
        : {
            left: body.left - drawing.left,
            right: body.right - drawing.left,
            top: body.top - drawing.top,
            bottom: body.bottom - drawing.top,
          };
    const vMargin = marginY;
    const w = label.right - label.left;
    const h = label.bottom - label.top;
    const bits = new Uint8Array(Math.ceil((aligns.length * ny * nx) / 8));
    let at = 0;
    for (const align of aligns) {
      for (let iy = 0; iy < ny; iy += 1) {
        for (let ix = 0; ix < nx; ix += 1, at += 1) {
          // a turned (rotated) label is centred on its place: only the middle alignment is a candidate
          if (label.rotated === true && align !== 'middle') continue;
          const x = ix * step * scale;
          const y = (iy * step + shiftOf(label.id)) * scale;
          const left = align === 'start' ? x : align === 'end' ? x - w : x - w / 2;
          // the box with its margin
          const l = left - marginX;
          const r = left + w + marginX;
          const t = y - h / 2 - vMargin;
          const b = y + h / 2 + vMargin;
          if (l < 0 || t < 0 || r > dw || b > dh) continue;
          if (rel !== undefined && !(l >= rel.left && r <= rel.right && t >= rel.top && b <= rel.bottom)) continue;
          // a label never crosses the cabinet's outline: wholly inside it or wholly outside it
          const overlapsCabinet =
            Math.min(r, cab.right) - Math.max(l, cab.left) > tol &&
            Math.min(b, cab.bottom) - Math.max(t, cab.top) > tol;
          const withinCabinet =
            l >= cab.left - tol && r <= cab.right + tol && t >= cab.top - tol && b <= cab.bottom + tol;
          if (overlapsCabinet && !withinCabinet) continue;
          if (hitsOwn(l, r, t, b)) continue;
          bits[at >> 3] = (bits[at >> 3] ?? 0) | (1 << (at & 7));
        }
      }
    }
    let text = '';
    for (const byte of bits) text += String.fromCharCode(byte);
    // the default place itself is a candidate too, when it is free: the 4-unit grid cannot hit a place that is only a few
    // units wide (a two-row block between two lines), and a free default place needs no entry (tested exactly, not on the
    // raster: such a block is free by a fraction of a pixel)
    // (a value inside a body is placed from the body's zone: its home is where it renders, and it is free when nothing meets it there)
    const homeFree = (homes[label.id] !== undefined || bodyId !== undefined) && homeHits(label.id).length === 0;
    results.push({
      id: label.id,
      w: w / scale,
      h: h / scale,
      bits: btoa(text),
      homeHits: homeHits(label.id),
      homeFree,
      rotated: label.rotated === true,
    });
  }
  return { vb: { width: vb.width, height: vb.height }, labels: results };
}

const server = await createServer({
  root: fileURLToPath(new URL('..', import.meta.url)),
  logLevel: 'error',
  server: { port: 5312, strictPort: false },
});
await server.listen();
// the search width: the horizontal layout's threshold or the vertical layout's narrowest verified width
const { VERTICAL_BELOW } = /** @type {{ VERTICAL_BELOW: number }} */ (await server.ssrLoadModule('/src/lib/layout.ts'));
// the label font factor of the layout: a label's font is max(10px, k cqw), so its box grows with the card above the floor
const { LABEL_FONT_K } = /** @type {{ LABEL_FONT_K: Readonly<Record<string, number>> }} */ (
  await server.ssrLoadModule('/src/diagram/label-places.ts')
);
const FONT_K = LABEL_FONT_K[LAYOUT] ?? 1;
/** The label font in px at a card width (the 10 px floor, or `k` cqw above it). */
const fontPx = (/** @type {number} */ width) => Math.max(10, (FONT_K * width) / 100);
const WIDTH = WIDTH_OPTION > 0 ? WIDTH_OPTION : LAYOUT === 'vertical' ? 320 : VERTICAL_BELOW;
/** @type {import('playwright').Browser | undefined} */
let browser;
/** @type {Map<string, { feasible: Uint8Array; w: number; h: number; sizes: Map<number, { w: number; h: number }>; homeHits: Map<string, number>; homeFree: boolean; rotated: boolean }>} */
const found = new Map();
/** @type {{ width: number; height: number } | undefined} */
let viewBox;
/** @type {Record<string, { x: number; y: number; align: string }>} */
const homes = {};
/** @type {Readonly<Record<string, string>> | undefined} */
let loadedBodies;
/** @type {readonly (readonly [string, string])[] | undefined} */
let outInPairs;
/** @type {readonly (readonly [string, string])[] | undefined} */
let blockPairs;
/** @type {readonly (readonly [string, string, string])[] | undefined} */
let rowGroups;
/** @type {number | undefined} */
let rowGap;
/** The rows of the candidate grid: the same for every case, the tallest drawing's (tank 50's head stretches the vertical one). */
const grid = { rows: 0, headShift: 0 };
/** @type {((out: object, inn: object) => boolean) | undefined} */
let loadedInOrder;
let cases = 0;
try {
  const base = server.resolvedUrls?.local[0];
  if (!base) throw new Error('the Vite server did not report a URL');
  const scenarios = await server.ssrLoadModule('/dev/scenarios.ts');
  const overlaps = await server.ssrLoadModule('/dev/overlaps.ts');
  const foreign = await server.ssrLoadModule('/dev/foreign.ts');
  const geometry = await server.ssrLoadModule('/src/diagram/geometry.ts');
  const names = /** @type {readonly string[]} */ (scenarios['SCENARIO_NAMES']);
  const installations = /** @type {readonly { name: string; query: string }[]} */ (overlaps['INSTALLATIONS']);
  const namings = /** @type {readonly string[]} */ (foreign['NAMINGS']);
  loadedBodies = overlaps['BODY_LABELS'];
  const tallest = [false, true].map(
    (internal) =>
      geometry['arrangementFor'](LAYOUT, { source: 'hybrid', tank: !internal, emitter: 'underfloor', internal }).viewBox
        .height,
  );
  grid.rows = Math.floor(Math.max(...tallest) / STEP) + 1;
  grid.headShift = LAYOUT === 'vertical' ? geometry['VERTICAL_TANK_HEAD'].extra : 0;
  outInPairs = overlaps['OUT_IN_PAIRS'];
  blockPairs = overlaps['BLOCK_PAIRS'];
  rowGroups = overlaps['ROW_GROUPS'];
  rowGap = overlaps['PAIR_ROW_GAP'][LAYOUT];
  loadedInOrder = overlaps['inOrder'];
  // each label's own place: its default place under the maps, before HORIZONTAL_PLACES (a rerun never measures from a
  // recorded place)
  for (const [emitter, internal] of [
    ['underfloor', true],
    ['underfloor', false],
    ['none', false],
  ]) {
    const key = { source: 'hybrid', tank: !internal, emitter, internal };
    for (const spec of geometry['defaultLabelPlaces'](LAYOUT, key).specs) {
      homes[spec.id] = { x: spec.x, y: spec.y, align: spec.align };
    }
  }

  browser = await (BROWSER === 'webkit' ? webkit : chromium).launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 1000 } });
  /** @type {string[]} */
  const problems = [];
  page.on('pageerror', (error) => problems.push(error.message));
  // `--quick`: the first naming, installation and scenario only, to iterate on a place (the result is not a recorded one)
  const quick = process.argv.includes('--quick');
  /** @template T @param {string} flag @param {readonly T[]} all @param {(entry: T) => string} nameOf @returns {readonly T[]} */
  const pick = (flag, all, nameOf) => {
    const arg = process.argv.find((a) => a.startsWith(`--${flag}=`))?.slice(flag.length + 3);
    const chosen = arg === undefined ? (quick ? all.slice(0, 1) : all) : all.filter((entry) => nameOf(entry) === arg);
    if (chosen.length === 0) throw new Error(`--${flag}=${String(arg)}: no such case`);
    return chosen;
  };
  for (const naming of pick('naming', namings, (n) => n)) {
    for (const installation of pick('installation', installations, (i) => i.name)) {
      for (const name of pick('scenario', names, (n) => n)) {
        const query = `scenario=${name}&${installation.query}&naming=${naming}&layout=${LAYOUT}`;
        await page.goto(new URL(`dev/index.html?${query}`, base).href);
        await page.locator('#cards[data-ready]').waitFor();
        if (await page.locator('.error:not([hidden])').count()) {
          throw new Error(`${name}: ${await page.locator('.error').innerText()}`);
        }
        await page.evaluate((w) => {
          const slot = document.querySelector('.slot');
          if (slot instanceof HTMLElement) slot.style.width = `${String(w)}px`;
        }, WIDTH);
        await page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))));
        const result = await page.evaluate(searchInPage, {
          step: STEP,
          cell: CELL,
          marginX: MARGIN_X,
          marginY: MARGIN_Y,
          bodies: loadedBodies ?? {},
          rows: grid.rows,
          headShift: grid.headShift,
          homes,
          partners: Object.fromEntries(
            (blockPairs ?? []).flatMap(([top, bottom]) => [
              [top, bottom],
              [bottom, top],
            ]),
          ),
        });
        viewBox = result.vb;
        for (const label of result.labels) {
          const bits = Buffer.from(label.bits, 'base64');
          const entry = found.get(label.id);
          if (entry === undefined) {
            found.set(label.id, {
              feasible: Uint8Array.from(bits),
              w: label.w,
              h: label.h,
              sizes: new Map([[cases, { w: label.w, h: label.h }]]),
              homeHits: new Map(label.homeHits.map((/** @type {string} */ hit) => [hit, 1])),
              homeFree: label.homeFree,
              rotated: label.rotated === true,
            });
          } else {
            for (let i = 0; i < bits.length; i += 1) entry.feasible[i] = (entry.feasible[i] ?? 0) & (bits[i] ?? 0);
            entry.w = Math.max(entry.w, label.w);
            entry.h = Math.max(entry.h, label.h);
            entry.sizes.set(cases, { w: label.w, h: label.h });
            entry.homeFree = entry.homeFree && label.homeFree;
            for (const hit of label.homeHits) entry.homeHits.set(hit, (entry.homeHits.get(hit) ?? 0) + 1);
          }
        }
        cases += 1;
      }
    }
  }
  if (problems.length > 0) throw new Error(`page errors: ${problems.join('; ')}`);
} finally {
  await browser?.close();
  await server.close();
}
if (viewBox === undefined) throw new Error('nothing measured');
const ids = [...found.keys()];

const nx = Math.floor(viewBox.width / STEP) + 1;
const ny = grid.rows;
/** The feasible places of a label: viewBox points with an alignment. */
const placesOf = (/** @type {Uint8Array} */ bits) => {
  /** @type {{ x: number; y: number; align: (typeof ALIGNS)[number] }[]} */
  const places = [];
  let at = 0;
  for (const align of ALIGNS)
    for (let iy = 0; iy < ny; iy += 1)
      for (let ix = 0; ix < nx; ix += 1, at += 1)
        if (((bits[at >> 3] ?? 0) & (1 << (at & 7))) !== 0) places.push({ x: ix * STEP, y: iy * STEP, align });
  return places;
};
/** The label's box in viewBox units, with the margin (px at the search width, in units). */
const unit = viewBox.width / WIDTH;
const boxOf = (
  /** @type {{ x: number; y: number; align: string }} */ p,
  /** @type {{ w: number; h: number }} */ size,
  extra = 0,
) => {
  const left = p.align === 'start' ? p.x : p.align === 'end' ? p.x - size.w : p.x - size.w / 2;
  return {
    left: left - MARGIN_X * unit * (1 + extra),
    right: left + size.w + MARGIN_X * unit * (1 + extra),
    top: p.y - size.h / 2 - MARGIN_Y * unit * (1 + extra),
    bottom: p.y + size.h / 2 + MARGIN_Y * unit * (1 + extra),
  };
};
const apart = (/** @type {ReturnType<typeof boxOf>} */ a, /** @type {ReturnType<typeof boxOf>} */ b) =>
  a.right <= b.left || b.right <= a.left || a.bottom <= b.top || b.bottom <= a.top;
/** Whether two labels at two places stay apart in every case that shows both (each case has its own text widths). */
const apartEverywhere = (
  /** @type {string} */ idA,
  /** @type {{ x: number; y: number; align: string }} */ a,
  /** @type {string} */ idB,
  /** @type {{ x: number; y: number; align: string }} */ b,
) => {
  const sizesA = found.get(idA)?.sizes ?? new Map();
  const sizesB = found.get(idB)?.sizes ?? new Map();
  for (const [index, sizeA] of sizesA) {
    const sizeB = sizesB.get(index);
    if (sizeB !== undefined && !apart(boxOf(a, sizeA), boxOf(b, sizeB))) return false;
  }
  return true;
};

/**
 * The Out and In values that read as a pair (production, brine): each keeps its home alignment, and the pair is in order
 * (dev/overlaps.ts inOrder: the Out box left of the In box, or above it in a column) at every case's real widths, at the search
 * width, at about the middle and at the far end of the layout's range (1000 px horizontal, 1 px under the threshold vertical).
 */
/** The values that sit above their part: the vertical layout's pump 15 value (schematic-drawing "Gap places in the vertical layout"). */
const ABOVE_ONLY = new Set(LAYOUT === 'vertical' ? ['production_pump'] : []);
/** The vertical layout's rotated rows (Out, In, pressure left to right): their Out and In are no ordinary pair. */
const GROUPS = LAYOUT === 'vertical' ? (rowGroups ?? []) : [];
const inGroup = new Set(GROUPS.flat());
const PAIRS = (outInPairs ?? []).filter(([out]) => !inGroup.has(out));
/** The refrigerant pairs' two-row blocks: same alignment and x, the pressure `rowGap` units under the temperature. */
const BLOCKS = blockPairs ?? [];
const isBlock = (/** @type {string} */ id) => BLOCKS.some((pair) => pair[0] === id);
const inBlock = (
  /** @type {{ x: number; y: number; align: string }} */ top,
  /** @type {{ x: number; y: number; align: string }} */ bottom,
) => top.align === bottom.align && top.x === bottom.x && bottom.y - top.y === Number(rowGap);
const inOrder = loadedInOrder ?? (() => false);
const WIDE = LAYOUT === 'vertical' ? VERTICAL_BELOW - 1 : 1000;
/** A label's box at a place, in px at a card width (the text's size is the font's: the same in px up to the width where `k` cqw passes 10 px, then growing with the card). */
const pxBoxAt = (
  /** @type {{ x: number; y: number; align: string }} */ place,
  /** @type {{ w: number; h: number }} */ size,
  /** @type {number} */ width,
) => {
  const grow = fontPx(width) / fontPx(WIDTH);
  const w = ((size.w * WIDTH) / viewBox.width) * grow;
  const h = ((size.h * WIDTH) / viewBox.width) * grow;
  const x = (place.x * width) / viewBox.width;
  const left = place.align === 'start' ? x : place.align === 'end' ? x - w : x - w / 2;
  const y = (place.y * width) / viewBox.width;
  return { left, right: left + w, top: y - h / 2, bottom: y + h / 2 };
};
/**
 * inOrder with the margin of the search (the two text widths differ by 1-2 px between Chromium and WebKit): the Out box is
 * left of the In box by the margin, or overlaps it horizontally by twice the margin (so it stays a column) and is above it by
 * the margin. A pair that is near the edge of either state is not accepted.
 */
const inOrderWithMargin = (
  /** @type {{ left: number; right: number; top: number; bottom: number }} */ out,
  /** @type {{ left: number; right: number; top: number; bottom: number }} */ inn,
) => {
  const overlapX = Math.min(out.right, inn.right) - Math.max(out.left, inn.left);
  return (
    inOrder(out, inn) &&
    (out.right + MARGIN_X <= inn.left || (overlapX >= 2 * MARGIN_X && out.bottom + MARGIN_Y <= inn.top))
  );
};
/** Whether an Out place and an In place are in order at every width of the range, in every case showing both. */
const inOrderEverywhere = (
  /** @type {string} */ outId,
  /** @type {{ x: number; y: number; align: string }} */ out,
  /** @type {string} */ inId,
  /** @type {{ x: number; y: number; align: string }} */ inn,
) => {
  const sizesOut = found.get(outId)?.sizes ?? new Map();
  const sizesIn = found.get(inId)?.sizes ?? new Map();
  for (const [index, sizeOut] of sizesOut) {
    const sizeIn = sizesIn.get(index);
    if (sizeIn === undefined) continue;
    for (const width of [WIDTH, (WIDTH + WIDE) / 2, WIDE])
      if (!inOrderWithMargin(pxBoxAt(out, sizeOut, width), pxBoxAt(inn, sizeIn, width))) return false;
  }
  return true;
};
const candidates = new Map(
  [...found].map(([id, entry]) => {
    const places = placesOf(entry.feasible);
    const home = homes[id];
    // a default place that is free in every case is a candidate, off the grid or not
    if (entry.homeFree && home !== undefined)
      places.push({ x: home.x, y: home.y, align: /** @type {'start' | 'middle' | 'end'} */ (home.align) });
    return [id, places];
  }),
);
// The pairs first, together (the pair with the least distance in all wins), then the other labels, most constrained first.
// For every label the nearest place to its own wins.
/** @type {Map<string, { x: number; y: number; align: string; distance: number }>} */
const chosen = new Map();
/** @type {string[]} */
const missing = [];
/** The distance of a place from the label's own: the centre of its box from the centre of the box at the default place (alignment included). */
const distanceOf = (/** @type {string} */ id, /** @type {{ x: number; y: number; align: string }} */ place) => {
  const entry = found.get(id);
  const home = homes[id];
  if (entry === undefined || home === undefined) return Infinity;
  const [box, homeBox] = [boxOf(place, entry), boxOf(home, entry)];
  return Math.hypot((box.left + box.right) / 2 - (homeBox.left + homeBox.right) / 2, place.y - home.y);
};
/** The candidates of a label that keep its home alignment (pairs) and stay apart from the labels already chosen, nearest first. */
const freeFor = (/** @type {string} */ id, /** @type {boolean} */ keepAlign) =>
  (candidates.get(id) ?? [])
    .filter((place) => !keepAlign || place.align === homes[id]?.align)
    // a value that must sit above its part (the pump 15 value in the vertical layout) is no lower than its default place
    .filter((place) => !ABOVE_ONLY.has(id) || place.y <= (homes[id]?.y ?? Infinity))
    .filter((place) =>
      [...chosen].every(([otherId, other]) => other.align === 'zone' || apartEverywhere(id, place, otherId, other)),
    )
    .map((place) => ({ ...place, distance: distanceOf(id, place) }))
    .sort((x, y) => x.distance - y.distance);
/**
 * Whether two rotated labels, the left one at `a` and the right one at `b`, read as neighbours of one row (rework-layouts D7): the
 * left one's box lies left of the right one's by the margin, and the shorter one's vertical extent lies within the longer one's,
 * at the search width, at about the middle and at the far end of the range, with the text sizes of one case (`size`).
 */
const sideBySide = (
  /** @type {{ x: number; y: number; align: string }} */ a,
  /** @type {{ w: number; h: number }} */ sizeA,
  /** @type {{ x: number; y: number; align: string }} */ b,
  /** @type {{ w: number; h: number }} */ sizeB,
) =>
  [WIDTH, (WIDTH + WIDE) / 2, WIDE].every((width) => {
    const [boxA, boxB] = [pxBoxAt(a, sizeA, width), pxBoxAt(b, sizeB, width)];
    const nested =
      (boxA.top >= boxB.top && boxA.bottom <= boxB.bottom) || (boxB.top >= boxA.top && boxB.bottom <= boxA.bottom);
    return boxA.right + MARGIN_X <= boxB.left && nested;
  });
/** The same in every case that shows both labels. */
const sideBySideEverywhere = (
  /** @type {string} */ idA,
  /** @type {{ x: number; y: number; align: string }} */ a,
  /** @type {string} */ idB,
  /** @type {{ x: number; y: number; align: string }} */ b,
) => {
  const sizesA = found.get(idA)?.sizes ?? new Map();
  const sizesB = found.get(idB)?.sizes ?? new Map();
  for (const [index, sizeA] of sizesA) {
    const sizeB = sizesB.get(index);
    if (sizeB !== undefined && !sideBySide(a, sizeA, b, sizeB)) return false;
  }
  return true;
};
// The rotated rows first: Out, In and the pressure of a side, left to right, Out and In side by side at the same height and the
// pressure next to them. The nearest places of the three together win (the sum of their distances from their parts).
for (const group of GROUPS) {
  const [idA, idB, idC] = group;
  const lists = group.map((id) => freeFor(id, false).slice(0, 3000));
  const [listA, listB, listC] = lists;
  const widest = (/** @type {string} */ id) => ({ w: found.get(id)?.w ?? 0, h: found.get(id)?.h ?? 0 });
  /** @type {{ x: number; y: number; align: string; distance: number }[] | undefined} */
  let bestRow;
  let bestSum = Infinity;
  for (const a of listA ?? []) {
    if (a.distance >= bestSum) break;
    for (const b of listB ?? []) {
      if (a.distance + b.distance >= bestSum) break;
      if (!sideBySide(a, widest(idA), b, widest(idB)) || !sideBySideEverywhere(idA, a, idB, b)) continue;
      if (!apartEverywhere(idA, a, idB, b)) continue;
      for (const c of listC ?? []) {
        const sum = a.distance + b.distance + c.distance;
        if (sum >= bestSum) break;
        if (!sideBySide(b, widest(idB), c, widest(idC)) || !sideBySideEverywhere(idB, b, idC, c)) continue;
        if (!apartEverywhere(idB, b, idC, c) || !apartEverywhere(idA, a, idC, c)) continue;
        bestRow = [a, b, c];
        bestSum = sum;
        break;
      }
    }
  }
  if (bestRow === undefined) missing.push(...group);
  else {
    const row = bestRow;
    group.forEach((id, index) => {
      const place = row[index];
      if (place !== undefined) chosen.set(id, place);
    });
  }
}
for (const [outId, inId] of [...PAIRS, ...BLOCKS]) {
  const block = isBlock(outId);
  // a block's rows must line up exactly, so its candidates are matched through a lookup, not a nearest-first prefix
  const outs = block ? freeFor(outId, true) : freeFor(outId, true).slice(0, 600);
  const ins = block ? freeFor(inId, true) : freeFor(inId, true).slice(0, 600);
  const below = new Map(ins.map((place) => [`${String(place.x)},${String(place.y)},${place.align}`, place]));
  /** @type {[(typeof outs)[number], (typeof ins)[number]] | undefined} */
  let best;
  let bestSum = Infinity;
  if (block) {
    for (const out of outs) {
      const inn = below.get(`${String(out.x)},${String(out.y + Number(rowGap))},${out.align}`);
      if (inn === undefined || out.distance + inn.distance >= bestSum) continue;
      if (inBlock(out, inn)) {
        // the two rows of a block keep their fixed pitch: they need no margin between them, only `PAIR_ROW_GAP` units apart
        best = [out, inn];
        bestSum = out.distance + inn.distance;
      }
    }
  } else {
    for (const out of outs) {
      for (const inn of ins) {
        const sum = out.distance + inn.distance;
        if (sum >= bestSum) break;
        if (inOrderEverywhere(outId, out, inId, inn) && apartEverywhere(outId, out, inId, inn)) {
          best = [out, inn];
          bestSum = sum;
          break;
        }
      }
    }
  }
  if (best === undefined) missing.push(outId, inId);
  else {
    chosen.set(outId, best[0]);
    chosen.set(inId, best[1]);
  }
}
const BESIDE_PART = new Set(['production_pressure', 'brine_pressure']);
/** The labels of the bodies are placed from their zones: they need no place of their own, only a free home in every case. */
const loadedZoned = new Set(Object.keys(loadedBodies ?? {}));
const rest = [...found.keys()]
  .filter((id) => !chosen.has(id) && !missing.includes(id))
  .sort((x, y) => (candidates.get(x)?.length ?? 0) - (candidates.get(y)?.length ?? 0));
const bodies = loadedBodies ?? {};
for (const id of rest) {
  if (loadedZoned.has(id) && found.get(id)?.homeFree === true) {
    chosen.set(id, { x: NaN, y: NaN, align: 'zone', distance: 0 });
    continue;
  }
  // the pressure labels sit beside their transducers and keep the alignment of their default place (an end-aligned label
  // stays beside its part when the card is wider; a start-aligned one drifts away from it)
  const free = freeFor(id, BESIDE_PART.has(id));
  // the labels inside one body share its room: a place counts only if every label of that body still waiting has a place
  // apart from it (a greedy pick of one label could otherwise take the whole strip)
  const waiting =
    bodies[id] === undefined
      ? []
      : rest.filter((other) => other !== id && !chosen.has(other) && bodies[other] === bodies[id]);
  const best = free.find((place) =>
    waiting.every((other) =>
      (candidates.get(other) ?? []).some(
        (candidate) =>
          apartEverywhere(id, place, other, candidate) &&
          [...chosen].every(
            ([otherId, taken]) => taken.align === 'zone' || apartEverywhere(other, candidate, otherId, taken),
          ),
      ),
    ),
  );
  if (best === undefined) missing.push(id);
  else chosen.set(id, best);
}

console.log(
  `Place search (${LAYOUT} layout, ${BROWSER}) at ${String(WIDTH)} px: ${String(cases)} cases, grid ${String(STEP)} units, with pipes, margin ${String(MARGIN_X)} px (x) / ${String(MARGIN_Y)} px (y), viewBox ${String(viewBox.width)} x ${String(viewBox.height)}
`,
);
console.log('label                        places  x    y    align   distance  widest box (units)');
for (const id of ids) {
  const entry = found.get(id);
  if (entry === undefined) continue;
  const place = chosen.get(id);
  const count = String(candidates.get(id)?.length ?? 0);
  console.log(
    `${id.padEnd(28)} ${count.padStart(6)}  ${place === undefined ? 'NO PLACE' : place.align === 'zone' ? 'from its zone (free at its home in every case)' : `${String(place.x).padStart(4)} ${String(place.y).padStart(4)} ${place.align.padEnd(7)} ${place.distance.toFixed(0).padStart(7)}`}   ${entry.w.toFixed(0)} x ${entry.h.toFixed(0)}`,
  );
}
// why the default place fails, per label: what its box with the margin meets, over the cases (the number of cases)
console.log('\nDefault place meets (with the margin; the number of cases):');
for (const id of ids) {
  const hits = [...(found.get(id)?.homeHits ?? [])].sort((x, y) => y[1] - x[1]);
  console.log(
    `  ${id.padEnd(28)} ${hits.length === 0 ? 'nothing' : hits.map(([name, count]) => `${name} (${String(count)})`).join(', ')}`,
  );
}
if (process.argv.includes('--map')) {
  // where each label can go, on a 20 unit grid: > a start place, < an end place, = a middle place only, . none
  for (const id of ids) {
    const places = candidates.get(id);
    if (places === undefined) continue;
    const rows = Math.ceil(viewBox.height / 20);
    const cols = Math.ceil(viewBox.width / 20);
    const cells = Array.from({ length: rows }, () => Array.from({ length: cols }, () => '.'));
    for (const place of places) {
      const row = cells[Math.floor(place.y / 20)];
      const col = Math.floor(place.x / 20);
      if (row === undefined) continue;
      const mark = place.align === 'start' ? '>' : place.align === 'end' ? '<' : '=';
      if (row[col] === '.' || (row[col] === '=' && mark !== '=')) row[col] = mark;
    }
    console.log(`\n${id} (> start, < end, = middle):`);
    for (const row of cells) console.log(row.join(''));
  }
}
// The labels of the bodies are placed from the zones and never get an entry; a label whose default place is free in every
// case needs none either. A body label whose zone place is blocked in some case is not "placed from the zones": the search
// reports it as blocked, with the free place it found inside the body (the zone constants move there), and the run fails.
/** @param {string} id */
const isBody = (id) => (loadedBodies ?? {})[id] !== undefined;
const zoned = [...chosen].filter(([id, place]) => isBody(id) && place.align === 'zone').map(([id]) => id);
const blocked = [...chosen].filter(([id, place]) => isBody(id) && place.align !== 'zone');
console.log(`\nPlaced from the zones (no entry): ${zoned.join(', ')}`);
for (const [id, place] of blocked)
  console.log(
    `BLOCKED at its zone place: ${id}; a free place inside its body: x ${String(place.x)}, y ${String(place.y)}, ${place.align}`,
  );
console.log(
  `\nPaste into ${LAYOUT.toUpperCase()}_PLACES (src/diagram/label-places.ts), labels whose default place fails:`,
);
for (const [id, place] of chosen) {
  if (isBody(id) || (found.get(id)?.homeHits.size ?? 0) === 0) continue;
  const turned = found.get(id)?.rotated === true ? ', rotate: -90' : '';
  console.log(`  ${id}: { x: ${String(place.x)}, y: ${String(place.y)}, align: '${place.align}'${turned} },`);
}
if (missing.length > 0) {
  console.log(`\nNo place for: ${missing.join(', ')}. Decision point (design Risks): not a pipe exception.`);
  process.exitCode = 1;
}
if (blocked.length > 0) {
  console.log(
    `\nBlocked zone places: ${blocked.map(([id]) => id).join(', ')}. Move the zone constants (label-places.ts) to the places above.`,
  );
  process.exitCode = 1;
}
