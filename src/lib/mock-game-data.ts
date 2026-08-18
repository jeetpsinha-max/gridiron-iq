// ============================================================================
// GridironIQ — 2025–2026 Peddie School Falcons Football (Hudl Edition)
// Comprehensive Roster, 2025–2026 Game Sessions, 22-Player Tracking (O's vs X's) & HUD Telemetry
// ============================================================================

import {
  GameSession, PlayAnalysis, UserMention, CoachingActionItem,
  PlayComment, TeamBoxScore, DriveInfo, PlayTrackingData, TrackedPlayer,
  Notification, FieldHeatmapPoint
} from '@/types/football';

// ============================================================================
// 1. Peddie School Falcons Varsity Coaching Staff & Roster (2025–2026 Season)
// ============================================================================

export const TEAM_ROSTER: UserMention[] = [
  // Coaching Staff
  { id: 'coach-fabish', name: 'Mark Fabish', role: 'COACH', position: 'Head Coach' },
  { id: 'coach-oc', name: 'Dan O\'Neill', role: 'COORDINATOR', position: 'Offensive Coordinator / QBs' },
  { id: 'coach-dc', name: 'Marcus Vance', role: 'COORDINATOR', position: 'Defensive Coordinator / LBs' },
  { id: 'coach-ol', name: 'Frank Reynolds', role: 'COACH', position: 'Offensive Line Coach' },
  
  // 2025–2026 Active Varsity Athletes
  { id: 'player-5', name: 'Lorenzo Barone', role: 'PLAYER', jerseyNumber: 5, position: 'WR / Returner (Sr, 2026)' },
  { id: 'player-55', name: 'Jayden Williams', role: 'PLAYER', jerseyNumber: 55, position: 'DE / EDGE (Sr, 2026)' },
  { id: 'player-8', name: 'Ari Miller', role: 'PLAYER', jerseyNumber: 8, position: 'TE / Flex WR (Sr, 2026)' },
  { id: 'player-6', name: 'Joseph Gaston', role: 'PLAYER', jerseyNumber: 6, position: 'ATH (QB/WR/CB) (Sr, 2026)' },
  { id: 'player-9', name: 'Griffin Brennan', role: 'PLAYER', jerseyNumber: 9, position: 'QB1 (Jr, 2027)' },
  { id: 'player-22', name: 'Benjamin Perkins', role: 'PLAYER', jerseyNumber: 22, position: 'RB1 (So, 2028)' },
  { id: 'player-70', name: 'Mason Kish', role: 'PLAYER', jerseyNumber: 70, position: 'DT1 (So, 2028)' },
  { id: 'player-15', name: 'Jonathan Stizza', role: 'PLAYER', jerseyNumber: 15, position: 'FS1 (Jr, 2027)' },
  { id: 'player-56', name: 'Nick Famularo', role: 'PLAYER', jerseyNumber: 56, position: 'G1 / LB (Jr, 2027)' },
  { id: 'player-68', name: 'Michael Ogbutor', role: 'PLAYER', jerseyNumber: 68, position: 'OT1 (So, 2028)' },
  { id: 'player-16', name: 'Griffin Suthammanont', role: 'PLAYER', jerseyNumber: 16, position: 'WR (Jr, 2027)' },
  { id: 'player-19', name: 'Aaron (Jihoon) Lee', role: 'PLAYER', jerseyNumber: 19, position: 'CB (Jr, 2027)' },
  { id: 'player-36', name: 'Mason McGovern', role: 'PLAYER', jerseyNumber: 36, position: 'MLB (So, 2028)' },
  { id: 'player-32', name: 'Bryce Layade', role: 'PLAYER', jerseyNumber: 32, position: 'OLB (So, 2028)' },
  { id: 'player-21', name: 'Ardanley Then', role: 'PLAYER', jerseyNumber: 21, position: 'CB (Jr, 2027)' },
];

export const CURRENT_USER: UserMention = TEAM_ROSTER[0]; // Coach Mark Fabish

export function findUser(id: string): UserMention {
  return TEAM_ROSTER.find(u => u.id === id) ?? TEAM_ROSTER[0];
}

