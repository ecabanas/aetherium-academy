import { initializeApp, getApps, getApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

const app = getApps().length
  ? getApp()
  : initializeApp({
      credential: applicationDefault(),
    });

export const firestore = getFirestore(app);
export const auth = getAuth(app);
