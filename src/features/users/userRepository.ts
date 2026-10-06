import {
  
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../lib/firebase/config';
import type { User } from '../../types';

const COLLECTION = 'users';

function userDocRef(uid: string) {
  return doc(db, COLLECTION, uid);
}

function docToUser(docSnap: import('firebase/firestore').DocumentSnapshot): User {
  const data = docSnap.data();
  if (!data) throw new Error('User document has no data');
  return {
    id: docSnap.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  } as User;
}

export const userRepository = {
  async getById(uid: string): Promise<User | null> {
    const docSnap = await getDoc(userDocRef(uid));
    if (!docSnap.exists()) return null;
    return docToUser(docSnap);
  },

  async create(uid: string, name: string, email?: string, phone?: string): Promise<void> {
    await setDoc(userDocRef(uid), {
      name,
      email: email || null,
      phone: phone || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  },

  async update(uid: string, data: Partial<User>): Promise<void> {
    await updateDoc(userDocRef(uid), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },
};
