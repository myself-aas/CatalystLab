import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';
import { orchestrateSearchSources } from '../../../lib/searchService';
import { runInstrument } from '../../../lib/instrumentFactory';

export const maxDuration = 300;

export async function POST(req: Request) {
  try {
    const { input, slug, modelSettings, timeGate } = await req.json();

    const engine = modelSettings?.engine || 'auto';

    let ai: GoogleGenAI | null = null;
    if (process.env.GEMINI_API_KEY) {
        ai = new GoogleGenAI({ 
          apiKey: process.env.GEMINI_API_KEY,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });
    }

    // Step 1: Generate search query from input
    let searchQuery = input
      .split(/\s+/)
      .filter((w: string) => w.length > 2 && !['and', 'the', 'for', 'with', 'from', 'into', 'under'].includes(w.toLowerCase()))
      .slice(0, 5)
      .join(' ')
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .trim();
    
    if (!searchQuery) {
      searchQuery = input.substring(0, 50).replace(/[^a-zA-Z0-9\s]/g, '').trim();
    }

    searchQuery = searchQuery.replace(/^["']|["']$/g, '');

    // Step 2: Fetch actual papers from multiple sources using our modular multi-agent worker orchestrator.
    // We target a refined, premium selection of core scholarly sources for synthesis to minimize
    // latency (averting client fetch errors/timeouts) while maximizing high-relevance output.
    const defaultSources = ['OpenAlex', 'arXiv', 'Semantic Scholar', 'PubMed', 'Crossref'];
    if (process.env.TAVILY_API_KEY) {
      defaultSources.push('Tavily');
    }

    let customDate: Date | undefined = undefined;
    if (timeGate) {
      const parsed = new Date(timeGate);
      if (!isNaN(parsed.getTime())) {
        customDate = parsed;
      }
    }

    const papers = await orchestrateSearchSources(searchQuery, defaultSources, customDate, true);

    // Step 3: Run the specified Cognitive Instrument through our factory pattern
    const instrumentResult = await runInstrument(slug, papers, input, {
      engine
    });

    return NextResponse.json({
      papers: instrumentResult.papers.slice(0, 30),
      tldr: instrumentResult.tldr,
      noveltyScore: instrumentResult.noveltyScore,
      synthesis: instrumentResult.synthesis,
      speciality: instrumentResult.speciality,
      searchQuery,
      engineUsed: engine,
      actualModel: instrumentResult.actualModel
    });

  } catch (err: any) {
    console.error('Synthesis API error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
