// Home Assistant quality checks (npm run lint:ha): the tools Home Assistant core pins for non-code files, run
// through `uvx` at exact versions, plus the Markdown format check. Any finding fails (exit 1); a tool that cannot
// run, or a missing uv, exits 2. Adapted from scripts/lint.py of the hot-water-tank-estimator repository.
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkFiles, markdownFiles, ToolError } from './md-format.mjs';

export { ToolError };

// Home Assistant core pins (requirements_test_pre_commit.txt, dev branch, 2026-10-31).
export const CODESPELL_VERSION = '2.4.3';
export const YAMLLINT_VERSION = '1.38.0';
// The latest release when the checks were added (2026-11-18); not pinned by core.
export const CHECK_JSONSCHEMA_VERSION = '0.39.0';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const UV_HINT = 'Install uv: https://docs.astral.sh/uv/';

/**
 * Runs `uvx` in `cwd` and returns its output with the exit code, so a caller can name the file in it. It prints
 * nothing; the command line (`report`) does.
 * @param {string[]} args
 * @param {string} cwd
 * @returns {{ code: number, output: string, command: string }}
 */
export function uvx(args, cwd = root) {
  const result = spawnSync('uvx', args, { cwd, encoding: 'utf8' });
  if (result.error || result.status === null) {
    throw new ToolError(`uvx could not be run (${String(result.error ?? 'killed')}). ${UV_HINT}`);
  }
  return { code: result.status, output: `${result.stdout}${result.stderr}`, command: `uvx ${args.join(' ')}` };
}

/** Fails with a message naming uv when `uvx` is not available. */
export function requireUv() {
  const probe = spawnSync('uvx', ['--version'], { encoding: 'utf8' });
  if (probe.error || probe.status !== 0) {
    throw new ToolError(`uv is not installed (\`uvx\` not found). ${UV_HINT}`);
  }
}

/**
 * Codespell over the repository (configured by .codespellrc), or over the given files.
 * @param {string} cwd
 * @param {string[]} files
 */
export function codespell(cwd = root, files = []) {
  return uvx([`codespell@${CODESPELL_VERSION}`, ...files], cwd);
}

/**
 * Yamllint over the given YAML files.
 * @param {string} cwd
 * @param {string[]} files
 */
export function yamllint(cwd, files) {
  if (files.length === 0) return { code: 0, output: '', command: '' };
  return uvx([`yamllint@${YAMLLINT_VERSION}`, '--strict', ...files], cwd);
}

/**
 * Schema check of GitHub workflow files.
 * @param {string} cwd
 * @param {string[]} files
 */
export function checkWorkflows(cwd, files) {
  if (files.length === 0) return { code: 0, output: '', command: '' };
  return uvx(
    [`check-jsonschema@${CHECK_JSONSCHEMA_VERSION}`, '--builtin-schema', 'vendor.github-workflows', ...files],
    cwd,
  );
}

/**
 * The tracked YAML files (and the yamllint config), relative to the base folder.
 * @param {string} base
 */
export function yamlFiles(base = root) {
  const result = spawnSync(
    'git',
    ['ls-files', '--cached', '--others', '--exclude-standard', '*.yml', '*.yaml', '.yamllint'],
    { cwd: base, encoding: 'utf8' },
  );
  if (result.status !== 0) throw new ToolError(`git ls-files: ${result.stderr.trim()}`);
  return result.stdout.split('\n').filter((name) => name && existsSync(join(base, name)));
}

/**
 * The workflow files under .github/workflows/, when that folder exists.
 * @param {string} base
 */
export function workflowFiles(base = root) {
  const dir = join(base, '.github', 'workflows');
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => /\.ya?ml$/u.test(name))
    .map((name) => `.github/workflows/${name}`);
}

/**
 * Prints a tool's command and output, and returns whether it passed.
 * @param {{ code: number, output: string, command: string }} result
 */
function report(result) {
  if (result.command)
    process.stdout.write(`$ ${result.command}
${result.output}`);
  return result.code === 0;
}

/** Runs every check; returns the process exit code. */
export function main() {
  try {
    requireUv();
    let failed = 0;
    failed += report(codespell()) ? 0 : 1;
    failed += report(yamllint(root, yamlFiles())) ? 0 : 1;
    failed += report(checkWorkflows(root, workflowFiles())) ? 0 : 1;
    process.stdout.write('$ markdown format check\n');
    failed += checkFiles(root, markdownFiles(root), false) > 0 ? 1 : 0;
    process.stdout.write(failed === 0 ? 'lint:ha: clean\n' : 'lint:ha: findings\n');
    return failed === 0 ? 0 : 1;
  } catch (error) {
    if (!(error instanceof ToolError)) throw error;
    process.stderr.write(`lint:ha: ${error.message}\n`);
    return 2;
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = main();
}
