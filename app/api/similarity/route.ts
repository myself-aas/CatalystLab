import { NextResponse } from 'next/server';
import { checkAndDecrementTokens } from '@/lib/tokens';

const HF_API = "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2"

async function getEmbedding(text: string): Promise<number[]> {
  const response = await fetch(HF_API, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}` },
    body: JSON.stringify({ inputs: text, options: { wait_for_model: true } })
  });
  const data = await response.json();
  return data[0]; // 384-dim vector
}

function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
  const magB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
  return dot / (magA * magB);
}

export async function POST(req: Request) {
  const { ideaText, compareWith, userId } = await req.json();

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
    const ideaEmbedding = await getEmbedding(ideaText);
    const compareEmbeddings = await Promise.all(compareWith.map((text: string) => getEmbedding(text)));
    const scores = compareEmbeddings.map((emb: number[]) => cosineSimilarity(ideaEmbedding, emb));
    const maxSimilarity = Math.max(...scores);
    const noveltyScore = 1 - maxSimilarity;

    return NextResponse.json({ scores, maxSimilarity, noveltyScore });
  } catch (error) {
    console.error('Similarity error:', error);
    return NextResponse.json({ error: 'Similarity failed' }, { status: 500 });
  }
}
