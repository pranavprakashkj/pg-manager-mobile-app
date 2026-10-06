import {
  collection,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../lib/firebase/config';
import type { Organization } from '../../types';

const COLLECTION = 'organizations';

export function organizationsRef() {
  return collection(db, COLLECTION);
}

export function organizationDocRef(id: string) {
  return doc(db, COLLECTION, id);
}

function docToOrganization(docSnap: import('firebase/firestore').DocumentSnapshot): Organization {
  const data = docSnap.data();
  if (!data) throw new Error('Organization document has no data');
  return {
    id: docSnap.id,
    name: data.name,
    isActive: data.isActive,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  } as Organization;
}

export const organizationRepository = {
  async getById(id: string): Promise<Organization | null> {
    const docSnap = await getDoc(organizationDocRef(id));
    if (!docSnap.exists()) return null;
    return docToOrganization(docSnap);
  },

  async create(name: string): Promise<string> {
    const docRef = await addDoc(organizationsRef(), {
      name: name.trim(),
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async update(id: string, name: string): Promise<void> {
    await updateDoc(organizationDocRef(id), {
      name: name.trim(),
      updatedAt: serverTimestamp(),
    });
  },

  async deactivate(id: string): Promise<void> {
    await updateDoc(organizationDocRef(id), {
      isActive: false,
      updatedAt: serverTimestamp(),
    });
  },
};
