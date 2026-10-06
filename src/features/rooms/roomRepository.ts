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
import { bedRepository } from "../beds/bedRepository";
import { buildingRepository } from "../buildings/buildingRepository";
import { floorRepository } from "../floors/floorRepository";
import type { Room, RoomFormInput } from "../../types";

const COLLECTION = "rooms";

function roomsRef() {
  return collection(db, COLLECTION);
}

function roomDocRef(id: string) {
  return doc(db, COLLECTION, id);
}

function docToRoom(docSnap: import("firebase/firestore").DocumentSnapshot): Room {
  const data = docSnap.data();
  if (!data) throw new Error("Room document has no data");
  return {
    id: docSnap.id,
    organizationId: data.organizationId,
    buildingId: data.buildingId,
    floorId: data.floorId,
    roomNumber: data.roomNumber,
    isActive: data.isActive,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  } as Room;
}

export const roomRepository = {
  async getByFloorId(organizationId: string, floorId: string): Promise<Room[]> {
    const q = query(
      roomsRef(),
      where("organizationId", "==", organizationId),
      where("floorId", "==", floorId),
      where("isActive", "==", true),
      orderBy("roomNumber")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docToRoom);
  },

  async getAllActive(organizationId: string): Promise<Room[]> {
    const q = query(roomsRef(), where("organizationId", "==", organizationId), where("isActive", "==", true));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docToRoom);
  },

  async getById(organizationId: string, id: string): Promise<Room> {
    const docSnap = await getDoc(roomDocRef(id));
    if (!docSnap.exists()) throw new Error("Room not found");
    const room = docToRoom(docSnap);
    if (room.organizationId !== organizationId) throw new Error("Unauthorized access to room");
    return room;
  },

  async findById(organizationId: string, id: string): Promise<Room | null> {
    const docSnap = await getDoc(roomDocRef(id));
    if (!docSnap.exists()) return null;
    const room = docToRoom(docSnap);
    if (room.organizationId !== organizationId) return null;
    return room;
  },

  async create(organizationId: string, buildingId: string, floorId: string, data: RoomFormInput): Promise<string> {
    const floor = await floorRepository.findById(organizationId, floorId);
    if (!floor) throw new Error("Cannot add room to a nonexistent floor");
    if (!floor.isActive) throw new Error("Cannot add room to an inactive floor");
    if (floor.buildingId !== buildingId) throw new Error("Floor does not belong to the specified building");

    const building = await buildingRepository.findById(organizationId, buildingId);
    if (!building) throw new Error("Cannot add room to a nonexistent building");
    if (!building.isActive) throw new Error("Cannot add room to an inactive building");

    const existingRooms = await this.getByFloorId(organizationId, floorId);
    const isDuplicate = existingRooms.some(
      (r) => r.roomNumber.toLowerCase() === data.roomNumber.trim().toLowerCase()
    );
    if (isDuplicate) {
      throw new Error("A room with this number already exists on this floor");
    }

    const docRef = await addDoc(roomsRef(), {
      organizationId,
      buildingId,
      floorId,
      roomNumber: data.roomNumber.trim(),
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async update(organizationId: string, id: string, data: RoomFormInput): Promise<void> {
    const room = await this.getById(organizationId, id);
    const existingRooms = await this.getByFloorId(organizationId, room.floorId);
    const isDuplicate = existingRooms.some(
      (r) => r.id !== id && r.roomNumber.toLowerCase() === data.roomNumber.trim().toLowerCase()
    );
    if (isDuplicate) {
      throw new Error("A room with this number already exists on this floor");
    }

    await updateDoc(roomDocRef(id), {
      roomNumber: data.roomNumber.trim(),
      updatedAt: serverTimestamp(),
    });
  },

  async deactivate(organizationId: string, id: string): Promise<void> {
    await this.getById(organizationId, id); // Verify ownership
    const activeBeds = await bedRepository.getByRoomId(organizationId, id);
    if (activeBeds.length > 0) {
      throw new Error("This room still has active beds. Deactivate or move those beds first.");
    }
    await updateDoc(roomDocRef(id), {
      isActive: false,
      updatedAt: serverTimestamp(),
    });
  },
};
