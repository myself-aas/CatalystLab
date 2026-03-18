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
    // Fan out to: Kaggle + Zenodo + Harvard Dataverse + OpenML
    // Placeholder for actual dataset search
    const datasets = [
      { name: 'Kaggle Dataset 1', source: 'Kaggle', url: 'https://kaggle.com/1', format: 'CSV', size: '10MB' },
      { name: 'Zenodo Record 1', source: 'Zenodo', url: 'https://zenodo.org/1', format: 'JSON', size: '5MB' }
    ];

    return NextResponse.json({ datasets });
  } catch (error) {
    console.error('Dataset search error:', error);
    return NextResponse.json({ error: 'Dataset search failed' }, { status: 500 });
  }
}
