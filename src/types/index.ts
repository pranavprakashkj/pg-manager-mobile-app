export interface Building {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  active: boolean;
}

export interface Floor {
  id: string;
  buildingId: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  active: boolean;
}

export interface Room {
  id: string;
  buildingId: string;
  floorId: string;
  roomNumber: string;
  createdAt: number;
  updatedAt: number;
  active: boolean;
}

export type BedStatus = 'Vacant' | 'Occupied' | 'Reserved' | 'Maintenance';

export interface Bed {
  id: string;
  buildingId: string;
  floorId: string;
  roomId: string;
  name: string;
  status: BedStatus;
  defaultMonthlyRate: number;
  defaultDailyRate: number;
  createdAt: number;
  updatedAt: number;
  active: boolean;
}

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
  createdAt: number;
  updatedAt: number;
  active: boolean;
}

export interface BaseStay {
  id: string;
  guestId: string;
  buildingId: string;
  floorId: string;
  roomId: string;
  bedId: string;
  securityDepositAmount: number;
  securityDepositDate?: number;
  createdAt: number;
  updatedAt: number;
  active: boolean;
}

export interface MonthlyStay extends BaseStay {
  type: 'monthly';
  monthlyRent: number;
  joiningDate: number;
  rentDueDay: number;
}

export interface DailyStay extends BaseStay {
  type: 'daily';
  dailyRate: number;
  checkInDate: number;
  checkOutDate: number;
  dailyCheckInGroupId?: string;
}

export type Stay = MonthlyStay | DailyStay;

export interface DailyCheckInGroup {
  id: string;
  checkInDate: number;
  checkOutDate: number;
  createdAt: number;
}

export type PaymentStatus = 'Paid' | 'Partial' | 'Upcoming' | 'Due' | 'Overdue';

export interface Payment {
  id: string;
  stayId: string;
  guestId: string;
  amountDue: number;
  amountPaid: number;
  dueDate: number;
  status: PaymentStatus;
  createdAt: number;
  updatedAt: number;
  billingPeriod?: string; // e.g., "2026-10" to ensure idempotency for monthly generation
}
