import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { organizationMemberRepository } from '../features/organizations/organizationMemberRepository';
import type { OrganizationMember } from '../types';

export type OrganizationSelectionState = 'loading' | 'onboarding_required' | 'selection_required' | 'selected';

interface OrganizationState {
  activeOrganizationId: string | null;
  memberships: OrganizationMember[];
  isLoadingMemberships: boolean;
  selectionState: OrganizationSelectionState;
  setActiveOrganizationId: (id: string | null) => void;
  loadMemberships: (userId: string) => Promise<void>;
  clearMemberships: () => void;
}

export const useOrganizationStore = create<OrganizationState>()(
  persist(
    (set, get) => ({
      activeOrganizationId: null,
      memberships: [],
      isLoadingMemberships: false,
      selectionState: 'loading',
      
      setActiveOrganizationId: (id) => set({ activeOrganizationId: id, selectionState: id ? 'selected' : get().memberships.length > 0 ? 'selection_required' : 'onboarding_required' }),
      
      loadMemberships: async (userId: string) => {
        set({ isLoadingMemberships: true, selectionState: 'loading' });
        try {
          const memberships = await organizationMemberRepository.getByUserId(userId);
          
          set((state) => {
            const hasActiveId = memberships.some(m => m.organizationId === state.activeOrganizationId);
            
            let newActiveId = state.activeOrganizationId;
            let newSelectionState: OrganizationSelectionState = 'selected';
            
            if (memberships.length === 1) {
              newActiveId = memberships[0].organizationId;
              newSelectionState = 'selected';
            } else if (memberships.length === 0) {
              newActiveId = null;
              newSelectionState = 'onboarding_required';
            } else if (memberships.length > 1) {
              if (!hasActiveId) {
                newActiveId = null;
                newSelectionState = 'selection_required';
              } else {
                newSelectionState = 'selected';
              }
            }

            return {
              memberships,
              activeOrganizationId: newActiveId,
              isLoadingMemberships: false,
              selectionState: newSelectionState,
            };
          });
        } catch (error) {
          console.error('Failed to load memberships:', error);
          set({ isLoadingMemberships: false, memberships: [], activeOrganizationId: null, selectionState: 'onboarding_required' });
        }
      },
      
      clearMemberships: () => set({ memberships: [], activeOrganizationId: null, isLoadingMemberships: false, selectionState: 'loading' }),
    }),
    {
      name: 'organization-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ activeOrganizationId: state.activeOrganizationId }),
    }
  )
);
