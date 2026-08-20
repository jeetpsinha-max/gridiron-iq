// ============================================================================
// Peddie Football Analytics — Multi-Season Games API Route
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getSeasonGames, getSeasonGameById, getSeasonMetadata } from '@/lib/seasons-data';
import { SeasonId } from '@/types/football';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const season = (searchParams.get('season') || '2025-2026') as SeasonId;
  const id = searchParams.get('id');

  const seasonMeta = getSeasonMetadata(season);
  const games = getSeasonGames(season);

  if (id) {
    const game = getSeasonGameById(id, season);
    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, season, game });
  }

  const summaries = games.map(g => ({
    id: g.id,
    title: g.title,
    date: g.date,
    opponent: g.opponent,
    homeScore: g.homeScore,
    awayScore: g.awayScore,
    totalPlays: g.plays.length,
    offensePlays: g.plays.filter(p => p.unit === 'OFFENSE').length,
    defensePlays: g.plays.filter(p => p.unit === 'DEFENSE').length,
    touchdowns: g.plays.filter(p => p.isTouchdown).length,
  }));

  return NextResponse.json({
    success: true,
    season: seasonMeta.yearSpan,
    seasonId: season,
    seasonType: seasonMeta.type,
    school: 'The Peddie School',
    headCoach: seasonMeta.headCoach,
    record: seasonMeta.record,
    totalGames: summaries.length,
    games: summaries,
  });
}
