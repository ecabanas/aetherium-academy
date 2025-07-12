
'use server';

import { firestore } from '@/lib/firebase-admin';
import { getUserIdFromToken } from '@/lib/firebase-admin';

type Message = {
  role: "user" | "model";
  content: string;
};

export type SessionData = {
  id: string;
  topic: string;
  createdAt: string; // ISO string format
  messageCount: number;
  messages: Message[];
};

export async function saveSessionToDatabase(idToken: string, session: Omit<SessionData, 'id' | 'messageCount'> & { id?: string }): Promise<string> {
  const userId = await getUserIdFromToken(idToken);
  if (!userId) {
    console.warn("User is not authenticated or token verification failed. Skipping session save.");
    throw new Error("User not authenticated");
  }

  const sessionsCollectionRef = firestore.collection('users').doc(userId).collection('sessions');
  
  if (session.id) {
    // Update existing session
    const sessionRef = sessionsCollectionRef.doc(session.id);
    await sessionRef.update({
      messages: session.messages,
      createdAt: session.createdAt, // Update timestamp to reflect recent activity
    });
    return session.id;
  } else {
    // Create new session
    const newSessionRef = await sessionsCollectionRef.add({
      topic: session.topic,
      createdAt: session.createdAt,
      messages: session.messages,
    });
    return newSessionRef.id;
  }
}

export async function getSessionsFromDatabase(idToken: string): Promise<SessionData[]> {
  const userId = await getUserIdFromToken(idToken);
  if (!userId) {
    console.warn("User is not authenticated or token verification failed. Returning empty array.");
    return [];
  }

  const sessionsCollectionRef = firestore.collection('users').doc(userId).collection('sessions');
  // Order by most recent activity
  const snapshot = await sessionsCollectionRef.orderBy('createdAt', 'desc').get();

  if (snapshot.empty) {
    return [];
  }
  
  const sessions: SessionData[] = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    sessions.push({
      id: doc.id,
      topic: data.topic,
      createdAt: data.createdAt,
      messageCount: data.messages.length,
      messages: data.messages // Pass messages along for session resume
    });
  });

  return sessions;
}

export async function getSessionById(idToken: string, sessionId: string): Promise<SessionData | null> {
    const userId = await getUserIdFromToken(idToken);
    if (!userId) {
        console.warn("User is not authenticated or token verification failed.");
        return null;
    }

    const sessionDocRef = firestore.collection('users').doc(userId).collection('sessions').doc(sessionId);
    const doc = await sessionDocRef.get();

    if (!doc.exists) {
        return null;
    }

    const data = doc.data()!;
    return {
        id: doc.id,
        topic: data.topic,
        createdAt: data.createdAt,
        messages: data.messages,
        messageCount: data.messages.length,
    };
}
