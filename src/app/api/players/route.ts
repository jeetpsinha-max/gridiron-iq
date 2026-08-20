// ============================================================================
// Peddie Football Analytics — Multi-Season Player Tracker API
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getSeasonRoster, getSeasonPlayerById, getSeasonMetadata } from '@/lib/seasons-data';
import { SeasonId } from '@/types/football';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const season = (searchParams.get('season') || '2025-2026') as SeasonId;
  const id = searchParams.get('id');
  const classYear = searchParams.get('class');
  const pos = searchParams.get('position');
  const q = searchParams.get('q')?.toLowerCase();

  const seasonMeta = getSeasonMetadata(season);

  if (id) {
    const player = getSeasonPlayerById(id, season);
    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, season, player });
  }

  let results = getSeasonRoster(season);

  if (classYear) {
    results = results.filter(p => p.classYear === classYear);
  }

  if (pos) {
    results = results.filter(p => p.positions.includes(pos) || p.primaryPosition === pos);
  }

  if (q) {
    results = results.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.jerseyNumber.toString().includes(q) ||
      p.primaryPosition.toLowerCase().includes(q)
    );
  }

  return NextResponse.json({
    success: true,
    season: seasonMeta.yearSpan,
    seasonId: season,
    seasonType: seasonMeta.type,
    school: 'The Peddie School',
    headCoach: seasonMeta.headCoach,
    record: seasonMeta.record,
    count: results.length,
    players: results,
  });
}
