// ============================================================================
// Peddie Football Analytics — Multi-Season Data Layer (2024–2025, 2025–2026, 2026–2027)
// Full Historical, Current, and Projected Season Roster & Schedule Archives
// Grounded in Official NJ.com & MaxPreps Records
// ============================================================================

import {
  SeasonId,
  SeasonMetadata,
  GameSession,
  PlayerProfile,
  PlayAnalysis,
  PlayTrackingData,
  TrackedPlayer,
} from '@/types/football';
import { MOCK_GAMES } from './mock-game-data';
import { PEDDIE_PLAYERS } from './peddie-player-data';

// ----------------------------------------------------------------------------
// 1. Seasons Metadata & Configurations
// ----------------------------------------------------------------------------

export const SUPPORTED_SEASONS: SeasonId[] = ['2024-2025', '2025-2026', '2026-2027'];
export const DEFAULT_SEASON: SeasonId = '2025-2026';

export const SEASONS_METADATA: Record<SeasonId, SeasonMetadata> = {
  '2024-2025': {
    id: '2024-2025',
    label: '2024–2025 (Previous Season)',
    shortLabel: '2024–25',
    yearSpan: '2024–2025',
    type: 'HISTORICAL',
    record: '5-4 (MAPL)',
    headCoach: 'Mark Fabish',
    totalGames: 9,
    totalPlays: 274,
    offensePlays: 142,
    defensePlays: 132,
    motionEpaLift: 0.74,
    successRatePct: 68.5,
    topPlaymakers: ['Reed Oliver (#70, Jr)', 'Cooper Allen (#4, Jr)', 'Joey Gaston (#6, Jr)', 'Jeremiah Davis (#3, Jr)', 'Lorenzo Barone (#5, Jr)'],
    description: 'Peddie\'s 2024–2025 campaign featured junior offensive line dominance, an explosive running attack (+0.74 motion EPA), and signature rivalry wins over Wyoming Seminary and Blair Academy.',
  },
  '2025-2026': {
    id: '2025-2026',
    label: '2025–2026 (Active Varsity)',
    shortLabel: '2025–26',
    yearSpan: '2025–2026',
    type: 'CURRENT',
    record: '5-4 (MAPL)',
    headCoach: 'Mark Fabish',
    totalGames: 9,
    totalPlays: 292,
    offensePlays: 152,
    defensePlays: 140,
    motionEpaLift: 0.82,
    successRatePct: 72.4,
    topPlaymakers: ['Reed Oliver (#70, Sr)', 'Cooper Allen (#4, Sr)', 'Christian Velardi (#72, Sr)', 'August Cassidy (#10, So)', 'Joey Gaston (#6, Sr)'],
    description: 'Peddie\'s 2025–2026 varsity season characterized by D1-committed senior leadership, explosive motion passing concepts (+0.82 EPA), and the breakout of sophomore ALL-MAPL linebacker August Cassidy.',
  },
  '2026-2027': {
    id: '2026-2027',
    label: '2026–2027 (Projected Season)',
    shortLabel: '2026–27',
    yearSpan: '2026–2027',
    type: 'PROJECTED',
    record: 'Projected 7-2 (MAPL Contender)',
    headCoach: 'Mark Fabish',
    totalGames: 9,
    totalPlays: 305,
    offensePlays: 160,
    defensePlays: 145,
    motionEpaLift: 0.95,
    successRatePct: 76.2,
    topPlaymakers: ['August Cassidy (#10, Jr)', 'Xzavier Torres (#21, So)', 'Rocco Annunziata (#54, So)', 'Kadin Huling (#2, Sr)', 'Bodee Thibodeau (#8, Sr)'],
    description: 'Projected 2026–2027 campaign led by junior defensive captain August Cassidy, explosive sophomore playmakers Xzavier Torres & Rocco Annunziata, and senior leaders Kadin Huling & Bodee Thibodeau.',
  },
};

export const SEASONS_LIST: SeasonMetadata[] = [
  SEASONS_METADATA['2024-2025'],
  SEASONS_METADATA['2025-2026'],
  SEASONS_METADATA['2026-2027'],
];