// Helper to generate full 22-player tracking coordinates (11 O's and 11 X's) for 2025–2026 plays
function buildPeddieTrackingData({
  losY = 65,
  firstDownY = 55,
  motionJersey = 5,
  motionStartX = 85,
  motionEndX = 45,
  targetJersey = 5,
  passTargetX = 50,
  passTargetY = 48,
  ballCarrierJersey = 9,
  playConcept = 'Peddie 2025–2026 Motion Concept'
}: {
  losY?: number;
  firstDownY?: number;
  motionJersey?: number;
  motionStartX?: number;
  motionEndX?: number;
  targetJersey?: number;
  passTargetX?: number;
  passTargetY?: number;
  ballCarrierJersey?: number;
  playConcept?: string;
}): PlayTrackingData {
  // 11 Offense Players (O's - 2025–2026 Peddie School Falcons)
  const offense: TrackedPlayer[] = [
    {
      id: 'o-qb', side: 'OFFENSE', jerseyNumber: 9, name: 'Griffin Brennan', position: 'QB',
      trajectory: {
        preSnap: { x: 50, y: losY + 5.5 },
        motion: { x: 50, y: losY + 5.5 },
        snap: { x: 50, y: losY + 8 },
        postSnap: { x: 48, y: losY + 9 }
      },
      vectorLabel: '5-Step Dropback & Read'
    },
    {
      id: 'o-rb', side: 'OFFENSE', jerseyNumber: 22, name: 'Benjamin Perkins', position: 'RB',
      trajectory: {
        preSnap: { x: 44, y: losY + 6 },
        motion: { x: 44, y: losY + 6 },
        snap: { x: 46, y: losY + 4 },
        postSnap: { x: 38, y: losY - 2 }
      },
      vectorLabel: 'Outside Zone Mesh'
    },
    {
      id: 'o-wr1', side: 'OFFENSE', jerseyNumber: 5, name: 'Lorenzo Barone', position: 'WR',
      trajectory: {
        preSnap: { x: motionStartX, y: losY + 1 },
        motion: { x: motionEndX, y: losY + 4.5 },
        snap: { x: motionEndX - 5, y: losY + 3 },
        postSnap: { x: passTargetX, y: passTargetY }
      },
      vectorLabel: 'Jet Sweep / Mesh Separation'
    },
    {
      id: 'o-wr2', side: 'OFFENSE', jerseyNumber: 16, name: 'Griffin Suthammanont', position: 'WR',
      trajectory: {
        preSnap: { x: 16, y: losY + 1 },
        motion: { x: 16, y: losY + 1 },
        snap: { x: 18, y: losY - 4 },
        postSnap: { x: 28, y: losY - 12 }
      },
      vectorLabel: '12-yd Dig In'
    },
    {
      id: 'o-te', side: 'OFFENSE', jerseyNumber: 8, name: 'Ari Miller', position: 'TE',
      trajectory: {
        preSnap: { x: 68, y: losY + 1.5 },
        motion: { x: 68, y: losY + 1.5 },
        snap: { x: 66, y: losY - 3 },
        postSnap: { x: 60, y: losY - 14 }
      },
      vectorLabel: 'Y-Cross Seam'
    },
    {
      id: 'o-wr3', side: 'OFFENSE', jerseyNumber: 6, name: 'Joseph Gaston', position: 'WR',
      trajectory: {
        preSnap: { x: 84, y: losY + 2 },
        motion: { x: 84, y: losY + 2 },
        snap: { x: 82, y: losY - 5 },
        postSnap: { x: 80, y: losY - 18 }
      },
      vectorLabel: 'Go Route / Clearout'
    },
    // Offensive Line
    {
      id: 'o-lt', side: 'OFFENSE', jerseyNumber: 68, name: 'Michael Ogbutor', position: 'OT',
      trajectory: { preSnap: { x: 38, y: losY }, snap: { x: 37, y: losY + 1.5 }, postSnap: { x: 36, y: losY + 2 } },
      vectorLabel: 'Pass Pro Kick-Slide'
    },
    {
      id: 'o-lg', side: 'OFFENSE', jerseyNumber: 56, name: 'Nick Famularo', position: 'G',
      trajectory: { preSnap: { x: 44, y: losY }, snap: { x: 44, y: losY + 1 }, postSnap: { x: 43, y: losY + 1.5 } },
      vectorLabel: 'Interior Anchor'
    },
    {
      id: 'o-c', side: 'OFFENSE', jerseyNumber: 50, name: 'Peddie Center', position: 'C',
      trajectory: { preSnap: { x: 50, y: losY }, snap: { x: 50, y: losY + 0.5 }, postSnap: { x: 50, y: losY + 1 } },
      vectorLabel: 'Shotgun Snap & Post'
    },
    {
      id: 'o-rg', side: 'OFFENSE', jerseyNumber: 58, name: 'Peddie RG', position: 'G',
      trajectory: { preSnap: { x: 56, y: losY }, snap: { x: 56, y: losY + 1 }, postSnap: { x: 57, y: losY + 1.5 } },
      vectorLabel: 'Pass Pro Anchor'
    },
    {
      id: 'o-rt', side: 'OFFENSE', jerseyNumber: 74, name: 'Peddie RT', position: 'OT',
      trajectory: { preSnap: { x: 62, y: losY }, snap: { x: 63, y: losY + 1.5 }, postSnap: { x: 64, y: losY + 2 } },
      vectorLabel: 'Edge Pass Set'
    },
  ];

  // 11 Defense Players (X's - Opponent Defense)
  const defense: TrackedPlayer[] = [
    {
      id: 'd-1', side: 'DEFENSE', jerseyNumber: 90, name: 'Opp DE', position: 'DE',
      trajectory: { preSnap: { x: 38, y: losY - 1.5 }, snap: { x: 39, y: losY }, postSnap: { x: 42, y: losY + 3 } },
      vectorLabel: 'Speed Rush Off Edge'
    },
    {
      id: 'd-2', side: 'DEFENSE', jerseyNumber: 95, name: 'Opp DT', position: 'DT',
      trajectory: { preSnap: { x: 47, y: losY - 1.5 }, snap: { x: 48, y: losY }, postSnap: { x: 49, y: losY + 1 } },
      vectorLabel: 'A-Gap Bull Rush'
    },
    {
      id: 'd-3', side: 'DEFENSE', jerseyNumber: 99, name: 'Opp NT', position: 'NT',
      trajectory: { preSnap: { x: 53, y: losY - 1.5 }, snap: { x: 52, y: losY }, postSnap: { x: 51, y: losY + 1 } },
      vectorLabel: 'Double Team Hold'
    },
    {
      id: 'd-4', side: 'DEFENSE', jerseyNumber: 92, name: 'Opp DE', position: 'DE',
      trajectory: { preSnap: { x: 62, y: losY - 1.5 }, snap: { x: 61, y: losY }, postSnap: { x: 58, y: losY + 3 } },
      vectorLabel: 'Contain Rush'
    },
    {
      id: 'd-5', side: 'DEFENSE', jerseyNumber: 52, name: 'Opp MLB', position: 'MLB',
      trajectory: { preSnap: { x: 50, y: losY - 5 }, snap: { x: 49, y: losY - 4 }, postSnap: { x: 52, y: losY - 3 } },
      vectorLabel: 'Hook/Curl Zone Drop'
    },
    {
      id: 'd-6', side: 'DEFENSE', jerseyNumber: 44, name: 'Opp WLB', position: 'WLB',
      trajectory: { preSnap: { x: 35, y: losY - 5 }, snap: { x: 34, y: losY - 4 }, postSnap: { x: 30, y: losY - 5 } },
      vectorLabel: 'Flat Coverage Roll'
    },
    {
      id: 'd-7', side: 'DEFENSE', jerseyNumber: 48, name: 'Opp SLB', position: 'SLB',
      trajectory: { preSnap: { x: 65, y: losY - 4.5 }, snap: { x: 64, y: losY - 3.5 }, postSnap: { x: 68, y: losY - 5 } },
      vectorLabel: 'Curl Zone Drop'
    },
    {
      id: 'd-8', side: 'DEFENSE', jerseyNumber: 21, name: 'Opp CB1', position: 'CB',
      trajectory: { preSnap: { x: 14, y: losY - 7 }, snap: { x: 14, y: losY - 8 }, postSnap: { x: 18, y: losY - 14 } },
      vectorLabel: 'Deep 1/3 Third Zone'
    },
    {
      id: 'd-9', side: 'DEFENSE', jerseyNumber: 24, name: 'Opp CB2', position: 'CB',
      trajectory: { preSnap: { x: 86, y: losY - 7 }, snap: { x: 84, y: losY - 8 }, postSnap: { x: 80, y: losY - 15 } },
      vectorLabel: 'Deep 1/3 Third Zone'
    },
    {
      id: 'd-10', side: 'DEFENSE', jerseyNumber: 31, name: 'Opp FS', position: 'FS',
      trajectory: { preSnap: { x: 50, y: losY - 14 }, snap: { x: 50, y: losY - 15 }, postSnap: { x: 48, y: losY - 18 } },
      vectorLabel: 'Middle 1/3 Safety Anchor'
    },
    {
      id: 'd-11', side: 'DEFENSE', jerseyNumber: 33, name: 'Opp SS', position: 'SS',
      trajectory: {
        preSnap: { x: 68, y: losY - 10 },
        snap: { x: 62, y: losY - 8 },
        postSnap: { x: 58, y: losY - 12 }
      },
      vectorLabel: 'Motion Triggered Safety Roll'
    },
  ];

  return {
    offense,
    defense,
    lineOfScrimmageY: losY,
    firstDownY,
    playConceptName: playConcept,
  };
}

