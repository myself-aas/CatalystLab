import { NextResponse } from 'next/server';
import { checkAndDecrementTokens } from '@/lib/tokens';

export async function POST(req: Request) {
  const { paperId, userId } = await req.json();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check and decrement tokens
  const hasTokens = await checkAndDecrementTokens(userId, 1);
  if (!hasTokens) {
    return NextResponse.json({ 
      error: 'Insufficient tokens', 
      code: 'INSUFFICIENT_TOKENS' 
    }, { status: 402 });
  }

  try {
    // Fetch citations from Semantic Scholar
    // Placeholder for actual citation fetch
    const citations = [
      { id: 'c1', title: 'Citing Paper 1', year: 2024, authors: ['Author X'] },
      { id: 'c2', title: 'Citing Paper 2', year: 2024, authors: ['Author Y'] }
    ];

    return NextResponse.json({ citations });
  } catch (error) {
    console.error('Citation fetch error:', error);
    return NextResponse.json({ error: 'Citation fetch failed' }, { status: 500 });
  }
}
