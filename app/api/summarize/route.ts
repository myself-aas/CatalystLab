import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type } from "@google/genai";

export async function POST(req: NextRequest) {
  try {
    const { papers } = await req.json();
    
    if (!papers || papers.length === 0) {
      return NextResponse.json({ error: 'Papers required' }, { status: 400 });
    }

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API key missing' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a research synthesis expert. Given these paper abstracts, return ONLY JSON:
      {
        "synthesis": string,           // 150-word cross-paper synthesis
        "keyInsights": string[],       // 3 insights appearing across papers
        "researchGap": string,         // one key open problem
        "recommendedMethods": string[] // methods used across papers
      }
      
      Papers:
      ${papers.map((p: any) => `Title: ${p.title}\nAbstract: ${p.abstract}`).join('\n\n')}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            synthesis: { type: Type.STRING },
            keyInsights: { type: Type.ARRAY, items: { type: Type.STRING } },
            researchGap: { type: Type.STRING },
            recommendedMethods: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["synthesis", "keyInsights", "researchGap", "recommendedMethods"]
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return NextResponse.json(result);
  } catch (error) {
    console.error('Synthesis error:', error);
    return NextResponse.json({ error: 'Failed to synthesize papers' }, { status: 500 });
  }
}
