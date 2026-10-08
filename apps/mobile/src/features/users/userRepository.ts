import {
  
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../lib/firebase/config';
import { SNAPSHOT_OPTIONS, toDate } from '../../lib/firebase/converters';
import type { UserProfileUpdate, UserRepository } from '@pg-manager/domain';
import type { User } from '../../types';

const COLLECTION = 'users';

function userDocRef(uid: string) {
  return doc(db, COLLECTION, uid);
}

function docToUser(docSnap: import('firebase/firestore').DocumentSnapshot): User {
  const data = docSnap.data(SNAPSHOT_OPTIONS);
  if (!data) throw new Error('User document has no data');
  return {
    id: docSnap.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
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

  async update(uid: string, data: UserProfileUpdate): Promise<void> {
    await updateDoc(userDocRef(uid), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },
} satisfies UserRepository;
