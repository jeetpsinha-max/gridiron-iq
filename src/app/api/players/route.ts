// ============================================================================
// Peddie Football S.A.C. — 2025–2026 Peddie School Falcons Player Tracker API
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { PEDDIE_PLAYERS, getPlayerById, getPlayersByClass, getPlayersByPosition } from '@/lib/peddie-player-data';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const classYear = searchParams.get('class');
  const pos = searchParams.get('position');
  const q = searchParams.get('q')?.toLowerCase();

  if (id) {
    const player = getPlayerById(id);
    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, player });
  }

  let results = [...PEDDIE_PLAYERS];

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
    season: '2025–2026',
    school: 'The Peddie School',
    headCoach: 'Mark Fabish',
    count: results.length,
    players: results,
  });
}
