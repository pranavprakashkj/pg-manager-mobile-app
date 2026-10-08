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
import { SNAPSHOT_OPTIONS, toDate } from "../../lib/firebase/converters";
import type { BuildingRepository } from "@pg-manager/domain";
import type { Building, BuildingFormData } from "../../types";

const COLLECTION = "buildings";

function buildingsRef() {
  return collection(db, COLLECTION);
}

function buildingDocRef(id: string) {
  return doc(db, COLLECTION, id);
}

function docToBuilding(docSnap: import("firebase/firestore").DocumentSnapshot): Building {
  const data = docSnap.data(SNAPSHOT_OPTIONS);
  if (!data) throw new Error("Building document has no data");
  return {
    id: docSnap.id,
    organizationId: data.organizationId,
    name: data.name,
    isActive: data.isActive,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  } as Building;
}

export const buildingRepository = {
  async getAll(organizationId: string): Promise<Building[]> {
    const q = query(buildingsRef(), where("organizationId", "==", organizationId), where("isActive", "==", true), orderBy("name"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docToBuilding);
  },

  async getById(organizationId: string, id: string): Promise<Building> {
    const docSnap = await getDoc(buildingDocRef(id));
    if (!docSnap.exists()) throw new Error("Building not found");
    const building = docToBuilding(docSnap);
    if (building.organizationId !== organizationId) throw new Error("Unauthorized access to building");
    return building;
  },

  async findById(organizationId: string, id: string): Promise<Building | null> {
    const docSnap = await getDoc(buildingDocRef(id));
    if (!docSnap.exists()) return null;
    const building = docToBuilding(docSnap);
    if (building.organizationId !== organizationId) return null;
    return building;
  },

  async create(organizationId: string, data: BuildingFormData): Promise<string> {
    const docRef = await addDoc(buildingsRef(), {
      organizationId,
      name: data.name.trim(),
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async update(organizationId: string, id: string, data: BuildingFormData): Promise<void> {
    await this.getById(organizationId, id); // Verify ownership
    await updateDoc(buildingDocRef(id), {
      name: data.name.trim(),
      updatedAt: serverTimestamp(),
    });
  },

  async deactivate(organizationId: string, id: string): Promise<void> {
    await this.getById(organizationId, id); // Verify ownership
    await updateDoc(buildingDocRef(id), {
      isActive: false,
      updatedAt: serverTimestamp(),
    });
  },
} satisfies BuildingRepository;
