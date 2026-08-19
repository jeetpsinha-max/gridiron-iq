// ============================================================================
// Peddie Football S.A.C. — EPA (Expected Points Added) Calculator Engine
// ============================================================================
// Simplified EP model based on down, distance, and yard line context.
// Production apps would use nflfastR-style logistic models; this provides
// a realistic analytical approximation for coaching-grade insights.

import { Down, PlayAnalysis } from '@/types/football';

interface EPContext {
  down: Down;
  distance: number;
  yardLine: number; // yards from own end zone (1-99)
}

// Expected Points lookup table (approximation of nflfastR model)
// Indexed by yard line buckets, then adjusted for down & distance
const EP_TABLE: Record<string, number> = {
  // Own territory
  'own_1_10': -1.2,
  'own_11_20': -0.5,
  'own_21_30': 0.2,
  'own_31_40': 0.8,
  'own_41_50': 1.4,
  // Opponent territory
  'opp_41_50': 2.0,
  'opp_31_40': 2.6,
  'opp_21_30': 3.5,
  'opp_11_20': 4.5,
  'opp_1_10': 5.8,
};

function getYardLineBucket(yardLine: number): string {
  if (yardLine <= 10) return 'own_1_10';
  if (yardLine <= 20) return 'own_11_20';
  if (yardLine <= 30) return 'own_21_30';
  if (yardLine <= 40) return 'own_31_40';
  if (yardLine <= 50) return 'own_41_50';
  if (yardLine <= 60) return 'opp_41_50';
  if (yardLine <= 70) return 'opp_31_40';
  if (yardLine <= 80) return 'opp_21_30';
  if (yardLine <= 90) return 'opp_11_20';
  return 'opp_1_10';
}

function getDownMultiplier(down: Down): number {
  switch (down) {
    case 1: return 1.0;
    case 2: return 0.85;
    case 3: return 0.6;
    case 4: return 0.3;
  }
}

function getDistanceAdjustment(distance: number): number {
  if (distance <= 3) return 0.3;
  if (distance <= 7) return 0.0;
  if (distance <= 12) return -0.3;
  return -0.6;
}

export function calculateExpectedPoints(ctx: EPContext): number {
  const bucket = getYardLineBucket(ctx.yardLine);
  const baseEP = EP_TABLE[bucket] ?? 0;
  const downMult = getDownMultiplier(ctx.down);
  const distAdj = getDistanceAdjustment(ctx.distance);
  return Number((baseEP * downMult + distAdj).toFixed(2));
}

export function calculateEPA(
  prePlay: EPContext,
  postPlayYardLine: number,
  isTurnover: boolean,
  isTouchdown: boolean,
  isFieldGoal: boolean
): number {
  const preEP = calculateExpectedPoints(prePlay);

  if (isTouchdown) return Number((7 - preEP).toFixed(2));
  if (isFieldGoal) return Number((3 - preEP).toFixed(2));
  if (isTurnover) return Number((-preEP - 2.5).toFixed(2));

  // Calculate post-play expected points
  const newDown = prePlay.distance <= (postPlayYardLine - prePlay.yardLine)
    ? 1 : Math.min(prePlay.down + 1, 4) as Down;
  const yardsGained = postPlayYardLine - prePlay.yardLine;
  const newDistance = prePlay.distance <= yardsGained ? 10 : prePlay.distance - yardsGained;

  const postEP = calculateExpectedPoints({
    down: newDown,
    distance: Math.max(1, Math.min(newDistance, 30)),
    yardLine: Math.max(1, Math.min(postPlayYardLine, 99)),
  });

  return Number((postEP - preEP).toFixed(2));
}

// Determine if play was successful using EPA-based success criteria
export function isPlaySuccessful(play: PlayAnalysis): boolean {
  if (play.isTouchdown) return true;
  if (play.isTurnover) return false;

  // Down-based success thresholds
  switch (play.down) {
    case 1: return play.yardsGained >= play.distance * 0.5;
    case 2: return play.yardsGained >= play.distance * 0.7;
    case 3:
    case 4: return play.yardsGained >= play.distance;
  }
}

// Aggregate EPA stats for a set of plays
export function aggregateEPA(plays: PlayAnalysis[]): {
  totalEpa: number;
  avgEpa: number;
  successRate: number;
  explosivePlayRate: number;
  negativePlayRate: number;
} {
  if (plays.length === 0) {
    return { totalEpa: 0, avgEpa: 0, successRate: 0, explosivePlayRate: 0, negativePlayRate: 0 };
  }

  const totalEpa = plays.reduce((sum, p) => sum + p.epa, 0);
  const successfulPlays = plays.filter(p => isPlaySuccessful(p)).length;
  const explosivePlays = plays.filter(p => p.yardsGained >= 15).length;
  const negativePlays = plays.filter(p => p.yardsGained < 0).length;

  return {
    totalEpa: Number(totalEpa.toFixed(2)),
    avgEpa: Number((totalEpa / plays.length).toFixed(2)),
    successRate: Number((successfulPlays / plays.length * 100).toFixed(1)),
    explosivePlayRate: Number((explosivePlays / plays.length * 100).toFixed(1)),
    negativePlayRate: Number((negativePlays / plays.length * 100).toFixed(1)),
  };
}
