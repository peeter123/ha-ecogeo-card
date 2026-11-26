/// <reference types="node" />
import { ESLint } from 'eslint';
import { describe, expect, test } from 'vitest';

// ESLint's classic complexity is 1 plus one per branch, so a function with N - 1 `if` statements has complexity N.
function withComplexity(name: string, complexity: number): string {
  const branches = Array.from({ length: complexity - 1 }, (_, i) => `  if (x === ${String(i)}) return ${String(i)};`);
  return `export function ${name}(x) {\n${branches.join('\n')}\n  return -1;\n}\n`;
}

const eslint = new ESLint({ cwd: process.cwd() });

async function lint(code: string, filePath: string): Promise<ESLint.LintResult> {
  const [result] = await eslint.lintText(code, { filePath });
  if (!result) throw new Error('no lint result');
  return result;
}

describe('complexity limit', () => {
  test('16 under scripts/ is reported and names the file and the function', async () => {
    const result = await lint(withComplexity('tooBranchy', 16), 'scripts/fixture.mjs');
    expect(result.filePath).toMatch(/scripts[\\/]fixture\.mjs$/);
    const messages = result.messages.filter((m) => m.ruleId === 'complexity');
    expect(messages).toHaveLength(1);
    expect(messages[0]?.message).toContain('tooBranchy');
  });

  test('15 under src/ is not reported', async () => {
    const result = await lint(withComplexity('atTheLimit', 15), 'src/fixture.mjs');
    expect(result.fatalErrorCount).toBe(0);
    expect(result.messages).toEqual([]);
  });

  test('16 under src/ is reported', async () => {
    const result = await lint(withComplexity('tooBranchy', 16), 'src/fixture.mjs');
    const messages = result.messages.filter((m) => m.ruleId === 'complexity');
    expect(messages).toHaveLength(1);
    expect(messages[0]?.message).toContain('tooBranchy');
  });

  test('16 under test/ is not reported', async () => {
    const result = await lint(withComplexity('tooBranchy', 16), 'test/fixture.mjs');
    expect(result.fatalErrorCount).toBe(0);
    expect(result.messages).toEqual([]);
  });
});
