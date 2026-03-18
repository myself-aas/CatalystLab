import { NextResponse } from 'next/server';
import { checkAndDecrementTokens } from '@/lib/tokens';

export async function POST(req: Request) {
  const { userId } = await req.json();

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
    // Fetch trending topics and papers
    // Placeholder for actual trending fetch
    const trending = {
      topics: ['LLMs', 'Climate Change', 'Quantum Computing'],
      papers: [
        { id: 't1', title: 'Trending Paper 1', year: 2024, authors: ['Author Z'] }
      ]
    };

    return NextResponse.json(trending);
  } catch (error) {
    console.error('Trending fetch error:', error);
    return NextResponse.json({ error: 'Trending fetch failed' }, { status: 500 });
  }
}