// ============================================================================
// 2. Peddie vs Blair Academy (Nov 8, 2025 · 122nd Annual Rivalry Classic)
// ============================================================================

const PEDDIE_BLAIR_PLAYS: PlayAnalysis[] = [
  {
    id: 'pb-play-1',
    gameId: 'peddie-blair-2025',
    playNumber: 1,
    quarter: 1,
    gameClock: '14:52',
    videoTimestampStart: 12,
    videoTimestampMotion: 14,
    videoTimestampSnap: 17,
    videoTimestampEnd: 23,
    down: 1,
    distance: 10,
    yardLine: 35,
    hash: 'MIDDLE',
    offensiveFormation: 'Peddie Shotgun 11 Spread Trips Left',
    offensivePersonnel: '11',
    motionType: 'JET_SWEEP',
    motionDirection: 'LEFT',
    motionPlayerJersey: 5,
    blockingScheme: 'INSIDE_ZONE',
    routeConcept: 'MESH',
    defensiveFront: 'Blair 4-3 Over',
    defensivePackage: '4-3',
    coverageScheme: 'COVER_3',
    defenseReactionToMotion: 'Safety #33 rolls down to Robber; CB #24 trails 4 yards inside.',
    playType: 'PASS',
    playActionFake: true,
    targetPlayerJersey: 5,
    yardsGained: 18,
    epa: 1.62,
    successRate: true,
    isFirstDown: true,
    isTouchdown: false,
    isTurnover: false,
    isPenalty: false,
    playDescription: 'Griffin Brennan executes jet fake to Lorenzo Barone, reads single-high safety roll, and hits Barone on the seam wheel for 18 yards.',
    trackingData: buildPeddieTrackingData({
      losY: 65, firstDownY: 55, motionJersey: 5, motionStartX: 85, motionEndX: 45,
      targetJersey: 5, passTargetX: 42, passTargetY: 47,
      playConcept: 'Peddie Jet Fake Seam Wheel vs Blair Cover 3'
    }),
    comments: [
      {
        id: 'c-1',
        playId: 'pb-play-1',
        timestamp: 16,
        author: TEAM_ROSTER[0],
        text: 'Excellent jet motion timing by @#5_Barone. Forced Blair safety into boundary box, opening the soft middle for QB @#9_Brennan.',
        mentions: [TEAM_ROSTER[4], TEAM_ROSTER[8]],
        createdAt: '2025-11-08T14:32:00Z',
      }
    ],
    actionItems: [
      {
        id: 'act-1',
        playId: 'pb-play-1',
        gameId: 'peddie-blair-2025',
        title: 'Maintain 4.45 speed cadence on Jet Motion',
        description: 'Keep motion depth at precisely 4 yards behind the mesh point to preserve play-action sightlines for Griffin Brennan.',
        assignedTo: TEAM_ROSTER[4],
        assignedBy: TEAM_ROSTER[0],
        priority: 'MEDIUM',
        status: 'RESOLVED',
        videoTimestamp: 15,
        createdAt: '2025-11-08T14:35:00Z',
        updatedAt: '2025-11-08T16:00:00Z',
      }
    ],
    telestrationStrokes: [],
  },
  {
    id: 'pb-play-2',
    gameId: 'peddie-blair-2025',
    playNumber: 2,
    quarter: 1,
    gameClock: '13:10',
    videoTimestampStart: 34,
    videoTimestampMotion: 36,
    videoTimestampSnap: 39,
    videoTimestampEnd: 46,
    down: 2,
    distance: 2,
    yardLine: 47,
    hash: 'LEFT',
    offensiveFormation: 'Peddie Pistol 12 Heavy Strong Right',
    offensivePersonnel: '12',
    motionType: 'ORBIT',
    motionDirection: 'RIGHT',
    motionPlayerJersey: 8,
    blockingScheme: 'GAP_POWER',
    routeConcept: 'MESH',
    defensiveFront: 'Blair 5-2 Goal-Line Tight',
    defensivePackage: 'GOAL_LINE',
    coverageScheme: 'COVER_1',
    defenseReactionToMotion: 'LB #44 bumps out 3 yards; DE #90 widens contain alignment.',
    playType: 'RUN',
    playActionFake: false,
    targetPlayerJersey: 22,
    yardsGained: 12,
    epa: 1.35,
    successRate: true,
    isFirstDown: true,
    isTouchdown: false,
    isTurnover: false,
    isPenalty: false,
    playDescription: 'Benjamin Perkins takes the handoff behind pulling guard Nick Famularo, cuts off Ari Miller\'s seal block, and bursts 12 yards into Blair territory.',
    trackingData: buildPeddieTrackingData({
      losY: 53, firstDownY: 51, motionJersey: 8, motionStartX: 35, motionEndX: 75,
      ballCarrierJersey: 22,
      playConcept: 'Peddie TE Orbit Power Run vs Blair 5-2'
    }),
    comments: [
      {
        id: 'c-2',
        playId: 'pb-play-2',
        timestamp: 41,
        author: TEAM_ROSTER[1],
        text: 'Dominant seal block by @#8_Miller and pulling punch from @#56_Famularo. Textbook gap control.',
        mentions: [TEAM_ROSTER[6], TEAM_ROSTER[12]],
        createdAt: '2025-11-08T14:40:00Z',
      }
    ],
    actionItems: [],
    telestrationStrokes: [],
  },
  {
    id: 'pb-play-3',
    gameId: 'peddie-blair-2025',
    playNumber: 3,
    quarter: 2,
    gameClock: '08:45',
    videoTimestampStart: 58,
    videoTimestampMotion: 60,
    videoTimestampSnap: 64,
    videoTimestampEnd: 72,
    down: 3,
    distance: 6,
    yardLine: 35,
    hash: 'RIGHT',
    offensiveFormation: 'Peddie Empty 5-Wide Quads Right',
    offensivePersonnel: '10',
    motionType: 'FLY',
    motionDirection: 'RIGHT',
    motionPlayerJersey: 5,
    blockingScheme: 'PASS_PRO',
    routeConcept: 'DAGGER',
    defensiveFront: 'Blair Dime 3-2-6 Blitz Look',
    defensivePackage: 'DIME',
    coverageScheme: 'COVER_2',
    defenseReactionToMotion: 'Blair blitzes Nickel corner; Free Safety #31 slides toward boundary hash.',
    playType: 'PASS',
    playActionFake: false,
    targetPlayerJersey: 8,
    yardsGained: 24,
    epa: 2.18,
    successRate: true,
    isFirstDown: true,
    isTouchdown: false,
    isTurnover: false,
    isPenalty: false,
    playDescription: 'Griffin Brennan stands tall against a 6-man blitz and rips a 24-yard dagger post to tight end Ari Miller down to the Blair 11-yard line.',
    trackingData: buildPeddieTrackingData({
      losY: 65, firstDownY: 59, motionJersey: 5, motionStartX: 20, motionEndX: 80,
      targetJersey: 8, passTargetX: 52, passTargetY: 41,
      playConcept: 'Peddie Empty Fly Dagger vs Blair Dime Blitz'
    }),
    comments: [
      {
        id: 'c-3',
        playId: 'pb-play-3',
        timestamp: 66,
        author: TEAM_ROSTER[0],
        text: 'Poise in the pocket by @#9_Brennan against blitz pressure. @#8_Miller caught it in the honey-hole.',
        mentions: [TEAM_ROSTER[8], TEAM_ROSTER[6]],
        createdAt: '2025-11-08T15:10:00Z',
      }
    ],
    actionItems: [],
    telestrationStrokes: [],
  },
  {
    id: 'pb-play-4',
    gameId: 'peddie-blair-2025',
    playNumber: 4,
    quarter: 3,
    gameClock: '04:12',
    videoTimestampStart: 82,
    videoTimestampMotion: 84,
    videoTimestampSnap: 87,
    videoTimestampEnd: 95,
    down: 1,
    distance: 10,
    yardLine: 28,
    hash: 'MIDDLE',
    offensiveFormation: 'Peddie Wildcat Heavy Slot Right',
    offensivePersonnel: '12',
    motionType: 'RETURN',
    motionDirection: 'RIGHT',
    motionPlayerJersey: 6,
    blockingScheme: 'GAP_COUNTER',
    routeConcept: 'FOUR_VERTS',
    defensiveFront: 'Blair 4-4 Stack',
    defensivePackage: '4-3',
    coverageScheme: 'COVER_0',
    defenseReactionToMotion: 'Blair bites hard on Joseph Gaston direct fake; entire LB corps flows left.',
    playType: 'PASS',
    playActionFake: true,
    targetPlayerJersey: 5,
    yardsGained: 28,
    epa: 2.85,
    successRate: true,
    isFirstDown: true,
    isTouchdown: true,
    isTurnover: false,
    isPenalty: false,
    playDescription: 'Joseph Gaston takes the direct snap in the Wildcat, fakes the counter run, and lofts a 28-yard TOUCHDOWN to Lorenzo Barone in the corner of the end zone.',
    trackingData: buildPeddieTrackingData({
      losY: 28, firstDownY: 18, motionJersey: 6, motionStartX: 50, motionEndX: 70,
      targetJersey: 5, passTargetX: 82, passTargetY: 0,
      playConcept: 'Peddie Wildcat Jump Pass Touchdown'
    }),
    comments: [
      {
        id: 'c-4',
        playId: 'pb-play-4',
        timestamp: 89,
        author: TEAM_ROSTER[1],
        text: 'Masterclass execution by @#6_Gaston on the jump pass and @#5_Barone high-pointing the ball.',
        mentions: [TEAM_ROSTER[7], TEAM_ROSTER[4]],
        createdAt: '2025-11-08T15:45:00Z',
      }
    ],
    actionItems: [],
    telestrationStrokes: [],
  },
  {
    id: 'pb-play-5',
    gameId: 'peddie-blair-2025',
    playNumber: 5,
    quarter: 4,
    gameClock: '10:05',
    videoTimestampStart: 105,
    videoTimestampMotion: 107,
    videoTimestampSnap: 110,
    videoTimestampEnd: 116,
    down: 2,
    distance: 8,
    yardLine: 45,
    hash: 'LEFT',
    offensiveFormation: 'Blair Shotgun Bunch Right',
    offensivePersonnel: '11',
    motionType: 'NONE',
    blockingScheme: 'PASS_PRO',
    routeConcept: 'POST_WHEEL',
    defensiveFront: 'Peddie 4-2-5 Nickel',
    defensivePackage: 'NICKEL',
    coverageScheme: 'COVER_3',
    defenseReactionToMotion: 'Jayden Williams beats offensive tackle with 4.62 burst; Mason Kish collapses pocket.',
    playType: 'PASS',
    playActionFake: false,
    targetPlayerJersey: 55,
    yardsGained: -9,
    epa: -1.95,
    successRate: false,
    isFirstDown: false,
    isTouchdown: false,
    isTurnover: false,
    isPenalty: false,
    playDescription: 'DEFENSIVE HIGHLIGHT: Senior 4-star DE Jayden Williams explodes off the edge for a 9-yard sack on 2nd down, forcing a Blair punt.',
    trackingData: buildPeddieTrackingData({
      losY: 45, firstDownY: 37,
      ballCarrierJersey: 55,
      playConcept: 'Peddie Jayden Williams Edge Sack'
    }),
    comments: [
      {
        id: 'c-5',
        playId: 'pb-play-5',
        timestamp: 112,
        author: TEAM_ROSTER[2],
        text: 'Elite get-off from @#55_Williams and interior push from @#70_Kish. That is D1 pass rush.',
        mentions: [TEAM_ROSTER[5], TEAM_ROSTER[10]],
        createdAt: '2025-11-08T16:15:00Z',
      }
    ],
    actionItems: [],
    telestrationStrokes: [],
  }
];

