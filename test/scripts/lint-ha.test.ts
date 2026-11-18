/// <reference types="node" />
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { checkWorkflows, codespell, workflowFiles } from '../../scripts/lint-ha.mjs';

// These tests start `uvx` (the first run may download the tool), so they are few and have a generous timeout.
const SLOW = 180_000;
let dir = '';

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'ecogeo-lint-ha-'));
});
afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

describe('lint-ha', () => {
  test(
    'codespell fails on a misspelling and passes on correct text',
    () => {
      writeFileSync(join(dir, 'bad.md'), `We ${'rec' + 'ieve'} the signal.\n`);
      writeFileSync(join(dir, 'good.md'), 'We receive the signal.\n');
      const bad = codespell(dir, ['bad.md']);
      expect(bad.code).not.toBe(0);
      expect(bad.output).toContain('bad.md');
      expect(codespell(dir, ['good.md']).code).toBe(0);
    },
    SLOW,
  );

  test(
    'the workflow schema check fails on a job without runs-on',
    () => {
      mkdirSync(join(dir, '.github', 'workflows'), { recursive: true });
      writeFileSync(
        join(dir, '.github', 'workflows', 'bad.yml'),
        'name: Bad\non: push\njobs:\n  build:\n    steps:\n      - run: echo hi\n',
      );
      writeFileSync(
        join(dir, '.github', 'workflows', 'good.yml'),
        'name: Good\non: push\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - run: echo hi\n',
      );
      expect(workflowFiles(dir).sort()).toEqual(['.github/workflows/bad.yml', '.github/workflows/good.yml']);
      const bad = checkWorkflows(dir, ['.github/workflows/bad.yml']);
      expect(bad.code).not.toBe(0);
      expect(bad.output).toContain('bad.yml');
      expect(checkWorkflows(dir, ['.github/workflows/good.yml']).code).toBe(0);
    },
    SLOW,
  );

  test('no workflow folder means nothing to check', () => {
    expect(workflowFiles(join(dir, 'missing'))).toEqual([]);
    expect(checkWorkflows(dir, []).code).toBe(0);
  });
});
