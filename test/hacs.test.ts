import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';

const manifest = JSON.parse(readFileSync('hacs.json', 'utf8')) as Record<string, unknown>;
const SUPPORTED = ['name', 'filename', 'content_in_root', 'hide_default_branch', 'country', 'homeassistant', 'hacs'];

describe('hacs.json', () => {
  test('names the bundle', () => {
    expect(manifest['name']).toBe('ecoGEO Schematic Card');
    expect(manifest['filename']).toBe('ecogeo-card.js');
    expect(existsSync('dist/ecogeo-card.js')).toBe(true);
  });

  test('holds no unsupported key', () => {
    for (const key of Object.keys(manifest)) expect(SUPPORTED).toContain(key);
    expect(manifest['content_in_root'] ?? false).toBe(false);
  });
});