// ============================================================================
// 3. Peddie @ St. Luke's (Nov 1, 2025 · W 53–21 Season-High Victory)
// ============================================================================

const PEDDIE_STLUKES_PLAYS: PlayAnalysis[] = [
  {
    id: 'psl-play-1',
    gameId: 'peddie-stlukes-2025',
    playNumber: 1,
    quarter: 1,
    gameClock: '12:30',
    videoTimestampStart: 10,
    videoTimestampMotion: 12,
    videoTimestampSnap: 15,
    videoTimestampEnd: 22,
    down: 1,
    distance: 10,
    yardLine: 40,
    hash: 'MIDDLE',
    offensiveFormation: 'Peddie 11 Spread Gun',
    offensivePersonnel: '11',
    motionType: 'JET_SWEEP',
    motionDirection: 'RIGHT',
    motionPlayerJersey: 5,
    blockingScheme: 'OUTSIDE_ZONE',
    routeConcept: 'SLANT_FLAT',
    defensiveFront: 'St. Luke\'s 3-4',
    defensivePackage: '3-4',
    coverageScheme: 'COVER_2',
    defenseReactionToMotion: 'Cornerback #22 trails jet motion 5 yards inside.',
    playType: 'PASS',
    playActionFake: true,
    targetPlayerJersey: 5,
    yardsGained: 35,
    epa: 2.45,
    successRate: true,
    isFirstDown: true,
    isTouchdown: false,
    isTurnover: false,
    isPenalty: false,
    playDescription: 'Griffin Brennan connects with Lorenzo Barone on a 35-yard deep post off jet motion action.',
    trackingData: buildPeddieTrackingData({
      losY: 60, firstDownY: 50, motionJersey: 5, motionStartX: 15, motionEndX: 75,
      targetJersey: 5, passTargetX: 72, passTargetY: 25,
      playConcept: 'Peddie Jet Motion Post vs St. Luke\'s Cover 2'
    }),
    comments: [],
    actionItems: [],
    telestrationStrokes: [],
  },
  {
    id: 'psl-play-2',
    gameId: 'peddie-stlukes-2025',
    playNumber: 2,
    quarter: 2,
    gameClock: '07:15',
    videoTimestampStart: 30,
    videoTimestampMotion: 32,
    videoTimestampSnap: 35,
    videoTimestampEnd: 42,
    down: 2,
    distance: 4,
    yardLine: 25,
    hash: 'RIGHT',
    offensiveFormation: 'Peddie Pistol 12 Heavy',
    offensivePersonnel: '12',
    motionType: 'ORBIT',
    motionDirection: 'LEFT',
    motionPlayerJersey: 8,
    blockingScheme: 'OUTSIDE_ZONE',
    routeConcept: 'MESH',
    defensiveFront: 'St. Luke\'s 4-3',
    defensivePackage: '4-3',
    coverageScheme: 'COVER_3',
    defenseReactionToMotion: 'Safety rolls down.',
    playType: 'RUN',
    playActionFake: false,
    targetPlayerJersey: 22,
    yardsGained: 25,
    epa: 2.80,
    successRate: true,
    isFirstDown: true,
    isTouchdown: true,
    isTurnover: false,
    isPenalty: false,
    playDescription: 'Benjamin Perkins breaks outside tackle, stiff-arms the safety, and scores a 25-yard TOUCHDOWN.',
    trackingData: buildPeddieTrackingData({
      losY: 25, firstDownY: 21, motionJersey: 8, motionStartX: 70, motionEndX: 25,
      ballCarrierJersey: 22,
      playConcept: 'Peddie Perkins 25-Yard Touchdown Run'
    }),
    comments: [],
    actionItems: [],
    telestrationStrokes: [],
  }
];

