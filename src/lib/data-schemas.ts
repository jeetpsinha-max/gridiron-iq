// ============================================================================
// Peddie Football Analytics — Zod Validation Schemas & Data Types
// Enforces strict runtime validation for authentic film, telemetry, & Hudl data
// ============================================================================

import { z } from 'zod';

// --- Core Enums & Primitive Schemas ---

export const QuarterSchema = z.union([
  z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)
]);

export const DownSchema = z.union([
  z.literal(1), z.literal(2), z.literal(3), z.literal(4)
]);

export const HashMarkSchema = z.enum(['LEFT', 'MIDDLE', 'RIGHT']);

export const UnitSchema = z.enum(['OFFENSE', 'DEFENSE', 'SPECIAL_TEAMS']);

export const PlayTypeSchema = z.enum([
  'PASS', 'RUN', 'RPO', 'PLAY_ACTION', 'SCREEN', 'TRICK_PLAY', 'PUNT', 'FIELD_GOAL', 'KICKOFF', 'EXTRA_POINT'
]);

export const MotionTypeSchema = z.enum([
  'NONE', 'JET', 'ORBIT', 'SHALLOW_CROSS', 'RETURN', 'TRADE_TE', 'SHIFT_BACKFIELD', 'ACROSS', 'FAST_MOTION'
]);

export const CoverageSchemeSchema = z.enum([
  'COVER_0', 'COVER_1', 'COVER_2', 'COVER_3', 'COVER_4', 'COVER_6', 'MAN_FREE', 'MAN_PRESS', 'TAMPA_2', 'QUARTERS'
]);

export const DefensiveFrontSchema = z.enum([
  '4-3 Over', '4-3 Under', '3-4 Okie', '3-4 Under', '3-3-5 Nickel', '4-2-5 Nickel', '5-2 Bear', '5-3 Goal Line', '6-2 Goal Line'
]);

export const AssignmentGradeSchema = z.enum(['PLUS', 'MINUS', 'ZERO']);

// --- Spatial & Computer Vision Schemas ---

export const Point2DSchema = z.object({
  x: z.number().min(0).max(100), // Normalized percentage of canvas width (0-100)
  y: z.number().min(0).max(100), // Normalized percentage of canvas height (0-100)
});

export const BoundingBoxSchema = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  width: z.number().min(0).max(1),
  height: z.number().min(0).max(1),
  confidence: z.number().min(0).max(1),
  classLabel: z.enum(['PLAYER_OFFENSE', 'PLAYER_DEFENSE', 'BALL', 'REFEREE']),
  trackId: z.number().optional(),
});

export const SeparationVectorSchema = z.object({
  receiverJersey: z.number(),
  receiverName: z.string(),
  defenderJersey: z.number(),
  defenderName: z.string(),
  separationYards: z.number(),
  cushionAtSnapYards: z.number().optional(),
  separationAtCatchYards: z.number().optional(),
  startPoint: Point2DSchema,
  endPoint: Point2DSchema,
});

export const SpatialMetricsSchema = z.object({
  snapToPressureTimeSec: z.number(), // Stopwatch measurement: <2.2s red alert, 2.2-3.0s amber, >3.0s green
  pocketIntegrity: z.enum(['CLEAN', 'PRESSURE', 'COLLAPSED', 'CONTAIN_BREACH']),
  separationVectors: z.array(SeparationVectorSchema),
  qbCentroid: Point2DSchema.optional(),
  primaryRusherCentroid: Point2DSchema.optional(),
  distanceToPocketYards: z.number().optional(),
  ballSpeedMph: z.number().optional(),
});

export const TelestrationToolSchema = z.enum(['PEN', 'ARROW', 'SPOTLIGHT', 'ROUTE_LINE', 'ZONE_BOX', 'TEXT', 'ERASER']);

export const TelestrationStrokeSchema = z.object({
  id: z.string(),
  tool: TelestrationToolSchema,
  color: z.string(),
  lineWidth: z.number(),
  points: z.array(Point2DSchema),
  textLabel: z.string().optional(),
  timestamp: z.number(), // Video timestamp in seconds
});

// --- Roster & Player Schema ---

export const RecruitmentStatusSchema = z.enum(['COMMITTED', 'MULTIPLE_OFFERS', 'HIGH_INTEREST', 'SCOUTED', 'DEVELOPING']);