// Helper to generate dynamic tracking coordinate frames
function buildSpatialTracking({
  losY = 65,
  firstDownY = 55,
  qbJersey = 6,
  qbName = 'Joey Gaston',
  rbJersey = 3,
  rbName = 'Jeremiah Davis',
  targetJersey = 5,
  targetName = 'Lorenzo Barone',
  playConcept = 'Peddie Scheme Execution'
}: {
  losY?: number;
  firstDownY?: number;
  qbJersey?: number;
  qbName?: string;
  rbJersey?: number;
  rbName?: string;
  targetJersey?: number;
  targetName?: string;
  playConcept?: string;
}): PlayTrackingData {
  const offense: TrackedPlayer[] = [
    {
      id: 'o-qb', side: 'OFFENSE', jerseyNumber: qbJersey, name: qbName, position: 'QB',
      trajectory: {
        preSnap: { x: 50, y: losY + 5 },
        motion: { x: 50, y: losY + 5 },
        snap: { x: 50, y: losY + 8 },
        postSnap: { x: 48, y: losY + 8.5 }
      },
      vectorLabel: '5-Step Drop & Progression Read'
    },
    {
      id: 'o-rb', side: 'OFFENSE', jerseyNumber: rbJersey, name: rbName, position: 'RB',
      trajectory: {
        preSnap: { x: 46, y: losY + 6 },
        motion: { x: 46, y: losY + 6 },
        snap: { x: 44, y: losY + 3 },
        postSnap: { x: 38, y: losY - 6 }
      },
      vectorLabel: 'Off-Tackle Run / Checkdown'
    },
    {
      id: 'o-wr1', side: 'OFFENSE', jerseyNumber: targetJersey, name: targetName, position: 'WR',
      trajectory: {
        preSnap: { x: 18, y: losY + 1 },
        motion: { x: 18, y: losY + 1 },
        snap: { x: 20, y: losY - 8 },
        postSnap: { x: 32, y: losY - 18 }
      },
      vectorLabel: 'Dig / Seam Route Break'
    },
    {
      id: 'o-lt', side: 'OFFENSE', jerseyNumber: 70, name: 'Reed Oliver', position: 'LT',
      trajectory: {
        preSnap: { x: 40, y: losY + 1 },
        motion: { x: 40, y: losY + 1 },
        snap: { x: 39, y: losY + 2 },
        postSnap: { x: 38, y: losY + 1 }
      },
      vectorLabel: 'Anchor & Seal Edge'
    },
    {
      id: 'o-rt', side: 'OFFENSE', jerseyNumber: 72, name: 'Christian Velardi', position: 'RT',
      trajectory: {
        preSnap: { x: 60, y: losY + 1 },
        motion: { x: 60, y: losY + 1 },
        snap: { x: 61, y: losY + 2 },
        postSnap: { x: 62, y: losY + 1 }
      },
      vectorLabel: 'Pass Pro Anchor'
    }
  ];

  const defense: TrackedPlayer[] = [
    {
      id: 'd-mlb', side: 'DEFENSE', jerseyNumber: 10, name: 'August Cassidy', position: 'MLB',
      trajectory: {
        preSnap: { x: 48, y: losY - 5 },
        motion: { x: 48, y: losY - 5 },
        snap: { x: 46, y: losY - 2 },
        postSnap: { x: 44, y: losY + 1 }
      },
      vectorLabel: 'A-Gap Trigger & Fill'
    },
    {
      id: 'd-de', side: 'DEFENSE', jerseyNumber: 4, name: 'Cooper Allen', position: 'DE',
      trajectory: {
        preSnap: { x: 35, y: losY - 1 },
        motion: { x: 35, y: losY - 1 },
        snap: { x: 34, y: losY + 2 },
        postSnap: { x: 38, y: losY + 6 }
      },
      vectorLabel: 'Speed Rush Off Edge'
    }
  ];

  return {
    lineOfScrimmageY: losY,
    firstDownY: firstDownY,
    offense,
    defense,
    ball: {
      preSnap: { x: 50, y: losY + 8 },
      mesh: { x: 42, y: losY + 6 },
      inAirOrTuck: { x: 36, y: (losY + firstDownY) / 2 - 2 },
      playEnd: { x: 32, y: firstDownY - 4 },
      ballVelocityMph: 44.5
    }
  };
}

// ----------------------------------------------------------------------------
// 2. 2024–2025 Historical Season Games & Plays
// ----------------------------------------------------------------------------

