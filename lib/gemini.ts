import { GoogleGenAI, Type } from "@google/genai";
import { checkTokens, deductTokens, estimateTokens } from './tokens';

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

export const getAI = () => {
  if (!apiKey) {
    console.warn("NEXT_PUBLIC_GEMINI_API_KEY is not set.");
  }
  return new GoogleGenAI({ apiKey: apiKey || "" });
};

export const MODELS = {
  flash: "gemini-3-flash-preview",
  pro: "gemini-3.1-pro-preview",
};

export async function generateWithTokens(prompt: string, modelName: string = MODELS.flash, config: any = {}) {
  const { remaining } = await checkTokens();
  const estimated = estimateTokens(prompt);
  
  if (remaining < estimated) {
    throw new Error('Insufficient tokens for this request.');
  }

  const ai = getAI();
  const result = await ai.models.generateContent({
    model: modelName,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config
  });
  const text = result.text;
  
  if (!text) throw new Error('Empty response from AI');
  
  // Deduct actual tokens (rough estimate based on input + output)
  const actualUsed = estimateTokens(prompt + text);
  await deductTokens(actualUsed);
  
  return text;
}

export async function extractConcepts(text: string) {
  const prompt = `Analyze this research text and return ONLY valid JSON:
  {
    "keywords": string[],        // 5-7 specific technical terms
    "searchQueries": string[],   // 3 varied academic search queries
    "topics": string[],          // 2-3 broad research domains
    "yearHint": string | null,   // year if mentioned
    "isAgriculture": boolean,    // relevant to agriculture/food?
    "isBiomedical": boolean      // relevant to biomedicine?
  }
  
  Text: "${text}"`;

  const resultText = await generateWithTokens(prompt, MODELS.flash, {
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
  });

export async function synthesizePapers(papers: any[]) {
  const prompt = `You are a research synthesis expert. Given these paper abstracts, return ONLY JSON:
  {
    "synthesis": string,           // 150-word cross-paper synthesis
    "keyInsights": string[],       // 3 insights appearing across papers
    "researchGap": string,         // one key open problem
    "recommendedMethods": string[] // methods used across papers
  }
  
  Papers:
  ${papers.map((p: any) => `Title: ${p.title}\nAbstract: ${p.abstract}`).join('\n\n')}`;

  const resultText = await generateWithTokens(prompt, MODELS.flash, {
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
  });

export async function enhancePost(draft: string) {
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

  const resultText = await generateWithTokens(prompt, MODELS.flash, {
    responseMimeType: "application/json",
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        enhancedText: { type: Type.STRING },
        suggestedTags: { type: Type.ARRAY, items: { type: Type.STRING } },
        suggestedPaperQuery: { type: Type.STRING },
        improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ["enhancedText", "suggestedTags", "suggestedPaperQuery", "improvements"]
    }
  });

  return JSON.parse(resultText);
}

export async function analyzeResearchGap(topic: string, recentPapers: any[]) {
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

  const resultText = await generateWithTokens(prompt, MODELS.flash, {
    responseMimeType: "application/json",
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        gaps: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              difficulty: { type: Type.STRING, enum: ["low", "medium", "high"] },
              potentialImpact: { type: Type.STRING, enum: ["low", "medium", "high"] },
            },
            required: ["title", "description", "difficulty", "potentialImpact"]
          }
        },
        emergingDirections: { type: Type.ARRAY, items: { type: Type.STRING } },
        suggestedMethods: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ["gaps", "emergingDirections", "suggestedMethods"]
    }
  });

  return JSON.parse(resultText);
}

export async function generateTLDR(abstract: string) {
  const prompt = `In exactly one sentence of max 25 words, what did this paper find? Return ONLY the sentence.
  
  Abstract:
  ${abstract}`;

  const resultText = await generateWithTokens(prompt, MODELS.flash);
  return { tldr: resultText };
}

export async function assessCredibility(paper: any) {
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
  ${JSON.stringify(paper)}
  `;

  const resultText = await generateWithTokens(prompt, MODELS.flash, {
    responseMimeType: "application/json",
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        score: { type: Type.NUMBER },
        hasCitations: { type: Type.BOOLEAN },
        hasDOI: { type: Type.BOOLEAN },
        isPeerReviewed: { type: Type.BOOLEAN },
        sourceQuality: { type: Type.STRING, enum: ["high", "medium", "low", "unknown"] },
        flags: { type: Type.ARRAY, items: { type: Type.STRING } },
        summary: { type: Type.STRING },
      },
      required: ["score", "hasCitations", "hasDOI", "isPeerReviewed", "sourceQuality", "flags", "summary"]
    }
  });

  return JSON.parse(resultText);
}
