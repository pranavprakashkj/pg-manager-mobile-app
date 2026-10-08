import type { BedStatus } from "./entities";

/**
 * Statuses an operator may set by hand. "occupied" is reserved for check-in
 * (a future server-side transaction) and is never set manually.
 */
export type ManualBedStatus = Exclude<BedStatus, "occupied">;

export const MANUAL_BED_STATUSES: readonly ManualBedStatus[] = ["vacant", "reserved", "maintenance"];

/** Mirrors the rule the bed repository enforces today. */
export function isManualStatusChangeAllowed(from: BedStatus, to: BedStatus): boolean {
  return to !== "occupied" || from === "occupied";
}

/** An occupied bed can't be deactivated. */
export function canDeactivateBed(status: BedStatus): boolean {
  return status !== "occupied";
}
