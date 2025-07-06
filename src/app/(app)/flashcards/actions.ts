'use server';

import { firestore } from '@/lib/firebase-admin';
import type { GenerateFlashcardsOutput } from '@/ai/flows/generate-flashcards';

// NOTE: In a real app, this would come from an authentication session.
const MOCK_USER_ID = 'test-user';

type AllFlashcards = {
  [topic: string]: GenerateFlashcardsOutput;
};

export async function saveFlashcardsToDatabase(topic: string, newFlashcards: GenerateFlashcardsOutput) {
  if (!newFlashcards || newFlashcards.length === 0) {
    return;
  }

  const userDocRef = firestore.collection('users').doc(MOCK_USER_ID);
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

export async function getFlashcardsFromDatabase(): Promise<AllFlashcards> {
  const userDocRef = firestore.collection('users').doc(MOCK_USER_ID);
  const flashcardsCollectionRef = userDocRef.collection('flashcards');
  const snapshot = await flashcardsCollectionRef.get();

  if (snapshot.empty) {
    // Seeding initial data for a better first-time experience
    const initialMlFlashcards = [
      { question: "What is Linear Regression?", answer: "A supervised learning algorithm used for predicting a continuous dependent variable based on one or more independent variables." },
      { question: "What is a Decision Tree?", answer: "A supervised learning algorithm that is used for both classification and regression tasks. It has a tree-like structure." },
      { question: "Define 'Overfitting' in Machine Learning.", answer: "A modeling error that occurs when a function is too closely fit to a limited set of data points. It may therefore fail to predict future observations reliably." }
    ];
    const initialQcFlashcards = [
      { question: "What is a Qubit?", answer: "The basic unit of quantum information, the quantum analogue of the classical bit. It can exist in a superposition of states." },
      { question: "What is Superposition?", answer: "A fundamental principle of quantum mechanics where a quantum system can exist in multiple states at the same time until it is measured." },
      { question: "What is Quantum Entanglement?", answer: "A physical phenomenon that occurs when a pair or group of particles is generated in such a way that the quantum state of each particle of the pair/group cannot be described independently of the state of the others." }
    ];
    await saveFlashcardsToDatabase("Machine Learning", initialMlFlashcards);
    await saveFlashcardsToDatabase("Quantum Computing", initialQcFlashcards);

    return {
        "Machine Learning": initialMlFlashcards,
        "Quantum Computing": initialQcFlashcards,
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
