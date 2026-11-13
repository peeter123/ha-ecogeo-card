// `npm run capture`: opens every emulator URL of the fixed list (dev/captures.ts) in headless Chromium and writes one
// PNG of the card per URL to build/captures/ (git-ignored); a capture with a viewport (the panel view) shows the whole window. The pages use mock states only, so no installation data
// can be in view. Starts and stops its own Vite server, after hrv-ventilation scripts/capture.mjs; Playwright is also
// used by the browser test project.
import { mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const OUT = fileURLToPath(new URL('../build/captures/', import.meta.url));
/** Pixel ratio of the captures, so text stays sharp. */
const SCALE = 2;

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const server = await createServer({ logLevel: 'warn', server: { port: 5310, strictPort: false } });
await server.listen();
let count = 0;
/** @type {import('playwright').Browser | undefined} */
let browser;
try {
  const base = server.resolvedUrls?.local[0];
  if (!base) throw new Error('the Vite server did not report a URL');

  const loaded = await server.ssrLoadModule('/dev/captures.ts');
  const CAPTURES =
    /** @type {readonly { name: string; query: string; viewport?: { width: number; height: number } }[]} */ (
      loaded['CAPTURES']
    );

  browser = await chromium.launch();
  const DEFAULT_VIEWPORT = { width: 1200, height: 900 };
  const page = await browser.newPage({ viewport: DEFAULT_VIEWPORT, deviceScaleFactor: SCALE });
  /** @type {string[]} */
  const problems = [];
  page.on('pageerror', (error) => problems.push(error.message));
  for (const { name, query, viewport } of CAPTURES) {
    await page.setViewportSize(viewport ?? DEFAULT_VIEWPORT);
    await page.goto(new URL(`dev/index.html?${query}`, base).href);
    await page.locator('#cards[data-ready]').waitFor();
    // The card reports a config error in the page; a capture of an error is a failure.
    if (await page.locator('.error:not([hidden])').count()) {
      throw new Error(`${name}: ${await page.locator('.error').innerText()}`);
    }
    // A capture with a viewport (a panel view) shows the whole window, to show what is on screen; the others show the card.
    if (viewport) await page.screenshot({ path: join(OUT, `${name}.png`), animations: 'disabled' });
    else await page.locator('.slot').screenshot({ path: join(OUT, `${name}.png`), animations: 'disabled' });
    count += 1;
    console.log(`capture: ${name}.png`);
  }
  if (problems.length > 0) throw new Error(`page errors: ${problems.join('; ')}`);
} finally {
  await browser?.close();
  await server.close();
}
console.log(`${String(count)} captures in build/captures/`);
