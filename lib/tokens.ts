import { auth, db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { TOKEN_CONFIG } from './tokens-config';

export async function checkTokens(): Promise<{ remaining: number; total: number; resetAt: string }> {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const userRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userRef);
  if (!userDoc.exists()) throw new Error('User profile not found');

  const userData = userDoc.data();
  const now = new Date();
  const lastReset = new Date(userData.tokens_reset_at || 0);

  if (now.toDateString() !== lastReset.toDateString()) {
    // Reset tokens locally for UX
    return {
      remaining: TOKEN_CONFIG.dailyLimit,
      total: TOKEN_CONFIG.dailyLimit,
      resetAt: now.toISOString()
    };
  }

  return {
    remaining: userData.tokens_remaining ?? TOKEN_CONFIG.dailyLimit,
    total: userData.tokens_total ?? TOKEN_CONFIG.dailyLimit,
    resetAt: userData.tokens_reset_at || now.toISOString()
  };
}

export async function deductTokens(tokensUsed: number) {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const idToken = await user.getIdToken();

  const response = await fetch('/api/tokens/deduct', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
    body: JSON.stringify({ tokensUsed })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to deduct tokens');
  }

  return await response.json();
}

export function estimateTokens(text: string): number {
  // Rough estimate: 4 characters per token
  return Math.ceil(text.length / 4);
}

export function getTimeUntilReset(): string {
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  const diff = midnight.getTime() - now.getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return `${h}h ${m}m ${s}s`;
}

export async function decrementTokensInternal(userId: string, tokensUsed: number): Promise<void> {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  if (!userDoc.exists()) throw new Error('User not found');
  
  const userData = userDoc.data();
  const currentTokens = userData.tokens_remaining ?? TOKEN_CONFIG.dailyLimit;
  const newTokens = Math.max(0, currentTokens - tokensUsed);
  
  await setDoc(userRef, {
    tokens_remaining: newTokens,
    tokens_last_used: new Date().toISOString()
  }, { merge: true });
}

export async function checkAndDecrementTokens(userId: string, tokensRequested: number): Promise<boolean> {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) return false;
    
    const userData = userDoc.data();
    const remaining = userData.tokens_remaining ?? TOKEN_CONFIG.dailyLimit;
    
    if (remaining < tokensRequested) return false;
    
    await decrementTokensInternal(userId, tokensRequested);
    return true;
  } catch (error) {
    console.error('Error in checkAndDecrementTokens:', error);
    return false;
  }
}
