import { signInWithEmailAndPassword, sendPasswordResetEmail, signOut } from "firebase/auth";
import { auth } from "../../lib/firebase/config";

export const authService = {
  login: async (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  },
  resetPassword: async (email: string) => {
    return sendPasswordResetEmail(auth, email);
  },
  logout: async () => {
    return signOut(auth);
  }
};
