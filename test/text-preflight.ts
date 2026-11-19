// The browser preflight's decision (rework-layouts D11), kept pure so a unit test can cover it. Chromium lays text out
// with whole-pixel advances when Windows font smoothing is off (an RDP session without font smoothing), so label widths
// come out wider than on a normal host and the 2 px label margin rule fails for the wrong reason. On Linux at scale
// factor 1 Chromium always uses whole-pixel advances (CI's reference environment), so the guard is for Windows only.

/** The two reference strings of different lengths, measured at REFERENCE_SIZE in Roboto. */
export const REFERENCE_TEXTS = ['Out -12.3 °C', 'Heating circuit 45.7 °C'] as const;

/** A fractional size, so that with fractional advances at least one width is fractional. */
export const REFERENCE_SIZE = 10.3;

/** The message of the failed preflight. */
export const SMOOTHING_MESSAGE =
  'Browser preflight failed: Chromium measures text with whole-pixel widths, which happens when Windows font ' +
  'smoothing is off, as in a remote desktop (RDP) session without font smoothing. The overlap tests would fail on ' +
  'wrong label widths. Enable font smoothing in the RDP client (`allow font smoothing:i:1` in the .rdp file, or the ' +
  '"Font smoothing" experience option), or run the tests from the console or in CI.';

/** Whether a width has no fractional part. */
const isWhole = (width: number): boolean => Number.isInteger(width);

/**
 * The preflight's verdict: the message when the browser is Chromium on Windows and every measured width is a whole number,
 * otherwise null. Other engines (WebKit) and other platforms always pass.
 */
export function smoothingProblem(isChromium: boolean, isWindows: boolean, widths: readonly number[]): string | null {
  if (!isChromium || !isWindows || widths.length === 0) return null;
  return widths.every(isWhole) ? SMOOTHING_MESSAGE : null;
}
