import { afterEach, describe, expect, test, vi } from 'vitest';
import { CARD_VERSION } from '../../src/lib/version';

afterEach(() => {
  vi.restoreAllMocks();
});

// Each test is self-contained: the first import in the file is the first load, whichever test runs first.
describe('the load message', () => {
  test('the first load logs the version once, as plain text', async () => {
    const info = vi.spyOn(console, 'info').mockImplementation(() => undefined);
    await import('../../src/card/ecogeo-card');
    expect(info).toHaveBeenCalledOnce();
    expect(info).toHaveBeenCalledWith(`ecogeo-card ${CARD_VERSION}`);
  });

  test('a second load of the module logs no further info line', async () => {
    const info = vi.spyOn(console, 'info').mockImplementation(() => undefined);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    await import('../../src/card/ecogeo-card');
    info.mockClear();
    warn.mockClear();
    vi.resetModules();
    await import('../../src/card/ecogeo-card');
    expect(info).not.toHaveBeenCalled();
    // The card and its editor each warn that another copy holds the tag.
    expect(warn).toHaveBeenCalledTimes(2);
  });
});
