import * as admin from 'firebase-admin';
import { applicationDefault } from 'firebase-admin/app';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: applicationDefault(),
  });
}

export const firestore = admin.firestore();
export const auth = admin.auth();
