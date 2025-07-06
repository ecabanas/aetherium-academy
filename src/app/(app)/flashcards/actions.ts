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

const sampleFlashcards: AllFlashcards = {
  "Machine Learning": initialMlFlashcards,
  "Quantum Computing": [],
  "Other": [],
};

async function getUserIdFromToken(idToken: string): Promise<string | null> {
  if (!idToken || typeof idToken !== 'string' || idToken.trim() === '') {
    console.error("Attempted to verify an invalid ID token. It was either empty or not a string.");
    return null;
  }
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    return decodedToken.uid;
  } catch (error: any) {
    const errorCode = error.code || 'UNKNOWN';
    console.error(`************************************************************************************************
* Firebase Admin SDK Error (code: ${errorCode})
* Message: ${error.message}
* 
* This error occurred while trying to verify a user's login session on the server.
* The most common cause for 'auth/argument-error' is a project configuration mismatch:
*   1. The frontend (browser) is configured for one Firebase project in your .env file.
*   2. The backend (this server environment) is configured for a DIFFERENT Firebase project.
*
* Please ensure your environment's Google Cloud Project ID is the same as the
* NEXT_PUBLIC_FIREBASE_PROJECT_ID in your .env file.
*
* The app will now fall back to using sample data or prevent write operations.
************************************************************************************************`);
    return null;
  }
}

export async function saveFlashcardsToDatabase(idToken: string, topic: string, newFlashcards: GenerateFlashcardsOutput): Promise<number> {
  if (!newFlashcards || newFlashcards.length === 0) {
    return 0;
  }
  
  const userId = await getUserIdFromToken(idToken);
  if (!userId) {
    // Throw an error to give the user clear feedback on the client side.
    throw new Error("Authentication failed. Cannot save flashcards. Please verify your environment configuration.");
  }
  
  const userDocRef = firestore.collection('users').doc(userId);
  const flashcardsCollectionRef = userDocRef.collection('flashcards');
  const topicDocRef = flashcardsCollectionRef.doc(topic);

  let uniqueNewCardsCount = 0;

  await firestore.runTransaction(async (transaction) => {
    const topicDoc = await transaction.get(topicDocRef);
    if (!topicDoc.exists) {
      transaction.set(topicDocRef, { cards: newFlashcards });
      uniqueNewCardsCount = newFlashcards.length;
    } else {
      const existingData = topicDoc.data();
      const existingCards: GenerateFlashcardsOutput = existingData?.cards || [];
      const existingQuestions = new Set(existingCards.map(fc => fc.question));
      
      const uniqueNewCards = newFlashcards.filter(fc => !existingQuestions.has(fc.question));
      uniqueNewCardsCount = uniqueNewCards.length;
      
      if (uniqueNewCards.length > 0) {
        const updatedCards = [...existingCards, ...uniqueNewCards];
        transaction.update(topicDocRef, { cards: updatedCards });
      }
    }
  });
  return uniqueNewCardsCount;
}

export async function getFlashcardsFromDatabase(idToken: string): Promise<AllFlashcards> {
  const userId = await getUserIdFromToken(idToken);

  if (!userId) {
    console.warn("User is not authenticated, falling back to sample flashcard data.");
    return sampleFlashcards;
  }

  const userDocRef = firestore.collection('users').doc(userId);
  const flashcardsCollectionRef = userDocRef.collection('flashcards');
  const snapshot = await flashcardsCollectionRef.get();

  if (snapshot.empty) {
    // This is a new user, let's seed their account with initial data.
    await saveFlashcardsToDatabase(idToken, "Machine Learning", initialMlFlashcards);
    return sampleFlashcards;
  }

  const allFlashcards: AllFlashcards = {};
  snapshot.forEach(doc => {
    allFlashcards[doc.id] = doc.data().cards;
  });

  // Ensure default topics exist even if they are empty in the DB
  if (!allFlashcards["Machine Learning"]) allFlashcards["Machine Learning"] = [];
  if (!allFlashcards["Quantum Computing"]) allFlashcards["Quantum Computing"] = [];
  if (!allFlashcards["Other"]) allFlashcards["Other"] = [];

  return allFlashcards;
}
