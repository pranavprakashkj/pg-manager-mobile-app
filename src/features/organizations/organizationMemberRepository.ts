import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../lib/firebase/config';
import type { OrganizationMember, Role, MembershipStatus } from '../../types';

const COLLECTION = 'organizationMembers';

export function organizationMembersRef() {
  return collection(db, COLLECTION);
}

export function organizationMemberDocRef(organizationId: string, userId: string) {
  return doc(db, COLLECTION, `${organizationId}_${userId}`);
}

function docToOrganizationMember(docSnap: import('firebase/firestore').DocumentSnapshot): OrganizationMember {
  const data = docSnap.data();
  if (!data) throw new Error('OrganizationMember document has no data');
  return {
    id: docSnap.id,
    organizationId: data.organizationId,
    userId: data.userId,
    role: data.role,
    status: data.status,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  } as OrganizationMember;
}

export const organizationMemberRepository = {
  async getByUserId(userId: string): Promise<OrganizationMember[]> {
    const q = query(
      organizationMembersRef(),
      where('userId', '==', userId),
      where('status', '==', 'active')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docToOrganizationMember);
  },

  async getMembership(organizationId: string, userId: string): Promise<OrganizationMember | null> {
    const docSnap = await getDoc(organizationMemberDocRef(organizationId, userId));
    if (!docSnap.exists()) return null;
    return docToOrganizationMember(docSnap);
  },

  async create(organizationId: string, userId: string, role: Role, status: MembershipStatus): Promise<void> {
    await setDoc(organizationMemberDocRef(organizationId, userId), {
      organizationId,
      userId,
      role,
      status,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  },

  async updateRole(organizationId: string, userId: string, role: Role): Promise<void> {
    await updateDoc(organizationMemberDocRef(organizationId, userId), {
      role,
      updatedAt: serverTimestamp(),
    });
  },
  
  async updateStatus(organizationId: string, userId: string, status: MembershipStatus): Promise<void> {
    await updateDoc(organizationMemberDocRef(organizationId, userId), {
      status,
      updatedAt: serverTimestamp(),
    });
  }
};
