import { NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";
import { checkAndDecrementTokens } from '@/lib/tokens';

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });

export async function POST(req: Request) {
  const { posts, userId } = await req.json();

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
    const prompt = `Summarize this academic discussion thread. Return ONLY JSON:
    {
      "summary": "100-word synthesis",
      "keyPoints": ["string"],
      "consensus": "string | null",
      "openProblems": ["string"],
      "participants": number,
      "qualityScore": number
    }
    
    Thread:
    ${JSON.stringify(posts.map((p: any) => ({ content: p.content })))}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    return NextResponse.json(JSON.parse(response.text || '{}'));
  } catch (error) {
    console.error('Discussion summary error:', error);
    return NextResponse.json({ error: 'Discussion summary failed' }, { status: 500 });
  }
}
