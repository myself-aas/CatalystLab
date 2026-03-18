import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type } from "@google/genai";

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    
    if (!text) {
      return NextResponse.json({ error: 'Text required' }, { status: 400 });
    }

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API key missing' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze this research text and return ONLY valid JSON:
      {
        "keywords": string[],        // 5-7 specific technical terms
        "searchQueries": string[],   // 3 varied academic search queries
        "topics": string[],          // 2-3 broad research domains
        "yearHint": string | null,   // year if mentioned
        "isAgriculture": boolean,    // relevant to agriculture/food?
        "isBiomedical": boolean      // relevant to biomedicine?
      }
      
      Text: "${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            searchQueries: { type: Type.ARRAY, items: { type: Type.STRING } },
            topics: { type: Type.ARRAY, items: { type: Type.STRING } },
            yearHint: { type: Type.STRING, nullable: true },
            isAgriculture: { type: Type.BOOLEAN },
            isBiomedical: { type: Type.BOOLEAN },
          },
          required: ["keywords", "searchQueries", "topics", "isAgriculture", "isBiomedical"]
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return NextResponse.json(result);
  } catch (error) {
    console.error('Concept extraction error:', error);
    return NextResponse.json({ error: 'Failed to extract concepts' }, { status: 500 });
  }
}
