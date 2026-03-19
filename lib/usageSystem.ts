import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export const USER_DAILY_LIMIT = 50;

export async function getUserUsage(userId: string) {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  
  if (!userDoc.exists()) {
    // Initialize user usage if it doesn't exist
    const initialUsage = { daily_requests: 0, last_reset: new Date() };
    await setDoc(userRef, initialUsage, { merge: true });
    return initialUsage;
  }
  
  return userDoc.data();
}
