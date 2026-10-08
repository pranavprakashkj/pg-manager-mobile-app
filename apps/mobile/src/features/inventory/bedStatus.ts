import type { BedStatus } from "@pg-manager/domain";

/**
 * UI presentation of the four domain bed statuses.
 * "Ready" and "Repair" are V2 display labels only — the stored statuses
 * remain vacant / occupied / reserved / maintenance.
 */
export const bedStatusLabel: Record<BedStatus, string> = {
  vacant: "Vacant",
  occupied: "Occupied",
  reserved: "Reserved",
  maintenance: "Repair",
};

export type BedStatusTone = "info" | "success" | "warning" | "neutral";

/** Semantic tone: occupied=info, vacant/ready=success, reserved=warning, repair=neutral. */
export const bedStatusTone: Record<BedStatus, BedStatusTone> = {
  occupied: "info",
  vacant: "success",
  reserved: "warning",
  maintenance: "neutral",
};

/** Business rule lives in the domain; re-exported for existing screen imports. */
export { MANUAL_BED_STATUSES } from "@pg-manager/domain";
