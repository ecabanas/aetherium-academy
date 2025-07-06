'use server';

import { firestore, auth as adminAuth } from '@/lib/firebase-admin';
import type { GenerateFlashcardsOutput } from '@/ai/flows/generate-flashcards';

type AllFlashcards = {
  [topic: string]: GenerateFlashcardsOutput;
};

async function getUserIdFromToken(idToken: string): Promise<string> {
  if (!idToken) {
    throw new Error("ID token must be provided.");
  }
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    return decodedToken.uid;
  } catch (error) {
    console.error("Error verifying ID token:", error);
    throw new Error("Unauthorized request.");
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
  const userId = await getUserIdFromToken(idToken);
  const userDocRef = firestore.collection('users').doc(userId);
  const flashcardsCollectionRef = userDocRef.collection('flashcards');
  const snapshot = await flashcardsCollectionRef.get();

  if (snapshot.empty) {
    // Seeding initial data for a better first-time experience
    const initialMlFlashcards = [
      { question: "What is Linear Regression?", answer: "A supervised learning algorithm used for predicting a continuous dependent variable based on one or more independent variables." },
      { question: "What is a Decision Tree?", answer: "A supervised learning algorithm that is used for both classification and regression tasks. It has a tree-like structure." },
      { question: "Define 'Overfitting' in Machine Learning.", answer: "A modeling error that occurs when a function is too closely fit to a limited set of data points. It may therefore fail to predict future observations reliably." }
    ];
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
