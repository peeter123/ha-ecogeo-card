/// <reference types="node" />
import { mkdirSync, mkdtempSync, readFileSync, rmSync, utimesSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { releaseBuild } from '../../scripts/release-checks.mjs';

let dir = '';
let buildDir = '';
let distDir = '';
let srcDir = '';

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'ecogeo-release-'));
  buildDir = join(dir, 'build');
  distDir = join(dir, 'dist');
  srcDir = join(dir, 'src');
  for (const path of [buildDir, distDir, srcDir]) mkdirSync(path);
  writeFileSync(join(srcDir, 'a.ts'), 'x');
  writeFileSync(join(buildDir, 'ecogeo-card.js'), 'new bundle');
  writeFileSync(join(distDir, 'ecogeo-card.js'), 'old bundle');
  // The build is newer than the sources.
  const later = new Date(Date.now() + 10_000);
  utimesSync(join(buildDir, 'ecogeo-card.js'), later, later);
});
afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

/** A registry as the loaded bundle would leave it: the card reports `version`, the editor is a plain element. */
function registry(version: string, tags = ['ecogeo-card', 'ecogeo-card-editor']) {
  const elements: Record<string, unknown> = {
    'ecogeo-card': Object.assign(() => undefined, { version }),
    'ecogeo-card-editor': () => undefined,
  };
  return Promise.resolve({ get: (tag: string) => (tags.includes(tag) ? elements[tag] : undefined) });
}

const dist = () => readFileSync(join(distDir, 'ecogeo-card.js'), 'utf8');
const options = () => ({ buildDir, distDir, srcDir, expectedVersion: '1.0.0' });

describe('releaseBuild', () => {
  test('Version mismatch: refuses, names both versions and leaves dist untouched', async () => {
    const result = await releaseBuild({ ...options(), load: () => registry('0.9.0') });
    expect(result.failure).toContain('0.9.0');
    expect(result.failure).toContain('1.0.0');
    expect(dist()).toBe('old bundle');
  });

  test('Matching build: copies the build to dist', async () => {
    const result = await releaseBuild({ ...options(), load: () => registry('1.0.0') });
    expect(result.failure).toBe('');
    expect(dist()).toBe('new bundle');
  });

  test('a dry run checks without copying', async () => {
    const result = await releaseBuild({ ...options(), dryRun: true, load: () => registry('1.0.0') });
    expect(result.failure).toBe('');
    expect(dist()).toBe('old bundle');
  });

  test('refuses a build that does not register the editor', async () => {
    const result = await releaseBuild({ ...options(), load: () => registry('1.0.0', ['ecogeo-card']) });
    expect(result.failure).toContain('ecogeo-card-editor');
    expect(dist()).toBe('old bundle');
  });

  test('refuses a build that fails to load, and a stale build', async () => {
    const broken = await releaseBuild({ ...options(), load: () => Promise.reject(new Error('boom')) });
    expect(broken.failure).toContain('boom');
    const past = new Date(Date.now() - 100_000);
    utimesSync(join(buildDir, 'ecogeo-card.js'), past, past);
    const stale = await releaseBuild({ ...options(), load: () => registry('1.0.0') });
    expect(stale.failure).toContain('older than src/');
    expect(dist()).toBe('old bundle');
  });

  test('Stale bundle: --verify-dist fails naming dist/ecogeo-card.js and leaves dist untouched', async () => {
    const result = await releaseBuild({ ...options(), verifyDist: true, load: () => registry('1.0.0') });
    expect(result.failure).toContain('dist/ecogeo-card.js');
    expect(dist()).toBe('old bundle');
  });

  test('--verify-dist fails naming dist/ecogeo-card.js when it is missing', async () => {
    rmSync(join(distDir, 'ecogeo-card.js'));
    const result = await releaseBuild({ ...options(), verifyDist: true, load: () => registry('1.0.0') });
    expect(result.failure).toContain('dist/ecogeo-card.js');
    expect(result.failure).toContain('missing');
  });

  test('--verify-dist runs the version check first: a mismatch names both versions, dist untouched', async () => {
    const result = await releaseBuild({ ...options(), verifyDist: true, load: () => registry('0.9.0') });
    expect(result.failure).toContain('0.9.0');
    expect(result.failure).toContain('1.0.0');
    expect(dist()).toBe('old bundle');
  });

  test('Current bundle: --verify-dist passes when dist is byte for byte the build', async () => {
    writeFileSync(join(distDir, 'ecogeo-card.js'), 'new bundle');
    const result = await releaseBuild({ ...options(), verifyDist: true, load: () => registry('1.0.0') });
    expect(result.failure).toBe('');
    expect(dist()).toBe('new bundle');
  });
});
