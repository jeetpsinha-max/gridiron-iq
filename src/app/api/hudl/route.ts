// ============================================================================
// Peddie Football Analytics — Hudl CSV Bi-Directional API Route
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { hudlCsvEngine } from '@/lib/hudl-csv-engine';
import { getSeasonPlays } from '@/lib/seasons-data';
import { SeasonId } from '@/types/football';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('text/csv') || contentType.includes('application/octet-stream')) {
      const csvText = await request.text();
      const parsedPlays = hudlCsvEngine.parseHudlCsv(csvText);

      return NextResponse.json({
        success: true,
        action: 'import',
        totalParsed: parsedPlays.length,
        plays: parsedPlays,
      });
    }

    const body = await request.json();
    const { action, csvText, season = '2025-2026', plays } = body;

    if (action === 'export') {
      const exportPlays = plays || getSeasonPlays(season as SeasonId);
      const csvOutput = hudlCsvEngine.exportEnrichedHudlCsv(exportPlays);

      return new NextResponse(csvOutput, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename=peddie_hudl_enriched_${season}.csv`,
        },
      });
    }

    if (csvText) {
      const parsedPlays = hudlCsvEngine.parseHudlCsv(csvText);
      return NextResponse.json({
        success: true,
        action: 'import',
        totalParsed: parsedPlays.length,
        plays: parsedPlays,
      });
    }

    return NextResponse.json({ error: 'Invalid Hudl request payload' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Hudl CSV processing failed' },
      { status: 500 }
    );
  }
}
