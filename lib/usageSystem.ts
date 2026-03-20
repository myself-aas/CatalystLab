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

export async function checkLimits(userId: string): Promise<{ canRun: boolean; reason?: string }> {
  try {
    const usage: any = await getUserUsage(userId);
    const now = new Date();
    const lastReset = usage.last_reset?.toDate ? usage.last_reset.toDate() : new Date(usage.last_reset || 0);
    
    // Reset if it's a new day
    if (now.toDateString() !== lastReset.toDateString()) {
      return { canRun: true };
    }
    
    if ((usage.daily_requests || 0) >= USER_DAILY_LIMIT) {
      return { 
        canRun: false, 
        reason: `Daily limit of ${USER_DAILY_LIMIT} runs reached. Resets at midnight.` 
      };
    }
    
    return { canRun: true };
  } catch (error) {
    console.error('Error checking limits:', error);
    return { canRun: true }; // Default to allow on error
  }
}

export async function incrementUsage(userId: string): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    const usage: any = await getUserUsage(userId);
    const now = new Date();
    const lastReset = usage.last_reset?.toDate ? usage.last_reset.toDate() : new Date(usage.last_reset || 0);
    
    let newRequests = (usage.daily_requests || 0) + 1;
    let resetDate = lastReset;
    
    if (now.toDateString() !== lastReset.toDateString()) {
      newRequests = 1;
      resetDate = now;
    }
    
    await setDoc(userRef, {
      daily_requests: newRequests,
      last_reset: resetDate
    }, { merge: true });
  } catch (error) {
    console.error('Error incrementing usage:', error);
  }
}
