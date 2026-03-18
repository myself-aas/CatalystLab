import { NextResponse } from 'next/server';
import { checkAndDecrementTokens } from '@/lib/tokens';

export async function POST(req: Request) {
  const { query, userId } = await req.json();

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
    // Perform academic search (Semantic Scholar, OpenAlex, etc.)
    // This is where the fan-out search logic goes
    // For now, returning a placeholder response
    const results = [
      { id: '1', title: 'Sample Paper 1', authors: ['Author A'], year: 2023, abstract: 'Abstract 1' },
      { id: '2', title: 'Sample Paper 2', authors: ['Author B'], year: 2022, abstract: 'Abstract 2' }
    ];

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
