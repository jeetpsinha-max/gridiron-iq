// ============================================================================
// Peddie Football Analytics — EPA (Expected Points Added) Calculator Engine
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

// ============================================================================
// Advanced Analytics Functions — Computed from Actual Play Data
// ============================================================================

export type DistanceBucket = 'SHORT' | 'MEDIUM' | 'LONG';

export interface DownDistanceCell {
  down: Down;
  distanceBucket: DistanceBucket;
  distanceLabel: string;
  plays: number;
  successRate: number;
  avgEpa: number;
  passRate: number;
  runRate: number;
  avgYards: number;
  conversionRate: number;
}

/**
 * Generates a situational conversion/success matrix by down & distance bucket.
 * Short ≤3, Medium 4–7, Long 8+.
 */
export function computeDownDistanceMatrix(plays: PlayAnalysis[]): DownDistanceCell[] {
  const buckets: { key: DistanceBucket; label: string; min: number; max: number }[] = [
    { key: 'SHORT', label: '≤3 yds', min: 0, max: 3 },
    { key: 'MEDIUM', label: '4–7 yds', min: 4, max: 7 },
    { key: 'LONG', label: '8+ yds', min: 8, max: 99 },
  ];
  const downs: Down[] = [1, 2, 3, 4];

  const results: DownDistanceCell[] = [];

  for (const d of downs) {
    for (const b of buckets) {
      const subset = plays.filter(
        p => p.down === d && p.distance >= b.min && p.distance <= b.max
      );
      if (subset.length === 0) {
        results.push({
          down: d, distanceBucket: b.key, distanceLabel: b.label,
          plays: 0, successRate: 0, avgEpa: 0, passRate: 0, runRate: 0, avgYards: 0, conversionRate: 0,
        });
        continue;
      }
      const successful = subset.filter(p => isPlaySuccessful(p)).length;
      const passes = subset.filter(p => ['PASS', 'PLAY_ACTION_BOOT', 'RPO', 'SCREEN'].includes(p.playType)).length;
      const conversions = subset.filter(p => p.isFirstDown || p.isTouchdown).length;
      const totalEpa = subset.reduce((s, p) => s + p.epa, 0);
      const totalYards = subset.reduce((s, p) => s + p.yardsGained, 0);

      results.push({
        down: d,
        distanceBucket: b.key,
        distanceLabel: b.label,
        plays: subset.length,
        successRate: Number(((successful / subset.length) * 100).toFixed(1)),
        avgEpa: Number((totalEpa / subset.length).toFixed(2)),
        passRate: Number(((passes / subset.length) * 100).toFixed(1)),
        runRate: Number((((subset.length - passes) / subset.length) * 100).toFixed(1)),
        avgYards: Number((totalYards / subset.length).toFixed(1)),
        conversionRate: Number(((conversions / subset.length) * 100).toFixed(1)),
      });
    }
  }
  return results;
}

export interface RedZoneStats {
  totalPlays: number;
  touchdownRate: number;
  fieldGoalRate: number;
  turnoverRate: number;
  avgEpa: number;
  successRate: number;
  touchdowns: number;
  fieldGoals: number;
  turnovers: number;
  goalLinePlays: number;
  goalLineTdRate: number;
}

/**
 * Filters plays inside opponent's 20 (yardLine >= 80) and computes
 * red zone efficiency metrics.
 */
export function computeRedZoneEfficiency(plays: PlayAnalysis[]): RedZoneStats {
  const rzPlays = plays.filter(p => p.yardLine >= 80);
  if (rzPlays.length === 0) {
    return { totalPlays: 0, touchdownRate: 0, fieldGoalRate: 0, turnoverRate: 0, avgEpa: 0, successRate: 0, touchdowns: 0, fieldGoals: 0, turnovers: 0, goalLinePlays: 0, goalLineTdRate: 0 };
  }

  const tds = rzPlays.filter(p => p.isTouchdown).length;
  const fgs = rzPlays.filter(p => p.playType === 'FIELD_GOAL').length;
  const tos = rzPlays.filter(p => p.isTurnover).length;
  const successful = rzPlays.filter(p => isPlaySuccessful(p)).length;
  const totalEpa = rzPlays.reduce((s, p) => s + p.epa, 0);

  // Goal line plays (inside 5)
  const glPlays = rzPlays.filter(p => p.yardLine >= 95);
  const glTds = glPlays.filter(p => p.isTouchdown).length;

  return {
    totalPlays: rzPlays.length,
    touchdownRate: Number(((tds / rzPlays.length) * 100).toFixed(1)),
    fieldGoalRate: Number(((fgs / rzPlays.length) * 100).toFixed(1)),
    turnoverRate: Number(((tos / rzPlays.length) * 100).toFixed(1)),
    avgEpa: Number((totalEpa / rzPlays.length).toFixed(2)),
    successRate: Number(((successful / rzPlays.length) * 100).toFixed(1)),
    touchdowns: tds,
    fieldGoals: fgs,
    turnovers: tos,
    goalLinePlays: glPlays.length,
    goalLineTdRate: glPlays.length > 0 ? Number(((glTds / glPlays.length) * 100).toFixed(1)) : 0,
  };
}

export interface QuarterTrend {
  quarter: number;
  quarterLabel: string;
  plays: number;
  avgEpa: number;
  totalEpa: number;
  successRate: number;
  explosiveRate: number;
  avgYards: number;
  touchdowns: number;
  turnovers: number;
}

/**
 * Returns per-quarter EPA, success rate, explosive play rate and scoring.
 */
