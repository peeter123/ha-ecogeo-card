import { readFileSync } from 'node:fs';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

const { version } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as { version: string };

// Always builds into build/ (git-ignored, never deployed). `npm run release` then copies the checked build to
// dist/ with scripts/check-release.mjs; do not build into dist/ directly.
export default defineConfig({
  // The card's version, stamped in from package.json (also for the tests: the projects extend this config).
  define: { __ECOGEO_VERSION__: JSON.stringify(version) },
  build: {
    outDir: 'build',
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: () => 'ecogeo-card.js',
    },
    // One self-contained file: dynamic imports are inlined, not split into chunks that the release step would
    // not copy.
    rolldownOptions: { output: { codeSplitting: false } },
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'happy-dom',
          include: ['test/**/*.test.ts'],
          exclude: ['test/**/*.browser.test.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'browser',
          include: ['test/**/*.browser.test.ts'],
          // WebKit's first ResizeObserver delivery can take longer than the 1 s default on a loaded runner.
          expect: { poll: { timeout: 5000 } },
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }, { browser: 'webkit' }],
          },
        },
      },
    ],
  },
});
