import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { verifyAndDeductTokens } from '@/lib/tokens-server';
import { TOKEN_COSTS } from '@/lib/tokens-config';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  const { draft } = await req.json();

  // Enforce tokens
  const tokenResult = await verifyAndDeductTokens(req, TOKEN_COSTS.AI_ENHANCE);
  if ('error' in tokenResult) {
    return NextResponse.json({ 
      error: tokenResult.error, 
      code: tokenResult.status === 402 ? 'INSUFFICIENT_TOKENS' : 'AUTH_ERROR' 
    }, { status: tokenResult.status });
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

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json(JSON.parse(text || '{}'));
  } catch (error) {
    console.error('Enhancement error:', error);
    return NextResponse.json({ error: 'Enhancement failed' }, { status: 500 });
  }
}
