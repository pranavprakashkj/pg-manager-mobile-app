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
import type { Floor, FloorFormData } from "../../types";

const COLLECTION = "floors";

function floorsRef() {
  return collection(db, COLLECTION);
}

function floorDocRef(id: string) {
  return doc(db, COLLECTION, id);
}

function docToFloor(docSnap: import("firebase/firestore").DocumentSnapshot): Floor {
  const data = docSnap.data();
  if (!data) throw new Error("Floor document has no data");
  return {
    id: docSnap.id,
    organizationId: data.organizationId,
    buildingId: data.buildingId,
    name: data.name,
    sortOrder: data.sortOrder,
    isActive: data.isActive,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  } as Floor;
}

export const floorRepository = {
  
  async getAllActive(organizationId: string): Promise<Floor[]> {
    const q = query(
      floorsRef(),
      where("organizationId", "==", organizationId),
      where("isActive", "==", true)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docToFloor);
  },

  async getByBuildingId(organizationId: string, buildingId: string): Promise<Floor[]> {
    const q = query(
      floorsRef(),
      where("organizationId", "==", organizationId),
      where("buildingId", "==", buildingId),
      where("isActive", "==", true),
      orderBy("sortOrder")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docToFloor);
  },

  async findById(organizationId: string, id: string): Promise<Floor | null> {
    const docSnap = await getDoc(floorDocRef(id));
    if (!docSnap.exists()) return null;
    const floor = docToFloor(docSnap);
    if (floor.organizationId !== organizationId) return null;
    return floor;
  },

  async getById(organizationId: string, id: string): Promise<Floor> {
    const docSnap = await getDoc(floorDocRef(id));
    if (!docSnap.exists()) throw new Error("Floor not found");
    const floor = docToFloor(docSnap);
    if (floor.organizationId !== organizationId) throw new Error("Unauthorized access to floor");
    return floor;
  },

  async create(
    organizationId: string,
    buildingId: string,
    data: FloorFormData,
    sortOrder: number
  ): Promise<string> {
    const building = await buildingRepository.findById(organizationId, buildingId);
    if (!building) {
      throw new Error("Cannot add floor to a nonexistent building");
    }
    if (!building.isActive) {
      throw new Error("Cannot add floor to an inactive building");
    }

    const docRef = await addDoc(floorsRef(), {
      organizationId,
      buildingId,
      name: data.name.trim(),
      sortOrder,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async update(organizationId: string, id: string, data: FloorFormData): Promise<void> {
    await this.getById(organizationId, id); // Verify ownership
    await updateDoc(floorDocRef(id), {
      name: data.name.trim(),
      updatedAt: serverTimestamp(),
    });
  },

  async deactivate(organizationId: string, id: string): Promise<void> {
    await this.getById(organizationId, id); // Verify ownership
    await updateDoc(floorDocRef(id), {
      isActive: false,
      updatedAt: serverTimestamp(),
    });
  },

  async getNextSortOrder(organizationId: string, buildingId: string): Promise<number> {
    const floors = await floorRepository.getByBuildingId(organizationId, buildingId);
    if (floors.length === 0) return 0;
    return Math.max(...floors.map((f) => f.sortOrder)) + 1;
  },
};
