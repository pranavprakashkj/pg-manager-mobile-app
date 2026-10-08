import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { repositories } from '../infrastructure/repositories';
import type { OrganizationMember } from '../types';

export type OrganizationSelectionState = 'loading' | 'onboarding_required' | 'selection_required' | 'selected';

interface OrganizationState {
  activeOrganizationId: string | null;
  memberships: OrganizationMember[];
  isLoadingMemberships: boolean;
  selectionState: OrganizationSelectionState;
  /**
   * Set when memberships could not be loaded. selectionState then stays
   * 'loading' — a failed load must never be read as "no organizations",
   * which would push an existing owner into creating a duplicate.
   */
  membershipsError: unknown | null;
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
      membershipsError: null,

      setActiveOrganizationId: (id) => set({ activeOrganizationId: id, selectionState: id ? 'selected' : get().memberships.length > 0 ? 'selection_required' : 'onboarding_required' }),

      loadMemberships: async (userId: string) => {
        set({ isLoadingMemberships: true, selectionState: 'loading', membershipsError: null });
        try {
          const memberships = await repositories.organizationMembers.getByUserId(userId);

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
          // Keep the persisted selection so a retry can restore it.
          set({ isLoadingMemberships: false, membershipsError: error, selectionState: 'loading' });
        }
      },

      clearMemberships: () => set({ memberships: [], activeOrganizationId: null, isLoadingMemberships: false, selectionState: 'loading', membershipsError: null }),
    }),
    {
      name: 'organization-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ activeOrganizationId: state.activeOrganizationId }),
    }
  )
);