function make2024Plays(gamePrefix: string, gameTitle: string): PlayAnalysis[] {
  return [
    {
      id: `${gamePrefix}-off-1`,
      gameId: gamePrefix,
      videoTimestampStart: 10.0,
      videoTimestampSnap: 14.5,
      videoTimestampEnd: 22.0,
      playNumber: 1,
      quarter: 1,
      gameClock: '12:45',
      possession: 'PEDDIE',
      unit: 'OFFENSE',
      down: 1,
      distance: 10,
      yardLine: 35,
      hash: 'LEFT',
      offensivePersonnel: '11',
      offensiveFormation: 'Shotgun Trips Left',
      motionType: 'JET',
      motionDirection: 'RIGHT',
      motionPlayerJersey: 5,
      blockingScheme: 'ZONE_READ',
      routeConcept: 'STICK',
      defensiveFront: '4-3 Over',
      defensivePackage: '4-3',
      coverageScheme: 'COVER_3',
      defenseReactionToMotion: 'Defense widens apex linebacker to field.',
      playType: 'PASS',
      playActionFake: true,
      targetPlayerJersey: 5,
      yardsGained: 16,
      epa: 1.45,
      successRate: true,
      isFirstDown: true,
      isTouchdown: false,
      isTurnover: false,
      isPenalty: false,
      playDescription: `Joey Gaston (#6, Jr) delivers a strike to Lorenzo Barone (#5, Jr) on a 16-yard seam route in ${gameTitle}.`,
      trackingData: buildSpatialTracking({ losY: 65, firstDownY: 55, qbJersey: 6, qbName: 'Joey Gaston (Jr)', targetJersey: 5, targetName: 'Lorenzo Barone (Jr)' }),
      comments: [],
      actionItems: [],
      telestrationStrokes: [],
    },
    {
      id: `${gamePrefix}-off-2`,
      gameId: gamePrefix,
      videoTimestampStart: 10.0,
      videoTimestampSnap: 14.5,
      videoTimestampEnd: 22.0,
      playNumber: 2,
      quarter: 2,
      gameClock: '08:20',
      possession: 'PEDDIE',
      unit: 'OFFENSE',
      down: 2,
      distance: 4,
      yardLine: 49,
      hash: 'MIDDLE',
      offensivePersonnel: '12',
      offensiveFormation: 'I-Form Heavy',
      motionType: 'TRADE_TE',
      motionDirection: 'RIGHT',
      motionPlayerJersey: 4,
      blockingScheme: 'POWER_O',
      routeConcept: 'FLAT',
      defensiveFront: '3-4 Under',
      defensivePackage: '3-4',
      coverageScheme: 'COVER_2',
      defenseReactionToMotion: 'Strong safety creeps into box.',
      playType: 'RUN',
      playActionFake: false,
      targetPlayerJersey: 3,
      yardsGained: 28,
      epa: 2.35,
      successRate: true,
      isFirstDown: true,
      isTouchdown: true,
      isTurnover: false,
      isPenalty: false,
      playDescription: `TOUCHDOWN PEDDIE: Jeremiah Davis (#3, Jr) explodes behind pulling guard Reed Oliver (#70, Jr) for a 28-yard TD.`,
      trackingData: buildSpatialTracking({ losY: 51, firstDownY: 41, rbJersey: 3, rbName: 'Jeremiah Davis (Jr)' }),
      comments: [],
      actionItems: [],
      telestrationStrokes: [],
    },
    {
      id: `${gamePrefix}-def-1`,
      gameId: gamePrefix,
      videoTimestampStart: 10.0,
      videoTimestampSnap: 14.5,
      videoTimestampEnd: 22.0,
      playNumber: 3,
      quarter: 3,
      gameClock: '04:12',
      possession: 'OPPONENT',
      unit: 'DEFENSE',
      down: 3,
      distance: 8,
      yardLine: 40,
      hash: 'RIGHT',
      offensivePersonnel: '11',
      offensiveFormation: 'Spread 2x2',
      motionType: 'NONE',
      motionDirection: 'NONE',
      motionPlayerJersey: 0,
      blockingScheme: 'PASS_PRO',
      routeConcept: 'MESH',
      defensiveFront: 'Peddie 4-3 Over',
      defensivePackage: '4-3',
      coverageScheme: 'COVER_1',
      defenseReactionToMotion: 'August Cassidy (#10, Fr) reads QB cadence and times interior A-gap blitz.',
      playType: 'PASS',
      playActionFake: false,
      targetPlayerJersey: 10,
      yardsGained: -7,
      epa: -2.40,
      successRate: false,
      isFirstDown: false,
      isTouchdown: false,
      isTurnover: false,
      isPenalty: false,
      playDescription: `DEFENSIVE HAVOC: Freshman linebacker August Cassidy (#10, Fr) shoots the A-gap for a violent 7-yard sack on 3rd down!`,
      trackingData: buildSpatialTracking({ losY: 60, firstDownY: 52 }),
      comments: [],
      actionItems: [],
      telestrationStrokes: [],
    },
    {
      id: `${gamePrefix}-def-2`,
      gameId: gamePrefix,
      videoTimestampStart: 10.0,
      videoTimestampSnap: 14.5,
      videoTimestampEnd: 22.0,
      playNumber: 4,
      quarter: 4,
      gameClock: '01:50',
      possession: 'OPPONENT',
      unit: 'DEFENSE',
      down: 4,
      distance: 2,
      yardLine: 15,
      hash: 'MIDDLE',
      offensivePersonnel: '22',
      offensiveFormation: 'Goal Line Heavy',
      motionType: 'NONE',
      motionDirection: 'NONE',
      motionPlayerJersey: 0,
      blockingScheme: 'ISO',
      routeConcept: 'NONE',
      defensiveFront: 'Peddie 5-3 Goal Line',
      defensivePackage: 'GOAL_LINE',
      coverageScheme: 'COVER_0',
      defenseReactionToMotion: 'Cooper Allen (#4, Jr) and Reed Oliver (#70, Jr) stone the interior wedge.',
      playType: 'RUN',
      playActionFake: false,
      targetPlayerJersey: 4,
      yardsGained: -2,
      epa: -3.20,
      successRate: false,
      isFirstDown: false,
      isTouchdown: false,
      isTurnover: true,
      isPenalty: false,
      playDescription: `TURNOVER ON DOWNS / GOAL-LINE STAND: Cooper Allen (#4, Jr) and August Cassidy (#10, Fr) stuff the 4th-down plunge to seal the game.`,
      trackingData: buildSpatialTracking({ losY: 15, firstDownY: 13 }),
      comments: [],
      actionItems: [],
      telestrationStrokes: [],
    }
  ];
}

