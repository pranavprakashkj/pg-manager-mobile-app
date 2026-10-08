/**
 * UNFINALIZED LEGACY TYPES — reference only. Do not import into new code.
 *
 * These pre-date the migration plan, are unused by the app, and are deliberately
 * NOT part of @pg-manager/domain. They will be redesigned with Guests / Stays /
 * Payments after the backend migration. See packages/domain/README.md.
 *
 * Known problems:
 * - Payment models a due/billing-period row (amountDue, amountPaid, dueDate, billingPeriod)
 *   with a STORED, time-dependent status (Due / Upcoming / Overdue). The agreed meaning is:
 *   a Payment is money actually received and recorded. No placeholder rows per billing
 *   period; overdue is derived, not stored.
 * - Stay is not finalized: no checkout/end date for monthly stays, only `isActive`.
 *   It must keep the applicable rent/rate (historical pricing) — that part is right.
 *
 * Timestamps were converted from Firestore Timestamp to Date so Firebase types no
 * longer appear in type definitions; nothing else was changed.
 */

export interface Guest {
  id: string;
  organizationId: string;
  name: string;
  phoneNumber: string;
  email?: string;
  gender?: string;
  idType?: string;
  idNumber?: string;
  emergencyContact?: string;
  address?: string;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BaseStay {
  id: string;
  organizationId: string;
  guestId: string;
  buildingId: string;
  floorId: string;
  roomId: string;
  bedId: string;
  securityDepositAmount: number;
  securityDepositDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MonthlyStay extends BaseStay {
  type: "monthly";
  monthlyRent: number;
  joiningDate: Date;
  rentDueDay: number;
}

export interface DailyStay extends BaseStay {
  type: "daily";
  dailyRate: number;
  checkInDate: Date;
  checkOutDate: Date;
  dailyCheckInGroupId?: string;
}

export type Stay = MonthlyStay | DailyStay;

export interface DailyCheckInGroup {
  id: string;
  organizationId: string;
  checkInDate: Date;
  checkOutDate: Date;
  createdAt: Date;
}

/** @deprecated Semantics are wrong for the target model — see the file header. */
export type PaymentStatus = "Paid" | "Partial" | "Upcoming" | "Due" | "Overdue";

/** @deprecated Dues/billing-period row, not "money received" — see the file header. */
export interface Payment {
  id: string;
  organizationId: string;
  stayId: string;
  guestId: string;
  amountDue: number;
  amountPaid: number;
  dueDate: Date;
  status: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
  billingPeriod?: string;
}
