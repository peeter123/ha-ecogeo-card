// Last step of `npm run release` (after `npm run check` and `npm run build`): loads the build from build/ in
// happy-dom, checks that it registers the card and its editor and that the card reports the version of package.json,
// and only then copies that exact file to dist/. So a bundle that does not register the card, or that carries another
// version, cannot replace the one that is deployed from dist/; whether the card works is up to the tests that
// `npm run check` runs first. It refuses a build that is older than src/ (a stale build from an earlier
// `npm run build`) and a build of more than one file (the bundle must be self-contained). The checks themselves are
// in scripts/release-checks.mjs. `--dry-run` checks without copying. Adapted from hrv-ventilation
// scripts/check-release.mjs.
import { readFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { GlobalRegistrator } from '@happy-dom/global-registrator';
import { CARDS, releaseBuild } from './release-checks.mjs';

const root = new URL('../', import.meta.url);
const { version } = JSON.parse(readFileSync(new URL('package.json', root), 'utf8'));

/** Imports the bundle into a happy-dom page and returns that page's custom element registry. */
async function load(/** @type {string} */ bundle) {
  GlobalRegistrator.register({ url: 'http://localhost/' });
  try {
    await import(pathToFileURL(bundle).href);
    // customElements is a happy-dom global now; this file is type-checked without the DOM library.
    const registry = /** @type {{ get(tag: string): unknown }} */ (Reflect.get(globalThis, 'customElements'));
    // A snapshot, because the page is torn down below.
    return new Map(CARDS.map((tag) => [tag, registry.get(tag)]));
  } finally {
    await GlobalRegistrator.unregister();
  }
}

const { failure, message } = await releaseBuild({
  buildDir: fileURLToPath(new URL('build/', root)),
  distDir: fileURLToPath(new URL('dist/', root)),
  srcDir: fileURLToPath(new URL('src/', root)),
  expectedVersion: version,
  dryRun: process.argv.includes('--dry-run'),
  load,
});
// Exit explicitly (a timer started by the bundle would keep Node alive), after the message is flushed.
const stream = failure ? process.stderr : process.stdout;
stream.write(message, () => process.exit(failure ? 1 : 0));
