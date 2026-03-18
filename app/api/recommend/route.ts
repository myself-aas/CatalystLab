import { NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";
import { checkAndDecrementTokens } from '@/lib/tokens';

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });

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
    // 1. Fetch user context (simplified)
    const prompt = `Based on a researcher's interests in AI and Machine Learning, generate 5 targeted academic search queries. Return ONLY JSON:
    {
      "queries": ["query 1", "query 2", "query 3", "query 4", "query 5"]
    }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const { queries } = JSON.parse(response.text || '{}');

    // 2. Placeholder for actual search fan-out
    const recommendations = [
      { id: 'rec1', title: 'Recommended Paper 1', authors: ['Expert A'], year: 2024, reason: 'Matches your interest in LLMs' },
      { id: 'rec2', title: 'Recommended Paper 2', authors: ['Expert B'], year: 2024, reason: 'Trending in your field' }
    ];

    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error('Recommendation error:', error);
    return NextResponse.json({ error: 'Recommendation failed' }, { status: 500 });
  }
}
