import { Timestamp } from "firebase/firestore";

// ─── Building ───
export interface Building {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface BuildingFormData {
  name: string;
}

// ─── Floor ───
export interface Floor {
  id: string;
  buildingId: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FloorFormData {
  name: string;
}

// ─── Room ───
export interface Room {
  id: string;
  buildingId: string;
  floorId: string;
  roomNumber: string;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── Bed ───
export type BedStatus = "vacant" | "occupied" | "reserved" | "maintenance";

export interface Bed {
  id: string;
  buildingId: string;
  floorId: string;
  roomId: string;
  name: string;
  status: BedStatus;
  defaultMonthlyRate: number;
  defaultDailyRate: number;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── Guest ───
export interface Guest {
  id: string;
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
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── Stay ───
export interface BaseStay {
  id: string;
  guestId: string;
  buildingId: string;
  floorId: string;
  roomId: string;
  bedId: string;
  securityDepositAmount: number;
  securityDepositDate?: Timestamp;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface MonthlyStay extends BaseStay {
  type: "monthly";
  monthlyRent: number;
  joiningDate: Timestamp;
  rentDueDay: number;
}

export interface DailyStay extends BaseStay {
  type: "daily";
  dailyRate: number;
  checkInDate: Timestamp;
  checkOutDate: Timestamp;
  dailyCheckInGroupId?: string;
}

export type Stay = MonthlyStay | DailyStay;

// ─── Daily Check-In Group ───
export interface DailyCheckInGroup {
  id: string;
  checkInDate: Timestamp;
  checkOutDate: Timestamp;
  createdAt: Timestamp;
}

// ─── Payment ───
export type PaymentStatus = "Paid" | "Partial" | "Upcoming" | "Due" | "Overdue";

export interface Payment {
  id: string;
  stayId: string;
  guestId: string;
  amountDue: number;
  amountPaid: number;
  dueDate: Timestamp;
  status: PaymentStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  billingPeriod?: string;
}

export type { RoomFormInput } from "../features/rooms/schemas";
export type { BedFormInput, BedUpdateInput } from "../features/beds/schemas";
