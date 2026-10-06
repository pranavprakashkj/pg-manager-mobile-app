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
import type { Building, BuildingFormData } from "../../types";

const COLLECTION = "buildings";

function buildingsRef() {
  return collection(db, COLLECTION);
}

function buildingDocRef(id: string) {
  return doc(db, COLLECTION, id);
}

function docToBuilding(docSnap: import("firebase/firestore").DocumentSnapshot): Building {
  const data = docSnap.data();
  if (!data) throw new Error("Building document has no data");
  return {
    id: docSnap.id,
    name: data.name,
    isActive: data.isActive,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  } as Building;
}

export const buildingRepository = {
  async getAll(): Promise<Building[]> {
    const q = query(buildingsRef(), where("isActive", "==", true), orderBy("name"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docToBuilding);
  },

  async getById(id: string): Promise<Building> {
    const docSnap = await getDoc(buildingDocRef(id));
    if (!docSnap.exists()) throw new Error("Building not found");
    return docToBuilding(docSnap);
  },

  async findById(id: string): Promise<Building | null> {
    const docSnap = await getDoc(buildingDocRef(id));
    if (!docSnap.exists()) return null;
    return docToBuilding(docSnap);
  },

  async create(data: BuildingFormData): Promise<string> {
    const docRef = await addDoc(buildingsRef(), {
      name: data.name.trim(),
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async update(id: string, data: BuildingFormData): Promise<void> {
    await updateDoc(buildingDocRef(id), {
      name: data.name.trim(),
      updatedAt: serverTimestamp(),
    });
  },

  async deactivate(id: string): Promise<void> {
    await updateDoc(buildingDocRef(id), {
      isActive: false,
      updatedAt: serverTimestamp(),
    });
  },
};
