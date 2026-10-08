/**
 * Domain entities shared by the mobile app and (later) the API.
 *
 * Portable by design: timestamps are `Date`, never a database/SDK type.
 * Infrastructure adapters (today: Firebase repositories) convert at the boundary.
 *
 * Guest / Stay / Payment are intentionally NOT defined here yet — see README.md
 * ("Not yet in the domain").
 */

// ─── Tenant & identity ───
export interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

/** The SaaS tenant. Subscriptions will belong to an Organization, never a User. */
export interface Organization {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type Role = "owner" | "admin";
export type MembershipStatus = "active" | "invited" | "inactive";

export const ROLES: readonly Role[] = ["owner", "admin"];
export const MEMBERSHIP_STATUSES: readonly MembershipStatus[] = ["active", "invited", "inactive"];

/** Business membership of a user in an organization (separate from authentication identity). */
export interface OrganizationMember {
  id: string;
  organizationId: string;
  /** Today this is the Firebase Auth UID; it will become our own users.id after migration. */
  userId: string;
  role: Role;
  status: MembershipStatus;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Property hierarchy: Organization → Building → Floor → Room → Bed ───
export interface Building {
  id: string;
  organizationId: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BuildingFormData {
  name: string;
}

export interface Floor {
  id: string;
  organizationId: string;
  buildingId: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FloorFormData {
  name: string;
}

export interface Room {
  id: string;
  organizationId: string;
  buildingId: string;
  floorId: string;
  roomNumber: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type BedStatus = "vacant" | "occupied" | "reserved" | "maintenance";
export const BED_STATUSES: readonly BedStatus[] = ["vacant", "occupied", "reserved", "maintenance"];

export interface Bed {
  id: string;
  organizationId: string;
  buildingId: string;
  floorId: string;
  roomId: string;
  name: string;
  status: BedStatus;
  /** Whole rupees today. */
  defaultMonthlyRate: number;
  /** Whole rupees today. */
  defaultDailyRate: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
