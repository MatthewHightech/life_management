/** Greatest common divisor for reducing fractions. */
function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const next = x % y;
    x = y;
    y = next;
  }
  return x || 1;
}

/**
 * Convert a decimal quantity string to a cooking-friendly fraction for display.
 * Examples: "0.5" → "1/2", "1.5" → "1 1/2", "0.333" → "1/3".
 * Non-numeric or already-fraction strings are returned as-is.
 */
export function formatQuantityAsFraction(raw: string | null | undefined): string {
  if (raw == null) {
    return "";
  }

  const trimmed = raw.trim();
  if (!trimmed) {
    return "";
  }

  if (/^\d+\s+\d+\/\d+$/.test(trimmed) || /^\d+\/\d+$/.test(trimmed)) {
    return trimmed;
  }

  const value = Number(trimmed);
  if (!Number.isFinite(value)) {
    return trimmed;
  }

  if (Number.isInteger(value)) {
    return String(value);
  }

  const sign = value < 0 ? "-" : "";
  const absolute = Math.abs(value);
  const whole = Math.floor(absolute + 1e-9);
  const fractional = absolute - whole;

  if (fractional < 1e-9) {
    return `${sign}${whole}`;
  }

  const maxDenominator = 16;
  let bestNumerator = 1;
  let bestDenominator = 1;
  let bestError = Number.POSITIVE_INFINITY;

  for (let denominator = 1; denominator <= maxDenominator; denominator += 1) {
    const numerator = Math.round(fractional * denominator);
    if (numerator <= 0 || numerator > denominator) {
      continue;
    }
    const error = Math.abs(fractional - numerator / denominator);
    if (error < bestError - 1e-12 || (Math.abs(error - bestError) < 1e-12 && denominator < bestDenominator)) {
      bestError = error;
      bestNumerator = numerator;
      bestDenominator = denominator;
    }
  }

  // Too far from a clean fraction — keep the original decimal text.
  if (bestError > 0.03) {
    return trimmed;
  }

  const divisor = gcd(bestNumerator, bestDenominator);
  const fraction = `${bestNumerator / divisor}/${bestDenominator / divisor}`;

  if (whole === 0) {
    return `${sign}${fraction}`;
  }

  return `${sign}${whole} ${fraction}`;
}
