import { NextResponse } from 'next/server';
import { checkAndDecrementTokens } from '@/lib/tokens';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(req: Request) {
  const { userId } = await req.json();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check and decrement tokens
  const hasTokens = await checkAndDecrementTokens(userId, 5); // Matching is more expensive
  if (!hasTokens) {
    return NextResponse.json({ 
      error: 'Insufficient tokens', 
      code: 'INSUFFICIENT_TOKENS' 
    }, { status: 402 });
  }

  try {
    // 1. Fetch user profile
    const docRef = adminDb.collection('profiles').doc(userId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) throw new Error('Profile not found');
    const profile = docSnap.data();
    if (!profile) throw new Error('Profile data empty');

    // 2. Fetch other users
    const othersSnap = await adminDb.collection('profiles')
      .where('uid', '!=', userId)
      .limit(50)
      .get();

    const others = othersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // 3. Simple matching logic (for now)
    const matches = others.map((other: any) => {
      const sharedInterests = (profile.research_interests || []).filter((i: string) => 
        (other.research_interests || []).includes(i)
      );
      const sharedSkills = (profile.skills || []).filter((s: string) => 
        (other.skills || []).includes(s)
      );
      
      const matchScore = (sharedInterests.length * 2 + sharedSkills.length) / 10;
      
      return {
        userId: other.id,
        username: other.username,
        fullName: other.full_name,
        matchScore: Math.min(1, matchScore),
        sharedInterests
      };
    }).sort((a, b) => b.matchScore - a.matchScore).slice(0, 10);

    return NextResponse.json({ matches });
  } catch (error) {
    console.error('Matching error:', error);
    return NextResponse.json({ error: 'Matching failed' }, { status: 500 });
  }
}
