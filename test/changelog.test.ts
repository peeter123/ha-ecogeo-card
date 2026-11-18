import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';

const changelog = readFileSync('CHANGELOG.md', 'utf8').replaceAll('\r\n', '\n');
const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as { version: string };

describe('CHANGELOG.md', () => {
  test('its top version section is the package.json version', () => {
    const top = /^## (\d+\.\d+\.\d+)\b/m.exec(changelog);
    expect(top?.[1]).toBe(pkg.version);
  });
});
