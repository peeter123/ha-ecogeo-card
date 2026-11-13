// `npm run measure-layout`: measures the compact threshold (add-compact-layout D6). Opens every emulator scenario in
// the forced full layout at the simplified detail level, sets the card's width from 320 to 800 px in 20 px steps and,
// per width, checks overlaps in the DOM: the bounding boxes of the value labels (the card's `.label` elements)
// against each other and against the component groups of the drawing (`g.symbol-group`, `g.dhw-storage`,
// `g.air-unit`, and the marks of `g.ground-loop`). The threshold is the narrowest width at which every case has zero overlaps and
// every wider measured width does too (a width of the 20 px grid). Paste it into COMPACT_BELOW in src/lib/layout.ts.
//
// The check counts pipes and captions too (dev/overlaps.ts) and prints the most frequent pairs; `--no-pipes` leaves them
// out, which is the measurement of before refine-simplified-layout.
//
// The boxes, the exclusions, the installations and the tolerance are in dev/overlaps.ts, shared with the browser
// test that guards the threshold (test/card/overlaps.browser.test.ts). Starts and stops its own Vite server, like
// capture.mjs.
/// <reference lib="dom" />
/* global document, HTMLElement, requestAnimationFrame */
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const GRID = Array.from({ length: 25 }, (_, index) => 320 + index * 20);
// `--widths=a,b,c` measures only those widths (to iterate on a place); the threshold is then not reported.
const only = process.argv.find((arg) => arg.startsWith('--widths='));
const WIDTHS = only === undefined ? GRID : only.slice('--widths='.length).split(',').map(Number);
const quiet = process.argv.includes('--quiet');
// Pipes and captions count by default (refine-simplified-layout D4); `--no-pipes` measures labels and components only.
const pipes = !process.argv.includes('--no-pipes');

/** Runs in the page: the shared check of dev/overlaps.ts, served by the Vite dev server. */
async function measureInPage(/** @type {boolean} */ withPipes) {
  const path = '/dev/overlaps.ts';
  const shared = await import(path);
  const root = document.querySelector('ecogeo-card')?.shadowRoot;
  if (!root) throw new Error('the card has no shadow root');
  return shared.overlapPairs(shared.measureCard(root, { pipes: withPipes }));
}

const server = await createServer({
  root: fileURLToPath(new URL('..', import.meta.url)),
  logLevel: 'error',
  server: { port: 5311, strictPort: false },
});
await server.listen();
/** @type {import('playwright').Browser | undefined} */
let browser;
/** @type {Map<number, Map<string, string[]>>} width -> case -> overlapping pairs */
const results = new Map(WIDTHS.map((width) => [width, new Map()]));
try {
  const base = server.resolvedUrls?.local[0];
  if (!base) throw new Error('the Vite server did not report a URL');
  const loaded = await server.ssrLoadModule('/dev/scenarios.ts');
  const { INSTALLATIONS } = /** @type {{ INSTALLATIONS: readonly { name: string; query: string }[] }} */ (
    await server.ssrLoadModule('/dev/overlaps.ts')
  );
  const names = /** @type {readonly string[]} */ (loaded['SCENARIO_NAMES']);

  browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 1000 } });
  /** @type {string[]} */
  const problems = [];
  page.on('pageerror', (error) => problems.push(error.message));
  for (const installation of INSTALLATIONS) {
    for (const name of names) {
      const query = `scenario=${name}&${installation.query}&layout=full&detail=simplified`;
      await page.goto(new URL(`dev/index.html?${query}`, base).href);
      await page.locator('#cards[data-ready]').waitFor();
      if (await page.locator('.error:not([hidden])').count()) {
        throw new Error(`${name}: ${await page.locator('.error').innerText()}`);
      }
      for (const width of WIDTHS) {
        await page.evaluate((w) => {
          const slot = document.querySelector('.slot');
          if (slot instanceof HTMLElement) slot.style.width = `${String(w)}px`;
        }, width);
        // Let the layout settle: two frames.
        await page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))));
        const pairs = await page.evaluate(measureInPage, pipes);
        results.get(width)?.set(`${name} / ${installation.name}`, pairs);
      }
    }
  }
  if (problems.length > 0) throw new Error(`page errors: ${problems.join('; ')}`);
} finally {
  await browser?.close();
  await server.close();
}

let cleanFrom;
for (const width of WIDTHS) {
  const cases = results.get(width) ?? new Map();
  const failing = [...cases].filter(([, pairs]) => pairs.length > 0);
  const total = failing.reduce((sum, [, pairs]) => sum + pairs.length, 0);
  console.log(
    `${String(width)} px: ${String(total)} overlaps in ${String(failing.length)} of ${String(cases.size)} cases with overlaps`,
  );
  if (!quiet) {
    for (const [name, pairs] of failing) console.log(`  ${name}: ${pairs.join('; ')}`);
  }
  if (total > 0) cleanFrom = undefined;
  else cleanFrom ??= width;
}
if (only !== undefined) {
  console.log('\nPartial run (--widths): no threshold reported.');
} else if (cleanFrom === undefined) {
  console.log(`\nOverlaps remain at ${String(WIDTHS[WIDTHS.length - 1])} px: no threshold. Stop and decide.`);
  process.exitCode = 1;
} else {
  const threshold = cleanFrom;
  console.log(
    `\nThreshold: ${String(threshold)} px (zero overlaps in every case from ${String(cleanFrom)} px up to ${String(WIDTHS[WIDTHS.length - 1])} px)`,
  );
}

if (pipes) {
  // The most frequent pairs over every measured width and case, to show what the drawing collides on.
  /** @type {Map<string, number>} */
  const tally = new Map();
  for (const cases of results.values()) {
    for (const pairs of cases.values()) for (const pair of pairs) tally.set(pair, (tally.get(pair) ?? 0) + 1);
  }
  const top = [...tally].sort((a, b) => b[1] - a[1]).slice(0, 15);
  console.log('\nMost frequent pairs (over every width and case):');
  for (const [pair, count] of top) console.log(`  ${String(count)} x ${pair}`);
}
