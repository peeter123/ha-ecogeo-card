// The checks of `npm run release`, apart from loading the bundle: which files build/ may hold, whether the build is
// older than src/, whether the registered elements are the card and its editor, and whether the card reports the
// version of package.json. They are plain functions so that tests import them; scripts/check-release.mjs is the
// command-line entry that loads the bundle and copies it. Adapted from hrv-ventilation scripts/check-release.mjs.
import { copyFileSync, mkdirSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

export const CARDS = ['ecogeo-card', 'ecogeo-card-editor'];
export const BUNDLE = 'ecogeo-card.js';

/** @param {string} dir @returns {number} newest modification time of a file below dir */
export function newest(dir) {
  return Math.max(
    0,
    ...readdirSync(dir, { withFileTypes: true }).map((entry) => {
      const path = join(dir, entry.name);
      return entry.isDirectory() ? newest(path) : statSync(path).mtimeMs;
    }),
  );
}

/**
 * @param {string} buildDir the directory of the build
 * @param {string} srcDir the sources the build must not be older than
 * @returns {string} why the build directory may not be released, or '' when it may
 */
export function buildDirProblem(buildDir, srcDir) {
  const files = readdirSync(buildDir).filter((name) => !name.startsWith('.'));
  if (files.length !== 1 || files[0] !== BUNDLE) return `build/ must hold only ${BUNDLE}, found ${files.join(', ')}`;
  if (statSync(join(buildDir, BUNDLE)).mtimeMs < newest(srcDir))
    return 'the build is older than src/; run npm run build first';
  return '';
}

/**
 * @param {{ get(tag: string): unknown }} registry the custom element registry after the bundle was loaded
 * @param {string} expectedVersion the `version` of package.json
 * @returns {string} why the loaded bundle may not be released, or '' when it may
 */
export function registrationProblem(registry, expectedVersion) {
  const missing = CARDS.filter((tag) => !registry.get(tag));
  if (missing.length > 0) return `the build does not register ${missing.join(', ')}`;
  const reported = Reflect.get(/** @type {object} */ (registry.get('ecogeo-card')), 'version');
  if (reported !== expectedVersion) {
    return `the build reports version ${String(reported)} but package.json says ${expectedVersion}`;
  }
  return '';
}

/**
 * @param {string} built the build, build/ecogeo-card.js
 * @param {string} committed the committed bundle, dist/ecogeo-card.js
 * @returns {string} why the committed bundle is not the build of the current sources, or '' when it is
 */
export function distProblem(built, committed) {
  let current;
  try {
    current = readFileSync(committed);
  } catch {
    return 'dist/ecogeo-card.js is missing; run npm run release';
  }
  if (!readFileSync(built).equals(current)) {
    return 'dist/ecogeo-card.js differs from the build of the current sources; run npm run release and commit it';
  }
  return '';
}

/**
 * Runs every check on a build and, unless `dryRun`, copies it to dist/ only when all pass.
 * @param {{
 *   buildDir: string, distDir: string, srcDir: string, expectedVersion: string, dryRun?: boolean, verifyDist?: boolean,
 *   load: (bundle: string) => Promise<{ get(tag: string): unknown }>,
 * }} options `load` imports the bundle and returns the custom element registry it filled
 * @returns {Promise<{ failure: string, message: string }>} the failure ('' when none) and the line to print
 */
export async function releaseBuild({
  buildDir,
  distDir,
  srcDir,
  expectedVersion,
  dryRun = false,
  verifyDist = false,
  load,
}) {
  const built = join(buildDir, BUNDLE);
  let failure = buildDirProblem(buildDir, srcDir);
  if (!failure) {
    try {
      failure = registrationProblem(await load(built), expectedVersion);
    } catch (error) {
      failure = `the build failed to load: ${String(error)}`;
    }
  }
  if (!failure && verifyDist) failure = distProblem(built, join(distDir, BUNDLE));
  if (failure) return { failure, message: `release: ${failure}; dist/ was not touched.\n` };
  const checked = `custom:ecogeo-card and ecogeo-card-editor registered, version ${expectedVersion}`;
  if (verifyDist) return { failure, message: `release: ${checked}; dist/ecogeo-card.js is current.\n` };
  if (dryRun) return { failure, message: `release: ${checked} (dry run, dist/ not touched).\n` };
  mkdirSync(distDir, { recursive: true });
  copyFileSync(built, join(distDir, BUNDLE));
  return { failure, message: `release: ${checked}; copied build/ to dist/.\n` };
}
