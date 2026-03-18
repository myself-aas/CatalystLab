import { NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";
import { checkAndDecrementTokens } from '@/lib/tokens';

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });

export async function POST(req: Request) {
  const { draft, userId } = await req.json();

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
    const prompt = `Improve this research post draft. Return ONLY JSON:
    {
      "enhancedText": "improved version (keep under 500 chars)",
      "suggestedTags": ["3-5 relevant hashtags"],
      "suggestedPaperQuery": "search query to find a relevant paper",
      "improvements": ["what was changed and why"]
    }
    
    Draft:
    ${draft}
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
    console.error('Enhancement error:', error);
    return NextResponse.json({ error: 'Enhancement failed' }, { status: 500 });
  }
}