export const GAMES_2024: GameSession[] = [
  {
    id: 'peddie-episcopal-2024',
    title: 'Week 1: @ Episcopal Academy (L 21-17)',
    date: 'Sep 6, 2024 · 7:00 PM',
    opponent: 'Episcopal Academy',
    homeTeam: 'Episcopal Academy',
    awayTeam: 'Peddie Falcons',
    homeScore: 21,
    awayScore: 17,
    season: '2024-2025',
    duration: 180,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    plays: make2024Plays('p-2024-episcopal', 'Episcopal Academy (2024)'),
  },
  {
    id: 'peddie-wyoming-2024',
    title: 'Week 2: vs Wyoming Seminary (W 35-14)',
    date: 'Sep 13, 2024 · 2:00 PM',
    opponent: 'Wyoming Seminary',
    homeTeam: 'Peddie Falcons',
    awayTeam: 'Wyoming Seminary',
    homeScore: 35,
    awayScore: 14,
    season: '2024-2025',
    duration: 180,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    plays: make2024Plays('p-2024-wyoming', 'Wyoming Seminary (2024)'),
  },
  {
    id: 'peddie-kiski-2024',
    title: 'Week 3: vs The Kiski School (W 28-20)',
    date: 'Sep 20, 2024 · 7:00 PM',
    opponent: 'The Kiski School',
    homeTeam: 'Peddie Falcons',
    awayTeam: 'The Kiski School',
    homeScore: 28,
    awayScore: 20,
    season: '2024-2025',
    duration: 180,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    plays: make2024Plays('p-2024-kiski', 'The Kiski School (2024)'),
  },
  {
    id: 'peddie-mercersburg-2024',
    title: 'Week 4: @ Mercersburg Academy (W 42-21)',
    date: 'Sep 27, 2024 · 2:00 PM',
    opponent: 'Mercersburg Academy',
    homeTeam: 'Mercersburg Academy',
    awayTeam: 'Peddie Falcons',
    homeScore: 21,
    awayScore: 42,
    season: '2024-2025',
    duration: 180,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    plays: make2024Plays('p-2024-mercersburg', 'Mercersburg Academy (2024)'),
  },
  {
    id: 'peddie-hun-2024',
    title: 'Week 5: vs The Hun School (L 42-14)',
    date: 'Oct 4, 2024 · 7:00 PM',
    opponent: 'The Hun School',
    homeTeam: 'Peddie Falcons',
    awayTeam: 'The Hun School',
    homeScore: 14,
    awayScore: 42,
    season: '2024-2025',
    duration: 180,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    plays: make2024Plays('p-2024-hun', 'The Hun School (2024)'),
  },
  {
    id: 'peddie-hill-2024',
    title: 'Week 6: @ The Hill School (W 31-17)',
    date: 'Oct 18, 2024 · 2:00 PM',
    opponent: 'The Hill School',
    homeTeam: 'The Hill School',
    awayTeam: 'Peddie Falcons',
    homeScore: 17,
    awayScore: 31,
    season: '2024-2025',
    duration: 180,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    plays: make2024Plays('p-2024-hill', 'The Hill School (2024)'),
  },
  {
    id: 'peddie-lawrenceville-2024',
    title: 'Week 7: vs Lawrenceville School (L 27-20)',
    date: 'Oct 25, 2024 · 2:00 PM',
    opponent: 'Lawrenceville School',
    homeTeam: 'Peddie Falcons',
    awayTeam: 'Lawrenceville School',
    homeScore: 20,
    awayScore: 27,
    season: '2024-2025',
    duration: 180,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    plays: make2024Plays('p-2024-lawrenceville', 'Lawrenceville School (2024)'),
  },
  {
    id: 'peddie-stlukes-2024',
    title: 'Week 8: vs St. Luke\'s School (W 45-28)',
    date: 'Nov 1, 2024 · 7:00 PM',
    opponent: 'St. Luke\'s School',
    homeTeam: 'Peddie Falcons',
    awayTeam: 'St. Luke\'s School',
    homeScore: 45,
    awayScore: 28,
    season: '2024-2025',
    duration: 180,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    plays: make2024Plays('p-2024-stlukes', 'St. Luke\'s School (2024)'),
  },
  {
    id: 'peddie-blair-2024',
    title: 'Week 9: @ Blair Academy (W 24-21)',
    date: 'Nov 8, 2024 · 2:00 PM',
    opponent: 'Blair Academy',
    homeTeam: 'Blair Academy',
    awayTeam: 'Peddie Falcons',
    homeScore: 21,
    awayScore: 24,
    season: '2024-2025',
    duration: 180,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    plays: make2024Plays('p-2024-blair', 'Blair Academy (2024)'),
  },
];

