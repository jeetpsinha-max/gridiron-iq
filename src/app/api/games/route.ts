// ============================================================================
// Peddie Football Analytics — 2025–2026 Peddie Falcons Games API Route
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { MOCK_GAMES } from '@/lib/mock-game-data';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (id) {
    const game = MOCK_GAMES.find(g => g.id === id);
    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, game });
  }

  const summaries = MOCK_GAMES.map(g => ({
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
    season: '2025–2026',
    school: 'The Peddie School',
    headCoach: 'Mark Fabish',
    totalGames: summaries.length,
    games: summaries,
  });
}
