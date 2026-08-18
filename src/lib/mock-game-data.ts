// ============================================================================
// GridironIQ — 2025 Peddie School Falcons Football (Hudl Edition)
// Comprehensive Roster, Game Sessions, 22-Player Tracking (O's vs X's) & HUD Telemetry
// ============================================================================

import {
  GameSession, PlayAnalysis, UserMention, CoachingActionItem,
  PlayComment, TeamBoxScore, DriveInfo, PlayTrackingData, TrackedPlayer,
  Notification, FieldHeatmapPoint
} from '@/types/football';

// ============================================================================
// 1. Peddie School Falcons Varsity Coaching Staff & Roster (2024–2025 Season)
// ============================================================================

export const TEAM_ROSTER: UserMention[] = [
  // Coaching Staff
  { id: 'coach-fabish', name: 'Mark Fabish', role: 'COACH', position: 'Head Coach' },
  { id: 'coach-oc', name: 'Dan O\'Neill', role: 'COORDINATOR', position: 'Offensive Coordinator / QBs' },
  { id: 'coach-dc', name: 'Marcus Vance', role: 'COORDINATOR', position: 'Defensive Coordinator / LBs' },
  { id: 'coach-ol', name: 'Frank Reynolds', role: 'COACH', position: 'Offensive Line Coach' },
  
  // Varsity Players
  { id: 'player-2', name: 'Nacari McFarland', role: 'PLAYER', jerseyNumber: 2, position: 'QB' },
  { id: 'player-3', name: 'Kyian Mims', role: 'PLAYER', jerseyNumber: 3, position: 'CB / WR' },
  { id: 'player-4', name: 'Yasin Elhossieni', role: 'PLAYER', jerseyNumber: 4, position: 'SS' },
  { id: 'player-5', name: 'Lorenzo Barone', role: 'PLAYER', jerseyNumber: 5, position: 'WR' },
  { id: 'player-6', name: 'Joseph Gaston', role: 'PLAYER', jerseyNumber: 6, position: 'QB / WR / CB' },
  { id: 'player-8', name: 'Ari Miller', role: 'PLAYER', jerseyNumber: 8, position: 'WR / S' },
  { id: 'player-9', name: 'Griffin Brennan', role: 'PLAYER', jerseyNumber: 9, position: 'QB / OLB' },
  { id: 'player-10', name: 'Jace Ingenito', role: 'PLAYER', jerseyNumber: 10, position: 'WR' },
  { id: 'player-11', name: 'Eric Cho', role: 'PLAYER', jerseyNumber: 11, position: 'SS / FS' },
  { id: 'player-15', name: 'Jonathan Stizza', role: 'PLAYER', jerseyNumber: 15, position: 'FS / WR' },
  { id: 'player-16', name: 'Griffin Suthammanont', role: 'PLAYER', jerseyNumber: 16, position: 'WR' },
  { id: 'player-20', name: 'Jonathan Navarrete', role: 'PLAYER', jerseyNumber: 20, position: 'RB' },
  { id: 'player-26', name: 'Ethan Dechant', role: 'PLAYER', jerseyNumber: 26, position: 'WR' },
  { id: 'player-55', name: 'Jayden Williams', role: 'PLAYER', jerseyNumber: 55, position: 'DE' },
  { id: 'player-63', name: 'Matthew Jung', role: 'PLAYER', jerseyNumber: 63, position: 'C / DT' },
  { id: 'player-66', name: 'Adekunle Olaniyi', role: 'PLAYER', jerseyNumber: 66, position: 'DT' },
  { id: 'player-70', name: 'Mason Kish', role: 'PLAYER', jerseyNumber: 70, position: 'DT' },
  { id: 'player-77', name: 'Russell Cunningham', role: 'PLAYER', jerseyNumber: 77, position: 'G' },
];

export const CURRENT_USER: UserMention = TEAM_ROSTER[0]; // Coach Mark Fabish

export function findUser(id: string): UserMention {
  return TEAM_ROSTER.find(u => u.id === id) ?? TEAM_ROSTER[0];
}