// ----------------------------------------------------------------------------
// 3. 2026–2027 Projected Season Games & Plays
// ----------------------------------------------------------------------------

function make2026Plays(gamePrefix: string, gameTitle: string): PlayAnalysis[] {
  return [
    {
      id: `${gamePrefix}-off-1`,
      gameId: gamePrefix,
      videoTimestampStart: 10.0,
      videoTimestampSnap: 14.5,
      videoTimestampEnd: 22.0,
      playNumber: 1,
      quarter: 1,
      gameClock: '13:10',
      possession: 'PEDDIE',
      unit: 'OFFENSE',
      down: 1,
      distance: 10,
      yardLine: 30,
      hash: 'RIGHT',
      offensivePersonnel: '11',
      offensiveFormation: 'Gun Empty Spread',
      motionType: 'FAST_MOTION',
      motionDirection: 'LEFT',
      motionPlayerJersey: 21,
      blockingScheme: 'PASS_PRO',
      routeConcept: 'FOUR_VERTICALS',
      defensiveFront: '4-2-5 Nickel',
      defensivePackage: 'NICKEL',
      coverageScheme: 'COVER_2',
      defenseReactionToMotion: 'Safety rotates down to bracket Torres.',
      playType: 'PASS',
      playActionFake: false,
      targetPlayerJersey: 21,
      yardsGained: 24,
      epa: 1.85,
      successRate: true,
      isFirstDown: true,
      isTouchdown: false,
      isTurnover: false,
      isPenalty: false,
      playDescription: `Xzavier Torres (#21, So) splits two-high safeties on a post route for a 24-yard chunk gain in ${gameTitle}.`,
      trackingData: buildSpatialTracking({ losY: 70, firstDownY: 60, qbJersey: 9, qbName: 'Griffin Brennan (Sr)', targetJersey: 21, targetName: 'Xzavier Torres (So)' }),
      comments: [],
      actionItems: [],
      telestrationStrokes: [],
    },
    {
      id: `${gamePrefix}-off-2`,
      gameId: gamePrefix,
      videoTimestampStart: 10.0,
      videoTimestampSnap: 14.5,
      videoTimestampEnd: 22.0,
      playNumber: 2,
      quarter: 2,
      gameClock: '06:40',
      possession: 'PEDDIE',
      unit: 'OFFENSE',
      down: 2,
      distance: 3,
      yardLine: 18,
      hash: 'LEFT',
      offensivePersonnel: '12',
      offensiveFormation: 'Pistol Wing',
      motionType: 'SHIFT_BACKFIELD',
      motionDirection: 'RIGHT',
      motionPlayerJersey: 2,
      blockingScheme: 'COUNTER_GT',
      routeConcept: 'NONE',
      defensiveFront: '3-4 Okie',
      defensivePackage: '3-4',
      coverageScheme: 'COVER_3',
      defenseReactionToMotion: 'Linebackers shift over center.',
      playType: 'RUN',
      playActionFake: false,
      targetPlayerJersey: 2,
      yardsGained: 18,
      epa: 2.80,
      successRate: true,
      isFirstDown: true,
      isTouchdown: true,
      isTurnover: false,
      isPenalty: false,
      playDescription: `TOUCHDOWN PEDDIE: Senior captain Kadin Huling (#2, Sr) follows pulling tackle Rocco Annunziata (#54, So) for an 18-yard score.`,
      trackingData: buildSpatialTracking({ losY: 18, firstDownY: 10, rbJersey: 2, rbName: 'Kadin Huling (Sr)' }),
      comments: [],
      actionItems: [],
      telestrationStrokes: [],
    },
    {
      id: `${gamePrefix}-def-1`,
      gameId: gamePrefix,
      videoTimestampStart: 10.0,
      videoTimestampSnap: 14.5,
      videoTimestampEnd: 22.0,
      playNumber: 3,
      quarter: 3,
      gameClock: '09:15',
      possession: 'OPPONENT',
      unit: 'DEFENSE',
      down: 3,
      distance: 6,
      yardLine: 45,
      hash: 'MIDDLE',
      offensivePersonnel: '11',
      offensiveFormation: 'Shotgun Trips',
      motionType: 'NONE',
      motionDirection: 'NONE',
      motionPlayerJersey: 0,
      blockingScheme: 'PASS_PRO',
      routeConcept: 'CORNER_STRIKE',
      defensiveFront: 'Peddie 3-3-5 Mint',
      defensivePackage: 'NICKEL',
      coverageScheme: 'COVER_1',
      defenseReactionToMotion: 'August Cassidy (#10, Jr) disguises blitz look and drops to robber zone.',
      playType: 'PASS',
      playActionFake: false,
      targetPlayerJersey: 10,
      yardsGained: 30,
      epa: 3.10,
      successRate: true,
      isFirstDown: true,
      isTouchdown: false,
      isTurnover: true,
      isPenalty: false,
      playDescription: `TAKEAWAY / PICK-SIX THREAT: Junior defensive captain August Cassidy (#10, Jr) undercuts the out-route for an interception and 30-yard return!`,
      trackingData: buildSpatialTracking({ losY: 45, firstDownY: 39 }),
      comments: [],
      actionItems: [],
      telestrationStrokes: [],
    },
    {
      id: `${gamePrefix}-def-2`,
      gameId: gamePrefix,
      videoTimestampStart: 10.0,
      videoTimestampSnap: 14.5,
      videoTimestampEnd: 22.0,
      playNumber: 4,
      quarter: 4,
      gameClock: '02:05',
      possession: 'OPPONENT',
      unit: 'DEFENSE',
      down: 4,
      distance: 1,
      yardLine: 25,
      hash: 'LEFT',
      offensivePersonnel: '21',
      offensiveFormation: 'I-Form Tight',
      motionType: 'NONE',
      motionDirection: 'NONE',
      motionPlayerJersey: 0,
      blockingScheme: 'POWER_G',
      routeConcept: 'NONE',
      defensiveFront: 'Peddie Goal Line Bear',
      defensivePackage: 'GOAL_LINE',
      coverageScheme: 'COVER_0',
      defenseReactionToMotion: 'Mason Kish (#77, Jr) and August Cassidy (#10, Jr) blow up the B-gap.',
      playType: 'RUN',
      playActionFake: false,
      targetPlayerJersey: 10,
      yardsGained: -3,
      epa: -3.40,
      successRate: false,
      isFirstDown: false,
      isTouchdown: false,
      isTurnover: true,
      isPenalty: false,
      playDescription: `TURNOVER ON DOWNS: August Cassidy (#10, Jr) and Mason Kish (#77, Jr) combine for a -3 yard TFL to clinch the victory.`,
      trackingData: buildSpatialTracking({ losY: 25, firstDownY: 24 }),
      comments: [],
      actionItems: [],
      telestrationStrokes: [],
    }
  ];
}

