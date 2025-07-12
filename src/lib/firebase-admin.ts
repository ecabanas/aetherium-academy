
import 'dotenv/config';
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

/**
 * Verifies a Firebase ID token and returns the user's UID.
 * @param idToken The Firebase ID token from the client.
 * @returns The user's UID if the token is valid, otherwise null.
 */
export async function getUserIdFromToken(idToken: string): Promise<string | null> {
  if (!idToken || typeof idToken !== 'string' || idToken.trim() === '') {
     console.error("Authentication error: The provided ID token was empty or invalid. This may happen if the user is not logged in.");
     return null;
  }
  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    return decodedToken.uid;
  } catch (error: any) {
    const errorCode = error.code || 'UNKNOWN';
    console.error(`************************************************************************************************`);
    console.error(`* Firebase Admin SDK Error (code: ${errorCode})`);
    console.error(`* Message: ${error.message}`);
    console.error(`* `);
    console.error(`* This error occurred while trying to verify a user's login session on the server.`);
    console.error(`* This usually means the backend environment is not configured for the correct Firebase project.`);
    if (errorCode === 'auth/argument-error') {
      console.error(`* 'auth/argument-error' almost always means the server environment (where this code runs) is`);
      console.error(`* configured for a different Firebase project than the client application (what the user sees).`);
      console.error(`* Please verify that the Google Cloud project ID of your environment matches the`);
      console.error(`* 'NEXT_PUBLIC_FIREBASE_PROJECT_ID' in your .env file.`);
    }
    console.error(`************************************************************************************************`);
    return null;
  }
}
