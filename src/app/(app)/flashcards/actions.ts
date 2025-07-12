
'use server';

import { firestore } from '@/lib/firebase-admin';
import { getUserIdFromToken } from '@/lib/firebase-admin';
import type { GenerateFlashcardsOutput } from '@/ai/flows/generate-flashcards';

type AllFlashcards = {
  [topic: string]: GenerateFlashcardsOutput;
};

// This is the initial data we can use as a fallback for new users.
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

export async function saveFlashcardsToDatabase(idToken: string, topic: string, newFlashcards: GenerateFlashcardsOutput): Promise<number> {
  if (!newFlashcards || newFlashcards.length === 0) {
    return 0;
  }
  
  const userId = await getUserIdFromToken(idToken);
  // If authentication fails, we cannot save. Log a warning and return 0.
  if (!userId) {
    console.warn("User is not authenticated or token verification failed. Skipping flashcard save.");
    return 0;
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

  // If authentication fails, fall back to sample data to avoid crashing.
  if (!userId) {
    console.warn("User is not authenticated or token verification failed. Returning sample flashcards.");
    return sampleFlashcards;
  }

  const userDocRef = firestore.collection('users').doc(userId);
  const flashcardsCollectionRef = userDocRef.collection('flashcards');
  const snapshot = await flashcardsCollectionRef.get();

  if (snapshot.empty) {
    // This is a new user, let's seed their account with initial data.
    // Use the idToken directly, as we know it's valid if we got this far
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
