import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

let isFirebaseEnabled = false;
let app: any = null;
let authInstance: any = null;
let firestoreInstance: any = null;

// Check if we have minimal required config
const hasValidConfig = firebaseConfig.apiKey && firebaseConfig.projectId;

if (hasValidConfig) {
  try {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
      authInstance = getAuth(app);
      firestoreInstance = getFirestore(app);
      isFirebaseEnabled = true;
    } else {
      const existingApp = getApps()[0];
      authInstance = getAuth(existingApp);
      firestoreInstance = getFirestore(existingApp);
      isFirebaseEnabled = true;
    }
  } catch (e) {
    console.warn('Firebase initialization failed:', e);
    isFirebaseEnabled = false;
  }
} else {
  console.warn('Firebase env variables not configured. Using localStorage fallback.');
}

export const firebaseEnabled = isFirebaseEnabled;
export const firebaseApp = app;
export const auth = authInstance;
export const firestore = firestoreInstance;

export default { firebaseEnabled, auth, firestore };
