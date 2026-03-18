import { NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";
import { checkAndDecrementTokens } from '@/lib/tokens';

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });

export async function POST(req: Request) {
  const { post, paper, userId } = await req.json();

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
    const prompt = `Assess the credibility of this research content. Return ONLY JSON:
    {
      "score": 0.0 to 1.0,
      "hasCitations": boolean,
      "hasDOI": boolean,
      "isPeerReviewed": boolean,
      "sourceQuality": "high"|"medium"|"low"|"unknown",
      "flags": ["any credibility concerns"],
      "summary": "one-sentence credibility summary"
    }
    
    Content:
    ${JSON.stringify(post || paper)}
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
    console.error('Credibility error:', error);
    return NextResponse.json({ error: 'Credibility failed' }, { status: 500 });
  }
}
