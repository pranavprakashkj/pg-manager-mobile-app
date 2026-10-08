import { Timestamp } from "firebase/firestore";

/**
 * Firestore ↔ domain conversions. Firestore types stop here; the domain only sees `Date`.
 *
 * Reads use `snapshot.data({ serverTimestamps: "estimate" })`, so a freshly written
 * `serverTimestamp()` arrives as an estimated Timestamp rather than null.
 */
export const SNAPSHOT_OPTIONS = { serverTimestamps: "estimate" } as const;

/** Firestore Timestamp → Date. A missing value (e.g. very old documents) maps to the Unix epoch. */
export function toDate(value: unknown): Date {
  if (value instanceof Date) return value;
  // Duck-typed so it also works with Timestamps from other SDK instances (e.g. firebase-admin in scripts).
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    return (value as { toDate(): Date }).toDate();
  }
  return new Date(0);
}

/** Date → Firestore Timestamp, for writes of business dates (server-managed fields use serverTimestamp()). */
export function toTimestamp(date: Date): Timestamp {
  return Timestamp.fromDate(date);
}
