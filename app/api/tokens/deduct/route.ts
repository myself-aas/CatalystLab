import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { TOKEN_CONFIG, GEMINI_FREE_TIER_LIMITS } from '@/lib/tokens-config';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const { tokensUsed } = await req.json();
    if (typeof tokensUsed !== 'number' || tokensUsed < 0) {
      return NextResponse.json({ error: 'Invalid tokensUsed' }, { status: 400 });
    }

    const userRef = adminDb.collection('users').doc(uid);
    const statsRef = adminDb.collection('system').doc('stats');

    const result = await adminDb.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      const statsDoc = await transaction.get(statsRef);

      if (!userDoc.exists) {
        throw new Error('User profile not found');
      }

      const userData = userDoc.data()!;
      const statsData = statsDoc.exists ? statsDoc.data()! : { daily_requests: 0, daily_tokens: 0, last_reset: new Date().toISOString() };

      const now = new Date();
      const lastReset = new Date(userData.tokens_reset_at || 0);
      const statsLastReset = new Date(statsData.last_reset || 0);

      let tokensRemaining = userData.tokens_remaining ?? TOKEN_CONFIG.dailyLimit;
      let tokensTotal = userData.tokens_total ?? TOKEN_CONFIG.dailyLimit;

      // Reset user tokens if daily
      if (now.toDateString() !== lastReset.toDateString()) {
        tokensRemaining = TOKEN_CONFIG.dailyLimit;
        tokensTotal = TOKEN_CONFIG.dailyLimit;
        transaction.update(userRef, {
          tokens_remaining: tokensRemaining - tokensUsed,
          tokens_total: tokensTotal,
          tokens_reset_at: now.toISOString()
        });
      } else {
        if (tokensRemaining < tokensUsed) {
          throw new Error('Insufficient tokens');
        }
        transaction.update(userRef, {
          tokens_remaining: tokensRemaining - tokensUsed
        });
      }

      // Update global stats
      let dailyRequests = statsData.daily_requests || 0;
      let dailyTokens = statsData.daily_tokens || 0;

      if (now.toDateString() !== statsLastReset.toDateString()) {
        dailyRequests = 1;
        dailyTokens = tokensUsed;
        transaction.set(statsRef, {
          daily_requests: dailyRequests,
          daily_tokens: dailyTokens,
          last_reset: now.toISOString()
        });
      } else {
        // Check global limits
        if (dailyRequests >= GEMINI_FREE_TIER_LIMITS.requestsPerDay) {
          throw new Error('Global daily request limit reached');
        }
        transaction.update(statsRef, {
          daily_requests: FieldValue.increment(1),
          daily_tokens: FieldValue.increment(tokensUsed)
        });
      }

      return { tokensRemaining: tokensRemaining - tokensUsed };
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Token deduction error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
