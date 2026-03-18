import { NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";
import { checkAndDecrementTokens } from '@/lib/tokens';

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });

export async function POST(req: Request) {
  const { thread, userId } = await req.json();

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
    const prompt = `Assess the scientific discussion quality of this thread. Return ONLY JSON:
    {
      "overallScore": 0.0 to 1.0,
      "evidenceUsage": 0.0 to 1.0,
      "argumentCoherence": 0.0 to 1.0,
      "diversityOfViews": 0.0 to 1.0,
      "keyPoints": ["string"],
      "consensus": "string | null",
      "openProblems": ["string"]
    }
    
    Thread:
    ${JSON.stringify(thread.map((p: any) => ({ content: p.content })))}
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
    console.error('Quality assessment error:', error);
    return NextResponse.json({ error: 'Quality assessment failed' }, { status: 500 });
  }
}