export const PlayerDossierSchema = z.object({
  id: z.string(),
  name: z.string(),
  jerseyNumber: z.number().int().min(0).max(99),
  primaryPosition: z.string(),
  positions: z.array(z.string()),
  classYear: z.string(), // e.g. "2026", "2027", "2028", "2029"
  gradeLevel: z.string(), // e.g. "Senior", "Junior", "Sophomore", "Freshman"
  height: z.string(),
  weight: z.number(),
  seasonGrade: z.number().min(0).max(100),
  tierLabel: z.string(),
  hudlProfileUrl: z.string().nullable().optional(),
  maxprepsUrl: z.string().nullable().optional(),
  committedCollege: z.string().nullable().optional(),
  stats: z.object({
    gamesPlayed: z.number(),
    snaps: z.number().optional(),
    tackles: z.number().optional(),
    stops: z.number().optional(),
    sacks: z.number().optional(),
    passingYds: z.number().optional(),
    passingTds: z.number().optional(),
    rushingYds: z.number().optional(),
    rushingTds: z.number().optional(),
    receptions: z.number().optional(),
    receivingYds: z.number().optional(),
    receivingTds: z.number().optional(),
    avgEpa: z.number().optional(),
  }).optional(),
});

// --- Play Analysis Schema ---

export const PlayAssignmentLogSchema = z.object({
  playerId: z.string(),
  jerseyNumber: z.number(),
  playerName: z.string(),
  position: z.string(),
  grade: AssignmentGradeSchema, // PLUS (+), MINUS (-), ZERO (0)
  assignment: z.string(),
  coachNote: z.string().optional(),
});

export const PlayAnalysisSchema = z.object({
  id: z.string(),
  gameId: z.string(),
  playNumber: z.number().int().positive(),
  quarter: QuarterSchema,
  gameClock: z.string(),
  videoTimestampStart: z.number(),
  videoTimestampSnap: z.number(),
  videoTimestampEnd: z.number(),
  down: DownSchema,
  distance: z.number().int().nonnegative(),
  yardLine: z.number().int().min(1).max(99),
  hash: HashMarkSchema,
  unit: UnitSchema,
  possession: z.string(),
  offensiveFormation: z.string(),
  offensivePersonnel: z.string(),
  motionType: MotionTypeSchema,
  motionDirection: z.string().optional(),
  motionPlayerJersey: z.number().optional(),
  blockingScheme: z.string().optional(),
  routeConcept: z.string().optional(),
  defensiveFront: z.string(),
  defensivePackage: z.string(),
  coverageScheme: CoverageSchemeSchema,
  defenseReactionToMotion: z.string().optional(),
  playType: PlayTypeSchema,
  playActionFake: z.boolean().default(false),
  targetPlayerJersey: z.number().optional(),
  yardsGained: z.number(),
  epa: z.number(),
  successRate: z.boolean(),
  isFirstDown: z.boolean(),
  isTouchdown: z.boolean(),
  isTurnover: z.boolean(),
  isPenalty: z.boolean(),
  penaltyDescription: z.string().optional(),
  playDescription: z.string(),
  spatialMetrics: SpatialMetricsSchema.optional(),
  telestrationStrokes: z.array(TelestrationStrokeSchema).default([]),
  assignmentLogs: z.array(PlayAssignmentLogSchema).default([]),
  defensivePlayMakerJersey: z.number().optional(),
  defensivePlayMakerName: z.string().optional(),
});

// --- Game Ingestion Schema ---

export const GameIngestionSchema = z.object({
  id: z.string(),
  title: z.string(),
  season: z.enum(['2024-2025', '2025-2026', '2026-2027']),
  date: z.string(),
  opponent: z.string(),
  isHome: z.boolean(),
  homeTeam: z.string(),
  awayTeam: z.string(),
  homeScore: z.number().int().nonnegative(),
  awayScore: z.number().int().nonnegative(),
  videoUrl: z.string().optional(),
  sourceType: z.enum(['HUDL_PUBLIC', 'MAXPREPS_SCRAPE', 'YOUTUBE_ARCHIVE', 'LOCAL_UPLOAD', 'MAPL_DATABASE']),
  plays: z.array(PlayAnalysisSchema),
  roster: z.array(PlayerDossierSchema).optional(),
});

// --- Hudl Bi-Directional CSV Schemas ---

