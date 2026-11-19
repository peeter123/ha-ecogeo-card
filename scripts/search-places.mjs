// NOTE (rework-layouts group 2): the compact layout is gone, so this script now searches the horizontal layout with the
// rules it had for the compact one (the labels of LABEL_SIDES, no on-pipe exception). Group 3 of rework-layouts reworks it
// (design D7: `--layout=horizontal|vertical`, every one of the 19 labels); until then its output is not to be pasted anywhere.
// `npm run search-places`: searches the former compact layout's label places (refine-simplified-layout D7; the first search was
// add-compact-layout D8). For every key label (the ones LABEL_SIDES lists) it finds, over every emulator scenario,
// installation and naming at 320 px, the places where the label overlaps no component, no pipe (except for the labels of
// ON_PIPE_COMPACT, which are placed with pipes ignored, design D7 group 5), no caption and no
// other label, stays on its side of the cabinet outline (LABEL_SIDES) and inside the drawing, with about 2 px of margin
// (Chromium and WebKit differ by 1-2 px in text width). Of those it takes the one nearest the label's own place in the
// non-compact drawing (its probe or component), most constrained label first.
//
// How: the card is opened in the emulator's compact layout and measured with dev/overlaps.ts (pipes: true), so the
// obstacles are what renders. The obstacles are rasterised on a 0.25 px grid and a summed-area table answers "does this
// box hit one" in constant time. A candidate is a point of a 4 unit grid of the viewBox with an alignment (start, middle,
// end), its box the label's rendered size (the widest value of every case counts). A place must be feasible in every case
// the label exists in. The other labels are obstacles in a second step, at their widest, greedy by fewest places.
//
// Output: a table to paste into COMPACT_PLACES (src/diagram/label-places.ts), and, per label, how many places the
// search found. A label with no place is reported and the exit code is 1: that is a decision point (design Risks), not
// something to loosen here. Rerun it after any change of the drawing's arrangement or of the compact label texts.
// Options: `--width=320` (the search width), `--step=4` (the grid in viewBox units), `--margin=2` (px, horizontal),
// `--map` (prints where each label can go), `--no-pipes` (the obstacles of the first search: labels, components and the cabinet only).
// Starts and stops its own Vite server, like measure-layout.mjs. Run it on the arrangement the compact layout draws now.
/// <reference lib="dom" />
/* global document, HTMLElement, requestAnimationFrame */
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const KNOWN = ['--width=', '--step=', '--margin=', '--no-pipes', '--map'];
const unknown = process.argv.slice(2).filter((arg) => !KNOWN.some((known) => arg.startsWith(known)));
if (unknown.length > 0) {
  console.error(
    `Unknown option: ${unknown.join(' ')}. Options: --width=N --step=N --margin=N (a number above 0, no space) --no-pipes --map`,
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
const WIDTH = option('width', 320);
const STEP = option('step', 4);
const MARGIN_X = option('margin', 2);
const MARGIN_Y = 1;
/** The finest obstacle cell, in px. */
const CELL = 0.25;
/** `--no-pipes` leaves pipes and captions out, which is the first search's obstacle set (labels, components, cabinet). */
const PIPES = !process.argv.includes('--no-pipes');
const ALIGNS = /** @type {const} */ (['start', 'middle', 'end']);

/**
 * Runs in the page: for each label of the card, which candidate places are free of obstacles, as packed bits.
 * @param {{ step: number; cell: number; marginX: number; marginY: number; pipes: boolean; onPipe: readonly string[] }} options
 */
async function searchInPage({ step, cell, marginX, marginY, pipes, onPipe }) {
  const path = '/dev/overlaps.ts';
  const shared = await import(path);
  const root = document.querySelector('ecogeo-card')?.shadowRoot;
  if (!root) throw new Error('the card has no shadow root');
  const m = shared.measureCard(root, { pipes: true });
  if (!pipes) {
    m.pipes = [];
    m.captions = [];
  }
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
  const solid = [...m.parts, ...(m.captions ?? [])];
  const hitsSolid = obstacles(solid);
  const hitsAll = obstacles([
    ...solid,
    ...(m.pipes ?? []).flatMap((/** @type {{ squares: object[] }} */ pipe) => pipe.squares),
  ]);
  const cab = {
    left: cabinet.left - drawing.left,
    right: cabinet.right - drawing.left,
    top: cabinet.top - drawing.top,
    bottom: cabinet.bottom - drawing.top,
  };
  const nx = Math.floor(vb.width / step) + 1;
  const ny = Math.floor(vb.height / step) + 1;
  const aligns = ['start', 'middle', 'end'];
  const results = [];
  for (const label of m.labels) {
    const side = shared.LABEL_SIDES[label.id];
    // the labels allowed on a pipe (ON_PIPE_COMPACT) are checked against everything but pipes
    const onAPipe = onPipe.includes(label.id);
    const hits = onAPipe ? hitsSolid : hitsAll;
    // a label over a pipe is a plate: the whole element counts, not the trimmed em box (its half-leading is about 1 px)
    const vMargin = onAPipe ? Math.max(marginY, 2) : marginY;
    const w = label.right - label.left;
    const h = label.bottom - label.top;
    const bits = new Uint8Array(Math.ceil((aligns.length * ny * nx) / 8));
    let at = 0;
    for (const align of aligns) {
      for (let iy = 0; iy < ny; iy += 1) {
        for (let ix = 0; ix < nx; ix += 1, at += 1) {
          const x = ix * step * scale;
          const y = iy * step * scale;
          const left = align === 'start' ? x : align === 'end' ? x - w : x - w / 2;
          // the box with its margin
          const l = left - marginX;
          const r = left + w + marginX;
          const t = y - h / 2 - vMargin;
          const b = y + h / 2 + vMargin;
          if (l < 0 || t < 0 || r > dw || b > dh) continue;
          if (side === 'inside' && !(l >= cab.left && r <= cab.right && t >= cab.top && b <= cab.bottom)) continue;
          if (
            side === 'outside' &&
            Math.min(r, cab.right) - Math.max(l, cab.left) > tol &&
            Math.min(b, cab.bottom) - Math.max(t, cab.top) > tol
          )
            continue;
          if (hits(l, r, t, b)) continue;
          bits[at >> 3] = (bits[at >> 3] ?? 0) | (1 << (at & 7));
        }
      }
    }
    let text = '';
    for (const byte of bits) text += String.fromCharCode(byte);
    results.push({ id: label.id, w: w / scale, h: h / scale, bits: btoa(text) });
  }
  return { vb: { width: vb.width, height: vb.height }, labels: results };
}

const server = await createServer({
  root: fileURLToPath(new URL('..', import.meta.url)),
  logLevel: 'error',
  server: { port: 5312, strictPort: false },
});
await server.listen();
/** @type {import('playwright').Browser | undefined} */
let browser;
/** @type {Map<string, { feasible: Uint8Array; w: number; h: number; sizes: Map<number, { w: number; h: number }> }>} */
const found = new Map();
/** @type {{ width: number; height: number } | undefined} */
let viewBox;
/** @type {Record<string, { x: number; y: number; align: string }>} */
const homes = {};
/** @type {Readonly<Record<string, 'inside' | 'outside'>> | undefined} */
let loadedSides;
/** @type {string[] | undefined} */
let onPipeLabels;
/** @type {readonly (readonly [string, string])[] | undefined} */
let outInPairs;
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
  onPipeLabels = [];
  const names = /** @type {readonly string[]} */ (scenarios['SCENARIO_NAMES']);
  const installations = /** @type {readonly { name: string; query: string }[]} */ (overlaps['INSTALLATIONS']);
  const namings = /** @type {readonly string[]} */ (foreign['NAMINGS']);
  loadedSides = overlaps['LABEL_SIDES'];
  outInPairs = overlaps['OUT_IN_PAIRS'];
  loadedInOrder = overlaps['inOrder'];
  // each label's own place in the non-compact drawing of the arrangement the compact layout draws (its probe or component)
  for (const spec of geometry['arrangementFor']('horizontal').labels.specs) {
    homes[spec.id] = { x: spec.x, y: spec.y, align: spec.align };
  }

  browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 1000 } });
  /** @type {string[]} */
  const problems = [];
  page.on('pageerror', (error) => problems.push(error.message));
  for (const naming of namings) {
    for (const installation of installations) {
      for (const name of names) {
        const query = `scenario=${name}&${installation.query}&naming=${naming}&layout=horizontal`;
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
          pipes: PIPES,
          onPipe: onPipeLabels ?? [],
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
            });
          } else {
            for (let i = 0; i < bits.length; i += 1) entry.feasible[i] = (entry.feasible[i] ?? 0) & (bits[i] ?? 0);
            entry.w = Math.max(entry.w, label.w);
            entry.h = Math.max(entry.h, label.h);
            entry.sizes.set(cases, { w: label.w, h: label.h });
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
const sides = loadedSides ?? {};

const nx = Math.floor(viewBox.width / STEP) + 1;
const ny = Math.floor(viewBox.height / STEP) + 1;
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
 * width, at about the middle and just under the compact threshold.
 */
const PAIRS = outInPairs ?? [];
const inOrder = loadedInOrder ?? (() => false);
const WIDE = 599;
/** A label's box at a place, in px at a card width (the text's size is the same in px at every width). */
const pxBoxAt = (
  /** @type {{ x: number; y: number; align: string }} */ place,
  /** @type {{ w: number; h: number }} */ size,
  /** @type {number} */ width,
) => {
  const w = (size.w * WIDTH) / 1000;
  const h = (size.h * WIDTH) / 1000;
  const x = (place.x * width) / 1000;
  const left = place.align === 'start' ? x : place.align === 'end' ? x - w : x - w / 2;
  const y = (place.y * width) / 1000;
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
/** Whether an Out place and an In place are in order at every compact width, in every case showing both. */
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
const candidates = new Map([...found].map(([id, entry]) => [id, placesOf(entry.feasible)]));
// The pairs first, together (the pair with the least distance in all wins), then the other labels, most constrained first.
// For every label the nearest place to its own wins.
/** @type {Map<string, { x: number; y: number; align: string; distance: number }>} */
const chosen = new Map();
/** @type {string[]} */
const missing = [];
/** The distance of a place from the label's own: its box centre from the anchor of its place in the non-compact drawing. */
const distanceOf = (/** @type {string} */ id, /** @type {{ x: number; y: number; align: string }} */ place) => {
  const entry = found.get(id);
  const home = homes[id];
  if (entry === undefined || home === undefined) return Infinity;
  const box = boxOf(place, entry);
  return Math.hypot((box.left + box.right) / 2 - home.x, place.y - home.y);
};
/** The candidates of a label that keep its home alignment (pairs) and stay apart from the labels already chosen, nearest first. */
const freeFor = (/** @type {string} */ id, /** @type {boolean} */ keepAlign) =>
  (candidates.get(id) ?? [])
    .filter((place) => !keepAlign || place.align === homes[id]?.align)
    .filter((place) => [...chosen].every(([otherId, other]) => apartEverywhere(id, place, otherId, other)))
    .map((place) => ({ ...place, distance: distanceOf(id, place) }))
    .sort((x, y) => x.distance - y.distance);
for (const [outId, inId] of PAIRS) {
  const outs = freeFor(outId, true).slice(0, 600);
  const ins = freeFor(inId, true).slice(0, 600);
  /** @type {[(typeof outs)[number], (typeof ins)[number]] | undefined} */
  let best;
  let bestSum = Infinity;
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
  if (best === undefined) missing.push(outId, inId);
  else {
    chosen.set(outId, best[0]);
    chosen.set(inId, best[1]);
  }
}
const rest = [...found.keys()]
  .filter((id) => !chosen.has(id) && !missing.includes(id))
  .sort((x, y) => (candidates.get(x)?.length ?? 0) - (candidates.get(y)?.length ?? 0));
for (const id of rest) {
  const best = freeFor(id, false)[0];
  if (best === undefined) missing.push(id);
  else chosen.set(id, best);
}

console.log(
  `Compact place search at ${String(WIDTH)} px: ${String(cases)} cases, grid ${String(STEP)} units, ${PIPES ? 'with pipes' : 'without pipes'}, margin ${String(MARGIN_X)} px (x) / ${String(MARGIN_Y)} px (y, 2 px for the labels of ON_PIPE_COMPACT), viewBox ${String(viewBox.width)} x ${String(viewBox.height)}\n`,
);
console.log('label                        side     places  x    y    align   distance  widest box (units)');
for (const id of Object.keys(sides)) {
  const entry = found.get(id);
  if (entry === undefined) continue;
  const place = chosen.get(id);
  const count = String(candidates.get(id)?.length ?? 0);
  console.log(
    `${id.padEnd(28)} ${(sides[id] ?? '').padEnd(8)} ${count.padStart(6)}  ${place === undefined ? 'NO PLACE' : `${String(place.x).padStart(4)} ${String(place.y).padStart(4)} ${place.align.padEnd(7)} ${place.distance.toFixed(0).padStart(7)}`}   ${entry.w.toFixed(0)} x ${entry.h.toFixed(0)}`,
  );
}
if (process.argv.includes('--map')) {
  // where each label can go, on a 20 unit grid: > a start place, < an end place, = a middle place only, . none
  for (const id of Object.keys(sides)) {
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
console.log('\nPaste into COMPACT_PLACES (src/diagram/label-places.ts):');
for (const [id, place] of chosen) {
  console.log(`  ${id}: { x: ${String(place.x)}, y: ${String(place.y)}, align: '${place.align}' },`);
}
if (missing.length > 0) {
  console.log(
    `\nNo place for: ${missing.join(', ')}. Decision point (design Risks): footer, or a pipe with its plate.`,
  );
  process.exitCode = 1;
}
