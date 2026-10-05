import { initializeApp } from "firebase/app";

// Firebase configuration placeholder
// Use environment variables or Expo constants in actual implementation
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "demo-api-key",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "demo-auth-domain",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "demo-project-id",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "demo-storage-bucket",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "demo-sender-id",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "demo-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export { app };
