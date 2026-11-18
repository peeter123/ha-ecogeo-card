import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { EcogeoCard } from '../../src/card/ecogeo-card';
import { CARD_VERSION } from '../../src/lib/version';

const packageVersion = (JSON.parse(readFileSync('package.json', 'utf8')) as { version: string }).version;

describe('the card version', () => {
  test('is the version of package.json', () => {
    expect(CARD_VERSION).toBe(packageVersion);
  });

  test('is a semantic version without a prefix', () => {
    expect(packageVersion).toMatch(/^\d+\.\d+\.\d+$/);
    expect(CARD_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });

  test('is exposed as the static version of the card class', () => {
    expect(EcogeoCard.version).toBe(CARD_VERSION);
  });
});
