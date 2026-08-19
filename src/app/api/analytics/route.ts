// ============================================================================
// Peddie Football Analytics — Advanced ML Analytics & Motion Models API Route
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { MOCK_GAMES } from '@/lib/mock-game-data';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const gameId = searchParams.get('gameId');

  let plays = MOCK_GAMES.flatMap(g => g.plays);
  if (gameId && gameId !== 'ALL') {
    const g = MOCK_GAMES.find(g => g.id === gameId);
    if (g) plays = g.plays;
  }

  // Motion vs Static breakdown
  const motionPlays = plays.filter(p => p.motionType && p.motionType !== 'NONE');
  const staticPlays = plays.filter(p => !p.motionType || p.motionType === 'NONE');

  const motionEpaTotal = motionPlays.reduce((sum, p) => sum + p.epa, 0);
  const staticEpaTotal = staticPlays.reduce((sum, p) => sum + p.epa, 0);

  const motionAvgEpa = motionPlays.length ? Number((motionEpaTotal / motionPlays.length).toFixed(3)) : 0;
  const staticAvgEpa = staticPlays.length ? Number((staticEpaTotal / staticPlays.length).toFixed(3)) : 0;
  const motionEpaLift = Number((motionAvgEpa - staticAvgEpa).toFixed(3));

  // Coverage breakdown
  const coverageMap: Record<string, { count: number; epaTotal: number; successCount: number }> = {};
  plays.forEach(p => {
    const c = p.coverageScheme || 'UNKNOWN';
    if (!coverageMap[c]) coverageMap[c] = { count: 0, epaTotal: 0, successCount: 0 };
    coverageMap[c].count += 1;
    coverageMap[c].epaTotal += p.epa;
    if (p.successRate || p.epa > 0) coverageMap[c].successCount += 1;
  });

  const coverageTendencies = Object.entries(coverageMap).map(([scheme, data]) => ({
    scheme,
    frequency: data.count,
    frequencyPct: Number(((data.count / plays.length) * 100).toFixed(1)),
    avgEpaAllowed: Number((data.epaTotal / data.count).toFixed(3)),
    successRatePct: Number(((data.successCount / data.count) * 100).toFixed(1)),
  })).sort((a, b) => b.frequency - a.frequency);

  return NextResponse.json({
    success: true,
    totalPlaysSampled: plays.length,
    motionTelemetry: {
      motionPlayCount: motionPlays.length,
      staticPlayCount: staticPlays.length,
      motionRatePct: Number(((motionPlays.length / plays.length) * 100).toFixed(1)),
      motionAvgEpa,
      staticAvgEpa,
      motionEpaLift,
    },
    coverageTendencies,
  });
}
