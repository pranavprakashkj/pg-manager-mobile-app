import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../lib/firebase/config";
import { buildingRepository } from "../buildings/buildingRepository";
import { floorRepository } from "../floors/floorRepository";
import { roomRepository } from "../rooms/roomRepository";
import type { Bed, BedFormInput, BedUpdateInput } from "../../types";

const COLLECTION = "beds";

function bedsRef() {
  return collection(db, COLLECTION);
}

function bedDocRef(id: string) {
  return doc(db, COLLECTION, id);
}

function docToBed(docSnap: import("firebase/firestore").DocumentSnapshot): Bed {
  const data = docSnap.data();
  if (!data) throw new Error("Bed document has no data");
  return {
    id: docSnap.id,
    organizationId: data.organizationId,
    buildingId: data.buildingId,
    floorId: data.floorId,
    roomId: data.roomId,
    name: data.name,
    status: data.status,
    defaultMonthlyRate: data.defaultMonthlyRate,
    defaultDailyRate: data.defaultDailyRate,
    isActive: data.isActive,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  } as Bed;
}

export const bedRepository = {
  async getByFloorId(organizationId: string, floorId: string): Promise<Bed[]> {
    const q = query(
      bedsRef(),
      where("organizationId", "==", organizationId),
      where("floorId", "==", floorId),
      where("isActive", "==", true)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docToBed);
  },

  async getByRoomId(organizationId: string, roomId: string): Promise<Bed[]> {
    const q = query(
      bedsRef(),
      where("organizationId", "==", organizationId),
      where("roomId", "==", roomId),
      where("isActive", "==", true),
      orderBy("name")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docToBed);
  },

  async getAllActive(organizationId: string): Promise<Bed[]> {
    const q = query(bedsRef(), where("organizationId", "==", organizationId), where("isActive", "==", true));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docToBed);
  },

  async getById(organizationId: string, id: string): Promise<Bed> {
    const docSnap = await getDoc(bedDocRef(id));
    if (!docSnap.exists()) throw new Error("Bed not found");
    const bed = docToBed(docSnap);
    if (bed.organizationId !== organizationId) throw new Error("Unauthorized access to bed");
    return bed;
  },

  async findById(organizationId: string, id: string): Promise<Bed | null> {
    const docSnap = await getDoc(bedDocRef(id));
    if (!docSnap.exists()) return null;
    const bed = docToBed(docSnap);
    if (bed.organizationId !== organizationId) return null;
    return bed;
  },

  async create(organizationId: string, buildingId: string, floorId: string, roomId: string, data: BedFormInput): Promise<string> {
    // Validate Room
    const room = await roomRepository.findById(organizationId, roomId);
    if (!room) throw new Error("Cannot add bed to a nonexistent room");
    if (!room.isActive) throw new Error("Cannot add bed to an inactive room");
    if (room.floorId !== floorId) throw new Error("Room does not belong to the specified floor");
    if (room.buildingId !== buildingId) throw new Error("Room does not belong to the specified building");

    // Validate Floor
    const floor = await floorRepository.findById(organizationId, floorId);
    if (!floor) throw new Error("Cannot add bed to a nonexistent floor");
    if (!floor.isActive) throw new Error("Cannot add bed to an inactive floor");
    if (floor.buildingId !== buildingId) throw new Error("Floor does not belong to the specified building");

    // Validate Building
    const building = await buildingRepository.findById(organizationId, buildingId);
    if (!building) throw new Error("Cannot add bed to a nonexistent building");
    if (!building.isActive) throw new Error("Cannot add bed to an inactive building");

    // Check for duplicates
    const existingBeds = await this.getByRoomId(organizationId, roomId);
    const isDuplicate = existingBeds.some(
      (b) => b.name.toLowerCase() === data.name.trim().toLowerCase()
    );
    if (isDuplicate) {
      throw new Error("A bed with this name already exists in this room");
    }

    const docRef = await addDoc(bedsRef(), {
      organizationId,
      buildingId,
      floorId,
      roomId,
      name: data.name.trim(),
      status: "vacant", // New beds start as Vacant
      defaultMonthlyRate: data.defaultMonthlyRate,
      defaultDailyRate: data.defaultDailyRate,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async update(organizationId: string, id: string, data: BedUpdateInput): Promise<void> {
    const bed = await this.getById(organizationId, id);
    
    // Check for duplicates (excluding self)
    const existingBeds = await this.getByRoomId(organizationId, bed.roomId);
    const isDuplicate = existingBeds.some(
      (b) => b.id !== id && b.name.toLowerCase() === data.name.trim().toLowerCase()
    );
    if (isDuplicate) {
      throw new Error("A bed with this name already exists in this room");
    }

    // Status transition checks are partly handled by the UI/schema, 
    // but we should ensure we don't arbitrarily set Occupied if we are trying to be strict.
    // However, if the bed is already occupied, we must allow updating other fields.
    // The prompt says "Occupied must NOT become a manually editable source of truth... Do not provide a normal 'Set Occupied' action in the Phase 3B UI."
    // We will enforce this UI side and Schema side (the schema does have Occupied, but we can restrict it in the UI).
    // Let's enforce that a bed cannot transition TO Occupied manually.
    if (data.status === "occupied" && bed.status !== "occupied") {
      throw new Error("Cannot manually set a bed to Occupied in Phase 3B");
    }

    await updateDoc(bedDocRef(id), {
      name: data.name.trim(),
      status: data.status,
      defaultMonthlyRate: data.defaultMonthlyRate,
      defaultDailyRate: data.defaultDailyRate,
      updatedAt: serverTimestamp(),
    });
  },

  async deactivate(organizationId: string, id: string): Promise<void> {
    const bed = await this.getById(organizationId, id);
    if (bed.status === "occupied") {
      throw new Error("Cannot deactivate an occupied bed");
    }
    
    await updateDoc(bedDocRef(id), {
      isActive: false,
      updatedAt: serverTimestamp(),
    });
  },
};