// ============================================================================
// 4. Peddie vs The Hill School (Oct 11, 2025 · W 40–20 Homecoming Victory)
// ============================================================================

const PEDDIE_HILL_PLAYS: PlayAnalysis[] = [
  {
    id: 'ph-play-1',
    gameId: 'peddie-hill-2025',
    playNumber: 1,
    quarter: 1,
    gameClock: '11:20',
    videoTimestampStart: 10,
    videoTimestampMotion: 12,
    videoTimestampSnap: 15,
    videoTimestampEnd: 21,
    down: 1,
    distance: 10,
    yardLine: 35,
    hash: 'MIDDLE',
    offensiveFormation: 'Peddie Shotgun 11 Trips Left',
    offensivePersonnel: '11',
    motionType: 'JET_SWEEP',
    motionDirection: 'LEFT',
    motionPlayerJersey: 5,
    blockingScheme: 'OUTSIDE_ZONE',
    routeConcept: 'DRIVE',
    defensiveFront: 'Hill 4-3 Under',
    defensivePackage: '4-3',
    coverageScheme: 'COVER_2',
    defenseReactionToMotion: 'Linebacker over-pursues to sideline.',
    playType: 'RUN',
    playActionFake: false,
    targetPlayerJersey: 5,
    yardsGained: 22,
    epa: 1.85,
    successRate: true,
    isFirstDown: true,
    isTouchdown: false,
    isTurnover: false,
    isPenalty: false,
    playDescription: 'Lorenzo Barone takes the Jet Sweep pitch and turns on the afterburners for 22 yards down the left sideline.',
    trackingData: buildPeddieTrackingData({
      losY: 65, firstDownY: 55, motionJersey: 5, motionStartX: 85, motionEndX: 25,
      ballCarrierJersey: 5,
      playConcept: 'Peddie Barone Jet Sweep 22-Yard Run'
    }),
    comments: [],
    actionItems: [],
    telestrationStrokes: [],
  }
];

