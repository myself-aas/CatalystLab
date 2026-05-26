import { NextResponse } from 'next/server';
import { orchestrateSearchSources } from '../../../lib/searchService';
import { curateData } from '../../../lib/data-curator';

export const maxDuration = 300;

export async function POST(req: Request) {
  try {
    const { query, enabledSources, timeGate, timeGatingEnabled = false } = await req.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    const sources = Array.isArray(enabledSources) ? enabledSources : [];
    
    let customDate: Date | undefined = undefined;
    if (timeGate) {
      const parsed = new Date(timeGate);
      if (!isNaN(parsed.getTime())) {
        customDate = parsed;
      }
    }

    const results = await orchestrateSearchSources(query.trim(), sources, customDate, timeGatingEnabled || !!timeGate);
    
    // Curate data
    const curatedResults = curateData(results);
    
    // Calculate stats
    const stats: Record<string, number> = curatedResults.reduce((acc, item) => {
      const source = item.source || 'Unknown';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({ results: curatedResults, stats });
  } catch (err: any) {
    console.error('Search API Route error:', err);
    return NextResponse.json({ error: err.message || 'Error executing parallel search' }, { status: 500 });
  }
}