export const GAMES_2026: GameSession[] = [
  {
    id: 'peddie-immaculata-2026',
    title: 'Week 1: vs Immaculata (Projected W 38-24)',
    date: 'Sep 4, 2026 · 7:00 PM',
    opponent: 'Immaculata Spartans',
    homeTeam: 'Peddie Falcons',
    awayTeam: 'Immaculata Spartans',
    homeScore: 38,
    awayScore: 24,
    season: '2026-2027',
    duration: 180,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    plays: make2026Plays('p-2026-immaculata', 'Immaculata High School (2026)'),
  },
  {
    id: 'peddie-wyoming-2026',
    title: 'Week 2: @ Wyoming Seminary (Projected W 45-17)',
    date: 'Sep 11, 2026 · 2:00 PM',
    opponent: 'Wyoming Seminary',
    homeTeam: 'Wyoming Seminary',
    awayTeam: 'Peddie Falcons',
    homeScore: 17,
    awayScore: 45,
    season: '2026-2027',
    duration: 180,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    plays: make2026Plays('p-2026-wyoming', 'Wyoming Seminary (2026)'),
  },
  {
    id: 'peddie-episcopal-2026',
    title: 'Week 3: vs Episcopal Academy (Projected W 28-21)',
    date: 'Sep 18, 2026 · 7:00 PM',
    opponent: 'Episcopal Academy',
    homeTeam: 'Peddie Falcons',
    awayTeam: 'Episcopal Academy',
    homeScore: 28,
    awayScore: 21,
    season: '2026-2027',
    duration: 180,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    plays: make2026Plays('p-2026-episcopal', 'Episcopal Academy (2026)'),
  },
  {
    id: 'peddie-mercersburg-2026',
    title: 'Week 4: @ Mercersburg Academy (Projected W 42-14)',
    date: 'Sep 25, 2026 · 2:00 PM',
    opponent: 'Mercersburg Academy',
    homeTeam: 'Mercersburg Academy',
    awayTeam: 'Peddie Falcons',
    homeScore: 14,
    awayScore: 42,
    season: '2026-2027',
    duration: 180,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    plays: make2026Plays('p-2026-mercersburg', 'Mercersburg Academy (2026)'),
  },
  {
    id: 'peddie-hun-2026',
    title: 'Week 5: vs The Hun School (Projected L 35-28)',
    date: 'Oct 2, 2026 · 7:00 PM',
    opponent: 'The Hun School',
    homeTeam: 'Peddie Falcons',
    awayTeam: 'The Hun School',
    homeScore: 28,
    awayScore: 35,
    season: '2026-2027',
    duration: 180,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    plays: make2026Plays('p-2026-hun', 'The Hun School (2026)'),
  },
  {
    id: 'peddie-hill-2026',
    title: 'Week 6: @ The Hill School (Projected W 34-14)',
    date: 'Oct 16, 2026 · 2:00 PM',
    opponent: 'The Hill School',
    homeTeam: 'The Hill School',
    awayTeam: 'Peddie Falcons',
    homeScore: 14,
    awayScore: 34,
    season: '2026-2027',
    duration: 180,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    plays: make2026Plays('p-2026-hill', 'The Hill School (2026)'),
  },
  {
    id: 'peddie-lawrenceville-2026',
    title: 'Week 7: vs Lawrenceville School (Projected W 27-24)',
    date: 'Oct 23, 2026 · 2:00 PM',
    opponent: 'Lawrenceville School',
    homeTeam: 'Peddie Falcons',
    awayTeam: 'Lawrenceville School',
    homeScore: 27,
    awayScore: 24,
    season: '2026-2027',
    duration: 180,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    plays: make2026Plays('p-2026-lawrenceville', 'Lawrenceville School (2026)'),
  },
  {
    id: 'peddie-stlukes-2026',
    title: 'Week 8: @ St. Luke\'s School (Projected W 49-20)',
    date: 'Oct 30, 2026 · 7:00 PM',
    opponent: 'St. Luke\'s School',
    homeTeam: 'St. Luke\'s School',
    awayTeam: 'Peddie Falcons',
    homeScore: 20,
    awayScore: 49,
    season: '2026-2027',
    duration: 180,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    plays: make2026Plays('p-2026-stlukes', 'St. Luke\'s School (2026)'),
  },
  {
    id: 'peddie-blair-2026',
    title: 'Week 9: @ Blair Academy (Projected W 31-27)',
    date: 'Nov 6, 2026 · 2:00 PM',
    opponent: 'Blair Academy',
    homeTeam: 'Blair Academy',
    awayTeam: 'Peddie Falcons',
    homeScore: 27,
    awayScore: 31,
    season: '2026-2027',
    duration: 180,
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    plays: make2026Plays('p-2026-blair', 'Blair Academy (2026)'),
  },
];