// ============================================================================
// 5. Peddie @ Lawrenceville (Oct 4, 2025 · MAPL Conference)
// ============================================================================

const PEDDIE_LAWRENCEVILLE_PLAYS: PlayAnalysis[] = [
  {
    id: 'pl-play-1',
    gameId: 'peddie-lawrenceville-2025',
    playNumber: 1,
    quarter: 2,
    gameClock: '06:40',
    videoTimestampStart: 15,
    videoTimestampMotion: 17,
    videoTimestampSnap: 20,
    videoTimestampEnd: 27,
    down: 3,
    distance: 7,
    yardLine: 42,
    hash: 'LEFT',
    offensiveFormation: 'Peddie Gun 11 Spread',
    offensivePersonnel: '11',
    motionType: 'ORBIT',
    motionDirection: 'RIGHT',
    motionPlayerJersey: 5,
    blockingScheme: 'PASS_PRO',
    routeConcept: 'SMASH',
    defensiveFront: 'Lawrenceville 3-3-5',
    defensivePackage: 'NICKEL',
    coverageScheme: 'COVER_4',
    defenseReactionToMotion: 'Safety freezes in intermediate curl window.',
    playType: 'PASS',
    playActionFake: false,
    targetPlayerJersey: 8,
    yardsGained: 16,
    epa: 1.55,
    successRate: true,
    isFirstDown: true,
    isTouchdown: false,
    isTurnover: false,
    isPenalty: false,
    playDescription: 'Griffin Brennan hits Ari Miller on the corner route for a 16-yard third-down conversion.',
    trackingData: buildPeddieTrackingData({
      losY: 58, firstDownY: 51, motionJersey: 5, motionStartX: 25, motionEndX: 75,
      targetJersey: 8, passTargetX: 80, passTargetY: 42,
      playConcept: 'Peddie Orbit Smash 3rd Down Conversion'
    }),
    comments: [],
    actionItems: [],
    telestrationStrokes: [],
  }
];

