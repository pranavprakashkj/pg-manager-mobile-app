/**
 * Formats a rupee amount with Indian digit grouping: 145000 → "₹1,45,000".
 * Implemented by hand so output is identical on Hermes, JSC and Node.
 */
export function formatINR(value: number): string {
  if (!Number.isFinite(value)) return "—";
  const negative = value < 0;
  const rounded = Math.round(Math.abs(value));
  const digits = String(rounded);
  let grouped = digits;
  if (digits.length > 3) {
    const last3 = digits.slice(-3);
    const rest = digits.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ",");
    grouped = `${rest},${last3}`;
  }
  return `${negative ? "−" : ""}₹${grouped}`;
}

/** "₹8,500" for a single rate, "₹8,000–₹9,500" for a spread. */
export function formatINRRange(min: number, max: number): string {
  return min === max ? formatINR(min) : `${formatINR(min)}–${formatINR(max)}`;
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