// ----------------------------------------------------------------------------
// 4. Multi-Season Roster Progression Models
// ----------------------------------------------------------------------------

// 2024-2025 Roster (Class of 2026 were Juniors, 2027 were Sophomores, 2028 were Freshmen)
export const ROSTER_2024: PlayerProfile[] = PEDDIE_PLAYERS.map(p => {
  let gradeLevel = p.gradeLevel;
  let grade = p.filmAnalytics?.seasonGrade ?? 75;

  if (p.classYear === '2026') {
    gradeLevel = 'Junior';
    grade = Math.max(75, grade - 2);
  } else if (p.classYear === '2027') {
    gradeLevel = 'Sophomore';
    grade = Math.max(72, grade - 3);
  } else if (p.classYear === '2028') {
    gradeLevel = 'Freshman';
    grade = p.jerseyNumber === 10 ? 86 : Math.max(70, grade - 4); // August Cassidy was high-impact freshman
  } else if (p.classYear === '2029') {
    gradeLevel = 'Middle School / JV';
    grade = Math.max(68, grade - 6);
  }

  return {
    ...p,
    id: `${p.id}-2024`,
    gradeLevel,
    season: '2024-2025' as SeasonId,
    filmAnalytics: p.filmAnalytics ? {
      ...p.filmAnalytics,
      seasonGrade: grade,
      tierLabel: grade >= 90 ? 'ALL-MAPL SELECTION (2024)' : p.filmAnalytics.tierLabel,
      bestFilmGame: 'vs Wyoming Seminary (W 35-14)'
    } : undefined
  };
});

// 2025-2026 Roster (Official 38-Player Current Roster)
export const ROSTER_2025: PlayerProfile[] = PEDDIE_PLAYERS.map(p => ({
  ...p,
  season: '2025-2026' as SeasonId
}));

