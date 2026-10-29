import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Web app's Firebase configuration
// Values can be overridden via Vite environment variables (VITE_FIREBASE_*)
const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ||
    "AIzaSyC-ykFI8GubAgv3woiPexxsXxYi2cF_OmU",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "fruit-fair.firebaseapp.com",
  databaseURL:
    import.meta.env.VITE_FIREBASE_DATABASE_URL ||
    "https://fruit-fair.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "fruit-fair",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    "fruit-fair.firebasestorage.app",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "970958149529",
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    "1:970958149529:web:8be0631b445bcc8aa32508",
  measurementId:
    import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-2HPZ251H81",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Google Analytics (only if running in a browser environment)
export const analytics =
  typeof window !== "undefined" ? getAnalytics(app) : null;

export default app;