// ============================================================================
// 6. Complete 2025–2026 Peddie School Falcons Game Sessions
// ============================================================================

export const MOCK_GAMES: GameSession[] = [
  {
    id: 'peddie-blair-2025',
    title: 'Peddie Falcons @ Blair Academy (122nd Annual Rivalry Classic)',
    date: '2025-11-08',
    homeTeam: 'Blair Buccaneers',
    awayTeam: 'Peddie Falcons',
    season: '2025–2026',
    videoUrl: 'https://fan.hudl.com/peddie-blair-2025',
    videoSource: 'HUDL',
    duration: 3600,
    analysisStatus: 'COMPLETED',
    plays: PEDDIE_BLAIR_PLAYS,
    createdAt: '2025-11-08T18:00:00Z',
    updatedAt: '2025-11-08T20:30:00Z',
  },
  {
    id: 'peddie-stlukes-2025',
    title: 'Peddie Falcons @ St. Luke\'s (W 53–21 Season High Explosion)',
    date: '2025-11-01',
    homeTeam: 'St. Luke\'s Storm',
    awayTeam: 'Peddie Falcons',
    season: '2025–2026',
    videoUrl: 'https://fan.hudl.com/peddie-stlukes-2025',
    videoSource: 'HUDL',
    duration: 3600,
    analysisStatus: 'COMPLETED',
    plays: PEDDIE_STLUKES_PLAYS,
    createdAt: '2025-11-01T17:00:00Z',
    updatedAt: '2025-11-01T19:30:00Z',
  },
  {
    id: 'peddie-hill-2025',
    title: 'Peddie Falcons vs. The Hill School (W 40–20 Homecoming Victory)',
    date: '2025-10-11',
    homeTeam: 'Peddie Falcons',
    awayTeam: 'Hill School Blues',
    season: '2025–2026',
    videoUrl: 'https://fan.hudl.com/peddie-hill-2025',
    videoSource: 'HUDL',
    duration: 3600,
    analysisStatus: 'COMPLETED',
    plays: PEDDIE_HILL_PLAYS,
    createdAt: '2025-10-11T17:30:00Z',
    updatedAt: '2025-10-11T20:00:00Z',
  },
  {
    id: 'peddie-lawrenceville-2025',
    title: 'Peddie Falcons @ Lawrenceville School (MAPL Conference)',
    date: '2025-10-04',
    homeTeam: 'Lawrenceville Big Red',
    awayTeam: 'Peddie Falcons',
    season: '2025–2026',
    videoUrl: 'https://fan.hudl.com/peddie-lawrenceville-2025',
    videoSource: 'HUDL',
    duration: 3600,
    analysisStatus: 'COMPLETED',
    plays: PEDDIE_LAWRENCEVILLE_PLAYS,
    createdAt: '2025-10-04T18:00:00Z',
    updatedAt: '2025-10-04T20:30:00Z',
  }
];