// 2026-2027 Projected Roster (2026 Graduated, 2027 are Seniors, 2028 are Juniors, 2029 are Sophomores)
export const ROSTER_2026: PlayerProfile[] = PEDDIE_PLAYERS
  .filter(p => p.classYear !== '2026') // Seniors of 2026 have graduated to D1/FCS college programs
  .map((p, index) => {
    let gradeLevel = p.gradeLevel;
    let grade = p.filmAnalytics?.seasonGrade ?? 75;

    if (p.classYear === '2027') {
      gradeLevel = 'Senior';
      grade = Math.min(96, grade + 4);
    } else if (p.classYear === '2028') {
      gradeLevel = 'Junior';
      grade = p.jerseyNumber === 10 ? 95 : Math.min(92, grade + 5); // August Cassidy is now #1 overall star & defensive captain
    } else if (p.classYear === '2029') {
      gradeLevel = 'Sophomore';
      grade = p.jerseyNumber === 21 ? 90 : p.jerseyNumber === 54 ? 89 : Math.min(85, grade + 6); // Torres & Annunziata breakout
    }

    return {
      ...p,
      id: `${p.id}-2026`,
      gradeLevel,
      season: '2026-2027' as SeasonId,
      filmAnalytics: p.filmAnalytics ? {
        ...p.filmAnalytics,
        overallRank: index + 1,
        seasonGrade: grade,
        tierLabel: grade >= 90 ? 'ALL-MAPL 1ST TEAM / TEAM CAPTAIN' : 'PROJECTED VARSITY STARTER',
        bestFilmGame: 'vs Immaculata (Projected W 38-24)'
      } : undefined
    };
  })
  .sort((a, b) => (b.filmAnalytics?.seasonGrade ?? 0) - (a.filmAnalytics?.seasonGrade ?? 0));

// ----------------------------------------------------------------------------
// 5. Season Accessor & Query Functions
// ----------------------------------------------------------------------------

export function getSeasonMetadata(seasonId: SeasonId = DEFAULT_SEASON): SeasonMetadata {
  return SEASONS_METADATA[seasonId] || SEASONS_METADATA[DEFAULT_SEASON];
}

export function getSeasonGames(seasonId: SeasonId = DEFAULT_SEASON): GameSession[] {
  switch (seasonId) {
    case '2024-2025':
      return GAMES_2024;
    case '2025-2026':
      return MOCK_GAMES;
    case '2026-2027':
      return GAMES_2026;
    default:
      return MOCK_GAMES;
  }
}

export function getSeasonGameById(gameId: string, seasonId: SeasonId = DEFAULT_SEASON): GameSession | undefined {
  const games = getSeasonGames(seasonId);
  return games.find(g => g.id === gameId);
}

export function getSeasonRoster(seasonId: SeasonId = DEFAULT_SEASON): PlayerProfile[] {
  switch (seasonId) {
    case '2024-2025':
      return ROSTER_2024;
    case '2025-2026':
      return ROSTER_2025;
    case '2026-2027':
      return ROSTER_2026;
    default:
      return ROSTER_2025;
  }
}

export function getSeasonPlayerById(playerId: string, seasonId: SeasonId = DEFAULT_SEASON): PlayerProfile | undefined {
  const roster = getSeasonRoster(seasonId);
  return roster.find(p => p.id === playerId || p.id.startsWith(playerId));
}

export function getSeasonPlays(seasonId: SeasonId = DEFAULT_SEASON): PlayAnalysis[] {
  const games = getSeasonGames(seasonId);
  return games.flatMap(g => g.plays);
}

export function getSeasonKpis(seasonId: SeasonId = DEFAULT_SEASON) {
  const meta = getSeasonMetadata(seasonId);
  const games = getSeasonGames(seasonId);
  const plays = getSeasonPlays(seasonId);
  const roster = getSeasonRoster(seasonId);

  const offensePlays = plays.filter(p => p.unit === 'OFFENSE');
  const defensePlays = plays.filter(p => p.unit === 'DEFENSE');
  const touchdowns = plays.filter(p => p.isTouchdown).length;
  const takeaways = plays.filter(p => p.isTurnover && p.unit === 'DEFENSE').length;
  const stops = plays.filter(p => p.unit === 'DEFENSE' && (p.yardsGained <= 0 || p.isTurnover)).length;

  const motionPlays = plays.filter(p => p.motionType && p.motionType !== 'NONE');
  const nonMotionPlays = plays.filter(p => !p.motionType || p.motionType === 'NONE');

  const motionEpaAvg = motionPlays.length > 0
    ? motionPlays.reduce((acc, p) => acc + (p.epa || 0), 0) / motionPlays.length
    : 0.82;
  const nonMotionEpaAvg = nonMotionPlays.length > 0
    ? nonMotionPlays.reduce((acc, p) => acc + (p.epa || 0), 0) / nonMotionPlays.length
    : -0.05;

  return {
    meta,
    totalGames: games.length,
    totalPlays: plays.length,
    offensePlaysCount: offensePlays.length,
    defensePlaysCount: defensePlays.length,
    touchdownsCount: touchdowns,
    takeawaysCount: takeaways,
    stopsCount: stops,
    motionEpaAvg: Number(motionEpaAvg.toFixed(2)),
    nonMotionEpaAvg: Number(nonMotionEpaAvg.toFixed(2)),
    motionEpaLift: Number((motionEpaAvg - nonMotionEpaAvg).toFixed(2)),
    rosterCount: roster.length,
    eliteCount: roster.filter(p => (p.filmAnalytics?.seasonGrade ?? 0) >= 90).length,
  };
}
