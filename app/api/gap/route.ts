import { NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";
import { checkAndDecrementTokens } from '@/lib/tokens';

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });

export async function POST(req: Request) {
  const { topic, recentPapers, userId } = await req.json();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check and decrement tokens
  const hasTokens = await checkAndDecrementTokens(userId, 2); // Gap detection is more complex
  if (!hasTokens) {
    return NextResponse.json({ 
      error: 'Insufficient tokens', 
      code: 'INSUFFICIENT_TOKENS' 
    }, { status: 402 });
  }

  try {
    const prompt = `Given recent papers in '${topic}', identify research gaps. Return ONLY JSON:
    {
      "gaps": [{
        "title": "string",
        "description": "string",
        "difficulty": "low"|"medium"|"high",
        "potentialImpact": "low"|"medium"|"high"
      }],
      "emergingDirections": ["string"],
      "suggestedMethods": ["string"]
    }
    
    Topic: ${topic}
    Papers:
    ${JSON.stringify(recentPapers.map((p: any) => ({ title: p.title, abstract: p.abstract })))}
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
    console.error('Gap detection error:', error);
    return NextResponse.json({ error: 'Gap detection failed' }, { status: 500 });
  }
}