// Helper to generate full 22-player tracking coordinates (11 O's and 11 X's)
function buildPeddieTrackingData(params: {
  losY: number;
  firstDownY: number;
  motionJersey?: number;
  motionStartX?: number;
  motionEndX?: number;
  targetJersey?: number;
  passTargetX?: number;
  passTargetY?: number;
  playConcept: string;
}): PlayTrackingData {
  const { losY, firstDownY, motionJersey, motionStartX, motionEndX, targetJersey, passTargetX, passTargetY, playConcept } = params;

  // 11 Offense Players (O's - Peddie School Falcons)
  const offense: TrackedPlayer[] = [
    {
      id: 'o-63', side: 'OFFENSE', jerseyNumber: 63, name: 'M. Jung', position: 'C',
      trajectory: { preSnap: { x: 50, y: losY }, snap: { x: 50, y: losY + 1 }, postSnap: { x: 50, y: losY + 2 } },
      vectorLabel: 'Anchor Pass Pro'
    },
    {
      id: 'o-77', side: 'OFFENSE', jerseyNumber: 77, name: 'R. Cunningham', position: 'LG',
      trajectory: { preSnap: { x: 45, y: losY }, snap: { x: 45, y: losY + 1 }, postSnap: { x: 46, y: losY + 2 } },
      vectorLabel: 'Inside Zone Seal'
    },
    {
      id: 'o-71', side: 'OFFENSE', jerseyNumber: 71, name: 'O-Line', position: 'RG',
      trajectory: { preSnap: { x: 55, y: losY }, snap: { x: 55, y: losY + 1 }, postSnap: { x: 54, y: losY + 2 } },
      vectorLabel: 'Combo Block'
    },
    {
      id: 'o-74', side: 'OFFENSE', jerseyNumber: 74, name: 'O-Line', position: 'LT',
      trajectory: { preSnap: { x: 40, y: losY }, snap: { x: 39, y: losY + 1 }, postSnap: { x: 38, y: losY + 3 } },
      vectorLabel: 'Blindside Pass Set'
    },
    {
      id: 'o-78', side: 'OFFENSE', jerseyNumber: 78, name: 'O-Line', position: 'RT',
      trajectory: { preSnap: { x: 60, y: losY }, snap: { x: 61, y: losY + 1 }, postSnap: { x: 62, y: losY + 3 } },
      vectorLabel: 'Edge Kickout'
    },
    {
      id: 'o-2', side: 'OFFENSE', jerseyNumber: 2, name: 'N. McFarland', position: 'QB',
      isTargetOrBallCarrier: true,
      trajectory: { preSnap: { x: 50, y: losY + 5 }, snap: { x: 50, y: losY + 7 }, postSnap: { x: 52, y: losY + 8 } },
      vectorLabel: 'Shotgun Read & Fire'
    },
    {
      id: 'o-20', side: 'OFFENSE', jerseyNumber: 20, name: 'J. Navarrete', position: 'RB',
      isTargetOrBallCarrier: targetJersey === 20,
      trajectory: {
        preSnap: { x: 44, y: losY + 5.5 },
        snap: { x: 48, y: losY + 3 },
        postSnap: { x: targetJersey === 20 ? (passTargetX ?? 58) : 52, y: targetJersey === 20 ? (passTargetY ?? losY - 6) : losY - 2 }
      },
      vectorLabel: targetJersey === 20 ? 'Off-Tackle Stretch' : 'Pass Protection Check'
    },
    {
      id: 'o-5', side: 'OFFENSE', jerseyNumber: 5, name: 'L. Barone', position: 'WR',
      isMotionPlayer: motionJersey === 5,
      isTargetOrBallCarrier: targetJersey === 5,
      trajectory: {
        preSnap: { x: motionStartX ?? 85, y: losY + 1 },
        motion: motionJersey === 5 ? { x: motionEndX ?? 48, y: losY + 3 } : undefined,
        snap: { x: motionJersey === 5 ? (motionEndX ?? 46) : 85, y: losY + 1 },
        postSnap: { x: passTargetX ?? 75, y: passTargetY ?? losY - 14 }
      },
      vectorLabel: motionJersey === 5 ? 'Jet Sweep Motion 21.8 mph' : 'Deep 15-yd Out'
    },
    {
      id: 'o-10', side: 'OFFENSE', jerseyNumber: 10, name: 'J. Ingenito', position: 'WR',
      isTargetOrBallCarrier: targetJersey === 10,
      trajectory: {
        preSnap: { x: 15, y: losY + 1 },
        snap: { x: 15, y: losY },
        postSnap: { x: passTargetX ?? 25, y: passTargetY ?? losY - 12 }
      },
      vectorLabel: 'Post-Corner Break'
    },
    {
      id: 'o-3', side: 'OFFENSE', jerseyNumber: 3, name: 'K. Mims', position: 'SLOT',
      isTargetOrBallCarrier: targetJersey === 3,
      trajectory: {
        preSnap: { x: 28, y: losY + 2.5 },
        snap: { x: 29, y: losY + 1 },
        postSnap: { x: passTargetX ?? 42, y: passTargetY ?? losY - 8 }
      },
      vectorLabel: 'Mesh Cross Underneath'
    },
    {
      id: 'o-8', side: 'OFFENSE', jerseyNumber: 8, name: 'A. Miller', position: 'TE',
      isTargetOrBallCarrier: targetJersey === 8,
      trajectory: {
        preSnap: { x: 65, y: losY + 1 },
        snap: { x: 65, y: losY },
        postSnap: { x: passTargetX ?? 60, y: passTargetY ?? losY - 10 }
      },
      vectorLabel: 'Y-Cross Seam Threat'
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
// 2. Peddie vs Blair Academy (122nd Annual Rivalry - Hudl Film)
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
    targetPlayerJersey: 3,
    yardsGained: 14,
    epa: 1.42,
    successRate: true,
    isFirstDown: true,
    isTouchdown: false,
    isTurnover: false,
    isPenalty: false,
    playDescription: 'Nacari McFarland fakes jet sweep to Lorenzo Barone, reads single-high safety roll, and hits Kyian Mims on the mesh crosser for 14 yards to midfield.',
    trackingData: buildPeddieTrackingData({
      losY: 65, firstDownY: 55, motionJersey: 5, motionStartX: 85, motionEndX: 45,
      targetJersey: 3, passTargetX: 42, passTargetY: 51,
      playConcept: 'Peddie Jet Fake Mesh Crosser vs Blair Cover 3'
    }),
    comments: [
      {
        id: 'c-1',
        playId: 'pb-play-1',
        timestamp: 16,
        author: TEAM_ROSTER[0],
        text: 'Excellent jet motion timing by @#5_Barone. Forced Blair safety into boundary box, opening the soft middle for @#3_Mims.',
        mentions: [TEAM_ROSTER[7], TEAM_ROSTER[5]],
        createdAt: '2025-10-18T14:32:00Z',
      }
    ],
    actionItems: [
      {
        id: 'act-1',
        playId: 'pb-play-1',
        gameId: 'peddie-blair-2025',
        title: 'Maintain 4.4 speed cadence on Jet Motion',
        description: 'Keep motion depth at precisely 4 yards behind the mesh point to preserve play-action sightlines.',
        assignedTo: TEAM_ROSTER[7],
        assignedBy: TEAM_ROSTER[0],
        priority: 'MEDIUM',
        status: 'RESOLVED',
        videoTimestamp: 15,
        createdAt: '2025-10-18T14:35:00Z',
        updatedAt: '2025-10-18T16:00:00Z',
      }
    ],
    telestrationStrokes: [],
  },
  {
    id: 'pb-play-2',
    gameId: 'peddie-blair-2025',
    playNumber: 2,
    quarter: 1,
    gameClock: '14:15',
    videoTimestampStart: 34,
    videoTimestampMotion: 36,
    videoTimestampSnap: 39,
    videoTimestampEnd: 46,
    down: 1,
    distance: 10,
    yardLine: 49,
    hash: 'LEFT',
    offensiveFormation: 'Peddie Pistol 21 Heavy Right',
    offensivePersonnel: '21',
    motionType: 'TRADE_TE',
    motionDirection: 'RIGHT',
    motionPlayerJersey: 8,
    blockingScheme: 'OUTSIDE_ZONE',
    runGap: 'OFF_TACKLE_RIGHT',
    defensiveFront: 'Blair 4-3 Under Stack',
    defensivePackage: '4-3',
    coverageScheme: 'COVER_1',
    defenseReactionToMotion: 'Sam LB shifts outside C-gap; Free Safety rotates down into strong alley.',
    playType: 'RUN',
    playActionFake: false,
    targetPlayerJersey: 20,
    yardsGained: 18,
    epa: 1.88,
    successRate: true,
    isFirstDown: true,
    isTouchdown: false,
    isTurnover: false,
    isPenalty: false,
    playDescription: 'Ari Miller trades across the formation. Jonathan Navarrete takes outside zone handoff, cuts behind Russell Cunningham seal block for 18 yards into red zone.',
    trackingData: buildPeddieTrackingData({
      losY: 51, firstDownY: 41, motionJersey: 8, motionStartX: 35, motionEndX: 65,
      targetJersey: 20, passTargetX: 68, passTargetY: 33,
      playConcept: 'Peddie TE Trade Outside Zone Stretch'
    }),
    comments: [
      {
        id: 'c-2',
        playId: 'pb-play-2',
        timestamp: 41,
        author: TEAM_ROSTER[1],
        text: 'Textbook downfield reach block by @#77_Cunningham. @#20_Navarrete had a wide runway to accelerate.',
        mentions: [TEAM_ROSTER[17], TEAM_ROSTER[11]],
        createdAt: '2025-10-18T14:40:00Z',
      }
    ],
    actionItems: [
      {
        id: 'act-2',
        playId: 'pb-play-2',
        gameId: 'peddie-blair-2025',
        title: 'Film Review: Outside Zone Vision and Cutback Angles',
        description: 'Review second-level linebacker angles when TE trades to strong side.',
        assignedTo: TEAM_ROSTER[11],
        assignedBy: TEAM_ROSTER[1],
        priority: 'HIGH',
        status: 'IN_REVIEW',
        videoTimestamp: 40,
        createdAt: '2025-10-18T14:42:00Z',
        updatedAt: '2025-10-18T15:30:00Z',
      }
    ],
    telestrationStrokes: [],
  },
  {
    id: 'pb-play-3',
    gameId: 'peddie-blair-2025',
    playNumber: 3,
    quarter: 1,
    gameClock: '13:28',
    videoTimestampStart: 58,
    videoTimestampMotion: 60,
    videoTimestampSnap: 63,
    videoTimestampEnd: 71,
    down: 1,
    distance: 10,
    yardLine: 31,
    hash: 'RIGHT',
    offensiveFormation: 'Peddie Shotgun 11 Bunch Left',
    offensivePersonnel: '11',
    motionType: 'ORBIT',
    motionDirection: 'LEFT',
    motionPlayerJersey: 5,
    blockingScheme: 'PASS_PRO',
    routeConcept: 'VERTICALS',
    defensiveFront: 'Blair Nickel 4-2-5',
    defensivePackage: 'NICKEL',
    coverageScheme: 'COVER_2',
    defenseReactionToMotion: 'Nickel CB steps into flat; Safety widens boundary split.',
    playType: 'PASS',
    playActionFake: true,
    targetPlayerJersey: 10,
    yardsGained: 31,
    epa: 3.84,
    successRate: true,
    isFirstDown: true,
    isTouchdown: true,
    isTurnover: false,
    isPenalty: false,
    playDescription: 'TOUCHDOWN PEDDIE! Orbit motion by Lorenzo Barone holds the nickel defender; Nacari McFarland delivers a 31-yard teardrop in stride to Jace Ingenito in the corner of the end zone.',
    trackingData: buildPeddieTrackingData({
      losY: 31, firstDownY: 21, motionJersey: 5, motionStartX: 75, motionEndX: 30,
      targetJersey: 10, passTargetX: 18, passTargetY: 2,
      playConcept: 'Peddie Orbit Four-Verts Hole Shot Touchdown'
    }),
    comments: [
      {
        id: 'c-3',
        playId: 'pb-play-3',
        timestamp: 65,
        author: TEAM_ROSTER[0],
        text: 'Elite ball placement from @#2_McFarland. Dropped right over the Cover 2 corner into the honey hole for @#10_Ingenito.',
        mentions: [TEAM_ROSTER[4], TEAM_ROSTER[8]],
        createdAt: '2025-10-18T14:48:00Z',
      }
    ],
    actionItems: [
      {
        id: 'act-3',
        playId: 'pb-play-3',
        gameId: 'peddie-blair-2025',
        title: 'Archive for Red Zone Clinic Reel',
        description: 'Tag play as benchmark Cover 2 hole shot against Nickel defense.',
        assignedTo: TEAM_ROSTER[4],
        assignedBy: TEAM_ROSTER[0],
        priority: 'LOW',
        status: 'RESOLVED',
        videoTimestamp: 64,
        createdAt: '2025-10-18T14:50:00Z',
        updatedAt: '2025-10-18T17:00:00Z',
      }
    ],
    telestrationStrokes: [],
  },
  {
    id: 'pb-play-4',
    gameId: 'peddie-blair-2025',
    playNumber: 4,
    quarter: 1,
    gameClock: '09:40',
    videoTimestampStart: 90,
    videoTimestampSnap: 94,
    videoTimestampEnd: 101,
    down: 3,
    distance: 4,
    yardLine: 42,
    hash: 'LEFT',
    offensiveFormation: 'Peddie Shotgun 11 Empty Trips Right',
    offensivePersonnel: '11',
    motionType: 'NONE',
    blockingScheme: 'PASS_PRO',
    routeConcept: 'SLANT_FLAT',
    defensiveFront: 'Blair Dime 3-2-6 Blitz',
    defensivePackage: 'DIME',
    coverageScheme: 'COVER_0',
    defenseReactionToMotion: 'Pre-snap static; boundary LB and SS show double A-gap blitz.',
    playType: 'PASS',
    playActionFake: false,
    targetPlayerJersey: 6,
    yardsGained: 9,
    epa: 1.15,
    successRate: true,
    isFirstDown: true,
    isTouchdown: false,
    isTurnover: false,
    isPenalty: false,
    playDescription: 'Blair brings Cover 0 blitz. Nacari McFarland diagnoses hot route immediately, delivering a quick slant to Joseph Gaston for a 9-yard 3rd down conversion.',
    trackingData: buildPeddieTrackingData({
      losY: 58, firstDownY: 54, targetJersey: 6, passTargetX: 38, passTargetY: 49,
      playConcept: 'Peddie Hot Slant vs Blair Cover 0 All-Out Blitz'
    }),
    comments: [
      {
        id: 'c-4',
        playId: 'pb-play-4',
        timestamp: 95,
        author: TEAM_ROSTER[1],
        text: 'Great pre-snap blitz recognition. @#6_Gaston snapped off his slant right at the second step.',
        mentions: [TEAM_ROSTER[6]],
        createdAt: '2025-10-18T15:02:00Z',
      }
    ],
    actionItems: [],
    telestrationStrokes: [],
  },
  {
    id: 'pb-play-5',
    gameId: 'peddie-blair-2025',
    playNumber: 5,
    quarter: 2,
    gameClock: '11:15',
    videoTimestampStart: 120,
    videoTimestampSnap: 124,
    videoTimestampEnd: 130,
    down: 2,
    distance: 8,
    yardLine: 34,
    hash: 'MIDDLE',
    offensiveFormation: 'Opponent Pro Set 21',
    offensivePersonnel: '21',
    motionType: 'NONE',
    defensiveFront: 'Peddie 4-3 Over',
    defensivePackage: '4-3',
    coverageScheme: 'COVER_3',
    playType: 'RUN',
    playActionFake: false,
    yardsGained: -3,
    epa: 1.65,
    successRate: false,
    isFirstDown: false,
    isTouchdown: false,
    isTurnover: false,
    isPenalty: false,
    playDescription: 'Peddie Defensive Stand: Jayden Williams bursts off edge, shedding the tight end block to drop Blair running back for a 3-yard tackle for loss.',
    trackingData: buildPeddieTrackingData({
      losY: 34, firstDownY: 26, targetJersey: 20, passTargetX: 42, passTargetY: 37,
      playConcept: 'Peddie DE Jayden Williams TFL vs Opponent ISO'
    }),
    comments: [
      {
        id: 'c-5',
        playId: 'pb-play-5',
        timestamp: 126,
        author: TEAM_ROSTER[2],
        text: 'Dominant first step by @#55_Williams. Blew up the B-gap and forced the back into @#66_Olaniyi.',
        mentions: [TEAM_ROSTER[14], TEAM_ROSTER[15]],
        createdAt: '2025-10-18T15:20:00Z',
      }
    ],
    actionItems: [
      {
        id: 'act-4',
        playId: 'pb-play-5',
        gameId: 'peddie-blair-2025',
        title: 'Film Highlight: Defensive Edge Setting Technique',
        description: 'Share edge hand-placement clip with defensive line unit.',
        assignedTo: TEAM_ROSTER[14],
        assignedBy: TEAM_ROSTER[2],
        priority: 'LOW',
        status: 'RESOLVED',
        videoTimestamp: 125,
        createdAt: '2025-10-18T15:22:00Z',
        updatedAt: '2025-10-18T17:30:00Z',
      }
    ],
    telestrationStrokes: [],
  },
  {
    id: 'pb-play-6',
    gameId: 'peddie-blair-2025',
    playNumber: 6,
    quarter: 2,
    gameClock: '04:20',
    videoTimestampStart: 155,
    videoTimestampMotion: 157,
    videoTimestampSnap: 160,
    videoTimestampEnd: 168,
    down: 2,
    distance: 3,
    yardLine: 24,
    hash: 'RIGHT',
    offensiveFormation: 'Peddie Shotgun 12 Pistol',
    offensivePersonnel: '12',
    motionType: 'FLY',
    motionDirection: 'LEFT',
    motionPlayerJersey: 3,
    blockingScheme: 'GAP_POWER',
    runGap: 'B_LEFT',
    defensiveFront: 'Blair 4-3 Eagle',
    defensivePackage: '4-3',
    coverageScheme: 'COVER_1',
    defenseReactionToMotion: 'Free safety cheats toward motion; Mike LB fills A-gap early.',
    playType: 'PLAY_ACTION_BOOT',
    playActionFake: true,
    targetPlayerJersey: 8,
    yardsGained: 24,
    epa: 3.20,
    successRate: true,
    isFirstDown: true,
    isTouchdown: true,
    isTurnover: false,
    isPenalty: false,
    playDescription: 'TOUCHDOWN PEDDIE! Play-action bootleg left after Kyian Mims fly motion. Nacari McFarland rolls out and finds Ari Miller dragging across the back of the end zone.',
    trackingData: buildPeddieTrackingData({
      losY: 24, firstDownY: 21, motionJersey: 3, motionStartX: 80, motionEndX: 35,
      targetJersey: 8, passTargetX: 25, passTargetY: 2,
      playConcept: 'Peddie PA Bootleg Fly Motion Drag Touchdown'
    }),
    comments: [
      {
        id: 'c-6',
        playId: 'pb-play-6',
        timestamp: 162,
        author: TEAM_ROSTER[0],
        text: 'Executed to perfection. The fly motion pulled the safety away, leaving @#8_Miller wide open on the drag.',
        mentions: [TEAM_ROSTER[7], TEAM_ROSTER[4]],
        createdAt: '2025-10-18T15:45:00Z',
      }
    ],
    actionItems: [],
    telestrationStrokes: [],
  }
];

// ============================================================================
// 3. Peddie vs The Hun School (MAPL Championship Battle — Hudl Film)
// ============================================================================

const PEDDIE_HUN_PLAYS: PlayAnalysis[] = [
  {
    id: 'ph-play-1',
    gameId: 'peddie-hun-2025',
    playNumber: 1,
    quarter: 1,
    gameClock: '14:40',
    videoTimestampStart: 15,
    videoTimestampMotion: 18,
    videoTimestampSnap: 21,
    videoTimestampEnd: 28,
    down: 1,
    distance: 10,
    yardLine: 30,
    hash: 'LEFT',
    offensiveFormation: 'Peddie Shotgun 11 Trips Right',
    offensivePersonnel: '11',
    motionType: 'JET_SWEEP',
    motionDirection: 'RIGHT',
    motionPlayerJersey: 5,
    blockingScheme: 'INSIDE_ZONE',
    routeConcept: 'FLOOD',
    defensiveFront: 'Hun 3-4 Okie Front',
    defensivePackage: '3-4',
    coverageScheme: 'COVER_4',
    defenseReactionToMotion: 'Hun field safety drops to 16 yds; boundary corner stays in soft bail.',
    playType: 'PASS',
    playActionFake: true,
    targetPlayerJersey: 5,
    yardsGained: 22,
    epa: 2.10,
    successRate: true,
    isFirstDown: true,
    isTouchdown: false,
    isTurnover: false,
    isPenalty: false,
    playDescription: 'Peddie executes jet wheel combination. Lorenzo Barone catches pass along boundary sideline for 22 yards into Hun territory.',
    trackingData: buildPeddieTrackingData({
      losY: 70, firstDownY: 60, motionJersey: 5, motionStartX: 20, motionEndX: 60,
      targetJersey: 5, passTargetX: 82, passTargetY: 48,
      playConcept: 'Peddie Jet Wheel vs Hun Cover 4 Soft Quarters'
    }),
    comments: [
      {
        id: 'c-h1',
        playId: 'ph-play-1',
        timestamp: 23,
        author: TEAM_ROSTER[1],
        text: 'Great route stem by @#5_Barone. Outran the linebacker angle with clean acceleration.',
        mentions: [TEAM_ROSTER[7]],
        createdAt: '2025-11-01T13:10:00Z',
      }
    ],
    actionItems: [],
    telestrationStrokes: [],
  },
  {
    id: 'ph-play-2',
    gameId: 'peddie-hun-2025',
    playNumber: 2,
    quarter: 2,
    gameClock: '08:50',
    videoTimestampStart: 50,
    videoTimestampSnap: 54,
    videoTimestampEnd: 62,
    down: 3,
    distance: 2,
    yardLine: 48,
    hash: 'MIDDLE',
    offensiveFormation: 'Peddie Pistol 22 Heavy Jumbo',
    offensivePersonnel: '22',
    motionType: 'NONE',
    blockingScheme: 'GAP_POWER',
    runGap: 'A_RIGHT',
    defensiveFront: 'Hun 5-2 Goal Line Box',
    defensivePackage: 'GOAL_LINE',
    coverageScheme: 'MAN_PRESS',
    playType: 'RUN',
    playActionFake: false,
    targetPlayerJersey: 20,
    yardsGained: 12,
    epa: 1.45,
    successRate: true,
    isFirstDown: true,
    isTouchdown: false,
    isTurnover: false,
    isPenalty: false,
    playDescription: 'Power run between the tackles: Matthew Jung and Russell Cunningham blow open the A-gap; Jonathan Navarrete breaks two arm tackles for 12 yards.',
    trackingData: buildPeddieTrackingData({
      losY: 52, firstDownY: 50, targetJersey: 20, passTargetX: 52, passTargetY: 40,
      playConcept: 'Peddie Jumbo A-Gap Power Conversion'
    }),
    comments: [
      {
        id: 'c-h2',
        playId: 'ph-play-2',
        timestamp: 56,
        author: TEAM_ROSTER[3],
        text: 'Dominant pad level from @#63_Jung and @#77_Cunningham. Created a 3-yard push off the line.',
        mentions: [TEAM_ROSTER[15], TEAM_ROSTER[17]],
        createdAt: '2025-11-01T13:45:00Z',
      }
    ],
    actionItems: [],
    telestrationStrokes: [],
  }
];

// ============================================================================
// 4. Master Game Sessions Collection
// ============================================================================

export const MOCK_GAMES: GameSession[] = [
  {
    id: 'peddie-blair-2025',
    title: 'Peddie Falcons vs. Blair Academy (122nd Annual Classic Rivalry)',
    homeTeam: 'Peddie Falcons',
    awayTeam: 'Blair Buccaneers',
    date: '2025-10-18',
    season: '2025 Fall Varsity',
    videoUrl: 'https://fan.hudl.com/peddie-blair-2025-reel',
    videoSource: 'HUDL',
    thumbnailUrl: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=600&auto=format&fit=crop&q=80',
    duration: 3600,
    analysisStatus: 'COMPLETED',
    plays: PEDDIE_BLAIR_PLAYS,
    createdAt: '2025-10-18T18:00:00Z',
    updatedAt: '2025-10-18T20:30:00Z',
  },
  {
    id: 'peddie-hun-2025',
    title: 'Peddie Falcons vs. The Hun School (MAPL Championship Battle)',
    homeTeam: 'The Hun School',
    awayTeam: 'Peddie Falcons',
    date: '2025-11-01',
    season: '2025 Fall Varsity',
    videoUrl: 'https://fan.hudl.com/peddie-hun-2025-film',
    videoSource: 'HUDL',
    thumbnailUrl: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=600&auto=format&fit=crop&q=80',
    duration: 3450,
    analysisStatus: 'COMPLETED',
    plays: PEDDIE_HUN_PLAYS,
    createdAt: '2025-11-01T17:00:00Z',
    updatedAt: '2025-11-01T19:45:00Z',
  },
  {
    id: 'peddie-lawrenceville-2025',
    title: 'Peddie Falcons vs. Lawrenceville School',
    homeTeam: 'Peddie Falcons',
    awayTeam: 'Lawrenceville Big Red',
    date: '2025-09-27',
    season: '2025 Fall Varsity',
    videoUrl: 'https://fan.hudl.com/peddie-lawrenceville-2025',
    videoSource: 'HUDL',
    thumbnailUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop&q=80',
    duration: 3200,
    analysisStatus: 'COMPLETED',
    plays: PEDDIE_BLAIR_PLAYS.slice(0, 4),
    createdAt: '2025-09-27T16:00:00Z',
    updatedAt: '2025-09-27T18:30:00Z',
  },
  {
    id: 'peddie-hill-2025',
    title: 'Peddie Falcons vs. The Hill School',
    homeTeam: 'The Hill School',
    awayTeam: 'Peddie Falcons',
    date: '2025-10-04',
    season: '2025 Fall Varsity',
    videoUrl: 'https://fan.hudl.com/peddie-hill-2025',
    videoSource: 'HUDL',
    thumbnailUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=600&auto=format&fit=crop&q=80',
    duration: 3300,
    analysisStatus: 'COMPLETED',
    plays: PEDDIE_BLAIR_PLAYS.slice(1, 5),
    createdAt: '2025-10-04T16:30:00Z',
    updatedAt: '2025-10-04T19:00:00Z',
  }
];

// ============================================================================
// 5. Box Score & Situational Metrics
// ============================================================================

export const MOCK_BOX_SCORE: TeamBoxScore = {
  totalYards: 418,
  passingYards: 264,
  rushingYards: 154,
  totalPlays: 54,
  firstDowns: 22,
  thirdDownConversions: 7,
  thirdDownAttempts: 11,
  fourthDownConversions: 2,
  fourthDownAttempts: 2,
  redZoneScores: 4,
  redZoneAttempts: 4,
  turnovers: 0,
  penalties: 3,
  penaltyYards: 25,
  timeOfPossession: '32:45',
  avgEpa: 0.38,
  successRate: 58.4,
};

export const MOCK_DRIVES: DriveInfo[] = [
  { id: 'd-1', startQuarter: 1, startYardLine: 35, endYardLine: 100, plays: 3, yards: 65, result: 'TOUCHDOWN', timeOfPossession: '1:24' },
  { id: 'd-2', startQuarter: 1, startYardLine: 20, endYardLine: 48, plays: 6, yards: 28, result: 'PUNT', timeOfPossession: '3:10' },
  { id: 'd-3', startQuarter: 2, startYardLine: 24, endYardLine: 100, plays: 5, yards: 76, result: 'TOUCHDOWN', timeOfPossession: '2:15' },
  { id: 'd-4', startQuarter: 2, startYardLine: 30, endYardLine: 88, plays: 8, yards: 58, result: 'FIELD_GOAL', timeOfPossession: '4:05' },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n-1',
    type: 'MENTION',
    message: 'Coach Mark Fabish mentioned you in Play #1: "Excellent jet motion timing by @#5_Barone..."',
    gameId: 'peddie-blair-2025',
    playId: 'pb-play-1',
    videoTimestamp: 16,
    isRead: false,
    createdAt: '2025-10-18T14:32:00Z',
    fromUser: TEAM_ROSTER[0],
    toUser: TEAM_ROSTER[7],
  },
  {
    id: 'n-2',
    type: 'ACTION_ASSIGNED',
    message: 'New Action Assigned: "Film Review: Outside Zone Vision and Cutback Angles" by Coach Dan O\'Neill',
    gameId: 'peddie-blair-2025',
    playId: 'pb-play-2',
    videoTimestamp: 40,
    isRead: false,
    createdAt: '2025-10-18T14:42:00Z',
    fromUser: TEAM_ROSTER[1],
    toUser: TEAM_ROSTER[11],
  },
];

export const MOCK_FIELD_HEATMAP: FieldHeatmapPoint[] = [
  { x: 50, y: 35, intensity: 0.9, playType: 'PASS', yardsGained: 14 },
  { x: 68, y: 49, intensity: 0.85, playType: 'RUN', yardsGained: 18, gap: 'OFF_TACKLE_RIGHT' },
  { x: 18, y: 31, intensity: 1.0, playType: 'PASS', yardsGained: 31 },
  { x: 38, y: 42, intensity: 0.75, playType: 'PASS', yardsGained: 9 },
  { x: 25, y: 24, intensity: 0.95, playType: 'PLAY_ACTION_BOOT', yardsGained: 24 },
  { x: 82, y: 30, intensity: 0.88, playType: 'PASS', yardsGained: 22 },
  { x: 52, y: 48, intensity: 0.82, playType: 'RUN', yardsGained: 12, gap: 'A_RIGHT' },
];

export const MOCK_PLAYS: PlayAnalysis[] = MOCK_GAMES.flatMap(g => g.plays);
export const MOCK_HEATMAP_POINTS = MOCK_FIELD_HEATMAP;

