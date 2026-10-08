import { create } from "zustand";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase/config";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  init: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isInitialized: false,
  init: () => {
    if (get().isInitialized) return;
    set({ isInitialized: true });
    onAuthStateChanged(auth, (user) => {
      set({ user, isLoading: false });
    });
  },
}));