export const HudlInputRowSchema = z.object({
  ODK: z.string().optional(),
  DN: z.union([z.string(), z.number()]).optional(),
  DIST: z.union([z.string(), z.number()]).optional(),
  'YARD LN': z.union([z.string(), z.number()]).optional(),
  HASH: z.string().optional(),
  'PLAY TYPE': z.string().optional(),
  RESULT: z.string().optional(),
  'OFF FORM': z.string().optional(),
  'DEF FRONT': z.string().optional(),
  COVERAGE: z.string().optional(),
  PLAYER_IDS: z.string().optional(),
  GN_LS: z.union([z.string(), z.number()]).optional(),
  QTR: z.union([z.string(), z.number()]).optional(),
  TIME: z.string().optional(),
});

export const HudlExportRowSchema = z.object({
  PLAY_NUM: z.number(),
  ODK: z.string(),
  QTR: z.number(),
  TIME: z.string(),
  DN: z.number(),
  DIST: z.number(),
  YARD_LN: z.number(),
  HASH: z.string(),
  OFF_FORM: z.string(),
  DEF_FRONT: z.string(),
  COVERAGE: z.string(),
  PLAY_TYPE: z.string(),
  GN_LS: z.number(),
  RESULT: z.string(),
  EPA: z.number(),
  SUCCESS_RATE: z.string(),
  TIME_TO_PRESSURE_SEC: z.number(),
  SEPARATION_YDS: z.number(),
  PRIMARY_TARGET: z.string(),
  DEF_PLAYMAKER: z.string(),
});

// --- Multi-Agent Orchestration & Natural Language Query Schemas ---

export const NaturalLanguageFilterSchema = z.object({
  rawPrompt: z.string(),
  down: z.array(z.number()).optional(),
  minDistance: z.number().optional(),
  maxDistance: z.number().optional(),
  distanceCategory: z.enum(['SHORT', 'MEDIUM', 'LONG']).optional(),
  playType: z.array(PlayTypeSchema).optional(),
  coverageScheme: z.array(CoverageSchemeSchema).optional(),
  defensiveFront: z.array(z.string()).optional(),
  maxTimeToPressureSec: z.number().optional(),
  minYardsGained: z.number().optional(),
  isExplosiveOnly: z.boolean().optional(),
  isTurnoverOnly: z.boolean().optional(),
  targetJersey: z.number().optional(),
  unit: UnitSchema.optional(),
  quarter: z.array(z.number()).optional(),
});

export const CoachingScoutingReportSchema = z.object({
  id: z.string(),
  gameId: z.string(),
  generatedBy: z.literal('Claude Opus Lead Orchestrator'),
  timestamp: z.string(),
  executiveSummary: z.string(),
  offensiveTendencies: z.object({
    runPassRatio: z.string(),
    topPersonnelGrouping: z.string(),
    motionEpaLift: z.number(),
    explosivePlayRate: z.string(),
    primaryConcepts: z.array(z.string()),
  }),
  defensiveVulnerabilities: z.object({
    pressureHotspots: z.array(z.string()),
    coverageBreakdownEpa: z.record(z.string(), z.number()),
    blitzFrequencyPct: z.number(),
    averageTimeToPressureSec: z.number(),
  }),
  situationalCallSheet: z.object({
    firstAndTenFavorites: z.array(z.string()),
    secondAndMediumFavorites: z.array(z.string()),
    thirdAndShortAlerts: z.array(z.string()),
    redZoneKillers: z.array(z.string()),
  }),
  keyMatchupNotes: z.array(z.string()),
});

// --- Exported TypeScript Types ---

export type Point2D = z.infer<typeof Point2DSchema>;
export type BoundingBox = z.infer<typeof BoundingBoxSchema>;
export type SeparationVector = z.infer<typeof SeparationVectorSchema>;
export type SpatialMetrics = z.infer<typeof SpatialMetricsSchema>;
export type TelestrationStroke = z.infer<typeof TelestrationStrokeSchema>;
export type PlayerDossier = z.infer<typeof PlayerDossierSchema>;
export type PlayAssignmentLog = z.infer<typeof PlayAssignmentLogSchema>;
export type PlayAnalysisData = z.infer<typeof PlayAnalysisSchema>;
export type GameIngestionData = z.infer<typeof GameIngestionSchema>;
export type HudlInputRow = z.infer<typeof HudlInputRowSchema>;
export type HudlExportRow = z.infer<typeof HudlExportRowSchema>;
export type NaturalLanguageFilter = z.infer<typeof NaturalLanguageFilterSchema>;
export type CoachingScoutingReport = z.infer<typeof CoachingScoutingReportSchema>;
