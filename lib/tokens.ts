import { adminDb } from './firebase-admin';
import { PRICING_PLANS, SubscriptionTier } from './pricing';

export async function checkAndDecrementTokens(userId: string, cost: number = 1): Promise<boolean> {
  try {
    const docRef = adminDb.collection('profiles').doc(userId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) return false;
    const profile = docSnap.data();
    if (!profile) return false;

    // Check if tokens need reset (monthly)
    const now = new Date();
    const resetAt = profile.tokens_reset_at ? profile.tokens_reset_at.toDate() : new Date(0);
    
    if (now > resetAt) {
      const tier = (profile.subscription_tier as SubscriptionTier) || 'free';
      const newTokens = PRICING_PLANS[tier].tokensPerMonth;
      const nextReset = new Date();
      nextReset.setMonth(nextReset.getMonth() + 1);

      await docRef.update({
        tokens_remaining: newTokens,
        tokens_reset_at: adminDb.firestore.Timestamp.fromDate(nextReset)
      });
      
      return newTokens >= cost;
    }

    if (profile.tokens_remaining < cost) return false;

    // Decrement tokens
    await docRef.update({
      tokens_remaining: profile.tokens_remaining - cost
    });

    return true;
  } catch (error) {
    console.error('Error in checkAndDecrementTokens:', error);
    return false;
  }
}

export async function getTokensRemaining(userId: string): Promise<number> {
  try {
    const docRef = adminDb.collection('profiles').doc(userId);
    const docSnap = await docRef.get();
    
    if (!docSnap.exists) return 0;
    const data = docSnap.data();
    return data?.tokens_remaining || 0;
  } catch (error) {
    console.error('Error in getTokensRemaining:', error);
    return 0;
  }
}
