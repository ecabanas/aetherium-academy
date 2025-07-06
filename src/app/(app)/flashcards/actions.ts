'use server';

import { firestore, auth as adminAuth } from '@/lib/firebase-admin';
import type { GenerateFlashcardsOutput } from '@/ai/flows/generate-flashcards';

type AllFlashcards = {
  [topic: string]: GenerateFlashcardsOutput;
};

// This is the initial data we can use as a fallback.
const initialMlFlashcards = [
  { question: "What is Linear Regression?", answer: "A supervised learning algorithm used for predicting a continuous dependent variable based on one or more independent variables." },
  { question: "What is a Decision Tree?", answer: "A supervised learning algorithm that is used for both classification and regression tasks. It has a tree-like structure." },
  { question: "Define 'Overfitting' in Machine Learning.", answer: "A modeling error that occurs when a function is too closely fit to a limited set of data points. It may therefore fail to predict future observations reliably." }
];

async function getUserIdFromToken(idToken: string): Promise<string> {
  // Added more robust validation and logging
  if (!idToken || typeof idToken !== 'string' || idToken.trim() === '') {
    console.error("getUserIdFromToken received an invalid ID token. This is often due to a misconfiguration or the user's session expiring.", { receivedToken: idToken });
    throw new Error("Unauthorized. A valid ID token was not provided.");
  }
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    return decodedToken.uid;
  } catch (error: any) {
    const errorCode = error.code || 'UNKNOWN';
    console.error(`Error verifying ID token (code: ${errorCode}):`, error.message);
    // This part is key: a common reason for auth/argument-error is a project mismatch.
    if (errorCode === 'auth/argument-error') {
       console.error("Firebase Auth Error Hint: 'auth/argument-error' can occur if the server's Firebase Admin SDK is configured for a different project than the client application, or if the server environment is not authenticated correctly.");
    }
    throw new Error(`Unauthorized. Token verification failed with code: ${errorCode}`);
  }
}

export async function saveFlashcardsToDatabase(idToken: string, topic: string, newFlashcards: GenerateFlashcardsOutput) {
  if (!newFlashcards || newFlashcards.length === 0) {
    return;
  }
  const userId = await getUserIdFromToken(idToken);
  const userDocRef = firestore.collection('users').doc(userId);
  const flashcardsCollectionRef = userDocRef.collection('flashcards');
  const topicDocRef = flashcardsCollectionRef.doc(topic);

  await firestore.runTransaction(async (transaction) => {
    const topicDoc = await transaction.get(topicDocRef);
    if (!topicDoc.exists) {
      transaction.set(topicDocRef, { cards: newFlashcards });
    } else {
      const existingData = topicDoc.data();
      const existingCards: GenerateFlashcardsOutput = existingData?.cards || [];
      const existingQuestions = new Set(existingCards.map(fc => fc.question));
      
      const uniqueNewCards = newFlashcards.filter(fc => !existingQuestions.has(fc.question));
      
      if (uniqueNewCards.length > 0) {
        const updatedCards = [...existingCards, ...uniqueNewCards];
        transaction.update(topicDocRef, { cards: updatedCards });
      }
    }
  });
}

export async function getFlashcardsFromDatabase(idToken: string): Promise<AllFlashcards> {
  let userId;
  try {
    userId = await getUserIdFromToken(idToken);
  } catch (error: any) {
    // If token verification fails, it's likely an environment configuration issue.
    // We will log a detailed error and return initial data to unblock the UI.
    console.error("CRITICAL: Failed to verify user token in getFlashcardsFromDatabase.", error.message);
    console.error("This is likely due to a Firebase project configuration mismatch between your frontend (.env) and your backend environment. Please verify they are pointing to the SAME project.");
    
    // Return initial seed data so the page can still render.
    return {
        "Machine Learning": initialMlFlashcards,
        "Quantum Computing": [],
        "Other": [],
    };
  }
  
  const userDocRef = firestore.collection('users').doc(userId);
  const flashcardsCollectionRef = userDocRef.collection('flashcards');
  const snapshot = await flashcardsCollectionRef.get();

  if (snapshot.empty) {
    // Seeding initial data for a better first-time experience
    await saveFlashcardsToDatabase(idToken, "Machine Learning", initialMlFlashcards);

    return {
        "Machine Learning": initialMlFlashcards,
        "Quantum Computing": [],
        "Other": [],
    }
  }

  const allFlashcards: AllFlashcards = {};
  snapshot.forEach(doc => {
    allFlashcards[doc.id] = doc.data().cards;
  });

  // Ensure default topics exist
  if (!allFlashcards["Machine Learning"]) allFlashcards["Machine Learning"] = [];
  if (!allFlashcards["Quantum Computing"]) allFlashcards["Quantum Computing"] = [];
  if (!allFlashcards["Other"]) allFlashcards["Other"] = [];

  return allFlashcards;
}
