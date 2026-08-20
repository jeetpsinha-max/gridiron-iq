// ============================================================================
// Peddie Football Analytics — Natural Language Film Filter API Route
// Powered by Gemini Flash Worker Sub-Agent for Instant Film Search
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { geminiWorkers } from '@/lib/agents/gemini-workers';
import { getSeasonPlays } from '@/lib/seasons-data';
import { SeasonId } from '@/types/football';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, season = '2025-2026' } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query text is required' }, { status: 400 });
    }

    // 1. Convert natural language into structured JSON filter schema
    const parsedFilter = geminiWorkers.parseNaturalLanguageQuery(query);

    // 2. Fetch plays and apply filter
    const allPlays = getSeasonPlays(season as SeasonId);
    const matchingPlays = geminiWorkers.filterPlays(allPlays as any, parsedFilter);

    return NextResponse.json({
      success: true,
      query,
      filter: parsedFilter,
      totalMatched: matchingPlays.length,
      totalPool: allPlays.length,
      plays: matchingPlays,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to process natural language film query' },
      { status: 500 }
    );
  }
}