export function computeQuarterTrends(plays: PlayAnalysis[]): QuarterTrend[] {
  const quarters = [1, 2, 3, 4];
  return quarters.map(q => {
    const subset = plays.filter(p => p.quarter === q);
    if (subset.length === 0) {
      return { quarter: q, quarterLabel: `Q${q}`, plays: 0, avgEpa: 0, totalEpa: 0, successRate: 0, explosiveRate: 0, avgYards: 0, touchdowns: 0, turnovers: 0 };
    }
    const stats = aggregateEPA(subset);
    const totalYards = subset.reduce((s, p) => s + p.yardsGained, 0);
    const tds = subset.filter(p => p.isTouchdown).length;
    const tos = subset.filter(p => p.isTurnover).length;

    return {
      quarter: q,
      quarterLabel: `Q${q}`,
      plays: subset.length,
      avgEpa: stats.avgEpa,
      totalEpa: stats.totalEpa,
      successRate: stats.successRate,
      explosiveRate: stats.explosivePlayRate,
      avgYards: Number((totalYards / subset.length).toFixed(1)),
      touchdowns: tds,
      turnovers: tos,
    };
  });
}

export interface FieldZoneStats {
  zone: string;
  zoneLabel: string;
  plays: number;
  avgEpa: number;
  successRate: number;
  explosiveRate: number;
  avgYards: number;
}

/**
 * Buckets plays into 5 field zones and returns performance per zone.
 */
export function computeFieldPositionEPA(plays: PlayAnalysis[]): FieldZoneStats[] {
  const zones = [
    { zone: 'own_deep', label: 'Own 1–20', min: 1, max: 20 },
    { zone: 'own_mid', label: 'Own 21–40', min: 21, max: 40 },
    { zone: 'midfield', label: 'Midfield 41–60', min: 41, max: 60 },
    { zone: 'opp_mid', label: 'Opp 21–40 (61–80)', min: 61, max: 80 },
    { zone: 'red_zone', label: 'Red Zone (81–99)', min: 81, max: 99 },
  ];

  return zones.map(z => {
    const subset = plays.filter(p => p.yardLine >= z.min && p.yardLine <= z.max);
    if (subset.length === 0) {
      return { zone: z.zone, zoneLabel: z.label, plays: 0, avgEpa: 0, successRate: 0, explosiveRate: 0, avgYards: 0 };
    }
    const stats = aggregateEPA(subset);
    const totalYards = subset.reduce((s, p) => s + p.yardsGained, 0);
    return {
      zone: z.zone,
      zoneLabel: z.label,
      plays: subset.length,
      avgEpa: stats.avgEpa,
      successRate: stats.successRate,
      explosiveRate: stats.explosivePlayRate,
      avgYards: Number((totalYards / subset.length).toFixed(1)),
    };
  });
}

export interface PersonnelStats {
  personnel: string;
  personnelLabel: string;
  plays: number;
  avgEpa: number;
  successRate: number;
  explosiveRate: number;
  avgYards: number;
  motionRate: number;
  passRate: number;
}

/**
 * Calculates performance by offensive personnel grouping (11, 12, 21 personnel etc.).
 */
export function computePersonnelSplits(plays: PlayAnalysis[]): PersonnelStats[] {
  const personnelLabels: Record<string, string> = {
    '11': '1RB 1TE 3WR',
    '12': '1RB 2TE 2WR',
    '13': '1RB 3TE 1WR',
    '21': '2RB 1TE 2WR',
    '22': '2RB 2TE 1WR',
    '10': '1RB 0TE 4WR',
    '20': '2RB 0TE 3WR',
  };

  const groups = new Map<string, PlayAnalysis[]>();
  for (const p of plays) {
    const key = p.offensivePersonnel || '11';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(p);
  }

  return Array.from(groups.entries())
    .map(([key, subset]) => {
      const stats = aggregateEPA(subset);
      const totalYards = subset.reduce((s, p) => s + p.yardsGained, 0);
      const motionPlays = subset.filter(p => p.motionType !== 'NONE').length;
      const passes = subset.filter(p => ['PASS', 'PLAY_ACTION_BOOT', 'RPO', 'SCREEN'].includes(p.playType)).length;

      return {
        personnel: key,
        personnelLabel: personnelLabels[key] || key,
        plays: subset.length,
        avgEpa: stats.avgEpa,
        successRate: stats.successRate,
        explosiveRate: stats.explosivePlayRate,
        avgYards: Number((totalYards / subset.length).toFixed(1)),
        motionRate: Number(((motionPlays / subset.length) * 100).toFixed(1)),
        passRate: Number(((passes / subset.length) * 100).toFixed(1)),
      };
    })
    .sort((a, b) => b.plays - a.plays);
}

export interface MotionLiftResult {
  motionAvgEpa: number;
  staticAvgEpa: number;
  epaLift: number;
  motionSuccessRate: number;
  staticSuccessRate: number;
  successRateLift: number;
  motionPlays: number;
  staticPlays: number;
}

/**
 * Computes the dynamic EPA lift that pre-snap motion provides over static plays.
 */
export function computeMotionLift(plays: PlayAnalysis[]): MotionLiftResult {
  const offPlays = plays.filter(p => p.unit === 'OFFENSE');
  const motionPlays = offPlays.filter(p => p.motionType !== 'NONE');
  const staticPlays = offPlays.filter(p => p.motionType === 'NONE');

  const motionStats = aggregateEPA(motionPlays);
  const staticStats = aggregateEPA(staticPlays);

  return {
    motionAvgEpa: motionStats.avgEpa,
    staticAvgEpa: staticStats.avgEpa,
    epaLift: Number((motionStats.avgEpa - staticStats.avgEpa).toFixed(2)),
    motionSuccessRate: motionStats.successRate,
    staticSuccessRate: staticStats.successRate,
    successRateLift: Number((motionStats.successRate - staticStats.successRate).toFixed(1)),
    motionPlays: motionPlays.length,
    staticPlays: staticPlays.length,
  };
}
