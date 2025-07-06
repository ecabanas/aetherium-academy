import { initializeApp, getApps, getApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Explicitly provide the project ID from the environment variables.
// This ensures the Admin SDK connects to the same project as the client-side Firebase SDK,
// which is crucial for non-default regions like eur3.
const firebaseConfig = {
  credential: applicationDefault(),
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

const app = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

export const firestore = getFirestore(app);
export const auth = getAuth(app);
