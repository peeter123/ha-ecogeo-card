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
          exclude: ['test/**/*.browser.test.ts', 'test/**/*.visual.test.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'browser',
          include: ['test/**/*.browser.test.ts'],
          // Stops the run with one message when the browser lays text out with whole-pixel advances (rework-layouts D11).
          setupFiles: ['test/browser-preflight.setup.ts'],
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
      {
        // Pixel references of fixed renders, compared in Chromium on Linux only (the tests skip elsewhere).
        extends: true,
        test: {
          name: 'visual',
          include: ['test/**/*.visual.test.ts'],
          expect: { poll: { timeout: 5000 } },
          browser: {
            enabled: true,
            headless: true,
            // Reduced motion: no flow or fan animation in the references (the card's media queries).
            provider: playwright({ contextOptions: { reducedMotion: 'reduce' } }),
            instances: [{ browser: 'chromium', viewport: { width: 1100, height: 900 } }],
            expect: {
              toMatchScreenshot: {
                // One folder of references, named <render>-<browser>-<platform>.png (not the git-ignored __screenshots__).
                resolveScreenshotPath: ({ arg, browserName, ext, root, platform }) =>
                  `${root}/test/visual/references/${arg}-${browserName}-${platform}${ext}`,
                // A few pixels of anti-aliasing noise at most: moving one part by 4 to 30 px changes only 61 to 362
                // pixels (vertical layout 61 to 116), so a ratio of a whole render would hide it.
                comparatorOptions: { threshold: 0.1, allowedMismatchedPixels: 20 },
              },
            },
          },
        },
      },
    ],
  },
});