export const MOCK_BOX_SCORE: TeamBoxScore = {
  totalYards: 342,
  passingYards: 245,
  rushingYards: 97,
  totalPlays: 68,
  firstDowns: 18,
  thirdDownConversions: 6,
  thirdDownAttempts: 12,
  fourthDownConversions: 1,
  fourthDownAttempts: 2,
  redZoneScores: 3,
  redZoneAttempts: 3,
  turnovers: 2,
  penalties: 6,
  penaltyYards: 45,
  timeOfPossession: '21:20',
  avgEpa: 1.45,
  successRate: 0.58,
};

export const MOCK_DRIVES: DriveInfo[] = [
  {
    id: 'drv-1',
    startQuarter: 1,
    startYardLine: 25,
    endYardLine: 0,
    plays: 7,
    yards: 75,
    result: 'TOUCHDOWN',
    timeOfPossession: '3:20',
  },
  {
    id: 'drv-2',
    startQuarter: 1,
    startYardLine: 30,
    endYardLine: 0,
    plays: 6,
    yards: 70,
    result: 'TOUCHDOWN',
    timeOfPossession: '2:45',
  }
];

export const MOCK_FIELD_HEATMAP: FieldHeatmapPoint[] = [
  { x: 25, y: 35, intensity: 0.85, playType: 'RUN', yardsGained: 12, gap: 'OUTSIDE_LEFT' },
  { x: 50, y: 20, intensity: 0.95, playType: 'PASS', yardsGained: 24 },
  { x: 75, y: 15, intensity: 0.78, playType: 'PASS', yardsGained: 18 },
  { x: 50, y: 5, intensity: 0.90, playType: 'PASS', yardsGained: 28 },
  { x: 30, y: 45, intensity: 0.65, playType: 'RUN', yardsGained: 22, gap: 'OUTSIDE_LEFT' },
  { x: 80, y: 30, intensity: 0.72, playType: 'PASS', yardsGained: 35 },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    type: 'MENTION',
    message: 'Coach Fabish tagged you: Check motion timing on Play #1 vs Blair 1/3 safety roll.',
    createdAt: '2025-11-08T16:00:00Z',
    isRead: false,
    gameId: 'peddie-blair-2025',
    playId: 'pb-play-1',
    fromUser: TEAM_ROSTER[0],
    toUser: TEAM_ROSTER[4],
  },
  {
    id: 'notif-2',
    type: 'ACTION_ASSIGNED',
    message: 'New Coaching Task: Maintain 4.45 speed cadence on Jet Motion assigned to you.',
    createdAt: '2025-11-08T16:05:00Z',
    isRead: false,
    gameId: 'peddie-blair-2025',
    playId: 'pb-play-1',
    fromUser: TEAM_ROSTER[0],
    toUser: TEAM_ROSTER[4],
  }
];

export const MOCK_PLAYS: PlayAnalysis[] = MOCK_GAMES.flatMap(g => g.plays);
export const MOCK_HEATMAP_POINTS = MOCK_FIELD_HEATMAP;
